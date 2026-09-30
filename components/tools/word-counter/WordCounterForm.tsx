"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { trackEvent } from "@/lib/analytics/events";
import { analyzeText, formatMinutes } from "@/lib/tools/text-stats";

const TOOL_ID = "contador-de-palabras";

export default function WordCounterForm() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState("");

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "academic-writing" });
  }, []);

  const s = analyzeText(text);
  const max = Number(limit);
  const hasLimit = Number.isInteger(max) && max > 0;
  const stats = [
    { label: "Palabras", value: s.words.toLocaleString("es") },
    { label: "Caracteres", value: s.characters.toLocaleString("es") },
    { label: "Caracteres sin espacios", value: s.charactersNoSpaces.toLocaleString("es") },
    { label: "Oraciones", value: s.sentences.toLocaleString("es") },
    { label: "Párrafos", value: s.paragraphs.toLocaleString("es") },
    { label: "Palabras por oración", value: String(s.averageWordsPerSentence) },
    { label: "Tiempo de lectura", value: formatMinutes(s.readingMinutes) },
    { label: "Tiempo de exposición", value: formatMinutes(s.speakingMinutes) },
    { label: "Páginas (doble espacio)", value: `≈ ${s.pagesDoubleSpaced}` },
    { label: "Páginas (espacio simple)", value: `≈ ${s.pagesSingleSpaced}` },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <Card padding="md" className="space-y-3">
        <Textarea label="Tu texto" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe o pega aquí tu ensayo, resumen o capítulo." className="min-h-80 font-sans" />
        <div className="max-w-60">
          <Input label="Límite de palabras (opcional)" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Ej. 500" />
        </div>
        {hasLimit && (
          <div className="space-y-1">
            <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
              <div className={`h-full ${s.words > max ? "bg-[var(--error)]" : "bg-[var(--primary)]"}`} style={{ width: `${Math.min(100, (s.words / max) * 100)}%` }} />
            </div>
            <p className={`text-xs font-semibold ${s.words > max ? "text-[var(--error)]" : "text-[var(--text-muted)]"}`}>
              {s.words > max ? `Te pasaste por ${s.words - max} palabra(s).` : `Te quedan ${max - s.words} palabra(s) de ${max}.`}
            </p>
          </div>
        )}
      </Card>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((item) => (
            <Card key={item.label} variant="outline" padding="sm">
              <p className="text-[11px] font-semibold text-[var(--text-muted)]">{item.label}</p>
              <p className="text-lg font-bold text-[var(--text)]">{item.value}</p>
            </Card>
          ))}
        </div>
        {s.topWords.length > 0 && (
          <Card variant="outline" padding="md">
            <p className="mb-2 text-xs font-bold text-[var(--text)]">Palabras más repetidas</p>
            <ul className="flex flex-wrap gap-2">
              {s.topWords.map((w) => (
                <li key={w.word} className="rounded-full bg-[var(--surface-secondary)] px-2.5 py-1 text-xs text-[var(--text)]">
                  {w.word} <span className="font-bold">{w.count}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
