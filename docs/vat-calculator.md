# Calculadora de IVA Ecuador

**Owner:** IJMM System  
**Route:** `/calculadora-iva-ecuador`  
**Last regulatory review:** August 25, 2026

## Purpose

The calculator supports two operations entirely in the browser:

1. Add a VAT rate to a subtotal.
2. Extract the taxable subtotal and included VAT from a final total.

The default general rate is 15%. Selectable 0%, 5%, and temporary 8% options include visible applicability warnings, and a custom rate supports valid exceptional calculations.

## Formulas

```text
Add VAT:
VAT = subtotal × rate / 100
total = subtotal + VAT

Extract VAT:
subtotal = total / (1 + rate / 100)
VAT = total − subtotal
```

All monetary inputs are parsed as decimal strings, calculations use integer cents and exact integer multiplication, and final monetary values are rounded to the nearest cent. This avoids binary floating-point drift.

## Official sources

- SRI VAT overview: <https://www.sri.gob.ec/impuesto-al-valor-agregado-iva>
- SRI Circular NAC-DGECCGC26-00000002 confirming the current 15% rate: <https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar?id=ee088145-61f4-4926-8f32-646ec8369f79&nombre=NAC-DGECCGC26-00000002.pdf>
- SRI temporary tourism reduction notice: <https://www.sri.gob.ec/detalle-noticias?idnoticia=1296&marquesina=1>

The page clearly states that results are informational and that rate applicability depends on the transaction and date.

## Privacy and analytics

Amounts remain local to the browser. Analytics receives only the tool ID, category, mode, and error code; it never receives the amount or selected rate.

## Tests

Unit coverage includes add/extract operations, all preset rates, custom decimal rates, cent rounding, comma decimal input, invalid and empty values, negative amounts, oversized amounts, and formatting.
