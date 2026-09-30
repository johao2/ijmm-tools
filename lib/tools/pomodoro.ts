/**
 * Ciclo de la técnica Pomodoro: trabajo, descanso corto y descanso largo.
 */

export type PomodoroPhase = "work" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Pomodoros de trabajo antes de un descanso largo */
  cyclesBeforeLongBreak: number;
}

export const DEFAULT_POMODORO: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: "Enfoque",
  shortBreak: "Descanso corto",
  longBreak: "Descanso largo",
};

export function validateSettings(s: PomodoroSettings): string | null {
  const inRange = (v: number, min: number, max: number) => Number.isInteger(v) && v >= min && v <= max;
  if (!inRange(s.workMinutes, 1, 180)) return "El tiempo de enfoque debe estar entre 1 y 180 minutos.";
  if (!inRange(s.shortBreakMinutes, 1, 60)) return "El descanso corto debe estar entre 1 y 60 minutos.";
  if (!inRange(s.longBreakMinutes, 1, 120)) return "El descanso largo debe estar entre 1 y 120 minutos.";
  if (!inRange(s.cyclesBeforeLongBreak, 1, 12)) return "Los ciclos antes del descanso largo deben estar entre 1 y 12.";
  return null;
}

export function phaseDurationMs(phase: PomodoroPhase, s: PomodoroSettings): number {
  const minutes = phase === "work" ? s.workMinutes : phase === "shortBreak" ? s.shortBreakMinutes : s.longBreakMinutes;
  return minutes * 60_000;
}

/** Fase siguiente tras terminar `phase`, dado el número de pomodoros de trabajo completados. */
export function nextPhase(phase: PomodoroPhase, completedWork: number, s: PomodoroSettings): { phase: PomodoroPhase; completedWork: number } {
  if (phase === "work") {
    const done = completedWork + 1;
    return { phase: done % s.cyclesBeforeLongBreak === 0 ? "longBreak" : "shortBreak", completedWork: done };
  }
  return { phase: "work", completedWork };
}

/** 1500000 → "25:00" */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
