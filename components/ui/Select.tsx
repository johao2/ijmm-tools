import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";
import Label from "./Label";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error,
      id: customId,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;

    const hasError = Boolean(error);
    const describedBy = [
      hasError ? errorId : null,
      helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <Label htmlFor={selectId}>
            {label}
          </Label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={describedBy || undefined}
            className={cn(
              "w-full appearance-none rounded-(--radius-md) border bg-[var(--surface)] px-3.5 py-2 pr-8 text-sm text-[var(--text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 cursor-pointer",
              hasError
                ? "border-[var(--error)] focus:ring-[var(--error)]"
                : "border-[var(--border)] hover:border-slate-400",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[var(--text-muted)]">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {hasError && (
          <p id={errorId} className="text-xs font-medium text-[var(--error)]">
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p id={helperId} className="text-xs text-[var(--text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
