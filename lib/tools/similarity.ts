/**
 * Detector de similitud entre documentos por secuencias de palabras compartidas (n-gramas).
 * Funciona 100 % en el navegador: los textos no salen del equipo del usuario.
 */

export interface Token {
  /** Forma normalizada (minúsculas, sin tildes) */
  norm: string;
  start: number;
  end: number;
}

export interface MatchSpan {
  /** Posiciones de carácter en el texto original */
  start: number;
  end: number;
  words: number;
}

export interface PairResult {
  a: number;
  b: number;
  /** % de las palabras de A que aparecen en secuencias compartidas con B (1 decimal) */
  aInB: number;
  /** % de las palabras de B que aparecen en secuencias compartidas con A (1 decimal) */
  bInA: number;
  /** Conteos exactos que respaldan los porcentajes */
  aMatchedWords: number;
  bMatchedWords: number;
  aWords: number;
  bWords: number;
  /** Secuencias distintas de n palabras presentes en ambos documentos */
  sharedSequences: number;
}

export interface DocumentReport {
  index: number;
  words: number;
  /** Palabras del documento que forman parte de alguna coincidencia */
  matchedWords: number;
  /** % del documento que coincide con al menos otro documento (matchedWords ÷ words, 1 decimal) */
  similarity: number;
  /** Fragmento coincidente más largo, en palabras */
  longestMatchWords: number;
  spans: MatchSpan[];
}

export type SimilarityResult =
  | { success: true; documents: DocumentReport[]; pairs: PairResult[]; ngram: number }
  | { success: false; message: string };

export const MIN_WORDS = 20;

export function normalizeWord(word: string): string {
  return word.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /[\p{L}\p{N}]+/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) tokens.push({ norm: normalizeWord(m[0]), start: m.index, end: m.index + m[0].length });
  return tokens;
}

function shingleKeys(tokens: Token[], n: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) keys.push(tokens.slice(i, i + n).map((t) => t.norm).join(" "));
  return keys;
}

/** Marca las palabras de `tokens` cubiertas por algún n-grama presente en `other`. */
function coveredWords(keys: string[], other: Set<string>, n: number, wordCount: number): Uint8Array {
  const covered = new Uint8Array(wordCount);
  keys.forEach((key, i) => {
    if (other.has(key)) for (let k = i; k < i + n; k++) covered[k] = 1;
  });
  return covered;
}

function spansFrom(covered: Uint8Array, tokens: Token[]): MatchSpan[] {
  const spans: MatchSpan[] = [];
  let i = 0;
  while (i < covered.length) {
    if (!covered[i]) { i++; continue; }
    const startIdx = i;
    while (i < covered.length && covered[i]) i++;
    spans.push({ start: tokens[startIdx].start, end: tokens[i - 1].end, words: i - startIdx });
  }
  return spans;
}

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 1000) / 10 : 0);
const sum = (arr: Uint8Array) => arr.reduce((a, b) => a + b, 0);

/**
 * Compara todos los documentos entre sí.
 * @param ngram longitud de la secuencia de palabras que cuenta como coincidencia (3 a 10)
 */
export function compareDocuments(texts: string[], ngram = 5): SimilarityResult {
  if (texts.length < 2) return { success: false, message: "Agrega al menos dos documentos para comparar." };
  if (!Number.isInteger(ngram) || ngram < 3 || ngram > 10) return { success: false, message: "La sensibilidad debe estar entre 3 y 10 palabras." };
  const tokenLists = texts.map(tokenize);
  const short = tokenLists.findIndex((t) => t.length < MIN_WORDS);
  if (short >= 0) return { success: false, message: `El documento ${short + 1} tiene menos de ${MIN_WORDS} palabras.` };

  const keyLists = tokenLists.map((t) => shingleKeys(t, ngram));
  const keySets = keyLists.map((k) => new Set(k));
  const overall = tokenLists.map((t) => new Uint8Array(t.length));
  const pairs: PairResult[] = [];

  for (let a = 0; a < texts.length; a++) {
    for (let b = a + 1; b < texts.length; b++) {
      const coveredA = coveredWords(keyLists[a], keySets[b], ngram, tokenLists[a].length);
      const coveredB = coveredWords(keyLists[b], keySets[a], ngram, tokenLists[b].length);
      coveredA.forEach((v, i) => { if (v) overall[a][i] = 1; });
      coveredB.forEach((v, i) => { if (v) overall[b][i] = 1; });
      let shared = 0;
      for (const key of keySets[a]) if (keySets[b].has(key)) shared++;
      const aMatched = sum(coveredA);
      const bMatched = sum(coveredB);
      pairs.push({
        a,
        b,
        aInB: pct(aMatched, tokenLists[a].length),
        bInA: pct(bMatched, tokenLists[b].length),
        aMatchedWords: aMatched,
        bMatchedWords: bMatched,
        aWords: tokenLists[a].length,
        bWords: tokenLists[b].length,
        sharedSequences: shared,
      });
    }
  }

  return {
    success: true,
    ngram,
    pairs: pairs.sort((x, y) => Math.max(y.aInB, y.bInA) - Math.max(x.aInB, x.bInA)),
    documents: tokenLists.map((tokens, index) => {
      const spans = spansFrom(overall[index], tokens);
      const matchedWords = sum(overall[index]);
      return {
        index,
        words: tokens.length,
        matchedWords,
        similarity: pct(matchedWords, tokens.length),
        longestMatchWords: spans.reduce((max, span) => Math.max(max, span.words), 0),
        spans,
      };
    }),
  };
}

