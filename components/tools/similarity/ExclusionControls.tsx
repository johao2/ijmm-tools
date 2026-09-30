"use client";

import Checkbox from "@/components/ui/Checkbox";
import Select from "@/components/ui/Select";
import type { ExclusionOptions } from "@/lib/tools/similarity-filters";

interface ExclusionControlsProps {
  value: ExclusionOptions;
  onChange: (value: ExclusionOptions) => void;
}

/** Filtros del resultado. Se aplican al instante, sin volver a analizar el documento. */
export default function ExclusionControls({ value, onChange }: ExclusionControlsProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-bold text-[var(--text)]">Exclusiones</legend>
      <div className="grid gap-3 md:grid-cols-3">
        <Checkbox
          label="Excluir texto entre comillas"
          helperText="Citas textuales marcadas con “ ”, « » o comillas rectas."
          checked={value.excludeQuotes}
          onChange={(e) => onChange({ ...value, excludeQuotes: e.target.checked })}
        />
        <Checkbox
          label="Excluir bibliografía"
          helperText="Desde el título “Referencias” o “Bibliografía” hasta el final o los anexos."
          checked={value.excludeBibliography}
          onChange={(e) => onChange({ ...value, excludeBibliography: e.target.checked })}
        />
        <Select
          label="Excluir coincidencias menores de"
          value={String(value.minWords)}
          onChange={(e) => onChange({ ...value, minWords: Number(e.target.value) })}
          options={[
            { value: "0", label: "No excluir" },
            { value: "8", label: "8 palabras" },
            { value: "10", label: "10 palabras" },
            { value: "15", label: "15 palabras" },
            { value: "20", label: "20 palabras" },
            { value: "30", label: "30 palabras" },
          ]}
        />
      </div>
    </fieldset>
  );
}
