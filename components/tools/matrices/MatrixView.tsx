import { toDecimalString, toFractionString } from "@/lib/tools/fraction";
import type { Matrix } from "@/lib/tools/matrix";

interface MatrixViewProps {
  matrix: Matrix;
  decimals?: boolean;
  /** Número de columnas antes de la línea vertical (matriz aumentada) */
  divider?: number;
}

export const matrixCell = (v: Matrix[number][number], decimals: boolean) => (decimals ? toDecimalString(v, 6) : toFractionString(v));

/** Texto de la matriz para copiar (filas por línea, valores separados por tabulación: se pega bien en Excel). */
export const matrixToText = (m: Matrix, decimals: boolean) => m.map((r) => r.map((v) => matrixCell(v, decimals)).join("\t")).join("\n");

/** Matriz entre corchetes, con columnas alineadas. */
export default function MatrixView({ matrix, decimals = false, divider }: MatrixViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-x-2 border-[var(--text)] font-mono text-sm" aria-label="Matriz resultado">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} className={`px-3 py-1 text-right text-[var(--text)] ${divider === j ? "border-l border-[var(--border)]" : ""}`}>
                  {matrixCell(v, decimals)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
