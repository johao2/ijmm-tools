# Developer Guide — IJMM TOOLS

**Owner:** IJMM System
**Product:** IJMM Tools

---

## 1. Getting Started

### Prerequisites
- **Node.js:** v24.x (or LTS v20+)
- **npm:** v10+

### Local Environment Setup
```bash
cd ijmm-tools
npm install
npm run dev
```

The application runs locally at `http://localhost:3000`.

---

## 2. Tool Registry & Data Models

### 2.1 Single Source of Truth
All tool and category data MUST be defined in the central data catalog:
- `data/tools.ts`: Master catalog of tools (1 active pilot + 9 planned MVP candidates).
- `data/categories.ts`: Master catalog of 8 official categories (including `ecuador-tools`).
- `data/faqs.ts`: Separated dataset for FAQs by tool ID.

Never create manual tool arrays inside React components or page routes.

### 2.2 Tool Model (`lib/tools/types.ts`)
```typescript
export type ToolStatus = "planned" | "active" | "deprecated";

export interface Tool {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  icon: string;
  status: ToolStatus;
  seo: ToolSEO;
  relatedToolIds?: string[];
}
```

### 2.3 Registry API (`lib/tools/registry.ts`)
Use these deterministic functions to query data:
- `getToolBySlug(slug: string)`: Lookup tool by slug.
- `getActiveTools()`: Returns all active public tools.
- `getPlannedTools()`: Returns planned tools.
- `getToolsByCategory(categoryId)`: Filter tools by category.
- `searchTools(query)`: Case and accent insensitive in-memory search.
- `getRelatedTools(toolId)`: Safely fetches related active tools.
- `validateRegistry()`: Development QA validator for duplicate IDs/slugs and broken links.

---

## 3. Global Layout Architecture (`components/layout/`)

### 3.1 Layout Composition
- **`Header` (Server Component):** Renders text brand `IJMM Tools`, desktop navigation, and slot for search trigger (`/tools`).
- **`Navigation` (Server Component):** Renders semantic `<nav>` with active desktop links (`/tools`, `/categories`, `/about`, `/contact`).
- **`MobileMenu` (Client Component):** Accessible slide-over menu for mobile viewports (`<768px`). Manages `aria-expanded`, `aria-controls`, `Escape` key listeners, and backdrop interactions.
- **`Footer` (Server Component):** Renders semantic `<footer>` with brand ownership (`A product by IJMM System`), platform directory links, legal links (`/privacy`, `/terms`), and copyright (`© 2026 IJMM System`).

---

## 4. Percentage Calculator Engine Specification (`lib/tools/percentage.ts`)

Pure, framework-independent domain logic for percentage calculations. Returns `CalculationResult` (`CalculationSuccess` | `CalculationError`).

### 4.1 Six Core Calculation Operations
1. **`calculatePercentageOf(percentage, total)`:** Formula: `total * (percentage / 100)`
2. **`calculateWhatPercentage(part, whole)`:** Formula: `(part / whole) * 100` (validates `whole !== 0`).
3. **`calculatePercentageIncrease(originalValue, newValue)`:** Formula: `((newValue - originalValue) / originalValue) * 100`.
4. **`calculatePercentageDecrease(originalValue, newValue)`:** Formula: `((originalValue - newValue) / originalValue) * 100`.
5. **`calculatePercentageDifference(value1, value2)`:** Formula: `|v1 - v2| / ((|v1| + |v2|) / 2) * 100`.
6. **`calculateOriginalValue(finalValue, percentageChange, changeType)`:** Calculates original value before change.
7. **`calculateDiscount(originalPrice, discountPercentage)`:** Bonus helper for store discount calculation.

---

## 5. Tool UI Architecture Patterns (`components/tools/`)

All tool UIs follow a strict input-to-domain flow:

```text
User Input ──> React Controlled Form ──> Pure Domain Logic (lib/tools/) ──> CalculationResult ──> ToolOutput
```

### 5.1 Reusable Tool Components
- **`ToolLayout`:** Responsive tool shell with breadcrumbs, H1 title, and description.
- **`ToolOutput`:** Prominent result box with `aria-live="polite"`, unit formatting, metadata breakdown, and integrated `CopyButton`.
- **`CopyButton`:** Clipboard API button providing accessible visual and screen-reader copy feedback ("Copied!").

---

## 6. Analytics Event Architecture (`lib/analytics/events.ts`)

Centralized, provider-agnostic event tracking abstraction. Components call `trackEvent(eventName, payload)` without importing vendor SDKs directly.

---

## 7. Quality & Verification Commands

Run the unified verification command before committing code or opening a Pull Request:

```bash
# Unified Release & Quality Verification (Typecheck + Test + Build + Audit)
npm run verify
```

For individual checks:
```bash
npm run typecheck   # npx tsc --noEmit
npm test            # vitest run
npm run build       # next build
npm run audit       # npm audit
```

For production deployment instructions, consult [`docs/deployment.md`](deployment.md).
