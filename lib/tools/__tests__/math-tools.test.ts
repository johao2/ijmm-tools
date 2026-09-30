import { describe, expect, it } from "vitest";
import { ruleOfThree } from "@/lib/tools/rule-of-three";
import { convertBase, groupBinary, parseInBase, toBase } from "@/lib/tools/number-base";
import { describe as describeStats, parseNumberList, quantile } from "@/lib/tools/statistics";

describe("ruleOfThree", () => {
  it("resuelve la regla de tres directa", () => {
    // 3 cuadernos cuestan $6 → 5 cuadernos cuestan $10
    expect(ruleOfThree(3, 6, 5, "direct")).toMatchObject({ success: true, result: 10 });
  });

  it("resuelve la regla de tres inversa", () => {
    // 4 obreros tardan 6 días → 8 obreros tardan 3 días
    expect(ruleOfThree(4, 6, 8, "inverse")).toMatchObject({ success: true, result: 3 });
  });

  it("maneja decimales sin errores de coma flotante visibles", () => {
    const r = ruleOfThree(0.1, 0.2, 0.3, "direct");
    expect(r).toMatchObject({ success: true, result: 0.6 });
  });

  it("evita la división entre cero", () => {
    expect(ruleOfThree(0, 5, 3, "direct").success).toBe(false);
    expect(ruleOfThree(2, 5, 0, "inverse").success).toBe(false);
    expect(ruleOfThree(Number.NaN, 1, 1).success).toBe(false);
  });

  it("acepta negativos", () => {
    expect(ruleOfThree(2, -4, 3, "direct")).toMatchObject({ success: true, result: -6 });
  });
});

describe("number-base", () => {
  it("convierte decimal a binario, octal y hexadecimal", () => {
    const r = convertBase("255", 10);
    expect(r.success && r.conversions.map((c) => c.value)).toEqual(["11111111", "377", "255", "FF"]);
  });

  it("acepta prefijos, minúsculas y separadores", () => {
    expect(parseInBase("0xff", 16)).toBe(BigInt(255));
    expect(parseInBase("1111_0000", 2)).toBe(BigInt(240));
    expect(parseInBase("0b101", 2)).toBe(BigInt(5));
  });

  it("maneja números muy grandes sin perder precisión", () => {
    const r = convertBase("123456789012345678901234567890", 10);
    expect(r.success && r.conversions[3].value).toBe("18EE90FF6C373E0EE4E3F0AD2");
  });

  it("maneja cero y negativos", () => {
    expect(toBase(BigInt(0), 2)).toBe("0");
    expect(convertBase("-10", 10)).toMatchObject({ success: true, decimal: "-10" });
  });

  it("rechaza dígitos no válidos para la base", () => {
    expect(convertBase("102", 2).success).toBe(false);
    expect(convertBase("G1", 16).success).toBe(false);
    expect(convertBase("", 10).success).toBe(false);
    expect(convertBase("10", 10, 40).success).toBe(false);
  });

  it("agrega una base personalizada", () => {
    const r = convertBase("35", 10, 36);
    expect(r.success && r.conversions.find((c) => c.base === 36)?.value).toBe("Z");
  });

  it("agrupa binarios de 4 en 4", () => {
    expect(groupBinary("101101")).toBe("0010 1101");
  });
});

describe("statistics", () => {
  it("interpreta listas con coma decimal o con coma como separador", () => {
    expect(parseNumberList("3,5; 4,2; 5").values).toEqual([3.5, 4.2, 5]);
    expect(parseNumberList("3.5, 4.2, 5").values).toEqual([3.5, 4.2, 5]);
    expect(parseNumberList("1 2 3\n4").values).toEqual([1, 2, 3, 4]);
    expect(parseNumberList("1, x, 3").invalid).toEqual(["x"]);
    expect(parseNumberList("").values).toEqual([]);
  });

  it("calcula medidas de tendencia central y dispersión", () => {
    const r = describeStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.stats).toMatchObject({ count: 8, sum: 40, mean: 5, median: 4.5, modes: [4], min: 2, max: 9, range: 7, populationVariance: 4, populationStdDev: 2 });
    expect(r.stats.sampleVariance).toBeCloseTo(4.571429, 5);
  });

  it("calcula cuartiles como CUARTIL.INC de Excel", () => {
    expect(quantile([1, 2, 3, 4, 5, 6, 7, 8], 0.25)).toBe(2.75);
    expect(quantile([1, 2, 3, 4, 5, 6, 7, 8], 0.75)).toBe(6.25);
  });

  it("detecta varias modas y la ausencia de moda", () => {
    const multi = describeStats([1, 1, 2, 2, 3]);
    expect(multi.success && multi.stats.modes).toEqual([1, 2]);
    const none = describeStats([1, 2, 3]);
    expect(none.success && none.stats.modes).toEqual([]);
    const uniform = describeStats([1, 1, 2, 2]);
    expect(uniform.success && uniform.stats.modes).toEqual([]);
  });

  it("maneja un solo dato, media cero y lista vacía", () => {
    const one = describeStats([5]);
    expect(one.success && one.stats).toMatchObject({ mean: 5, sampleVariance: 0, q1: 5 });
    const zero = describeStats([-1, 1]);
    expect(zero.success && zero.stats.coefficientOfVariation).toBeNull();
    expect(describeStats([]).success).toBe(false);
  });
});
