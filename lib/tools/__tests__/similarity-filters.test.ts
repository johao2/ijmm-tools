import { describe, expect, it } from "vitest";
import { compareDocuments } from "@/lib/tools/similarity";
import { applyExclusions, findBibliographyRange, findQuoteRanges, NO_EXCLUSIONS, sha256Hex } from "@/lib/tools/similarity-filters";

const slice = (text: string, r: { start: number; end: number }) => text.slice(r.start, r.end);

describe("findQuoteRanges", () => {
  it("detecta comillas tipográficas, latinas y rectas", () => {
    const t = "Dijo “hola mundo” y luego «adiós amigo» y también \"texto recto\".";
    expect(findQuoteRanges(t).map((r) => slice(t, r))).toEqual(["“hola mundo”", "«adiós amigo»", "\"texto recto\""]);
  });

  it("una comilla sin cierre en su párrafo no excluye nada", () => {
    const t = "Empieza “sin cerrar aquí.\n\nOtro párrafo con “cita cerrada”.";
    expect(findQuoteRanges(t).map((r) => slice(t, r))).toEqual(["“cita cerrada”"]);
  });

  it("una cita puede ocupar varias líneas del mismo párrafo", () => {
    const t = "Texto “primera línea\nsegunda línea” fin.";
    expect(findQuoteRanges(t).map((r) => slice(t, r))).toEqual(["“primera línea\nsegunda línea”"]);
  });
});

describe("findBibliographyRange", () => {
  it("detecta el título en su propia línea y llega hasta el final", () => {
    const t = "Introducción\nTexto del trabajo.\n\nReferencias\nPérez, J. (2020). Libro. Editorial.";
    const r = findBibliographyRange(t)!;
    expect(slice(t, r)).toBe("Referencias\nPérez, J. (2020). Libro. Editorial.");
  });

  it("acepta variantes, numeración y mayúsculas; usa el último título (no el índice)", () => {
    const t = "ÍNDICE\n1. Introducción\n5. Bibliografía ........ 20\n\nCuerpo del trabajo.\n\n5. BIBLIOGRAFÍA\nAutor (2019). Obra.";
    expect(slice(t, findBibliographyRange(t)!)).toBe("5. BIBLIOGRAFÍA\nAutor (2019). Obra.");
    const u = "Texto.\nReferencias bibliográficas:\nA (2000).";
    expect(slice(u, findBibliographyRange(u)!)).toBe("Referencias bibliográficas:\nA (2000).");
  });

  it("termina antes de los anexos", () => {
    const t = "Texto.\nReferencias\nA (2000). Obra.\nAnexos\nEncuesta aplicada.";
    expect(slice(t, findBibliographyRange(t)!)).toBe("Referencias\nA (2000). Obra.\n");
  });

  it("no confunde la palabra dentro de una oración", () => {
    expect(findBibliographyRange("Según las referencias consultadas el resultado es claro.")).toBeNull();
  });
});

describe("applyExclusions", () => {
  const words = (s: string) => s.split(" ");
  const base = "uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince";

  it("sin exclusiones reproduce exactamente el resultado original", () => {
    const docs = [
      "La fotosíntesis es el proceso mediante el cual las plantas producen su alimento usando la luz del sol y el agua disponible en el suelo.",
      "Sabemos que la fotosíntesis es el proceso mediante el cual las plantas producen energía, algo distinto a lo que ocurre en animales y hongos del bosque.",
    ];
    const r = compareDocuments(docs, 5);
    if (!r.success) throw new Error(r.message);
    for (const d of r.documents) {
      const f = applyExclusions(docs[d.index], d.sources, NO_EXCLUSIONS);
      expect(f.rawMatchedWords).toBe(d.matchedWords);
      expect(f.matchedWords).toBe(d.matchedWords);
      expect(f.similarity).toBe(d.similarity);
      expect(f.words).toBe(d.words);
    }
  });

  it("excluye texto entre comillas sin cambiar el denominador", () => {
    const text = `“${base}” y luego texto propio distinto del resto`;
    const span = { start: 1, end: 1 + base.length, words: 15 };
    const f = applyExclusions(text, [{ spans: [span] }], { excludeQuotes: true, excludeBibliography: false, minWords: 0 });
    expect(f.words).toBe(22);
    expect(f.rawMatchedWords).toBe(15);
    expect(f.matchedWords).toBe(0);
    expect(f.excluded).toEqual({ quotes: 15, bibliography: 0, short: 0 });
    expect(f.rawSimilarity).toBe(68.2);
    expect(f.similarity).toBe(0);
    expect(f.segments.find((s) => s.type === "excluded")).toBeTruthy();
  });

  it("excluye la bibliografía", () => {
    const body = "Texto propio del estudiante sobre el tema.";
    const text = `${body}\nReferencias\n${base}`;
    const start = text.indexOf("uno");
    const f = applyExclusions(text, [{ spans: [{ start, end: text.length, words: 15 }] }], { excludeQuotes: false, excludeBibliography: true, minWords: 0 });
    expect(f.bibliographyFound).toBe(true);
    expect(f.excluded.bibliography).toBe(15);
    expect(f.matchedWords).toBe(0);
  });

  it("excluye coincidencias con menos de N palabras por fuente", () => {
    const text = base;
    const w = words(base);
    const end = (k: number) => w.slice(0, k).join(" ").length;
    // Fuente 0: tramo de 6 palabras; fuente 1: tramo de 12 palabras que empieza en la palabra 4
    const s0 = { start: 0, end: end(6), words: 6 };
    const s1 = { start: text.indexOf("cuatro"), end: text.length, words: 12 };
    const f = applyExclusions(text, [{ spans: [s0] }, { spans: [s1] }], { excludeQuotes: false, excludeBibliography: false, minWords: 8 });
    expect(f.sources.map((s) => s.matchedWords)).toEqual([0, 12]);
    expect(f.matchedWords).toBe(12);
    expect(f.excluded.short).toBe(3); // "uno dos tres" solo estaban en la fuente 0
  });

  it("atribuye cada palabra a la fuente con más coincidencias y arma tramos continuos", () => {
    const text = base;
    const s0 = { start: 0, end: text.indexOf(" seis"), words: 5 }; // uno..cinco
    const s1 = { start: text.indexOf("tres"), end: text.indexOf(" doce"), words: 9 }; // tres..once
    const f = applyExclusions(text, [{ spans: [s0] }, { spans: [s1] }], NO_EXCLUSIONS);
    const matches = f.segments.filter((s) => s.type === "match").map((s) => [text.slice(s.start, s.end), s.source]);
    expect(matches).toEqual([
      ["uno dos", 0],
      ["tres cuatro cinco seis siete ocho nueve diez once", 1],
    ]);
    expect(f.segments.map((s) => text.slice(s.start, s.end)).join("")).toBe(text);
  });
});

describe("sha256Hex", () => {
  it("coincide con el valor estándar", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(await sha256Hex(new TextEncoder().encode("abc").buffer as ArrayBuffer)).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
