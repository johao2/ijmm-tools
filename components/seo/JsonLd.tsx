import React from "react";

export interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function serializeJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[]
): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
};

export default JsonLd;
