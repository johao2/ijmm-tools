# Quality Hardening — IJMM Tools

**Owner:** IJMM System  
**Phase:** 9 — Quality Hardening

## Functional verification

- Percentage of value: `20% of 150 = 30`.
- Signed change: `120 → 100 = -16.6667%`.
- Division by zero produces an accessible Spanish error instead of a non-finite result.
- Mode changes, form submission, reset, copy affordance, and mobile navigation remain available.

## Responsive verification

The calculator was inspected at 320×720, 375×812, 768×900, 1024×900, and 1440×1000. No horizontal document overflow was present at any checked width.

## Accessibility

- One `h1`, `main`, and `footer` landmark per checked page.
- Every visible form label resolves to a control.
- Buttons have accessible names and decorative icons are hidden from assistive technology.
- Mobile navigation opens semantically and closes with Escape.
- Focus-visible styling is present on interactive controls.
- Nested button/link markup was removed.
- Reduced-motion behavior is defined globally.

## Performance and architecture

- Only five interactive branches are Client Components.
- Domain calculations, registry, SEO metadata, layout, and content remain server-compatible or framework-independent.
- Custom inline SVG controls were replaced with tree-shaken `lucide-react` icons.
- No new dependency was introduced.

## Security and privacy

- JSON-LD serialization escapes HTML-significant characters.
- The obsolete `X-XSS-Protection` header was removed; modern content-type, framing, referrer, and permissions headers remain.
- No inline style attributes, credentials, private keys, or dangerous user-authored HTML were found.
- Analytics payloads use a runtime allowlist and exclude user-entered content.
- Next.js agent-file generation is disabled so repository governance remains stable and builds leave tracked instructions untouched.

## Known environment constraints

The local `node_modules` directory contains two extraneous optional image-runtime packages. They are not declared or tracked and a clean `npm ci` removes them. Registry-based vulnerability auditing depends on network availability and must be rerun in CI or another connected environment.
