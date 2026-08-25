"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, RefreshCw, ShieldCheck } from "lucide-react";
import CopyButton from "@/components/tools/CopyButton";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import RangeInput from "@/components/ui/RangeInput";
import { trackEvent } from "@/lib/analytics/events";
import {
  generatePassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  type PasswordOptions,
  type PasswordStrength,
  type PasswordSuccess,
} from "@/lib/tools/password";

const TOOL_ID = "password-generator";
const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};

const STRENGTH_DETAILS: Record<
  PasswordStrength,
  {
    label: string;
    segments: number;
    variant: "error" | "warning" | "success";
    activeClass: string;
  }
> = {
  weak: { label: "Básica", segments: 1, variant: "error", activeClass: "bg-[var(--error)]" },
  fair: { label: "Aceptable", segments: 2, variant: "warning", activeClass: "bg-[var(--warning)]" },
  strong: { label: "Fuerte", segments: 3, variant: "success", activeClass: "bg-[var(--success)]" },
  "very-strong": { label: "Muy fuerte", segments: 4, variant: "success", activeClass: "bg-[var(--success)]" },
};

type CharacterOptionKey =
  | "includeLowercase"
  | "includeUppercase"
  | "includeNumbers"
  | "includeSymbols"
  | "excludeAmbiguous";

export default function PasswordGeneratorTool() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<PasswordSuccess | null>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "generators" });
    const initialResult = generatePassword(DEFAULT_OPTIONS);
    if (initialResult.success) setResult(initialResult);
    else setError(initialResult.message);
  }, []);

  const updateOption = (key: CharacterOptionKey, checked: boolean) => {
    setOptions((current) => ({ ...current, [key]: checked }));
    setError("");
  };

  const updateLength = (rawValue: string) => {
    const value = Number(rawValue);
    setOptions((current) => ({ ...current, length: value }));
    setError("");
  };

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent("tool_start", { toolId: TOOL_ID, mode: "random-password" });
    const generated = generatePassword(options);

    if (!generated.success) {
      setResult(null);
      setError(generated.message);
      trackEvent("tool_error", {
        toolId: TOOL_ID,
        mode: "random-password",
        errorCode: generated.code,
      });
      return;
    }

    setResult(generated);
    setError("");
    trackEvent("tool_complete", { toolId: TOOL_ID, mode: "random-password" });
  };

  const strength = result ? STRENGTH_DETAILS[result.strength] : null;

  return (
    <div className="space-y-6">
      {result && strength && (
        <Card padding="none" className="overflow-hidden" aria-live="polite">
          <div className="border-b border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--success)]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-[var(--text)]">Contraseña generada</h2>
              </div>
              <Badge variant={strength.variant}>{strength.label}</Badge>
            </div>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type={showPassword ? "text" : "password"}
                value={result.password}
                readOnly
                aria-label="Contraseña generada"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-(--radius-md) border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 font-mono text-base font-semibold tracking-wide text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="flex-1 sm:flex-none"
                >
                  {showPassword ? (
                    <EyeOff className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  )}
                  {showPassword ? "Ocultar" : "Mostrar"}
                </Button>
                <CopyButton
                  value={result.password}
                  toolId={TOOL_ID}
                  label="Copiar"
                  className="flex-1 sm:flex-none"
                />
              </div>
            </div>
            <div>
              <div className="grid grid-cols-4 gap-1.5" aria-label={`Fortaleza estimada: ${strength.label}`}>
                {[1, 2, 3, 4].map((segment) => (
                  <span
                    key={segment}
                    className={
                      segment <= strength.segments
                        ? `h-1.5 rounded-full ${strength.activeClass}`
                        : "h-1.5 rounded-full bg-[var(--border)]"
                    }
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Estimación matemática: {result.entropyBits} bits · conjunto de {result.charsetSize} caracteres.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card padding="lg" className="border-[var(--border)] shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-base font-bold text-[var(--text)]">Personaliza tu contraseña</legend>
            <div className="grid items-end gap-4 sm:grid-cols-[1fr_8rem]">
              <RangeInput
                label={`Longitud: ${options.length} caracteres`}
                min={MIN_PASSWORD_LENGTH}
                max={MAX_PASSWORD_LENGTH}
                value={Number.isFinite(options.length) ? options.length : MIN_PASSWORD_LENGTH}
                onChange={(event) => updateLength(event.target.value)}
                helperText="Recomendado: 16 caracteres o más."
              />
              <Input
                label="Valor exacto"
                type="number"
                min={MIN_PASSWORD_LENGTH}
                max={MAX_PASSWORD_LENGTH}
                step={1}
                value={Number.isNaN(options.length) ? "" : options.length}
                onChange={(event) => updateLength(event.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-[var(--text)]">Grupos de caracteres</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox
                label="Minúsculas (a-z)"
                checked={options.includeLowercase}
                onChange={(event) => updateOption("includeLowercase", event.target.checked)}
              />
              <Checkbox
                label="Mayúsculas (A-Z)"
                checked={options.includeUppercase}
                onChange={(event) => updateOption("includeUppercase", event.target.checked)}
              />
              <Checkbox
                label="Números (0-9)"
                checked={options.includeNumbers}
                onChange={(event) => updateOption("includeNumbers", event.target.checked)}
              />
              <Checkbox
                label="Símbolos (!@#$...)"
                checked={options.includeSymbols}
                onChange={(event) => updateOption("includeSymbols", event.target.checked)}
              />
            </div>
            <Checkbox
              label="Excluir caracteres ambiguos"
              helperText="Evita I, l, 1, O, 0 y o para facilitar la lectura manual."
              checked={options.excludeAmbiguous}
              onChange={(event) => updateOption("excludeAmbiguous", event.target.checked)}
            />
          </fieldset>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="border-t border-[var(--border)] pt-5">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Generar nueva contraseña
            </Button>
          </div>
        </form>
      </Card>

      <Alert variant="info" title="Privacidad por diseño">
        La contraseña se crea en este dispositivo con la API criptográfica del navegador. No se envía ni se almacena en IJMM Tools.
      </Alert>
    </div>
  );
}
