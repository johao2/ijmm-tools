export type UnitCategoryId =
  | "length"
  | "mass"
  | "temperature"
  | "area"
  | "volume";

export interface UnitDefinition {
  id: string;
  label: string;
  symbol: string;
  factor?: number;
}

export interface UnitCategory {
  id: UnitCategoryId;
  label: string;
  baseUnitId: string;
  units: UnitDefinition[];
}

export type UnitConversionErrorCode =
  | "EMPTY_VALUE"
  | "INVALID_VALUE"
  | "INVALID_CATEGORY"
  | "INVALID_UNIT"
  | "NON_FINITE_RESULT"
  | "BELOW_ABSOLUTE_ZERO";

export interface UnitConversionFailure {
  success: false;
  code: UnitConversionErrorCode;
  message: string;
}

export interface UnitConversionSuccess {
  success: true;
  value: number;
  formatted: string;
  fromUnit: UnitDefinition;
  toUnit: UnitDefinition;
  category: UnitCategory;
}

export type UnitConversionResult =
  | UnitConversionSuccess
  | UnitConversionFailure;

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: "Longitud",
    baseUnitId: "meter",
    units: [
      { id: "millimeter", label: "Milímetros", symbol: "mm", factor: 0.001 },
      { id: "centimeter", label: "Centímetros", symbol: "cm", factor: 0.01 },
      { id: "meter", label: "Metros", symbol: "m", factor: 1 },
      { id: "kilometer", label: "Kilómetros", symbol: "km", factor: 1_000 },
      { id: "inch", label: "Pulgadas", symbol: "in", factor: 0.0254 },
      { id: "foot", label: "Pies", symbol: "ft", factor: 0.3048 },
      { id: "yard", label: "Yardas", symbol: "yd", factor: 0.9144 },
      { id: "mile", label: "Millas", symbol: "mi", factor: 1_609.344 },
    ],
  },
  {
    id: "mass",
    label: "Peso y masa",
    baseUnitId: "kilogram",
    units: [
      { id: "milligram", label: "Miligramos", symbol: "mg", factor: 0.000001 },
      { id: "gram", label: "Gramos", symbol: "g", factor: 0.001 },
      { id: "kilogram", label: "Kilogramos", symbol: "kg", factor: 1 },
      { id: "metric-ton", label: "Toneladas métricas", symbol: "t", factor: 1_000 },
      { id: "ounce", label: "Onzas", symbol: "oz", factor: 0.028349523125 },
      { id: "pound", label: "Libras", symbol: "lb", factor: 0.45359237 },
    ],
  },
  {
    id: "temperature",
    label: "Temperatura",
    baseUnitId: "celsius",
    units: [
      { id: "celsius", label: "Grados Celsius", symbol: "°C" },
      { id: "fahrenheit", label: "Grados Fahrenheit", symbol: "°F" },
      { id: "kelvin", label: "Kelvin", symbol: "K" },
    ],
  },
  {
    id: "area",
    label: "Área",
    baseUnitId: "square-meter",
    units: [
      { id: "square-centimeter", label: "Centímetros cuadrados", symbol: "cm²", factor: 0.0001 },
      { id: "square-meter", label: "Metros cuadrados", symbol: "m²", factor: 1 },
      { id: "square-kilometer", label: "Kilómetros cuadrados", symbol: "km²", factor: 1_000_000 },
      { id: "hectare", label: "Hectáreas", symbol: "ha", factor: 10_000 },
      { id: "square-inch", label: "Pulgadas cuadradas", symbol: "in²", factor: 0.00064516 },
      { id: "square-foot", label: "Pies cuadrados", symbol: "ft²", factor: 0.09290304 },
      { id: "acre", label: "Acres", symbol: "ac", factor: 4_046.8564224 },
    ],
  },
  {
    id: "volume",
    label: "Volumen",
    baseUnitId: "liter",
    units: [
      { id: "milliliter", label: "Mililitros", symbol: "ml", factor: 0.001 },
      { id: "liter", label: "Litros", symbol: "L", factor: 1 },
      { id: "cubic-meter", label: "Metros cúbicos", symbol: "m³", factor: 1_000 },
      { id: "teaspoon-us", label: "Cucharaditas (EE. UU.)", symbol: "tsp", factor: 0.00492892159375 },
      { id: "tablespoon-us", label: "Cucharadas (EE. UU.)", symbol: "tbsp", factor: 0.01478676478125 },
      { id: "cup-us", label: "Tazas (EE. UU.)", symbol: "cup", factor: 0.2365882365 },
      { id: "fluid-ounce-us", label: "Onzas líquidas (EE. UU.)", symbol: "fl oz", factor: 0.0295735295625 },
      { id: "gallon-us", label: "Galones (EE. UU.)", symbol: "gal", factor: 3.785411784 },
    ],
  },
];

