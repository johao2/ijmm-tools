/**
 * Ecuaciones de segundo grado y sistemas de ecuaciones lineales, en aritmética racional exacta.
 * Las raíces irracionales se expresan de forma exacta (a ± b√r) y con su valor decimal.
 */
import {
  add,
  div,
  frac,
  isInteger,
  isZero,
  mul,
  neg,
  sign,
  sub,
  toDecimalString,
  toFractionString,
  type Fraction,
} from "@/lib/tools/fraction";
import { cols, rref, type Matrix } from "@/lib/tools/matrix";

/** Número de la forma p + q·√r (con i si es imaginario), r entero libre de cuadrados. */
export interface RadicalNumber {
  rational: Fraction;
  coefficient: Fraction;
  radicand: bigint;
  imaginary: boolean;
}

export type QuadraticResult =
  | {
      success: true;
      kind: "two-real" | "double" | "complex" | "linear" | "identity" | "none";
      discriminant?: Fraction;
      roots: { exact: string; decimal: string }[];
      steps: string[];
    }
  | { success: false; message: string };

const ONE_N = BigInt(1);

/** Separa el mayor factor cuadrado: m = k²·r. Busca factores hasta 10⁶; el resultado siempre es exacto. */
export function simplifySqrt(m: bigint): { k: bigint; r: bigint } {
  let k = ONE_N;
  let r = m;
  for (let p = BigInt(2); p * p <= r && p < BigInt(1_000_000); p++) {
    const sq = p * p;
    while (r % sq === BigInt(0)) {
      r /= sq;
      k *= p;
    }
  }
  return { k, r };
}

/** Raíz cuadrada exacta de un racional ≥ 0 como coef·√r. */
function sqrtFraction(x: Fraction): { coefficient: Fraction; radicand: bigint } {
  // √(n/d) = √(n·d) / d
  const { k, r } = simplifySqrt(x.n * x.d);
  return { coefficient: frac(k, x.d), radicand: r };
}

const fmt = (f: Fraction) => toFractionString(f);
const dec = (f: Fraction) => toDecimalString(f, 10);

function radicalToString(p: Fraction, q: Fraction, r: bigint, imaginary: boolean, plus: boolean): string {
  const unit = imaginary ? "i" : "";
  const root = r === ONE_N ? unit : `√${r}${unit ? "·i" : ""}`;
  const qAbs = sign(q) < 0 ? neg(q) : q;
  const qText = qAbs.n === ONE_N && qAbs.d === ONE_N ? root || "1" : isInteger(qAbs) ? `${qAbs.n}${root}` : `(${fmt(qAbs)})${root}`;
  const op = plus === sign(q) >= 0 ? "+" : "−";
  return isZero(p) ? `${op === "−" ? "−" : ""}${qText}` : `${fmt(p)} ${op} ${qText}`;
}

/** Aproximación decimal de p ± q√r usando BigInt (√ con 20 decimales). */
function radicalDecimal(p: Fraction, q: Fraction, r: bigint, plus: boolean): string {
  const scale = BigInt(10) ** BigInt(20);
  const target = r * scale * scale;
  // raíz entera por Newton
  let x = target;
  let y = (x + ONE_N) / BigInt(2);
  while (y < x) {
    x = y;
    y = (x + target / x) / BigInt(2);
  }
  const sqrtR = frac(x, scale);
  const term = mul(q, sqrtR);
  return dec(plus ? add(p, term) : sub(p, term));
}

