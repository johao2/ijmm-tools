# Phase 11 — Brand and ecosystem integration

This additional phase aligns IJMM Tools with the main IJMM System brand and guarantees a clear return path to the corporate portal.

## Official identity

- The image at `public/Logo_IJMM_SYSTEM.png` is an exact copy of the official corporate asset.
- The logo links to the main IJMM System website; the adjacent `IJMM Tools` wordmark links to the tools homepage.
- The logo is reused consistently in the header, mobile drawer, footer, and homepage product badge.

## Navigation contract

- Corporate portal: `https://ijmmsystem.com`.
- Override for other environments: `NEXT_PUBLIC_CORPORATE_SITE_URL`.

## Browser and device icons

All routes inherit the official IJMM System emblem through Next.js file metadata:

- `app/favicon.ico`: multi-resolution browser fallback (16–256 px).
- `app/icon.png`: 512 px modern browser icon.
- `app/apple-icon.png`: 180 px Apple Touch Icon.

These assets are derived from `public/Logo_IJMM_SYSTEM.png`. The emblem is used without the wordmark because browser tabs render at very small sizes; colors and proportions remain those of the official source.
- The global header and footer are rendered by the root layout, so visitors can return to IJMM System whether they arrive at the IJMM Tools homepage, directory, or directly at a tool URL.
- Links use the same browser tab to preserve a natural return flow between products.

## Scope

This phase does not add a new tool or activate monetization. It is a brand and cross-product navigation addition to the completed MVP.
