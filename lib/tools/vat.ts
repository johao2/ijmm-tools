export const ECUADOR_GENERAL_VAT_RATE = "15";
export const MAX_VAT_AMOUNT_CENTS = 100_000_000_000_000;

export type VatMode = "add" | "extract";

export type VatErrorCode =
  | "EMPTY_AMOUNT"
  | "INVALID_AMOUNT"
  | "NEGATIVE_AMOUNT"
  | "AMOUNT_TOO_LARGE"
  | "INVALID_RATE";

export interface VatFailure {
  success: false;
  code: VatErrorCode;
  message: string;
}

export interface VatSuccess {
  success: true;
  mode: VatMode;
  rate: string;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  subtotalFormatted: string;
  vatFormatted: string;
  totalFormatted: string;
}

export type VatResult = VatSuccess | VatFailure;

interface ParsedNumberSuccess {
  success: true;
  value: number;
}

type ParsedNumberResult = ParsedNumberSuccess | VatFailure;

function parseAmountToCents(input: string): ParsedNumberResult {
  const normalized = input.trim().replace(",", ".");
  if (!normalized) {
    return {
      success: false,
      code: "EMPTY_AMOUNT",
      message: "Introduce un monto para realizar el cálculo.",
    };
  }
  if (normalized.startsWith("-")) {
    return {
      success: false,
      code: "NEGATIVE_AMOUNT",
      message: "El monto no puede ser negativo.",
    };
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return {
      success: false,
      code: "INVALID_AMOUNT",
      message: "Introduce un monto válido con un máximo de dos decimales.",
    };
  }

  const [whole, decimal = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > MAX_VAT_AMOUNT_CENTS) {
    return {
      success: false,
      code: "AMOUNT_TOO_LARGE",
      message: "El monto supera el límite admitido por la calculadora.",
    };
  }
  return { success: true, value: cents };
}

function parseRateToUnits(input: string): ParsedNumberResult {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,4})?$/.test(normalized)) {
    return {
      success: false,
      code: "INVALID_RATE",
      message: "Introduce una tarifa válida entre 0% y 100%, con un máximo de cuatro decimales.",
    };
  }
  const [whole, decimal = ""] = normalized.split(".");
  const units = Number(whole) * 10_000 + Number(decimal.padEnd(4, "0"));
  if (!Number.isSafeInteger(units) || units < 0 || units > 1_000_000) {
    return {
      success: false,
      code: "INVALID_RATE",
      message: "La tarifa debe estar entre 0% y 100%.",
    };
  }
  return { success: true, value: units };
}

function multiplyDivideAndRound(
  multiplicand: number,
  multiplier: number,
  denominator: number
): number {
  const numeratorBigInt = BigInt(multiplicand) * BigInt(multiplier);
  const denominatorBigInt = BigInt(denominator);
  return Number(
    (numeratorBigInt + denominatorBigInt / BigInt(2)) / denominatorBigInt
  );
}

export function formatUsd(cents: number): string {
  const whole = Math.floor(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimal = Math.abs(cents % 100).toString().padStart(2, "0");
  return `$${whole}.${decimal}`;
}

function formatRate(rateUnits: number): string {
  const whole = Math.floor(rateUnits / 10_000);
  const decimal = (rateUnits % 10_000).toString().padStart(4, "0").replace(/0+$/, "");
  return decimal ? `${whole}.${decimal}` : whole.toString();
}

export function calculateEcuadorVat(
  amountInput: string,
  rateInput: string = ECUADOR_GENERAL_VAT_RATE,
  mode: VatMode = "add"
): VatResult {
  const amountResult = parseAmountToCents(amountInput);
  if (!amountResult.success) return amountResult;

  const rateResult = parseRateToUnits(rateInput);
  if (!rateResult.success) return rateResult;

  const amountCents = amountResult.value;
  const rateUnits = rateResult.value;
  const percentageDenominator = 1_000_000;
  let subtotalCents: number;
  let vatCents: number;
  let totalCents: number;

  if (mode === "extract") {
    totalCents = amountCents;
    subtotalCents = multiplyDivideAndRound(
      totalCents,
      percentageDenominator,
      percentageDenominator + rateUnits
    );
    vatCents = totalCents - subtotalCents;
  } else {
    subtotalCents = amountCents;
    vatCents = multiplyDivideAndRound(
      subtotalCents,
      rateUnits,
      percentageDenominator
    );
    totalCents = subtotalCents + vatCents;
  }

  return {
    success: true,
    mode,
    rate: formatRate(rateUnits),
    subtotalCents,
    vatCents,
    totalCents,
    subtotalFormatted: formatUsd(subtotalCents),
    vatFormatted: formatUsd(vatCents),
    totalFormatted: formatUsd(totalCents),
  };
}
