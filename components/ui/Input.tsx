import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      id: customId,
      disabled,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

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
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            "w-full rounded-(--radius-md) border bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
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

Input.displayName = "Input";

export default Input;
