import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, id: customId, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex items-start gap-3 rounded-(--radius-md) border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-slate-400">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          aria-describedby={helperText ? helperId : undefined}
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
            className
          )}
          {...props}
        />
        <div className="min-w-0">
          <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-[var(--text)]">
            {label}
          </label>
          {helperText && (
            <p id={helperId} className="mt-0.5 text-xs text-[var(--text-muted)]">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
