import { describe, expect, it } from "vitest";
import { frac, parseFraction, toDecimalString, toFractionString } from "@/lib/tools/fraction";
import {
  addMatrices,
  determinant,
  fromValues,
  identity,
  inverse,
  multiplyMatrices,
  parseMatrix,
  rank,
  subtractMatrices,
  transpose,
  type Matrix,
} from "@/lib/tools/matrix";
import { simplifySqrt, solveLinearSystem, solveQuadratic } from "@/lib/tools/equations";
import { buildTruthTable, formatFormula, parseFormula } from "@/lib/tools/truth-table";
import { evaluateInvestment, internalRates, parseFlows, signChanges } from "@/lib/tools/investment";
import { addBusinessDays, countBusinessDays, easterSunday, ecuadorHolidays, ecuadorHolidaysBetween } from "@/lib/tools/business-days";

const show = (m: Matrix) => m.map((r) => r.map(toFractionString));

describe("fracciones exactas", () => {
  it("lee enteros, decimales con punto o coma y fracciones", () => {
    expect(toFractionString(parseFraction("3")!)).toBe("3");
    expect(toFractionString(parseFraction("-0,25")!)).toBe("-1/4");
    expect(toFractionString(parseFraction("2.5")!)).toBe("5/2");
    expect(toFractionString(parseFraction("6/-8")!)).toBe("-3/4");
    expect(toFractionString(parseFraction(".5")!)).toBe("1/2");
  });

  it("rechaza textos no numéricos y división por cero", () => {
    for (const t of ["", "abc", "1/0", "1/2/3", "1e5", "--2"]) expect(parseFraction(t), t).toBeNull();
  });

  it("decimal exacto sin error de coma flotante (0.1 + 0.2 = 0.3)", () => {
    const s = frac(1, 10);
    const r = { n: s.n * BigInt(3), d: s.d };
    expect(toDecimalString(r, 10)).toBe("0.3");
    expect(toDecimalString(frac(1, 3), 6)).toBe("0.333333");
    expect(toDecimalString(frac(2, 3), 6)).toBe("0.666667");
    expect(toDecimalString(frac(-1, 8), 2)).toBe("-0.13");
    expect(toDecimalString(frac(-1, 1000), 2)).toBe("0");
  });
});

describe("matrices", () => {
  const A = fromValues([[1, 2], [3, 4]]);
  const B = fromValues([[5, 6], [7, 8]]);

  it("lee matrices escritas como texto y valida el tamaño", () => {
    const r = parseMatrix("1 2 3\n4; 5; 6\n\n1/2 0,5 -1");
    expect(r.success && show(r.matrix)).toEqual([["1", "2", "3"], ["4", "5", "6"], ["1/2", "1/2", "-1"]]);
    const bad = parseMatrix("1 2\n3");
    expect(bad.success).toBe(false);
    expect(!bad.success && bad.message).toContain("fila 2");
    expect(parseMatrix("1 x").success).toBe(false);
    expect(parseMatrix("").success).toBe(false);
  });

  it("suma, resta y multiplica", () => {
    const s = addMatrices(A, B);
    expect(s.success && show(s.matrix)).toEqual([["6", "8"], ["10", "12"]]);
    const d = subtractMatrices(A, B);
    expect(d.success && show(d.matrix)).toEqual([["-4", "-4"], ["-4", "-4"]]);
    const p = multiplyMatrices(A, B);
    expect(p.success && show(p.matrix)).toEqual([["19", "22"], ["43", "50"]]);
    expect(multiplyMatrices(fromValues([[1, 2, 3]]), A).success).toBe(false);
    expect(addMatrices(A, fromValues([[1]])).success).toBe(false);
  });

  it("traspuesta", () => {
    expect(show(transpose(fromValues([[1, 2, 3], [4, 5, 6]])))).toEqual([["1", "4"], ["2", "5"], ["3", "6"]]);
  });

  it("determinante exacto", () => {
    const d = determinant(A);
    expect(d.success && toFractionString(d.value)).toBe("-2");
    const d3 = determinant(fromValues([[2, -3, 1], [2, 0, -1], [1, 4, 5]]));
    expect(d3.success && toFractionString(d3.value)).toBe("49");
    const dz = determinant(fromValues([[0, 1], [1, 0]])); // requiere intercambio de filas
    expect(dz.success && toFractionString(dz.value)).toBe("-1");
    const singular = determinant(fromValues([[1, 2], [2, 4]]));
    expect(singular.success && toFractionString(singular.value)).toBe("0");
    expect(determinant(fromValues([[1, 2, 3]])).success).toBe(false);
  });

  it("inversa exacta con fracciones y A·A⁻¹ = I", () => {
    const inv = inverse(A);
    expect(inv.success && show(inv.matrix)).toEqual([["-2", "1"], ["3/2", "-1/2"]]);
    if (inv.success) {
      const prod = multiplyMatrices(A, inv.matrix);
      expect(prod.success && show(prod.matrix)).toEqual(show(identity(2)));
    }
    const m3 = fromValues([[2, -1, 0], [-1, 2, -1], [0, -1, 2]]);
    const inv3 = inverse(m3);
    expect(inv3.success && show(inv3.matrix)).toEqual([["3/4", "1/2", "1/4"], ["1/2", "1", "1/2"], ["1/4", "1/2", "3/4"]]);
    const sing = inverse(fromValues([[1, 2], [2, 4]]));
    expect(sing.success).toBe(false);
  });

  it("rango", () => {
    expect(rank(fromValues([[1, 2, 3], [2, 4, 6], [1, 0, 1]]))).toBe(2);
    expect(rank(identity(4))).toBe(4);
    expect(rank(fromValues([[0, 0], [0, 0]]))).toBe(0);
  });
});

