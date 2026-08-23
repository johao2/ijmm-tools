import React from "react";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: "info" | "success" | "warning" | "error";
}

const variants = {
  info: { classes: "border-[var(--info)]/30 bg-[var(--info-bg)] text-[var(--info)]", Icon: Info },
  success: { classes: "border-[var(--success)]/30 bg-[var(--success-bg)] text-[var(--success)]", Icon: CircleCheck },
  warning: { classes: "border-[var(--warning)]/30 bg-[var(--warning-bg)] text-[var(--warning)]", Icon: CircleAlert },
  error: { classes: "border-[var(--error)]/30 bg-[var(--error-bg)] text-[var(--error)]", Icon: CircleX },
};

export function Alert({ title, variant = "info", className, children, ...props }: AlertProps) {
  const { classes, Icon } = variants[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-(--radius-md) border p-4 text-sm", classes, className)}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-[var(--text)]">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && "mt-1", "text-[var(--text-muted)]")}>{children}</div>
      </div>
    </div>
  );
}

export default Alert;
