# AGENTS.md — Technical Constitution for AI Coding Agents

**Project Name:** IJMM TOOLS  
**Owner:** IJMM SYSTEM  
**Version:** 1.0.0  
**Scope:** Strict engineering guidelines, standards, and rules for all AI agents and developers contributing to IJMM Tools.

---

## 1. Core Principles & Governance

### 1.1 Approval & Architecture Mandates
- **No Unapproved Architecture Changes:** AI agents MUST NOT modify core directory layouts, framework paradigms, routing structures, or global state strategy without prior explicit user approval.
- **Root-Level URLs for Primary Tools:** Primary SEO tools MUST use top-level URLs (e.g., `/percentage-calculator`, `/json-formatter`). Do NOT create duplicate indexable routes such as `/tools/percentage-calculator`. The `/tools` route serves exclusively as the tools directory.
- **No Thin or Placeholder Pages:** Tools with `status: "planned"` in the central registry MUST NOT generate public indexable pages or routes until fully implemented.

### 1.2 Branding & Nomenclature
- **Product Name:** `IJMM Tools` (Exact casing).
- **Company Name:** `IJMM System` (Exact casing).
- Do NOT use invalid variations like `IJMM Tools System`, `IJMMSystems`, or `IJMM Tool`.

---

## 2. Technical Stack & Dependencies

### 2.1 Stack Standard
- **Framework:** Next.js (Current stable LTS version, App Router).
- **Language:** TypeScript (`strict: true`, no `any`, mandatory interfaces/types for props and logic).
- **Styling:** Tailwind CSS (Current official version with zero unnecessary legacy config).
- **Icons:** `lucide-react` (tree-shakeable import).
- **Utilities:** `clsx` & `tailwind-merge` (`cn` helper).

### 2.2 Dependency Governance
- **Minimal Dependencies Rule:** Before proposing or installing ANY external package, an agent MUST justify:
  1. Why native browser / React / Next.js functionality cannot replace it.
  2. The exact impact on bundle size.
  3. Why it is strictly necessary.
- **No Unnecessary Packages:** Packages like `lodash`, `moment`, heavy UI suites, or custom HTTP clients for local calculations are strictly prohibited.

---

## 3. Code Standards & Architecture

### 3.3 Separation of Concerns (Business Logic vs. UI)
- **Business Logic Isolation:** Pure calculation logic MUST reside in `lib/tools/` (e.g., `lib/tools/percentage.ts`). It MUST be pure, side-effect-free, and 100% covered by unit tests.
- **UI Components:** Visual components MUST reside in `components/` (`components/ui/`, `components/tools/`, `components/layout/`, `components/content/`, `components/seo/`, `components/ads/`).
- **No Business Logic in Views:** React components handle user input, state presentation, and accessibility — never raw formula calculations.

### 3.4 DRY & Component Reusability
- **No Duplicated UI Elements:** Generic buttons, inputs, cards, containers, copy buttons, search bars, and ad placeholders MUST use shared components.
- **Single Component Registry:** Components like `ToolInput.tsx`, `ToolOutput.tsx`, `CopyButton.tsx`, `AdPlaceholder.tsx`, and `ToolLayout.tsx` serve ALL tools.

---

## 4. Testing & Quality Assurance

### 4.1 Automated Unit Testing
- Every tool calculation function MUST have complete automated unit tests (e.g., using `vitest` / Node test runner).
- Tests MUST cover:
  - Standard inputs & edge cases
  - Zero division (`0 / 0`, `X / 0`)
  - Negative values (where allowed or restricted)
  - Decimal precision & formatting
  - Large values & floating-point safety
  - Empty or invalid string parsing

### 4.2 Build & Type Checks
- Code must pass `npx tsc --noEmit` with zero errors.
- Code must pass `npm run build` cleanly before merging or completing phases.

---

## 5. SEO, AEO & GEO Technical Strategy

### 5.1 Content Quality & Originality
- **No Low-Value/Thin Content:** Content must provide real utility, accurate formulas, clear step-by-step examples, and clean semantic markup.
- **No Keyword Stuffing or AI Manipulation:** Do NOT generate artificial text solely for keywords. Write clear, authoritative explanations.

### 5.2 Structured Data (Schema.org)
- Implement `WebSite`, `WebApplication`, `BreadcrumbList`, and `FAQPage` ONLY when they accurately represent visible page content.
- Do NOT use FAQ Schema purely for rich-result manipulation.

### 5.3 Internal Linking & Navigation
- Provide semantic breadcrumbs and related tool recommendations.
- Non-existent or planned tools MUST NOT yield broken internal links.

---

## 6. Performance, Security & Privacy

### 6.1 Performance & Core Web Vitals
- Tools like `Percentage Calculator` MUST work 100% client-side without backend or API requests.
- Server Components by default; Client Components (`"use client"`) strictly reserved for interactive UI branches.
- Zero layout shifts (CLS), minimal JavaScript payload.

### 6.2 Privacy & Security
- User data processed by tools stays local in the browser.
- Validate and sanitize all user inputs.
- Never dangerously expose secrets or use un-sanitized dynamic HTML insertions.

---

## 7. Analytics & Advertising Strategy

### 7.1 Analytics Architecture
- Centralized event tracking in `lib/analytics/events.ts` (`trackEvent`).
- Standardized events: `tool_view`, `tool_start`, `tool_complete`, `tool_error`, `result_copy`, `result_download`, `tool_share`.
- Vendor-agnostic logic — business components call `trackEvent()`, never vendor SDKs directly.

### 7.2 Advertising Preserving UX
- Publicidad encapsulada mediante `<AdPlaceholder placement="..." />`.
- Positions: `top`, `middle`, `bottom`, `sidebar`.
- Ads must never compromise usability or shift layout dynamically.

---

## 8. Version Control & Documentation

### 8.1 Technical Documentation
- All architecture, development guidelines, SEO strategy, monetization, and roadmaps must be kept up-to-date in `/docs/`:
  - `/docs/architecture.md`
  - `/docs/development.md`
  - `/docs/seo.md`
  - `/docs/monetization.md`
  - `/docs/roadmap.md`

### 8.2 Git Commit Conventions
- Use conventional commit messages: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- Commit logically after completing verified sub-phases.
