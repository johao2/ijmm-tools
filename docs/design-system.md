# Design System — IJMM Tools

**Owner:** IJMM System  
**Product:** IJMM Tools  
**Phase:** 3 — Design System + UI Foundation

## 1. Principles

The interface is minimal, technological, professional, fast, and accessible. It follows a mobile-first approach, uses semantic HTML, provides visible keyboard focus, respects reduced-motion preferences, and keeps interactive JavaScript limited to components that require browser state.

## 2. Tokens

Tokens live in `app/globals.css` and are exposed to Tailwind CSS v4 through `@theme inline`.

- Color: `background`, `foreground`, `surface`, `surface-secondary`, `muted`, `border`, `primary`, `primary-foreground`, `success`, `warning`, `error`, and `info`, including feedback backgrounds.
- Typography: Geist Sans and Geist Mono with a documented size scale from `xs` through `xl`.
- Spacing: a compact scale from `space-1` through `space-8`.
- Shape: `radius-sm`, `radius-md`, `radius-lg`, and `radius-full`.
- Elevation: `shadow-subtle` and `shadow-card`.
- Motion: fast and normal durations with a standard easing curve; reduced motion is enforced globally.
- Focus: a high-contrast `focus-ring` token used with `focus-visible`.
- Containers: `sm`, `md`, `lg`, and `full` widths with responsive horizontal padding.

Light values are the default. Dark values are provided with `prefers-color-scheme: dark`, so the architecture supports the operating-system preference without adding a client-side theme controller.

## 3. Base Components

All reusable primitives live in `components/ui/` and accept `className` for controlled composition through `cn()`.

- `Button`: five semantic variants, three sizes, loading and disabled states.
- `Input` and `Select`: labels, helper text, errors, and accessible descriptions.
- `Label`: reusable form label with an optional visual required indicator.
- `Card`: surface, outline, and flat presentation variants.
- `Badge`: neutral, brand, and feedback variants.
- `Alert`: semantic feedback with consistent iconography and an assertive error mode.
- `Container`: responsive content boundaries.
- `Divider`: consistent semantic separation.
- `Skeleton`: reduced-motion-compatible loading placeholder.

Components remain Server Component-compatible unless they require state, effects, event handlers, or browser APIs.

## 4. Layout

`components/layout/` provides the responsive `Header`, `Navigation`, `MobileMenu`, and `Footer`. Only `MobileMenu` is a Client Component because it owns open state, Escape handling, and scroll locking. The footer includes the ownership line “A product by IJMM System”.

## 5. Tool UI Foundation

Tool pages compose four small primitives:

```tsx
<ToolShell>
  <ToolHeader title="Tool name" description="What the tool does." />
  <ToolContent>
    {/* Tool-specific form */}
    <ToolResult value="42" />
  </ToolContent>
</ToolShell>
```

- `ToolShell`: responsive page container and vertical rhythm.
- `ToolHeader`: title, description, and optional eyebrow.
- `ToolContent`: neutral workspace for a tool-specific module.
- `ToolResult`: standard result presentation backed by `ToolOutput`.

`ToolLayout` remains the compatibility composition used by existing routes and now delegates to these primitives. Calculation logic never belongs in these components.

## 6. Conventions

- Use CSS variables and established Tailwind utilities; do not add inline styles.
- Use `lucide-react` for structural icons.
- Use `cn()` from `lib/utils/cn.ts` to merge conditional classes.
- Prefer native elements and real labels before ARIA.
- Keep primary tool URLs at the repository-defined root level.
- Add new variants only when a repeated product need exists.

## 7. Phase Reconciliation

The inspected repository already contained registry, tool, SEO, analytics, and production-readiness work beyond the historical Phase 2 baseline. Phase 3 was completed additively to preserve those authorized changes; no routing, framework, state, or core directory architecture was replaced.
