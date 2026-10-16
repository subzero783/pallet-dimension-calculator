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
  bottomBoardCount?: number; // 2 to 5 boards (default 2)
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
  deckboardNominal: "1x4" | "1x6" = "1x6"
) {
  const spec = LUMBER_SPECS[deckboardNominal] || LUMBER_SPECS["1x6"];
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

  // Pallet length = N * boardWidth + (N - 1) * gap
  // => N * (boardWidth + gap) = palletLength + gap
  // => Ideal N = (palletLength + gap) / (boardWidth + gap)
  // Round to the closest whole board count to best honor the user's chosen gap
  const idealN = (palletLength + targetMaxGap) / (boardWidth + targetMaxGap);
  let totalBoards = Math.max(2, Math.round(idealN));

  // If totalBoards * boardWidth exceeds palletLength, clamp totalBoards
  if (totalBoards * boardWidth > palletLength) {
    totalBoards = Math.max(2, Math.floor(palletLength / boardWidth));
  }

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
    deckboardNominal = "1x6",
    stringerNominal = "2x4",
    targetMaxGap,
    boardGap,
    middleBoardCount = 1,
    bottomBoardCount = 2,
  } = input;

  const effectiveGap = boardGap !== undefined ? boardGap : (targetMaxGap !== undefined ? targetMaxGap : 3.0);
  const validatedMiddleCount: 1 | 2 = middleBoardCount === 2 ? 2 : 1;
  const validatedBottomCount = Math.min(5, Math.max(2, Math.round(Number(bottomBoardCount) || 2)));

  // 1. Overall Pallet Dimensions
  // Length and Width allowances are applied to both sides of the pallet:
  // Pallet Length = Product Length + (2 * Length Allowance)
  // Pallet Width = Product Width + (2 * Width Allowance)
  const palletLength = Math.max(12, Math.round((productLength + 2 * lengthAllowance) * 10) / 10);
  const palletWidth = Math.max(12, Math.round((productWidth + 2 * widthAllowance) * 10) / 10);

  const stringerSpec = LUMBER_SPECS[stringerNominal] || LUMBER_SPECS["2x4"];
  const deckboardSpec = LUMBER_SPECS[deckboardNominal] || LUMBER_SPECS["1x4"];

  // Total stringers/runners in the middle area between top and bottom deckboards:
  // - 1 piece mode (Light): 1 left + 1 middle + 1 right = 3 total pieces (2 outer + 1 middle)
  // - 2 pieces mode (Heavy): 2 left + 2 middle + 2 right = 6 total pieces (4 outer + 2 middle)
  const outerStringerCount = validatedMiddleCount === 2 ? 4 : 2;
  const middleStringerCount = validatedMiddleCount === 2 ? 2 : 1;
  const totalStringerCount = outerStringerCount + middleStringerCount; // 3 or 6 pieces

  // Uniform deckboard layouts:
  // Top boards are distributed based on board gap (3" to 5" or 0)
  const topLayout = calculateDeckboardLayout(palletLength, effectiveGap, deckboardNominal);

  // Bottom boards (Uniform Base Deck): 2 to 5 boards (default 2), spaced out evenly across base
  const botBoardWidth = deckboardSpec.actualWidth;
  const botGaps = validatedBottomCount - 1;
  const bottomActualGap = botGaps > 0
    ? Math.max(0, Math.round(((palletLength - validatedBottomCount * botBoardWidth) / botGaps) * 100) / 100)
    : 0;

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

  // 3. Bottom Boards (Uniform Base Deck)
  const bottomBF = calculateBoardFeet(
    deckboardSpec.nominalThickness,
    deckboardSpec.nominalWidth,
    deckboardLength,
    validatedBottomCount
  );
  cutList.push({
    name: "Bottom Boards",
    quantity: validatedBottomCount,
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
  const totalDeckboards = topLayout.totalBoards + validatedBottomCount;
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
    bottomDeckboardCount: validatedBottomCount,
    stringerCount: totalStringerCount,
    actualSpacing: topLayout.actualGap,
    bottomSpacing: bottomActualGap,
    middleBoardCount: validatedMiddleCount,
    bottomBoardCount: validatedBottomCount,
    boardGap: effectiveGap,
    deckboardActualWidth: deckboardSpec.actualWidth,
  };
}
