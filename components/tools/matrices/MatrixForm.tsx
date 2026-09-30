"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import MatrixView, { matrixToText } from "@/components/tools/matrices/MatrixView";
import ToolResult from "@/components/tools/ToolResult";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import { toDecimalString, toFractionString } from "@/lib/tools/fraction";
import {
  addMatrices,
  determinant,
  inverse,
  multiplyMatrices,
  parseMatrix,
  rank,
  rref,
  subtractMatrices,
  transpose,
  type Matrix,
} from "@/lib/tools/matrix";

const TOOL_ID = "calculadora-matrices";

type Operation = "det" | "inv" | "transpose" | "rank" | "rref" | "add" | "sub" | "mul";

const OPERATIONS: { value: Operation; label: string; needsB?: boolean }[] = [
  { value: "det", label: "Determinante de A" },
  { value: "inv", label: "Inversa de A (A⁻¹)" },
  { value: "transpose", label: "Traspuesta de A (Aᵀ)" },
  { value: "rank", label: "Rango de A" },
  { value: "rref", label: "Forma escalonada reducida de A (Gauss-Jordan)" },
  { value: "add", label: "Suma A + B", needsB: true },
  { value: "sub", label: "Resta A − B", needsB: true },
  { value: "mul", label: "Producto A × B", needsB: true },
];

type Outcome = { kind: "matrix"; matrix: Matrix; title: string } | { kind: "scalar"; value: string; decimal?: string; title: string } | { kind: "error"; message: string };

function compute(op: Operation, a: Matrix, b: Matrix | null): Outcome {
  switch (op) {
    case "det": {
      const r = determinant(a);
      return r.success ? { kind: "scalar", title: "det(A)", value: toFractionString(r.value), decimal: toDecimalString(r.value, 10) } : { kind: "error", message: r.message };
    }
    case "inv": {
      const r = inverse(a);
      return r.success ? { kind: "matrix", title: "A⁻¹", matrix: r.matrix } : { kind: "error", message: r.message };
    }
    case "transpose":
      return { kind: "matrix", title: "Aᵀ", matrix: transpose(a) };
    case "rank":
      return { kind: "scalar", title: "Rango de A", value: String(rank(a)) };
    case "rref":
      return { kind: "matrix", title: "Forma escalonada reducida de A", matrix: rref(a).matrix };
    default: {
      if (!b) return { kind: "error", message: "Escribe la matriz B." };
      const r = op === "add" ? addMatrices(a, b) : op === "sub" ? subtractMatrices(a, b) : multiplyMatrices(a, b);
      const title = op === "add" ? "A + B" : op === "sub" ? "A − B" : "A × B";
      return r.success ? { kind: "matrix", title, matrix: r.matrix } : { kind: "error", message: r.message };
    }
  }
}

export default function MatrixForm() {
  const [op, setOp] = useState<Operation>("det");
  const [textA, setTextA] = useState("2 -1 0\n-1 2 -1\n0 -1 2");
  const [textB, setTextB] = useState("1 0 0\n0 1 0\n0 0 1");
  const [decimals, setDecimals] = useState(false);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "calculators" });
  }, []);

  const needsB = OPERATIONS.find((o) => o.value === op)?.needsB ?? false;
  const a = parseMatrix(textA);
  const b = needsB ? parseMatrix(textB) : null;
  const outcome: Outcome | null = !a.success ? { kind: "error", message: `Matriz A: ${a.message}` } : b && !b.success ? { kind: "error", message: `Matriz B: ${b.message}` } : compute(op, a.matrix, b?.success ? b.matrix : null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="space-y-4">
        <Select label="Operación" value={op} onChange={(e) => setOp(e.target.value as Operation)} options={OPERATIONS.map((o) => ({ value: o.value, label: o.label }))} />
        <Textarea label="Matriz A" rows={5} className="font-mono" value={textA} onChange={(e) => setTextA(e.target.value)} helperText="Una fila por línea; valores separados por espacios o punto y coma. Admite fracciones (1/3) y decimales (0,5). Hasta 8×8." />
        {needsB && <Textarea label="Matriz B" rows={5} className="font-mono" value={textB} onChange={(e) => setTextB(e.target.value)} />}
        <Checkbox label="Mostrar resultados en decimales (6 decimales)" checked={decimals} onChange={(e) => setDecimals(e.target.checked)} />
      </Card>
      <div className="space-y-4">
        {outcome?.kind === "error" && <Alert variant="error">{outcome.message}</Alert>}
        {outcome?.kind === "scalar" && (
          <ToolResult toolId={TOOL_ID} label={outcome.title} value={decimals && outcome.decimal ? outcome.decimal : outcome.value} details={outcome.decimal && outcome.decimal !== outcome.value ? [{ label: decimals ? "Valor exacto" : "Valor decimal", value: decimals ? outcome.value : outcome.decimal }] : undefined} />
        )}
        {outcome?.kind === "matrix" && (
          <Card padding="md" variant="outline" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--text)]">
                {outcome.title} <span className="font-normal text-[var(--text-muted)]">({outcome.matrix.length}×{outcome.matrix[0]?.length ?? 0})</span>
              </h2>
              <CopyButton value={matrixToText(outcome.matrix, decimals)} toolId={TOOL_ID} size="sm" variant="outline" label="Copiar" />
            </div>
            <MatrixView matrix={outcome.matrix} decimals={decimals} />
            <p className="text-xs text-[var(--text-muted)]">{decimals ? "Valores redondeados a 6 decimales; desmarca la casilla para ver las fracciones exactas." : "Valores exactos en fracciones. Al copiar se separan con tabulaciones para pegarlos en Excel."}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
