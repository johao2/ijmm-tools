/**
 * Utilidades puras para la búsqueda de fuentes: selección de frases a consultar,
 * extracción de texto de HTML y comparación exacta del documento contra una fuente.
 */
import { tokenize, type MatchSpan, type Token } from "@/lib/tools/similarity";

const SPANISH_STOPWORDS = new Set(
  "a al algo como con de del el ella en entre era es esa ese eso esta este esto fue ha hay la las le les lo los mas me mi muy más no nos o para pero por que qué se ser si sin sobre son su sus también te tu un una uno y ya the and of to in is it for on that with as are".split(" ")
);

export type QueryProvider = "brave" | "core" | "openalex";

/**
 * Consultas por servicio según la longitud del documento: más frases en trabajos largos para cubrir
 * todo el texto (aprox. 1 frase cada 300 palabras en internet), con topes por costo y tiempo.
 */
export function queryBudget(words: number): Record<QueryProvider, number> {
  const brave = Math.min(60, Math.max(20, Math.ceil(words / 300)));
  return {
    brave,
    core: Math.min(16, Math.max(8, Math.ceil(brave / 4))),
    openalex: Math.min(10, Math.max(6, Math.ceil(brave / 6))),
  };
}

/**
 * Elige frases del documento para buscar como coincidencia exacta.
 * Prioriza frases con más palabras de contenido (menos genéricas) y las reparte por todo el texto.
 * @param words longitud de cada frase en palabras
 * @param max número máximo de frases
 * @param exclude tramo que no se consulta (la bibliografía siempre coincide y gastaría consultas)
 */
export function selectQueryPhrases(text: string, max = 20, words = 9, exclude?: { start: number; end: number } | null): string[] {
  const tokens = tokenize(text);
  if (tokens.length < words) return [];
  // Ventanas sin solaparse que empiezan y terminan dentro de una misma oración
  const candidates: { start: number; score: number; phrase: string }[] = [];
  for (let i = 0; i + words <= tokens.length; i += words) {
    const slice = tokens.slice(i, i + words);
    const between = text.slice(slice[0].start, slice[words - 1].end);
    if (/[.!?;:\n]/.test(between)) continue;
    if (exclude && slice[0].start < exclude.end && slice[words - 1].end > exclude.start) continue;
    const content = slice.filter((t) => t.norm.length > 3 && !SPANISH_STOPWORDS.has(t.norm)).length;
    const numeric = slice.filter((t) => /^\d+$/.test(t.norm)).length;
    if (content < 4 || numeric > 2) continue;
    candidates.push({ start: i, score: content, phrase: between.replace(/\s+/g, " ") });
  }
  // Sin frases repetidas: cada consulta repetida gasta una búsqueda sin aportar resultados
  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    const key = c.phrase.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (unique.length <= max) return unique.map((c) => c.phrase);
  // Divide el documento en `max` tramos y toma la mejor frase de cada uno
  const picked: string[] = [];
  const bucketSize = tokens.length / max;
  for (let b = 0; b < max; b++) {
    const inBucket = unique.filter((c) => c.start >= b * bucketSize && c.start < (b + 1) * bucketSize);
    const best = inBucket.sort((x, y) => y.score - x.score)[0];
    if (best) picked.push(best.phrase);
  }
  return picked;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Convierte HTML en texto legible, sin scripts, estilos ni etiquetas. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|p|div|li|h[1-6]|tr|section|article)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === "#") {
        const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : " ";
      }
      return ENTITIES[code.toLowerCase()] ?? match;
    })
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

/** Reconstruye el resumen de OpenAlex a partir de su índice invertido. */
export function abstractFromInvertedIndex(index: Record<string, number[]> | null | undefined): string {
  if (!index) return "";
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) for (const p of positions) words[p] = word;
  return words.filter(Boolean).join(" ");
}

export interface SourceMatch {
  /** Palabras del documento cubiertas por coincidencias con esta fuente */
  matchedWords: number;
  /** Máscara de palabras del documento que coinciden (1 = coincide) */
  covered: Uint8Array;
  spans: MatchSpan[];
  /** Fragmentos de la fuente que coinciden (texto literal de la fuente) */
  sourceExcerpts: string[];
}

function spansFrom(covered: Uint8Array, tokens: Token[]): MatchSpan[] {
  const spans: MatchSpan[] = [];
  let i = 0;
  while (i < covered.length) {
    if (!covered[i]) {
      i++;
      continue;
    }
    const s = i;
    while (i < covered.length && covered[i]) i++;
    spans.push({ start: tokens[s].start, end: tokens[i - 1].end, words: i - s });
  }
  return spans;
}

/**
 * Compara el documento contra el texto de una fuente con secuencias de `ngram` palabras idénticas
 * (sin distinguir mayúsculas, tildes ni puntuación). Resultado exacto y determinista.
 */
/**
 * Elige qué páginas descargar (hay un límite por tiempo). Selección voraz: en cada paso toma la página que
 * aporta más frases del documento aún no cubiertas, para que cada parte del trabajo tenga su mejor fuente;
 * cuando ya no hay frases nuevas, sigue con las páginas encontradas por más frases.
 */
export function prioritizeForFetch(items: { key: string; phrases: Set<string> }[], limit: number): string[] {
  const covered = new Set<string>();
  const remaining = [...items];
  const picked: string[] = [];
  while (picked.length < limit && remaining.length) {
    let best = 0;
    let bestNew = -1;
    remaining.forEach((it, i) => {
      let fresh = 0;
      for (const p of it.phrases) if (!covered.has(p)) fresh++;
      if (fresh > bestNew || (fresh === bestNew && it.phrases.size > remaining[best].phrases.size)) {
        best = i;
        bestNew = fresh;
      }
    });
    const [chosen] = remaining.splice(best, 1);
    chosen.phrases.forEach((p) => covered.add(p));
    picked.push(chosen.key);
  }
  return picked;
}

/** Claves de n-gramas del documento; calcularlas una sola vez acelera la comparación con muchas fuentes. */
export function documentKeys(docTokens: Token[], ngram: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i + ngram <= docTokens.length; i++) keys.push(docTokens.slice(i, i + ngram).map((t) => t.norm).join(" "));
  return keys;
}

export function matchAgainstSource(docTokens: Token[], sourceText: string, ngram = 5, docKeys?: string[]): SourceMatch {
  const covered = new Uint8Array(docTokens.length);
  const sourceTokens = tokenize(sourceText);
  if (sourceTokens.length < ngram || docTokens.length < ngram) {
    return { matchedWords: 0, covered, spans: [], sourceExcerpts: [] };
  }
  const sourceKeys = new Map<string, number>();
  for (let i = 0; i + ngram <= sourceTokens.length; i++) {
    const key = sourceTokens.slice(i, i + ngram).map((t) => t.norm).join(" ");
    if (!sourceKeys.has(key)) sourceKeys.set(key, i);
  }
  const sourceCovered = new Uint8Array(sourceTokens.length);
  const keys = docKeys ?? documentKeys(docTokens, ngram);
  for (let i = 0; i < keys.length; i++) {
    const at = sourceKeys.get(keys[i]);
    if (at === undefined) continue;
    for (let k = 0; k < ngram; k++) {
      covered[i + k] = 1;
      sourceCovered[at + k] = 1;
    }
  }
  const matchedWords = covered.reduce((a, b) => a + b, 0);
  const sourceExcerpts = spansFrom(sourceCovered, sourceTokens).map((s) => sourceText.slice(s.start, s.end));
  return { matchedWords, covered, spans: spansFrom(covered, docTokens), sourceExcerpts };
}
