# Analytics & Privacy — IJMM Tools

**Owner:** IJMM System  
**Phase:** 8 — Analytics + Privacy

## Principles

Analytics measures aggregate product behavior without collecting values entered into tools, calculated results, copied content, or search text. Calculations remain local to the browser.

## Architecture

`lib/analytics/events.ts` exposes a vendor-independent dispatcher and provider registration boundary. No analytics SDK or external provider is installed. UI code calls `trackEvent()` and never imports a vendor.

## Allowed payload

Only the following non-content fields can leave the dispatcher:

- `toolId`
- `categoryId`
- `errorCode`
- `mode`
- `resultCount`
- dispatcher-generated `timestamp`

The dispatcher builds a new payload from this allowlist, so undeclared runtime properties are removed even if a caller bypasses TypeScript.

## Events

Supported events include tool views, starts, completions and errors; result copy/download/share; aggregate searches; and category views. Search events include only the number of matching tools, never the query.

## Provider policy

A provider may be added only after an explicit product and privacy decision. It must receive the existing allowlisted payload without extending UI components with vendor-specific code. Provider failures are isolated and cannot interrupt a tool calculation.
