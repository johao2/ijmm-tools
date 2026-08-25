# Production Deployment & Hardening Guide — IJMM TOOLS

**Owner:** IJMM System
**Product:** IJMM Tools
**Version:** 0.1.0 production candidate

---

## 1. Overview & Deployment Strategy

IJMM Tools is architected for static pre-rendering (SSG/Static Export ready) and Edge runtime execution.
- **Primary Hosting Target:** Vercel / Cloudflare Pages / AWS Amplify / Standalone Node.js server.
- **State Strategy:** Pure client-side computation with Zero backend database dependencies.

---

## 2. Prerequisites & Environment Setup

- **Node.js:** `v24.x` (LTS `v20+` compatible)
- **npm:** `v10+` / `v11+`
- **Installation (Reproducible):**
  ```bash
  npm ci
  ```

---

## 3. Environment Variables (`.env.example`)

Configured variables:
- `NEXT_PUBLIC_SITE_URL`: Canonical public origin. Current production value: `https://tools.ijmmsystem.com`.
- `NEXT_PUBLIC_CORPORATE_SITE_URL`: Main IJMM System portal. Current production value: `https://ijmmsystem.com`.
- `NODE_ENV`: Runtime mode (`production`).

---

## 4. Local Release Validation (`npm run verify`)

Before deploying to staging or production, execute the unified verification pipeline:

```bash
npm run verify
```

The `verify` script deterministically executes:
1. `npm run typecheck` (`tsc --noEmit` — 0 errors)
2. `npm test` (`vitest run` — 82/82 unit tests passed, including registry, tool domains, analytics, advertising configuration, and structured-data safety)
3. `npm run build` (`next build` — 23 production routes compiled via Turbopack)
4. `npm run audit` (`npm audit` — 0 vulnerabilities)

---

## 5. CI/CD Pipeline (GitHub Actions)

Located at `.github/workflows/ci.yml`.
- **Triggers:** `push` to `master`/`main`, `pull_request` to `master`/`main`.
- **Environment:** `ubuntu-latest`, Node `24.x`.
- **Cache:** `cache: 'npm'` (npm cache enabled for fast, reproducible builds).
- **Execution Step:** `npm ci && npm run verify`.

---

## 6. Security Hardening

- **Headers (`next.config.ts`):**
  - `poweredByHeader: false` (removes `X-Powered-By` header).
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- **Secrets Management:** `.gitignore` ignores `.env*` (except `.env.example`). Zero credentials or private keys in source code.

---

## 7. Windows / OneDrive Technical Note

- **Known Behavior:** On Windows environments with active OneDrive syncing, rebuilding `.next` consecutively can cause temporary file lock warnings (`EPERM: operation not permitted, unlink`).
- **Solution:** Execute `Remove-Item -Recurse -Force .next` prior to local rebuilds or run `npm run verify`.

---

## 8. Prohibited Actions (Strict Governance)

1. **DO NOT** commit real production API keys or tokens into Git.
2. **DO NOT** bypass `npm run verify` before merging Pull Requests.
3. **DO NOT** install heavy third-party UI suites or analytics trackers.
4. **DO NOT** expose public indexable routes for `status: "planned"` tools.
