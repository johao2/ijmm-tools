import { TOOLS } from "@/data/tools";
import { CATEGORIES } from "@/data/categories";
import { Tool, Category } from "@/lib/tools/types";

/**
 * Normalizes string for case-insensitive and accent-insensitive matching.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Lookup tool by its unique slug.
 */
export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Lookup tool by its unique ID.
 */
export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

/**
 * Get all active public tools.
 * ONLY active tools generate public indexable pages.
 */
export function getActiveTools(): Tool[] {
  return TOOLS.filter((tool) => tool.status === "active");
}

/**
 * Get all planned tools (MVP roadmap).
 */
export function getPlannedTools(): Tool[] {
  return TOOLS.filter((tool) => tool.status === "planned");
}

/**
 * Get all deprecated tools.
 */
export function getDeprecatedTools(): Tool[] {
  return TOOLS.filter((tool) => tool.status === "deprecated");
}

/**
 * Get tools by category ID.
 * Defaults to returning ONLY active tools.
 */
export function getToolsByCategory(
  categoryId: string,
  includePlanned: boolean = false
): Tool[] {
  return TOOLS.filter(
    (tool) =>
      tool.categoryId === categoryId &&
      (includePlanned || tool.status === "active")
  );
}

/**
 * In-memory client/server search across registered tools.
 * Operates case-insensitively and accent-tolerantly.
 */
export function searchTools(
  query: string,
  includePlanned: boolean = false
): Tool[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return includePlanned ? TOOLS : getActiveTools();
  }

  return TOOLS.filter((tool) => {
    if (!includePlanned && tool.status !== "active") {
      return false;
    }

    const nameMatch = normalizeText(tool.name).includes(normalizedQuery);
    const shortDescMatch = normalizeText(tool.shortDescription).includes(normalizedQuery);
    const descMatch = normalizeText(tool.description).includes(normalizedQuery);
    const categoryMatch = normalizeText(tool.categoryId).includes(normalizedQuery);
    const keywordsMatch = tool.seo.keywords?.some((kw) =>
      normalizeText(kw).includes(normalizedQuery)
    );

    return nameMatch || shortDescMatch || descMatch || categoryMatch || keywordsMatch;
  });
}

/**
 * Get related active tools for a given tool.
 * Prevents broken internal links by returning ONLY active tools.
 */
export function getRelatedTools(toolId: string): Tool[] {
  const tool = getToolById(toolId);
  if (!tool || !tool.relatedToolIds || tool.relatedToolIds.length === 0) {
    return [];
  }

  const activeRelated: Tool[] = [];
  for (const id of tool.relatedToolIds) {
    const relTool = getToolById(id);
    if (relTool && relTool.status === "active" && relTool.id !== toolId) {
      activeRelated.push(relTool);
    }
  }

  return activeRelated;
}

/**
 * Get all registered categories.
 */
export function getAllCategories(): Category[] {
  return CATEGORIES;
}

/**
 * Get categories that currently contain at least one active public tool.
 * Useful for indexable navigation surfaces such as the sitemap.
 */
export function getPublishedCategories(): Category[] {
  return CATEGORIES.filter((category) =>
    TOOLS.some(
      (tool) => tool.categoryId === category.id && tool.status === "active"
    )
  );
}

/**
 * Lookup category by slug.
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Lookup category by ID.
 */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Registry Validation Engine (Development Quality Assurance)
 * Ensures zero duplicate IDs, duplicate slugs, invalid category references,
 * or broken related tool links.
 */
export function validateRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const validCategoryIds = new Set(CATEGORIES.map((c) => c.id));
  const validToolIds = new Set(TOOLS.map((t) => t.id));
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const seenCategoryIds = new Set<string>();
  const seenCategorySlugs = new Set<string>();

  for (const category of CATEGORIES) {
    if (seenCategoryIds.has(category.id)) {
      errors.push(`Duplicate category ID detected: "${category.id}"`);
    }
    seenCategoryIds.add(category.id);

    if (seenCategorySlugs.has(category.slug)) {
      errors.push(`Duplicate category slug detected: "${category.slug}"`);
    }
    seenCategorySlugs.add(category.slug);

    if (!slugRegex.test(category.slug)) {
      errors.push(
        `Malformed category slug "${category.slug}". Slugs must be lowercase, hyphenated, and URL-safe.`
      );
    }
  }

  for (const tool of TOOLS) {
    // 1. Check duplicate IDs
    if (seenIds.has(tool.id)) {
      errors.push(`Duplicate tool ID detected: "${tool.id}"`);
    }
    seenIds.add(tool.id);

    // 2. Check duplicate slugs
    if (seenSlugs.has(tool.slug)) {
      errors.push(`Duplicate tool slug detected: "${tool.slug}"`);
    }
    seenSlugs.add(tool.slug);

    // 3. Check malformed slug
    if (!slugRegex.test(tool.slug)) {
      errors.push(
        `Malformed tool slug "${tool.slug}". Slugs must be lowercase, hyphenated, and URL-safe.`
      );
    }

    // 4. Check category reference
    if (!validCategoryIds.has(tool.categoryId)) {
      errors.push(
        `Tool "${tool.id}" references non-existent categoryId: "${tool.categoryId}"`
      );
    }

    // 5. Check valid status
    if (!["active", "planned", "deprecated"].includes(tool.status)) {
      errors.push(
        `Tool "${tool.id}" has invalid status: "${tool.status}"`
      );
    }

    if (
      tool.status === "active" &&
      tool.seo.canonicalPath !== `/${tool.slug}`
    ) {
      errors.push(
        `Active tool "${tool.id}" must use root canonical path "/${tool.slug}".`
      );
    }

    // 6. Check related tools references
    if (tool.relatedToolIds) {
      for (const relId of tool.relatedToolIds) {
        if (!validToolIds.has(relId)) {
          errors.push(
            `Tool "${tool.id}" references non-existent relatedToolId: "${relId}"`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
