/**
 * Extrae el texto de un PDF en el navegador con pdf.js.
 * La librería se carga solo cuando el usuario elige un PDF; el archivo no sale del equipo.
 */
import { pdfPagesToText, type PdfTextItem } from "@/lib/files/pdf-text";

const MAX_PAGES = 500;

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const task = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  let doc;
  try {
    doc = await task.promise;
  } catch (err) {
    if ((err as Error).name === "PasswordException") throw new Error("El PDF está protegido con contraseña. Quita la protección o pega el texto.");
    throw new Error("No se pudo leer el PDF. Verifica que el archivo no esté dañado o pega el texto.");
  }

  try {
    if (doc.numPages > MAX_PAGES) throw new Error(`El PDF tiene ${doc.numPages} páginas; el máximo es ${MAX_PAGES}.`);
    const pages: PdfTextItem[][] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.flatMap((it) => ("str" in it ? [{ str: it.str, hasEOL: it.hasEOL }] : [])));
      page.cleanup();
    }
    const text = pdfPagesToText(pages);
    if (!/\p{L}/u.test(text)) {
      throw new Error("El PDF no contiene texto seleccionable (parece escaneado como imagen). Conviértelo con OCR o pega el texto.");
    }
    return text;
  } finally {
    await task.destroy();
  }
}
