/**
 * Estadísticas de un texto: palabras, caracteres, oraciones, párrafos y tiempos estimados.
 */

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  /** Minutos de lectura silenciosa (≈ 200 palabras por minuto) */
  readingMinutes: number;
  /** Minutos para exponerlo en voz alta (≈ 130 palabras por minuto) */
  speakingMinutes: number;
  /** Páginas aproximadas a doble espacio (≈ 275 palabras por página, formato APA) */
  pagesDoubleSpaced: number;
  /** Páginas aproximadas a espacio simple (≈ 550 palabras por página) */
  pagesSingleSpaced: number;
  averageWordsPerSentence: number;
  topWords: { word: string; count: number }[];
}

export const READING_WPM = 200;
export const SPEAKING_WPM = 130;

const STOPWORDS = new Set(
  "a al algo algunas algunos ante antes como con contra cual cuando de del desde donde durante e el ella ellas ellos en entre era es esa esas ese eso esos esta estas este esto estos fue fueron ha han hasta hay la las le les lo los mas me mi mis mucho muy más ni no nos o os otra otro para pero poco por porque que qué se sea ser si sin sobre son su sus también tan te tiene tienen todo todos tu tus un una uno unos y ya yo the and of to in is it for on that with as are this be".split(" ")
);

const round1 = (n: number) => Math.round(n * 10) / 10;

export function wordList(text: string): string[] {
  return text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
}

export function analyzeText(text: string, topN = 10): TextStats {
  const words = wordList(text);
  const trimmed = text.trim();
  const sentences = trimmed ? (trimmed.match(/[^.!?¡¿…]*[\p{L}\p{N}][^.!?…]*(?:[.!?…]+|$)/gu) ?? []).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n|\r\n\s*\r\n/).filter((p) => p.trim()).length : 0;

  const counts = new Map<string, number>();
  for (const word of words) {
    const w = word.toLowerCase();
    if (w.length < 3 || STOPWORDS.has(w) || /^\d+$/.test(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const topWords = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));

  return {
    words: words.length,
    characters: [...text].length,
    charactersNoSpaces: [...text.replace(/\s/g, "")].length,
    sentences,
    paragraphs,
    readingMinutes: round1(words.length / READING_WPM),
    speakingMinutes: round1(words.length / SPEAKING_WPM),
    pagesDoubleSpaced: round1(words.length / 275),
    pagesSingleSpaced: round1(words.length / 550),
    averageWordsPerSentence: sentences ? round1(words.length / sentences) : 0,
    topWords,
  };
}

/** Texto legible para una duración en minutos: "45 s", "3 min", "1 h 5 min". */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0 s";
  const totalSeconds = Math.round(minutes * 60);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}
