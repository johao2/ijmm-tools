import React from "react";
import { cn } from "@/lib/utils/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {}

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={cn("border-0 border-t border-[var(--border)]", className)} {...props} />;
}

export default Divider;
