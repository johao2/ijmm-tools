/**
 * Promedio ponderado de notas y nota necesaria para alcanzar un objetivo.
 * Lógica pura sin efectos secundarios.
 */

export interface GradeItem {
  /** Nota obtenida en la escala elegida */
  grade: number;
  /** Peso del componente en porcentaje (0-100) */
  weight: number;
}

export type GradeResult =
  | { success: true; average: number; totalWeight: number; weightedPoints: number }
  | { success: false; message: string };

export type RequiredGradeResult =
  | { success: true; required: number; currentPoints: number; achievable: boolean; alreadyReached: boolean }
  | { success: false; message: string };

const round = (value: number, decimals = 2) => Math.round((value + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;

/** Convierte texto con coma o punto decimal a número. Devuelve NaN si no es válido. */
export function parseDecimal(value: string): number {
  const clean = value.trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return Number.NaN;
  return Number(clean);
}

function validateItems(items: GradeItem[], maxScale: number): string | null {
  if (!Number.isFinite(maxScale) || maxScale <= 0) return "La escala máxima debe ser mayor que cero.";
  if (items.length === 0) return "Agrega al menos una nota.";
  for (const [index, item] of items.entries()) {
    if (!Number.isFinite(item.grade) || !Number.isFinite(item.weight)) return `La fila ${index + 1} tiene valores no válidos.`;
    if (item.grade < 0 || item.grade > maxScale) return `La nota de la fila ${index + 1} debe estar entre 0 y ${maxScale}.`;
    if (item.weight <= 0 || item.weight > 100) return `El peso de la fila ${index + 1} debe ser mayor que 0 y hasta 100%.`;
  }
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total > 100 + 1e-9) return `Los pesos suman ${round(total)}%; no pueden superar el 100%.`;
  return null;
}

/**
 * Promedio ponderado. Si los pesos suman menos de 100%, el promedio se calcula
 * sobre el peso registrado (promedio parcial del avance).
 */
export function weightedAverage(items: GradeItem[], maxScale = 10): GradeResult {
  const error = validateItems(items, maxScale);
  if (error) return { success: false, message: error };
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const weightedPoints = items.reduce((sum, item) => sum + (item.grade * item.weight) / 100, 0);
  return {
    success: true,
    average: round((weightedPoints * 100) / totalWeight),
    totalWeight: round(totalWeight),
    weightedPoints: round(weightedPoints, 4),
  };
}

/**
 * Nota que se necesita en el componente pendiente (con peso remainingWeight)
 * para terminar con la nota objetivo `target`.
 */
export function requiredGrade(items: GradeItem[], remainingWeight: number, target: number, maxScale = 10): RequiredGradeResult {
  if (items.length > 0) {
    const error = validateItems(items, maxScale);
    if (error) return { success: false, message: error };
  }
  if (!Number.isFinite(remainingWeight) || remainingWeight <= 0 || remainingWeight > 100) {
    return { success: false, message: "El peso del examen o componente pendiente debe ser mayor que 0 y hasta 100%." };
  }
  if (!Number.isFinite(target) || target < 0 || target > maxScale) {
    return { success: false, message: `La nota objetivo debe estar entre 0 y ${maxScale}.` };
  }
  const used = items.reduce((sum, item) => sum + item.weight, 0);
  if (used + remainingWeight > 100 + 1e-9) {
    return { success: false, message: `Las notas registradas (${round(used)}%) más el componente pendiente (${round(remainingWeight)}%) superan el 100%.` };
  }
  const currentPoints = items.reduce((sum, item) => sum + (item.grade * item.weight) / 100, 0);
  const required = ((target - currentPoints) * 100) / remainingWeight;
  return {
    success: true,
    // Redondeo hacia arriba: una nota redondeada hacia abajo podría no alcanzar el objetivo
    required: Math.max(Math.ceil(round(required, 6) * 100) / 100, 0),
    currentPoints: round(currentPoints, 4),
    achievable: required <= maxScale + 1e-9,
    alreadyReached: required <= 0,
  };
}
