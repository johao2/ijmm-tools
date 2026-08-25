"use client";

import { useEffect, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import ToolResult from "@/components/tools/ToolResult";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackEvent } from "@/lib/analytics/events";
import {
  calculateEcuadorVat,
  type VatMode,
  type VatSuccess,
} from "@/lib/tools/vat";

const TOOL_ID = "calculadora-iva-ecuador";

const RATE_OPTIONS = [
  { value: "15", label: "15% — tarifa general vigente" },
  { value: "5", label: "5% — materiales de construcción aplicables" },
  { value: "0", label: "0% — operaciones aplicables" },
  { value: "8", label: "8% — turismo (reducción temporal autorizada)" },
  { value: "custom", label: "Otra tarifa" },
];

const MODE_OPTIONS = [
  { value: "add", label: "Agregar IVA a un subtotal" },
  { value: "extract", label: "Extraer IVA de un total" },
];

export default function VatCalculatorForm() {
  const [mode, setMode] = useState<VatMode>("add");
  const [amount, setAmount] = useState("");
  const [rateOption, setRateOption] = useState("15");
  const [customRate, setCustomRate] = useState("");
  const [result, setResult] = useState<VatSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "ecuador-tools" });
  }, []);

  const selectedRate = rateOption === "custom" ? customRate : rateOption;

  function clearResult() {
    setResult(null);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackEvent("tool_start", { toolId: TOOL_ID, mode });

    const calculation = calculateEcuadorVat(amount, selectedRate, mode);
    if (!calculation.success) {
      setResult(null);
      setError(calculation.message);
      trackEvent("tool_error", {
        toolId: TOOL_ID,
        mode,
        errorCode: calculation.code,
      });
      return;
    }

    setError(null);
    setResult(calculation);
    trackEvent("tool_complete", { toolId: TOOL_ID, mode });
  }

  function handleReset() {
    setMode("add");
    setAmount("");
    setRateOption("15");
    setCustomRate("");
    clearResult();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card padding="lg" className="border-[var(--border)] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Select
            label="¿Qué deseas calcular?"
            options={MODE_OPTIONS}
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as VatMode);
              clearResult();
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={mode === "add" ? "Subtotal sin IVA (USD)" : "Total con IVA (USD)"}
              inputMode="decimal"
              autoComplete="off"
              placeholder={mode === "add" ? "Ej. 100.00" : "Ej. 115.00"}
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                clearResult();
              }}
              error={error ?? undefined}
            />
            <Select
              label="Tarifa de IVA"
              options={RATE_OPTIONS}
              value={rateOption}
              onChange={(event) => {
                setRateOption(event.target.value);
                clearResult();
              }}
            />
          </div>

          {rateOption === "custom" && (
            <Input
              label="Tarifa personalizada (%)"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Ej. 12.5"
              helperText="Admite valores entre 0% y 100%, con hasta cuatro decimales."
              value={customRate}
              onChange={(event) => {
                setCustomRate(event.target.value);
                clearResult();
              }}
            />
          )}

          {rateOption === "8" && (
            <Alert variant="warning" title="Tarifa temporal y condicionada">
              El 8% solo corresponde a fechas, actividades y prestadores turísticos autorizados. Verifica que aplique a tu operación.
            </Alert>
          )}

          <Alert variant="info">
            La tarifa general seleccionada es 15%. Las tarifas especiales dependen del bien, servicio, fecha y condiciones legales de la operación.
          </Alert>

          <div className="flex flex-col-reverse items-center justify-end gap-3 pt-1 sm:flex-row">
            <Button type="button" variant="ghost" onClick={handleReset} className="w-full sm:w-auto">
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Restablecer
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              <Calculator className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Calcular IVA
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <ToolResult
          toolId={TOOL_ID}
          label={mode === "add" ? "Total con IVA" : "Subtotal sin IVA"}
          value={mode === "add" ? result.totalFormatted : result.subtotalFormatted}
          details={[
            { label: "Subtotal", value: result.subtotalFormatted },
            { label: `IVA (${result.rate}%)`, value: result.vatFormatted },
            { label: "Total", value: result.totalFormatted },
          ]}
        />
      )}

      <p className="text-center text-xs leading-relaxed text-[var(--text-muted)]">
        Cálculo orientativo procesado localmente. No sustituye una revisión tributaria ni la información oficial del SRI.
      </p>
    </div>
  );
}
