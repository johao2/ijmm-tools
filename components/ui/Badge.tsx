import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "success" | "warning" | "error" | "info";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  neutral: "border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-muted)]",
  primary: "border-[var(--primary)]/25 bg-[var(--primary-light)] text-[var(--primary)]",
  success: "border-[var(--success)]/25 bg-[var(--success-bg)] text-[var(--success)]",
  warning: "border-[var(--warning)]/25 bg-[var(--warning-bg)] text-[var(--warning)]",
  error: "border-[var(--error)]/25 bg-[var(--error-bg)] text-[var(--error)]",
  info: "border-[var(--info)]/25 bg-[var(--info-bg)] text-[var(--info)]",
};

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;
