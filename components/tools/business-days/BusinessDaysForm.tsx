"use client";

import { useEffect, useState } from "react";
import ToolResult from "@/components/tools/ToolResult";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import {
  addBusinessDays,
  countBusinessDays,
  ecuadorHolidays,
  FIRST_RULE_YEAR,
  LAST_RULE_YEAR,
  toDayNumber,
  type Holiday,
} from "@/lib/tools/business-days";

const TOOL_ID = "calculadora-dias-habiles";

type Mode = "count" | "add";

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** "2025-10-10" → "viernes 10/10/2025" */
function longDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const day = toDayNumber(iso);
  return `${WEEKDAYS[(((day + 4) % 7) + 7) % 7]} ${d}/${m}/${y}`;
}

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

function holidaysForYears(from: number, to: number): Holiday[] {
  const out: Holiday[] = [];
  for (let y = Math.max(from, FIRST_RULE_YEAR); y <= Math.min(to, LAST_RULE_YEAR); y++) out.push(...ecuadorHolidays(y));
  return out;
}

export default function BusinessDaysForm() {
  const [mode, setMode] = useState<Mode>("count");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [amount, setAmount] = useState("10");
  const [useEcuador, setUseEcuador] = useState(true);
  const [saturday, setSaturday] = useState(false);
  const [extraText, setExtraText] = useState("");
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "study" });
    const today = localToday();
    setStart(today);
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setEnd(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  const extras = extraText.split(/[\s,;]+/).filter(Boolean);
  const invalidExtras = extras.filter((e) => !Number.isFinite(toDayNumber(e)));

  const startYear = Number(start.slice(0, 4));
  const amountValue = Number(amount);
  const endYear = mode === "count" ? Number(end.slice(0, 4)) : startYear + Math.sign(amountValue || 1) * 21;
  const [yFrom, yTo] = [Math.min(startYear, endYear) - 1, Math.max(startYear, endYear) + 1];
  const legal = useEcuador && Number.isFinite(yFrom) ? holidaysForYears(yFrom, yTo) : [];
  const activeLegal = legal.filter((h) => !removed.has(h.date));
  const holidayDates = [...activeLegal.map((h) => h.date), ...extras.filter((e) => !invalidExtras.includes(e))];
  const options = { holidays: holidayDates, saturdayIsWorkday: saturday };

  const count = mode === "count" && start && end ? countBusinessDays(start, end, options) : null;
  const added = mode === "add" && start && amount.trim() ? addBusinessDays(start, amountValue, options) : null;

  // Feriados de ley dentro del intervalo calculado (para revisarlos y quitarlos si hace falta)
  const [rangeFrom, rangeTo] = mode === "count" ? [start < end ? start : end, start < end ? end : start] : added?.success ? [start < added.date ? start : added.date, start < added.date ? added.date : start] : ["", ""];
  const legalInRange = legal.filter((h) => h.date >= rangeFrom && h.date <= rangeTo);
  const outsideRules = useEcuador && (startYear < FIRST_RULE_YEAR || (mode === "count" && Number(end.slice(0, 4)) < FIRST_RULE_YEAR));

  const toggle = (date: string) =>
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="space-y-4">
        <Select
          label="¿Qué quieres calcular?"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          options={[
            { value: "count", label: "Días hábiles entre dos fechas" },
            { value: "add", label: "Fecha después de N días hábiles (plazos)" },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Fecha inicial" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          {mode === "count" ? (
            <Input label="Fecha final" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          ) : (
            <Input label="Días hábiles a sumar" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} helperText="Usa un número negativo para restar." />
          )}
        </div>
        <Checkbox label="Excluir feriados nacionales de Ecuador" helperText="Con los traslados del Código del Trabajo (reforma R. O. S. 906, 2016)." checked={useEcuador} onChange={(e) => setUseEcuador(e.target.checked)} />
        <Checkbox label="Contar el sábado como día hábil" checked={saturday} onChange={(e) => setSaturday(e.target.checked)} />
        <Textarea
          label="Otras fechas no laborables (opcional)"
          rows={3}
          className="font-mono"
          value={extraText}
          onChange={(e) => setExtraText(e.target.value)}
          placeholder="2025-11-10"
          helperText="Feriados locales, días decretados o vacaciones de tu institución. Formato AAAA-MM-DD, una por línea."
        />
        {invalidExtras.length > 0 && <Alert variant="warning">Fechas no válidas (se ignoran): {invalidExtras.slice(0, 5).join(", ")}</Alert>}
      </Card>

      <div className="space-y-4">
        {count && !count.success && <Alert variant="error">{count.message}</Alert>}
        {added && !added.success && <Alert variant="error">{added.message}</Alert>}
        {count?.success && (
          <ToolResult
            toolId={TOOL_ID}
            label="Días hábiles"
            value={String(count.businessDays)}
            details={[
              { label: "Días calendario (ambas fechas incluidas)", value: String(count.calendarDays) },
              { label: saturday ? "Domingos" : "Sábados y domingos", value: String(count.weekendDays) },
              { label: "Feriados y fechas excluidas entre semana", value: String(count.holidaysOnWorkdays.length) },
            ]}
          />
        )}
        {added?.success && (
          <ToolResult
            toolId={TOOL_ID}
            label={amountValue >= 0 ? "Fecha de vencimiento" : "Fecha resultante"}
            value={longDate(added.date)}
            copyableValue={added.date}
            details={[
              { label: "Días calendario transcurridos", value: String(Math.abs(added.calendarDays)) },
              { label: "Feriados y fechas excluidas que se saltaron", value: String(added.skippedHolidays.length) },
            ]}
          />
        )}
        {outsideRules && <Alert variant="warning">Las reglas de traslado vigentes rigen desde {FIRST_RULE_YEAR}. Para fechas anteriores agrega los feriados manualmente.</Alert>}
        {useEcuador && legalInRange.length > 0 && (
          <Card padding="md" variant="outline" className="space-y-2">
            <h2 className="text-sm font-bold text-[var(--text)]">Feriados nacionales en el intervalo</h2>
            <p className="text-xs text-[var(--text-muted)]">Desmarca un feriado si un decreto ejecutivo lo cambió o si en tu caso no aplica.</p>
            <ul className="divide-y divide-[var(--border)] text-sm">
              {legalInRange.map((h) => (
                <li key={h.date + h.name} className="flex items-start gap-3 py-2">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--primary)]" checked={!removed.has(h.date)} onChange={() => toggle(h.date)} aria-label={`Excluir ${h.name}`} />
                  <span className="text-[var(--text)]">
                    <span className="font-semibold">{longDate(h.date)}</span> · {h.name}
                    {h.movedFrom && <span className="block text-xs text-[var(--text-muted)]">Trasladado desde el {longDate(h.movedFrom)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <p className="text-xs text-[var(--text-muted)]">
          Entre dos fechas se cuentan ambas (como DIAS.LAB de Excel). Al sumar días hábiles no se cuenta la fecha inicial (como DIA.LAB). No incluye feriados provinciales o cantonales ni cambios por decreto: agrégalos en “Otras fechas”.
        </p>
      </div>
    </div>
  );
}
