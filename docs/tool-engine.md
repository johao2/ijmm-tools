# Tool Engine — IJMM Tools

**Owner:** IJMM System  
**Phase:** 4 — Core Platform / Tool Engine

## Purpose

The Tool Engine defines the smallest shared contract needed to add tools consistently without coupling the platform to a specific formula, form, or result shape.

```text
Tool Platform
  ├─ Tool Registry: discovery and public lifecycle
  ├─ Tool Engine: typed execution contracts
  └─ Tool Module: domain-specific input, calculation and output
```

## Core contracts

- `ToolDefinition`: the registry-backed identity and metadata for a tool.
- `ToolModule<TInput, TOutput>`: a definition, optional visible content, and one pure execution boundary.
- `ToolExecutionResult<TOutput>`: a discriminated success/failure result with no thrown-error requirement.
- `ToolPageContent`: optional introduction, formula, examples, and FAQs.
- `ToolPage<TInput, TOutput>`: a module plus already-validated related tools.
- `executeTool()`: a thin, framework-independent execution entry point.

## Separation of concerns

The engine lives in `lib/tools/engine.ts` and imports no React, Next.js, browser, analytics, or network APIs. Domain modules own validation and calculations. React components own input state, presentation, focus, and accessible feedback. The registry owns publication status, discovery, categories, slugs, and related-tool integrity.

## Page composition

The UI foundation from Phase 3 renders modules through `ToolShell`, `ToolHeader`, `ToolContent`, and `ToolResult`. These visual components intentionally do not depend on the generic engine, preventing a type abstraction from dictating page layout.

## Extension rule

Add a new abstraction only after at least two real tools require the same behavior. A tool may use a richer domain result internally as long as its module exposes a typed `ToolExecutionResult` at the shared boundary.

## Compatibility

The existing `Tool` registry type remains the single source of metadata truth and is aliased as `ToolDefinition`. Root-level public URLs remain authoritative as required by `AGENTS.md`; the engine does not control routing.
