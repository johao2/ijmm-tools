/**
 * Números racionales exactos con BigInt: sin errores de redondeo de coma flotante.
 * Base de la calculadora de matrices y del resolvedor de ecuaciones.
 */

export interface Fraction {
  /** Numerador (lleva el signo) */
  n: bigint;
  /** Denominador, siempre > 0 */
  d: bigint;
}

const abs = (x: bigint) => (x < BigInt(0) ? -x : x);
const ZERO_N = BigInt(0);
const ONE_N = BigInt(1);

export function gcd(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b !== ZERO_N) [a, b] = [b, a % b];
  return a;
}

export function frac(n: bigint | number, d: bigint | number = 1): Fraction {
  let nn = BigInt(n);
  let dd = BigInt(d);
  if (dd === ZERO_N) throw new RangeError("Denominador cero");
  if (dd < ZERO_N) {
    nn = -nn;
    dd = -dd;
  }
  const g = gcd(nn, dd) || ONE_N;
  return { n: nn / g, d: dd / g };
}

export const ZERO = frac(0);
export const ONE = frac(1);

export const add = (a: Fraction, b: Fraction) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Fraction, b: Fraction) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Fraction, b: Fraction) => frac(a.n * b.n, a.d * b.d);
export const div = (a: Fraction, b: Fraction) => frac(a.n * b.d, a.d * b.n);
export const neg = (a: Fraction): Fraction => ({ n: -a.n, d: a.d });
export const isZero = (a: Fraction) => a.n === ZERO_N;
export const isInteger = (a: Fraction) => a.d === ONE_N;
export const sign = (a: Fraction) => (a.n > ZERO_N ? 1 : a.n < ZERO_N ? -1 : 0);
export const equals = (a: Fraction, b: Fraction) => a.n === b.n && a.d === b.d;

/**
 * Lee un número escrito por el usuario: entero, decimal (punto o coma) o fracción "a/b".
 * Devuelve null si el texto no es un número válido.
 */
export function parseFraction(text: string): Fraction | null {
  const t = text.trim().replace(",", ".");
  if (t.includes("/")) {
    const parts = t.split("/");
    if (parts.length !== 2) return null;
    const a = parseFraction(parts[0]);
    const b = parseFraction(parts[1]);
    if (!a || !b || isZero(b)) return null;
    return div(a, b);
  }
  const m = /^([+-])?(\d+)(?:\.(\d+))?$/.exec(t) ?? /^([+-])?()\.(\d+)$/.exec(t);
  if (!m) return null;
  const decimals = m[3] ?? "";
  const n = BigInt((m[2] || "0") + decimals) * (m[1] === "-" ? BigInt(-1) : ONE_N);
  return frac(n, BigInt(10) ** BigInt(decimals.length));
}

/** Fracción como texto: "3", "-3/4". */
export function toFractionString(a: Fraction): string {
  return a.d === ONE_N ? a.n.toString() : `${a.n}/${a.d}`;
}

/**
 * Valor decimal exacto truncado/redondeado a `digits` decimales (redondeo mitad lejos de cero),
 * sin ceros sobrantes. Calculado con enteros: no hay error de coma flotante.
 */
export function toDecimalString(a: Fraction, digits = 6): string {
  const scale = BigInt(10) ** BigInt(digits);
  const negative = a.n < ZERO_N;
  const num = abs(a.n) * scale;
  let q = num / a.d;
  if ((num % a.d) * BigInt(2) >= a.d) q += ONE_N;
  let s = q.toString().padStart(digits + 1, "0");
  const intPart = s.slice(0, s.length - digits);
  const decPart = s.slice(s.length - digits).replace(/0+$/, "");
  s = decPart ? `${intPart}.${decPart}` : intPart;
  return negative && s !== "0" ? `-${s}` : s;
}

/** Aproximación de coma flotante (solo para mostrar o graficar, nunca para calcular). */
export const toNumber = (a: Fraction) => Number(a.n) / Number(a.d);
