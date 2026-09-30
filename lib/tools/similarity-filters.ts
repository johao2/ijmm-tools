/**
 * Exclusiones del resultado de similitud (texto entre comillas, bibliografía y coincidencias cortas)
 * y asignación de cada fragmento coincidente a una fuente para resaltarlo por colores.
 *
 * Las exclusiones no cambian el denominador: el porcentaje sigue siendo
 * palabras coincidentes no excluidas ÷ palabras totales del documento. Así el total y el ajustado son comparables.
 */
import { tokenize, type MatchSpan, type Token } from "@/lib/tools/similarity";

export interface CharRange {
  start: number;
  end: number;
}

export interface ExclusionOptions {
  excludeQuotes: boolean;
  excludeBibliography: boolean;
  /** Coincidencias (tramos continuos por fuente) con menos palabras que este valor no cuentan; 0 = no excluir */
  minWords: number;
}

export const NO_EXCLUSIONS: ExclusionOptions = { excludeQuotes: false, excludeBibliography: false, minWords: 0 };

export const hasExclusions = (o: ExclusionOptions) => o.excludeQuotes || o.excludeBibliography || o.minWords > 0;

/**
 * Texto entre comillas dentro de un mismo párrafo: “…”, «…» o "…".
 * Una comilla sin cierre en su párrafo no excluye nada.
 */
export function findQuoteRanges(text: string): CharRange[] {
  const ranges: CharRange[] = [];
  const paragraph = /[^\n]*(?:\n(?![ \t]*\n)[^\n]*)*/g;
  let p: RegExpExecArray | null;
  while ((p = paragraph.exec(text))) {
    if (p[0].length === 0) {
      paragraph.lastIndex++;
      continue;
    }
    const re = /“[^“”]*”|«[^«»]*»|"[^"]*"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(p[0]))) ranges.push({ start: p.index + m.index, end: p.index + m.index + m[0].length });
  }
  return ranges;
}

const BIBLIOGRAPHY_HEADING =
  /^[ \t]*(?:(?:\d+(?:\.\d+)*|[IVXLC]+)[.)]?[ \t]+)?(?:referencias(?:[ \t]+bibliogr[aá]ficas)?|bibliograf[ií]a(?:[ \t]+(?:consultada|citada))?|obras[ \t]+citadas|fuentes[ \t]+(?:consultadas|bibliogr[aá]ficas)|lista[ \t]+de[ \t]+referencias|references|bibliography|works[ \t]+cited)[ \t]*:?[ \t]*$/gimu;
const AFTER_BIBLIOGRAPHY = /^[ \t]*(?:(?:\d+(?:\.\d+)*|[IVXLC]+)[.)]?[ \t]+)?(?:anexos?|ap[eé]ndices?|appendix|appendices)\b[^\n]*$/gimu;

/**
 * Sección de bibliografía: desde el último título “Referencias”, “Bibliografía” (o equivalente) escrito en su propia línea
 * hasta el final del texto o hasta un título de “Anexos” / “Apéndices”. Devuelve null si no hay título reconocible.
 */
export function findBibliographyRange(text: string): CharRange | null {
  let start = -1;
  let m: RegExpExecArray | null;
  BIBLIOGRAPHY_HEADING.lastIndex = 0;
  while ((m = BIBLIOGRAPHY_HEADING.exec(text))) start = m.index;
  if (start < 0) return null;
  AFTER_BIBLIOGRAPHY.lastIndex = start + 1;
  const after = AFTER_BIBLIOGRAPHY.exec(text);
  return { start, end: after ? after.index : text.length };
}

export interface SourceSpans {
  spans: MatchSpan[];
}

export type SegmentType = "plain" | "match" | "excluded";

export interface Segment {
  start: number;
  end: number;
  type: SegmentType;
  /** Índice de la fuente a la que se atribuye el tramo (solo para "match") */
  source?: number;
}

export interface FilteredSource {
  matchedWords: number;
  similarity: number;
}

export interface FilteredResult {
  words: number;
  /** Resultado sin exclusiones (debe coincidir con el cálculo original) */
  rawMatchedWords: number;
  rawSimilarity: number;
  /** Resultado con las exclusiones aplicadas */
  matchedWords: number;
  similarity: number;
  /** Palabras coincidentes que dejaron de contar, por motivo */
  excluded: { quotes: number; bibliography: number; short: number };
  bibliographyFound: boolean;
  quotesFound: number;
  sources: FilteredSource[];
  segments: Segment[];
}

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 1000) / 10 : 0);

/** Primer token cuyo inicio es ≥ pos (búsqueda binaria). */
function lowerBound(tokens: Token[], pos: number): number {
  let lo = 0;
  let hi = tokens.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tokens[mid].start < pos) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function maskFromSpans(tokens: Token[], spans: MatchSpan[]): Uint8Array {
  const mask = new Uint8Array(tokens.length);
  for (const s of spans) {
    for (let i = lowerBound(tokens, s.start); i < tokens.length && tokens[i].end <= s.end; i++) mask[i] = 1;
  }
  return mask;
}

