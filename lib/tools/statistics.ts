/**
 * Estadística descriptiva de una lista de datos numéricos.
 */

export interface DescriptiveStats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  /** Varianza muestral (n − 1) */
  sampleVariance: number;
  /** Varianza poblacional (n) */
  populationVariance: number;
  sampleStdDev: number;
  populationStdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  /** Coeficiente de variación muestral en %, null si la media es 0 */
  coefficientOfVariation: number | null;
  sorted: number[];
}

export type StatsResult = { success: true; stats: DescriptiveStats } | { success: false; message: string };

/**
 * Extrae números de un texto. Separadores: saltos de línea, punto y coma, tabulaciones o espacios.
 * La coma se interpreta como decimal si no hay otros separadores entre valores (ej. "3,5; 4,2"),
 * y como separador de lista si los números usan punto decimal (ej. "3.5, 4.2").
 */
export function parseNumberList(text: string): { values: number[]; invalid: string[] } {
  const trimmed = text.trim();
  if (!trimmed) return { values: [], invalid: [] };
  const commaIsDecimal = /[;\n\t]/.test(trimmed) || (/\d,\d/.test(trimmed) && !/\d\.\d/.test(trimmed) && !/,\s/.test(trimmed));
  const tokens = commaIsDecimal
    ? trimmed.split(/[;\n\t ]+/).map((t) => t.replace(",", "."))
    : trimmed.split(/[,\s;]+/);
  const values: number[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    if (!token) continue;
    if (/^[-+]?\d+(\.\d+)?$/.test(token) || /^[-+]?\.\d+$/.test(token)) values.push(Number(token));
    else invalid.push(token);
  }
  return { values, invalid };
}

const round = (v: number, d = 6) => Math.round((v + Number.EPSILON) * 10 ** d) / 10 ** d;

/** Cuantil con interpolación lineal (mismo método que CUARTIL.INC de Excel). */
export function quantile(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * p;
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (pos - lower);
}

export function describe(values: number[]): StatsResult {
  if (values.length === 0) return { success: false, message: "Ingresa al menos un dato numérico." };
  if (!values.every(Number.isFinite)) return { success: false, message: "Todos los datos deben ser números válidos." };
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  const freq = new Map<number, number>();
  for (const v of sorted) freq.set(v, (freq.get(v) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  // Sin moda si ningún valor se repite o si todos los valores distintos se repiten lo mismo
  const uniform = freq.size > 1 && [...freq.values()].every((f) => f === maxFreq);
  const modes = maxFreq > 1 && !uniform ? [...freq.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v) : [];

  const squares = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  const populationVariance = squares / n;
  const sampleVariance = n > 1 ? squares / (n - 1) : 0;
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const sampleStdDev = Math.sqrt(sampleVariance);

  return {
    success: true,
    stats: {
      count: n,
      sum: round(sum),
      mean: round(mean),
      median: round(median),
      modes,
      min: sorted[0],
      max: sorted[n - 1],
      range: round(sorted[n - 1] - sorted[0]),
      sampleVariance: round(sampleVariance),
      populationVariance: round(populationVariance),
      sampleStdDev: round(sampleStdDev),
      populationStdDev: round(Math.sqrt(populationVariance)),
      q1: round(q1),
      q3: round(q3),
      iqr: round(q3 - q1),
      coefficientOfVariation: mean === 0 ? null : round((sampleStdDev / Math.abs(mean)) * 100, 4),
      sorted,
    },
  };
}
