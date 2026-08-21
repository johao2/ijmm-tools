import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "outline" | "flat";
  hoverEffect?: boolean;
  as?: React.ElementType;
}

const paddingClasses = {
  none: "p-0",
  sm: "p-3 sm:p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

const variantClasses = {
  default: "bg-[var(--surface)] border border-[var(--border)] shadow-(--shadow-card)",
  outline: "bg-[var(--surface)] border border-[var(--border)]",
  flat: "bg-[var(--surface-secondary)] border border-transparent",
};

export const Card: React.FC<CardProps> = ({
  padding = "md",
  variant = "default",
  hoverEffect = false,
  as: Component = "div",
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        "rounded-(--radius-lg) transition-colors",
        variantClasses[variant],
        paddingClasses[padding],
        hoverEffect && "hover:border-slate-400 hover:shadow-md cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
