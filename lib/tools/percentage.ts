/**
 * Pure Mathematical Domain Logic for Percentage Calculator
 * 
 * Guarantees:
 * - 100% Framework Independent (No React, DOM, fetch, or side effects).
 * - Strongly typed input/output using discriminated unions.
 * - Zero silent NaNs, Infinities, or unhandled zero-divisions.
 * - Configured floating-point rounding precision.
 */

export type CalculationErrorCode =
  | "INVALID_INPUT"
  | "DIVISION_BY_ZERO"
  | "NON_FINITE_RESULT"
  | "MATHEMATICALLY_INVALID";

export interface CalculationSuccess {
  success: true;
  value: number;
  formatted: string;
  metadata?: Record<string, unknown>;
}

export interface CalculationError {
  success: false;
  error: string;
  code: CalculationErrorCode;
}

export type CalculationResult = CalculationSuccess | CalculationError;

/**
 * Standard rounding precision helper for floating-point calculations.
 * Avoids IEEE 754 precision glitches like 0.30000000000000004.
 */
export function roundToPrecision(value: number, decimals: number = 6): number {
  if (!Number.isFinite(value)) return value;
  const factor = Math.pow(10, decimals);
  const scaledValue = value * factor;

  // Preserve large finite values when scaling would overflow.
  if (!Number.isFinite(scaledValue)) return value;

  const epsilon = value >= 0 ? Number.EPSILON : -Number.EPSILON;
  return Math.round((value + epsilon) * factor) / factor;
}

/**
 * Formats a numeric result cleanly:
 * Up to 4 decimal places, stripping trailing zeros.
 */
export function formatNumericResult(value: number): string {
  const rounded = roundToPrecision(value, 4);
  // Convert to string without trailing decimal zeros
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
    useGrouping: false,
  }).format(rounded);
}

/**
 * Input sanitizer and finite number validator.
 */
export function validateInputNumber(val: unknown): number | null {
  if (
    val === null ||
    val === undefined ||
    (typeof val === "string" && val.trim() === "")
  ) {
    return null;
  }
  const num = typeof val === "number" ? val : Number(val);
  if (typeof num !== "number" || isNaN(num) || !Number.isFinite(num)) {
    return null;
  }
  return num;
}

/**
 * Helper to construct a standard CalculationSuccess result.
 */
function createSuccess(value: number, metadata?: Record<string, unknown>): CalculationSuccess {
  const roundedValue = roundToPrecision(value, 6);
  if (!Number.isFinite(roundedValue)) {
    throw new RangeError("A successful calculation must have a finite result.");
  }
  return {
    success: true,
    value: roundedValue,
    formatted: formatNumericResult(roundedValue),
    metadata,
  };
}

/**
 * Helper to construct a standard CalculationError result.
 */
function createError(error: string, code: CalculationErrorCode): CalculationError {
  return {
    success: false,
    error,
    code,
  };
}

/**
 * Mode 1: Calculate percentage of a value.
 * Question: What is X% of Y?
 * Formula: Y * (X / 100)
 */
export function calculatePercentageOf(percentage: number, total: number): CalculationResult {
  const p = validateInputNumber(percentage);
  const t = validateInputNumber(total);

  if (p === null || t === null) {
    return createError("Please enter valid finite numbers for percentage and total.", "INVALID_INPUT");
  }

  const result = t * (p / 100);

  if (!Number.isFinite(result)) {
    return createError("The calculated result exceeds finite number limits.", "NON_FINITE_RESULT");
  }

  return createSuccess(result);
}

/**
 * Mode 2: Calculate what percentage one value is of another.
 * Question: X is what percentage of Y?
 * Formula: (X / Y) * 100
 */
export function calculateWhatPercentage(part: number, whole: number): CalculationResult {
  const p = validateInputNumber(part);
  const w = validateInputNumber(whole);

  if (p === null || w === null) {
    return createError("Please enter valid finite numbers for part and total.", "INVALID_INPUT");
  }

  if (w === 0) {
    return createError("Cannot calculate percentage when the total (whole) is zero.", "DIVISION_BY_ZERO");
  }

  const result = (p / w) * 100;

  if (!Number.isFinite(result)) {
    return createError("The calculated percentage exceeds finite number limits.", "NON_FINITE_RESULT");
  }

  return createSuccess(result);
}

/**
 * Mode 3: Calculate percentage increase from original to new value.
 * Question: What is the percentage increase from X to Y?
 * Formula: ((newValue - originalValue) / originalValue) * 100
 */
export function calculatePercentageIncrease(originalValue: number, newValue: number): CalculationResult {
  const orig = validateInputNumber(originalValue);
  const next = validateInputNumber(newValue);

  if (orig === null || next === null) {
    return createError("Please enter valid finite numbers for original and new values.", "INVALID_INPUT");
  }

  if (orig === 0) {
    return createError("Cannot calculate percentage increase when the original value is zero.", "DIVISION_BY_ZERO");
  }

  const result = ((next - orig) / orig) * 100;

  if (!Number.isFinite(result)) {
    return createError("The calculated percentage increase exceeds finite number limits.", "NON_FINITE_RESULT");
  }

  return createSuccess(result);
}

