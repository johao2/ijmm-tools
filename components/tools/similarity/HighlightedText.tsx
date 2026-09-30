import { sourceColor, type Segment } from "@/lib/tools/similarity-filters";

interface HighlightedTextProps {
  text: string;
  segments: Segment[];
  /** Al pulsar un fragmento: índice de la fuente atribuida */
  onSourceClick?: (source: number) => void;
}

/** Texto con cada coincidencia resaltada en el color de su fuente y numerada; lo excluido aparece subrayado en gris. */
export default function HighlightedText({ text, segments, onSourceClick }: HighlightedTextProps) {
  return (
    <>
      {segments.map((seg, i) => {
        const content = text.slice(seg.start, seg.end);
        if (seg.type === "plain") return <span key={i}>{content}</span>;
        if (seg.type === "excluded") {
          return (
            <span key={i} className="text-slate-500 underline decoration-slate-400 decoration-dotted underline-offset-4" title="Coincidencia excluida por los filtros">
              {content}
            </span>
          );
        }
        const n = (seg.source ?? 0) + 1;
        return (
          <mark
            key={i}
            className="similarity-mark rounded px-0.5 text-slate-900"
            style={{ backgroundColor: sourceColor(seg.source ?? 0) }}
            title={`Fuente ${n}`}
            onClick={onSourceClick ? () => onSourceClick(seg.source ?? 0) : undefined}
            role={onSourceClick ? "button" : undefined}
            tabIndex={onSourceClick ? 0 : undefined}
            onKeyDown={onSourceClick ? (e) => (e.key === "Enter" || e.key === " ") && onSourceClick(seg.source ?? 0) : undefined}
          >
            <sup className="mr-0.5 rounded-sm bg-slate-900 px-1 text-[10px] font-bold text-white">{n}</sup>
            {content}
          </mark>
        );
      })}
    </>
  );
}

/** Número de la fuente con su color, para listas y leyendas. */
export function SourceBadge({ index }: { index: number }) {
  return (
    <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md border border-slate-900/20 px-1 text-xs font-bold text-slate-900" style={{ backgroundColor: sourceColor(index) }}>
      {index + 1}
    </span>
  );
}
