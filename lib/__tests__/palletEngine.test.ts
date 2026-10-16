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
    it("computes uniform deckboards with uniform gap <= targetMaxGap", () => {
      const layout = calculateDeckboardLayout(48, 3.0, "1x4");
      expect(layout.totalBoards).toBeGreaterThan(0);
      expect(layout.actualGap).toBeLessThanOrEqual(3.0);
      expect(layout.actualGap).toBeGreaterThan(0);
    });

    it("supports omitting gap (targetMaxGap = 0) with 0 actual gap", () => {
      const layout = calculateDeckboardLayout(48, 0, "1x4");
      expect(layout.totalBoards).toBeGreaterThan(0);
      expect(layout.actualGap).toBe(0);
    });
  });

  describe("calculatePallet - Complete Engine with 2-inch allowances on both sides", () => {
    it("calculates standard pallet with 2-inch default allowances per side (+4 total) and 1 middle piece", () => {
      const result = calculatePallet({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        middleBoardCount: 1,
      });

      // 46 + (2 * 2) = 50, 38 + (2 * 2) = 42
      expect(result.palletDimensions.length).toBe(50);
      expect(result.palletDimensions.width).toBe(42);
      // Pallet height = 0.75 + 3.5 + 0.75 = 5.0"
      expect(result.palletDimensions.height).toBe(5);
      // 2 outer runners + 1 middle wood piece = 3 total stringers
      expect(result.stringerCount).toBe(3);
      expect(result.middleBoardCount).toBe(1);

      // Verify simplified cut list names
      const cutNames = result.cutList.map((i) => i.name);
      expect(cutNames).toEqual([
        "Top Boards",
        "Middle Wood Pieces / Runners",
        "Bottom Boards",
      ]);

      // Verify quantities
      const topItem = result.cutList.find((i) => i.name === "Top Boards");
      expect(topItem?.quantity).toBe(result.topDeckboardCount);
      const runnerItem = result.cutList.find((i) => i.name === "Middle Wood Pieces / Runners");
      expect(runnerItem?.quantity).toBe(3);
      const bottomItem = result.cutList.find((i) => i.name === "Bottom Boards");
      expect(bottomItem?.quantity).toBe(result.bottomDeckboardCount);

      expect(result.totalBoardFeet).toBeGreaterThan(15);
      expect(result.estimatedTareWeight).toBeGreaterThan(35);
      expect(result.fastenersCount).toBeGreaterThan(0);
      expect(result.maxSafeLoad).toBeGreaterThanOrEqual(800);
    });

    it("calculates reinforced pallet with 2 middle wood pieces (6 pieces total) for heavy load", () => {
      const result = calculatePallet({
        productLength: 58,
        productWidth: 44,
        productHeight: 36,
        productWeight: 2000,
        middleBoardCount: 2,
        lengthAllowance: 2.0,
        widthAllowance: 2.0,
        deckboardNominal: "1x6",
      });

      // 58 + (2 * 2) = 62, 44 + (2 * 2) = 48
      expect(result.palletDimensions.length).toBe(62);
      expect(result.palletDimensions.width).toBe(48);
      // 4 outer runners (2 left + 2 right) + 2 middle wood pieces = 6 total runners
      expect(result.stringerCount).toBe(6);
      expect(result.middleBoardCount).toBe(2);

      const runnerItem = result.cutList.find((i) => i.name === "Middle Wood Pieces / Runners");
      expect(runnerItem?.quantity).toBe(6);
    });

    it("supports custom allowances on both sides and omitted gap", () => {
      const result = calculatePallet({
        productLength: 40,
        productWidth: 30,
        productHeight: 20,
        productWeight: 500,
        lengthAllowance: 4.0,
        widthAllowance: 4.0,
        boardGap: 0,
      });

      // 40 + (2 * 4) = 48, 30 + (2 * 4) = 38
      expect(result.palletDimensions.length).toBe(48);
      expect(result.palletDimensions.width).toBe(38);
      expect(result.actualSpacing).toBe(0);
    });

    it("defaults to 2 bottom boards (Uniform Base Deck) when unspecified", () => {
      const result = calculatePallet({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
      });

      expect(result.bottomDeckboardCount).toBe(2);
      expect(result.bottomBoardCount).toBe(2);
      const bottomItem = result.cutList.find((i) => i.name === "Bottom Boards");
      expect(bottomItem?.quantity).toBe(2);
    });

    it("allows user to choose 2 to 5 bottom boards and clamps within range", () => {
      for (const count of [2, 3, 4, 5]) {
        const result = calculatePallet({
          productLength: 46,
          productWidth: 38,
          productHeight: 30,
          productWeight: 800,
          bottomBoardCount: count,
        });
        expect(result.bottomDeckboardCount).toBe(count);
        const bottomItem = result.cutList.find((i) => i.name === "Bottom Boards");
        expect(bottomItem?.quantity).toBe(count);
      }

      // Clamping: < 2 becomes 2, > 5 becomes 5
      const clampLow = calculatePallet({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        bottomBoardCount: 1,
      });
      expect(clampLow.bottomDeckboardCount).toBe(2);

      const clampHigh = calculatePallet({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        bottomBoardCount: 8,
      });
      expect(clampHigh.bottomDeckboardCount).toBe(5);
    });

    it("defaults to 1x6 deckboard spec and calculates 8 boards for 76-inch product + 2-inch allowance with 5-inch gap", () => {
      // 76 + (2 * 2) = 80 inch pallet length
      const result = calculatePallet({
        productLength: 76,
        productWidth: 38,
        productHeight: 30,
        productWeight: 1000,
        lengthAllowance: 2.0,
        boardGap: 5.0,
      });

      expect(result.palletDimensions.length).toBe(80);
      // Defaults to 1x6 (5.5" actual width)
      expect(result.deckboardActualWidth).toBe(5.5);
      // 8 top boards (not 9) best matching the 5.0" gap
      expect(result.topDeckboardCount).toBe(8);
      // 8 boards * 5.5 = 44" wood. 7 gaps: (80 - 44) / 7 = 5.14" actual gap
      expect(result.actualSpacing).toBe(5.14);
      // Verification: 8 * 5.5 + 7 * 5.14 = 44 + 35.98 ≈ 80"
      const totalWood = result.topDeckboardCount * 5.5;
      const totalGaps = (result.topDeckboardCount - 1) * result.actualSpacing;
      expect(Math.round(totalWood + totalGaps)).toBe(80);
    });
  });
});
