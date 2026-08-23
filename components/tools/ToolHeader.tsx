import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ToolHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  eyebrow?: string;
}

export function ToolHeader({ title, description, eyebrow, className, ...props }: ToolHeaderProps) {
  return (
    <header className={cn("mb-8 space-y-2", className)} {...props}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">{eyebrow}</p>}
      <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
        {description}
      </p>
    </header>
  );
}

export default ToolHeader;
