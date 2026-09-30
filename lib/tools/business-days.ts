/**
 * Días hábiles y feriados nacionales de Ecuador.
 *
 * Feriados según el art. 65 del Código del Trabajo y la Disposición General Cuarta de la LOSEP,
 * reformados por la Ley Orgánica Reformatoria publicada en el Registro Oficial Suplemento 906 (20-dic-2016):
 *  - 1 de enero, lunes y martes de carnaval, viernes santo, 1 de mayo, 24 de mayo, 10 de agosto,
 *    9 de octubre, 2 y 3 de noviembre y 25 de diciembre.
 *  - Martes → lunes anterior; miércoles o jueves → viernes de la misma semana
 *    (excepto 1 de enero, 25 de diciembre y martes de carnaval).
 *  - Sábado → viernes anterior; domingo → lunes siguiente.
 *  - Feriados consecutivos (2 y 3 de noviembre): Disposición General Primera, literales a) a e).
 * El Presidente puede modificar el calendario por decreto ejecutivo (Disposiciones Cuarta y Quinta),
 * por eso la herramienta permite agregar o quitar fechas.
 */

export interface Holiday {
  /** Fecha de descanso (YYYY-MM-DD) */
  date: string;
  name: string;
  /** Fecha original cuando el descanso se trasladó */
  movedFrom?: string;
}

/** Primer año con las reglas de traslado vigentes (la ley entró en vigor el 20-dic-2016). */
export const FIRST_RULE_YEAR = 2017;
export const LAST_RULE_YEAR = 2100;

const DAY_MS = 86_400_000;

/** Fecha 'YYYY-MM-DD' → número de días desde 1970-01-01 (UTC, sin husos horarios). */
export function toDayNumber(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return Number.NaN;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(t);
  // Rechaza fechas imposibles como 2025-02-30
  if (d.getUTCFullYear() !== Number(m[1]) || d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) return Number.NaN;
  return t / DAY_MS;
}

export function fromDayNumber(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado */
export const weekday = (day: number) => (((day + 4) % 7) + 7) % 7;

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Domingo de Pascua (calendario gregoriano, algoritmo de Meeus/Jones/Butcher). */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(year, month, day);
}

/** Traslado de un feriado individual según su día de la semana. */
function moveSingle(day: number, allowWeekdayMove: boolean): number {
  const w = weekday(day);
  if (w === 6) return day - 1; // sábado → viernes anterior
  if (w === 0) return day + 1; // domingo → lunes siguiente
  if (!allowWeekdayMove) return day;
  if (w === 2) return day - 1; // martes → lunes anterior
  if (w === 3) return day + 2; // miércoles → viernes
  if (w === 4) return day + 1; // jueves → viernes
  return day;
}

/** 2 y 3 de noviembre (feriados consecutivos), Disposición General Primera. */
function novemberHolidays(year: number): Holiday[] {
  const d2 = toDayNumber(iso(year, 11, 2));
  const d3 = d2 + 1;
  const names = ["Día de los Difuntos", "Independencia de Cuenca"];
  const w = weekday(d2);
  let r2 = d2;
  let r3 = d3;
  if (w === 1 || w === 4) {
    // a) lunes-martes o jueves-viernes: no se trasladan
  } else if (w === 2) {
    r3 = d2 - 1; // b) martes-miércoles: el miércoles pasa al lunes anterior
  } else if (w === 3) {
    r2 = d3 + 1; // c) miércoles-jueves: el miércoles pasa al viernes siguiente
  } else if (w === 5) {
    r3 = d2 - 1; // d) viernes-sábado: el sábado pasa al jueves anterior
  } else if (w === 0) {
    r2 = d3 + 1; // e) domingo-lunes: el domingo pasa al martes siguiente
  } else {
    // sábado-domingo: no hay regla especial; se aplica la regla general a cada uno
    r2 = d2 - 1;
    r3 = d3 + 1;
  }
  return [
    { date: fromDayNumber(r2), name: names[0], ...(r2 !== d2 ? { movedFrom: fromDayNumber(d2) } : {}) },
    { date: fromDayNumber(r3), name: names[1], ...(r3 !== d3 ? { movedFrom: fromDayNumber(d3) } : {}) },
  ];
}

