# IJMM Tools

**Owner:** IJMM System
**Product:** IJMM Tools
**Version:** 0.1.0 (production candidate)

Fast, simple, and privacy-friendly digital utilities that work directly in your browser.

---

## Development & Local Setup

### Prerequisites
- **Node.js:** `v24.x` (or LTS `v20+`)
- **npm:** `v10+` / `v11+`

### Installation
```bash
npm ci
```

### Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Quality & Release Verification

Run the unified verification pipeline before submitting Pull Requests:

```bash
npm run verify
```

This executes in deterministic order:
1. `npm run typecheck` (`tsc --noEmit`)
2. `npm test` (`vitest run` — 62/62 unit tests)
3. `npm run build` (`next build` — 21 static pre-rendered routes)
4. `npm run audit` (`npm audit` — 0 vulnerabilities)

---

## Individual Commands

- `npm run dev`: Starts Next.js development server with Turbopack.
- `npm run build`: Production build.
- `npm run start`: Starts production server.
- `npm test`: Runs Vitest test suite.
- `npm run typecheck`: Runs TypeScript type check without emitting files.
- `npm run audit`: Checks dependencies for security vulnerabilities.
- `npm run verify`: Full local CI validation pipeline.

---

## Architecture & Deployment Documentation

Detailed documentation is available in `/docs/`:
- [`docs/architecture.md`](docs/architecture.md): Core system design & layout rules.
- [`docs/design-system.md`](docs/design-system.md): Visual tokens, reusable components & tool UI foundation.
- [`docs/tool-engine.md`](docs/tool-engine.md): Typed core contracts for tool modules and execution.
- [`docs/tool-registry.md`](docs/tool-registry.md): Registry lifecycle, integrity checks, categories & routing rules.
- [`docs/percentage-calculator.md`](docs/percentage-calculator.md): Percentage formulas, UI boundaries & tested edge cases.
- [`docs/analytics.md`](docs/analytics.md): Provider-independent events and privacy allowlist.
- [`docs/quality.md`](docs/quality.md): Functional, responsive, accessibility & security audit.
- [`docs/production-readiness.md`](docs/production-readiness.md): MVP release status, verified routes & remaining external steps.
- [`docs/brand-integration.md`](docs/brand-integration.md): Official logo source and cross-product navigation contract.
- [`docs/development.md`](docs/development.md): Developer guide & Tool Registry patterns.
- [`docs/seo.md`](docs/seo.md): Technical SEO, AEO, and GEO strategy.
- [`docs/deployment.md`](docs/deployment.md): CI/CD, production hardening & Edge deployment guide.
- [`docs/monetization.md`](docs/monetization.md): UX-preserving monetization architecture.
- [`docs/roadmap.md`](docs/roadmap.md): Product release roadmap.