/** Resuelve a·x² + b·x + c = 0 con coeficientes racionales exactos. */
export function solveQuadratic(a: Fraction, b: Fraction, c: Fraction): QuadraticResult {
  if (isZero(a)) {
    if (isZero(b)) {
      return isZero(c)
        ? { success: true, kind: "identity", roots: [], steps: ["a = 0, b = 0 y c = 0: la igualdad 0 = 0 se cumple para todo x (infinitas soluciones)."] }
        : { success: true, kind: "none", roots: [], steps: [`a = 0 y b = 0: queda ${fmt(c)} = 0, que es falso. No hay solución.`] };
    }
    const x = div(neg(c), b);
    return {
      success: true,
      kind: "linear",
      roots: [{ exact: fmt(x), decimal: dec(x) }],
      steps: ["a = 0: la ecuación es lineal, b·x + c = 0.", `x = −c ÷ b = ${fmt(neg(c))} ÷ ${fmt(b)} = ${fmt(x)}`],
    };
  }
  const D = sub(mul(b, b), mul(frac(4), mul(a, c)));
  const twoA = mul(frac(2), a);
  const p = div(neg(b), twoA);
  const steps = [`Discriminante: Δ = b² − 4ac = (${fmt(b)})² − 4·(${fmt(a)})·(${fmt(c)}) = ${fmt(D)}`];

  if (isZero(D)) {
    steps.push("Δ = 0: una raíz real doble.", `x = −b ÷ 2a = ${fmt(p)}`);
    return { success: true, kind: "double", discriminant: D, roots: [{ exact: fmt(p), decimal: dec(p) }], steps };
  }
  const imaginary = sign(D) < 0;
  const { coefficient, radicand } = sqrtFraction(imaginary ? neg(D) : D);
  const q = div(coefficient, twoA);
  steps.push(imaginary ? "Δ < 0: dos raíces complejas conjugadas." : "Δ > 0: dos raíces reales distintas.", "x = (−b ± √Δ) ÷ 2a");

  const roots = [true, false].map((plus) => {
    if (!imaginary && radicand === ONE_N) {
      const v = plus ? add(p, q) : sub(p, q);
      return { exact: fmt(v), decimal: dec(v) };
    }
    const exact = radicalToString(p, q, radicand, imaginary, plus);
    if (imaginary) {
      const im = radicand === ONE_N ? dec(sign(q) < 0 ? neg(q) : q) : radicalDecimal(frac(0), sign(q) < 0 ? neg(q) : q, radicand, true);
      const signText = plus ? "+" : "−";
      return { exact, decimal: `${dec(p)} ${signText} ${im}i` };
    }
    return { exact, decimal: radicalDecimal(p, q, radicand, plus) };
  });
  return { success: true, kind: imaginary ? "complex" : "two-real", discriminant: D, roots, steps };
}

export type LinearSystemResult =
  | { success: true; kind: "unique"; values: Fraction[]; rank: number }
  | { success: true; kind: "infinite"; expressions: string[]; free: number[]; rank: number }
  | { success: true; kind: "none"; rank: number; augmentedRank: number }
  | { success: false; message: string };

/**
 * Resuelve un sistema lineal a partir de su matriz aumentada [A | b] (la última columna son los términos independientes).
 * Clasifica según el teorema de Rouché-Frobenius.
 */
export function solveLinearSystem(augmented: Matrix, names?: string[]): LinearSystemResult {
  const n = cols(augmented) - 1;
  if (n < 1) return { success: false, message: "Cada ecuación necesita al menos un coeficiente y el término independiente." };
  const vars = names ?? Array.from({ length: n }, (_, i) => `x${i + 1}`);
  const { matrix, pivots } = rref(augmented);
  const rankA = pivots.filter((c) => c < n).length;
  const rankAb = pivots.length;
  if (rankAb > rankA) return { success: true, kind: "none", rank: rankA, augmentedRank: rankAb };
  if (rankA === n) return { success: true, kind: "unique", values: pivots.map((_, i) => matrix[i][n]), rank: rankA };

  const free = Array.from({ length: n }, (_, j) => j).filter((j) => !pivots.includes(j));
  const expressions: string[] = [];
  for (let j = 0; j < n; j++) {
    const row = pivots.indexOf(j);
    if (row < 0) {
      expressions.push(`${vars[j]} = ${vars[j]} (libre)`);
      continue;
    }
    const parts: string[] = [];
    if (!isZero(matrix[row][n]) ) parts.push(fmt(matrix[row][n]));
    for (const f of free) {
      const coef = neg(matrix[row][f]);
      if (isZero(coef)) continue;
      const absC = sign(coef) < 0 ? neg(coef) : coef;
      const coefText = absC.n === ONE_N && absC.d === ONE_N ? "" : isInteger(absC) ? `${absC.n}·` : `(${fmt(absC)})·`;
      const term = `${coefText}${vars[f]}`;
      parts.push(parts.length === 0 ? (sign(coef) < 0 ? `−${term}` : term) : `${sign(coef) < 0 ? "−" : "+"} ${term}`);
    }
    expressions.push(`${vars[j]} = ${parts.length ? parts.join(" ") : "0"}`);
  }
  return { success: true, kind: "infinite", expressions, free, rank: rankA };
}
