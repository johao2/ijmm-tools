# Production Readiness — IJMM Tools

**Owner:** IJMM System
**Phase:** 10 — Production Readiness
**Candidate version:** 0.1.0

## Completed locally

- Strict TypeScript, automated tests, optimized Next.js build, and dependency audit pass.
- Homepage, directory, categories, Percentage Calculator, legal pages, custom 404, error recovery, `robots.txt`, and `sitemap.xml` are implemented.
- Canonical metadata uses `NEXT_PUBLIC_SITE_URL` with `https://ijmmtools.com` as the documented production value.
- Security headers are defined in both Next.js and Vercel configuration.
- No database, authentication, payment, advertising, analytics vendor, or external credentials are required.
- The Percentage Calculator processes values locally and analytics strips user content.

## Deployment state

The repository contains `vercel.json` and a CI workflow, but this environment has no Vercel CLI or deployment credential available. No external deployment was attempted, no account was created, and no unrelated IJMM project was touched.

## Release state

`v1.0.0` is intentionally not tagged until the production deployment is completed and the live domain is verified. The current package version remains `0.1.0` as a production candidate.

## Required live checks

After an authorized deployment, verify HTTP status, canonical origin, metadata, headers, and visible content for:

- `/`
- `/tools`
- `/percentage-calculator`
- `/robots.txt`
- `/sitemap.xml`
- an unknown route returning the custom 404

Only after these checks pass should the repository be tagged `v1.0.0`.
