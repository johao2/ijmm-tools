import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./JsonLd";

describe("serializeJsonLd", () => {
  it("serializes valid structured data", () => {
    expect(serializeJsonLd({ "@type": "WebSite", name: "IJMM Tools" })).toBe(
      '{"@type":"WebSite","name":"IJMM Tools"}'
    );
  });

  it("escapes characters that could terminate a script element", () => {
    const serialized = serializeJsonLd({ value: "</script><script>&" });
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).not.toContain("&");
    expect(serialized).toContain("\\u003c/script\\u003e");
  });
});
