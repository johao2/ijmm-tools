# Monetization & Advertising Strategy — IJMM Tools

**Owner:** IJMM System
**Phase:** 12 — Monetization foundation

## Current status

The monetization architecture is implemented but fail-closed. No advertising script or slot is rendered until every required production setting is intentionally configured.

Activation requires:

1. An approved Google AdSense account and valid `ca-pub-*` client identifier.
2. Valid ad-unit identifiers for the selected placements.
3. A Google-certified consent platform configured for regions where it is required.
4. `NEXT_PUBLIC_ADSENSE_ENABLED=true` and `NEXT_PUBLIC_ADSENSE_CONSENT_READY=true`.

Until those gates are satisfied, IJMM Tools behaves exactly as an ad-free site.

## Architecture

- `lib/ads/config.ts` validates all public configuration and exposes a single fail-closed boundary.
- `components/ads/AdSenseScript.tsx` owns the only advertising script integration.
- `components/ads/AdPlaceholder.tsx` owns every ad unit, reserves stable space only while active, and isolates provider failures from tool interactions.
- `/ads.txt` is generated only when a valid publisher identifier exists.
- Tool inputs, results, copied content, and search terms are never included in advertising calls.

## Approved placements

- `middle`: after the complete interactive tool, never inside the form or result controls.
- `bottom`: after educational content and FAQs.
- `sidebar`: desktop-only future placement when a tool layout supports it without compression.
- `top`: reserved for future testing and disabled by default.

IJMM Tools does not initially enable vignette ads, forced delays, misleading ad labels, or ad-intent links inserted into educational text.

## Operational activation checklist

1. Make the final public domain operational and verify ownership.
2. Apply for AdSense using the owner-controlled Google account.
3. Configure Google's Privacy & Messaging consent solution or another Google-certified CMP.
4. Create responsive ad units and record their slot IDs in Vercel.
5. Set the public configuration flags only after consent is ready.
6. Redeploy and verify `/ads.txt`, reserved space, mobile layout, and calculator isolation.
7. Review revenue, viewability, Core Web Vitals, and user retention before adding placements.

Account identity, tax, address, and payout verification must be completed by the legal account owner and are never stored in the repository.