/** Feriados nacionales de descanso obligatorio en Ecuador para un año, con los traslados de ley. */
export function ecuadorHolidays(year: number): Holiday[] {
  if (!Number.isInteger(year) || year < FIRST_RULE_YEAR || year > LAST_RULE_YEAR) return [];
  const list: Holiday[] = [];
  const push = (original: string, name: string, allowWeekdayMove: boolean) => {
    const day = toDayNumber(original);
    const moved = moveSingle(day, allowWeekdayMove);
    list.push({ date: fromDayNumber(moved), name, ...(moved !== day ? { movedFrom: original } : {}) });
  };
  const easter = toDayNumber(easterSunday(year));
  push(iso(year, 1, 1), "Año Nuevo", false);
  list.push({ date: fromDayNumber(easter - 48), name: "Carnaval (lunes)" });
  list.push({ date: fromDayNumber(easter - 47), name: "Carnaval (martes)" });
  list.push({ date: fromDayNumber(easter - 2), name: "Viernes Santo" });
  push(iso(year, 5, 1), "Día del Trabajo", true);
  push(iso(year, 5, 24), "Batalla de Pichincha", true);
  push(iso(year, 8, 10), "Primer Grito de Independencia", true);
  push(iso(year, 10, 9), "Independencia de Guayaquil", true);
  list.push(...novemberHolidays(year));
  push(iso(year, 12, 25), "Navidad", false);
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

/** Feriados de Ecuador para todos los años entre dos fechas. */
export function ecuadorHolidaysBetween(startIso: string, endIso: string): Holiday[] {
  const y1 = Number(startIso.slice(0, 4));
  const y2 = Number(endIso.slice(0, 4));
  const out: Holiday[] = [];
  // Incluye el año siguiente: un 1 de enero en sábado se traslada al 31 de diciembre del año anterior
  for (let y = y1; y <= y2 + 1; y++) out.push(...ecuadorHolidays(y));
  return out.filter((h) => h.date >= startIso && h.date <= endIso);
}

export interface BusinessOptions {
  /** Fechas no laborables adicionales a sábados y domingos (YYYY-MM-DD) */
  holidays: string[];
  /** Contar el sábado como día hábil (p. ej., instituciones que atienden sábados) */
  saturdayIsWorkday?: boolean;
}

export const MAX_SPAN_DAYS = 366 * 30;

export type CountResult =
  | { success: true; businessDays: number; calendarDays: number; weekendDays: number; holidaysOnWorkdays: string[] }
  | { success: false; message: string };

function isWorkday(day: number, holidays: Set<string>, saturday: boolean): boolean {
  const w = weekday(day);
  if (w === 0 || (w === 6 && !saturday)) return false;
  return !holidays.has(fromDayNumber(day));
}

/**
 * Días hábiles entre dos fechas, contando ambas (igual que DIAS.LAB / NETWORKDAYS de Excel).
 * Si la fecha final es anterior a la inicial, el resultado es negativo.
 */
export function countBusinessDays(startIso: string, endIso: string, options: BusinessOptions): CountResult {
  const s = toDayNumber(startIso);
  const e = toDayNumber(endIso);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return { success: false, message: "Ingresa fechas válidas." };
  const [from, to, dir] = s <= e ? [s, e, 1] : [e, s, -1];
  if (to - from > MAX_SPAN_DAYS) return { success: false, message: "El intervalo máximo es de 30 años." };
  const holidays = new Set(options.holidays);
  let business = 0;
  let weekend = 0;
  const holidaysOnWorkdays: string[] = [];
  for (let d = from; d <= to; d++) {
    const w = weekday(d);
    if (w === 0 || (w === 6 && !options.saturdayIsWorkday)) weekend++;
    else if (holidays.has(fromDayNumber(d))) holidaysOnWorkdays.push(fromDayNumber(d));
    else business++;
  }
  return { success: true, businessDays: business * dir, calendarDays: (to - from + 1) * dir, weekendDays: weekend, holidaysOnWorkdays };
}

export type AddResult = { success: true; date: string; calendarDays: number; skippedHolidays: string[] } | { success: false; message: string };

/**
 * Fecha que resulta de sumar (o restar) N días hábiles; la fecha inicial no se cuenta
 * (igual que DIA.LAB / WORKDAY de Excel).
 */
export function addBusinessDays(startIso: string, amount: number, options: BusinessOptions): AddResult {
  const s = toDayNumber(startIso);
  if (!Number.isFinite(s)) return { success: false, message: "Ingresa una fecha inicial válida." };
  if (!Number.isInteger(amount) || Math.abs(amount) > 5000) return { success: false, message: "La cantidad de días hábiles debe ser un número entero entre −5000 y 5000." };
  const holidays = new Set(options.holidays);
  const step = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  let d = s;
  const skipped: string[] = [];
  while (remaining > 0) {
    d += step;
    if (isWorkday(d, holidays, Boolean(options.saturdayIsWorkday))) remaining--;
    else if (holidays.has(fromDayNumber(d)) && weekday(d) !== 0 && !(weekday(d) === 6 && !options.saturdayIsWorkday)) skipped.push(fromDayNumber(d));
  }
  return { success: true, date: fromDayNumber(d), calendarDays: d - s, skippedHolidays: skipped };
}
