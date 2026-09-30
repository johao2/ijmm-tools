import { describe, expect, it } from "vitest";
import { compareDocuments, highlightSegments, recommendations, tokenize } from "@/lib/tools/similarity";
import { documentXmlToText, extractDocxText, readZipEntry } from "@/lib/files/docx";

const base =
  "La fotosíntesis es el proceso mediante el cual las plantas transforman la energía de la luz solar en energía química que almacenan en forma de glucosa para crecer y desarrollarse adecuadamente";
const other =
  "El ciclo del agua describe el movimiento continuo del agua en la Tierra a través de la evaporación la condensación la precipitación y la infiltración en el suelo durante todo el año";

describe("similarity", () => {
  it("detecta un documento copiado al 100%, ignorando mayúsculas y tildes", () => {
    const copy = base.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const r = compareDocuments([base, copy]);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.pairs[0]).toMatchObject({ aInB: 100, bInA: 100 });
    expect(r.documents[0].spans).toHaveLength(1);
  });

  it("no marca coincidencias entre textos distintos", () => {
    const r = compareDocuments([base, other]);
    expect(r.success && r.pairs[0].aInB).toBe(0);
  });

  it("mide coincidencias parciales y las ubica en el texto", () => {
    const mixed = `${other} ${base}`;
    const r = compareDocuments([base, mixed]);
    expect(r.success).toBe(true);
    if (!r.success) return;
    const pair = r.pairs[0];
    expect(pair.aInB).toBe(100);
    expect(pair.bInA).toBeGreaterThan(40);
    expect(pair.bInA).toBeLessThan(60);
    const span = r.documents[1].spans[0];
    expect(mixed.slice(span.start, span.end)).toBe(base);
  });

  it("compara más de dos documentos y ordena por mayor similitud", () => {
    const r = compareDocuments([other, base, `${base} fin`]);
    expect(r.success && r.pairs[0]).toMatchObject({ a: 1, b: 2 });
    expect(r.success && r.documents[0].similarity).toBe(0);
  });

  it("valida número de documentos, longitud mínima y sensibilidad", () => {
    expect(compareDocuments([base]).success).toBe(false);
    expect(compareDocuments([base, "muy corto"]).success).toBe(false);
    expect(compareDocuments([base, other], 2).success).toBe(false);
  });

  it("entrega conteos exactos que respaldan cada porcentaje", () => {
    const mixed = `${other} ${base}`;
    const r = compareDocuments([base, mixed]);
    expect(r.success).toBe(true);
    if (!r.success) return;
    const baseWords = tokenize(base).length;
    const mixedWords = tokenize(mixed).length;
    const pair = r.pairs[0];
    expect(pair).toMatchObject({ aWords: baseWords, bWords: mixedWords, aMatchedWords: baseWords, bMatchedWords: baseWords });
    expect(pair.bInA).toBe(Math.round((baseWords / mixedWords) * 1000) / 10);
    expect(r.documents[1]).toMatchObject({ matchedWords: baseWords, longestMatchWords: baseWords });
    // Mismo resultado en cada ejecución (determinista)
    expect(compareDocuments([base, mixed])).toEqual(r);
  });

  it("genera recomendaciones solo a partir de los datos medidos", () => {
    const clean = compareDocuments([base, other]);
    if (!clean.success) throw new Error("fallo");
    const okRecs = recommendations(clean, ["Ensayo A", "Ensayo B"]);
    expect(okRecs[0]).toMatchObject({ level: "ok" });
    expect(okRecs.some((r) => r.text.includes("No existe un porcentaje"))).toBe(true);

    const copied = compareDocuments([base, `${other} ${base}`]);
    if (!copied.success) throw new Error("fallo");
    const recs = recommendations(copied, ["Ensayo A", "Ensayo B"], 20);
    const docA = recs.find((r) => r.text.startsWith("Ensayo A: 100%"));
    expect(docA?.level).toBe("warning");
    expect(recs.some((r) => r.text.includes("comillas"))).toBe(true);
    expect(recs.some((r) => r.text.includes("No existe un porcentaje"))).toBe(false);
  });

  it("divide el texto para resaltarlo", () => {
    const text = "uno dos tres";
    const tokens = tokenize(text);
    const segments = highlightSegments(text, [{ start: tokens[1].start, end: tokens[1].end, words: 1 }]);
    expect(segments).toEqual([
      { text: "uno ", match: false },
      { text: "dos", match: true },
      { text: " tres", match: false },
    ]);
  });
});

/** Crea un ZIP mínimo sin compresión (método 0) con un solo archivo. */
function storedZip(name: string, content: string): ArrayBuffer {
  const enc = new TextEncoder();
  const nameBytes = enc.encode(name);
  const data = enc.encode(content);
  const local = new Uint8Array(30 + nameBytes.length + data.length);
  const lv = new DataView(local.buffer);
  lv.setUint32(0, 0x04034b50, true);
  lv.setUint32(18, data.length, true);
  lv.setUint32(22, data.length, true);
  lv.setUint16(26, nameBytes.length, true);
  local.set(nameBytes, 30);
  local.set(data, 30 + nameBytes.length);
  const central = new Uint8Array(46 + nameBytes.length);
  const cv = new DataView(central.buffer);
  cv.setUint32(0, 0x02014b50, true);
  cv.setUint32(20, data.length, true);
  cv.setUint32(24, data.length, true);
  cv.setUint16(28, nameBytes.length, true);
  cv.setUint32(42, 0, true);
  central.set(nameBytes, 46);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, 1, true);
  ev.setUint16(10, 1, true);
  ev.setUint32(12, central.length, true);
  ev.setUint32(16, local.length, true);
  const out = new Uint8Array(local.length + central.length + end.length);
  out.set(local, 0);
  out.set(central, local.length);
  out.set(end, local.length + central.length);
  return out.buffer;
}

describe("docx", () => {
  const xml = '<w:document><w:body><w:p><w:r><w:t>Hola &amp; bienvenidos</w:t></w:r></w:p><w:p><w:r><w:t>Segundo</w:t><w:tab/><w:t>párrafo</w:t></w:r></w:p></w:body></w:document>';

  it("convierte el XML de Word en texto con párrafos", () => {
    expect(documentXmlToText(xml)).toBe("Hola & bienvenidos\n\nSegundo\tpárrafo");
  });

  it("lee word/document.xml de un ZIP", async () => {
    const zip = storedZip("word/document.xml", xml);
    expect(await extractDocxText(zip)).toBe("Hola & bienvenidos\n\nSegundo\tpárrafo");
    expect(await readZipEntry(zip, "otro.xml")).toBeNull();
  });

  it("rechaza archivos que no son ZIP", async () => {
    await expect(extractDocxText(new TextEncoder().encode("no soy un zip, solo texto plano sin estructura").buffer)).rejects.toThrow();
  });
});
