/**
 * Evaluación de proyectos de inversión: VAN, TIR, índice de rentabilidad y periodo de recuperación.
 * Convención: el flujo del periodo 0 (normalmente la inversión, negativa) no se descuenta.
 *   VAN = Σ FCₜ ÷ (1 + i)ᵗ,  t = 0…n
 * Equivale en Excel a =VNA(i; FC₁:FCₙ) + FC₀ y la TIR a =TIR(FC₀:FCₙ).
 */

export const MAX_PERIODS = 100;

const round = (n: number, d: number) => {
  const f = 10 ** d;
  // "+ 0" convierte −0 en 0
  return Math.round((n + Math.sign(n) * Number.EPSILON) * f) / f + 0;
};

export function npvAt(rate: number, flows: number[]): number {
  let total = 0;
  for (let t = 0; t < flows.length; t++) total += flows[t] / (1 + rate) ** t;
  return total;
}

/** Cambios de signo en la serie de flujos (se ignoran los ceros). Regla de Descartes: número máximo de TIR positivas. */
export function signChanges(flows: number[]): number {
  let changes = 0;
  let last = 0;
  for (const f of flows) {
    if (f === 0) continue;
    const s = Math.sign(f);
    if (last !== 0 && s !== last) changes++;
    last = s;
  }
  return changes;
}

/**
 * Todas las TIR (tasas donde VAN = 0) entre −99 % y 10 000 %.
 * Se recorre la curva del VAN en una malla fina y cada cambio de signo se refina por bisección (precisión 1e-12).
 */
export function internalRates(flows: number[]): number[] {
  const f = (r: number) => npvAt(r, flows);
  const grid: number[] = [];
  for (let r = -0.99; r < 1; r += 0.001) grid.push(r);
  for (let r = 1; r <= 100; r += 0.05) grid.push(r);
  const roots: number[] = [];
  for (let k = 0; k < grid.length - 1; k++) {
    let a = grid[k];
    let b = grid[k + 1];
    let fa = f(a);
    const fb = f(b);
    if (fa === 0) {
      roots.push(a);
      continue;
    }
    if (Math.sign(fa) === Math.sign(fb)) continue;
    for (let i = 0; i < 200 && b - a > 1e-12; i++) {
      const m = (a + b) / 2;
      const fm = f(m);
      if (Math.sign(fm) === Math.sign(fa)) {
        a = m;
        fa = fm;
      } else b = m;
    }
    roots.push((a + b) / 2);
  }
  // Elimina duplicados por la malla
  return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > 1e-9);
}

export interface PaybackResult {
  /** Periodo en que el acumulado deja de ser negativo, o null si nunca se recupera */
  period: number | null;
  /** Estimación con interpolación lineal dentro de ese periodo */
  interpolated: number | null;
}

function payback(flows: number[]): PaybackResult {
  let acc = 0;
  for (let t = 0; t < flows.length; t++) {
    const prev = acc;
    acc += flows[t];
    if (t > 0 && prev < 0 && acc >= 0) return { period: t, interpolated: round(t - 1 + -prev / flows[t], 4) };
  }
  return { period: null, interpolated: null };
}

export interface InvestmentRow {
  period: number;
  flow: number;
  discountFactor: number;
  presentValue: number;
  cumulative: number;
  cumulativePresentValue: number;
}

export type InvestmentResult =
  | {
      success: true;
      npv: number;
      /** TIR en porcentaje, redondeada a 4 decimales; vacío si no existe */
      irr: number[];
      signChanges: number;
      /** VP de los flujos futuros ÷ inversión inicial (solo si FC₀ < 0) */
      profitabilityIndex: number | null;
      payback: PaybackResult;
      discountedPayback: PaybackResult;
      rows: InvestmentRow[];
      decision: "accept" | "reject" | "indifferent";
    }
  | { success: false; message: string };

export function evaluateInvestment(ratePercent: number, flows: number[]): InvestmentResult {
  if (!Number.isFinite(ratePercent) || ratePercent <= -100 || ratePercent > 1000) return { success: false, message: "La tasa de descuento debe ser mayor que −100 % y como máximo 1000 %." };
  if (flows.length < 2) return { success: false, message: "Ingresa al menos el flujo del periodo 0 y un flujo futuro." };
  if (flows.length > MAX_PERIODS + 1) return { success: false, message: `Máximo ${MAX_PERIODS} periodos.` };
  if (!flows.every(Number.isFinite)) return { success: false, message: "Todos los flujos deben ser números válidos." };
  if (flows.every((f) => f === 0)) return { success: false, message: "Todos los flujos son 0." };

  const i = ratePercent / 100;
  const rows: InvestmentRow[] = [];
  let cumulative = 0;
  let cumulativePV = 0;
  for (let t = 0; t < flows.length; t++) {
    const factor = 1 / (1 + i) ** t;
    const pv = flows[t] * factor;
    cumulative += flows[t];
    cumulativePV += pv;
    rows.push({ period: t, flow: flows[t], discountFactor: round(factor, 6), presentValue: round(pv, 2), cumulative: round(cumulative, 2), cumulativePresentValue: round(cumulativePV, 2) });
  }
  const npv = round(npvAt(i, flows), 2);
  const futurePV = npvAt(i, flows) - flows[0];
  const pvFlows = flows.map((f, t) => f / (1 + i) ** t);
  return {
    success: true,
    npv,
    irr: internalRates(flows).map((r) => round(r * 100, 4)),
    signChanges: signChanges(flows),
    profitabilityIndex: flows[0] < 0 ? round(futurePV / -flows[0], 4) : null,
    payback: payback(flows),
    discountedPayback: payback(pvFlows),
    rows,
    decision: npv > 0 ? "accept" : npv < 0 ? "reject" : "indifferent",
  };
}

/** Lee una lista de flujos separados por saltos de línea, punto y coma o espacios. Acepta coma decimal. */
export function parseFlows(text: string): { success: true; flows: number[] } | { success: false; message: string } {
  const parts = text.split(/[\n;\s]+/).map((s) => s.trim()).filter(Boolean);
  const flows: number[] = [];
  for (const [k, p] of parts.entries()) {
    const clean = p.replace(/\$/g, "").replace(",", ".");
    if (!/^[+-]?\d+(\.\d+)?$/.test(clean)) return { success: false, message: `El valor “${p}” (flujo ${k}) no es un número válido. Escribe un flujo por línea, sin separadores de miles.` };
    flows.push(Number(clean));
  }
  return { success: true, flows };
}
