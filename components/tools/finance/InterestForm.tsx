"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import ToolResult from "@/components/tools/ToolResult";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackEvent } from "@/lib/analytics/events";
import { COMPOUNDING_OPTIONS, amortizationSchedule, compoundInterest, simpleInterest, type Compounding } from "@/lib/tools/finance";
import { parseDecimal } from "@/lib/tools/grades";

const TOOL_ID = "calculadora-interes-compuesto";
type Mode = "compound" | "simple" | "amortization";
const usd = (n: number) => `$${n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InterestForm() {
  const [mode, setMode] = useState<Mode>("compound");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [compounding, setCompounding] = useState<Compounding>(12);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "finance" });
  }, []);

  const ready = principal.trim() && rate.trim() && time.trim();
  const P = parseDecimal(principal);
  const r = parseDecimal(rate);
  const t = parseDecimal(time);
  const interest = ready && mode !== "amortization" ? (mode === "simple" ? simpleInterest(P, r, t) : compoundInterest(P, r, t, compounding)) : null;
  const schedule = ready && mode === "amortization" ? amortizationSchedule(P, r, t) : null;
  const csv = schedule?.success ? ["Periodo;Cuota;Interés;Capital;Saldo", ...schedule.rows.map((x) => [x.period, x.payment, x.interest, x.principal, x.balance].join(";"))].join("\n") : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="md" className="space-y-4">
          <Select
            label="Cálculo"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            options={[
              { value: "compound", label: "Interés compuesto" },
              { value: "simple", label: "Interés simple" },
              { value: "amortization", label: "Tabla de amortización (cuota fija)" },
            ]}
          />
          <Input label={mode === "amortization" ? "Monto del préstamo ($)" : "Capital inicial ($)"} inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="Ej. 1000" />
          <Input label="Tasa de interés anual (%)" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Ej. 12" helperText="Tasa nominal anual." />
          <Input label={mode === "amortization" ? "Plazo (meses)" : "Tiempo (años)"} inputMode="decimal" value={time} onChange={(e) => setTime(e.target.value)} placeholder={mode === "amortization" ? "Ej. 12" : "Ej. 2"} />
          {mode === "compound" && (
            <Select label="Capitalización" value={String(compounding)} onChange={(e) => setCompounding(Number(e.target.value) as Compounding)} options={COMPOUNDING_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))} />
          )}
        </Card>
        <div className="space-y-4">
          {!ready && <Alert variant="info">Completa los datos para ver el resultado.</Alert>}
          {interest && !interest.success && <Alert variant="error">{interest.message}</Alert>}
          {interest && interest.success && (
            <ToolResult
              toolId={TOOL_ID}
              label="Monto final"
              value={usd(interest.finalAmount)}
              details={[
                { label: "Intereses ganados", value: usd(interest.interest) },
                ...(mode === "compound" ? [{ label: "Tasa efectiva anual", value: `${interest.effectiveAnnualRate}%` }] : []),
              ]}
            />
          )}
          {schedule && !schedule.success && <Alert variant="error">{schedule.message}</Alert>}
          {schedule && schedule.success && (
            <ToolResult
              toolId={TOOL_ID}
              label="Cuota mensual"
              value={usd(schedule.payment)}
              details={[
                { label: "Total pagado", value: usd(schedule.totalPaid) },
                { label: "Total de intereses", value: usd(schedule.totalInterest) },
              ]}
            />
          )}
        </div>
      </div>
      {schedule && schedule.success && (
        <Card padding="md" variant="outline" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text)]">Tabla de amortización</h2>
            <CopyButton value={csv} toolId={TOOL_ID} size="sm" variant="outline" label="Copiar para Excel" />
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-[var(--surface)] text-[var(--text-muted)]">
                <tr>
                  {["Periodo", "Cuota", "Interés", "Capital", "Saldo"].map((h) => (
                    <th key={h} className="px-2 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono text-[var(--text)]">
                {schedule.rows.map((row) => (
                  <tr key={row.period}>
                    <td className="px-2 py-1.5">{row.period}</td>
                    <td className="px-2 py-1.5">{usd(row.payment)}</td>
                    <td className="px-2 py-1.5">{usd(row.interest)}</td>
                    <td className="px-2 py-1.5">{usd(row.principal)}</td>
                    <td className="px-2 py-1.5">{usd(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
