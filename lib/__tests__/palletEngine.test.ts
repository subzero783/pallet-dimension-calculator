import { describe, it, expect } from "vitest";
import {
  calculateBoardFeet,
  determineStringerCount,
  calculateDeckboardLayout,
  calculatePallet,
  LUMBER_SPECS,
} from "../palletEngine";

describe("Pallet Engine Calculations", () => {
  describe("calculateBoardFeet", () => {
    it("correctly calculates board feet for 1x4 x 48 inches", () => {
      // (1 * 4 * 48) / 144 = 1.333... -> 1.33
      expect(calculateBoardFeet(1, 4, 48, 1)).toBe(1.33);
    });

    it("correctly calculates board feet for 2x4 x 48 inches, qty 3", () => {
      // (2 * 4 * 48 * 3) / 144 = 8.0
      expect(calculateBoardFeet(2, 4, 48, 3)).toBe(8);
    });
  });

  describe("determineStringerCount", () => {
    it("returns 3 stringers for standard 40-inch pallet under 1500 lbs", () => {
      expect(determineStringerCount(40, 800)).toBe(3);
    });

    it("returns 4 stringers for width > 48 inches", () => {
      expect(determineStringerCount(54, 1000)).toBe(4);
    });

    it("returns 4 stringers for weight > 1500 lbs even if width <= 48", () => {
      expect(determineStringerCount(42, 1800)).toBe(4);
    });

    it("returns 5 stringers for heavy industrial (>3000 lbs) or width > 72", () => {
      expect(determineStringerCount(44, 3500)).toBe(5);
      expect(determineStringerCount(76, 1200)).toBe(5);
    });
  });

  describe("calculateDeckboardLayout", () => {
    it("computes lead boards and interior boards with uniform gap <= targetMaxGap", () => {
      const layout = calculateDeckboardLayout(48, 3.0, "1x4");
      expect(layout.topLeadCount).toBe(2);
      expect(layout.topInteriorCount).toBeGreaterThan(0);
      expect(layout.actualGap).toBeLessThanOrEqual(3.0);
      expect(layout.actualGap).toBeGreaterThan(0);
    });

    it("supports omitting gap (targetMaxGap = 0)", () => {
      const layout = calculateDeckboardLayout(48, 0, "1x4");
      expect(layout.topLeadCount).toBe(2);
      expect(layout.topInteriorCount).toBeGreaterThan(0);
      expect(layout.actualGap).toBe(0);
    });
  });

  describe("calculatePallet - Complete Engine with 4-inch defaults and Middle Wood Pieces", () => {
    it("calculates standard pallet with new 4-inch default allowances and 1 middle piece", () => {
      const result = calculatePallet({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        middleBoardCount: 1,
      });

      // 46 + 4 = 50, 38 + 4 = 42
      expect(result.palletDimensions.length).toBe(50);
      expect(result.palletDimensions.width).toBe(42);
      // Pallet height = 0.75 + 3.5 + 0.75 = 5.0"
      expect(result.palletDimensions.height).toBe(5);
      // 2 outer runners + 1 middle wood piece = 3 total stringers
      expect(result.stringerCount).toBe(3);
      expect(result.middleBoardCount).toBe(1);

      // Verify simplified cut list names
      const cutNames = result.cutList.map((i) => i.name);
      expect(cutNames).toContain("Top Lead Boards");
      expect(cutNames).toContain("Top Deck Boards");
      expect(cutNames).toContain("Middle Wood Pieces");
      expect(cutNames).toContain("Outer Runners/Stringers");
      expect(cutNames).toContain("Bottom Lead Boards");

      // Verify quantities
      const midItem = result.cutList.find((i) => i.name === "Middle Wood Pieces");
      expect(midItem?.quantity).toBe(1);
      const outerItem = result.cutList.find((i) => i.name === "Outer Runners/Stringers");
      expect(outerItem?.quantity).toBe(2);
      const bottomItem = result.cutList.find((i) => i.name === "Bottom Lead Boards");
      expect(bottomItem?.quantity).toBe(2);

      expect(result.totalBoardFeet).toBeGreaterThan(15);
      expect(result.estimatedTareWeight).toBeGreaterThan(40);
      expect(result.fastenersCount).toBeGreaterThan(0);
      expect(result.maxSafeLoad).toBeGreaterThanOrEqual(800);
    });

    it("calculates reinforced pallet with 2 middle wood pieces for heavy load", () => {
      const result = calculatePallet({
        productLength: 58,
        productWidth: 44,
        productHeight: 36,
        productWeight: 2000,
        middleBoardCount: 2,
        lengthAllowance: 4.0,
        widthAllowance: 4.0,
        deckboardNominal: "1x6",
      });

      expect(result.palletDimensions.length).toBe(62);
      expect(result.palletDimensions.width).toBe(48);
      // 4 outer runners (2 left + 2 right) + 2 middle wood pieces = 6 total runners
      expect(result.stringerCount).toBe(6);
      expect(result.middleBoardCount).toBe(2);

      const midItem = result.cutList.find((i) => i.name === "Middle Wood Pieces");
      expect(midItem?.quantity).toBe(2);
      const outerItem = result.cutList.find((i) => i.name === "Outer Runners/Stringers");
      expect(outerItem?.quantity).toBe(4);
    });

    it("supports custom allowances and omitted gap", () => {
      const result = calculatePallet({
        productLength: 40,
        productWidth: 30,
        productHeight: 20,
        productWeight: 500,
        lengthAllowance: 2.0,
        widthAllowance: 2.0,
        boardGap: 0,
      });

      expect(result.palletDimensions.length).toBe(42);
      expect(result.palletDimensions.width).toBe(32);
      expect(result.actualSpacing).toBe(0);
    });
  });
});
