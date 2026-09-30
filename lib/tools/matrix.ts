/**
 * Operaciones con matrices en aritmética racional exacta (fracciones con BigInt).
 * Determinante, inversa y rango por eliminación de Gauss-Jordan: resultados exactos, sin redondeo.
 */
import { add, div, isZero, mul, neg, ONE, parseFraction, sub, ZERO, type Fraction } from "@/lib/tools/fraction";

export type Matrix = Fraction[][];

export const MAX_SIZE = 8;

export type MatrixParse = { success: true; matrix: Matrix } | { success: false; message: string };
export type MatrixResult = { success: true; matrix: Matrix } | { success: false; message: string };
export type ScalarResult = { success: true; value: Fraction } | { success: false; message: string };

/**
 * Lee una matriz escrita como texto: una fila por línea, valores separados por espacios, tabulaciones o punto y coma.
 * Acepta enteros, decimales (punto o coma decimal) y fracciones "a/b".
 */
export function parseMatrix(text: string): MatrixParse {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { success: false, message: "Escribe al menos una fila." };
  if (lines.length > MAX_SIZE) return { success: false, message: `Máximo ${MAX_SIZE} filas.` };
  const matrix: Matrix = [];
  for (const [i, line] of lines.entries()) {
    const cells = line.replace(/^\[|\]$/g, "").split(/[\s;]+/).filter(Boolean);
    if (cells.length > MAX_SIZE) return { success: false, message: `Máximo ${MAX_SIZE} columnas (fila ${i + 1}).` };
    const row: Fraction[] = [];
    for (const [j, cell] of cells.entries()) {
      const v = parseFraction(cell);
      if (!v) return { success: false, message: `Valor no válido “${cell}” en la fila ${i + 1}, columna ${j + 1}.` };
      row.push(v);
    }
    if (matrix.length && row.length !== matrix[0].length) {
      return { success: false, message: `La fila ${i + 1} tiene ${row.length} valores y la fila 1 tiene ${matrix[0].length}. Todas las filas deben tener la misma cantidad.` };
    }
    matrix.push(row);
  }
  return { success: true, matrix };
}

export const rows = (m: Matrix) => m.length;
export const cols = (m: Matrix) => (m.length ? m[0].length : 0);
const clone = (m: Matrix): Matrix => m.map((r) => [...r]);
const size = (m: Matrix) => `${rows(m)}×${cols(m)}`;

export function addMatrices(a: Matrix, b: Matrix): MatrixResult {
  if (rows(a) !== rows(b) || cols(a) !== cols(b)) return { success: false, message: `Para sumar, las matrices deben tener el mismo tamaño (A es ${size(a)} y B es ${size(b)}).` };
  return { success: true, matrix: a.map((r, i) => r.map((v, j) => add(v, b[i][j]))) };
}

export function subtractMatrices(a: Matrix, b: Matrix): MatrixResult {
  if (rows(a) !== rows(b) || cols(a) !== cols(b)) return { success: false, message: `Para restar, las matrices deben tener el mismo tamaño (A es ${size(a)} y B es ${size(b)}).` };
  return { success: true, matrix: a.map((r, i) => r.map((v, j) => sub(v, b[i][j]))) };
}

export function multiplyMatrices(a: Matrix, b: Matrix): MatrixResult {
  if (cols(a) !== rows(b)) return { success: false, message: `Para multiplicar A×B, las columnas de A (${cols(a)}) deben ser iguales a las filas de B (${rows(b)}).` };
  const out: Matrix = [];
  for (let i = 0; i < rows(a); i++) {
    out.push([]);
    for (let j = 0; j < cols(b); j++) {
      let s = ZERO;
      for (let k = 0; k < cols(a); k++) s = add(s, mul(a[i][k], b[k][j]));
      out[i].push(s);
    }
  }
  return { success: true, matrix: out };
}

export function scalarMultiply(k: Fraction, m: Matrix): Matrix {
  return m.map((r) => r.map((v) => mul(k, v)));
}

export function transpose(m: Matrix): Matrix {
  return Array.from({ length: cols(m) }, (_, j) => m.map((r) => r[j]));
}

/** Forma escalonada reducida por filas (Gauss-Jordan) y columnas pivote. */
export function rref(m: Matrix): { matrix: Matrix; pivots: number[] } {
  const a = clone(m);
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < cols(a) && r < rows(a); c++) {
    let p = r;
    while (p < rows(a) && isZero(a[p][c])) p++;
    if (p === rows(a)) continue;
    [a[r], a[p]] = [a[p], a[r]];
    const pv = a[r][c];
    a[r] = a[r].map((v) => div(v, pv));
    for (let i = 0; i < rows(a); i++) {
      if (i !== r && !isZero(a[i][c])) {
        const f = a[i][c];
        a[i] = a[i].map((v, j) => sub(v, mul(f, a[r][j])));
      }
    }
    pivots.push(c);
    r++;
  }
  return { matrix: a, pivots };
}

export const rank = (m: Matrix) => rref(m).pivots.length;

/** Determinante por eliminación gaussiana exacta. */
export function determinant(m: Matrix): ScalarResult {
  const n = rows(m);
  if (n === 0 || n !== cols(m)) return { success: false, message: `El determinante solo existe para matrices cuadradas (esta es ${size(m)}).` };
  const a = clone(m);
  let det = ONE;
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && isZero(a[p][c])) p++;
    if (p === n) return { success: true, value: ZERO };
    if (p !== c) {
      [a[c], a[p]] = [a[p], a[c]];
      det = neg(det);
    }
    det = mul(det, a[c][c]);
    for (let i = c + 1; i < n; i++) {
      if (isZero(a[i][c])) continue;
      const f = div(a[i][c], a[c][c]);
      a[i] = a[i].map((v, j) => sub(v, mul(f, a[c][j])));
    }
  }
  return { success: true, value: det };
}

/** Inversa por Gauss-Jordan sobre [A | I]. */
export function inverse(m: Matrix): MatrixResult {
  const n = rows(m);
  if (n === 0 || n !== cols(m)) return { success: false, message: `Solo las matrices cuadradas pueden tener inversa (esta es ${size(m)}).` };
  const augmented = m.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? ONE : ZERO))]);
  const { matrix, pivots } = rref(augmented);
  if (pivots.length < n || pivots[n - 1] !== n - 1) return { success: false, message: "La matriz no tiene inversa: su determinante es 0 (matriz singular)." };
  return { success: true, matrix: matrix.map((r) => r.slice(n)) };
}

export const identity = (n: number): Matrix => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? ONE : ZERO)));

/** Construye una matriz a partir de números o textos ("1/3", "0.5"). Lanza error si un valor no es válido. */
export const fromValues = (m: (number | string)[][]): Matrix =>
  m.map((r) =>
    r.map((v) => {
      const f = parseFraction(String(v));
      if (!f) throw new RangeError(`Valor no válido: ${v}`);
      return f;
    })
  );

