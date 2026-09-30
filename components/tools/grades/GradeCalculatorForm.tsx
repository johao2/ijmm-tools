"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ToolResult from "@/components/tools/ToolResult";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackEvent } from "@/lib/analytics/events";
import { parseDecimal, requiredGrade, weightedAverage, type GradeItem } from "@/lib/tools/grades";

const TOOL_ID = "calculadora-promedio-ponderado";

interface Row {
  id: number;
  name: string;
  grade: string;
  weight: string;
}

const SCALES = [
  { value: "10", label: "Sobre 10" },
  { value: "20", label: "Sobre 20" },
  { value: "100", label: "Sobre 100" },
];

let nextId = 4;

export default function GradeCalculatorForm() {
  const [scale, setScale] = useState("10");
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: "Deberes", grade: "", weight: "30" },
    { id: 2, name: "Parcial", grade: "", weight: "30" },
    { id: 3, name: "Examen final", grade: "", weight: "40" },
  ]);
  const [target, setTarget] = useState("7");
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "grades" });
  }, []);

  const maxScale = Number(scale);
  const filled = rows.filter((r) => r.grade.trim() !== "");
  const items: GradeItem[] = filled.map((r) => ({ grade: parseDecimal(r.grade), weight: parseDecimal(r.weight) }));
  const average = filled.length > 0 ? weightedAverage(items, maxScale) : null;
  const pendingWeight = rows.filter((r) => r.grade.trim() === "").reduce((sum, r) => sum + (parseDecimal(r.weight) || 0), 0);
  const remainingWeight = remaining.trim() ? parseDecimal(remaining) : pendingWeight;
  const needed = remainingWeight > 0 && target.trim() ? requiredGrade(items, remainingWeight, parseDecimal(target), maxScale) : null;

  const update = (id: number, field: keyof Row, value: string) => setRows((list) => list.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card padding="md" className="space-y-4">
        <div className="max-w-48">
          <Select label="Escala de notas" value={scale} options={SCALES} onChange={(e) => setScale(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_auto] gap-2 text-xs font-semibold text-[var(--text-muted)] sm:grid">
            <span>Componente</span>
            <span>Nota (0 a {scale})</span>
            <span>Peso (%)</span>
            <span className="w-9" />
          </div>
          {rows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-2 gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
              <Input aria-label={`Nombre del componente ${index + 1}`} className="col-span-2 sm:col-span-1" placeholder={`Componente ${index + 1}`} value={row.name} onChange={(e) => update(row.id, "name", e.target.value)} />
              <Input aria-label={`Nota del componente ${index + 1}`} inputMode="decimal" placeholder="Pendiente" value={row.grade} onChange={(e) => update(row.id, "grade", e.target.value)} />
              <Input aria-label={`Peso del componente ${index + 1}`} inputMode="decimal" placeholder="%" value={row.weight} onChange={(e) => update(row.id, "weight", e.target.value)} />
              <Button type="button" variant="ghost" size="sm" aria-label={`Eliminar componente ${index + 1}`} onClick={() => setRows((list) => list.filter((r) => r.id !== row.id))} disabled={rows.length === 1}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setRows((list) => [...list, { id: nextId++, name: "", grade: "", weight: "" }])}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Agregar componente
          </Button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Deja la nota vacía en los componentes que aún no rindes: su peso se usa para calcular la nota que necesitas. Puedes escribir decimales con punto o coma.
        </p>
        <div className="grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
          <Input label="Nota objetivo (para aprobar)" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          <Input label="Peso pendiente (%)" inputMode="decimal" placeholder={`${pendingWeight || 0} (automático)`} helperText="Opcional: si lo dejas vacío se suma el peso de las notas pendientes." value={remaining} onChange={(e) => setRemaining(e.target.value)} />
        </div>
      </Card>

      <div className="space-y-4">
        {!average && <Alert variant="info">Escribe al menos una nota para ver tu promedio.</Alert>}
        {average && !average.success && <Alert variant="error">{average.message}</Alert>}
        {average && average.success && (
          <ToolResult
            toolId={TOOL_ID}
            label={average.totalWeight < 100 ? `Promedio parcial (sobre el ${average.totalWeight}% evaluado)` : "Promedio final"}
            value={String(average.average)}
            unit={` / ${scale}`}
            details={[
              { label: "Puntos acumulados", value: `${average.weightedPoints} de ${scale}` },
              { label: "Peso evaluado", value: `${average.totalWeight}%` },
            ]}
          />
        )}
        {needed && !needed.success && <Alert variant="error">{needed.message}</Alert>}
        {needed && needed.success && (
          <Alert variant={needed.alreadyReached ? "success" : needed.achievable ? "info" : "warning"} title="Nota que necesitas">
            {needed.alreadyReached
              ? `Ya alcanzaste la nota objetivo de ${target}: aunque obtengas 0 en el ${remainingWeight}% pendiente, llegas a ${target}.`
              : needed.achievable
                ? `Necesitas al menos ${needed.required} sobre ${scale} en el ${remainingWeight}% pendiente para llegar a ${target}.`
                : `Necesitarías ${needed.required} sobre ${scale}, que supera la nota máxima. Con las notas actuales no es posible llegar a ${target}.`}
          </Alert>
        )}
      </div>
    </div>
  );
}
