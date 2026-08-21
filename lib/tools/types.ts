/**
 * Tool Lifecycle Status:
 * - "active": Fully implemented, publicly accessible, indexed in sitemap and search engines.
 * - "planned": Registered in master catalog for roadmap tracking, but MUST NOT generate public pages.
 * - "deprecated": Formerly active tool no longer promoted or accessible as primary.
 */
export type ToolStatus = "planned" | "active" | "deprecated";

/**
 * Category Definition
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon name
  status?: "active" | "planned";
}

/**
 * SEO Metadata for Active Tools
 */
export interface ToolSEO {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
}

/**
 * FAQ Item Model
 */
export interface FAQItem {
  question: string;
  answer: string;
  formula?: string;
  example?: string;
}

/**
 * Master Tool Model
 */
export interface Tool {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  icon: string; // Lucide icon name
  status: ToolStatus;
  seo: ToolSEO;
  relatedToolIds?: string[];
}

/**
 * Analytics Event Payload
 */
export interface AnalyticsEvent {
  name: string;
  timestamp?: number;
  payload?: Record<string, unknown>;
}
