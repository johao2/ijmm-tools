"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileDown } from "lucide-react";
import HighlightedText, { SourceBadge } from "@/components/tools/similarity/HighlightedText";
import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics/events";
import { hasExclusions, sha256Hex, type ExclusionOptions, type FilteredResult } from "@/lib/tools/similarity-filters";

export interface ReportSource {
  title: string;
  url?: string;
  detail: string;
}

export interface ReportData {
  mode: string;
  documentName: string;
  text: string;
  /** Hash del archivo original si el texto viene de un archivo sin cambios */
  file?: { name: string; hash: string };
  ngram: number;
  options: ExclusionOptions;
  filtered: FilteredResult;
  sources: ReportSource[];
  institutionLimit?: number;
  notes: string[];
}

interface Fingerprint {
  value: string;
  of: string;
}

const MIN_WORDS_TEXT = (n: number) => (n > 0 ? `coincidencias de menos de ${n} palabras` : "");

/**
 * Botón que genera el informe y abre el diálogo de impresión del navegador (“Guardar como PDF”).
 * El informe se monta fuera de la página (portal en <body>) y solo es visible al imprimir.
 */
export default function SimilarityReport({ data, toolId }: { data: ReportData; toolId: string }) {
  const [printing, setPrinting] = useState<{ fingerprint: Fingerprint; date: string } | null>(null);

  const start = async () => {
    const fingerprint = data.file ? { value: data.file.hash, of: `archivo “${data.file.name}”` } : { value: await sha256Hex(data.text), of: "texto analizado (UTF-8)" };
    setPrinting({ fingerprint, date: new Date().toLocaleString("es-EC", { dateStyle: "long", timeStyle: "short" }) });
    trackEvent("result_download", { toolId, mode: "pdf" });
  };

  useEffect(() => {
    if (!printing) return;
    const previous = document.title;
    document.title = `Informe de similitud - ${data.documentName}`;
    const done = () => {
      document.title = previous;
      setPrinting(null);
    };
    window.addEventListener("afterprint", done, { once: true });
    const t = window.setTimeout(() => window.print(), 50);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", done);
      document.title = previous;
    };
  }, [printing, data.documentName]);

  const f = data.filtered;
  const exclusions = [data.options.excludeQuotes ? "texto entre comillas" : "", data.options.excludeBibliography ? "bibliografía" : "", MIN_WORDS_TEXT(data.options.minWords)].filter(Boolean);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={start}>
        <FileDown className="h-4 w-4" aria-hidden="true" /> Descargar informe (PDF)
      </Button>
      {printing &&
        createPortal(
          <div id="print-report" className="bg-white text-[13px] leading-relaxed text-slate-900">
            <header className="mb-4 border-b-2 border-slate-900 pb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">IJMM Tools · tools.ijmmsystem.com</p>
              <h1 className="text-2xl font-extrabold">Informe de similitud</h1>
              <p className="text-sm">{data.mode}</p>
            </header>

            <table className="mb-4 w-full text-left text-xs">
              <tbody className="[&_td]:py-0.5 [&_th]:w-56 [&_th]:py-0.5 [&_th]:pr-3 [&_th]:font-semibold [&_th]:align-top">
                <tr><th>Documento</th><td>{data.documentName}</td></tr>
                <tr><th>Fecha del informe</th><td>{printing.date}</td></tr>
                <tr><th>Palabras del documento</th><td>{f.words}</td></tr>
                <tr><th>Sensibilidad</th><td>{data.ngram} palabras consecutivas idénticas</td></tr>
                <tr><th>Exclusiones aplicadas</th><td>{exclusions.length ? exclusions.join(", ") : "Ninguna"}</td></tr>
                {data.institutionLimit !== undefined && <tr><th>Límite de la institución</th><td>{data.institutionLimit}%</td></tr>}
                <tr><th>Huella digital SHA-256</th><td className="break-all font-mono text-[10px]">{printing.fingerprint.value}<br /><span className="font-sans">del {printing.fingerprint.of}</span></td></tr>
              </tbody>
            </table>

            <section className="mb-4 flex gap-6 rounded border border-slate-300 p-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600">{hasExclusions(data.options) ? "Similitud con exclusiones" : "Similitud"}</p>
                <p className="text-3xl font-extrabold">{f.similarity}%</p>
                <p className="text-xs">{f.matchedWords} de {f.words} palabras</p>
              </div>
              {hasExclusions(data.options) && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Similitud total (sin exclusiones)</p>
                  <p className="text-3xl font-extrabold text-slate-500">{f.rawSimilarity}%</p>
                  <p className="text-xs">
                    {f.rawMatchedWords} de {f.words} palabras · excluidas: {f.excluded.quotes} entre comillas, {f.excluded.bibliography} de bibliografía, {f.excluded.short} en coincidencias cortas
                  </p>
                </div>
              )}
              {data.institutionLimit !== undefined && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Frente al límite</p>
                  <p className="text-lg font-bold">{f.similarity > data.institutionLimit ? "Por encima" : "Dentro"} del {data.institutionLimit}%</p>
                </div>
              )}
            </section>

            {data.sources.length > 0 && (
              <section className="mb-4">
                <h2 className="mb-2 text-base font-bold">Fuentes</h2>
                <ol className="space-y-1.5">
                  {data.sources.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs" style={{ breakInside: "avoid" }}>
                      <SourceBadge index={i} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{s.title}</p>
                        {s.url && <p className="break-all text-slate-600">{s.url}</p>}
                        <p className="text-slate-600">{s.detail}</p>
                      </div>
                      <p className="shrink-0 text-right font-bold">
                        {f.sources[i]?.similarity ?? 0}%<br />
                        <span className="font-normal text-slate-600">{f.sources[i]?.matchedWords ?? 0} palabras</span>
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="mb-4">
              <h2 className="mb-2 text-base font-bold">Texto analizado</h2>
              <p className="mb-2 text-xs text-slate-600">Cada coincidencia lleva el número y el color de su fuente. Lo subrayado en gris coincide, pero se excluyó según los filtros.</p>
              <div className="whitespace-pre-wrap rounded border border-slate-300 p-3">
                <HighlightedText text={data.text} segments={f.segments} />
              </div>
            </section>

            <section className="text-[11px] text-slate-700" style={{ breakInside: "avoid" }}>
              <h2 className="mb-1 text-sm font-bold text-slate-900">Método y alcance</h2>
              <ul className="list-disc space-y-1 pl-4">
                <li>Una coincidencia es una secuencia de {data.ngram} o más palabras consecutivas idénticas, sin distinguir mayúsculas, tildes ni puntuación. El porcentaje es palabras coincidentes ÷ palabras totales del documento; las exclusiones no cambian el denominador.</li>
                <li>Cada palabra coincidente se atribuye a la fuente con más coincidencias que la contiene. Por eso la suma por fuente puede ser menor que el total de cada fuente por separado.</li>
                {data.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
                <li>La huella SHA-256 permite comprobar que este informe corresponde al mismo archivo o texto: en Windows, <span className="font-mono">certutil -hashfile archivo SHA256</span>.</li>
                <li>Este informe es una herramienta de apoyo. No existe un porcentaje permitido universal y cada coincidencia debe evaluarse en su contexto.</li>
              </ul>
            </section>
          </div>,
          document.body
        )}
    </>
  );
}
