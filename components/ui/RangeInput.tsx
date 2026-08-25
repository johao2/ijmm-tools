import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";
import Label from "./Label";

export interface RangeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
}

export const RangeInput = React.forwardRef<HTMLInputElement, RangeInputProps>(
  ({ label, helperText, id: customId, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-2 text-left">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          ref={ref}
          id={inputId}
          type="range"
          aria-describedby={helperText ? helperId : undefined}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-secondary)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
            className
          )}
          {...props}
        />
        {helperText && (
          <p id={helperId} className="text-xs text-[var(--text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

RangeInput.displayName = "RangeInput";

export default RangeInput;
