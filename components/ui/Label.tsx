import React from "react";
import { cn } from "@/lib/utils/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requiredIndicator?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, requiredIndicator = false, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-[var(--text)]", className)}
      {...props}
    >
      {children}
      {requiredIndicator && (
        <span className="ml-1 text-[var(--error)]" aria-hidden="true">*</span>
      )}
    </label>
  )
);

Label.displayName = "Label";

export default Label;