export function getUnitCategory(
  categoryId: UnitCategoryId | string
): UnitCategory | undefined {
  return UNIT_CATEGORIES.find((category) => category.id === categoryId);
}

function parseInput(input: string): number | UnitConversionFailure {
  const normalized = input.trim().replace(",", ".");
  if (!normalized) {
    return {
      success: false,
      code: "EMPTY_VALUE",
      message: "Introduce un valor para realizar la conversión.",
    };
  }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return {
      success: false,
      code: "INVALID_VALUE",
      message: "Introduce un número válido usando punto o coma decimal.",
    };
  }
  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    return {
      success: false,
      code: "INVALID_VALUE",
      message: "El valor está fuera del rango admitido.",
    };
  }
  return value;
}

function toCelsius(value: number, unitId: string): number {
  if (unitId === "fahrenheit") return (value - 32) * (5 / 9);
  if (unitId === "kelvin") return value - 273.15;
  return value;
}

function fromCelsius(value: number, unitId: string): number {
  if (unitId === "fahrenheit") return value * (9 / 5) + 32;
  if (unitId === "kelvin") return value + 273.15;
  return value;
}

export function formatConvertedValue(value: number): string {
  const normalized = Object.is(value, -0) || Math.abs(value) < 1e-12 ? 0 : value;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 10,
    useGrouping: true,
  }).format(normalized);
}

export function convertUnits(
  input: string,
  categoryId: UnitCategoryId | string,
  fromUnitId: string,
  toUnitId: string
): UnitConversionResult {
  const parsed = parseInput(input);
  if (typeof parsed !== "number") return parsed;

  const category = getUnitCategory(categoryId);
  if (!category) {
    return {
      success: false,
      code: "INVALID_CATEGORY",
      message: "La categoría seleccionada no existe.",
    };
  }

  const fromUnit = category.units.find((unit) => unit.id === fromUnitId);
  const toUnit = category.units.find((unit) => unit.id === toUnitId);
  if (!fromUnit || !toUnit) {
    return {
      success: false,
      code: "INVALID_UNIT",
      message: "Selecciona unidades válidas de la misma categoría.",
    };
  }

  let value: number;
  if (category.id === "temperature") {
    const celsius = toCelsius(parsed, fromUnit.id);
    if (celsius < -273.15 - 1e-10) {
      return {
        success: false,
        code: "BELOW_ABSOLUTE_ZERO",
        message: "La temperatura no puede ser inferior al cero absoluto.",
      };
    }
    value = fromCelsius(celsius, toUnit.id);
  } else {
    value = (parsed * (fromUnit.factor ?? 1)) / (toUnit.factor ?? 1);
  }

  if (!Number.isFinite(value)) {
    return {
      success: false,
      code: "NON_FINITE_RESULT",
      message: "El resultado está fuera del rango numérico admitido.",
    };
  }

  const normalizedValue = Object.is(value, -0) ? 0 : value;
  return {
    success: true,
    value: normalizedValue,
    formatted: formatConvertedValue(normalizedValue),
    fromUnit,
    toUnit,
    category,
  };
}
