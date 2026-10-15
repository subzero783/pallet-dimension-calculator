import { ICutListItem, ICalculationResult } from "@/models/WorkOrder";

export interface PalletInputParams {
  productLength: number; // inches
  productWidth: number; // inches
  productHeight: number; // inches
  productWeight: number; // lbs
  palletStyle?: "2-Way Stringer (Flush)" | "2-Way Stringer (Overhang)" | "4-Way Notched Stringer" | "Heavy-Duty Skid";
  lengthAllowance?: number; // default 4.0"
  widthAllowance?: number; // default 4.0"
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
 * Calculates deckboard layout and uniform spacing.
 * When targetMaxGap is 0, gap is omitted and boards are placed continuously.
 */
export function calculateDeckboardLayout(
  palletLength: number,
  targetMaxGap: number = 3.0,
  deckboardNominal: "1x4" | "1x6" = "1x4"
) {
  const leadSpec = LUMBER_SPECS["1x6"]; // Standard industrial practice: nominal 1x6 for lead boards
  const interiorSpec = LUMBER_SPECS[deckboardNominal];

  const leadBoardWidth = leadSpec.actualWidth; // 5.5"
  const interiorBoardWidth = interiorSpec.actualWidth; // 3.5" or 5.5"

  // Pallet must have 2 lead boards (front and back)
  const lengthForInterior = palletLength - 2 * leadBoardWidth;

  if (lengthForInterior <= 0) {
    return {
      topLeadCount: 2,
      topInteriorCount: 0,
      actualGap: 0,
      totalTopBoards: 2,
    };
  }

  // When targetMaxGap === 0, gap is omitted: pack interior boards edge-to-edge
  if (targetMaxGap <= 0) {
    const topInteriorCount = Math.max(0, Math.floor(lengthForInterior / interiorBoardWidth));
    return {
      topLeadCount: 2,
      topInteriorCount,
      actualGap: 0,
      totalTopBoards: 2 + topInteriorCount,
    };
  }

  // Calculate minimum interior boards such that spacing <= targetMaxGap
  const minN = Math.ceil((lengthForInterior - targetMaxGap) / (interiorBoardWidth + targetMaxGap));
  const topInteriorCount = Math.max(0, minN);

  const numberOfGaps = topInteriorCount + 1;
  const actualGap =
    numberOfGaps > 0
      ? Math.max(0, (lengthForInterior - topInteriorCount * interiorBoardWidth) / numberOfGaps)
      : 0;

  return {
    topLeadCount: 2,
    topInteriorCount,
    actualGap: Math.round(actualGap * 100) / 100,
    totalTopBoards: 2 + topInteriorCount,
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
    lengthAllowance = 4.0,
    widthAllowance = 4.0,
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
  const leadBoardSpec = LUMBER_SPECS["1x6"];

  // Total stringers/runners in the middle area between top and bottom lead:
  // - 1 piece mode (Light): 1 left + 1 middle + 1 right = 3 total pieces (2 outer + 1 middle)
  // - 2 pieces mode (Heavy): 2 left + 2 middle + 2 right = 6 total pieces (4 outer + 2 middle)
  const outerStringerCount = validatedMiddleCount === 2 ? 4 : 2;
  const middleStringerCount = validatedMiddleCount === 2 ? 2 : 1;
  const totalStringerCount = outerStringerCount + middleStringerCount; // 3 or 6 pieces

  // Deckboard layout for top
  const topLayout = calculateDeckboardLayout(palletLength, effectiveGap, deckboardNominal);

  // Bottom deckboard layout: 2 bottom lead boards
  const bottomLeadCount = 2;
  const totalBottomBoards = bottomLeadCount;

  // Heights:
  // Stringer/runner height: 3.5" (for 2x4 standard upright)
  const stringerActualHeight =
    stringerSpec.actualThickness === 1.5 ? stringerSpec.actualWidth : stringerSpec.actualThickness;
  const topDeckThickness = deckboardSpec.actualThickness;
  const bottomLeadThickness = leadBoardSpec.actualThickness;
  const totalPalletHeight =
    Math.round((bottomLeadThickness + stringerActualHeight + topDeckThickness) * 10) / 10;

  // Simplified Itemized Wood Cut List:
  // Essential build information for shipping floor sawyers:
  // 1. Top Lead Boards
  // 2. Top Deck Boards
  // 3. Middle Wood Pieces [1 or 2] (Center pieces right next to each other)
  // 4. Outer Runners/Stringers [2 or 4] (Left and Right pieces right next to each other)
  // 5. Bottom Lead Boards
  const cutList: ICutListItem[] = [];
  const deckboardLength = palletWidth;
  const stringerLength = palletLength;

  // 1. Top Lead Boards
  const topLeadBF = calculateBoardFeet(
    leadBoardSpec.nominalThickness,
    leadBoardSpec.nominalWidth,
    deckboardLength,
    2
  );
  cutList.push({
    name: "Top Lead Boards",
    quantity: 2,
    nominalDimension: `${leadBoardSpec.nominal} x ${deckboardLength}"`,
    actualDimension: `${leadBoardSpec.actualThickness}" x ${leadBoardSpec.actualWidth}" x ${deckboardLength}"`,
    thickness: leadBoardSpec.actualThickness,
    width: leadBoardSpec.actualWidth,
    length: deckboardLength,
    boardFeet: topLeadBF,
  });

  // 2. Top Deck Boards
  if (topLayout.topInteriorCount > 0) {
    const topInteriorBF = calculateBoardFeet(
      deckboardSpec.nominalThickness,
      deckboardSpec.nominalWidth,
      deckboardLength,
      topLayout.topInteriorCount
    );
    cutList.push({
      name: "Top Deck Boards",
      quantity: topLayout.topInteriorCount,
      nominalDimension: `${deckboardSpec.nominal} x ${deckboardLength}"`,
      actualDimension: `${deckboardSpec.actualThickness}" x ${deckboardSpec.actualWidth}" x ${deckboardLength}"`,
      thickness: deckboardSpec.actualThickness,
      width: deckboardSpec.actualWidth,
      length: deckboardLength,
      boardFeet: topInteriorBF,
    });
  }

  // 3. Middle Wood Pieces (1 or 2 pieces situated in the very middle together)
  const middleBF = calculateBoardFeet(
    stringerSpec.nominalThickness,
    stringerSpec.nominalWidth,
    stringerLength,
    middleStringerCount
  );
  cutList.push({
    name: "Middle Wood Pieces",
    quantity: middleStringerCount,
    nominalDimension: `${stringerSpec.nominal} x ${stringerLength}"`,
    actualDimension: `${stringerSpec.actualThickness}" x ${stringerSpec.actualWidth}" x ${stringerLength}"`,
    thickness: stringerSpec.actualThickness,
    width: stringerSpec.actualWidth,
    length: stringerLength,
    boardFeet: middleBF,
  });

  // 4. Outer Runners/Stringers (2 pieces for single, 4 pieces for doubled side-by-side)
  const outerBF = calculateBoardFeet(
    stringerSpec.nominalThickness,
    stringerSpec.nominalWidth,
    stringerLength,
    outerStringerCount
  );
  cutList.push({
    name: "Outer Runners/Stringers",
    quantity: outerStringerCount,
    nominalDimension: `${stringerSpec.nominal} x ${stringerLength}"`,
    actualDimension: `${stringerSpec.actualThickness}" x ${stringerSpec.actualWidth}" x ${stringerLength}"`,
    thickness: stringerSpec.actualThickness,
    width: stringerSpec.actualWidth,
    length: stringerLength,
    boardFeet: outerBF,
  });

  // 5. Bottom Lead Boards (2 pieces)
  const bottomLeadBF = calculateBoardFeet(
    leadBoardSpec.nominalThickness,
    leadBoardSpec.nominalWidth,
    deckboardLength,
    2
  );
  cutList.push({
    name: "Bottom Lead Boards",
    quantity: 2,
    nominalDimension: `${leadBoardSpec.nominal} x ${deckboardLength}"`,
    actualDimension: `${leadBoardSpec.actualThickness}" x ${leadBoardSpec.actualWidth}" x ${deckboardLength}"`,
    thickness: leadBoardSpec.actualThickness,
    width: leadBoardSpec.actualWidth,
    length: deckboardLength,
    boardFeet: bottomLeadBF,
  });

  // Total board feet
  const totalBoardFeet =
    Math.round(cutList.reduce((acc, item) => acc + item.boardFeet, 0) * 100) / 100;

  // Fastener calculations: 3 nails per deckboard-runner junction
  const totalDeckboards = topLayout.totalTopBoards + totalBottomBoards;
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
    topDeckboardCount: topLayout.totalTopBoards,
    bottomDeckboardCount: totalBottomBoards,
    stringerCount: totalStringerCount,
    actualSpacing: topLayout.actualGap,
    middleBoardCount: validatedMiddleCount,
    boardGap: effectiveGap,
  };
}
