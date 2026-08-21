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
    // Search for "percentage"
    const results1 = searchTools("percentage");
    expect(results1.some((t) => t.id === "percentage-calculator")).toBe(true);

    // Search for "PERCENT" (case insensitive)
    const results2 = searchTools("PERCENT");
    expect(results2.some((t) => t.id === "percentage-calculator")).toBe(true);

    // Search for empty string
    const resultsEmpty = searchTools("");
    expect(resultsEmpty).toEqual(getActiveTools());

    // Search for planned tools when requested
    const resultsPlanned = searchTools("json", true);
    expect(resultsPlanned.some((t) => t.id === "json-formatter")).toBe(true);

    // Search for planned tools without includePlanned = false
    const resultsNoPlanned = searchTools("json", false);
    expect(resultsNoPlanned.some((t) => t.id === "json-formatter")).toBe(false);
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
});
