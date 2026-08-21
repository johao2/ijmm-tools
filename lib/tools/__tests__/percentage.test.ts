import { describe, it, expect } from "vitest";
import {
  calculatePercentageOf,
  calculateWhatPercentage,
  calculatePercentageIncrease,
  calculatePercentageDecrease,
  calculatePercentageDifference,
  calculateOriginalValue,
  calculateDiscount,
  roundToPrecision,
  formatNumericResult,
  validateInputNumber,
  CalculationSuccess,
  CalculationError,
} from "../percentage";

describe("Percentage Calculator Pure Domain Engine", () => {
  // Helper to assert success
  function assertSuccess(result: unknown): asserts result is CalculationSuccess {
    expect((result as CalculationSuccess).success).toBe(true);
  }

  // Helper to assert error
  function assertError(result: unknown): asserts result is CalculationError {
    expect((result as CalculationError).success).toBe(false);
  }

  describe("Utility & Precision Helpers", () => {
    it("should round floating point numbers to specified precision without JS precision bugs", () => {
      expect(roundToPrecision(0.1 + 0.2, 4)).toBe(0.3);
      expect(roundToPrecision(12.3456789, 4)).toBe(12.3457);
    });

    it("should format numeric results cleanly without trailing zeros", () => {
      expect(formatNumericResult(30)).toBe("30");
      expect(formatNumericResult(12.5)).toBe("12.5");
      expect(formatNumericResult(66.666666)).toBe("66.6667");
      expect(formatNumericResult(0)).toBe("0");
    });

    it("should validate and sanitize numeric inputs", () => {
      expect(validateInputNumber(15)).toBe(15);
      expect(validateInputNumber("250")).toBe(250);
      expect(validateInputNumber(0)).toBe(0);
      expect(validateInputNumber("-45.5")).toBe(-45.5);
      expect(validateInputNumber("")).toBeNull();
      expect(validateInputNumber(NaN)).toBeNull();
      expect(validateInputNumber(Infinity)).toBeNull();
      expect(validateInputNumber(undefined)).toBeNull();
    });
  });

  describe("Mode 1: calculatePercentageOf (What is X% of Y?)", () => {
    it("should calculate standard integer percentage of a number", () => {
      const res = calculatePercentageOf(20, 150);
      assertSuccess(res);
      expect(res.value).toBe(30);
      expect(res.formatted).toBe("30");
    });

    it("should calculate decimal percentages accurately", () => {
      const res = calculatePercentageOf(12.5, 250);
      assertSuccess(res);
      expect(res.value).toBe(31.25);
      expect(res.formatted).toBe("31.25");
    });

    it("should handle zero total correctly", () => {
      const res = calculatePercentageOf(15, 0);
      assertSuccess(res);
      expect(res.value).toBe(0);
      expect(res.formatted).toBe("0");
    });

    it("should handle zero percentage correctly", () => {
      const res = calculatePercentageOf(0, 250);
      assertSuccess(res);
      expect(res.value).toBe(0);
    });

    it("should handle negative percentage and total correctly", () => {
      const res1 = calculatePercentageOf(-20, 150);
      assertSuccess(res1);
      expect(res1.value).toBe(-30);

      const res2 = calculatePercentageOf(20, -150);
      assertSuccess(res2);
      expect(res2.value).toBe(-30);

      const res3 = calculatePercentageOf(-20, -150);
      assertSuccess(res3);
      expect(res3.value).toBe(30);
    });

    it("should handle large numbers without overflow", () => {
      const res = calculatePercentageOf(15, 1_000_000_000_000);
      assertSuccess(res);
      expect(res.value).toBe(150_000_000_000);
    });

    it("should return INVALID_INPUT error for invalid inputs", () => {
      const res = calculatePercentageOf(NaN, 100);
      assertError(res);
      expect(res.code).toBe("INVALID_INPUT");
    });
  });

  describe("Mode 2: calculateWhatPercentage (X is what % of Y?)", () => {
    it("should calculate percentage relationship between two numbers", () => {
      const res = calculateWhatPercentage(30, 150);
      assertSuccess(res);
      expect(res.value).toBe(20);
      expect(res.formatted).toBe("20");
    });

    it("should handle decimal inputs", () => {
      const res = calculateWhatPercentage(25, 200);
      assertSuccess(res);
      expect(res.value).toBe(12.5);
      expect(res.formatted).toBe("12.5");
    });

    it("should explicitly return DIVISION_BY_ZERO error when whole is 0", () => {
      const res = calculateWhatPercentage(25, 0);
      assertError(res);
      expect(res.code).toBe("DIVISION_BY_ZERO");
      expect(res.error).toContain("zero");
    });

    it("should handle zero part correctly", () => {
      const res = calculateWhatPercentage(0, 150);
      assertSuccess(res);
      expect(res.value).toBe(0);
    });

    it("should handle negative values", () => {
      const res = calculateWhatPercentage(-30, 150);
      assertSuccess(res);
      expect(res.value).toBe(-20);
    });
  });

  describe("Mode 3: calculatePercentageIncrease (Percentage increase from A to B)", () => {
    it("should calculate standard percentage increase", () => {
      const res = calculatePercentageIncrease(100, 120);
      assertSuccess(res);
      expect(res.value).toBe(20);
      expect(res.formatted).toBe("20");
    });

    it("should handle decimal values", () => {
      const res = calculatePercentageIncrease(100, 125.5);
      assertSuccess(res);
      expect(res.value).toBe(25.5);
    });

    it("should explicitly return DIVISION_BY_ZERO error when original is 0", () => {
      const res = calculatePercentageIncrease(0, 50);
      assertError(res);
      expect(res.code).toBe("DIVISION_BY_ZERO");
    });

    it("should return negative percentage for a drop in value", () => {
      const res = calculatePercentageIncrease(100, 80);
      assertSuccess(res);
      expect(res.value).toBe(-20);
    });
  });

  describe("Mode 4: calculatePercentageDecrease (Percentage decrease from A to B)", () => {
    it("should calculate standard percentage decrease", () => {
      const res = calculatePercentageDecrease(100, 80);
      assertSuccess(res);
      expect(res.value).toBe(20);
      expect(res.formatted).toBe("20");
    });

    it("should handle decimal values", () => {
      const res = calculatePercentageDecrease(200, 150);
      assertSuccess(res);
      expect(res.value).toBe(25);
    });

    it("should explicitly return DIVISION_BY_ZERO error when original is 0", () => {
      const res = calculatePercentageDecrease(0, 50);
      assertError(res);
      expect(res.code).toBe("DIVISION_BY_ZERO");
    });
  });

  describe("Mode 5: calculatePercentageDifference (Percentage difference between A and B)", () => {
    it("should calculate percentage difference between two numbers", () => {
      const res = calculatePercentageDifference(10, 20);
      assertSuccess(res);
      expect(res.value).toBeCloseTo(66.666667, 4);
      expect(res.formatted).toBe("66.6667");
    });

    it("should return 0% difference for identical numbers", () => {
      const res = calculatePercentageDifference(50, 50);
      assertSuccess(res);
      expect(res.value).toBe(0);
      expect(res.formatted).toBe("0");
    });

    it("should explicitly return DIVISION_BY_ZERO error when both numbers are 0", () => {
      const res = calculatePercentageDifference(0, 0);
      assertError(res);
      expect(res.code).toBe("DIVISION_BY_ZERO");
    });

    it("should handle negative and positive values using absolute magnitudes", () => {
      const res = calculatePercentageDifference(-10, 10);
      assertSuccess(res);
      // | -10 - 10 | / (( |-10| + |10| ) / 2) * 100 = 20 / 10 * 100 = 200%
      expect(res.value).toBe(200);
    });
  });

  describe("Mode 6: calculateOriginalValue (Find original value given change)", () => {
    it("should calculate original value after an increase", () => {
      const res = calculateOriginalValue(120, 20, "increase");
      assertSuccess(res);
      expect(res.value).toBe(100);
      expect(res.formatted).toBe("100");
    });

    it("should calculate original value after a decrease", () => {
      const res = calculateOriginalValue(80, 20, "decrease");
      assertSuccess(res);
      expect(res.value).toBe(100);
      expect(res.formatted).toBe("100");
    });

    it("should return DIVISION_BY_ZERO when percentage decrease is 100%", () => {
      const res = calculateOriginalValue(50, 100, "decrease");
      assertError(res);
      expect(res.code).toBe("DIVISION_BY_ZERO");
    });

    it("should return DIVISION_BY_ZERO when percentage increase is -100%", () => {
      const res = calculateOriginalValue(50, -100, "increase");
      assertError(res);
      expect(res.code).toBe("DIVISION_BY_ZERO");
    });
  });

  describe("Mode 7: calculateDiscount (Store discount calculator)", () => {
    it("should calculate discount amount and final price", () => {
      const res = calculateDiscount(80, 20);
      assertSuccess(res);
      expect(res.value).toBe(64); // Final price
      expect(res.metadata?.discountAmount).toBe(16);
      expect(res.metadata?.finalPrice).toBe(64);
    });

    it("should return MATHEMATICALLY_INVALID for negative original price", () => {
      const res = calculateDiscount(-50, 20);
      assertError(res);
      expect(res.code).toBe("MATHEMATICALLY_INVALID");
    });
  });
});
