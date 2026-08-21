import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "full";
  as?: React.ElementType;
}

const sizeClasses = {
  sm: "max-w-3xl",    // 768px - For narrow focused forms & articles
  md: "max-w-5xl",    // 1024px - Standard tool workspace
  lg: "max-w-7xl",    // 1280px - Global page layouts & directory grids
  full: "max-w-full", // Full width
};

export const Container: React.FC<ContainerProps> = ({
  size = "lg",
  as: Component = "div",
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
