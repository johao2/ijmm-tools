# Percentage Calculator — IJMM Tools

**Owner:** IJMM System  
**Phase:** 6 — Percentage Calculator

## Public route

`/percentage-calculator` is the first active tool and the only tool route currently published.

## Domain architecture

All formulas and validation live in `lib/tools/percentage.ts`. The module is framework-independent, side-effect-free, rejects empty/non-finite values, protects division by zero, controls displayed precision, and preserves large finite values without overflowing during rounding.

## Supported calculations

1. X percent of Y.
2. X as a percentage of Y.
3. Signed percentage change from an original value to a new value.
4. Explicit percentage decrease.
5. Symmetric percentage difference.
6. Original value before an increase or decrease.
7. Discount amount and final price.

The signed change operation covers both increases and decreases. The additional modes are retained because they are already implemented and use the same tested domain engine.

## UI behavior

The client component owns only form state, mode selection, accessible validation feedback, reset behavior, and result presentation. It delegates calculations to the pure module and uses the shared `Input`, `Select`, `Button`, `Alert`, and `ToolResult` components.

## Edge cases

Automated tests cover standard values, decimals, negatives where mathematically valid, empty strings, whitespace-only strings, `NaN`, infinities, zero division, floating-point precision, and large finite values.
