"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRightLeft, RefreshCcw, Ruler } from "lucide-react";
import ToolResult from "@/components/tools/ToolResult";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackEvent } from "@/lib/analytics/events";
import {
  UNIT_CATEGORIES,
  convertUnits,
  getUnitCategory,
  type UnitCategoryId,
  type UnitConversionSuccess,
} from "@/lib/tools/unit-converter";

const TOOL_ID = "unit-converter";

const DEFAULT_UNITS: Record<UnitCategoryId, { from: string; to: string }> = {
  length: { from: "meter", to: "kilometer" },
  mass: { from: "kilogram", to: "pound" },
  temperature: { from: "celsius", to: "fahrenheit" },
  area: { from: "square-meter", to: "hectare" },
  volume: { from: "liter", to: "gallon-us" },
};

export default function UnitConverterForm() {
  const [categoryId, setCategoryId] = useState<UnitCategoryId>("length");
  const [input, setInput] = useState("");
  const [fromUnitId, setFromUnitId] = useState(DEFAULT_UNITS.length.from);
  const [toUnitId, setToUnitId] = useState(DEFAULT_UNITS.length.to);
  const [result, setResult] = useState<UnitConversionSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const category = getUnitCategory(categoryId) ?? UNIT_CATEGORIES[0];
  const unitOptions = category.units.map((unit) => ({
    value: unit.id,
    label: `${unit.label} (${unit.symbol})`,
  }));

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "converters" });
  }, []);

  function clearResult() {
    setResult(null);
    setError(null);
  }

  function handleCategoryChange(nextCategoryId: UnitCategoryId) {
    const defaults = DEFAULT_UNITS[nextCategoryId];
    setCategoryId(nextCategoryId);
    setFromUnitId(defaults.from);
    setToUnitId(defaults.to);
    clearResult();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackEvent("tool_start", { toolId: TOOL_ID, mode: categoryId });
    const conversion = convertUnits(input, categoryId, fromUnitId, toUnitId);
    if (!conversion.success) {
      setResult(null);
      setError(conversion.message);
      trackEvent("tool_error", {
        toolId: TOOL_ID,
        mode: categoryId,
        errorCode: conversion.code,
      });
      return;
    }
    setError(null);
    setResult(conversion);
    trackEvent("tool_complete", { toolId: TOOL_ID, mode: categoryId });
  }

  function handleSwap() {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
    clearResult();
  }

  function handleReset() {
    setCategoryId("length");
    setInput("");
    setFromUnitId(DEFAULT_UNITS.length.from);
    setToUnitId(DEFAULT_UNITS.length.to);
    clearResult();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card padding="lg" className="border-[var(--border)] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Select
            label="Tipo de unidad"
            options={UNIT_CATEGORIES.map((item) => ({ value: item.id, label: item.label }))}
            value={categoryId}
            onChange={(event) => handleCategoryChange(event.target.value as UnitCategoryId)}
          />

          <Input
            label="Valor que deseas convertir"
            inputMode="decimal"
            autoComplete="off"
            placeholder="Ej. 1.5"
            helperText="Puedes usar punto o coma decimal."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            error={error ?? undefined}
          />

          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <Select
              label="Convertir de"
              options={unitOptions}
              value={fromUnitId}
              onChange={(event) => {
                setFromUnitId(event.target.value);
                clearResult();
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleSwap}
              aria-label="Intercambiar unidades"
              title="Intercambiar unidades"
              className="w-full sm:w-auto"
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              <span className="ml-2 sm:hidden">Intercambiar unidades</span>
            </Button>
            <Select
              label="Convertir a"
              options={unitOptions}
              value={toUnitId}
              onChange={(event) => {
                setToUnitId(event.target.value);
                clearResult();
              }}
            />
          </div>

          <div className="flex flex-col-reverse items-center justify-end gap-3 pt-1 sm:flex-row">
            <Button type="button" variant="ghost" onClick={handleReset} className="w-full sm:w-auto">
              <RefreshCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Restablecer
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              <Ruler className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Convertir
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <ToolResult
          toolId={TOOL_ID}
          label={`Resultado en ${result.toUnit.label.toLowerCase()}`}
          value={result.formatted}
          unit={result.toUnit.symbol}
          copyableValue={`${result.formatted} ${result.toUnit.symbol}`}
          details={[
            {
              label: "Conversión",
              value: `${input.trim().replace(",", ".")} ${result.fromUnit.symbol} = ${result.formatted} ${result.toUnit.symbol}`,
            },
            { label: "Categoría", value: result.category.label },
          ]}
        />
      )}

      <p className="text-center text-xs leading-relaxed text-[var(--text-muted)]">
        La conversión se procesa localmente. Los resultados se muestran con hasta diez decimales para facilitar su lectura.
      </p>
    </div>
  );
}
