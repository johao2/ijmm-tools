# SEO, AEO & GEO Technical Strategy — IJMM TOOLS

**Owner:** IJMM SYSTEM  
**Product:** IJMM Tools  
**Version:** 1.0.0

---

## 1. Overview & Core Principles

IJMM Tools is architected to be technically discoverable, semantically structured, and genuinely useful across three discovery paradigms:
1. **Search Engine Optimization (SEO):** Traditional organic web search visibility.
2. **Answer Engine Optimization (AEO):** Direct answer extraction for conversational search features.
3. **Generative Engine Optimization (GEO):** Factual clarity for LLM-based assistants (ChatGPT, Gemini, Perplexity, Claude).

---

## 2. Canonical & URL Strategy

### 2.1 Single Canonical URL per Tool
- **Primary SEO Tools:** Primary tools reside at top-level root URLs (e.g. `https://ijmmtools.com/percentage-calculator`).
- **No Duplicate Indexable URLs:** The route `/tools` serves exclusively as the tools directory. Routes such as `/tools/percentage-calculator` do NOT exist and must NOT be created.

### 2.2 Status Lifecycle Indexing Policy
- **`status: "active"`:** Publicly accessible, indexed in `sitemap.ts`, `robots.ts`, directory, and search engines.
- **`status: "planned"`:** Registered in catalog for internal roadmap tracking. **MUST NOT** generate public routes, sitemap entries, or thin placeholder content.
- **`status: "deprecated"`:** Excluded from primary search directories.

---

## 3. Metadata Architecture (`lib/seo/metadata.ts`)

Metadata is generated server-side using Next.js Metadata API and `constructMetadata()`:
- **`title`:** Concise, natural title (e.g. `Percentage Calculator — Free Online Calculator | IJMM Tools`).
- **`description`:** Factual description explaining utility, free access, and key calculations. Zero keyword lists.
- **`alternates.canonical`:** Absolute canonical URL pointing to `https://ijmmtools.com/percentage-calculator`.
- **`openGraph`:** Clean OG metadata (title, description, url, siteName: "IJMM Tools", type: "website").
- **`robots`:** Standard `index: true, follow: true` for active pages.

---

## 4. Structured Data (Schema.org) Policy (`components/seo/JsonLd.tsx`)

Structured data MUST represent visible page content accurately with zero manipulative markup:
- **`WebSite`:** Represents the platform root, search action, and publisher ("IJMM System").
- **`WebApplication`:** Describes tool operating system ("All"), browser requirements, and category.
- **`BreadcrumbList`:** Programs visual and semantic path (`Home > Calculators > Percentage Calculator`).
- **`FAQPage`:** Included ONLY when visible FAQs exist on the page to provide immediate utility.

---

## 5. AEO & GEO Content Guidelines

### 5.1 Answer-Engine Optimization (AEO)
- **Direct Definitions:** Clear answers to real queries ("What is a percentage?", "How do you calculate X% of Y?").
- **Explicit Formulas:** Formatted math formulas matching `lib/tools/percentage.ts`.
- **Step-by-step Examples:** Real-world examples with numerical substitutions.

### 5.2 Generative Engine Optimization (GEO)
- **Factual Language:** Clear headings (H1, H2), concise paragraphs, no fluff.
- **No Manipulative AI Claims:** Zero fake endorsements ("Google recommends..."), zero artificial keyword stuffing.
- **Entity Distinction:** Product is **IJMM Tools**; Owner/Publisher is **IJMM System**.

---

## 6. Sitemap & Robots Configuration

- **`app/sitemap.ts`:** Dynamically pulls active tools and categories containing active tools. Planned tools and empty roadmap categories are excluded.
- **`app/robots.ts`:** Permits crawling of public routes for all legitimate engines and links to `https://ijmmtools.com/sitemap.xml`.

## 7. Social Metadata & Structured Data Safety

- Open Graph and Twitter summary metadata are generated centrally by `constructMetadata()`.
- Canonicals use the trusted `NEXT_PUBLIC_SITE_URL` origin and repository-defined paths.
- `JsonLd` escapes HTML-significant characters before writing trusted structured data into a script element.
- Breadcrumb schema omits an invented URL for the current item when no canonical href is supplied.
- Empty roadmap categories return `noindex` metadata and remain outside the sitemap.
