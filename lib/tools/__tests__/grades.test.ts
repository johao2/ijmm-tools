import { describe, expect, it } from "vitest";
import { parseDecimal, requiredGrade, weightedAverage } from "@/lib/tools/grades";

describe("weightedAverage", () => {
  it("calcula el promedio ponderado con pesos que suman 100%", () => {
    const r = weightedAverage([{ grade: 8, weight: 30 }, { grade: 6, weight: 30 }, { grade: 9, weight: 40 }], 10);
    expect(r).toMatchObject({ success: true, average: 7.8, totalWeight: 100 });
  });

  it("calcula el promedio parcial cuando los pesos suman menos de 100%", () => {
    const r = weightedAverage([{ grade: 8, weight: 20 }, { grade: 10, weight: 20 }], 10);
    expect(r).toMatchObject({ success: true, average: 9, totalWeight: 40 });
  });

  it("maneja decimales y escalas distintas", () => {
    const r = weightedAverage([{ grade: 15.5, weight: 50 }, { grade: 18.25, weight: 50 }], 20);
    expect(r).toMatchObject({ success: true, average: 16.88 });
  });

  it("rechaza pesos que superan el 100%", () => {
    const r = weightedAverage([{ grade: 8, weight: 60 }, { grade: 8, weight: 50 }], 10);
    expect(r.success).toBe(false);
  });

  it("rechaza notas fuera de escala, negativas, pesos en cero y listas vacías", () => {
    expect(weightedAverage([{ grade: 11, weight: 50 }], 10).success).toBe(false);
    expect(weightedAverage([{ grade: -1, weight: 50 }], 10).success).toBe(false);
    expect(weightedAverage([{ grade: 5, weight: 0 }], 10).success).toBe(false);
    expect(weightedAverage([], 10).success).toBe(false);
    expect(weightedAverage([{ grade: Number.NaN, weight: 10 }], 10).success).toBe(false);
    expect(weightedAverage([{ grade: 5, weight: 10 }], 0).success).toBe(false);
  });
});

describe("requiredGrade", () => {
  it("calcula la nota necesaria en el examen final", () => {
    // 60% ya evaluado con promedio 6 → 3.6 puntos; faltan 3.4 puntos en un 40% → 8.5
    const r = requiredGrade([{ grade: 6, weight: 60 }], 40, 7, 10);
    expect(r).toMatchObject({ success: true, required: 8.5, achievable: true, alreadyReached: false });
  });

  it("redondea la nota necesaria hacia arriba para no quedarse corto", () => {
    // (7 − 4.35) ÷ 0.4 = 6.625 → 6.63
    expect(requiredGrade([{ grade: 8, weight: 30 }, { grade: 6.5, weight: 30 }], 40, 7, 10)).toMatchObject({ success: true, required: 6.63 });
    // 6.857142857 × 0.7 = 4.8 puntos; (7 − 4.8) ÷ 0.3 = 7.333… → 7.34
    expect(requiredGrade([{ grade: 6.857142857, weight: 70 }], 30, 7, 10)).toMatchObject({ success: true, required: 7.34 });
    // Valores exactos no se alteran
    expect(requiredGrade([{ grade: 6, weight: 60 }], 40, 7, 10)).toMatchObject({ required: 8.5 });
  });

  it("indica cuando la nota objetivo no es alcanzable", () => {
    const r = requiredGrade([{ grade: 3, weight: 70 }], 30, 7, 10);
    expect(r).toMatchObject({ success: true, achievable: false });
  });

  it("indica cuando el objetivo ya está asegurado", () => {
    const r = requiredGrade([{ grade: 10, weight: 80 }], 20, 7, 10);
    expect(r).toMatchObject({ success: true, required: 0, alreadyReached: true });
  });

  it("funciona sin notas registradas", () => {
    expect(requiredGrade([], 100, 7, 10)).toMatchObject({ success: true, required: 7 });
  });

  it("valida pesos y objetivo", () => {
    expect(requiredGrade([{ grade: 8, weight: 80 }], 30, 7, 10).success).toBe(false);
    expect(requiredGrade([], 0, 7, 10).success).toBe(false);
    expect(requiredGrade([], 50, 12, 10).success).toBe(false);
  });
});

describe("parseDecimal", () => {
  it("acepta coma o punto decimal y rechaza texto inválido", () => {
    expect(parseDecimal("8,5")).toBe(8.5);
    expect(parseDecimal(" 7.25 ")).toBe(7.25);
    expect(parseDecimal("")).toBeNaN();
    expect(parseDecimal("abc")).toBeNaN();
    expect(parseDecimal("1.2.3")).toBeNaN();
  });
});
