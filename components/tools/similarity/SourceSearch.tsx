"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, FileUp, Globe, Info } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import { readTextFile } from "@/lib/files/docx";
import { highlightSegments } from "@/lib/tools/similarity";
import type { SourceCheckResult } from "@/lib/source-search/check";
import type { AnalysisLevel, ProviderId } from "@/lib/source-search/providers";

const TOOL_ID = "detector-de-similitud";

const PROVIDER_NAMES: Record<ProviderId, string> = {
  brave: "Internet",
  core: "Repositorio académico (CORE)",
  openalex: "Publicación académica (OpenAlex)",
};
const LEVEL_NAMES: Record<AnalysisLevel, string> = {
  full: "Comparado con el texto completo",
  abstract: "Comparado solo con el resumen",
  snippet: "Comparado solo con el extracto del buscador",
};

interface Status {
  providers: ProviderId[];
  dailyLimit: number;
  maxWords: number;
}

export default function SourceSearch() {
  const [status, setStatus] = useState<Status | null>(null);
  const [text, setText] = useState("");
  const [ngram, setNgram] = useState("5");
  const [limit, setLimit] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(SourceCheckResult & { remaining: number }) | null>(null);
  const [analyzedText, setAnalyzedText] = useState("");
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/source-check", { cache: "no-store" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ providers: [], dailyLimit: 0, maxWords: 0 }));
  }, []);

  const run = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    trackEvent("tool_start", { toolId: TOOL_ID, mode: "internet" });
    try {
      const res = await fetch("/api/source-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, ngram: Number(ngram), consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "No se pudo completar la búsqueda.");
      setAnalyzedText(text);
      setResult(data);
      trackEvent("tool_complete", { toolId: TOOL_ID, mode: "internet", resultCount: data.sources.length });
    } catch (err) {
      setError((err as Error).message);
      trackEvent("tool_error", { toolId: TOOL_ID, mode: "internet" });
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      setText(await readTextFile(file));
      setResult(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const limitNumber = limit.trim() ? Number(limit.replace(",", ".")) : undefined;
  const hasLimit = limitNumber !== undefined && Number.isFinite(limitNumber) && limitNumber >= 0 && limitNumber <= 100;

  if (!status) return <Alert variant="info">Cargando…</Alert>;
  if (status.providers.length === 0) {
    return (
      <Alert variant="info" title="Próximamente">
        La búsqueda de coincidencias en internet y en repositorios académicos se activará en breve. Mientras tanto puedes comparar documentos entre sí con la herramienta de arriba.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)]">
            Fuentes activas: {status.providers.map((p) => PROVIDER_NAMES[p]).join(" · ")} · Hasta {status.maxWords.toLocaleString("es")} palabras · {status.dailyLimit} revisiones por día
          </p>
          <input ref={fileInput} type="file" accept=".docx,.txt,.md,text/plain" className="hidden" onChange={(e) => { loadFile(e.target.files?.[0]); e.target.value = ""; }} />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <FileUp className="h-4 w-4" aria-hidden="true" /> Subir .docx/.txt
          </Button>
        </div>
        <Textarea aria-label="Texto a revisar en internet" className="min-h-56 font-sans" value={text} onChange={(e) => { setText(e.target.value); setResult(null); }} placeholder="Pega aquí tu trabajo o sube el archivo." />
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <Select label="Sensibilidad" value={ngram} onChange={(e) => setNgram(e.target.value)} options={[
              { value: "4", label: "Alta (4 palabras seguidas)" },
              { value: "5", label: "Normal (5 palabras seguidas)" },
              { value: "7", label: "Baja (7 palabras seguidas)" },
            ]} />
          </div>
          <div className="w-56">
            <Input label="Límite de tu institución (%)" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <Checkbox
          label="Acepto que el texto se envíe a los servidores de IJMM Tools y a los buscadores indicados solo para realizar esta revisión."
          helperText="El texto no se guarda: se usa para buscar frases y se descarta al terminar. Los buscadores reciben únicamente las frases consultadas."
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <Button type="button" size="lg" onClick={run} disabled={!consent || loading || !text.trim()} isLoading={loading}>
          <Globe className="h-4 w-4" aria-hidden="true" /> {loading ? "Buscando fuentes… (hasta 1 minuto)" : "Buscar en internet y repositorios"}
        </Button>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      {result && (
        <div className="space-y-6">
          <Card variant="outline" padding="md" className="space-y-2">
            <p className="text-xs font-semibold text-[var(--text-muted)]">Coincidencia con fuentes encontradas</p>
            <p className={`text-4xl font-extrabold ${result.matchedWords ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>{result.similarity}%</p>
            <p className="text-sm text-[var(--text-muted)]">
              {result.matchedWords} de {result.words} palabras de tu documento coinciden con {result.sources.length} fuente(s). Se consultaron {result.phrasesSearched} frases del documento.
            </p>
            {hasLimit && (
              <p className={`text-sm font-semibold ${result.similarity > (limitNumber as number) ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
                {result.similarity > (limitNumber as number) ? "Por encima" : "Dentro"} del límite de {limitNumber}% indicado.
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)]">Te quedan {result.remaining} revisión(es) en internet hoy.</p>
          </Card>

          {result.errors.map((e) => (
            <Alert key={e} variant="warning">{e}</Alert>
          ))}

          {result.sources.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[var(--text)]">Fuentes con coincidencias</h2>
              {result.sources.map((s) => (
                <Card key={s.url} variant="outline" padding="md" className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 break-all text-sm font-bold text-[var(--primary)] hover:underline">
                        {s.title} <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </a>
                      <p className="break-all text-xs text-[var(--text-muted)]">{s.url}</p>
                      <p className="text-xs text-[var(--text-muted)]">{PROVIDER_NAMES[s.provider]}{s.year ? ` · ${s.year}` : ""} · {LEVEL_NAMES[s.level]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-[var(--warning)]">{s.similarity}%</p>
                      <p className="text-xs text-[var(--text-muted)]">{s.matchedWords} de {result.words} palabras</p>
                    </div>
                  </div>
                  {s.sourceExcerpts.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-semibold text-[var(--text)]">Ver fragmentos coincidentes de la fuente ({s.sourceExcerpts.length})</summary>
                      <ul className="mt-2 space-y-1">
                        {s.sourceExcerpts.map((ex, i) => (
                          <li key={i} className="rounded bg-[var(--surface-secondary)] p-2 text-[var(--text)]">“{ex}”</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  {s.level !== "full" && (
                    <p className="flex gap-1 text-xs text-[var(--text-muted)]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> El porcentaje puede ser mayor: esta fuente solo pudo compararse con {s.level === "abstract" ? "su resumen" : "el extracto del buscador"}. Abre el enlace para revisarla completa.</p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {result.unverified.length > 0 && (
            <Card variant="outline" padding="md" className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--text)]">Fuentes sugeridas por los buscadores, sin coincidencia verificada</h2>
              <ul className="space-y-2">
                {result.unverified.map((u) => (
                  <li key={u.url} className="text-xs">
                    <a href={u.url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-[var(--primary)] hover:underline break-all">{u.title || u.url}</a>
                    <span className="text-[var(--text-muted)]"> · {PROVIDER_NAMES[u.provider]} · {u.reason}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card variant="outline" padding="md" className="space-y-2">
            <h2 className="text-sm font-bold text-[var(--text)]">Recomendaciones</h2>
            <ul className="space-y-2 text-sm text-[var(--text)]">
              {result.matchedWords === 0 && (
                <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--info)]" aria-hidden="true" />No se encontraron secuencias de {result.ngram} o más palabras idénticas en las fuentes consultadas. Esto no garantiza que no existan coincidencias en fuentes que los buscadores no indexan.</li>
              )}
              {result.sources.length > 0 && (
                <>
                  <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />Revisa cada fuente enlazada. Si usaste su contenido de forma textual, ponlo entre comillas y cita autor, año y página (APA 7); si lo expresaste con tus palabras, cita igualmente autor y año.</li>
                  <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--info)]" aria-hidden="true" />Las coincidencias en definiciones técnicas, títulos, nombres propios o bibliografía pueden ser legítimas; evalúa cada fragmento en su contexto.</li>
                </>
              )}
              {!hasLimit && (
                <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--info)]" aria-hidden="true" />No existe un porcentaje de similitud permitido universal: cada universidad o docente define el suyo. Ingresa el límite de tu institución para compararlo.</li>
              )}
              <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--info)]" aria-hidden="true" />Esta revisión consulta internet y repositorios de acceso abierto. No incluye trabajos entregados en plataformas privadas (como Turnitin), revistas de pago ni documentos escaneados sin texto.</li>
            </ul>
          </Card>

          {result.spans.length > 0 && (
            <Card variant="outline" padding="md" className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--text)]">Tu documento con las coincidencias resaltadas</h2>
              <div className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-(--radius-md) bg-[var(--surface-secondary)] p-4 text-sm leading-relaxed text-[var(--text)]">
                {highlightSegments(analyzedText, result.spans).map((seg, i) =>
                  seg.match ? <mark key={i} className="rounded bg-amber-200 px-0.5 text-slate-900">{seg.text}</mark> : <span key={i}>{seg.text}</span>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
