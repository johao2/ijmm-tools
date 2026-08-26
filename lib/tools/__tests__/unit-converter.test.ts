import { describe, expect, it } from "vitest";
import {
  UNIT_CATEGORIES,
  convertUnits,
  formatConvertedValue,
  getUnitCategory,
} from "@/lib/tools/unit-converter";

function expectValue(
  input: string,
  category: string,
  from: string,
  to: string,
  expected: number,
  precision = 10
) {
  const result = convertUnits(input, category, from, to);
  expect(result.success).toBe(true);
  if (result.success) expect(result.value).toBeCloseTo(expected, precision);
}

describe("unit converter catalog", () => {
  it("contains five unique categories with unique units", () => {
    expect(UNIT_CATEGORIES).toHaveLength(5);
    expect(new Set(UNIT_CATEGORIES.map((category) => category.id)).size).toBe(5);
    UNIT_CATEGORIES.forEach((category) => {
      expect(category.units.length).toBeGreaterThan(2);
      expect(new Set(category.units.map((unit) => unit.id)).size).toBe(category.units.length);
      expect(category.units.some((unit) => unit.id === category.baseUnitId)).toBe(true);
    });
  });

  it("retrieves a category safely", () => {
    expect(getUnitCategory("length")?.label).toBe("Longitud");
    expect(getUnitCategory("missing")).toBeUndefined();
  });
});

describe("linear unit conversions", () => {
  it("converts kilometers to meters", () => expectValue("2.5", "length", "kilometer", "meter", 2500));
  it("converts miles to kilometers", () => expectValue("1", "length", "mile", "kilometer", 1.609344));
  it("converts inches to centimeters", () => expectValue("12", "length", "inch", "centimeter", 30.48));
  it("converts pounds to kilograms", () => expectValue("10", "mass", "pound", "kilogram", 4.5359237));
  it("converts ounces to grams", () => expectValue("1", "mass", "ounce", "gram", 28.349523125));
  it("converts hectares to square meters", () => expectValue("3", "area", "hectare", "square-meter", 30000));
  it("converts acres to square meters", () => expectValue("1", "area", "acre", "square-meter", 4046.8564224));
  it("converts liters to US gallons", () => expectValue("3.785411784", "volume", "liter", "gallon-us", 1));
  it("converts cubic meters to liters", () => expectValue("1.25", "volume", "cubic-meter", "liter", 1250));
  it("preserves zero and same-unit values", () => expectValue("0", "length", "meter", "meter", 0));
  it("supports comma decimals and negative mathematical values", () => expectValue("-1,5", "length", "meter", "centimeter", -150));
});

describe("temperature conversions", () => {
  it("converts Celsius to Fahrenheit", () => expectValue("100", "temperature", "celsius", "fahrenheit", 212));
  it("converts Fahrenheit to Celsius", () => expectValue("32", "temperature", "fahrenheit", "celsius", 0));
  it("converts Celsius to Kelvin", () => expectValue("0", "temperature", "celsius", "kelvin", 273.15));
  it("converts absolute zero", () => expectValue("-459.67", "temperature", "fahrenheit", "kelvin", 0, 8));
  it("rejects a value below absolute zero", () => {
    expect(convertUnits("-274", "temperature", "celsius", "kelvin")).toMatchObject({
      success: false,
      code: "BELOW_ABSOLUTE_ZERO",
    });
  });
});

describe("validation and formatting", () => {
  it("rejects empty input", () => {
    expect(convertUnits(" ", "length", "meter", "foot")).toMatchObject({ success: false, code: "EMPTY_VALUE" });
  });

  it.each(["1.2.3", "12px", "NaN", "Infinity", "1,2,3"])("rejects malformed value %s", (input) => {
    expect(convertUnits(input, "length", "meter", "foot")).toMatchObject({ success: false, code: "INVALID_VALUE" });
  });

  it("rejects an unknown category", () => {
    expect(convertUnits("1", "unknown", "meter", "foot")).toMatchObject({ success: false, code: "INVALID_CATEGORY" });
  });

  it("rejects units outside the selected category", () => {
    expect(convertUnits("1", "length", "kilogram", "meter")).toMatchObject({ success: false, code: "INVALID_UNIT" });
  });

  it("rejects overflow results", () => {
    const huge = "9".repeat(308);
    expect(convertUnits(huge, "length", "kilometer", "millimeter")).toMatchObject({ success: false, code: "NON_FINITE_RESULT" });
  });

  it("formats grouping and controlled decimals", () => {
    expect(formatConvertedValue(12345.67890123456)).toBe("12,345.6789012346");
    expect(formatConvertedValue(-0)).toBe("0");
  });
});