function markRanges(tokens: Token[], ranges: CharRange[], mask: Uint8Array) {
  for (const r of ranges) {
    for (let i = lowerBound(tokens, r.start); i < tokens.length && tokens[i].start < r.end; i++) mask[i] = 1;
  }
}

/** Quita los tramos continuos con menos de `min` palabras. */
function dropShortRuns(mask: Uint8Array, min: number): Uint8Array {
  const out = mask.slice();
  if (min <= 0) return out;
  for (let i = 0; i < out.length; ) {
    if (!out[i]) {
      i++;
      continue;
    }
    const s = i;
    while (i < out.length && out[i]) i++;
    if (i - s < min) out.fill(0, s, i);
  }
  return out;
}

/**
 * Aplica las exclusiones a las coincidencias de cada fuente y arma los tramos para resaltar el texto.
 * Cada palabra coincidente se atribuye a la fuente con más palabras coincidentes que la contiene (como hacen los informes de similitud habituales).
 */
export function applyExclusions(text: string, sources: SourceSpans[], options: ExclusionOptions): FilteredResult {
  const tokens = tokenize(text);
  const n = tokens.length;
  const quoteRanges = options.excludeQuotes ? findQuoteRanges(text) : [];
  const bibliography = options.excludeBibliography ? findBibliographyRange(text) : null;
  const inQuote = new Uint8Array(n);
  const inBibliography = new Uint8Array(n);
  markRanges(tokens, quoteRanges, inQuote);
  if (bibliography) markRanges(tokens, [bibliography], inBibliography);

  const rawMasks = sources.map((s) => maskFromSpans(tokens, s.spans));
  const finalMasks = rawMasks.map((mask) => {
    const kept = mask.slice();
    for (let i = 0; i < n; i++) if (inQuote[i] || inBibliography[i]) kept[i] = 0;
    // Las coincidencias cortas se miden sobre lo que queda tras quitar comillas y bibliografía
    return dropShortRuns(kept, options.minWords);
  });

  const rawUnion = new Uint8Array(n);
  const finalUnion = new Uint8Array(n);
  rawMasks.forEach((m) => m.forEach((v, i) => v && (rawUnion[i] = 1)));
  finalMasks.forEach((m) => m.forEach((v, i) => v && (finalUnion[i] = 1)));

  const excluded = { quotes: 0, bibliography: 0, short: 0 };
  for (let i = 0; i < n; i++) {
    if (!rawUnion[i] || finalUnion[i]) continue;
    if (inBibliography[i]) excluded.bibliography++;
    else if (inQuote[i]) excluded.quotes++;
    else excluded.short++;
  }

  const perSource = finalMasks.map((m) => m.reduce((a, b) => a + b, 0));
  const order = perSource.map((w, i) => ({ w, i })).sort((a, b) => b.w - a.w || a.i - b.i).map((x) => x.i);
  const owner = new Int16Array(n).fill(-1);
  for (let t = 0; t < n; t++) {
    if (!finalUnion[t]) continue;
    for (const s of order) {
      if (finalMasks[s][t]) {
        owner[t] = s;
        break;
      }
    }
  }

  // Tramos: palabras seguidas con la misma clasificación se unen (incluidos los espacios entre ellas)
  const segments: Segment[] = [];
  let pos = 0;
  for (let t = 0; t < n; ) {
    const type: SegmentType = finalUnion[t] ? "match" : rawUnion[t] ? "excluded" : "plain";
    if (type === "plain") {
      t++;
      continue;
    }
    const src = owner[t];
    const s = t;
    while (t < n && (finalUnion[t] ? "match" : rawUnion[t] ? "excluded" : "plain") === type && owner[t] === src) t++;
    const start = tokens[s].start;
    const end = tokens[t - 1].end;
    if (start > pos) segments.push({ start: pos, end: start, type: "plain" });
    segments.push({ start, end, type, ...(type === "match" ? { source: src } : {}) });
    pos = end;
  }
  if (pos < text.length) segments.push({ start: pos, end: text.length, type: "plain" });

  const rawMatchedWords = rawUnion.reduce((a, b) => a + b, 0);
  const matchedWords = finalUnion.reduce((a, b) => a + b, 0);
  return {
    words: n,
    rawMatchedWords,
    rawSimilarity: pct(rawMatchedWords, n),
    matchedWords,
    similarity: pct(matchedWords, n),
    excluded,
    bibliographyFound: bibliography !== null,
    quotesFound: quoteRanges.length,
    sources: perSource.map((w) => ({ matchedWords: w, similarity: pct(w, n) })),
    segments,
  };
}

/** Colores de resaltado por fuente (fondos claros con buen contraste para texto oscuro, también al imprimir). */
export const SOURCE_COLORS = ["#fde68a", "#bae6fd", "#fecdd3", "#d9f99d", "#ddd6fe", "#fed7aa", "#99f6e4", "#fbcfe8", "#c7d2fe", "#e9d5ff", "#bbf7d0", "#fef08a"];

export const sourceColor = (index: number) => SOURCE_COLORS[index % SOURCE_COLORS.length];

/** SHA-256 en hexadecimal (Web Crypto; disponible en el navegador y en Node 20+). */
export async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
