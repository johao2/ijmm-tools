/**
 * Regla de tres simple directa e inversa.
 * Directa:  a → b  así como  c → x   ⇒  x = (b · c) / a
 * Inversa:  a → b  así como  c → x   ⇒  x = (a · b) / c
 */

export type RuleOfThreeType = "direct" | "inverse";

export type RuleOfThreeResult =
  | { success: true; result: number; formula: string }
  | { success: false; message: string };

const fmt = (n: number) => Number(n.toPrecision(12)).toString();

export function ruleOfThree(a: number, b: number, c: number, type: RuleOfThreeType = "direct"): RuleOfThreeResult {
  if (![a, b, c].every(Number.isFinite)) return { success: false, message: "Ingresa tres valores numéricos válidos." };
  if (type === "direct") {
    if (a === 0) return { success: false, message: "En la regla de tres directa el primer valor (A) no puede ser 0." };
    const result = (b * c) / a;
    return { success: true, result: Number(result.toPrecision(12)), formula: `x = (${fmt(b)} × ${fmt(c)}) ÷ ${fmt(a)}` };
  }
  if (c === 0) return { success: false, message: "En la regla de tres inversa el tercer valor (C) no puede ser 0." };
  const result = (a * b) / c;
  return { success: true, result: Number(result.toPrecision(12)), formula: `x = (${fmt(a)} × ${fmt(b)}) ÷ ${fmt(c)}` };
}
