"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { trackEvent } from "@/lib/analytics/events";
import {
  DEFAULT_POMODORO,
  PHASE_LABELS,
  formatClock,
  nextPhase,
  phaseDurationMs,
  validateSettings,
  type PomodoroPhase,
  type PomodoroSettings,
} from "@/lib/tools/pomodoro";

const TOOL_ID = "temporizador-pomodoro";

/** Aviso sonoro corto generado con Web Audio (sin archivos externos). */
function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch {
    // Sin soporte de audio: se omite el sonido
  }
}

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO);
  const [draft, setDraft] = useState({ work: "25", short: "5", long: "15", cycles: "4" });
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [completed, setCompleted] = useState(0);
  const [remaining, setRemaining] = useState(phaseDurationMs("work", DEFAULT_POMODORO));
  const [running, setRunning] = useState(false);
  const endAt = useRef<number | null>(null);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "study" });
  }, []);

  const advance = useCallback(() => {
    const next = nextPhase(phase, completed, settings);
    setPhase(next.phase);
    setCompleted(next.completedWork);
    setRemaining(phaseDurationMs(next.phase, settings));
    endAt.current = null;
    setRunning(false);
  }, [phase, completed, settings]);

  useEffect(() => {
    if (!running) return;
    // El tiempo se calcula con el reloj del sistema: sigue exacto aunque la pestaña quede en segundo plano
    if (endAt.current === null) endAt.current = Date.now() + remaining;
    const timer = setInterval(() => {
      const left = (endAt.current ?? 0) - Date.now();
      if (left <= 0) {
        beep();
        if (phase === "work") trackEvent("tool_complete", { toolId: TOOL_ID });
        advance();
      } else setRemaining(left);
    }, 250);
    return () => clearInterval(timer);
  }, [running, remaining, advance, phase]);

  useEffect(() => {
    document.title = running ? `${formatClock(remaining)} · ${PHASE_LABELS[phase]}` : "Temporizador Pomodoro | IJMM Tools";
  }, [running, remaining, phase]);

  const toggle = () => {
    if (running) {
      endAt.current = null;
      setRunning(false);
    } else setRunning(true);
  };
  const reset = () => {
    endAt.current = null;
    setRunning(false);
    setRemaining(phaseDurationMs(phase, settings));
  };

  const candidate: PomodoroSettings = {
    workMinutes: Number(draft.work),
    shortBreakMinutes: Number(draft.short),
    longBreakMinutes: Number(draft.long),
    cyclesBeforeLongBreak: Number(draft.cycles),
  };
  const settingsError = validateSettings(candidate);
  const apply = () => {
    if (settingsError) return;
    setSettings(candidate);
    endAt.current = null;
    setRunning(false);
    setRemaining(phaseDurationMs(phase, candidate));
  };

  const total = phaseDurationMs(phase, settings);
  const progress = Math.min(100, ((total - remaining) / total) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card padding="lg" className="space-y-6 text-center">
        <div className="flex justify-center gap-2">
          {(Object.keys(PHASE_LABELS) as PomodoroPhase[]).map((p) => (
            <span key={p} className={`rounded-full px-3 py-1 text-xs font-semibold ${p === phase ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-secondary)] text-[var(--text-muted)]"}`}>
              {PHASE_LABELS[p]}
            </span>
          ))}
        </div>
        <p className="font-mono text-7xl font-bold tabular-nums text-[var(--text)] sm:text-8xl" aria-live="polite">{formatClock(remaining)}</p>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
          <div className="h-full bg-[var(--primary)] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" size="lg" onClick={toggle}>
            {running ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
            {running ? "Pausar" : "Iniciar"}
          </Button>
          <Button type="button" size="lg" variant="outline" onClick={reset}>
            <RotateCcw className="h-5 w-5" aria-hidden="true" /> Reiniciar
          </Button>
          <Button type="button" size="lg" variant="ghost" onClick={advance}>
            <SkipForward className="h-5 w-5" aria-hidden="true" /> Saltar
          </Button>
        </div>
        <p className="text-sm text-[var(--text-muted)]">Pomodoros completados: <strong className="text-[var(--text)]">{completed}</strong></p>
      </Card>
      <Card padding="md" className="space-y-3">
        <h2 className="text-sm font-bold text-[var(--text)]">Configuración (minutos)</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Enfoque" inputMode="numeric" value={draft.work} onChange={(e) => setDraft({ ...draft, work: e.target.value })} />
          <Input label="Descanso corto" inputMode="numeric" value={draft.short} onChange={(e) => setDraft({ ...draft, short: e.target.value })} />
          <Input label="Descanso largo" inputMode="numeric" value={draft.long} onChange={(e) => setDraft({ ...draft, long: e.target.value })} />
          <Input label="Bloques antes del largo" inputMode="numeric" value={draft.cycles} onChange={(e) => setDraft({ ...draft, cycles: e.target.value })} />
        </div>
        {settingsError && <Alert variant="error">{settingsError}</Alert>}
        <Button type="button" variant="secondary" onClick={apply} disabled={!!settingsError}>
          Aplicar configuración
        </Button>
      </Card>
    </div>
  );
}
