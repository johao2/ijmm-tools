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

## 2. How to Add a New Tool (Standard Workflow)

To create a new tool in IJMM Tools, follow these exact 4 steps:

### Step 1: Write Pure Business Logic
Create `lib/tools/<tool-name>.ts`:
- Define input types, output types, and validation errors.
- Export pure functions.
- Write unit tests in `lib/tools/__tests__/<tool-name>.test.ts`.

### Step 2: Register the Tool in Data Registry
Update `data/tools.ts`:
```typescript
{
  id: "tool-id",
  name: "Tool Display Name",
  slug: "tool-slug",
  category: "calculators",
  description: "Detailed description for SEO...",
  shortDescription: "Short one-liner for cards...",
  icon: "Percent", // Lucide icon name
  keywords: ["keyword1", "keyword2"],
  seoTitle: "SEO Title | IJMM Tools",
  seoDescription: "Meta description...",
  faq: [...],
  relatedTools: ["percentage-calculator"],
  status: "active" // Or "planned"
}
```

### Step 3: Create UI Components
Use shared components (`ToolLayout`, `ToolInput`, `ToolOutput`, `CopyButton`):
- Place specific tool components inside `components/tools/<tool-name>/` or directly in `app/<tool-slug>/page.tsx`.

### Step 4: Add Page Route
Create `app/<tool-slug>/page.tsx`:
- Render server-side metadata using `generateMetadata`.
- Render `ToolLayout` with JSON-LD, Breadcrumbs, FAQs, and calculation UI.

---

## 3. Code Standards & Quality Checks

Run the following commands before submitting any PR or completing a feature phase:

```bash
# Type check
npx tsc --noEmit

# Run unit tests
npm test

# Production build test
npm run build
```
