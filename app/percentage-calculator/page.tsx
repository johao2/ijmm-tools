"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolOutput from "@/components/tools/ToolOutput";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { RotateCcw, Calculator as CalcIcon, AlertCircle } from "lucide-react";
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

export type ModeKey =
  | "percentage_of"
  | "what_percentage"
  | "percentage_increase"
  | "percentage_decrease"
  | "percentage_difference"
  | "original_value"
  | "discount";

const MODE_OPTIONS = [
  { value: "percentage_of", label: "What is X% of Y?" },
  { value: "what_percentage", label: "What percentage is X of Y?" },
  { value: "percentage_increase", label: "Percentage increase (from X to Y)" },
  { value: "percentage_decrease", label: "Percentage decrease (from X to Y)" },
  { value: "percentage_difference", label: "Percentage difference (between X and Y)" },
  { value: "original_value", label: "Find original value (before % change)" },
  { value: "discount", label: "Discount calculator (Price & Discount %)" },
];

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<ModeKey>("percentage_of");
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");
  const [changeType, setChangeType] = useState<"increase" | "decrease">("increase");
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    if (input1.trim() === "" || input2.trim() === "") {
      setErrorMessage("Please fill in both input fields to perform calculation.");
      setResult(null);
      return;
    }

    const num1 = Number(input1);
    const num2 = Number(input2);

    if (isNaN(num1) || isNaN(num2)) {
      setErrorMessage("Please enter valid numerical values.");
      setResult(null);
      return;
    }

    let calcRes: CalculationResult;

    // Dispatch to pure domain functions in lib/tools/percentage.ts
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
      setErrorMessage(calcRes.error);
      setResult(null);
    } else {
      setResult(calcRes);
    }
  };

  // Dynamic input label mapping based on mode
  const getInputLabels = () => {
    switch (mode) {
      case "percentage_of":
        return { label1: "Percentage (X%)", label2: "Total Amount (Y)", placeholder1: "e.g. 15", placeholder2: "e.g. 250" };
      case "what_percentage":
        return { label1: "Part Amount (X)", label2: "Total Whole (Y)", placeholder1: "e.g. 30", placeholder2: "e.g. 150" };
      case "percentage_increase":
      case "percentage_decrease":
        return { label1: "Original Value (X)", label2: "New Value (Y)", placeholder1: "e.g. 100", placeholder2: "e.g. 125" };
      case "percentage_difference":
        return { label1: "First Value (X)", label2: "Second Value (Y)", placeholder1: "e.g. 10", placeholder2: "e.g. 20" };
      case "original_value":
        return { label1: "Final Value", label2: "Percentage Change (%)", placeholder1: "e.g. 120", placeholder2: "e.g. 20" };
      case "discount":
        return { label1: "Original Price ($)", label2: "Discount Percentage (%)", placeholder1: "e.g. 80", placeholder2: "e.g. 20" };
    }
  };

  const labels = getInputLabels();

  // Unit suffix for output result display
  const getOutputUnit = (): string | undefined => {
    if (mode === "what_percentage" || mode === "percentage_increase" || mode === "percentage_decrease" || mode === "percentage_difference") {
      return "%";
    }
    return undefined;
  };

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages, percentage increases, decreases, percentage differences, and store discounts quickly and accurately."
      breadcrumbs={[
        { label: "Calculators", href: "/categories" },
        { label: "Percentage Calculator" },
      ]}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Main Calculator Form Card */}
        <Card padding="lg" className="border-[var(--border)] shadow-sm">
          <form onSubmit={handleCalculate} className="space-y-5">
            {/* Calculation Mode Selector */}
            <Select
              label="Select Calculation Mode"
              options={MODE_OPTIONS}
              value={mode}
              onChange={handleModeChange}
            />

            {/* Mode 6 Additional Option: Increase / Decrease */}
            {mode === "original_value" && (
              <Select
                label="Percentage Change Type"
                options={[
                  { value: "increase", label: "After a percentage INCREASE" },
                  { value: "decrease", label: "After a percentage DECREASE" },
                ]}
                value={changeType}
                onChange={(e) => setChangeType(e.target.value as "increase" | "decrease")}
              />
            )}

            {/* Dynamic Inputs */}
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

            {/* Form Validation Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-(--radius-md) border border-[var(--error)] bg-[var(--error-bg)] p-3 text-xs font-medium text-[var(--error)]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions: Calculate & Reset */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>Reset</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                <CalcIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>Calculate</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Result Area */}
        {result && result.success && (
          <ToolOutput
            label={
              mode === "discount"
                ? "Final Price After Discount"
                : mode === "original_value"
                ? "Original Value Before Change"
                : "Calculation Result"
            }
            value={result.formatted}
            unit={getOutputUnit()}
            details={
              mode === "discount" && result.metadata
                ? [
                    {
                      label: "Original Price",
                      value: `$${result.metadata.originalPrice}`,
                    },
                    {
                      label: "Discount Amount Saved",
                      value: `$${result.metadata.discountAmount}`,
                    },
                  ]
                : undefined
            }
          />
        )}
      </div>
    </ToolLayout>
  );
}
