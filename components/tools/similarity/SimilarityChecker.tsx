"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Info, Plus, Trash2 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import { readTextFile } from "@/lib/files/docx";
import ExclusionControls from "@/components/tools/similarity/ExclusionControls";
import HighlightedText, { SourceBadge } from "@/components/tools/similarity/HighlightedText";
import SimilarityReport from "@/components/tools/similarity/SimilarityReport";
import { compareDocuments, recommendations, type SimilarityResult } from "@/lib/tools/similarity";
import { applyExclusions, hasExclusions, NO_EXCLUSIONS, sha256Hex, type ExclusionOptions } from "@/lib/tools/similarity-filters";

const TOOL_ID = "detector-de-similitud";

interface Doc {
  id: number;
  name: string;
  text: string;
  /** Archivo del que salió el texto (para la huella del informe) */
  file?: { name: string; hash: string; text: string };
}

let nextId = 3;

export default function SimilarityChecker() {
  const [docs, setDocs] = useState<Doc[]>([
    { id: 1, name: "Documento 1", text: "" },
    { id: 2, name: "Documento 2", text: "" },
  ]);
  const [ngram, setNgram] = useState("5");
  const [limit, setLimit] = useState("");
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const [options, setOptions] = useState<ExclusionOptions>(NO_EXCLUSIONS);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "academic-writing" });
  }, []);

  const update = (id: number, patch: Partial<Doc>) => {
    setDocs((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    setResult(null);
  };

  const loadFile = async (id: number, file?: File) => {
    if (!file) return;
    setFileError(null);
    try {
      const [text, hash] = await Promise.all([readTextFile(file), file.arrayBuffer().then(sha256Hex)]);
      update(id, { text, name: file.name.replace(/\.(docx|pdf|txt|md)$/i, ""), file: { name: file.name, hash, text } });
    } catch (err) {
      setFileError((err as Error).message);
    }
  };

  const run = () => {
    const r = compareDocuments(docs.map((d) => d.text), Number(ngram));
    setResult(r);
    setSelected(0);
    trackEvent(r.success ? "tool_complete" : "tool_error", { toolId: TOOL_ID, resultCount: docs.length });
  };

  const limitNumber = limit.trim() ? Number(limit.replace(",", ".")) : undefined;
  const limitValid = limitNumber === undefined || (Number.isFinite(limitNumber) && limitNumber >= 0 && limitNumber <= 100);
  const names = docs.map((d) => d.name || `Documento ${d.id}`);
  const recs = result?.success && limitValid ? recommendations(result, names, limitNumber) : [];
  const selectedDoc = result?.success ? result.documents[selected] : null;
  const filtered = useMemo(
    () => (result?.success ? result.documents.map((d) => applyExclusions(docs[d.index]?.text ?? "", d.sources, options)) : []),
    [result, options, docs]
  );
  const excluding = hasExclusions(options);
  const selectedFiltered = filtered[selected];
  const goToSource = (i: number) => document.getElementById(`fuente-doc-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {docs.map((doc, index) => (
          <Card key={doc.id} padding="md" className="space-y-3">
            <div className="flex items-end gap-2">
              <Input className="flex-1" aria-label={`Nombre del documento ${index + 1}`} value={doc.name} onChange={(e) => update(doc.id, { name: e.target.value })} />
              <input
                ref={(el) => {
                  fileInputs.current[doc.id] = el;
                }}
                type="file"
                accept=".docx,.pdf,.txt,.md,application/pdf,text/plain"
                className="hidden"
                onChange={(e) => {
                  loadFile(doc.id, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputs.current[doc.id]?.click()}>
                <FileUp className="h-4 w-4" aria-hidden="true" /> Subir .docx/.pdf/.txt
              </Button>
              <Button type="button" variant="ghost" size="sm" aria-label={`Quitar documento ${index + 1}`} disabled={docs.length <= 2} onClick={() => { setDocs((l) => l.filter((d) => d.id !== doc.id)); setResult(null); }}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <Textarea aria-label={`Texto del documento ${index + 1}`} className="min-h-48 font-sans" value={doc.text} onChange={(e) => update(doc.id, { text: e.target.value })} placeholder="Pega el texto o sube un archivo." />
            <p className="text-xs text-[var(--text-muted)]">{doc.text.trim() ? `${doc.text.trim().split(/\s+/).length} palabras aprox.` : "Vacío"}</p>
          </Card>
        ))}
      </div>

      {fileError && <Alert variant="error">{fileError}</Alert>}

      <Card padding="md" className="flex flex-wrap items-end gap-4">
        <Button type="button" variant="outline" onClick={() => { setDocs((l) => [...l, { id: nextId, name: `Documento ${nextId++}`, text: "" }]); setResult(null); }} disabled={docs.length >= 10}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Agregar documento
        </Button>
        <div className="w-56">
          <Select
            label="Sensibilidad"
            value={ngram}
            onChange={(e) => { setNgram(e.target.value); setResult(null); }}
            options={[
              { value: "4", label: "Alta (4 palabras seguidas)" },
              { value: "5", label: "Normal (5 palabras seguidas)" },
              { value: "7", label: "Baja (7 palabras seguidas)" },
            ]}
          />
        </div>
        <div className="w-56">
          <Input label="Límite de tu institución (%)" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Opcional" error={limitValid ? undefined : "Entre 0 y 100"} />
        </div>
        <Button type="button" size="lg" onClick={run}>Comparar documentos</Button>
      </Card>

      {result && !result.success && <Alert variant="error">{result.message}</Alert>}

      {result && result.success && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.documents.map((d) => (
              <Card key={d.index} variant="outline" padding="md" className="space-y-1">
                <p className="truncate text-xs font-semibold text-[var(--text-muted)]">{names[d.index]}</p>
                <p className={`text-3xl font-extrabold ${filtered[d.index]?.matchedWords ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>{filtered[d.index]?.similarity ?? d.similarity}%</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {filtered[d.index]?.matchedWords ?? d.matchedWords} de {d.words} palabras coinciden · {d.spans.length} fragmento(s) · el más largo: {d.longestMatchWords} palabras
                </p>
                {excluding && <p className="text-xs text-[var(--text-muted)]">Sin exclusiones: {d.similarity}% ({d.matchedWords} palabras)</p>}
              </Card>
            ))}
          </div>

          <Card variant="outline" padding="md" className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--text)]">Comparación por pares</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[var(--text-muted)]">
                  <tr>
                    <th className="py-2 pr-3 font-semibold">Documentos</th>
                    <th className="py-2 pr-3 font-semibold">Del primero en el segundo</th>
                    <th className="py-2 pr-3 font-semibold">Del segundo en el primero</th>
                    <th className="py-2 font-semibold">Secuencias compartidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                  {result.pairs.map((p) => (
                    <tr key={`${p.a}-${p.b}`}>
                      <td className="py-2 pr-3">{names[p.a]} ↔ {names[p.b]}</td>
                      <td className="py-2 pr-3 font-mono">{p.aInB}% ({p.aMatchedWords}/{p.aWords})</td>
                      <td className="py-2 pr-3 font-mono">{p.bInA}% ({p.bMatchedWords}/{p.bWords})</td>
                      <td className="py-2 font-mono">{p.sharedSequences}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Método: se cuentan como coincidencia las secuencias de {result.ngram} o más palabras consecutivas idénticas, sin distinguir mayúsculas, tildes ni signos de puntuación. El porcentaje es palabras coincidentes ÷ palabras totales del documento. Esta tabla no aplica exclusiones.
            </p>
          </Card>

          <Card padding="md">
            <ExclusionControls value={options} onChange={setOptions} />
          </Card>

          <Card variant="outline" padding="md" className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--text)]">Recomendaciones</h2>
            <ul className="space-y-2">
              {recs.map((r, i) => {
                const Icon = r.level === "ok" ? CheckCircle2 : r.level === "warning" ? AlertTriangle : Info;
                const color = r.level === "ok" ? "text-[var(--success)]" : r.level === "warning" ? "text-[var(--warning)]" : "text-[var(--info)]";
                return (
                  <li key={i} className="flex gap-2 text-sm text-[var(--text)]">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
                    <span>{r.text}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {selectedDoc && selectedFiltered && (
            <Card variant="outline" padding="md" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[var(--text)]">Fragmentos coincidentes resaltados</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-64">
                    <Select aria-label="Documento a revisar" value={String(selected)} onChange={(e) => setSelected(Number(e.target.value))} options={names.map((n, i) => ({ value: String(i), label: n }))} />
                  </div>
                  <SimilarityReport
                    toolId={TOOL_ID}
                    data={{
                      mode: `Comparación entre documentos (${docs.length} documentos cargados)`,
                      documentName: names[selected],
                      text: docs[selected]?.text ?? "",
                      file: docs[selected]?.file && docs[selected].file.text === docs[selected].text ? { name: docs[selected].file.name, hash: docs[selected].file.hash } : undefined,
                      ngram: result.ngram,
                      options,
                      filtered: selectedFiltered,
                      sources: selectedDoc.sources.map((src) => ({ title: names[src.index], detail: `Documento cargado · ${src.matchedWords} palabras coincidentes en total` })),
                      institutionLimit: limitValid ? limitNumber : undefined,
                      notes: ["Solo se compararon los documentos cargados entre sí; no se consultó internet ni repositorios."],
                    }}
                  />
                </div>
              </div>
              {selectedDoc.sources.length > 0 && (
                <ul className="flex flex-wrap gap-3 text-xs text-[var(--text)]">
                  {selectedDoc.sources.map((src, i) => (
                    <li key={src.index} id={`fuente-doc-${i + 1}`} className="flex scroll-mt-24 items-center gap-1.5">
                      <SourceBadge index={i} /> {names[src.index]}: {selectedFiltered.sources[i]?.similarity}% ({selectedFiltered.sources[i]?.matchedWords} palabras atribuidas)
                    </li>
                  ))}
                </ul>
              )}
              <div className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-(--radius-md) bg-[var(--surface-secondary)] p-4 text-sm leading-relaxed text-[var(--text)]">
                <HighlightedText text={docs[selected]?.text ?? ""} segments={selectedFiltered.segments} onSourceClick={goToSource} />
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
