import { tokenize, type MatchSpan } from "@/lib/tools/similarity";
import { documentKeys, matchAgainstSource, prioritizeForFetch, queryBudget, selectQueryPhrases } from "@/lib/source-search/text";
import { findBibliographyRange } from "@/lib/tools/similarity-filters";
import {
  fetchPageText,
  PROVIDER_LABELS,
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
  /** Consultas realizadas por servicio */
  queries: Partial<Record<ProviderId, number>>;
  /** Páginas web descargadas y comparadas con su texto completo */
  pagesAnalyzed: number;
  /** La bibliografía se detectó y no se usó para consultar */
  bibliographySkipped: boolean;
  /** Segundos que tomó la revisión */
  seconds: number;
  providers: ProviderId[];
  errors: string[];
}

export const MAX_WORDS = 40_000;
/** Consultas simultáneas por servicio: cada servicio avanza en su propia cola, sin esperar a los demás */
const CONCURRENCY_PER_PROVIDER: Record<ProviderId, number> = { brave: 5, core: 4, openalex: 3 };
/** Páginas web que se descargan para comparar su texto completo (más en documentos largos) */
const pageFetchLimit = (braveQueries: number) => Math.min(40, 12 + Math.floor(braveQueries / 2));
/** Tiempo total de la revisión (el pase del proxy dura 3 minutos) */
const TIME_BUDGET_MS = 45_000;
/** No se inician nuevas consultas después de este tiempo */
const SEARCH_DEADLINE_MS = 25_000;
/** Tiempo mínimo restante para iniciar otra tanda de descargas (cada descarga tiene 10 s de límite) */
const FETCH_MIN_REMAINING_MS = 11_000;

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 1000) / 10 : 0);

/**
 * Ejecuta `fn` en tandas de `size`. Si se pasa `deadline` (marca de tiempo), no inicia tandas nuevas después de ella;
 * los elementos no procesados quedan como `undefined`.
 */
