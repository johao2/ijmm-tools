# SEO, AEO & GEO Strategy — IJMM TOOLS

**Owner:** IJMM SYSTEM  
**Product:** IJMM Tools

---

## 1. Overview & Objectives

IJMM Tools is optimized for three modern search discovery paradigms:
1. **Traditional SEO (Search Engine Optimization):** High-ranking organic web search visibility.
2. **AEO (Answer Engine Optimization):** Direct answer extraction by engines like Google Search SGE, Bing Copilot, and Perplexity.
3. **GEO (Generative Engine Optimization):** Contextual citation and understanding by LLM-powered assistants (ChatGPT, Gemini, Claude).

---

## 2. Technical SEO Principles

### 2.1 URL Hierarchy
- Primary tools use clean root-level URLs (e.g., `ijmmtools.com/percentage-calculator`).
- Category pages use `/categories/[slug]`.
- Directory URL `/tools` lists all tools.
- No duplicate indexable routes.

### 2.2 Structured Data (Schema.org)
Implemented semantically with zero manipulative markup:
- **`WebSite`:** Site name, URL, search action.
- **`WebApplication`:** Tool name, operating system, application category, browser requirement.
- **`BreadcrumbList`:** Visual and programmatic path (`Home > Calculators > Percentage Calculator`).
- **`FAQPage`:** Included ONLY when visible FAQs exist on the page to provide immediate utility.

### 2.3 Sitemap & Robots Configuration
- `sitemap.ts` dynamically scans `ToolRegistry` and outputs only `status: "active"` URLs.
- `robots.ts` allows legitimate search crawlers (`Googlebot`, `Bingbot`, `OAI-SearchBot`).

---

## 3. AEO & GEO Principles

### 3.1 Content Standards
- **Direct Mathematical Formulas:** Clear representation of formulas (e.g., $Y \times X / 100$).
- **Concise Direct Answers:** Concise H2 and paragraph explanations answering user intent immediately.
- **Real-World Examples:** Concrete step-by-step calculation examples with numbers.
- **No Thin Content:** Zero placeholder or low-value pages.
