"use client";

import { useEffect, useState } from "react";
import ToolResult from "@/components/tools/ToolResult";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackEvent } from "@/lib/analytics/events";
import { parseDecimal } from "@/lib/tools/grades";
import { ruleOfThree, type RuleOfThreeType } from "@/lib/tools/rule-of-three";

const TOOL_ID = "regla-de-tres";

export default function RuleOfThreeForm() {
  const [type, setType] = useState<RuleOfThreeType>("direct");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "calculators" });
  }, []);

  const ready = a.trim() && b.trim() && c.trim();
  const result = ready ? ruleOfThree(parseDecimal(a), parseDecimal(b), parseDecimal(c), type) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="space-y-5">
        <Select
          label="Tipo de regla de tres"
          value={type}
          onChange={(e) => setType(e.target.value as RuleOfThreeType)}
          options={[
            { value: "direct", label: "Directa (más → más)" },
            { value: "inverse", label: "Inversa (más → menos)" },
          ]}
        />
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <Input label="A" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="Ej. 3" />
          <span className="pb-3 text-sm font-bold text-[var(--text-muted)]">→</span>
          <Input label="B" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="Ej. 6" />
          <Input label="C" inputMode="decimal" value={c} onChange={(e) => setC(e.target.value)} placeholder="Ej. 5" />
          <span className="pb-3 text-sm font-bold text-[var(--text-muted)]">→</span>
          <div className="flex h-11 items-center justify-center rounded-(--radius-md) border border-dashed border-[var(--border)] text-lg font-bold text-[var(--primary)]">x</div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">Lectura: si A corresponde a B, ¿a cuánto corresponde C?</p>
      </Card>
      <div className="space-y-4">
        {!result && <Alert variant="info">Completa A, B y C para calcular x.</Alert>}
        {result && !result.success && <Alert variant="error">{result.message}</Alert>}
        {result && result.success && (
          <ToolResult toolId={TOOL_ID} label="Valor de x" value={String(result.result)} details={[{ label: "Fórmula aplicada", value: result.formula }]} />
        )}
      </div>
    </div>
  );
}
