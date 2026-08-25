import qrcode from "qrcode-generator";

export const MAX_QR_CONTENT_LENGTH = 2_000;

export type QrContentType = "text" | "url" | "wifi";
export type QrErrorCorrection = "L" | "M" | "Q" | "H";
export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type QrPayloadInput =
  | { type: "text"; text: string }
  | { type: "url"; url: string }
  | {
      type: "wifi";
      ssid: string;
      password: string;
      security: WifiSecurity;
      hidden: boolean;
    };

export type QrErrorCode =
  | "EMPTY_CONTENT"
  | "INVALID_URL"
  | "MISSING_WIFI_PASSWORD"
  | "CONTENT_TOO_LARGE"
  | "INVALID_COLORS"
  | "LOW_CONTRAST"
  | "CAPACITY_EXCEEDED"
  | "GENERATION_ERROR";

export interface QrFailure {
  success: false;
  code: QrErrorCode;
  message: string;
}

export interface QrPayloadSuccess {
  success: true;
  payload: string;
  type: QrContentType;
}

export interface QrMatrixSuccess {
  success: true;
  matrix: boolean[][];
  moduleCount: number;
}

export type QrPayloadResult = QrPayloadSuccess | QrFailure;
export type QrMatrixResult = QrMatrixSuccess | QrFailure;

export interface QrColorSuccess {
  success: true;
  contrastRatio: number;
}

export type QrColorResult = QrColorSuccess | QrFailure;

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function relativeLuminance(hexColor: string): number {
  const channels = [1, 3, 5].map((start) =>
    Number.parseInt(hexColor.slice(start, start + 2), 16) / 255
  );
  const linearChannels = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return (
    linearChannels[0] * 0.2126 +
    linearChannels[1] * 0.7152 +
    linearChannels[2] * 0.0722
  );
}

export function validateQrColors(darkColor: string, lightColor: string): QrColorResult {
  const hexPattern = /^#[0-9a-f]{6}$/i;
  if (!hexPattern.test(darkColor) || !hexPattern.test(lightColor)) {
    return {
      success: false,
      code: "INVALID_COLORS",
      message: "Selecciona colores válidos para el código QR.",
    };
  }

  const darkLuminance = relativeLuminance(darkColor);
  const lightLuminance = relativeLuminance(lightColor);
  const contrastRatio =
    (Math.max(darkLuminance, lightLuminance) + 0.05) /
    (Math.min(darkLuminance, lightLuminance) + 0.05);

  if (darkLuminance >= lightLuminance || contrastRatio < 3) {
    return {
      success: false,
      code: "LOW_CONTRAST",
      message: "El color del código debe ser más oscuro que el fondo y tener suficiente contraste para poder escanearse.",
    };
  }

  return {
    success: true,
    contrastRatio: Math.round(contrastRatio * 100) / 100,
  };
}

function validateLength(payload: string): QrPayloadResult | undefined {
  if (payload.length > MAX_QR_CONTENT_LENGTH) {
    return {
      success: false,
      code: "CONTENT_TOO_LARGE",
      message: `El contenido no puede superar ${MAX_QR_CONTENT_LENGTH.toLocaleString("es-EC")} caracteres.`,
    };
  }
  return undefined;
}

export function buildQrPayload(input: QrPayloadInput): QrPayloadResult {
  if (input.type === "text") {
    const payload = input.text.trim();
    if (!payload) {
      return {
        success: false,
        code: "EMPTY_CONTENT",
        message: "Escribe el texto que deseas convertir en código QR.",
      };
    }
    return validateLength(payload) ?? { success: true, payload, type: input.type };
  }

  if (input.type === "url") {
    const payload = input.url.trim();
    if (!payload) {
      return {
        success: false,
        code: "EMPTY_CONTENT",
        message: "Escribe el enlace que deseas convertir en código QR.",
      };
    }

    try {
      const parsedUrl = new URL(payload);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error("Unsupported protocol");
      }
    } catch {
      return {
        success: false,
        code: "INVALID_URL",
        message: "Introduce una dirección completa que comience con https:// o http://.",
      };
    }

    return validateLength(payload) ?? { success: true, payload, type: input.type };
  }

  const ssid = input.ssid.trim();
  if (!ssid) {
    return {
      success: false,
      code: "EMPTY_CONTENT",
      message: "Escribe el nombre de la red Wi-Fi.",
    };
  }

  if (input.security !== "nopass" && !input.password) {
    return {
      success: false,
      code: "MISSING_WIFI_PASSWORD",
      message: "Escribe la contraseña de la red o selecciona una red abierta.",
    };
  }

  const payload = `WIFI:T:${input.security};S:${escapeWifiValue(ssid)};P:${escapeWifiValue(input.security === "nopass" ? "" : input.password)};H:${input.hidden ? "true" : "false"};;`;
  return validateLength(payload) ?? { success: true, payload, type: input.type };
}

export function generateQrMatrix(
  payload: string,
  errorCorrection: QrErrorCorrection = "M"
): QrMatrixResult {
  if (!payload.trim()) {
    return {
      success: false,
      code: "EMPTY_CONTENT",
      message: "No hay contenido para generar el código QR.",
    };
  }

  if (payload.length > MAX_QR_CONTENT_LENGTH) {
    return {
      success: false,
      code: "CONTENT_TOO_LARGE",
      message: `El contenido no puede superar ${MAX_QR_CONTENT_LENGTH.toLocaleString("es-EC")} caracteres.`,
    };
  }

  try {
    const qr = qrcode(0, errorCorrection);
    qr.addData(payload, "Byte");
    qr.make();
    const moduleCount = qr.getModuleCount();
    const matrix = Array.from({ length: moduleCount }, (_, row) =>
      Array.from({ length: moduleCount }, (_, column) => qr.isDark(row, column))
    );

    return { success: true, matrix, moduleCount };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (/code length overflow/i.test(message)) {
      return {
        success: false,
        code: "CAPACITY_EXCEEDED",
        message: "El contenido es demasiado grande para el nivel de corrección seleccionado. Reduce el texto o elige un nivel menor.",
      };
    }
    return {
      success: false,
      code: "GENERATION_ERROR",
      message: "No se pudo generar el código QR con este contenido.",
    };
  }
}
