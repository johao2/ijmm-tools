"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import Button, { ButtonProps } from "@/components/ui/Button";

export interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string;
  label?: string;
  copiedLabel?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label = "Copy result",
  copiedLabel = "Copied!",
  variant = "outline",
  size = "sm",
  className,
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for non-secure or legacy browser contexts
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Graceful fallback if copy fails
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant={copied ? "primary" : variant}
      size={size}
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      className={className}
      {...props}
    >
      {copied ? (
        <>
          <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
};

export default CopyButton;
