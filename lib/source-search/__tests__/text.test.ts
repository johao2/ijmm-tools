import { describe, expect, it } from "vitest";
import { abstractFromInvertedIndex, documentKeys, htmlToText, matchAgainstSource, prioritizeForFetch, queryBudget, selectQueryPhrases } from "@/lib/source-search/text";
import { tokenize } from "@/lib/tools/similarity";

const doc =
  "La fotosíntesis es el proceso mediante el cual las plantas transforman la energía de la luz solar en energía química que almacenan en forma de glucosa. " +
  "Este proceso ocurre en los cloroplastos y libera oxígeno a la atmósfera, lo que permite la vida en el planeta. " +
  "En los ecosistemas andinos del Ecuador las especies nativas presentan adaptaciones particulares frente a la radiación intensa y las bajas temperaturas nocturnas.";

describe("selectQueryPhrases", () => {
  it("elige frases dentro de una misma oración y con palabras de contenido", () => {
    const phrases = selectQueryPhrases(doc, 20, 9);
    expect(phrases.length).toBeGreaterThan(0);
    for (const p of phrases) {
      expect(tokenize(p)).toHaveLength(9);
      expect(p).not.toMatch(/[.!?;:\n]/);
    }
  });

  it("respeta el máximo y reparte por el documento", () => {
    const long = Array.from({ length: 40 }, (_, i) => `Tema ${i} análisis profundo sobre variables económicas regionales especiales importantes aquí.`).join(" ");
    const phrases = selectQueryPhrases(long, 5, 9);
    expect(phrases.length).toBeLessThanOrEqual(5);
    expect(new Set(phrases).size).toBe(phrases.length);
  });

  it("devuelve lista vacía con textos muy cortos", () => {
    expect(selectQueryPhrases("pocas palabras aquí")).toEqual([]);
  });
});

describe("htmlToText", () => {
  it("quita scripts, estilos, navegación y etiquetas, y decodifica entidades", () => {
    const html = '<html><head><style>p{}</style><script>var x=1</script></head><body><nav>Menú</nav><h1>Título</h1><p>Energía &amp; luz&nbsp;solar &#233; &#x41;</p><footer>pie</footer></body></html>';
    const text = htmlToText(html);
    expect(text).toContain("Título");
    expect(text).toContain("Energía & luz solar é A");
    expect(text).not.toMatch(/var x|Menú|pie|p\{\}/);
  });
});

describe("abstractFromInvertedIndex", () => {
  it("reconstruye el resumen en orden", () => {
    expect(abstractFromInvertedIndex({ energía: [1], La: [0], solar: [2] })).toBe("La energía solar");
    expect(abstractFromInvertedIndex(null)).toBe("");
  });
});

describe("matchAgainstSource", () => {
  const docTokens = tokenize(doc);

  it("mide coincidencias exactas contra una fuente y devuelve los fragmentos literales de la fuente", () => {
    const source = "Según el libro, LA FOTOSINTESIS es el proceso mediante el cual las plantas transforman la energia de la luz solar en energia quimica. Otro tema distinto.";
    const r = matchAgainstSource(docTokens, source, 5);
    // "La fotosíntesis ... energía química" = 20 palabras
    expect(r.matchedWords).toBe(20);
    expect(r.spans).toHaveLength(1);
    expect(doc.slice(r.spans[0].start, r.spans[0].end)).toBe("La fotosíntesis es el proceso mediante el cual las plantas transforman la energía de la luz solar en energía química");
    expect(r.sourceExcerpts[0]).toBe("LA FOTOSINTESIS es el proceso mediante el cual las plantas transforman la energia de la luz solar en energia quimica");
  });

  it("no cuenta coincidencias más cortas que la sensibilidad", () => {
    const r = matchAgainstSource(docTokens, "las plantas transforman la luz en otras cosas", 5);
    expect(r.matchedWords).toBe(0);
  });

  it("maneja fuentes vacías", () => {
    expect(matchAgainstSource(docTokens, "", 5).matchedWords).toBe(0);
  });
});

describe("queryBudget", () => {
  it("escala las consultas con la longitud del documento, con topes", () => {
    expect(queryBudget(1000)).toEqual({ brave: 20, core: 8, openalex: 6 });
    expect(queryBudget(6000)).toEqual({ brave: 20, core: 8, openalex: 6 });
    expect(queryBudget(12000)).toEqual({ brave: 40, core: 10, openalex: 7 });
    expect(queryBudget(40000)).toEqual({ brave: 60, core: 15, openalex: 10 });
  });
});

describe("selectQueryPhrases con tramo excluido", () => {
  it("no elige frases dentro del tramo excluido", () => {
    const start = doc.length;
    const text = `${doc}
Referencias
Pérez Gómez realizó estudios extensos sobre ecosistemas andinos ecuatorianos durante varias décadas completas midiendo radiación temperatura humedad altitud cobertura vegetal especies nativas páramos bosques nublados Pérez Gómez comparó registros históricos climáticos provinciales`;
    const phrases = selectQueryPhrases(text, 50, 9, { start, end: text.length });
    expect(phrases.some((p) => p.includes("Pérez"))).toBe(false);
    expect(selectQueryPhrases(text, 50, 9).some((p) => p.includes("Pérez"))).toBe(true);
  });
});

describe("documentKeys", () => {
  it("da el mismo resultado que calcular las claves en cada comparación", () => {
    const tokens = tokenize(doc);
    const source = doc.slice(0, 200);
    expect(matchAgainstSource(tokens, source, 5, documentKeys(tokens, 5))).toEqual(matchAgainstSource(tokens, source, 5));
  });
});

describe("prioritizeForFetch", () => {
  it("elige primero la mejor fuente de cada parte del documento y luego las más repetidas", () => {
    const set = (...p: string[]) => new Set(p);
    const items = [
      { key: "copia1-fotosintesis", phrases: set("f1", "f2", "f3", "f4") },
      { key: "copia2-fotosintesis", phrases: set("f1", "f2", "f3") },
      { key: "copia3-fotosintesis", phrases: set("f2", "f3", "f4") },
      { key: "wiki-riego", phrases: set("r1", "r2") },
      { key: "blog-riego", phrases: set("r1") },
    ];
    expect(prioritizeForFetch(items, 2)).toEqual(["copia1-fotosintesis", "wiki-riego"]);
    expect(prioritizeForFetch(items, 5)).toEqual(["copia1-fotosintesis", "wiki-riego", "copia2-fotosintesis", "copia3-fotosintesis", "blog-riego"]);
    expect(prioritizeForFetch([], 3)).toEqual([]);
  });
});
