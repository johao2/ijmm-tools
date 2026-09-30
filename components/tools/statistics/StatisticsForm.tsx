"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import { describe, parseNumberList } from "@/lib/tools/statistics";

const TOOL_ID = "calculadora-estadistica";

export default function StatisticsForm() {
  const [text, setText] = useState("");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "statistics" });
  }, []);

  const parsed = parseNumberList(text);
  const result = parsed.values.length ? describe(parsed.values) : null;
  const s = result?.success ? result.stats : null;

  const rows = s
    ? [
        ["Cantidad de datos (n)", s.count],
        ["Suma", s.sum],
        ["Media (promedio)", s.mean],
        ["Mediana", s.median],
        ["Moda", s.modes.length ? s.modes.join("; ") : "Sin moda"],
        ["Mínimo", s.min],
        ["Máximo", s.max],
        ["Rango", s.range],
        ["Varianza muestral (n − 1)", s.sampleVariance],
        ["Desviación estándar muestral", s.sampleStdDev],
        ["Varianza poblacional (n)", s.populationVariance],
        ["Desviación estándar poblacional", s.populationStdDev],
        ["Primer cuartil (Q1)", s.q1],
        ["Tercer cuartil (Q3)", s.q3],
        ["Rango intercuartílico (Q3 − Q1)", s.iqr],
        ["Coeficiente de variación", s.coefficientOfVariation === null ? "No aplica (media = 0)" : `${s.coefficientOfVariation}%`],
      ]
    : [];
  const summary = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="space-y-3">
        <Textarea
          label="Datos"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Pega tus datos, uno por línea o separados por espacios, comas o punto y coma.\nEj.: 12  15  15  18  20  22"}
          helperText="Puedes copiar una columna de Excel. Con coma decimal (3,5) separa los datos con punto y coma o saltos de línea."
        />
        {parsed.invalid.length > 0 && (
          <Alert variant="warning">Se ignoraron {parsed.invalid.length} valor(es) no numérico(s): {parsed.invalid.slice(0, 5).join(", ")}{parsed.invalid.length > 5 ? "…" : ""}</Alert>
        )}
      </Card>
      <div className="space-y-3">
        {!result && <Alert variant="info">Ingresa tus datos para ver los resultados.</Alert>}
        {result && !result.success && <Alert variant="error">{result.message}</Alert>}
        {s && (
          <Card padding="md" variant="outline" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text)]">Resultados</h2>
              <CopyButton value={summary} toolId={TOOL_ID} size="sm" variant="outline" label="Copiar todo" />
            </div>
            <dl className="divide-y divide-[var(--border)]">
              {rows.map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-4 py-2 text-sm">
                  <dt className="text-[var(--text-muted)]">{k}</dt>
                  <dd className="text-right font-mono font-semibold text-[var(--text)]">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-[var(--text-muted)]">Datos ordenados: {s.sorted.join(", ")}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