/** Divide el texto en tramos normales y coincidentes para resaltarlo en pantalla. */
export function highlightSegments(text: string, spans: MatchSpan[]): { text: string; match: boolean }[] {
  const out: { text: string; match: boolean }[] = [];
  let pos = 0;
  for (const span of spans) {
    if (span.start > pos) out.push({ text: text.slice(pos, span.start), match: false });
    out.push({ text: text.slice(span.start, span.end), match: true });
    pos = span.end;
  }
  if (pos < text.length) out.push({ text: text.slice(pos), match: false });
  return out;
}

export interface Recommendation {
  level: "ok" | "info" | "warning";
  text: string;
}

/**
 * Recomendaciones basadas únicamente en los datos medidos.
 * No aplica umbrales propios: si se indica el límite de la institución, compara contra ese valor.
 * @param names nombres de los documentos para los mensajes
 * @param institutionLimit porcentaje máximo permitido por la institución (opcional)
 */
export function recommendations(
  result: Extract<SimilarityResult, { success: true }>,
  names: string[],
  institutionLimit?: number
): Recommendation[] {
  const out: Recommendation[] = [];
  const name = (i: number) => names[i] || `Documento ${i + 1}`;
  const withMatches = result.documents.filter((d) => d.matchedWords > 0);

  if (withMatches.length === 0) {
    out.push({
      level: "ok",
      text: `No se encontraron secuencias de ${result.ngram} o más palabras iguales entre los documentos comparados.`,
    });
  }

  for (const doc of result.documents) {
    if (institutionLimit !== undefined && Number.isFinite(institutionLimit)) {
      const over = doc.similarity > institutionLimit;
      out.push({
        level: over ? "warning" : "ok",
        text: `${name(doc.index)}: ${doc.similarity}% de coincidencia (${doc.matchedWords} de ${doc.words} palabras), ${over ? "por encima" : "dentro"} del límite de ${institutionLimit}% indicado.`,
      });
    }
    if (doc.matchedWords > 0) {
      out.push({
        level: "info",
        text: `${name(doc.index)} tiene ${doc.spans.length} fragmento(s) coincidente(s); el más largo mide ${doc.longestMatchWords} palabras. Revisa cada fragmento resaltado.`,
      });
    }
  }

  const topPair = result.pairs[0];
  if (topPair && Math.max(topPair.aInB, topPair.bInA) > 0) {
    out.push({
      level: "info",
      text: `El par con mayor coincidencia es ${name(topPair.a)} y ${name(topPair.b)}: ${topPair.aInB}% de ${name(topPair.a)} (${topPair.aMatchedWords} de ${topPair.aWords} palabras) y ${topPair.bInA}% de ${name(topPair.b)} (${topPair.bMatchedWords} de ${topPair.bWords} palabras).`,
    });
  }

  if (withMatches.length > 0) {
    out.push({
      level: "info",
      text: "Si un fragmento es una cita textual, ponlo entre comillas e indica el autor, el año y la página (APA 7). Si es una idea de otra fuente expresada con tus palabras, cita igualmente al autor y el año.",
    });
    out.push({
      level: "info",
      text: "Si el fragmento no proviene de una fuente citada, redáctalo de nuevo con tu propio análisis y cita cualquier idea que no sea tuya.",
    });
    out.push({
      level: "info",
      text: "Las coincidencias en definiciones técnicas, títulos, nombres propios o bibliografía pueden ser legítimas; evalúa cada fragmento en su contexto antes de concluir que hay plagio.",
    });
  }

  if (institutionLimit === undefined) {
    out.push({
      level: "info",
      text: "No existe un porcentaje de similitud permitido universal: cada universidad o docente define el suyo. Ingresa el límite de tu institución para compararlo con estos resultados.",
    });
  }

  out.push({
    level: "info",
    text: "Este análisis compara solo los documentos cargados entre sí. No revisa internet, revistas científicas ni repositorios de otras universidades.",
  });
  return out;
}
