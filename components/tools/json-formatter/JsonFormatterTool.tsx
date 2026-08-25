"use client";

import { FormEvent, useEffect, useState } from "react";
import { Braces, Download, Eraser, FileJson, Play } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import CopyButton from "@/components/tools/CopyButton";
import { trackEvent } from "@/lib/analytics/events";
import {
  MAX_JSON_INPUT_LENGTH,
  processJson,
  type JsonFailure,
  type JsonIndentation,
  type JsonOperation,
  type JsonSuccess,
} from "@/lib/tools/json";

const TOOL_ID = "json-formatter";
const SAMPLE_JSON = `{"project":"IJMM Tools","active":true,"features":["format","validate","minify"],"privacy":{"processing":"local","storesData":false}}`;

const OPERATION_OPTIONS = [
  { value: "format", label: "Formatear y ordenar visualmente" },
  { value: "minify", label: "Minificar y reducir espacios" },
  { value: "validate", label: "Solo validar la sintaxis" },
];

const INDENTATION_OPTIONS = [
  { value: "2", label: "2 espacios" },
  { value: "4", label: "4 espacios" },
  { value: "tab", label: "Tabulación" },
];

const ACTION_LABELS: Record<JsonOperation, string> = {
  format: "Formatear JSON",
  minify: "Minificar JSON",
  validate: "Validar JSON",
};

const TYPE_LABELS: Record<JsonSuccess["stats"]["type"], string> = {
  object: "objeto",
  array: "arreglo",
  string: "texto",
  number: "número",
  boolean: "booleano",
  null: "null",
};

function formatBytes(bytes: number): string {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

export default function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [operation, setOperation] = useState<JsonOperation>("format");
  const [indentation, setIndentation] = useState<"2" | "4" | "tab">("2");
  const [result, setResult] = useState<JsonSuccess | null>(null);
  const [error, setError] = useState<JsonFailure | null>(null);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "developer-tools" });
  }, []);

  const resetFeedback = () => {
    setResult(null);
    setError(null);
  };

  const handleProcess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent("tool_start", { toolId: TOOL_ID, mode: operation });

    const selectedIndentation: JsonIndentation =
      indentation === "tab" ? "\t" : indentation === "4" ? 4 : 2;
    const processed = processJson(input, operation, selectedIndentation);

    if (!processed.success) {
      setResult(null);
      setError(processed);
      trackEvent("tool_error", {
        toolId: TOOL_ID,
        mode: operation,
        errorCode: processed.code,
      });
      return;
    }

    setError(null);
    setResult(processed);
    trackEvent("tool_complete", { toolId: TOOL_ID, mode: operation });
  };

  const handleDownload = () => {
    if (!result || result.operation === "validate") return;

    const blob = new Blob([result.output], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.operation === "minify" ? "datos.min.json" : "datos.formateados.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    trackEvent("result_download", { toolId: TOOL_ID, mode: result.operation });
  };

  const handleClear = () => {
    setInput("");
    resetFeedback();
  };

  const handleExample = () => {
    setInput(SAMPLE_JSON);
    resetFeedback();
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="border-[var(--border)] shadow-sm">
        <form onSubmit={handleProcess} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Acción"
              options={OPERATION_OPTIONS}
              value={operation}
              onChange={(event) => {
                setOperation(event.target.value as JsonOperation);
                resetFeedback();
              }}
            />
            <Select
              label="Sangría"
              options={INDENTATION_OPTIONS}
              value={indentation}
              disabled={operation !== "format"}
              helperText={operation !== "format" ? "Solo se aplica al formatear." : undefined}
              onChange={(event) => setIndentation(event.target.value as "2" | "4" | "tab")}
            />
          </div>

          <Textarea
            label="Contenido JSON"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (error || result) resetFeedback();
            }}
            placeholder={'Ejemplo: {"nombre":"IJMM Tools","activo":true}'}
            rows={14}
            maxLength={MAX_JSON_INPUT_LENGTH}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            helperText={`${input.length.toLocaleString("es-EC")} de ${MAX_JSON_INPUT_LENGTH.toLocaleString("es-EC")} caracteres. El contenido se procesa únicamente en tu navegador.`}
            error={error?.message}
          />

          {error && (error.line || error.excerpt) && (
            <Alert variant="error" title="Ubicación aproximada del error">
              {error.line && error.column && (
                <p>Línea {error.line}, columna {error.column}.</p>
              )}
              {error.excerpt && (
                <code className="mt-2 block overflow-x-auto rounded bg-white/60 p-2 font-mono text-xs">
                  {error.excerpt}
                </code>
              )}
            </Alert>
          )}

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="submit" className="w-full sm:w-auto">
              <Play className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {ACTION_LABELS[operation]}
            </Button>
            <Button type="button" variant="outline" onClick={handleExample} className="w-full sm:w-auto">
              <FileJson className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Cargar ejemplo
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear} disabled={!input} className="w-full sm:ml-auto sm:w-auto">
              <Eraser className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Limpiar
            </Button>
          </div>
        </form>
      </Card>

      {result?.operation === "validate" && (
        <Alert variant="success" title="JSON válido">
          La sintaxis es correcta. El valor raíz es un {TYPE_LABELS[result.stats.type]} y ocupa {formatBytes(result.stats.bytes)}.
        </Alert>
      )}

      {result && result.operation !== "validate" && (
        <Card padding="none" className="overflow-hidden" aria-live="polite">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-2">
              <Braces className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-[var(--text)]">Resultado JSON</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {result.stats.characters.toLocaleString("es-EC")} caracteres · {formatBytes(result.stats.bytes)} · {TYPE_LABELS[result.stats.type]}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <CopyButton value={result.output} toolId={TOOL_ID} label="Copiar" />
              <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Descargar
              </Button>
            </div>
          </div>
          <pre tabIndex={0} className="max-h-[34rem] overflow-auto whitespace-pre p-4 font-mono text-sm leading-relaxed text-[var(--text)] sm:p-6">
            {result.output}
          </pre>
        </Card>
      )}
    </div>
  );
}
