import React from "react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

export interface ToolShellProps extends React.HTMLAttributes<HTMLElement> {
  containerSize?: "sm" | "md" | "lg" | "full";
}

export function ToolShell({ containerSize = "md", className, children, ...props }: ToolShellProps) {
  return (
    <Container as="section" size={containerSize} className={cn("py-8 sm:py-12", className)} {...props}>
      {children}
    </Container>
  );
}

export default ToolShell;
