"use client";

import React, { useState, useEffect } from "react";
import ToolResult from "@/components/tools/ToolResult";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { RotateCcw, Calculator as CalcIcon } from "lucide-react";
import {
  calculatePercentageOf,
  calculateWhatPercentage,
  calculatePercentageIncrease,
  calculatePercentageDecrease,
  calculatePercentageDifference,
  calculateOriginalValue,
  calculateDiscount,
  CalculationResult,
} from "@/lib/tools/percentage";
import { trackEvent } from "@/lib/analytics/events";

export type ModeKey =
  | "percentage_of"
  | "what_percentage"
  | "percentage_increase"
  | "percentage_decrease"
  | "percentage_difference"
  | "original_value"
  | "discount";

const TOOL_ID = "percentage-calculator";

const MODE_OPTIONS = [
  { value: "percentage_of", label: "1. ¿Cuánto es X % de Y?" },
  { value: "what_percentage", label: "2. ¿Qué porcentaje es X de Y?" },
  { value: "percentage_increase", label: "3. Porcentaje de incremento (de X a Y)" },
  { value: "percentage_decrease", label: "4. Porcentaje de decremento (de X a Y)" },
  { value: "percentage_difference", label: "5. Diferencia porcentual (entre X e Y)" },
  { value: "original_value", label: "6. Encontrar el valor original (antes de % de cambio)" },
  { value: "discount", label: "7. Calculadora de descuentos (Precio & % Descuento)" },
];

// Error Code to Friendly Spanish Message Translator
const SPANISH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "Introduce valores numéricos válidos en ambos campos.",
  DIVISION_BY_ZERO: "No es posible realizar este cálculo porque el divisor no puede ser cero.",
  NON_FINITE_RESULT: "El resultado está fuera de un rango numérico válido.",
  MATHEMATICALLY_INVALID: "Los valores introducidos no son válidos para este cálculo matemático.",
};

export const PercentageCalculatorForm: React.FC = () => {
  const [mode, setMode] = useState<ModeKey>("percentage_of");
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");
  const [changeType, setChangeType] = useState<"increase" | "decrease">("increase");

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track tool view on mount
  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "calculators" });
  }, []);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as ModeKey;
    setMode(newMode);
    setInput1("");
    setInput2("");
    setResult(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setMode("percentage_of");
    setInput1("");
    setInput2("");
    setChangeType("increase");
    setResult(null);
    setErrorMessage(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setErrorMessage(null);
    trackEvent("tool_start", { toolId: TOOL_ID, mode });

    if (input1.trim() === "" || input2.trim() === "") {
      const err = "Por favor, completa ambos campos para realizar el cálculo.";
      setErrorMessage(err);
      setResult(null);
      trackEvent("tool_error", { toolId: TOOL_ID, mode, errorCode: "INVALID_INPUT" });
      return;
    }

    const num1 = Number(input1);
    const num2 = Number(input2);

    if (isNaN(num1) || isNaN(num2)) {
      const err = "Introduce valores numéricos válidos.";
      setErrorMessage(err);
      setResult(null);
      trackEvent("tool_error", { toolId: TOOL_ID, mode, errorCode: "INVALID_INPUT" });
      return;
    }

    let calcRes: CalculationResult;

    switch (mode) {
      case "percentage_of":
        calcRes = calculatePercentageOf(num1, num2);
        break;
      case "what_percentage":
        calcRes = calculateWhatPercentage(num1, num2);
        break;
      case "percentage_increase":
        calcRes = calculatePercentageIncrease(num1, num2);
        break;
      case "percentage_decrease":
        calcRes = calculatePercentageDecrease(num1, num2);
        break;
      case "percentage_difference":
        calcRes = calculatePercentageDifference(num1, num2);
        break;
      case "original_value":
        calcRes = calculateOriginalValue(num1, num2, changeType);
        break;
      case "discount":
        calcRes = calculateDiscount(num1, num2);
        break;
      default:
        calcRes = calculatePercentageOf(num1, num2);
    }

    if (!calcRes.success) {
      const spanishErr = SPANISH_ERROR_MESSAGES[calcRes.code] || calcRes.error;
      setErrorMessage(spanishErr);
      setResult(null);
      trackEvent("tool_error", { toolId: TOOL_ID, mode, errorCode: calcRes.code });
    } else {
      setResult(calcRes);
      trackEvent("tool_complete", { toolId: TOOL_ID, mode });
    }
  };

  const getInputLabels = () => {
    switch (mode) {
      case "percentage_of":
        return { label1: "Porcentaje (X%)", label2: "Monto Total (Y)", placeholder1: "ej. 15", placeholder2: "ej. 250" };
      case "what_percentage":
        return { label1: "Monto Parte (X)", label2: "Monto Total (Y)", placeholder1: "ej. 30", placeholder2: "ej. 150" };
      case "percentage_increase":
      case "percentage_decrease":
        return { label1: "Valor Original (X)", label2: "Nuevo Valor (Y)", placeholder1: "ej. 100", placeholder2: "ej. 125" };
      case "percentage_difference":
        return { label1: "Primer Valor (X)", label2: "Segundo Valor (Y)", placeholder1: "ej. 10", placeholder2: "ej. 20" };
      case "original_value":
        return { label1: "Valor Final", label2: "Cambio Porcentual (%)", placeholder1: "ej. 120", placeholder2: "ej. 20" };
      case "discount":
        return { label1: "Precio Original ($)", label2: "Porcentaje de Descuento (%)", placeholder1: "ej. 80", placeholder2: "ej. 20" };
    }
  };

  const labels = getInputLabels();

  const getOutputUnit = (): string | undefined => {
    if (
      mode === "what_percentage" ||
      mode === "percentage_increase" ||
      mode === "percentage_decrease" ||
      mode === "percentage_difference"
    ) {
      return "%";
    }
    return undefined;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card padding="lg" className="border-[var(--border)] shadow-sm">
        <form onSubmit={handleCalculate} className="space-y-5">
          <Select
            label="Selecciona la Modalidad de Cálculo"
            options={MODE_OPTIONS}
            value={mode}
            onChange={handleModeChange}
          />

          {mode === "original_value" && (
            <Select
              label="Tipo de Cambio Porcentual"
              options={[
                { value: "increase", label: "Después de un INCREMENTO porcentual" },
                { value: "decrease", label: "Después de un DECREMENTO porcentual" },
              ]}
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as "increase" | "decrease")}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={labels.label1}
              type="number"
              step="any"
              placeholder={labels.placeholder1}
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
            <Input
              label={labels.label2}
              type="number"
              step="any"
              placeholder={labels.placeholder2}
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
            />
          </div>

          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span>Restablecer</span>
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              <CalcIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span>Calcular</span>
            </Button>
          </div>
        </form>
      </Card>

      {result && result.success && (
        <ToolResult
          toolId={TOOL_ID}
          label={
            mode === "discount"
              ? "Precio Final con Descuento"
              : mode === "original_value"
              ? "Valor Original Antes del Cambio"
              : "Resultado del Cálculo"
          }
          value={result.formatted}
          unit={getOutputUnit()}
          details={
            mode === "discount" && result.metadata
              ? [
                  {
                    label: "Precio Original",
                    value: `$${result.metadata.originalPrice}`,
                  },
                  {
                    label: "Monto Ahorrado por Descuento",
                    value: `$${result.metadata.discountAmount}`,
                  },
                ]
              : undefined
          }
        />
      )}
    </div>
  );
};

export default PercentageCalculatorForm;
