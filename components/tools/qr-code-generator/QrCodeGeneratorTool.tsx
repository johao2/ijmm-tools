"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Download, QrCode, RotateCcw } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import {
  buildQrPayload,
  generateQrMatrix,
  MAX_QR_CONTENT_LENGTH,
  validateQrColors,
  type QrContentType,
  type QrErrorCorrection,
  type QrMatrixSuccess,
  type WifiSecurity,
} from "@/lib/tools/qr";

const TOOL_ID = "qr-code-generator";
const DEFAULT_DARK_COLOR = "#111827";
const DEFAULT_LIGHT_COLOR = "#ffffff";
const PREVIEW_SIZE = 1_024;
const QUIET_ZONE_MODULES = 4;

interface GeneratedQr extends QrMatrixSuccess {
  payload: string;
  type: QrContentType;
  contrastRatio: number;
}

const CONTENT_TYPE_OPTIONS = [
  { value: "url", label: "Enlace web" },
  { value: "text", label: "Texto" },
  { value: "wifi", label: "Red Wi-Fi" },
];

const CORRECTION_OPTIONS = [
  { value: "L", label: "Baja — mayor capacidad" },
  { value: "M", label: "Media — recomendada" },
  { value: "Q", label: "Alta" },
  { value: "H", label: "Máxima — mayor resistencia" },
];

const WIFI_SECURITY_OPTIONS = [
  { value: "WPA", label: "WPA / WPA2 / WPA3" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "Red abierta" },
];

function drawQrMatrix(
  canvas: HTMLCanvasElement,
  matrix: boolean[][],
  darkColor: string,
  lightColor: string
): void {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  const totalModules = matrix.length + QUIET_ZONE_MODULES * 2;
  const cellSize = Math.max(1, Math.floor(PREVIEW_SIZE / totalModules));
  const actualSize = cellSize * totalModules;
  canvas.width = actualSize;
  canvas.height = actualSize;
  context.imageSmoothingEnabled = false;
  context.fillStyle = lightColor;
  context.fillRect(0, 0, actualSize, actualSize);
  context.fillStyle = darkColor;

  matrix.forEach((row, rowIndex) => {
    row.forEach((isDark, columnIndex) => {
      if (!isDark) return;
      context.fillRect(
        (columnIndex + QUIET_ZONE_MODULES) * cellSize,
        (rowIndex + QUIET_ZONE_MODULES) * cellSize,
        cellSize,
        cellSize
      );
    });
  });
}

