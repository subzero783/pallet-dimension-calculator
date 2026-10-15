import { ICutListItem, ICalculationResult } from "@/models/WorkOrder";

export interface PalletInputParams {
  productLength: number; // inches
  productWidth: number; // inches
  productHeight: number; // inches
  productWeight: number; // lbs
  palletStyle?: "2-Way Stringer (Flush)" | "2-Way Stringer (Overhang)" | "4-Way Notched Stringer" | "Heavy-Duty Skid";
  lengthAllowance?: number; // default 2.0"
  widthAllowance?: number; // default 2.0"
  deckboardNominal?: "1x4" | "1x6";
  stringerNominal?: "2x4" | "4x4";
  targetMaxGap?: number; // default 3.0" (0 means omitted)
  boardGap?: number; // default 3.0" (0 means omitted)
  middleBoardCount?: 1 | 2; // default 1
  overhangDistance?: number; // default 1.5" if overhang style
}

export interface LumberSpec {
  nominal: string;
  nominalThickness: number;
  nominalWidth: number;
  actualThickness: number;
  actualWidth: number;
}

export const LUMBER_SPECS: Record<string, LumberSpec> = {
  "1x4": {
    nominal: "1x4",
    nominalThickness: 1.0,
    nominalWidth: 4.0,
    actualThickness: 0.75,
    actualWidth: 3.5,
  },
  "1x6": {
    nominal: "1x6",
    nominalThickness: 1.0,
    nominalWidth: 6.0,
    actualThickness: 0.75,
    actualWidth: 5.5,
  },
  "2x4": {
    nominal: "2x4",
    nominalThickness: 2.0,
    nominalWidth: 4.0,
    actualThickness: 1.5,
    actualWidth: 3.5,
  },
  "4x4": {
    nominal: "4x4",
    nominalThickness: 4.0,
    nominalWidth: 4.0,
    actualThickness: 3.5,
    actualWidth: 3.5,
  },
};

export const LUMBER_DENSITY_PER_BF = 2.85; // lbs per board foot (standard industrial SPF/SYP mixed hardwood/softwood)
export const FASTENER_WEIGHT_LBS = 0.015; // lbs per screw/shank nail

/**
 * Calculates board feet for given nominal dimensions and length in inches.
 * Formula: (Nominal Thickness" * Nominal Width" * Length") / 144 * Qty
 */
export function calculateBoardFeet(
  nominalThickness: number,
  nominalWidth: number,
  lengthInches: number,
  quantity: number = 1
): number {
  const bf = (nominalThickness * nominalWidth * lengthInches * quantity) / 144;
  return Math.round(bf * 100) / 100;
}

/**
 * Computes the recommended number of stringers based on pallet width and total product weight.
 */
export function determineStringerCount(palletWidth: number, weight: number): number {
  if (palletWidth > 72 || weight > 3000) {
    return 5;
  }
  if (palletWidth > 48 || weight > 1500) {
    return 4;
  }
  return 3;
}

/**
 * Calculates uniform deckboard layout and spacing across the pallet length.
 * Both Top and Bottom boards are distributed evenly based on palletLength, deckboardNominal, and targetMaxGap.
 * When targetMaxGap <= 0, gap is omitted and boards are placed edge-to-edge continuously.
 */
