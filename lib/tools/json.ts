export const MAX_JSON_INPUT_LENGTH = 5_000_000;

export type JsonOperation = "format" | "minify" | "validate";
export type JsonIndentation = 2 | 4 | "\t";
export type JsonValueType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null";

export interface JsonStats {
  characters: number;
  bytes: number;
  type: JsonValueType;
}

export interface JsonSuccess {
  success: true;
  operation: JsonOperation;
  output: string;
  stats: JsonStats;
}

export type JsonErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_JSON"
  | "INPUT_TOO_LARGE"
  | "UNSAFE_INTEGER"
  | "PROCESSING_ERROR";

export interface JsonFailure {
  success: false;
  code: JsonErrorCode;
  message: string;
  line?: number;
  column?: number;
  position?: number;
  excerpt?: string;
}

export type JsonResult = JsonSuccess | JsonFailure;

interface Location {
  line: number;
  column: number;
  position: number;
  excerpt?: string;
}

function getLocation(input: string, position: number): Location {
  const safePosition = Math.max(0, Math.min(position, input.length));
  const before = input.slice(0, safePosition);
  const line = before.split("\n").length;
  const lastLineBreak = before.lastIndexOf("\n");
  const column = safePosition - lastLineBreak;
  const excerpt = input.split(/\r?\n/)[line - 1]?.trim().slice(0, 160);

  return {
    line,
    column,
    position: safePosition,
    ...(excerpt ? { excerpt } : {}),
  };
}

function extractSyntaxLocation(input: string, message: string): Location | undefined {
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    return getLocation(input, Number(positionMatch[1]));
  }

  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (!lineColumnMatch) return undefined;

  const line = Number(lineColumnMatch[1]);
  const column = Number(lineColumnMatch[2]);
  const lines = input.split(/\r?\n/);
  const position =
    lines.slice(0, Math.max(0, line - 1)).reduce((total, item) => total + item.length + 1, 0) +
    Math.max(0, column - 1);

  return getLocation(input, position);
}

function findUnsafeInteger(input: string): Location | undefined {
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character !== "-" && !/\d/.test(character)) continue;

    const token = input
      .slice(index)
      .match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)?.[0];

    if (!token) continue;

    if (!/[.eE]/.test(token) && !Number.isSafeInteger(Number(token))) {
      return getLocation(input, index);
    }

    index += token.length - 1;
  }

  return undefined;
}

function getValueType(value: unknown): JsonValueType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as Exclude<JsonValueType, "array" | "null">;
}

export function processJson(
  source: string,
  operation: JsonOperation,
  indentation: JsonIndentation = 2
): JsonResult {
  const input = source.startsWith("\uFEFF") ? source.slice(1) : source;

  if (!input.trim()) {
    return {
      success: false,
      code: "EMPTY_INPUT",
      message: "Pega o escribe contenido JSON antes de procesarlo.",
    };
  }

  if (input.length > MAX_JSON_INPUT_LENGTH) {
    return {
      success: false,
      code: "INPUT_TOO_LARGE",
      message: "El contenido supera el límite de 5 millones de caracteres.",
    };
  }

  const unsafeIntegerLocation = findUnsafeInteger(input);
  if (unsafeIntegerLocation) {
    return {
      success: false,
      code: "UNSAFE_INTEGER",
      message:
        "El JSON contiene un entero que JavaScript no puede representar con precisión. Envíalo entre comillas para conservar su valor exacto.",
      ...unsafeIntegerLocation,
    };
  }

  try {
    const value: unknown = JSON.parse(input);
    const output =
      operation === "minify"
        ? JSON.stringify(value)
        : operation === "format"
          ? JSON.stringify(value, null, indentation)
          : input;

    return {
      success: true,
      operation,
      output,
      stats: {
        characters: output.length,
        bytes: new TextEncoder().encode(output).length,
        type: getValueType(value),
      },
    };
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      const location = extractSyntaxLocation(input, error.message);
      return {
        success: false,
        code: "INVALID_JSON",
        message: "El contenido no es JSON válido. Revisa la sintaxis indicada.",
        ...(location ?? {}),
      };
    }

    return {
      success: false,
      code: "PROCESSING_ERROR",
      message: "No se pudo procesar el JSON en este navegador.",
    };
  }
}
