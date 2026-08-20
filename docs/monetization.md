# Monetization & Advertising Strategy — IJMM TOOLS

**Owner:** IJMM SYSTEM  
**Product:** IJMM Tools

---

## 1. Monetization Model

IJMM Tools operates on an organic growth ad-supported model:

```text
Free Online Tool ──> Organic Traffic (SEO/AEO/GEO) ──> Ad Impression ──> Revenue ──> R&D New Tools
```

---

## 2. Advertising Architecture (`AdPlaceholder`)

To ensure ads do not degrade Core Web Vitals or user experience:
1. **Encapsulated Placement:** Advertising is managed exclusively via the `<AdPlaceholder placement="..." />` component.
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
