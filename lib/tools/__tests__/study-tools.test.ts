import { describe, expect, it } from "vitest";
import { analyzeText, formatMinutes } from "@/lib/tools/text-stats";
import { amortizationSchedule, compoundInterest, simpleInterest } from "@/lib/tools/finance";
import { DEFAULT_POMODORO, formatClock, nextPhase, phaseDurationMs, validateSettings } from "@/lib/tools/pomodoro";
import { formatAuthors, formatCitation, initials, normalizeDoi } from "@/lib/tools/citations";

describe("text-stats", () => {
  it("cuenta palabras, caracteres, oraciones y párrafos en español", () => {
    const s = analyzeText("¿Qué es la célula? Es la unidad básica de la vida.\n\nTodas las células vienen de otras.");
    expect(s.words).toBe(17);
    expect(s.sentences).toBe(3);
    expect(s.paragraphs).toBe(2);
    expect(s.charactersNoSpaces).toBeLessThan(s.characters);
  });

  it("maneja texto vacío", () => {
    expect(analyzeText("   ")).toMatchObject({ words: 0, sentences: 0, paragraphs: 0, readingMinutes: 0 });
  });

  it("estima lectura y páginas, e ignora palabras vacías en las más usadas", () => {
    const text = Array(400).fill("investigación").join(" ");
    const s = analyzeText(text);
    expect(s.readingMinutes).toBe(2);
    expect(s.pagesDoubleSpaced).toBeCloseTo(1.5, 1);
    expect(s.topWords[0]).toEqual({ word: "investigación", count: 400 });
    expect(analyzeText("de la de la de la").topWords).toEqual([]);
  });

  it("formatea duraciones", () => {
    expect(formatMinutes(0)).toBe("0 s");
    expect(formatMinutes(0.5)).toBe("30 s");
    expect(formatMinutes(3)).toBe("3 min");
    expect(formatMinutes(65)).toBe("1 h 5 min");
  });
});

describe("finance", () => {
  it("calcula interés simple", () => {
    expect(simpleInterest(1000, 10, 2)).toMatchObject({ success: true, interest: 200, finalAmount: 1200 });
  });

  it("calcula interés compuesto y la tasa efectiva", () => {
    const r = compoundInterest(1000, 12, 1, 12);
    expect(r).toMatchObject({ success: true, finalAmount: 1126.83, interest: 126.83 });
    expect(r.success && r.effectiveAnnualRate).toBeCloseTo(12.6825, 3);
  });

  it("genera una tabla de amortización que termina en saldo cero", () => {
    const r = amortizationSchedule(10000, 12, 12);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.payment).toBe(888.49);
    expect(r.rows).toHaveLength(12);
    expect(r.rows[11].balance).toBe(0);
    expect(r.totalInterest).toBeCloseTo(661.85, 1);
  });

  it("amortiza con tasa cero", () => {
    const r = amortizationSchedule(1200, 0, 12);
    expect(r.success && r.payment).toBe(100);
  });

  it("valida capital, tasa y plazo", () => {
    expect(simpleInterest(0, 10, 1).success).toBe(false);
    expect(compoundInterest(100, -1, 1).success).toBe(false);
    expect(amortizationSchedule(1000, 10, 0).success).toBe(false);
    expect(amortizationSchedule(1000, 10, 2.5).success).toBe(false);
  });
});

describe("pomodoro", () => {
  it("alterna trabajo y descansos con descanso largo cada 4 ciclos", () => {
    let state = { phase: "work" as const, completedWork: 0 } as { phase: "work" | "shortBreak" | "longBreak"; completedWork: number };
    const phases: string[] = [];
    for (let i = 0; i < 8; i++) {
      state = nextPhase(state.phase, state.completedWork, DEFAULT_POMODORO);
      phases.push(state.phase);
    }
    expect(phases).toEqual(["shortBreak", "work", "shortBreak", "work", "shortBreak", "work", "longBreak", "work"]);
  });

  it("calcula duraciones y formatea el reloj", () => {
    expect(phaseDurationMs("work", DEFAULT_POMODORO)).toBe(1_500_000);
    expect(formatClock(1_500_000)).toBe("25:00");
    expect(formatClock(59_001)).toBe("01:00");
    expect(formatClock(-5)).toBe("00:00");
  });

  it("valida la configuración", () => {
    expect(validateSettings(DEFAULT_POMODORO)).toBeNull();
    expect(validateSettings({ ...DEFAULT_POMODORO, workMinutes: 0 })).not.toBeNull();
    expect(validateSettings({ ...DEFAULT_POMODORO, cyclesBeforeLongBreak: 2.5 })).not.toBeNull();
  });
});

