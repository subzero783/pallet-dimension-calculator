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
  });

  describe("calculatePallet - Complete Engine", () => {
    it("calculates standard 48x40 shipping pallet accurately", () => {
      const result = calculatePallet({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        lengthAllowance: 2.0,
        widthAllowance: 2.0,
        palletStyle: "2-Way Stringer (Flush)",
        deckboardNominal: "1x4",
        stringerNominal: "2x4",
      });

      expect(result.palletDimensions.length).toBe(48);
      expect(result.palletDimensions.width).toBe(40);
      expect(result.palletDimensions.height).toBeGreaterThan(4);
      expect(result.stringerCount).toBe(3);
      expect(result.cutList.length).toBeGreaterThanOrEqual(4);
      expect(result.totalBoardFeet).toBeGreaterThan(15);
      expect(result.estimatedTareWeight).toBeGreaterThan(40);
      expect(result.fastenersCount).toBeGreaterThan(0);
      expect(result.maxSafeLoad).toBeGreaterThanOrEqual(800);
    });

    it("handles heavy industrial oversized load (96x60 @ 3500 lbs)", () => {
      const result = calculatePallet({
        productLength: 94,
        productWidth: 58,
        productHeight: 40,
        productWeight: 3500,
        palletStyle: "Heavy-Duty Skid",
        deckboardNominal: "1x6",
        stringerNominal: "4x4",
        lengthAllowance: 2.0,
        widthAllowance: 2.0,
      });

      expect(result.palletDimensions.length).toBe(96);
      expect(result.palletDimensions.width).toBe(60);
      expect(result.stringerCount).toBe(5);
      // Heavy skid has no bottom deckboards
      expect(result.bottomDeckboardCount).toBe(0);
      expect(result.maxSafeLoad).toBeGreaterThanOrEqual(3500);
    });
  });
});
