/**
 * Conversión de números enteros entre bases 2 a 36 con BigInt (sin pérdida de precisión).
 */

export const COMMON_BASES = [
  { base: 2, name: "Binario" },
  { base: 8, name: "Octal" },
  { base: 10, name: "Decimal" },
  { base: 16, name: "Hexadecimal" },
] as const;

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

export type BaseConversionResult =
  | { success: true; decimal: string; conversions: { base: number; name: string; value: string }[] }
  | { success: false; message: string };

/** Interpreta `value` en la base `fromBase`. Acepta prefijos 0b, 0o, 0x y separadores (espacios, _). */
export function parseInBase(value: string, fromBase: number): bigint | null {
  if (!Number.isInteger(fromBase) || fromBase < 2 || fromBase > 36) return null;
  let clean = value.trim().toLowerCase().replace(/[\s_]/g, "");
  let negative = false;
  if (clean.startsWith("-")) {
    negative = true;
    clean = clean.slice(1);
  }
  const prefixes: Record<number, string> = { 2: "0b", 8: "0o", 16: "0x" };
  if (prefixes[fromBase] && clean.startsWith(prefixes[fromBase])) clean = clean.slice(2);
  if (!clean) return null;
  const big = BigInt(fromBase);
  let result = BigInt(0);
  for (const char of clean) {
    const digit = DIGITS.indexOf(char);
    if (digit < 0 || digit >= fromBase) return null;
    result = result * big + BigInt(digit);
  }
  return negative ? -result : result;
}

export function toBase(value: bigint, base: number): string {
  if (value === BigInt(0)) return "0";
  const negative = value < BigInt(0);
  let n = negative ? -value : value;
  const big = BigInt(base);
  let out = "";
  while (n > BigInt(0)) {
    out = DIGITS[Number(n % big)] + out;
    n /= big;
  }
  return (negative ? "-" : "") + out.toUpperCase();
}

export function convertBase(value: string, fromBase: number, extraBase?: number): BaseConversionResult {
  if (!value.trim()) return { success: false, message: "Escribe un número." };
  const parsed = parseInBase(value, fromBase);
  if (parsed === null) {
    return { success: false, message: `"${value.trim()}" no es un número entero válido en base ${fromBase}.` };
  }
  const bases: { base: number; name: string }[] = COMMON_BASES.map((b) => ({ base: b.base, name: b.name }));
  if (extraBase && !bases.some((b) => b.base === extraBase)) {
    if (!Number.isInteger(extraBase) || extraBase < 2 || extraBase > 36) {
      return { success: false, message: "La base personalizada debe estar entre 2 y 36." };
    }
    bases.push({ base: extraBase, name: `Base ${extraBase}` });
  }
  return {
    success: true,
    decimal: parsed.toString(),
    conversions: bases.map(({ base, name }) => ({ base, name, value: toBase(parsed, base) })),
  };
}

/** Agrupa los dígitos de un binario de 4 en 4 para facilitar la lectura. */
export function groupBinary(binary: string): string {
  const negative = binary.startsWith("-");
  const digits = negative ? binary.slice(1) : binary;
  const padded = digits.padStart(Math.ceil(digits.length / 4) * 4, "0");
  return (negative ? "-" : "") + (padded.match(/.{1,4}/g) ?? []).join(" ");
}