describe("citations APA 7", () => {
  it("genera iniciales, incluidos nombres compuestos", () => {
    expect(initials("juan andrés")).toBe("J. A.");
    expect(initials("Jean-Paul")).toBe("J.-P.");
  });

  it("une autores según la cantidad", () => {
    const a = (family: string) => ({ family, given: "Ana" });
    expect(formatAuthors([a("Pérez")])).toBe("Pérez, A.");
    expect(formatAuthors([a("Pérez"), a("Gómez")])).toBe("Pérez, A., y Gómez, A.");
    expect(formatAuthors([a("Pérez"), a("Gómez")], true)).toBe("Pérez, A., & Gómez, A.");
    const many = Array.from({ length: 22 }, (_, i) => a(`Autor${i + 1}`));
    const text = formatAuthors(many);
    expect(text).toContain("Autor19, A., … Autor22, A.");
    expect(text).not.toContain("Autor20");
  });

  it("formatea un libro con edición y DOI", () => {
    const r = formatCitation({ type: "book", authors: [{ family: "García Márquez", given: "Gabriel" }], year: "2014", title: "Cien años de soledad", edition: "3.ª", publisher: "Sudamericana", doi: "10.1000/xyz" });
    expect(r.success && r.plain).toBe("García Márquez, G. (2014). Cien años de soledad (3.ª ed.). Sudamericana. https://doi.org/10.1000/xyz");
    expect(r.success && r.reference.find((s) => s.italic)?.text).toBe("Cien años de soledad");
    expect(r.success && r.inText).toEqual({ parenthetical: "(García Márquez, 2014)", narrative: "García Márquez (2014)" });
  });

  it("formatea un artículo con volumen, número y páginas", () => {
    const r = formatCitation({ type: "article", authors: [{ family: "Torres", given: "Luis" }, { family: "Vera", given: "María" }, { family: "Ruiz", given: "Pablo" }], year: "2021", title: "Aprendizaje en línea", journal: "Revista de Educación", volume: "12", issue: "3", pages: "45-60" });
    expect(r.success && r.plain).toBe("Torres, L., Vera, M., y Ruiz, P. (2021). Aprendizaje en línea. Revista de Educación, 12(3), 45–60.");
    expect(r.success && r.inText.parenthetical).toBe("(Torres et al., 2021)");
  });

  it("formatea una página web con fecha completa y omite el sitio si es igual al autor", () => {
    const r = formatCitation({ type: "web", authors: [{ organization: "Organización Mundial de la Salud" }], year: "2023", month: 3, day: 15, title: "Salud mental", siteName: "Organización Mundial de la Salud", url: "https://www.who.int/es" });
    expect(r.success && r.plain).toBe("Organización Mundial de la Salud. (2023, 15 de marzo). Salud mental. https://www.who.int/es");
  });

  it("formatea una tesis y usa s. f. sin año", () => {
    const r = formatCitation({ type: "thesis", authors: [{ family: "León", given: "Carla" }], title: "Uso de energías renovables", degree: "maestría", institution: "Universidad Central del Ecuador", repository: "Repositorio UCE" });
    expect(r.success && r.plain).toBe("León, C. (s. f.). Uso de energías renovables [Tesis de maestría, Universidad Central del Ecuador]. Repositorio UCE.");
  });

  it("pone mayúscula en la primera palabra del subtítulo", () => {
    const r = formatCitation({ type: "book", authors: [{ family: "Hernández Sampieri", given: "Roberto" }], year: "2018", title: "Metodología de la investigación: las rutas cuantitativa, cualitativa y mixta", publisher: "McGraw-Hill" });
    expect(r.success && r.plain).toBe("Hernández Sampieri, R. (2018). Metodología de la investigación: Las rutas cuantitativa, cualitativa y mixta. McGraw-Hill.");
  });

  it("coloca el título primero cuando no hay autor", () => {
    const r = formatCitation({ type: "book", authors: [], year: "2020", title: "Manual de estilo", publisher: "Editorial X" });
    expect(r.success && r.plain).toBe("Manual de estilo. (2020). Editorial X.");
  });

  it("valida título, año y campos obligatorios", () => {
    expect(formatCitation({ type: "book", authors: [], title: "" }).success).toBe(false);
    expect(formatCitation({ type: "book", authors: [], title: "X", year: "20" }).success).toBe(false);
    expect(formatCitation({ type: "article", authors: [], title: "X" }).success).toBe(false);
    expect(formatCitation({ type: "thesis", authors: [], title: "X" }).success).toBe(false);
  });

  it("normaliza DOI", () => {
    expect(normalizeDoi("doi: 10.1/abc")).toBe("https://doi.org/10.1/abc");
    expect(normalizeDoi("https://doi.org/10.1/abc")).toBe("https://doi.org/10.1/abc");
    expect(normalizeDoi("")).toBe("");
  });
});
