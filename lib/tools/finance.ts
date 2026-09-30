/**
 * Interés simple, interés compuesto y tabla de amortización (método francés, cuota fija).
 * Las tasas se expresan en porcentaje anual; el tiempo, en años o meses según la función.
 */

export type Compounding = 1 | 2 | 4 | 12 | 365;

export const COMPOUNDING_OPTIONS: { value: Compounding; label: string }[] = [
  { value: 1, label: "Anual" },
  { value: 2, label: "Semestral" },
  { value: 4, label: "Trimestral" },
  { value: 12, label: "Mensual" },
  { value: 365, label: "Diaria" },
];

const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function validate(principal: number, ratePercent: number, time: number): string | null {
  if (!Number.isFinite(principal) || principal <= 0) return "El capital debe ser mayor que 0.";
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 1000) return "La tasa debe estar entre 0% y 1000%.";
  if (!Number.isFinite(time) || time <= 0) return "El tiempo debe ser mayor que 0.";
  return null;
}

export type InterestResult =
  | { success: true; interest: number; finalAmount: number; effectiveAnnualRate: number }
  | { success: false; message: string };

/** Interés simple: I = C · r · t */
export function simpleInterest(principal: number, annualRatePercent: number, years: number): InterestResult {
  const error = validate(principal, annualRatePercent, years);
  if (error) return { success: false, message: error };
  const interest = principal * (annualRatePercent / 100) * years;
  return { success: true, interest: money(interest), finalAmount: money(principal + interest), effectiveAnnualRate: annualRatePercent };
}

/** Interés compuesto: M = C · (1 + r/n)^(n·t) */
export function compoundInterest(principal: number, annualRatePercent: number, years: number, periodsPerYear: Compounding = 12): InterestResult {
  const error = validate(principal, annualRatePercent, years);
  if (error) return { success: false, message: error };
  const r = annualRatePercent / 100;
  const finalAmount = principal * (1 + r / periodsPerYear) ** (periodsPerYear * years);
  const effective = ((1 + r / periodsPerYear) ** periodsPerYear - 1) * 100;
  return {
    success: true,
    interest: money(finalAmount - principal),
    finalAmount: money(finalAmount),
    effectiveAnnualRate: Math.round(effective * 10000) / 10000,
  };
}

export interface AmortizationRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export type AmortizationResult =
  | { success: true; payment: number; totalPaid: number; totalInterest: number; rows: AmortizationRow[] }
  | { success: false; message: string };

/** Tabla de amortización con cuota fija mensual (método francés). */
export function amortizationSchedule(principal: number, annualRatePercent: number, months: number): AmortizationResult {
  const error = validate(principal, annualRatePercent, months);
  if (error) return { success: false, message: error };
  if (!Number.isInteger(months) || months > 600) return { success: false, message: "El plazo debe ser un número entero de meses (máximo 600)." };
  const i = annualRatePercent / 100 / 12;
  const payment = i === 0 ? principal / months : (principal * i) / (1 - (1 + i) ** -months);
  const rows: AmortizationRow[] = [];
  let balance = principal;
  let totalPaid = 0;
  for (let period = 1; period <= months; period++) {
    const interest = balance * i;
    let principalPart = payment - interest;
    let rowPayment = payment;
    // La última cuota ajusta los centavos de redondeo para dejar el saldo en cero
    if (period === months) {
      principalPart = balance;
      rowPayment = balance + interest;
    }
    balance -= principalPart;
    totalPaid += money(rowPayment);
    rows.push({ period, payment: money(rowPayment), interest: money(interest), principal: money(principalPart), balance: money(Math.max(balance, 0)) });
  }
  return { success: true, payment: money(payment), totalPaid: money(totalPaid), totalInterest: money(totalPaid - principal), rows };
}
