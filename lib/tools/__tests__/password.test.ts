import { describe, expect, it } from "vitest";
import {
  estimatePasswordStrength,
  generatePassword,
  type PasswordOptions,
  type RandomIntegerSource,
} from "@/lib/tools/password";

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};

function deterministicSource(): RandomIntegerSource {
  let value = 0;
  return (maximumExclusive) => {
    const result = value % maximumExclusive;
    value += 7;
    return result;
  };
}

describe("password generator engine", () => {
  it("generates the requested length and includes every enabled group", () => {
    const result = generatePassword(DEFAULT_OPTIONS, deterministicSource());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.password).toHaveLength(20);
      expect(result.password).toMatch(/[a-z]/);
      expect(result.password).toMatch(/[A-Z]/);
      expect(result.password).toMatch(/[0-9]/);
      expect(result.password).toMatch(/[!@#$%^&*()\-_=+\[\]{};:,.?]/);
      expect(result.entropyBits).toBeGreaterThan(100);
      expect(result.strength).toBe("very-strong");
    }
  });

  it.each([
    ["includeLowercase", /^[a-z]+$/],
    ["includeUppercase", /^[A-Z]+$/],
    ["includeNumbers", /^[0-9]+$/],
    ["includeSymbols", /^[!@#$%^&*()\-_=+\[\]{};:,.?]+$/],
  ] as const)("supports the %s group by itself", (enabledOption, pattern) => {
    const options: PasswordOptions = {
      ...DEFAULT_OPTIONS,
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false,
      [enabledOption]: true,
    };
    const result = generatePassword(options, deterministicSource());
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(pattern);
  });

  it("removes ambiguous characters when requested", () => {
    const result = generatePassword(
      { ...DEFAULT_OPTIONS, length: 128, excludeAmbiguous: true },
      deterministicSource()
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).not.toMatch(/[Il1O0o]/);
  });

  it.each([3, 3.5, 129, Number.NaN])("rejects invalid length %s", (length) => {
    expect(generatePassword({ ...DEFAULT_OPTIONS, length })).toMatchObject({
      success: false,
      code: "INVALID_LENGTH",
    });
  });

  it("rejects a configuration without character groups", () => {
    expect(
      generatePassword({
        ...DEFAULT_OPTIONS,
        includeLowercase: false,
        includeUppercase: false,
        includeNumbers: false,
        includeSymbols: false,
      })
    ).toMatchObject({ success: false, code: "NO_CHARACTER_SET" });
  });

  it("handles a failing or invalid secure random source safely", () => {
    expect(generatePassword(DEFAULT_OPTIONS, () => -1)).toMatchObject({
      success: false,
      code: "RANDOM_UNAVAILABLE",
    });
    expect(
      generatePassword(DEFAULT_OPTIONS, () => {
        throw new Error("unavailable");
      })
    ).toMatchObject({ success: false, code: "RANDOM_UNAVAILABLE" });
  });

  it("classifies estimated strength at every boundary", () => {
    expect(estimatePasswordStrength(4, 10).strength).toBe("weak");
    expect(estimatePasswordStrength(13, 10).strength).toBe("fair");
    expect(estimatePasswordStrength(20, 10).strength).toBe("strong");
    expect(estimatePasswordStrength(32, 10).strength).toBe("very-strong");
  });

  it("does not mutate the supplied options", () => {
    const options = { ...DEFAULT_OPTIONS };
    generatePassword(options, deterministicSource());
    expect(options).toEqual(DEFAULT_OPTIONS);
  });
});
