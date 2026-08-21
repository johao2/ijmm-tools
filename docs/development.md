# Developer Guide — IJMM TOOLS

**Owner:** IJMM SYSTEM  
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
1. **`calculatePercentageOf(percentage, total)`:**
   - Formula: `total * (percentage / 100)`
2. **`calculateWhatPercentage(part, whole)`:**
   - Formula: `(part / whole) * 100`
   - Validation: `whole === 0` yields `DIVISION_BY_ZERO` error.
3. **`calculatePercentageIncrease(originalValue, newValue)`:**
   - Formula: `((newValue - originalValue) / originalValue) * 100`
   - Validation: `originalValue === 0` yields `DIVISION_BY_ZERO` error.
4. **`calculatePercentageDecrease(originalValue, newValue)`:**
   - Formula: `((originalValue - newValue) / originalValue) * 100`
   - Validation: `originalValue === 0` yields `DIVISION_BY_ZERO` error.
5. **`calculatePercentageDifference(value1, value2)`:**
   - Formula: `|value1 - value2| / ((|value1| + |value2|) / 2) * 100`
   - Validation: `(|value1| + |value2|) / 2 === 0` (both zero) yields `DIVISION_BY_ZERO` error.
6. **`calculateOriginalValue(finalValue, percentageChange, changeType)`:**
   - Formula (Increase): `finalValue / (1 + percentageChange / 100)`
   - Formula (Decrease): `finalValue / (1 - percentageChange / 100)`
   - Validation: Denominator zero yields `DIVISION_BY_ZERO` error.

### 4.2 Precision Policy & Error Handling
- **Floating Point Rounding:** Internal results rounded using `roundToPrecision(value, 6)` (`Math.round((value + Number.EPSILON) * 10^6) / 10^6`).
- **Display Formatting:** `formatNumericResult(value)` formats numbers up to 4 decimal places with trailing zeros stripped.
- **Non-Finite Shielding:** Returns `NON_FINITE_RESULT` error if calculation results in `NaN` or `Infinity`.
- **Negative Values:** Supported wherever mathematically valid (e.g. negative percentage of a number, negative part/whole relationships).

---

## 5. How to Add a New Tool (Standard Workflow)

To create a new tool in IJMM Tools, follow these exact 4 steps:

### Step 1: Write Pure Business Logic
Create `lib/tools/<tool-name>.ts`:
- Define input types, output types, and validation errors.
- Export pure functions.
- Write unit tests in `lib/tools/__tests__/<tool-name>.test.ts`.

### Step 2: Register the Tool in Data Registry
Update `data/tools.ts`:
- Set `status: "planned"` during development.
- Change `status: "active"` ONLY when the tool page and logic are 100% complete and tested.

### Step 3: Create UI Components
Use shared components (`ToolLayout`, `ToolInput`, `ToolOutput`, `CopyButton`):
- Place specific tool components inside `components/tools/<tool-name>/`.

### Step 4: Add Page Route
Create `app/<tool-slug>/page.tsx`:
- Render server-side metadata using `generateMetadata`.
- Render `ToolLayout` with JSON-LD, Breadcrumbs, FAQs, and calculation UI.

---

## 6. Quality & Build Commands

Run the following commands before submitting any PR or completing a feature phase:

```bash
# Type check
npx tsc --noEmit

# Run unit tests
npm test

# Production build test
npm run build
```
