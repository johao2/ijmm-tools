import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const doc =
  "La fotosíntesis es el proceso mediante el cual las plantas transforman la energía de la luz solar en energía química que almacenan en forma de glucosa. " +
  "Este proceso ocurre en los cloroplastos y libera oxígeno a la atmósfera, lo que permite la vida en el planeta. " +
  "En los ecosistemas andinos del Ecuador las especies nativas presentan adaptaciones particulares frente a la radiación intensa y las bajas temperaturas nocturnas.";

const pageText = "Portal educativo. La fotosíntesis es el proceso mediante el cual las plantas transforman la energía de la luz solar en energía química que almacenan en forma de glucosa. Fin.";

vi.mock("@/lib/source-search/providers", () => ({
  configuredProviders: () => ["brave", "core"],
  PROVIDER_LABELS: { brave: "Internet (Brave Search)", core: "Repositorios académicos (CORE)", openalex: "Publicaciones académicas (OpenAlex)" },
  searchBrave: vi.fn(async () => [
    { provider: "brave", url: "https://ejemplo.edu/fotosintesis#top", title: "Fotosíntesis", text: "extracto breve", level: "snippet", fetchPage: true },
    { provider: "brave", url: "https://otra.org/nada", title: "Sin relación", text: "texto que no coincide con nada del documento analizado aquí", level: "snippet", fetchPage: true },
  ]),
  searchCore: vi.fn(async () => {
    throw new Error("HTTP 500");
  }),
  searchOpenAlex: vi.fn(async () => []),
  fetchPageText: vi.fn(async (url: string) => (url.startsWith("https://ejemplo.edu") ? pageText : null)),
}));

const { checkSources } = await import("@/lib/source-search/check");

describe("checkSources", () => {
  beforeEach(() => vi.clearAllMocks());

  it("compara cada fuente con su texto completo y reporta conteos exactos", async () => {
    const r = await checkSources(doc, 5);
    expect(r.providers).toEqual(["brave", "core"]);
    expect(r.phrasesSearched).toBeGreaterThan(0);

    // La fuente con la oración copiada: 26 palabras coinciden
    expect(r.sources).toHaveLength(1);
    const source = r.sources[0];
    expect(source).toMatchObject({ url: "https://ejemplo.edu/fotosintesis#top", level: "full", matchedWords: 26 });
    expect(source.similarity).toBe(Math.round((26 / r.words) * 1000) / 10);
    expect(r.matchedWords).toBe(26);
    expect(r.similarity).toBe(source.similarity);

    // La fuente sin coincidencias queda como sugerida, no verificada
    expect(r.unverified.map((u) => u.url)).toEqual(["https://otra.org/nada"]);

    // Las fallas de un servicio se informan, no se ocultan
    expect(r.errors.some((e) => e.includes("CORE"))).toBe(true);
  });

  it("es determinista", async () => {
    const { seconds: _a, ...a } = await checkSources(doc, 5);
    const { seconds: _b, ...b } = await checkSources(doc, 5);
    expect(a).toEqual(b);
  });

  it("informa las consultas por servicio y no consulta la bibliografía", async () => {
    const withBibliography = `${doc}

Referencias
Ministerio del Ambiente del Ecuador. Guía de especies nativas andinas y adaptaciones fisiológicas frente a la radiación solar intensa.`;
    const r = await checkSources(withBibliography, 5);
    expect(r.bibliographySkipped).toBe(true);
    expect(r.queries.brave).toBe(r.phrasesSearched);
    expect(r.queries.core).toBe(r.phrasesSearched);
    const { searchBrave } = await import("@/lib/source-search/providers");
    const asked = (searchBrave as unknown as { mock: { calls: string[][] } }).mock.calls.map((c) => c[0]);
    expect(asked.some((p) => /Ministerio|Guía de especies/.test(p))).toBe(false);
  });
});
