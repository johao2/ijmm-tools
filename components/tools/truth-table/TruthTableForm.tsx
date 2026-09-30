"use client";

import { useEffect, useRef, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { trackEvent } from "@/lib/analytics/events";
import { buildTruthTable, formatFormula, parseFormula } from "@/lib/tools/truth-table";

const TOOL_ID = "generador-tablas-de-verdad";

const KEYS = ["¬", "∧", "∨", "⊕", "→", "↔", "(", ")", "p", "q", "r", "s"];

const CLASSIFICATION = {
  tautology: { title: "Tautología", text: "La proposición es verdadera en todos los casos." },
  contradiction: { title: "Contradicción", text: "La proposición es falsa en todos los casos." },
  contingency: { title: "Contingencia", text: "La proposición es verdadera en algunos casos y falsa en otros." },
} as const;

export default function TruthTableForm() {
  const [formula, setFormula] = useState("(p → q) ∧ p → q");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "calculators" });
  }, []);

  const insert = (symbol: string) => {
    const el = input.current;
    const start = el?.selectionStart ?? formula.length;
    const end = el?.selectionEnd ?? formula.length;
    const next = formula.slice(0, start) + symbol + formula.slice(end);
    setFormula(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };

  const parsed = parseFormula(formula);
  const table = parsed.success ? buildTruthTable(parsed.ast, parsed.variables) : null;
  const vf = (b: boolean) => (b ? "V" : "F");
  const copy = table ? [table.columns.join("\t"), ...table.rows.map((r) => r.map(vf).join("\t"))].join("\n") : "";

  return (
    <div className="space-y-6">
      <Card padding="md" className="space-y-3">
        <Input ref={input} label="Proposición" value={formula} onChange={(e) => setFormula(e.target.value)} className="font-mono text-lg" spellCheck={false} autoCapitalize="off" autoComplete="off" />
        <div className="flex flex-wrap gap-2" aria-label="Insertar símbolo">
          {KEYS.map((k) => (
            <Button key={k} type="button" variant="outline" size="sm" className="min-w-10 font-mono" onClick={() => insert(k)}>
              {k}
            </Button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)]">También puedes escribir ~ ! NOT · & ^ AND · | OR · XOR · -&gt; · &lt;-&gt;. Variables de una letra; hasta 6 variables.</p>
      </Card>

      {!parsed.success && <Alert variant="error">{parsed.message}</Alert>}
      {table && parsed.success && (
        <Card padding="md" variant="outline" className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div aria-live="polite">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Resultado</p>
              <p className="text-2xl font-extrabold text-[var(--text)]">{CLASSIFICATION[table.classification].title}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {CLASSIFICATION[table.classification].text} Verdadera en {table.trueCount} de {table.rows.length} filas.
              </p>
              <p className="mt-1 font-mono text-sm text-[var(--text)]">{formatFormula(parsed.ast)}</p>
            </div>
            <CopyButton value={copy} toolId={TOOL_ID} size="sm" variant="outline" label="Copiar tabla" />
          </div>
          <div className="max-h-[32rem] overflow-auto">
            <table className="w-full border-collapse text-center font-mono text-sm">
              <thead className="sticky top-0 bg-[var(--surface)]">
                <tr>
                  {table.columns.map((c, i) => (
                    <th key={i} scope="col" className={`whitespace-nowrap border-b-2 border-[var(--border)] px-3 py-2 font-semibold ${i === table.columns.length - 1 ? "text-[var(--primary)]" : "text-[var(--text)]"} ${i === table.variables.length ? "border-l-2" : ""}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={r} className="odd:bg-[var(--surface-secondary)]">
                    {row.map((v, i) => (
                      <td key={i} className={`px-3 py-1 ${i === table.variables.length ? "border-l-2 border-[var(--border)]" : ""} ${i === row.length - 1 ? `font-bold ${v ? "text-[var(--success)]" : "text-[var(--error)]"}` : "text-[var(--text)]"}`}>
                        {vf(v)}
                      </td>
                    ))}
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
