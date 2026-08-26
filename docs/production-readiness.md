# Production Readiness — IJMM Tools

**Owner:** IJMM System
**Phase:** 10 — Production Readiness
**Candidate version:** 0.1.0

## Completed locally

- Strict TypeScript, automated tests, optimized Next.js build, and dependency audit pass.
- Homepage, directory, categories, Percentage Calculator, JSON Formatter, Password Generator, QR Code Generator, Ecuador VAT Calculator, Unit Converter, legal pages, custom 404, error recovery, `robots.txt`, and `sitemap.xml` are implemented.
- Canonical metadata uses `NEXT_PUBLIC_SITE_URL` with `https://tools.ijmmsystem.com` as the verified production value.
- Security headers are defined in both Next.js and Vercel configuration.
- No database, authentication, payment, or external credentials are required for the core tools. Advertising remains disabled unless all validated AdSense and consent environment gates are supplied.
- All active tools process values locally, generated passwords never leave the browser, and analytics strips user content.
- Phase 12 provides fail-closed advertising components, `/ads.txt`, and legal disclosures without activating a provider prematurely.
- Official IJMM System favicon, modern browser icon, and Apple Touch Icon are generated from the same corporate logo and inherited by every route.

## Deployment state

The repository is connected to Vercel through GitHub and deploys from `main`. The official production domain is `https://tools.ijmmsystem.com`; `https://ijmm-tools.vercel.app` remains a platform alias.

## Release state

`v1.0.0` is intentionally not tagged until the production deployment is completed and the live domain is verified. The current package version remains `0.1.0` as a production candidate.

## Required live checks

After an authorized deployment, verify HTTP status, canonical origin, metadata, headers, and visible content for:

- `/`
- `/tools`
- `/percentage-calculator`
- `/json-formatter`
- `/password-generator`
- `/qr-code-generator`
- `/calculadora-iva-ecuador`
- `/unit-converter`
- `/robots.txt`
- `/sitemap.xml`
- an unknown route returning the custom 404

Only after these checks pass should the repository be tagged `v1.0.0`.
