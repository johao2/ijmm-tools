import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ToolContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ToolContent({ className, ...props }: ToolContentProps) {
  return <div className={cn("w-full", className)} {...props} />;
}

export default ToolContent;