async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>, deadline = Infinity): Promise<(PromiseSettledResult<R> | undefined)[]> {
  const out: (PromiseSettledResult<R> | undefined)[] = new Array(items.length).fill(undefined);
  for (let i = 0; i < items.length; i += size) {
    if (Date.now() > deadline) break;
    const settled = await Promise.allSettled(items.slice(i, i + size).map(fn));
    settled.forEach((r, k) => {
      out[i + k] = r;
    });
  }
  return out;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    // Versión móvil y de escritorio de la misma página (es.m.wikipedia.org = es.wikipedia.org)
    u.hostname = u.hostname.replace(/(^|\.)m\./, "$1");
    // Parámetros de seguimiento o de resaltado que no cambian el contenido (evita fuentes duplicadas)
    for (const k of [...u.searchParams.keys()]) if (k === "s" || k.startsWith("utm_")) u.searchParams.delete(k);
    return u.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

/**
 * Busca el documento en internet y repositorios, y mide la coincidencia exacta con cada fuente encontrada.
 * Se ejecuta en el navegador: solo las frases de búsqueda y las direcciones a descargar pasan por el proxy del sitio.
 */
export async function checkSources(text: string, ngram: number, providers: ProviderId[]): Promise<SourceCheckResult> {
  const started = Date.now();
  const docTokens = tokenize(text);
  const budget = queryBudget(docTokens.length);
  // La bibliografía no se consulta: siempre coincide con internet y gastaría consultas
  const bibliography = findBibliographyRange(text);
  const phrases = selectQueryPhrases(text, Math.max(...providers.map((p) => budget[p]), 0), 9, bibliography);
  const errors: string[] = [];

  // 1. Búsqueda de frases exactas en cada servicio configurado
  const searchers: Record<ProviderId, (p: string) => Promise<Candidate[]>> = { brave: searchBrave, core: searchCore, openalex: searchOpenAlex };
  const jobs = providers.flatMap((provider) => {
    // Reparte las frases de cada servicio a lo largo de todo el documento
    const n = Math.min(budget[provider], phrases.length);
    const step = phrases.length / n;
    return Array.from({ length: n }, (_, i) => ({ phrase: phrases[Math.floor(i * step)], provider }));
  });
  const results: (PromiseSettledResult<Candidate[]> | undefined)[] = new Array(jobs.length);
  await Promise.all(
    providers.map(async (provider) => {
      const idx = jobs.flatMap((j, i) => (j.provider === provider ? [i] : []));
      const settled = await inBatches(idx, CONCURRENCY_PER_PROVIDER[provider], (i) => searchers[provider](jobs[i].phrase), started + SEARCH_DEADLINE_MS);
      settled.forEach((r, k) => {
        results[idx[k]] = r;
      });
    })
  );
  const failures = new Map<ProviderId, number>();
  const skipped = new Map<ProviderId, number>();
  const queries: Partial<Record<ProviderId, number>> = {};
  const candidates = new Map<string, Candidate>();
  /** Frases que llevaron a cada fuente: sirven para elegir qué páginas descargar */
  const foundBy = new Map<string, Set<string>>();
  results.forEach((r, i) => {
    const provider = jobs[i].provider;
    if (!r) {
      skipped.set(provider, (skipped.get(provider) ?? 0) + 1);
      return;
    }
    queries[provider] = (queries[provider] ?? 0) + 1;
    if (r.status === "rejected") {
      failures.set(provider, (failures.get(provider) ?? 0) + 1);
      return;
    }
    for (const c of r.value) {
      const key = normalizeUrl(c.url);
      if (!foundBy.has(key)) foundBy.set(key, new Set());
      foundBy.get(key)?.add(jobs[i].phrase);
      const existing = candidates.get(key);
      // Conserva el candidato con más texto disponible
      if (!existing || c.text.length > existing.text.length) candidates.set(key, c);
    }
  });
  for (const [provider, count] of failures) {
    errors.push(`${PROVIDER_LABELS[provider]}: ${count} de ${queries[provider]} consultas no respondieron (el servicio estuvo lento o saturado, incluso tras reintentar). Las demás fuentes se analizaron normalmente; puedes repetir la revisión más tarde.`);
  }
  for (const [provider, count] of skipped) {
    errors.push(`${PROVIDER_LABELS[provider]}: ${count} consultas no se realizaron porque se alcanzó el tiempo máximo de la revisión. Las demás fuentes se analizaron normalmente.`);
  }

  // 2. Descarga de páginas web para comparar contra su texto completo.
  // Primero la mejor fuente de cada parte del documento, luego las encontradas por más frases.
  const web = [...candidates.entries()].filter(([, c]) => c.fetchPage);
  const order = prioritizeForFetch(web.map(([key]) => ({ key, phrases: foundBy.get(key) ?? new Set<string>() })), pageFetchLimit(queries.brave ?? 0));
  const webCandidates = order.map((key) => candidates.get(key) as Candidate);
  const pages = await inBatches(webCandidates, 6, (c) => fetchPageText(c.url), started + TIME_BUDGET_MS - FETCH_MIN_REMAINING_MS);
  let pagesAnalyzed = 0;
  pages.forEach((p, i) => {
    if (p?.status === "fulfilled" && p.value && p.value.length > webCandidates[i].text.length) {
      webCandidates[i].text = p.value;
      webCandidates[i].level = "full";
      pagesAnalyzed++;
    }
  });
  const pagesNotFetched = pages.filter((p) => !p).length + Math.max(0, web.length - webCandidates.length);
  if (pagesNotFetched > 0) {
    errors.push(`${pagesNotFetched} página(s) web se compararon solo con el extracto del buscador (límite de descargas o de tiempo por revisión). Ábrelas desde su enlace para revisarlas completas.`);
  }
  const docKeys = documentKeys(docTokens, ngram);

  // 3. Comparación exacta con cada fuente
  const overall = new Uint8Array(docTokens.length);
  const sources: SourceReport[] = [];
  const unverified: UnverifiedSource[] = [];
  for (const c of candidates.values()) {
    const match = matchAgainstSource(docTokens, c.text, ngram, docKeys);
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
    queries,
    pagesAnalyzed,
    bibliographySkipped: bibliography !== null,
    seconds: Math.round((Date.now() - started) / 100) / 10,
    providers,
    errors,
  };
}
