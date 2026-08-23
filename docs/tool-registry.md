# Tool Registry — IJMM Tools

**Owner:** IJMM System  
**Phase:** 5 — Tool Registry, Categories and Routing

## Source of truth

`data/tools.ts` is the only catalog of tool definitions. `data/categories.ts` is the only category catalog. UI components and routes must query them through `lib/tools/registry.ts` instead of maintaining local copies.

## Lifecycle

The repository uses the established lifecycle required by `AGENTS.md`:

- `planned`: internal roadmap entry; never receives a public tool page, sitemap URL, or related-tool link.
- `active`: fully implemented and public. This is the repository equivalent of “published”.
- `deprecated`: retained for controlled retirement and excluded from promotion.

## Integrity guarantees

`validateRegistry()` rejects duplicate tool IDs and slugs, duplicate category IDs and slugs, malformed slugs, invalid categories, invalid lifecycle states, broken related-tool references, and active tool canonicals that are not root-level.

## Routing policy

- Primary tools use root URLs such as `/percentage-calculator`.
- `/tools` is only the public directory.
- `/categories/[slug]` uses `generateStaticParams`, validated metadata, and `notFound()` for unknown categories.
- Planned tools have no route directories.
- Only categories containing an active tool are included in the sitemap. Empty roadmap categories may remain visible in the directory but are not promoted as indexable discovery destinations.

Root URLs override the historical `/tools/[slug]` preference because `AGENTS.md` explicitly prohibits duplicate or nested indexable tool routes.

## Query API

The registry exposes lookup by ID or slug, active/planned/deprecated filters, category filters, accent-tolerant search, safe related tools, published categories, and integrity validation.
