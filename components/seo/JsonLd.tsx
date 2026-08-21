import React from "react";

export interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
};

export default JsonLd;