describe("ecuación cuadrática", () => {
  const q = (a: number | string, b: number | string, c: number | string) => solveQuadratic(parseFraction(String(a))!, parseFraction(String(b))!, parseFraction(String(c))!);

  it("dos raíces racionales", () => {
    const r = q(1, -5, 6);
    expect(r.success && r.kind).toBe("two-real");
    expect(r.success && r.roots.map((x) => x.exact)).toEqual(["3", "2"]);
    expect(r.success && toFractionString(r.discriminant!)).toBe("1");
    const f = q(6, -5, 1);
    expect(f.success && f.roots.map((x) => x.exact)).toEqual(["1/2", "1/3"]);
  });

  it("raíces irracionales exactas y decimales", () => {
    const r = q(1, -2, -1); // x = 1 ± √2
    expect(r.success && r.roots.map((x) => x.exact)).toEqual(["1 + √2", "1 − √2"]);
    expect(r.success && r.roots.map((x) => x.decimal)).toEqual(["2.4142135624", "-0.4142135624"]);
    const s = q(1, 0, -12); // ±2√3
    expect(s.success && s.roots.map((x) => x.exact)).toEqual(["2√3", "−2√3"]);
  });

  it("raíz doble", () => {
    const r = q(1, 4, 4);
    expect(r.success && r.kind).toBe("double");
    expect(r.success && r.roots).toEqual([{ exact: "-2", decimal: "-2" }]);
  });

  it("raíces complejas", () => {
    const r = q(1, 2, 5); // −1 ± 2i
    expect(r.success && r.kind).toBe("complex");
    expect(r.success && r.roots.map((x) => x.exact)).toEqual(["-1 + 2i", "-1 − 2i"]);
    expect(r.success && r.roots[0].decimal).toBe("-1 + 2i");
    const s = q(1, 0, 3); // ±√3 i
    expect(s.success && s.roots.map((x) => x.exact)).toEqual(["√3·i", "−√3·i"]);
    expect(s.success && s.roots[0].decimal).toBe("0 + 1.7320508076i");
  });

  it("coeficientes decimales y a negativo", () => {
    const r = q("0.5", "-1.5", 1); // x² − 3x + 2 = 0 ⇒ 2 y 1
    expect(r.success && r.roots.map((x) => x.exact).sort()).toEqual(["1", "2"]);
    const n = q(-1, 0, 4);
    expect(n.success && n.roots.map((x) => x.exact).sort()).toEqual(["-2", "2"]);
  });

  it("casos degenerados", () => {
    const l = q(0, 2, -3);
    expect(l.success && l.kind).toBe("linear");
    expect(l.success && l.roots[0].exact).toBe("3/2");
    expect(q(0, 0, 0).success && (q(0, 0, 0) as { kind: string }).kind).toBe("identity");
    expect((q(0, 0, 5) as { kind: string }).kind).toBe("none");
  });

  it("simplifica raíces", () => {
    expect(simplifySqrt(BigInt(72))).toEqual({ k: BigInt(6), r: BigInt(2) });
    expect(simplifySqrt(BigInt(49))).toEqual({ k: BigInt(7), r: BigInt(1) });
    expect(simplifySqrt(BigInt(7))).toEqual({ k: BigInt(1), r: BigInt(7) });
  });
});

