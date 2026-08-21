import { FAQItem } from "@/lib/tools/types";

export const FAQS_BY_TOOL_ID: Record<string, FAQItem[]> = {
  "percentage-calculator": [
    {
      question: "¿Qué es un porcentaje?",
      answer: "Un porcentaje es una forma de expresar un número como una fracción de 100. Se representa con el símbolo de porcentaje (%). Por ejemplo, el 45% significa 45 partes de 100.",
      formula: "P = (Parte / Total) × 100",
      example: "25 de 200 es (25 / 200) × 100 = 12.5%",
    },
    {
      question: "¿Cómo se calcula el X% de un número Y?",
      answer: "Para calcular el X% de un número Y, multiplica el número total Y por la tasa porcentual X y divide el resultado entre 100.",
      formula: "Resultado = Y × (X / 100)",
      example: "El 15% de 250 = 250 × (15 / 100) = 37.5",
    },
    {
      question: "¿Cómo se calcula el porcentaje de incremento?",
      answer: "Para calcular el incremento porcentual, resta el valor original al nuevo valor, divide el resultado entre el valor original y multiplícalo por 100.",
      formula: "Incremento % = ((Nuevo Valor - Valor Original) / Valor Original) × 100",
      example: "Si un precio sube de $100 a $125: ((125 - 100) / 100) × 100 = 25% de incremento",
    },
    {
      question: "¿Cómo se calcula el porcentaje de decremento?",
      answer: "Para calcular el decremento porcentual, resta el nuevo valor al valor original, divide entre el valor original y multiplica por 100.",
      formula: "Decremento % = ((Valor Original - Nuevo Valor) / Valor Original) × 100",
      example: "Si un precio baja de $200 a $150: ((200 - 150) / 200) × 100 = 25% de decremento",
    },
    {
      question: "¿Cómo se calcula la diferencia porcentual entre dos números?",
      answer: "La diferencia porcentual compara dos valores sin asumir uno como original. Divide el valor absoluto de la diferencia entre el promedio de ambos números y multiplica por 100.",
      formula: "Diferencia % = (|A - B| / ((A + B) / 2)) × 100",
      example: "Diferencia entre 10 y 20: |10 - 20| / ((10 + 20) / 2) × 100 = 10 / 15 × 100 = 66.67%",
    },
    {
      question: "¿Cómo se calcula el monto de descuento y el precio final?",
      answer: "Multiplica el precio original por el porcentaje de descuento para obtener el monto ahorrado. Resta ese monto del precio original para obtener el precio final.",
      formula: "Monto Descuento = Precio × (Descuento % / 100) | Precio Final = Precio - Monto Descuento",
      example: "Artículo de $80 con 20% de descuento: Descuento = $80 × 0.20 = $16, Precio Final = $80 - $16 = $64",
    },
  ],
};
