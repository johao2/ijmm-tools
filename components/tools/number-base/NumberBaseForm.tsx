"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackEvent } from "@/lib/analytics/events";
import { convertBase, groupBinary } from "@/lib/tools/number-base";

const TOOL_ID = "conversor-bases-numericas";
const FROM_OPTIONS = [
  { value: "10", label: "Decimal (base 10)" },
  { value: "2", label: "Binario (base 2)" },
  { value: "8", label: "Octal (base 8)" },
  { value: "16", label: "Hexadecimal (base 16)" },
  ...Array.from({ length: 35 }, (_, i) => i + 2)
    .filter((b) => ![2, 8, 10, 16].includes(b))
    .map((b) => ({ value: String(b), label: `Base ${b}` })),
];

export default function NumberBaseForm() {
  const [value, setValue] = useState("");
  const [fromBase, setFromBase] = useState("10");
  const [extraBase, setExtraBase] = useState("");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "developer-tools" });
  }, []);

  const extra = extraBase.trim() ? Number(extraBase) : undefined;
  const result = value.trim() ? convertBase(value, Number(fromBase), extra) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="space-y-4">
        <Input label="Número" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ej. 255, 1010, FF" autoComplete="off" spellCheck={false} />
        <Select label="Está escrito en" value={fromBase} options={FROM_OPTIONS} onChange={(e) => setFromBase(e.target.value)} />
        <Input label="Base adicional (opcional, 2 a 36)" inputMode="numeric" value={extraBase} onChange={(e) => setExtraBase(e.target.value)} placeholder="Ej. 36" />
      </Card>
      <div className="space-y-3">
        {!result && <Alert variant="info">Escribe un número entero para convertirlo.</Alert>}
        {result && !result.success && <Alert variant="error">{result.message}</Alert>}
        {result &&
          result.success &&
          result.conversions.map((c) => (
            <Card key={c.base} variant="outline" padding="md" className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-muted)]">{c.name} · base {c.base}</p>
                <p className="break-all font-mono text-base font-bold text-[var(--text)]">{c.base === 2 ? groupBinary(c.value) : c.value}</p>
              </div>
              <CopyButton value={c.value} toolId={TOOL_ID} size="sm" variant="outline" />
            </Card>
          ))}
      </div>
    </div>
  );
}
