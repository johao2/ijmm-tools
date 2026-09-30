"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import { solveLinearSystem, solveQuadratic } from "@/lib/tools/equations";
import { parseFraction, toDecimalString, toFractionString } from "@/lib/tools/fraction";
import { cols, parseMatrix } from "@/lib/tools/matrix";

const TOOL_ID = "resolver-ecuaciones";

type Mode = "quadratic" | "system";

const VARS = ["x", "y", "z", "w", "u", "v", "s", "t"];

function QuadraticSolver() {
  const [a, setA] = useState("1");
  const [b, setB] = useState("-5");
  const [c, setC] = useState("6");
  const fa = parseFraction(a);
  const fb = parseFraction(b);
  const fc = parseFraction(c);
  const ready = a.trim() && b.trim() && c.trim();
  const invalid = ready && (!fa || !fb || !fc);
  const r = ready && fa && fb && fc ? solveQuadratic(fa, fb, fc) : null;
  const kindText: Record<string, string> = {
    "two-real": "Dos raíces reales distintas",
    double: "Una raíz real doble",
    complex: "Dos raíces complejas conjugadas",
    linear: "Ecuación lineal (a = 0): una solución",
    identity: "Infinitas soluciones",
    none: "Sin solución",
  };
  const copy = r?.success ? r.roots.map((x, i) => `x${r.roots.length > 1 ? i + 1 : ""} = ${x.exact}${x.decimal !== x.exact ? ` ≈ ${x.decimal}` : ""}`).join("\n") : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="space-y-4">
        <p className="text-center font-mono text-lg text-[var(--text)]">a·x² + b·x + c = 0</p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="a" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} />
          <Input label="b" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} />
          <Input label="c" inputMode="decimal" value={c} onChange={(e) => setC(e.target.value)} />
        </div>
        <p className="text-xs text-[var(--text-muted)]">Admite enteros, decimales (0,5) y fracciones (1/3).</p>
      </Card>
      <div className="space-y-4">
        {!ready && <Alert variant="info">Completa a, b y c.</Alert>}
        {invalid && <Alert variant="error">Revisa los coeficientes: usa números como 2, −0,5 o 3/4.</Alert>}
        {r && !r.success && <Alert variant="error">{r.message}</Alert>}
        {r?.success && (
          <Card padding="md" variant="outline" className="space-y-3" aria-live="polite">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--text)]">{kindText[r.kind]}</h2>
              {copy && <CopyButton value={copy} toolId={TOOL_ID} size="sm" variant="outline" label="Copiar" />}
            </div>
            {r.roots.map((x, i) => (
              <div key={i} className="rounded-(--radius-md) bg-[var(--surface-secondary)] p-3">
                <p className="font-mono text-xl font-bold text-[var(--text)]">
                  x{r.roots.length > 1 ? <sub>{i + 1}</sub> : null} = {x.exact}
                </p>
                {x.decimal !== x.exact && <p className="font-mono text-sm text-[var(--text-muted)]">≈ {x.decimal}</p>}
              </div>
            ))}
            <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--text-muted)]">
              {r.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </Card>
        )}
      </div>
    </div>
  );
}

function SystemSolver() {
  const [text, setText] = useState("2 1 -1 8\n-3 -1 2 -11\n-2 1 2 -3");
  const parsed = parseMatrix(text);
  const n = parsed.success ? cols(parsed.matrix) - 1 : 0;
  const names = VARS.slice(0, Math.max(n, 0));
  const r = parsed.success ? solveLinearSystem(parsed.matrix, n <= VARS.length ? names : undefined) : null;

  const equations = parsed.success && n >= 1
    ? parsed.matrix.map((row) => {
        const terms = row.slice(0, n).map((v, j) => ({ v, name: names[j] })).filter((t) => t.v.n !== BigInt(0));
        const left = terms.length
          ? terms.map((t, k) => {
              const s = toFractionString(t.v);
              const negative = s.startsWith("-");
              const abs = negative ? s.slice(1) : s;
              const coef = abs === "1" ? "" : abs;
              return `${k === 0 ? (negative ? "−" : "") : negative ? " − " : " + "}${coef}${t.name}`;
            }).join("")
          : "0";
        return `${left} = ${toFractionString(row[n])}`;
      })
    : [];

  const copy = r?.success && r.kind === "unique" ? r.values.map((v, i) => `${names[i]} = ${toFractionString(v)}`).join("\n") : r?.success && r.kind === "infinite" ? r.expressions.join("\n") : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="space-y-4">
        <Textarea
          label="Matriz ampliada del sistema"
          rows={6}
          className="font-mono"
          value={text}
          onChange={(e) => setText(e.target.value)}
          helperText="Una ecuación por línea: los coeficientes de cada incógnita y al final el término independiente. Ej.: 2x + y − z = 8 se escribe 2 1 -1 8. Hasta 8 ecuaciones y 7 incógnitas."
        />
        {equations.length > 0 && (
          <div className="rounded-(--radius-md) bg-[var(--surface-secondary)] p-3 font-mono text-sm text-[var(--text)]">
            {equations.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}
      </Card>
      <div className="space-y-4">
        {!parsed.success && <Alert variant="error">{parsed.message}</Alert>}
        {r && !r.success && <Alert variant="error">{r.message}</Alert>}
        {r?.success && (
          <Card padding="md" variant="outline" className="space-y-3" aria-live="polite">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--text)]">
                {r.kind === "unique" ? "Solución única (sistema compatible determinado)" : r.kind === "infinite" ? "Infinitas soluciones (compatible indeterminado)" : "Sin solución (sistema incompatible)"}
              </h2>
              {copy && <CopyButton value={copy} toolId={TOOL_ID} size="sm" variant="outline" label="Copiar" />}
            </div>
            {r.kind === "unique" &&
              r.values.map((v, i) => (
                <p key={i} className="font-mono text-lg font-bold text-[var(--text)]">
                  {names[i]} = {toFractionString(v)}
                  {v.d !== BigInt(1) && <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">≈ {toDecimalString(v, 10)}</span>}
                </p>
              ))}
            {r.kind === "infinite" && (
              <>
                {r.expressions.map((e) => (
                  <p key={e} className="font-mono text-base font-semibold text-[var(--text)]">{e}</p>
                ))}
                <p className="text-sm text-[var(--text-muted)]">Da cualquier valor a las variables libres para obtener una solución particular.</p>
              </>
            )}
            {r.kind === "none" && <p className="text-sm text-[var(--text-muted)]">Rango de la matriz de coeficientes = {r.rank}; rango de la matriz ampliada = {r.augmentedRank}. Como son distintos, las ecuaciones se contradicen.</p>}
            {r.kind !== "none" && <p className="text-xs text-[var(--text-muted)]">Rango = {r.rank}, incógnitas = {n}. Resuelto por Gauss-Jordan con fracciones exactas.</p>}
          </Card>
        )}
      </div>
    </div>
  );
}

export default function EquationsForm() {
  const [mode, setMode] = useState<Mode>("quadratic");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "calculators" });
  }, []);

  return (
    <div className="space-y-6">
      <Select
        label="Tipo de ecuación"
        value={mode}
        onChange={(e) => setMode(e.target.value as Mode)}
        options={[
          { value: "quadratic", label: "Ecuación de segundo grado (ax² + bx + c = 0)" },
          { value: "system", label: "Sistema de ecuaciones lineales" },
        ]}
      />
      {mode === "quadratic" ? <QuadraticSolver /> : <SystemSolver />}
    </div>
  );
}
