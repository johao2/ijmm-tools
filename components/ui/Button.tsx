import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:bg-blue-900 border border-transparent shadow-sm",
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
        className={cn(
          "inline-flex items-center justify-center font-sans tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
