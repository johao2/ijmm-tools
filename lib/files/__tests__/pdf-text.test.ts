import { describe, expect, it } from "vitest";
import { pageItemsToText, pdfPagesToText } from "@/lib/files/pdf-text";

describe("pageItemsToText", () => {
  it("une fragmentos y respeta los fines de línea", () => {
    expect(pageItemsToText([{ str: "Hola" }, { str: " mundo", hasEOL: true }, { str: "fin" }])).toBe("Hola mundo\nfin");
  });

  it("página vacía", () => {
    expect(pageItemsToText([])).toBe("");
  });
});

describe("pdfPagesToText", () => {
  it("convierte saltos de línea simples en espacios y conserva párrafos", () => {
    const page = [
      { str: "La fotosíntesis es", hasEOL: true },
      { str: "un proceso.", hasEOL: true },
      { str: "", hasEOL: true },
      { str: "Segundo párrafo." },
    ];
    expect(pdfPagesToText([page])).toBe("La fotosíntesis es un proceso.\n\nSegundo párrafo.");
  });

  it("une palabras cortadas con guion al final de línea", () => {
    expect(pdfPagesToText([[{ str: "la infor-", hasEOL: true }, { str: "mación del estudio" }]])).toBe("la información del estudio");
  });

  it("no une guiones de palabras compuestas ni antes de mayúscula", () => {
    expect(pdfPagesToText([[{ str: "teórico-práctico y Costa-", hasEOL: true }, { str: "Rica" }]])).toBe("teórico-práctico y Costa- Rica");
  });

  it("elimina guiones suaves", () => {
    expect(pdfPagesToText([[{ str: "compu­tadora" }]])).toBe("computadora");
  });

  it("separa páginas como párrafos", () => {
    expect(pdfPagesToText([[{ str: "Página uno." }], [{ str: "Página dos." }]])).toBe("Página uno.\n\nPágina dos.");
  });

  it("normaliza espacios repetidos", () => {
    expect(pdfPagesToText([[{ str: "a    b " }, { str: "  c" }]])).toBe("a b c");
  });

  it("documento sin texto", () => {
    expect(pdfPagesToText([[], []])).toBe("");
  });
});