describe("sistemas de ecuaciones lineales", () => {
  it("solución única", () => {
    // 2x + y − z = 8; −3x − y + 2z = −11; −2x + y + 2z = −3 ⇒ (2, 3, −1)
    const r = solveLinearSystem(fromValues([[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]));
    expect(r.success && r.kind).toBe("unique");
    expect(r.success && r.kind === "unique" && r.values.map(toFractionString)).toEqual(["2", "3", "-1"]);
  });

  it("solución única con fracciones", () => {
    const r = solveLinearSystem(fromValues([[3, 2, 1], [1, -1, 2]]));
    expect(r.success && r.kind === "unique" && r.values.map(toFractionString)).toEqual(["1", "-1"]);
    const f = solveLinearSystem(fromValues([[2, 0, 1], [0, 3, 1]]));
    expect(f.success && f.kind === "unique" && f.values.map(toFractionString)).toEqual(["1/2", "1/3"]);
  });

  it("sin solución (incompatible)", () => {
    const r = solveLinearSystem(fromValues([[1, 1, 2], [1, 1, 3]]));
    expect(r.success && r.kind).toBe("none");
  });

  it("infinitas soluciones con variable libre", () => {
    // x + y = 2; 2x + 2y = 4 ⇒ x = 2 − y
    const r = solveLinearSystem(fromValues([[1, 1, 2], [2, 2, 4]]), ["x", "y"]);
    expect(r.success && r.kind).toBe("infinite");
    expect(r.success && r.kind === "infinite" && r.expressions).toEqual(["x = 2 − y", "y = y (libre)"]);
  });
});

describe("tablas de verdad", () => {
  const table = (f: string) => {
    const p = parseFormula(f);
    if (!p.success) throw new Error(p.message);
    return buildTruthTable(p.ast, p.variables);
  };
  const last = (t: ReturnType<typeof table>) => t.rows.map((r) => (r[r.length - 1] ? "V" : "F")).join("");

  it("conectivos básicos (filas V V, V F, F V, F F)", () => {
    expect(last(table("p ∧ q"))).toBe("VFFF");
    expect(last(table("p ∨ q"))).toBe("VVVF");
    expect(last(table("p → q"))).toBe("VFVV");
    expect(last(table("p ↔ q"))).toBe("VFFV");
    expect(last(table("p ⊕ q"))).toBe("FVVF");
    expect(last(table("¬p"))).toBe("FV");
  });

  it("acepta notaciones alternativas", () => {
    expect(last(table("p -> q"))).toBe("VFVV");
    expect(last(table("~p | q"))).toBe("VFVV");
    expect(last(table("p AND NOT q"))).toBe("FVFF");
    expect(last(table("p ^ q"))).toBe("VFFF");
    expect(last(table("[p <-> q]"))).toBe("VFFV");
  });

  it("clasifica tautología, contradicción y contingencia", () => {
    expect(table("((p → q) ∧ p) → q").classification).toBe("tautology"); // modus ponens
    expect(table("p ∨ ¬p").classification).toBe("tautology");
    expect(table("p ∧ ¬p").classification).toBe("contradiction");
    expect(table("p → q").classification).toBe("contingency");
    expect(table("¬(p ∧ q) ↔ (¬p ∨ ¬q)").classification).toBe("tautology"); // De Morgan
  });

  it("precedencia: ¬ > ∧ > ∨ > → > ↔ y → asocia por la derecha", () => {
    const p = parseFormula("p ∨ q ∧ r");
    expect(p.success && formatFormula(p.ast)).toBe("p ∨ q ∧ r");
    expect(last(table("p ∨ q ∧ r"))).toBe(last(table("p ∨ (q ∧ r)")));
    expect(last(table("p → q → r"))).toBe(last(table("p → (q → r)")));
    const q = parseFormula("(p → q) → r");
    expect(q.success && formatFormula(q.ast)).toBe("(p → q) → r");
  });

  it("columnas intermedias y orden de filas", () => {
    const t = table("(p → q) ∧ r");
    expect(t.columns).toEqual(["p", "q", "r", "p → q", "(p → q) ∧ r"]);
    expect(t.rows).toHaveLength(8);
    expect(t.rows[0].slice(0, 3)).toEqual([true, true, true]);
    expect(t.rows[7].slice(0, 3)).toEqual([false, false, false]);
  });

  it("errores claros", () => {
    for (const f of ["", "p ∧", "(p ∨ q", "p q", "pq ∧ r", "p # q", "p ∧ q)"]) expect(parseFormula(f).success, f).toBe(false);
    expect(parseFormula("a ∧ b ∧ c ∧ d ∧ e ∧ f ∧ g").success).toBe(false); // 7 variables
  });
});

describe("VAN y TIR", () => {
  it("VAN y TIR de un proyecto típico (coincide con Excel)", () => {
    // Excel: =VNA(10%;300;400;500)-1000 → -21.04 ; =TIR(...) → 8.8963%
    const r = evaluateInvestment(10, [-1000, 300, 400, 500]);
    expect(r.success && r.npv).toBe(-21.04);
    expect(r.success && r.irr).toEqual([8.8963]);
    expect(r.success && r.decision).toBe("reject");
  });

  it("proyecto rentable, índice de rentabilidad y recuperación", () => {
    const r = evaluateInvestment(12, [-5000, 2000, 2000, 2000, 2000]);
    // VAN = 2000 · (1 − 1.12⁻⁴)/0.12 − 5000 = 1074.70
    expect(r.success && r.npv).toBe(1074.7);
    expect(r.success && r.irr).toEqual([21.8623]);
    expect(r.success && r.profitabilityIndex).toBe(1.2149);
    expect(r.success && r.payback).toEqual({ period: 3, interpolated: 2.5 });
    expect(r.success && r.discountedPayback.period).toBe(4);
    expect(r.success && r.decision).toBe("accept");
  });

  it("TIR = tasa que hace VAN = 0", () => {
    const flows = [-1000, 1100];
    expect(internalRates(flows).map((x) => Math.round(x * 1e8) / 1e8)).toEqual([0.1]);
    const r = evaluateInvestment(10, flows);
    expect(r.success && r.npv).toBe(0);
    expect(r.success && r.decision).toBe("indifferent");
  });

  it("flujos no convencionales: varias TIR", () => {
    // −100 + 230/(1+r) − 132/(1+r)² = 0 ⇒ r = 10 % y 20 %
    const r = evaluateInvestment(5, [-100, 230, -132]);
    expect(r.success && r.irr).toEqual([10, 20]);
    expect(r.success && r.signChanges).toBe(2);
  });

  it("sin TIR cuando no hay cambio de signo", () => {
    const r = evaluateInvestment(10, [100, 200, 300]);
    expect(r.success && r.irr).toEqual([]);
    expect(r.success && r.profitabilityIndex).toBeNull();
    expect(signChanges([-1, 0, 0, 2])).toBe(1);
  });

  it("tasa 0 y validaciones", () => {
    const r = evaluateInvestment(0, [-100, 50, 60]);
    expect(r.success && r.npv).toBe(10);
    expect(evaluateInvestment(-100, [-1, 2]).success).toBe(false);
    expect(evaluateInvestment(10, [-100]).success).toBe(false);
    expect(evaluateInvestment(10, [0, 0]).success).toBe(false);
    expect(evaluateInvestment(10, [Number.NaN, 1]).success).toBe(false);
  });

  it("lee flujos", () => {
    expect(parseFlows("-1000\n300; 400 500,5")).toEqual({ success: true, flows: [-1000, 300, 400, 500.5] });
    expect(parseFlows("$-1000\n$300")).toEqual({ success: true, flows: [-1000, 300] });
    expect(parseFlows("1.000,50").success).toBe(false);
    expect(parseFlows("abc").success).toBe(false);
  });
});

describe("días hábiles y feriados de Ecuador", () => {
  const dates = (y: number) => ecuadorHolidays(y).map((h) => h.date);

  it("Domingo de Pascua", () => {
    expect(easterSunday(2024)).toBe("2024-03-31");
    expect(easterSunday(2025)).toBe("2025-04-20");
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2019)).toBe("2019-04-21");
  });

  it("calendario oficial 2023", () => {
    expect(dates(2023)).toEqual(["2023-01-02", "2023-02-20", "2023-02-21", "2023-04-07", "2023-05-01", "2023-05-26", "2023-08-11", "2023-10-09", "2023-11-02", "2023-11-03", "2023-12-25"]);
  });

  it("calendario oficial 2024 (2 y 3 de noviembre en sábado y domingo)", () => {
    expect(dates(2024)).toEqual(["2024-01-01", "2024-02-12", "2024-02-13", "2024-03-29", "2024-05-03", "2024-05-24", "2024-08-09", "2024-10-11", "2024-11-01", "2024-11-04", "2024-12-25"]);
  });

  it("calendario oficial 2025 (2 de noviembre en domingo pasa al martes)", () => {
    expect(dates(2025)).toEqual(["2025-01-01", "2025-03-03", "2025-03-04", "2025-04-18", "2025-05-02", "2025-05-23", "2025-08-11", "2025-10-10", "2025-11-03", "2025-11-04", "2025-12-25"]);
    const nov = ecuadorHolidays(2025).find((h) => h.name === "Día de los Difuntos");
    expect(nov).toEqual({ date: "2025-11-04", name: "Día de los Difuntos", movedFrom: "2025-11-02" });
  });

  it("reglas de 2 y 3 de noviembre (Disposición General Primera)", () => {
    const nov = (y: number) => ecuadorHolidays(y).filter((h) => h.date.slice(5, 7) === "11" || h.movedFrom?.slice(5, 7) === "11").map((h) => h.date);
    expect(nov(2021)).toEqual(["2021-11-01", "2021-11-02"]); // martes-miércoles: miércoles → lunes
    expect(nov(2022)).toEqual(["2022-11-03", "2022-11-04"]); // miércoles-jueves: miércoles → viernes
    expect(nov(2018)).toEqual(["2018-11-01", "2018-11-02"]); // viernes-sábado: sábado → jueves
    expect(nov(2020)).toEqual(["2020-11-02", "2020-11-03"]); // lunes-martes: sin traslado
  });

  it("1 de enero y 25 de diciembre no se trasladan entre semana, pero sí desde fin de semana", () => {
    expect(dates(2025)).toContain("2025-01-01"); // miércoles
    expect(ecuadorHolidaysBetween("2021-12-01", "2022-01-31").map((h) => h.date)).toEqual(["2021-12-24", "2021-12-31"]); // 25-dic sábado y 1-ene-2022 sábado
  });

  it("fuera del periodo de la ley no se generan feriados", () => {
    expect(ecuadorHolidays(2016)).toEqual([]);
  });

  it("cuenta días hábiles incluyendo ambas fechas (como DIAS.LAB)", () => {
    const r = countBusinessDays("2025-09-01", "2025-09-30", { holidays: [] });
    expect(r).toEqual({ success: true, businessDays: 22, calendarDays: 30, weekendDays: 8, holidaysOnWorkdays: [] });
    const h = countBusinessDays("2025-12-22", "2026-01-02", { holidays: ecuadorHolidaysBetween("2025-12-22", "2026-01-02").map((x) => x.date) });
    expect(h.success && h.businessDays).toBe(8);
    expect(h.success && h.holidaysOnWorkdays).toEqual(["2025-12-25", "2026-01-01"]);
    const rev = countBusinessDays("2025-09-30", "2025-09-01", { holidays: [] });
    expect(rev.success && rev.businessDays).toBe(-22);
    expect(countBusinessDays("2025-02-30", "2025-03-01", { holidays: [] }).success).toBe(false);
  });

  it("sábado como día hábil", () => {
    const r = countBusinessDays("2025-09-01", "2025-09-30", { holidays: [], saturdayIsWorkday: true });
    expect(r.success && r.businessDays).toBe(26);
  });

  it("suma y resta días hábiles sin contar la fecha inicial (como DIA.LAB)", () => {
    expect(addBusinessDays("2025-09-26", 1, { holidays: [] })).toEqual({ success: true, date: "2025-09-29", calendarDays: 3, skippedHolidays: [] });
    const r = addBusinessDays("2025-10-08", 2, { holidays: ["2025-10-10"] });
    expect(r).toEqual({ success: true, date: "2025-10-13", calendarDays: 5, skippedHolidays: ["2025-10-10"] });
    expect(addBusinessDays("2025-09-29", -1, { holidays: [] })).toMatchObject({ date: "2025-09-26" });
    expect(addBusinessDays("2025-09-29", 0, { holidays: [] })).toMatchObject({ date: "2025-09-29" });
    expect(addBusinessDays("2025-09-29", 1.5, { holidays: [] }).success).toBe(false);
  });
});
