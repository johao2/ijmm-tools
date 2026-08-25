import { describe, expect, it } from "vitest";
import { MAX_JSON_INPUT_LENGTH, processJson } from "@/lib/tools/json";

describe("JSON formatter engine", () => {
  it("formats objects with two spaces", () => {
    expect(processJson('{"name":"IJMM","active":true}', "format")).toEqual({
      success: true,
      operation: "format",
      output: '{\n  "name": "IJMM",\n  "active": true\n}',
      stats: { characters: 38, bytes: 38, type: "object" },
    });
  });

  it("supports four spaces and tabs", () => {
    const fourSpaces = processJson('{"items":[1]}', "format", 4);
    const tabs = processJson('{"items":[1]}', "format", "\t");
    expect(fourSpaces.success && fourSpaces.output).toContain('    "items"');
    expect(tabs.success && tabs.output).toContain('\t"items"');
  });

  it("minifies nested JSON without changing its data", () => {
    const result = processJson('{ \n "items": [1, 2], "meta": { "ok": true } \n}', "minify");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toBe('{"items":[1,2],"meta":{"ok":true}}');
      expect(JSON.parse(result.output)).toEqual({ items: [1, 2], meta: { ok: true } });
    }
  });

  it.each([
    ["null", "null"],
    ["true", "boolean"],
    ['"texto"', "string"],
    ["-12.5e2", "number"],
    ["[]", "array"],
  ] as const)("validates the top-level value %s", (input, type) => {
    const result = processJson(input, "validate");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toBe(input);
      expect(result.stats.type).toBe(type);
    }
  });

  it("accepts a leading byte-order mark without mutating the source", () => {
    const source = '\uFEFF{"ok":true}';
    const result = processJson(source, "minify");
    expect(source).toBe('\uFEFF{"ok":true}');
    expect(result.success && result.output).toBe('{"ok":true}');
  });

  it("reports empty input", () => {
    expect(processJson("  \n\t", "format")).toMatchObject({
      success: false,
      code: "EMPTY_INPUT",
    });
  });

  it("reports invalid syntax and includes location when the runtime provides it", () => {
    const result = processJson('{\n  "name": "IJMM",\n  "active":,\n}', "format");
    expect(result).toMatchObject({ success: false, code: "INVALID_JSON" });
    if (!result.success) {
      if (result.line !== undefined) expect(result.line).toBeGreaterThanOrEqual(2);
      if (result.column !== undefined) expect(result.column).toBeGreaterThan(0);
    }
  });

  it("blocks unsafe integers instead of silently changing them", () => {
    const result = processJson('{"id":9007199254740993}', "format");
    expect(result).toMatchObject({
      success: false,
      code: "UNSAFE_INTEGER",
      line: 1,
    });
  });

  it("does not treat large digit strings as unsafe integers", () => {
    const result = processJson('{"id":"9007199254740993"}', "format");
    expect(result.success).toBe(true);
  });

  it("allows safe negative integers, decimals, and exponents", () => {
    const result = processJson('{"a":-42,"b":0.125,"c":1e20}', "minify");
    expect(result.success).toBe(true);
  });

  it("counts UTF-8 bytes separately from characters", () => {
    const result = processJson('"ñ"', "validate");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.stats.characters).toBe(3);
      expect(result.stats.bytes).toBe(4);
    }
  });

  it("rejects oversized input before parsing", () => {
    const result = processJson(`"${"a".repeat(MAX_JSON_INPUT_LENGTH)}"`, "validate");
    expect(result).toMatchObject({ success: false, code: "INPUT_TOO_LARGE" });
  });
});
