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
  targetMaxGap?: number; // default 3.0"
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

  // Pallet must have at least 2 lead boards
  const lengthForInterior = palletLength - 2 * leadBoardWidth;

  if (lengthForInterior <= 0) {
    return {
      topLeadCount: 2,
      topInteriorCount: 0,
      actualGap: 0,
      totalTopBoards: 2,
    };
  }

  // Calculate minimum interior boards such that spacing <= targetMaxGap
  // lengthForInterior = (N * interiorBoardWidth) + ((N + 1) * gap)
  // gap = (lengthForInterior - N * interiorBoardWidth) / (N + 1) <= targetMaxGap
  // lengthForInterior - targetMaxGap <= N * (interiorBoardWidth + targetMaxGap)
  // N >= (lengthForInterior - targetMaxGap) / (interiorBoardWidth + targetMaxGap)
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
    lengthAllowance = 2.0,
    widthAllowance = 2.0,
    deckboardNominal = "1x4",
    stringerNominal = "2x4",
    targetMaxGap = 3.0,
    overhangDistance = 1.5,
  } = input;

  // 1. Overall Pallet Dimensions
  const palletLength = Math.max(12, Math.round((productLength + lengthAllowance) * 10) / 10);
  const palletWidth = Math.max(12, Math.round((productWidth + widthAllowance) * 10) / 10);

  const stringerSpec = LUMBER_SPECS[stringerNominal] || LUMBER_SPECS["2x4"];
  const deckboardSpec = LUMBER_SPECS[deckboardNominal] || LUMBER_SPECS["1x4"];
  const leadBoardSpec = LUMBER_SPECS["1x6"];

  const isSkid = palletStyle === "Heavy-Duty Skid";
  const isOverhang = palletStyle === "2-Way Stringer (Overhang)";

  // Stringer count
  const stringerCount = determineStringerCount(palletWidth, productWeight);

  // Deckboard layout for top
  const topLayout = calculateDeckboardLayout(palletLength, targetMaxGap, deckboardNominal);

  // Bottom deckboard layout
  // Standard pallets have 2 bottom lead boards and 2-3 interior boards (unless Heavy-Duty Skid)
  let bottomLeadCount = 0;
  let bottomInteriorCount = 0;
  if (!isSkid) {
    bottomLeadCount = 2;
    bottomInteriorCount = palletLength >= 60 ? 3 : 2;
  }
  const totalBottomBoards = bottomLeadCount + bottomInteriorCount;

  // Actual heights
  const stringerActualHeight = stringerSpec.actualThickness === 1.5 ? stringerSpec.actualWidth : stringerSpec.actualThickness;
  const topDeckThickness = deckboardSpec.actualThickness;
  const bottomDeckThickness = isSkid ? 0 : deckboardSpec.actualThickness;
  const totalPalletHeight = Math.round((stringerActualHeight + topDeckThickness + bottomDeckThickness) * 10) / 10;

  // Cut List item generation
  const cutList: ICutListItem[] = [];

  // 1. Stringers
  const stringerLength = palletLength;
  const stringerBF = calculateBoardFeet(
    stringerSpec.nominalThickness,
    stringerSpec.nominalWidth,
    stringerLength,
    stringerCount
  );
  cutList.push({
    name: isSkid ? "Skid Runners" : "Stringers",
    quantity: stringerCount,
    nominalDimension: `${stringerSpec.nominal} x ${stringerLength}"`,
    actualDimension: `${stringerSpec.actualThickness}" x ${stringerSpec.actualWidth}" x ${stringerLength}"`,
    thickness: stringerSpec.actualThickness,
    width: stringerSpec.actualWidth,
    length: stringerLength,
    boardFeet: stringerBF,
  });

  // Deckboard length
  // For flush: Deckboard Length = palletWidth
  // For overhang: stringer span is palletWidth - 2 * overhangDistance, Deckboard Length = palletWidth
  const deckboardLength = palletWidth;

  // 2. Top Lead Deckboards
  if (topLayout.topLeadCount > 0) {
    const leadBF = calculateBoardFeet(
      leadBoardSpec.nominalThickness,
      leadBoardSpec.nominalWidth,
      deckboardLength,
      topLayout.topLeadCount
    );
    cutList.push({
      name: "Top Lead Deckboards",
      quantity: topLayout.topLeadCount,
      nominalDimension: `${leadBoardSpec.nominal} x ${deckboardLength}"`,
      actualDimension: `${leadBoardSpec.actualThickness}" x ${leadBoardSpec.actualWidth}" x ${deckboardLength}"`,
      thickness: leadBoardSpec.actualThickness,
      width: leadBoardSpec.actualWidth,
      length: deckboardLength,
      boardFeet: leadBF,
    });
  }

  // 3. Top Interior Deckboards
  if (topLayout.topInteriorCount > 0) {
    const interiorBF = calculateBoardFeet(
      deckboardSpec.nominalThickness,
      deckboardSpec.nominalWidth,
      deckboardLength,
      topLayout.topInteriorCount
    );
    cutList.push({
      name: "Top Interior Deckboards",
      quantity: topLayout.topInteriorCount,
      nominalDimension: `${deckboardSpec.nominal} x ${deckboardLength}"`,
      actualDimension: `${deckboardSpec.actualThickness}" x ${deckboardSpec.actualWidth}" x ${deckboardLength}"`,
      thickness: deckboardSpec.actualThickness,
      width: deckboardSpec.actualWidth,
      length: deckboardLength,
      boardFeet: interiorBF,
    });
  }

  // 4. Bottom Lead Deckboards
  if (bottomLeadCount > 0) {
    const bottomLeadBF = calculateBoardFeet(
      leadBoardSpec.nominalThickness,
      leadBoardSpec.nominalWidth,
      deckboardLength,
      bottomLeadCount
    );
    cutList.push({
      name: "Bottom Lead Deckboards",
      quantity: bottomLeadCount,
      nominalDimension: `${leadBoardSpec.nominal} x ${deckboardLength}"`,
      actualDimension: `${leadBoardSpec.actualThickness}" x ${leadBoardSpec.actualWidth}" x ${deckboardLength}"`,
      thickness: leadBoardSpec.actualThickness,
      width: leadBoardSpec.actualWidth,
      length: deckboardLength,
      boardFeet: bottomLeadBF,
    });
  }

  // 5. Bottom Interior Deckboards
  if (bottomInteriorCount > 0) {
    const bottomInteriorBF = calculateBoardFeet(
      deckboardSpec.nominalThickness,
      deckboardSpec.nominalWidth,
      deckboardLength,
      bottomInteriorCount
    );
    cutList.push({
      name: "Bottom Interior Deckboards",
      quantity: bottomInteriorCount,
      nominalDimension: `${deckboardSpec.nominal} x ${deckboardLength}"`,
      actualDimension: `${deckboardSpec.actualThickness}" x ${deckboardSpec.actualWidth}" x ${deckboardLength}"`,
      thickness: deckboardSpec.actualThickness,
      width: deckboardSpec.actualWidth,
      length: deckboardLength,
      boardFeet: bottomInteriorBF,
    });
  }

  // Total board feet
  const totalBoardFeet = Math.round(
    cutList.reduce((acc, item) => acc + item.boardFeet, 0) * 100
  ) / 100;

  // Fastener calculations: 3 nails per deckboard-stringer junction
  const totalDeckboards = topLayout.totalTopBoards + totalBottomBoards;
  const fastenersCount = totalDeckboards * stringerCount * 3;

  // Estimated Tare Weight
  const lumberWeight = totalBoardFeet * LUMBER_DENSITY_PER_BF;
  const fastenerWeight = fastenersCount * FASTENER_WEIGHT_LBS;
  const estimatedTareWeight = Math.round((lumberWeight + fastenerWeight) * 10) / 10;

  // Max Safe Distributed Load calculation:
  // Base capacity per stringer:
  // 2x4: ~900 lbs distributed per stringer for <= 48" span, reduced slightly for > 48" span
  // 4x4: ~2000 lbs distributed per stringer
  const spanFactor = palletLength > 48 ? Math.max(0.65, 48 / palletLength) : 1.0;
  const baseStringerCapacity = stringerNominal === "4x4" ? 2200 : 950;
  const calculatedLoad = Math.round(stringerCount * baseStringerCapacity * spanFactor);
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
    stringerCount,
    actualSpacing: topLayout.actualGap,
  };
}