export default function QrCodeGeneratorTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contentType, setContentType] = useState<QrContentType>("url");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("https://ijmmsystem.com");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState<WifiSecurity>("WPA");
  const [hiddenNetwork, setHiddenNetwork] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>("M");
  const [darkColor, setDarkColor] = useState(DEFAULT_DARK_COLOR);
  const [lightColor, setLightColor] = useState(DEFAULT_LIGHT_COLOR);
  const [result, setResult] = useState<GeneratedQr | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "generators" });
  }, []);

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    try {
      drawQrMatrix(canvasRef.current, result.matrix, darkColor, lightColor);
    } catch {
      setResult(null);
      setError("El navegador no pudo dibujar el código QR.");
      trackEvent("tool_error", { toolId: TOOL_ID, errorCode: "CANVAS_UNAVAILABLE" });
    }
  }, [result, darkColor, lightColor]);

  const invalidateResult = () => {
    setResult(null);
    setError("");
  };

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent("tool_start", { toolId: TOOL_ID, mode: contentType });

    const payloadResult = buildQrPayload(
      contentType === "text"
        ? { type: "text", text }
        : contentType === "url"
          ? { type: "url", url }
          : {
              type: "wifi",
              ssid,
              password,
              security: wifiSecurity,
              hidden: hiddenNetwork,
            }
    );

    if (!payloadResult.success) {
      setResult(null);
      setError(payloadResult.message);
      trackEvent("tool_error", {
        toolId: TOOL_ID,
        mode: contentType,
        errorCode: payloadResult.code,
      });
      return;
    }

    const colorResult = validateQrColors(darkColor, lightColor);
    if (!colorResult.success) {
      setResult(null);
      setError(colorResult.message);
      trackEvent("tool_error", {
        toolId: TOOL_ID,
        mode: contentType,
        errorCode: colorResult.code,
      });
      return;
    }

    const matrixResult = generateQrMatrix(payloadResult.payload, errorCorrection);
    if (!matrixResult.success) {
      setResult(null);
      setError(matrixResult.message);
      trackEvent("tool_error", {
        toolId: TOOL_ID,
        mode: contentType,
        errorCode: matrixResult.code,
      });
      return;
    }

    setResult({
      ...matrixResult,
      payload: payloadResult.payload,
      type: payloadResult.type,
      contrastRatio: colorResult.contrastRatio,
    });
    setError("");
    trackEvent("tool_complete", { toolId: TOOL_ID, mode: contentType });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `codigo-qr-${result.type}.png`;
    anchor.click();
    trackEvent("result_download", { toolId: TOOL_ID, mode: result.type });
  };

  const handleReset = () => {
    setContentType("url");
    setText("");
    setUrl("https://ijmmsystem.com");
    setSsid("");
    setPassword("");
    setWifiSecurity("WPA");
    setHiddenNetwork(false);
    setErrorCorrection("M");
    setDarkColor(DEFAULT_DARK_COLOR);
    setLightColor(DEFAULT_LIGHT_COLOR);
    invalidateResult();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
      <Card padding="lg" className="border-[var(--border)] shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-6">
          <Select
            label="Tipo de contenido"
            options={CONTENT_TYPE_OPTIONS}
            value={contentType}
            onChange={(event) => {
              setContentType(event.target.value as QrContentType);
              invalidateResult();
            }}
          />

          {contentType === "url" && (
            <Input
              label="Enlace completo"
              type="url"
              value={url}
              placeholder="https://ejemplo.com"
              maxLength={MAX_QR_CONTENT_LENGTH}
              onChange={(event) => {
                setUrl(event.target.value);
                invalidateResult();
              }}
              helperText="Debe comenzar con https:// o http://."
            />
          )}

          {contentType === "text" && (
            <Textarea
              label="Texto"
              value={text}
              rows={7}
              maxLength={MAX_QR_CONTENT_LENGTH}
              placeholder="Escribe el contenido del código QR"
              onChange={(event) => {
                setText(event.target.value);
                invalidateResult();
              }}
              helperText={`${text.length.toLocaleString("es-EC")} de ${MAX_QR_CONTENT_LENGTH.toLocaleString("es-EC")} caracteres.`}
            />
          )}

          {contentType === "wifi" && (
            <fieldset className="space-y-4">
              <legend className="text-sm font-bold text-[var(--text)]">Datos de la red</legend>
              <Input
                label="Nombre de red (SSID)"
                value={ssid}
                maxLength={128}
                onChange={(event) => {
                  setSsid(event.target.value);
                  invalidateResult();
                }}
              />
              <Select
                label="Seguridad"
                options={WIFI_SECURITY_OPTIONS}
                value={wifiSecurity}
                onChange={(event) => {
                  setWifiSecurity(event.target.value as WifiSecurity);
                  invalidateResult();
                }}
              />
              {wifiSecurity !== "nopass" && (
                <Input
                  label="Contraseña Wi-Fi"
                  type="password"
                  value={password}
                  maxLength={256}
                  autoComplete="new-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    invalidateResult();
                  }}
                />
              )}
              <Checkbox
                label="Red oculta"
                checked={hiddenNetwork}
                onChange={(event) => {
                  setHiddenNetwork(event.target.checked);
                  invalidateResult();
                }}
              />
            </fieldset>
          )}

          <fieldset className="space-y-4 border-t border-[var(--border)] pt-5">
            <legend className="px-1 text-sm font-bold text-[var(--text)]">Calidad y colores</legend>
            <Select
              label="Corrección de errores"
              options={CORRECTION_OPTIONS}
              value={errorCorrection}
              helperText="La corrección media ofrece un buen equilibrio para uso general."
              onChange={(event) => {
                setErrorCorrection(event.target.value as QrErrorCorrection);
                invalidateResult();
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Color del código"
                type="color"
                value={darkColor}
                className="h-11 cursor-pointer p-1"
                onChange={(event) => {
                  setDarkColor(event.target.value);
                  invalidateResult();
                }}
              />
              <Input
                label="Color de fondo"
                type="color"
                value={lightColor}
                className="h-11 cursor-pointer p-1"
                onChange={(event) => {
                  setLightColor(event.target.value);
                  invalidateResult();
                }}
              />
            </div>
          </fieldset>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
              Generar código QR
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset} className="w-full sm:ml-auto sm:w-auto">
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Restablecer
            </Button>
          </div>
        </form>
      </Card>

      <div className="lg:sticky lg:top-24">
        {result ? (
          <Card padding="md" className="space-y-4 text-center" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-left">
              <h2 className="text-sm font-bold text-[var(--text)]">Código QR listo</h2>
              <Badge variant="success">{result.moduleCount} × {result.moduleCount}</Badge>
            </div>
            <div className="mx-auto overflow-hidden rounded-(--radius-md) border border-[var(--border)] bg-white p-2">
              <canvas
                ref={canvasRef}
                role="img"
                aria-label="Vista previa del código QR generado"
                className="block h-auto w-full max-w-80 [image-rendering:pixelated]"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Contraste {result.contrastRatio}:1 · margen de seguridad incluido.
            </p>
            <Button type="button" onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Descargar PNG
            </Button>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Prueba el código con la cámara de otro dispositivo antes de imprimirlo o publicarlo.
            </p>
          </Card>
        ) : (
          <Card variant="flat" padding="lg" className="text-center">
            <QrCode className="mx-auto h-10 w-10 text-[var(--text-muted)]" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-[var(--text)]">Vista previa</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              Completa el formulario para generar tu código QR localmente.
            </p>
          </Card>
        )}
        <Alert variant="info" title="Procesamiento privado" className="mt-4 text-left">
          El contenido se convierte en QR dentro de tu navegador y no se envía a IJMM Tools.
        </Alert>
      </div>
    </div>
  );
}