export function calculateDeckboardLayout(
  palletLength: number,
  targetMaxGap: number = 3.0,
  deckboardNominal: "1x4" | "1x6" = "1x4"
) {
  const spec = LUMBER_SPECS[deckboardNominal] || LUMBER_SPECS["1x4"];
  const boardWidth = spec.actualWidth; // 3.5" or 5.5"

  if (palletLength <= boardWidth) {
    return {
      totalBoards: 1,
      actualGap: 0,
    };
  }

  // When targetMaxGap <= 0, gap is omitted: pack boards flush edge-to-edge
  if (targetMaxGap <= 0) {
    const totalBoards = Math.max(2, Math.floor(palletLength / boardWidth));
    return {
      totalBoards,
      actualGap: 0,
    };
  }

  // With N boards, there are N - 1 gaps between the outer front and rear edge boards.
  // Spacing = (palletLength - N * boardWidth) / (N - 1) <= targetMaxGap
  // => N >= (palletLength - targetMaxGap) / (boardWidth + targetMaxGap) + 1
  const minN = Math.ceil((palletLength - targetMaxGap) / (boardWidth + targetMaxGap)) + 1;
  const totalBoards = Math.max(2, minN);
  const numberOfGaps = totalBoards - 1;
  const actualGap =
    numberOfGaps > 0
      ? Math.max(0, (palletLength - totalBoards * boardWidth) / numberOfGaps)
      : 0;

  return {
    totalBoards,
    actualGap: Math.round(actualGap * 100) / 100,
  };
}

/**
 * Main Pallet Dimension & Cut List Calculation Engine
 */
