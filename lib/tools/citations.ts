/**
 * Referencias en formato APA 7.ª edición (versión en español).
 * El resultado se devuelve en segmentos para poder mostrar cursivas y copiar texto plano.
 */

export type SourceType = "book" | "article" | "web" | "thesis";

export interface Author {
  /** Nombres de pila (se convierten en iniciales) */
  given?: string;
  /** Apellidos */
  family?: string;
  /** Autor corporativo (institución); si se indica, ignora given/family */
  organization?: string;
}

export interface CitationInput {
  type: SourceType;
  authors: Author[];
  year?: string;
  /** Solo para páginas web: día y mes de publicación */
  month?: number;
  day?: number;
  title: string;
  // Libro
  edition?: string;
  publisher?: string;
  // Artículo
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  // Web
  siteName?: string;
  // Tesis
  degree?: "grado" | "maestría" | "doctoral";
  institution?: string;
  repository?: string;
  // Comunes
  doi?: string;
  url?: string;
  /** Usar "&" en lugar de "y" entre los dos últimos autores */
  ampersand?: boolean;
}

export interface Segment {
  text: string;
  italic?: boolean;
}

export type CitationResult =
  | { success: true; reference: Segment[]; plain: string; inText: { parenthetical: string; narrative: string } }
  | { success: false; message: string };

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const clean = (s?: string) => (s ?? "").trim().replace(/\s+/g, " ");
const endWithPeriod = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);

/** "Juan Andrés" → "J. A."; "Jean-Paul" → "J.-P." */
export function initials(given: string): string {
  return clean(given)
    .split(" ")
    .filter(Boolean)
    .map((name) => name.split("-").map((part) => `${part.charAt(0).toUpperCase()}.`).join("-"))
    .join(" ");
}

function formatAuthor(author: Author): string {
  if (clean(author.organization)) return clean(author.organization);
  const family = clean(author.family);
  const given = initials(author.given ?? "");
  return given ? `${family}, ${given}` : family;
}

function validAuthors(authors: Author[]): Author[] {
  return authors.filter((a) => clean(a.organization) || clean(a.family));
}

/** Lista de autores según APA 7 (hasta 20; con 21 o más: 19 primeros, "…" y el último). */
export function formatAuthors(authors: Author[], ampersand = false): string {
  const list = validAuthors(authors).map(formatAuthor);
  const joiner = ampersand ? "&" : "y";
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]}, ${joiner} ${list[1]}`;
  if (list.length <= 20) return `${list.slice(0, -1).join(", ")}, ${joiner} ${list[list.length - 1]}`;
  return `${list.slice(0, 19).join(", ")}, … ${list[list.length - 1]}`;
}

function lastName(author: Author): string {
  return clean(author.organization) || clean(author.family);
}

export function normalizeDoi(doi?: string): string {
  const d = clean(doi);
  if (!d) return "";
  if (/^https?:\/\//i.test(d)) return d;
  return `https://doi.org/${d.replace(/^doi:\s*/i, "")}`;
}

function dateText(input: CitationInput): string {
  const year = clean(input.year);
  if (!year) return "s. f.";
  if (input.type === "web" && input.month && input.month >= 1 && input.month <= 12) {
    return input.day ? `${year}, ${input.day} de ${MONTHS[input.month - 1]}` : `${year}, ${MONTHS[input.month - 1]}`;
  }
  return year;
}

export function formatCitation(input: CitationInput): CitationResult {
  // APA 7: en tipo oración, la primera palabra del subtítulo (tras dos puntos) va con mayúscula
  const title = clean(input.title).replace(/(:\s+)(\p{Ll})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
  if (!title) return { success: false, message: "Escribe el título de la fuente." };
  if (input.year && !/^\d{4}[a-z]?$/.test(clean(input.year))) return { success: false, message: "El año debe tener 4 dígitos (ej. 2024)." };
  if (input.type === "article" && !clean(input.journal)) return { success: false, message: "Escribe el nombre de la revista." };
  if (input.type === "thesis" && !clean(input.institution)) return { success: false, message: "Escribe la universidad o institución de la tesis." };

  const authorText = formatAuthors(input.authors, input.ampersand);
  const date = dateText(input);
  const link = normalizeDoi(input.doi) || clean(input.url);
  const seg: Segment[] = [];

  // Sin autor, el título ocupa la posición del autor
  if (authorText) seg.push({ text: `${endWithPeriod(authorText)} (${date}). ` });

  const pushTitle = (italic: boolean, suffix: string) => {
    seg.push({ text: title, italic });
    seg.push({ text: suffix });
  };

  switch (input.type) {
    case "book": {
      const edition = clean(input.edition);
      pushTitle(true, edition ? ` (${edition} ed.). ` : ". ");
      if (!authorText) seg.push({ text: `(${date}). ` });
      if (clean(input.publisher)) seg.push({ text: `${endWithPeriod(clean(input.publisher))} ` });
      break;
    }
    case "article": {
      pushTitle(false, ". ");
      if (!authorText) seg.push({ text: `(${date}). ` });
      seg.push({ text: clean(input.journal), italic: true });
      if (clean(input.volume)) {
        seg.push({ text: ", " });
        seg.push({ text: clean(input.volume), italic: true });
      }
      if (clean(input.issue)) seg.push({ text: `(${clean(input.issue)})` });
      if (clean(input.pages)) seg.push({ text: `, ${clean(input.pages).replace(/\s*-\s*/, "–")}` });
      seg.push({ text: ". " });
      break;
    }
    case "web": {
      pushTitle(true, ". ");
      if (!authorText) seg.push({ text: `(${date}). ` });
      const site = clean(input.siteName);
      // Si el sitio coincide con el autor, APA indica omitirlo
      if (site && site.toLowerCase() !== authorText.toLowerCase()) seg.push({ text: `${endWithPeriod(site)} ` });
      break;
    }
    case "thesis": {
      const degreeLabel = input.degree === "doctoral" ? "Tesis doctoral" : input.degree === "maestría" ? "Tesis de maestría" : "Tesis de grado";
      pushTitle(true, ` [${degreeLabel}, ${clean(input.institution)}]. `);
      if (!authorText) seg.push({ text: `(${date}). ` });
      if (clean(input.repository)) seg.push({ text: `${endWithPeriod(clean(input.repository))} ` });
      break;
    }
  }
  if (link) seg.push({ text: link });

  const merged = seg.filter((s) => s.text).reduce<Segment[]>((acc, s) => {
    const last = acc[acc.length - 1];
    if (last && !!last.italic === !!s.italic) last.text += s.text;
    else acc.push({ ...s });
    return acc;
  }, []);
  const lastSeg = merged[merged.length - 1];
  if (lastSeg) lastSeg.text = lastSeg.text.trimEnd();

  // Cita en el texto
  const valid = validAuthors(input.authors);
  const joiner = input.ampersand ? "&" : "y";
  const year = clean(input.year) || "s. f.";
  // En la cita narrativa APA usa siempre "y", aunque la referencia use "&"
  const who = (between: string) => {
    if (valid.length === 0) return input.type === "article" ? `"${title}"` : title;
    if (valid.length === 1) return lastName(valid[0]);
    if (valid.length === 2) return `${lastName(valid[0])} ${between} ${lastName(valid[1])}`;
    return `${lastName(valid[0])} et al.`;
  };

  return {
    success: true,
    reference: merged,
    plain: merged.map((s) => s.text).join(""),
    inText: {
      parenthetical: `(${who(joiner)}, ${year})`,
      narrative: `${who("y")} (${year})`,
    },
  };
}
