"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import { parseDecimal } from "@/lib/tools/grades";
import { evaluateInvestment, parseFlows } from "@/lib/tools/investment";

const TOOL_ID = "calculadora-van-tir";

const money = (n: number) => n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n: number, d = 4) => n.toLocaleString("es-EC", { maximumFractionDigits: d });

export default function InvestmentForm() {
  const [rate, setRate] = useState("10");
  const [flowsText, setFlowsText] = useState("-1000\n300\n400\n500");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "finance" });
  }, []);

  const flows = parseFlows(flowsText);
  const rateValue = parseDecimal(rate);
  const result = flows.success && rate.trim() ? evaluateInvestment(rateValue, flows.flows) : null;

  const payback = (p: { period: number | null; interpolated: number | null }) =>
    p.period === null ? "No se recupera en el horizonte" : `En el periodo ${p.period} (≈ ${num(p.interpolated ?? p.period, 2)} periodos)`;

  const summary =
    result?.success
      ? [
          `Tasa de descuento: ${rate}%`,
          `VAN: ${money(result.npv)}`,
          `TIR: ${result.irr.length ? result.irr.map((r) => `${num(r)}%`).join(" y ") : "no existe"}`,
          result.profitabilityIndex !== null ? `Índice de rentabilidad: ${num(result.profitabilityIndex)}` : "",
          `Recuperación simple: ${payback(result.payback)}`,
          `Recuperación descontada: ${payback(result.discountedPayback)}`,
        ].filter(Boolean).join("\n")
      : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Card padding="md" className="space-y-4">
        <Input label="Tasa de descuento por periodo (%)" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} helperText="Costo de oportunidad o tasa mínima exigida (TMAR)." />
        <Textarea
          label="Flujos de caja por periodo"
          rows={8}
          className="font-mono"
          value={flowsText}
          onChange={(e) => setFlowsText(e.target.value)}
          helperText="Uno por línea, empezando por el periodo 0 (la inversión, en negativo). Sin separador de miles; coma o punto decimal. Hasta 100 periodos."
        />
      </Card>
      <div className="space-y-4">
        {!flows.success && <Alert variant="error">{flows.message}</Alert>}
        {result && !result.success && <Alert variant="error">{result.message}</Alert>}
        {result?.success && (
          <>
            <Card padding="md" variant="outline" className="space-y-3" aria-live="polite">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-[var(--text)]">Resultados</h2>
                <CopyButton value={summary} toolId={TOOL_ID} size="sm" variant="outline" label="Copiar" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-(--radius-md) bg-[var(--surface-secondary)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">VAN</p>
                  <p className={`text-2xl font-extrabold ${result.npv > 0 ? "text-[var(--success)]" : result.npv < 0 ? "text-[var(--error)]" : "text-[var(--text)]"}`}>{money(result.npv)}</p>
                </div>
                <div className="rounded-(--radius-md) bg-[var(--surface-secondary)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">TIR</p>
                  <p className="text-2xl font-extrabold text-[var(--text)]">{result.irr.length ? result.irr.map((r) => `${num(r)} %`).join(" · ") : "No existe"}</p>
                </div>
              </div>
              <dl className="divide-y divide-[var(--border)] text-sm">
                {result.profitabilityIndex !== null && (
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-[var(--text-muted)]">Índice de rentabilidad (VP flujos futuros ÷ inversión)</dt>
                    <dd className="font-mono font-semibold text-[var(--text)]">{num(result.profitabilityIndex)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-[var(--text-muted)]">Recuperación simple</dt>
                  <dd className="text-right font-semibold text-[var(--text)]">{payback(result.payback)}</dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-[var(--text-muted)]">Recuperación descontada</dt>
                  <dd className="text-right font-semibold text-[var(--text)]">{payback(result.discountedPayback)}</dd>
                </div>
              </dl>
              {result.decision === "accept" && <Alert variant="success">VAN positivo: con una tasa de {rate} % el proyecto genera valor.</Alert>}
              {result.decision === "reject" && <Alert variant="warning">VAN negativo: con una tasa de {rate} % el proyecto no alcanza la rentabilidad exigida.</Alert>}
              {result.decision === "indifferent" && <Alert variant="info">VAN = 0: el proyecto rinde exactamente la tasa exigida.</Alert>}
              {result.irr.length === 0 && <p className="text-xs text-[var(--text-muted)]">No existe TIR: los flujos no cambian de signo o el VAN no llega a 0 entre −99 % y 10 000 %.</p>}
              {result.irr.length > 1 && <p className="text-xs text-[var(--text-muted)]">Los flujos cambian de signo {result.signChanges} veces y hay varias TIR. En este caso decide con el VAN.</p>}
              <p className="text-xs text-[var(--text-muted)]">La recuperación en periodos fraccionarios usa interpolación lineal dentro del periodo.</p>
            </Card>
            <Card padding="md" variant="outline" className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--text)]">Flujos descontados</h2>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-right text-xs">
                  <thead className="sticky top-0 bg-[var(--surface)] text-[var(--text-muted)]">
                    <tr>
                      {["Periodo", "Flujo", "Factor 1/(1+i)ᵗ", "Valor presente", "Acumulado", "VP acumulado"].map((h) => (
                        <th key={h} scope="col" className="px-2 py-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[var(--text)]">
                    {result.rows.map((r) => (
                      <tr key={r.period} className="border-t border-[var(--border)]">
                        <td className="px-2 py-1">{r.period}</td>
                        <td className="px-2 py-1">{money(r.flow)}</td>
                        <td className="px-2 py-1">{num(r.discountFactor, 6)}</td>
                        <td className="px-2 py-1">{money(r.presentValue)}</td>
                        <td className="px-2 py-1">{money(r.cumulative)}</td>
                        <td className="px-2 py-1">{money(r.cumulativePresentValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
