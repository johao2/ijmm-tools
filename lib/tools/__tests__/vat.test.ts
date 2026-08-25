import { describe, expect, it } from "vitest";
import {
  calculateEcuadorVat,
  ECUADOR_GENERAL_VAT_RATE,
  formatUsd,
  MAX_VAT_AMOUNT_CENTS,
} from "@/lib/tools/vat";

describe("Ecuador VAT calculator engine", () => {
  it("uses the verified 15% general rate by default", () => {
    expect(ECUADOR_GENERAL_VAT_RATE).toBe("15");
    expect(calculateEcuadorVat("100")).toEqual({
      success: true,
      mode: "add",
      rate: "15",
      subtotalCents: 10_000,
      vatCents: 1_500,
      totalCents: 11_500,
      subtotalFormatted: "$100.00",
      vatFormatted: "$15.00",
      totalFormatted: "$115.00",
    });
  });

  it("extracts 15% VAT from a tax-inclusive total", () => {
    expect(calculateEcuadorVat("115.00", "15", "extract")).toMatchObject({
      success: true,
      subtotalCents: 10_000,
      vatCents: 1_500,
      totalCents: 11_500,
    });
  });

  it("rounds extracted VAT to cents while preserving the entered total", () => {
    expect(calculateEcuadorVat("100", "15", "extract")).toMatchObject({
      success: true,
      subtotalCents: 8_696,
      vatCents: 1_304,
      totalCents: 10_000,
    });
  });

  it.each([
    ["5", 500, 10_500],
    ["8", 800, 10_800],
    ["13", 1_300, 11_300],
    ["0", 0, 10_000],
  ])("calculates the selectable %s%% rate", (rate, vatCents, totalCents) => {
    expect(calculateEcuadorVat("100", rate, "add")).toMatchObject({
      success: true,
      vatCents,
      totalCents,
    });
  });

  it("accepts comma decimals and normalizes custom rate precision", () => {
    expect(calculateEcuadorVat("10,50", "12,3456", "add")).toMatchObject({
      success: true,
      rate: "12.3456",
      subtotalCents: 1_050,
      vatCents: 130,
      totalCents: 1_180,
    });
  });

  it("rounds half of a cent upward", () => {
    expect(calculateEcuadorVat("0.10", "5", "add")).toMatchObject({
      success: true,
      vatCents: 1,
      totalCents: 11,
    });
  });

  it.each(["", " "])("rejects empty amount %j", (amount) => {
    expect(calculateEcuadorVat(amount)).toMatchObject({
      success: false,
      code: "EMPTY_AMOUNT",
    });
  });

  it.each(["abc", "1.234", "1,2,3", "1e3", ".50"])(
    "rejects malformed amount %s",
    (amount) => {
      expect(calculateEcuadorVat(amount)).toMatchObject({
        success: false,
        code: "INVALID_AMOUNT",
      });
    }
  );

  it("rejects negative amounts", () => {
    expect(calculateEcuadorVat("-1")).toMatchObject({
      success: false,
      code: "NEGATIVE_AMOUNT",
    });
  });

  it.each(["", "-1", "100.0001", "101", "abc"])(
    "rejects invalid VAT rate %j",
    (rate) => {
      expect(calculateEcuadorVat("100", rate)).toMatchObject({
        success: false,
        code: "INVALID_RATE",
      });
    }
  );

  it("rejects amounts above the product safety limit", () => {
    const excessiveDollars = Math.floor(MAX_VAT_AMOUNT_CENTS / 100) + 1;
    expect(calculateEcuadorVat(excessiveDollars.toString())).toMatchObject({
      success: false,
      code: "AMOUNT_TOO_LARGE",
    });
  });

  it("formats large USD cent amounts deterministically", () => {
    expect(formatUsd(123_456_789)).toBe("$1,234,567.89");
  });
});
