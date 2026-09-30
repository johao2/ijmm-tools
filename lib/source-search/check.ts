import "server-only";
import { tokenize, type MatchSpan } from "@/lib/tools/similarity";
import { matchAgainstSource, selectQueryPhrases } from "@/lib/source-search/text";
import {
  configuredProviders,
  fetchPageText,
  searchBrave,
  searchCore,
  searchOpenAlex,
  type AnalysisLevel,
  type Candidate,
  type ProviderId,
} from "@/lib/source-search/providers";

export interface SourceReport {
  provider: ProviderId;
  url: string;
  title: string;
  year?: number;
  /** Texto con el que se comparó: página completa, resumen o solo el extracto del buscador */
  level: AnalysisLevel;
  /** Palabras del documento que coinciden con esta fuente (conteo exacto) */
  matchedWords: number;
  /** matchedWords ÷ palabras del documento, 1 decimal */
  similarity: number;
  spans: MatchSpan[];
  /** Fragmentos literales de la fuente que coinciden (máx. 5) */
  sourceExcerpts: string[];
}

export interface UnverifiedSource {
  provider: ProviderId;
  url: string;
  title: string;
  reason: string;
}

export interface SourceCheckResult {
  words: number;
  /** Palabras del documento que coinciden con al menos una fuente */
  matchedWords: number;
  similarity: number;
  ngram: number;
  spans: MatchSpan[];
  sources: SourceReport[];
  unverified: UnverifiedSource[];
  phrasesSearched: number;
  providers: ProviderId[];
  errors: string[];
}

export const MAX_WORDS = 15_000;
const MAX_PHRASES = 20;
const MAX_PAGE_FETCHES = 12;
const TIME_BUDGET_MS = 45_000;

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 1000) / 10 : 0);

async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const out: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.allSettled(items.slice(i, i + size).map(fn))));
  return out;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

/** Busca el documento en internet y repositorios, y mide la coincidencia exacta con cada fuente encontrada. */
export async function checkSources(text: string, ngram = 5): Promise<SourceCheckResult> {
  const started = Date.now();
  const providers = configuredProviders();
  const docTokens = tokenize(text);
  const phrases = selectQueryPhrases(text, MAX_PHRASES);
  const errors: string[] = [];

  // 1. Búsqueda de frases exactas en cada servicio configurado
  const searchers: Record<ProviderId, (p: string) => Promise<Candidate[]>> = { brave: searchBrave, core: searchCore, openalex: searchOpenAlex };
  const jobs = phrases.flatMap((phrase) => providers.map((provider) => ({ phrase, provider })));
  const results = await inBatches(jobs, 6, ({ phrase, provider }) => searchers[provider](phrase));
  const failures = new Map<ProviderId, number>();
  const candidates = new Map<string, Candidate>();
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      failures.set(jobs[i].provider, (failures.get(jobs[i].provider) ?? 0) + 1);
      return;
    }
    for (const c of r.value) {
      const key = normalizeUrl(c.url);
      const existing = candidates.get(key);
      // Conserva el candidato con más texto disponible
      if (!existing || c.text.length > existing.text.length) candidates.set(key, c);
    }
  });
  for (const [provider, count] of failures) errors.push(`${count} consulta(s) a ${provider} fallaron; los resultados de ese servicio pueden estar incompletos.`);

  // 2. Descarga de páginas web para comparar contra su texto completo
  const webCandidates = [...candidates.values()].filter((c) => c.fetchPage).slice(0, MAX_PAGE_FETCHES);
  const remaining = TIME_BUDGET_MS - (Date.now() - started);
  if (remaining > 5_000) {
    const pages = await inBatches(webCandidates, 4, (c) => fetchPageText(c.url));
    pages.forEach((p, i) => {
      if (p.status === "fulfilled" && p.value && p.value.length > webCandidates[i].text.length) {
        webCandidates[i].text = p.value;
        webCandidates[i].level = "full";
      }
    });
  }

  // 3. Comparación exacta con cada fuente
  const overall = new Uint8Array(docTokens.length);
  const sources: SourceReport[] = [];
  const unverified: UnverifiedSource[] = [];
  for (const c of candidates.values()) {
    const match = matchAgainstSource(docTokens, c.text, ngram);
    if (match.matchedWords === 0) {
      unverified.push({
        provider: c.provider,
        url: c.url,
        title: c.title,
        reason:
          c.level === "full"
            ? "El buscador la sugirió, pero su texto no contiene secuencias idénticas a tu documento."
            : "El buscador encontró la frase en esta fuente, pero su texto completo no está disponible para verificarla. Ábrela para revisarla.",
      });
      continue;
    }
    match.covered.forEach((v, i) => {
      if (v) overall[i] = 1;
    });
    sources.push({
      provider: c.provider,
      url: c.url,
      title: c.title || c.url,
      year: c.year,
      level: c.level,
      matchedWords: match.matchedWords,
      similarity: pct(match.matchedWords, docTokens.length),
      spans: match.spans,
      sourceExcerpts: match.sourceExcerpts.slice(0, 5),
    });
  }
  sources.sort((a, b) => b.matchedWords - a.matchedWords);

  const matchedWords = overall.reduce((a, b) => a + b, 0);
  const spans: MatchSpan[] = [];
  for (let i = 0; i < overall.length; ) {
    if (!overall[i]) {
      i++;
      continue;
    }
    const s = i;
    while (i < overall.length && overall[i]) i++;
    spans.push({ start: docTokens[s].start, end: docTokens[i - 1].end, words: i - s });
  }

  return {
    words: docTokens.length,
    matchedWords,
    similarity: pct(matchedWords, docTokens.length),
    ngram,
    spans,
    sources,
    unverified: unverified.slice(0, 15),
    phrasesSearched: phrases.length,
    providers,
    errors,
  };
}
