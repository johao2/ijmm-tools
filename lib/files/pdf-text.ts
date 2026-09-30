/**
 * Arma texto plano a partir de los fragmentos que entrega pdf.js por página.
 * Lógica pura (sin pdf.js) para poder probarla.
 */

export interface PdfTextItem {
  str: string;
  hasEOL?: boolean;
}

/** Une los fragmentos de una página respetando los saltos de línea del PDF. */
export function pageItemsToText(items: PdfTextItem[]): string {
  let out = "";
  for (const item of items) {
    out += item.str;
    if (item.hasEOL) out += "\n";
  }
  return out;
}

/**
 * Une las páginas y limpia el texto:
 * - une palabras cortadas con guion al final de línea ("infor-\nmación" → "información"),
 * - convierte saltos de línea simples en espacios (el PDF corta líneas por ancho, no por párrafo),
 * - conserva los párrafos (líneas en blanco) y normaliza espacios.
 */
export function pdfPagesToText(pages: PdfTextItem[][]): string {
  return pages
    .map(pageItemsToText)
    .join("\n\n")
    .replace(/­/g, "")
    .replace(/(\p{L})-[ \t]*\n[ \t]*(\p{Ll})/gu, "$1$2")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\u0000")
    .replace(/\n/g, " ")
    .replace(/\u0000/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
