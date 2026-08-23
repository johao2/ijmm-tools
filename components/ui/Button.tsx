import React from "react";
import { cn } from "@/lib/utils/cn";
import { LoaderCircle } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:brightness-90 border border-transparent shadow-sm",
  secondary:
    "bg-[var(--surface-secondary)] text-[var(--text)] hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
  outline:
    "bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-secondary)] active:bg-slate-200",
  ghost:
    "bg-transparent text-[var(--text)] hover:bg-[var(--surface-secondary)] active:bg-slate-200 border border-transparent",
  destructive:
    "bg-[var(--error)] text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-sm",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-(--radius-sm)",
  md: "px-4 py-2 text-sm font-medium rounded-(--radius-md)",
  lg: "px-5 py-2.5 text-base font-semibold rounded-(--radius-md)",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}): string {
  return cn(
    "inline-flex items-center justify-center font-sans tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={buttonStyles({ variant, size, className })}
        {...props}
      >
        {isLoading && (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
