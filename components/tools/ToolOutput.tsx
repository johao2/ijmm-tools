import React from "react";
import Card from "@/components/ui/Card";
import CopyButton from "./CopyButton";
import { cn } from "@/lib/utils/cn";

export interface ToolOutputProps {
  label?: string;
  value: string;
  unit?: string;
  copyableValue?: string;
  details?: { label: string; value: string }[];
  className?: string;
}

export const ToolOutput: React.FC<ToolOutputProps> = ({
  label = "Result",
  value,
  unit,
  copyableValue,
  details,
  className,
}) => {
  const textToCopy = copyableValue || (unit ? `${value}${unit}` : value);

  return (
    <Card
      variant="flat"
      padding="md"
      className={cn(
        "border border-[var(--border)] bg-[var(--surface-secondary)] space-y-3 text-left",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </span>
        {value && <CopyButton value={textToCopy} size="sm" />}
      </div>

      {/* Screen reader live region for calculation result updates */}
      <div aria-live="polite" aria-atomic="true" className="space-y-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl">
            {value}
          </span>
          {unit && (
            <span className="text-xl font-bold text-[var(--primary)]">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Optional breakdown details (e.g. Discount Amount & Final Price) */}
      {details && details.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {details.map((detail, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[var(--text-muted)] font-medium">{detail.label}</span>
              <span className="font-bold text-[var(--text)] text-sm">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ToolOutput;