export function calculatePallet(input: PalletInputParams): ICalculationResult {
  const {
    productLength,
    productWidth,
    productHeight,
    productWeight,
    palletStyle = "2-Way Stringer (Flush)",
    lengthAllowance = 2.0,
    widthAllowance = 2.0,
    deckboardNominal = "1x4",
    stringerNominal = "2x4",
    targetMaxGap,
    boardGap,
    middleBoardCount = 1,
  } = input;

  const effectiveGap = boardGap !== undefined ? boardGap : (targetMaxGap !== undefined ? targetMaxGap : 3.0);
  const validatedMiddleCount: 1 | 2 = middleBoardCount === 2 ? 2 : 1;

  // 1. Overall Pallet Dimensions
  const palletLength = Math.max(12, Math.round((productLength + lengthAllowance) * 10) / 10);
  const palletWidth = Math.max(12, Math.round((productWidth + widthAllowance) * 10) / 10);

  const stringerSpec = LUMBER_SPECS[stringerNominal] || LUMBER_SPECS["2x4"];
  const deckboardSpec = LUMBER_SPECS[deckboardNominal] || LUMBER_SPECS["1x4"];

  // Total stringers/runners in the middle area between top and bottom deckboards:
  // - 1 piece mode (Light): 1 left + 1 middle + 1 right = 3 total pieces (2 outer + 1 middle)
  // - 2 pieces mode (Heavy): 2 left + 2 middle + 2 right = 6 total pieces (4 outer + 2 middle)
  const outerStringerCount = validatedMiddleCount === 2 ? 4 : 2;
  const middleStringerCount = validatedMiddleCount === 2 ? 2 : 1;
  const totalStringerCount = outerStringerCount + middleStringerCount; // 3 or 6 pieces

  // Uniform deckboard layouts for top and bottom boards
  const topLayout = calculateDeckboardLayout(palletLength, effectiveGap, deckboardNominal);
  const bottomLayout = calculateDeckboardLayout(palletLength, effectiveGap, deckboardNominal);

  // Heights:
  // Stringer/runner height: 3.5" (for 2x4 standard upright)
  const stringerActualHeight =
    stringerSpec.actualThickness === 1.5 ? stringerSpec.actualWidth : stringerSpec.actualThickness;
  const topDeckThickness = deckboardSpec.actualThickness;
  const bottomDeckThickness = deckboardSpec.actualThickness;
  const totalPalletHeight =
    Math.round((bottomDeckThickness + stringerActualHeight + topDeckThickness) * 10) / 10;

  // Itemized Wood Cut List:
  // 1. Top Boards (evenly spaced across the pallet)
  // 2. Middle Wood Pieces / Runners (Left Outer, Right Outer, and Middle support pieces based on 1-piece or 2-piece / doubled selection)
  // 3. Bottom Boards (evenly spaced across the bottom of the pallet)
  const cutList: ICutListItem[] = [];
  const deckboardLength = palletWidth;
  const stringerLength = palletLength;

  // 1. Top Boards
  const topBF = calculateBoardFeet(
    deckboardSpec.nominalThickness,
    deckboardSpec.nominalWidth,
    deckboardLength,
    topLayout.totalBoards
  );
  cutList.push({
    name: "Top Boards",
    quantity: topLayout.totalBoards,
    nominalDimension: `${deckboardSpec.nominal} x ${deckboardLength}"`,
    actualDimension: `${deckboardSpec.actualThickness}" x ${deckboardSpec.actualWidth}" x ${deckboardLength}"`,
    thickness: deckboardSpec.actualThickness,
    width: deckboardSpec.actualWidth,
    length: deckboardLength,
    boardFeet: topBF,
  });

  // 2. Middle Wood Pieces / Runners
  const runnerBF = calculateBoardFeet(
    stringerSpec.nominalThickness,
    stringerSpec.nominalWidth,
    stringerLength,
    totalStringerCount
  );
  cutList.push({
    name: "Middle Wood Pieces / Runners",
    quantity: totalStringerCount,
    nominalDimension: `${stringerSpec.nominal} x ${stringerLength}"`,
    actualDimension: `${stringerSpec.actualThickness}" x ${stringerSpec.actualWidth}" x ${stringerLength}"`,
    thickness: stringerSpec.actualThickness,
    width: stringerSpec.actualWidth,
    length: stringerLength,
    boardFeet: runnerBF,
  });

  // 3. Bottom Boards
  const bottomBF = calculateBoardFeet(
    deckboardSpec.nominalThickness,
    deckboardSpec.nominalWidth,
    deckboardLength,
    bottomLayout.totalBoards
  );
  cutList.push({
    name: "Bottom Boards",
    quantity: bottomLayout.totalBoards,
    nominalDimension: `${deckboardSpec.nominal} x ${deckboardLength}"`,
    actualDimension: `${deckboardSpec.actualThickness}" x ${deckboardSpec.actualWidth}" x ${deckboardLength}"`,
    thickness: deckboardSpec.actualThickness,
    width: deckboardSpec.actualWidth,
    length: deckboardLength,
    boardFeet: bottomBF,
  });

  // Total board feet
  const totalBoardFeet =
    Math.round(cutList.reduce((acc, item) => acc + item.boardFeet, 0) * 100) / 100;

  // Fastener calculations: 3 nails per deckboard-runner junction
  const totalDeckboards = topLayout.totalBoards + bottomLayout.totalBoards;
  const fastenersCount = totalDeckboards * totalStringerCount * 3;

  // Estimated Tare Weight
  const lumberWeight = totalBoardFeet * LUMBER_DENSITY_PER_BF;
  const fastenerWeight = fastenersCount * FASTENER_WEIGHT_LBS;
  const estimatedTareWeight = Math.round((lumberWeight + fastenerWeight) * 10) / 10;

  // Max Safe Distributed Load calculation
  const spanFactor = palletLength > 48 ? Math.max(0.65, 48 / palletLength) : 1.0;
  const baseStringerCapacity = stringerNominal === "4x4" ? 2200 : 950;
  const calculatedLoad = Math.round(totalStringerCount * baseStringerCapacity * spanFactor);
  const maxSafeLoad = Math.min(10000, Math.max(1500, Math.round(calculatedLoad / 50) * 50));

  return {
    palletDimensions: {
      length: palletLength,
      width: palletWidth,
      height: totalPalletHeight,
    },
    cutList,
    totalBoardFeet,
    estimatedTareWeight,
    maxSafeLoad,
    fastenersCount,
    topDeckboardCount: topLayout.totalBoards,
    bottomDeckboardCount: bottomLayout.totalBoards,
    stringerCount: totalStringerCount,
    actualSpacing: topLayout.actualGap,
    middleBoardCount: validatedMiddleCount,
    boardGap: effectiveGap,
  };
}
