# Unit Converter

**Owner:** IJMM System  
**Route:** `/unit-converter`

## Scope

The converter handles five measurement categories entirely in the browser:

- Length
- Weight and mass
- Temperature
- Area
- Volume

Each category uses a typed catalog of unit IDs, labels, symbols, and conversion factors. Metric and imperial/US customary measures are kept within the same category to prevent invalid cross-dimension conversions.

## Domain architecture

`lib/tools/unit-converter.ts` owns all parsing, validation, conversion factors, temperature formulas, result formatting, and catalog definitions. The React component manages only controlled inputs, selection state, accessibility, and privacy-safe analytics events.

Linear categories convert through one base unit:

```text
base value = input × source factor
result = base value ÷ destination factor
```

Temperature uses explicit Celsius, Fahrenheit, and Kelvin formulas because it requires both scale and offset transformations. Values below absolute zero are rejected.

## Precision

Internationally defined factors are stored with their required precision. Results retain full JavaScript numeric precision internally and are displayed with up to ten decimal places. The tool accepts a period or comma as the decimal separator and normalizes negative zero.

## Privacy and analytics

Conversions never require a server request. Analytics receives only the tool ID and selected category; input and output values are excluded.

## Test coverage

Automated tests cover:

- Catalog integrity and unique unit IDs.
- Metric, imperial, and US customary conversions.
- Celsius, Fahrenheit, Kelvin, and absolute zero.
- Zero, negative values, comma decimals, and same-unit conversions.
- Empty, malformed, incompatible, overflow, and unknown inputs.
- Controlled result formatting.
