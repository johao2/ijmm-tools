import { describe, it, expect } from "vitest";
import {
  getToolBySlug,
  getToolById,
  getActiveTools,
  getPlannedTools,
  getDeprecatedTools,
  getToolsByCategory,
  searchTools,
  getRelatedTools,
  getAllCategories,
  getPublishedCategories,
  getCategoryBySlug,
  getCategoryById,
  validateRegistry,
} from "@/lib/tools/registry";

describe("Tool Registry API", () => {
  it("should pass registry validation with zero integrity errors", () => {
    const validation = validateRegistry();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("should retrieve pilot active tool by slug", () => {
    const tool = getToolBySlug("percentage-calculator");
    expect(tool).toBeDefined();
    expect(tool?.id).toBe("percentage-calculator");
    expect(tool?.status).toBe("active");
  });

  it("should retrieve the JSON formatter as an active root-level tool", () => {
    const tool = getToolBySlug("json-formatter");
    expect(tool?.status).toBe("active");
    expect(tool?.seo.canonicalPath).toBe("/json-formatter");
  });

  it("should retrieve the password generator as an active root-level tool", () => {
    const tool = getToolBySlug("password-generator");
    expect(tool?.status).toBe("active");
    expect(tool?.seo.canonicalPath).toBe("/password-generator");
  });

  it("should retrieve the QR generator as an active root-level tool", () => {
    const tool = getToolBySlug("qr-code-generator");
    expect(tool?.status).toBe("active");
    expect(tool?.seo.canonicalPath).toBe("/qr-code-generator");
  });

  it("should handle slug lookups case-insensitively", () => {
    const tool = getToolBySlug("PERCENTAGE-CALCULATOR");
    expect(tool).toBeDefined();
    expect(tool?.id).toBe("percentage-calculator");
  });

  it("should return undefined for missing or invalid slug", () => {
    const tool = getToolBySlug("non-existent-tool-slug");
    expect(tool).toBeUndefined();
  });

  it("should retrieve active tools list containing only active status tools", () => {
    const activeTools = getActiveTools();
    expect(activeTools.length).toBeGreaterThan(0);
    activeTools.forEach((tool) => {
      expect(tool.status).toBe("active");
    });
  });

  it("should retrieve planned tools list containing only planned status tools", () => {
    const plannedTools = getPlannedTools();
    expect(plannedTools.length).toBeGreaterThan(0);
    plannedTools.forEach((tool) => {
      expect(tool.status).toBe("planned");
    });
    // Percentage calculator must not be in planned
    expect(plannedTools.some((t) => t.id === "percentage-calculator")).toBe(false);
  });

  it("should return empty list for deprecated tools when none exist", () => {
    const deprecatedTools = getDeprecatedTools();
    expect(Array.isArray(deprecatedTools)).toBe(true);
    expect(deprecatedTools).toHaveLength(0);
  });

  it("should filter tools by category ID", () => {
    const calcTools = getToolsByCategory("calculators");
    expect(calcTools.length).toBeGreaterThan(0);
    expect(calcTools.some((t) => t.id === "percentage-calculator")).toBe(true);

    const invalidCategoryTools = getToolsByCategory("invalid-category-id");
    expect(invalidCategoryTools).toHaveLength(0);
  });

  it("should perform in-memory search case-insensitively and accent-tolerantly", () => {
    // Search for "porcentaje" (Spanish query)
    const results1 = searchTools("porcentaje");
    expect(results1.some((t) => t.id === "percentage-calculator")).toBe(true);

    // Search for "PORCENTAJE" (case insensitive)
    const results2 = searchTools("PORCENTAJE");
    expect(results2.some((t) => t.id === "percentage-calculator")).toBe(true);

    // Search for empty string
    const resultsEmpty = searchTools("");
    expect(resultsEmpty).toEqual(getActiveTools());

    // Active JSON tool is searchable by default
    const resultsJson = searchTools("json");
    expect(resultsJson.some((t) => t.id === "json-formatter")).toBe(true);

    const resultsPassword = searchTools("contraseña");
    expect(resultsPassword.some((t) => t.id === "password-generator")).toBe(true);

    const resultsQr = searchTools("wifi");
    expect(resultsQr.some((t) => t.id === "qr-code-generator")).toBe(true);

    // Search also supports including planned tools
    const resultsPlanned = searchTools("json", true);
    expect(resultsPlanned.some((t) => t.id === "json-formatter")).toBe(true);
  });

  it("should handle related tools lookup safely without broken links", () => {
    const related = getRelatedTools("percentage-calculator");
    expect(Array.isArray(related)).toBe(true);
    // Planned related tools (e.g. calculadora-iva-ecuador) should be filtered out from active related tools
    related.forEach((tool) => {
      expect(tool.status).toBe("active");
    });
  });

  it("should retrieve categories data correctly", () => {
    const categories = getAllCategories();
    expect(categories.length).toBe(8);
    expect(categories.some((c) => c.id === "ecuador-tools")).toBe(true);

    const calcCat = getCategoryBySlug("calculators");
    expect(calcCat).toBeDefined();
    expect(calcCat?.id).toBe("calculators");

    const calcById = getCategoryById("calculators");
    expect(calcById).toBeDefined();
    expect(calcById?.slug).toBe("calculators");
  });

  it("should publish only categories that contain active tools", () => {
    const categories = getPublishedCategories();
    expect(categories.map((category) => category.id)).toContain("calculators");
    expect(categories.map((category) => category.id)).toContain("developer-tools");
    expect(categories.map((category) => category.id)).toContain("generators");
  });

  it("should enforce root canonical URLs for active tools", () => {
    getActiveTools().forEach((tool) => {
      expect(tool.seo.canonicalPath).toBe(`/${tool.slug}`);
    });
  });
});
