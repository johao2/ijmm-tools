/**
 * Extrae el texto de un archivo .docx en el navegador, sin dependencias externas.
 * Un .docx es un ZIP; se lee word/document.xml y se descomprime con DecompressionStream.
 */

const decoder = new TextDecoder("utf-8");

/** Convierte el XML de word/document.xml en texto plano con párrafos. */
export function documentXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:(br|cr)\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Busca un archivo dentro de un ZIP usando el directorio central y devuelve su contenido. */
export async function readZipEntry(buffer: ArrayBuffer, name: string): Promise<Uint8Array | null> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  // Fin del directorio central (firma 0x06054b50), buscado desde el final
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return null;
  const entries = view.getUint16(eocd + 10, true);
  let ptr = view.getUint32(eocd + 16, true);
  for (let e = 0; e < entries; e++) {
    if (view.getUint32(ptr, true) !== 0x02014b50) return null;
    const method = view.getUint16(ptr + 10, true);
    const compressedSize = view.getUint32(ptr + 20, true);
    const nameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localOffset = view.getUint32(ptr + 42, true);
    const entryName = decoder.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
    if (entryName === name) {
      const localNameLen = view.getUint16(localOffset + 26, true);
      const localExtraLen = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + localNameLen + localExtraLen;
      const data = bytes.subarray(start, start + compressedSize);
      if (method === 0) return data;
      if (method === 8) return inflateRaw(data);
      return null;
    }
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const xml = await readZipEntry(buffer, "word/document.xml");
  if (!xml) throw new Error("No se pudo leer el documento. Verifica que sea un archivo .docx válido.");
  return documentXmlToText(decoder.decode(xml));
}

/** Lee un archivo .txt, .docx o .pdf elegido por el usuario. */
export async function readTextFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) return extractDocxText(await file.arrayBuffer());
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractPdfText } = await import("@/lib/files/pdf");
    return extractPdfText(await file.arrayBuffer());
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) return file.text();
  throw new Error("Formato no compatible. Usa archivos .docx, .pdf o .txt, o pega el texto.");
}
