"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CopyButton from "@/components/tools/CopyButton";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackEvent } from "@/lib/analytics/events";
import { formatCitation, type Author, type CitationInput, type SourceType } from "@/lib/tools/citations";

const TOOL_ID = "generador-citas-apa";

interface AuthorRow extends Author {
  id: number;
  kind: "person" | "organization";
}

let nextId = 2;

export default function CitationForm() {
  const [type, setType] = useState<SourceType>("book");
  const [authors, setAuthors] = useState<AuthorRow[]>([{ id: 1, kind: "person", family: "", given: "" }]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [degree, setDegree] = useState<"grado" | "maestría" | "doctoral">("grado");
  const [ampersand, setAmpersand] = useState(false);

  useEffect(() => {
    trackEvent("tool_view", { toolId: TOOL_ID, categoryId: "academic-writing" });
  }, []);

  const f = (key: string) => fields[key] ?? "";
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setFields({ ...fields, [key]: e.target.value });
  const updateAuthor = (id: number, patch: Partial<AuthorRow>) => setAuthors((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const input: CitationInput = {
    type,
    authors: authors.map((a) => (a.kind === "organization" ? { organization: a.organization } : { family: a.family, given: a.given })),
    year: f("year"),
    month: f("month") ? Number(f("month")) : undefined,
    day: f("day") ? Number(f("day")) : undefined,
    title: f("title"),
    edition: f("edition"),
    publisher: f("publisher"),
    journal: f("journal"),
    volume: f("volume"),
    issue: f("issue"),
    pages: f("pages"),
    siteName: f("siteName"),
    degree,
    institution: f("institution"),
    repository: f("repository"),
    doi: f("doi"),
    url: f("url"),
    ampersand,
  };
  const result = f("title").trim() ? formatCitation(input) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card padding="md" className="space-y-4">
        <Select
          label="Tipo de fuente"
          value={type}
          onChange={(e) => setType(e.target.value as SourceType)}
          options={[
            { value: "book", label: "Libro" },
            { value: "article", label: "Artículo de revista científica" },
            { value: "web", label: "Página web" },
            { value: "thesis", label: "Tesis" },
          ]}
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-[var(--text)]">Autores</legend>
          {authors.map((a, index) => (
            <div key={a.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-2">
              <Select
                aria-label={`Tipo de autor ${index + 1}`}
                value={a.kind}
                onChange={(e) => updateAuthor(a.id, { kind: e.target.value as AuthorRow["kind"] })}
                options={[
                  { value: "person", label: "Persona" },
                  { value: "organization", label: "Institución" },
                ]}
              />
              {a.kind === "person" ? (
                <>
                  <Input aria-label={`Apellidos del autor ${index + 1}`} placeholder="Apellidos" value={a.family ?? ""} onChange={(e) => updateAuthor(a.id, { family: e.target.value })} />
                  <Input aria-label={`Nombres del autor ${index + 1}`} placeholder="Nombres" value={a.given ?? ""} onChange={(e) => updateAuthor(a.id, { given: e.target.value })} />
                </>
              ) : (
                <Input className="col-span-2" aria-label={`Institución ${index + 1}`} placeholder="Nombre de la institución" value={a.organization ?? ""} onChange={(e) => updateAuthor(a.id, { organization: e.target.value })} />
              )}
              <Button type="button" variant="ghost" size="sm" aria-label={`Eliminar autor ${index + 1}`} disabled={authors.length === 1} onClick={() => setAuthors((l) => l.filter((x) => x.id !== a.id))}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setAuthors((l) => [...l, { id: nextId++, kind: "person", family: "", given: "" }])}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Agregar autor
          </Button>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Año" inputMode="numeric" value={f("year")} onChange={set("year")} placeholder="Vacío = s. f." />
          {type === "web" && (
            <>
              <Input label="Mes (1-12)" inputMode="numeric" value={f("month")} onChange={set("month")} />
              <Input label="Día" inputMode="numeric" value={f("day")} onChange={set("day")} />
            </>
          )}
        </div>
        <Input label={type === "article" ? "Título del artículo" : type === "web" ? "Título de la página" : type === "thesis" ? "Título de la tesis" : "Título del libro"} value={f("title")} onChange={set("title")} helperText="En tipo oración: solo la primera palabra y los nombres propios con mayúscula." />

        {type === "book" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Edición (si no es la 1.ª)" value={f("edition")} onChange={set("edition")} placeholder="Ej. 2.ª" />
            <Input label="Editorial" value={f("publisher")} onChange={set("publisher")} />
          </div>
        )}
        {type === "article" && (
          <div className="grid gap-3 sm:grid-cols-4">
            <Input className="sm:col-span-4" label="Nombre de la revista" value={f("journal")} onChange={set("journal")} />
            <Input label="Volumen" value={f("volume")} onChange={set("volume")} />
            <Input label="Número" value={f("issue")} onChange={set("issue")} />
            <Input className="sm:col-span-2" label="Páginas" value={f("pages")} onChange={set("pages")} placeholder="Ej. 45-60" />
          </div>
        )}
        {type === "web" && <Input label="Nombre del sitio web" value={f("siteName")} onChange={set("siteName")} />}
        {type === "thesis" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Tipo de tesis"
              value={degree}
              onChange={(e) => setDegree(e.target.value as typeof degree)}
              options={[
                { value: "grado", label: "Tesis de grado" },
                { value: "maestría", label: "Tesis de maestría" },
                { value: "doctoral", label: "Tesis doctoral" },
              ]}
            />
            <Input label="Universidad" value={f("institution")} onChange={set("institution")} />
            <Input className="sm:col-span-2" label="Repositorio (opcional)" value={f("repository")} onChange={set("repository")} placeholder="Ej. Repositorio Digital UCE" />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="DOI (opcional)" value={f("doi")} onChange={set("doi")} placeholder="10.xxxx/xxxxx" />
          <Input label="URL (si no hay DOI)" value={f("url")} onChange={set("url")} placeholder="https://" />
        </div>
        <Checkbox label="Usar “&” en lugar de “y” entre autores" checked={ampersand} onChange={(e) => setAmpersand(e.target.checked)} />
      </Card>

      <div className="space-y-4">
        {!result && <Alert variant="info">Completa al menos el título para generar la referencia.</Alert>}
        {result && !result.success && <Alert variant="error">{result.message}</Alert>}
        {result && result.success && (
          <>
            <Card variant="outline" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text)]">Referencia (lista final)</h2>
                <CopyButton value={result.plain} toolId={TOOL_ID} size="sm" variant="outline" />
              </div>
              <p className="pl-8 -indent-8 font-serif text-base leading-relaxed text-[var(--text)]">
                {result.reference.map((seg, i) => (seg.italic ? <em key={i}>{seg.text}</em> : <span key={i}>{seg.text}</span>))}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Al pegarla en Word, aplica cursiva a las partes que aquí aparecen en cursiva y sangría francesa de 1,27 cm.</p>
            </Card>
            <Card variant="outline" padding="md" className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--text)]">Cita dentro del texto</h2>
              {[
                { label: "Parentética", value: result.inText.parenthetical },
                { label: "Narrativa", value: result.inText.narrative },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[var(--text)]"><span className="text-xs text-[var(--text-muted)]">{c.label}: </span>{c.value}</p>
                  <CopyButton value={c.value} toolId={TOOL_ID} size="sm" variant="ghost" />
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
