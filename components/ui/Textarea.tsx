import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";
import Label from "./Label";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, id: customId, className, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;
    const hasError = Boolean(error);
    const describedBy = [hasError ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && <Label htmlFor={textareaId}>{label}</Label>}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            "min-h-64 w-full resize-y rounded-(--radius-md) border bg-[var(--surface)] px-3.5 py-3 font-mono text-sm leading-relaxed text-[var(--text)] placeholder-[var(--text-muted)] transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
            hasError
              ? "border-[var(--error)] focus:ring-[var(--error)]"
              : "border-[var(--border)] hover:border-slate-400",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";

export default Textarea;