/**
 * Mode 4: Calculate percentage decrease from original to new value.
 * Question: What is the percentage decrease from X to Y?
 * Formula: ((originalValue - newValue) / originalValue) * 100
 */
export function calculatePercentageDecrease(originalValue: number, newValue: number): CalculationResult {
  const orig = validateInputNumber(originalValue);
  const next = validateInputNumber(newValue);

  if (orig === null || next === null) {
    return createError("Please enter valid finite numbers for original and new values.", "INVALID_INPUT");
  }

  if (orig === 0) {
    return createError("Cannot calculate percentage decrease when the original value is zero.", "DIVISION_BY_ZERO");
  }

  const result = ((orig - next) / orig) * 100;

  if (!Number.isFinite(result)) {
    return createError("The calculated percentage decrease exceeds finite number limits.", "NON_FINITE_RESULT");
  }

  return createSuccess(result);
}

/**
 * Mode 5: Calculate percentage difference between two values.
 * Question: What is the percentage difference between X and Y?
 * Formula: |value1 - value2| / ((|value1| + |value2|) / 2) * 100
 */
export function calculatePercentageDifference(value1: number, value2: number): CalculationResult {
  const v1 = validateInputNumber(value1);
  const v2 = validateInputNumber(value2);

  if (v1 === null || v2 === null) {
    return createError("Please enter valid finite numbers for both values.", "INVALID_INPUT");
  }

  const denominator = (Math.abs(v1) + Math.abs(v2)) / 2;

  if (denominator === 0) {
    return createError("Percentage difference is undefined when both values are zero.", "DIVISION_BY_ZERO");
  }

  const numerator = Math.abs(v1 - v2);
  const result = (numerator / denominator) * 100;

  if (!Number.isFinite(result)) {
    return createError("The calculated percentage difference exceeds finite number limits.", "NON_FINITE_RESULT");
  }

  return createSuccess(result);
}

/**
 * Mode 6: Calculate original value before a percentage increase or decrease.
 * Question: Find original value given final value and percentage change.
 * Formulas:
 *   Increase: originalValue = finalValue / (1 + percentageChange / 100)
 *   Decrease: originalValue = finalValue / (1 - percentageChange / 100)
 */
export function calculateOriginalValue(
  finalValue: number,
  percentageChange: number,
  changeType: "increase" | "decrease"
): CalculationResult {
  const finalVal = validateInputNumber(finalValue);
  const change = validateInputNumber(percentageChange);

  if (finalVal === null || change === null) {
    return createError("Please enter valid finite numbers for final value and percentage change.", "INVALID_INPUT");
  }

  if (changeType !== "increase" && changeType !== "decrease") {
    return createError("Change type must be explicitly 'increase' or 'decrease'.", "INVALID_INPUT");
  }

  let denominator: number;
  if (changeType === "increase") {
    denominator = 1 + change / 100;
  } else {
    denominator = 1 - change / 100;
  }

  if (denominator === 0) {
    return createError(`Cannot calculate original value when ${changeType} percentage causes zero-denominator.`, "DIVISION_BY_ZERO");
  }

  const result = finalVal / denominator;

  if (!Number.isFinite(result)) {
    return createError("The calculated original value exceeds finite number limits.", "NON_FINITE_RESULT");
  }

  return createSuccess(result, { changeType, percentageChange: change });
}

/**
 * Mode 7 (Bonus Utility): Discount calculation.
 * Inputs: original price and discount percentage.
 * Returns final price and discount amount.
 */
export interface DiscountResultMetadata {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
}

export function calculateDiscount(
  originalPrice: number,
  discountPercentage: number
): CalculationResult {
  const price = validateInputNumber(originalPrice);
  const disc = validateInputNumber(discountPercentage);

  if (price === null || disc === null) {
    return createError("Please enter valid finite numbers for price and discount percentage.", "INVALID_INPUT");
  }

  if (price < 0) {
    return createError("Original price cannot be negative for discount calculation.", "MATHEMATICALLY_INVALID");
  }

  const discountAmount = price * (disc / 100);
  const finalPrice = price - discountAmount;

  if (!Number.isFinite(discountAmount) || !Number.isFinite(finalPrice)) {
    return createError("The discount calculation exceeds finite number limits.", "NON_FINITE_RESULT");
  }

  return createSuccess(finalPrice, {
    originalPrice: price,
    discountPercentage: disc,
    discountAmount: roundToPrecision(discountAmount, 4),
    finalPrice: roundToPrecision(finalPrice, 4),
  });
}
