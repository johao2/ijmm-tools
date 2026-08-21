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

## 2. Design System & UI Component Rules

### 2.1 Design Tokens (`app/globals.css`)
- **Centralized Colors:** All UI styling must consume the centralized tokens defined in `app/globals.css` via CSS variables (`--primary`, `--surface`, `--text`, `--border`, `--error`, `--success`, etc.).
- **No Hardcoded Hex Values:** Never hardcode hex values like `#1e40af` inside component files. Use token classes (e.g. `bg-[var(--primary)]`, `text-[var(--text)]`).
- **Responsive Breakpoints:** Mobile-first approach. Ensure layouts adjust cleanly across `320px`, `375px`, `430px`, `768px`, `1024px`, `1280px+`.

### 2.2 Reusable UI Components (`components/ui/`)
All views must use the base UI system:
- **`Container`:** Enforces page max-widths (`sm`, `md`, `lg`, `full`) and horizontal padding.
- **`Button`:** Standardized button with variants (`primary`, `secondary`, `outline`, `ghost`, `destructive`) and keyboard focus management.
- **`Input`:** Text/numeric input with automatic `id`/`htmlFor` label binding, helper text, and `aria-invalid` state.
- **`Select`:** Accessible dropdown selection component.
- **`Card`:** Light container for tools, categories, and results.

### 2.3 Component Usage Example
```tsx
import { Container, Card, Input, Select, Button } from "@/components/ui";

export function ExampleToolForm() {
  return (
    <Container size="md">
      <Card padding="md">
        <Input
          label="Enter Value"
          type="number"
          placeholder="e.g. 100"
          helperText="Enter a positive number"
        />
        <Button variant="primary" className="mt-4">
          Calculate
        </Button>
      </Card>
    </Container>
  );
}
```

### 2.4 Accessibility Rules
- Every form field MUST have an associated `<label>` (handled automatically by `Input` and `Select`).
- All interactive elements must have visible `:focus-visible` rings.
- Respect `prefers-reduced-motion` for zero unwanted animations.

---

## 3. How to Add a New Tool (Standard Workflow)

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

## 4. Code Standards & Quality Checks

Run the following commands before submitting any PR or completing a feature phase:

```bash
# Type check
npx tsc --noEmit

# Run unit tests
npm test

# Production build test
npm run build
```
