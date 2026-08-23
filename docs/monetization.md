# Monetization & Advertising Strategy — IJMM TOOLS

**Owner:** IJMM System
**Product:** IJMM Tools

---

## 1. Current Status

Monetization and advertising are deferred. IJMM Tools currently loads no ad scripts, reserves no public ad slots, and sends no user calculation data to advertising providers.

The possible future model is:

```text
Free Online Tool ──> Organic Traffic (SEO/AEO/GEO) ──> Ad Impression ──> Revenue ──> R&D New Tools
```

---

## 2. Future Advertising Architecture

If advertising is explicitly approved after real traffic exists:
1. **Encapsulated Placement:** Advertising must be managed exclusively through a future `<AdPlaceholder placement="..." />` component.
2. **Fixed Layout Boundaries:** Ad slots reserve height and width before script injection to prevent Cumulative Layout Shift (CLS).
3. **Strategic Placements:**
   - `top`: Banner placed above main tool interaction zone.
   - `middle`: Placed between calculation UI and explanatory content.
   - `bottom`: Placed below FAQs and related tools.
   - `sidebar`: Placed alongside content on desktop viewports.

---

## 3. UX Preservation Rules

- Ads must never block tool input fields or calculation buttons.
- No intrusive popups, interstitials, or forced delays.
- Clean fallback rendering when ads are disabled or unavailable.
- No implementation begins without a provider decision, privacy review, and separate approval.
