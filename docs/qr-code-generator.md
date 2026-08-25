# QR Code Generator — Engineering Specification

**Owner:** IJMM System  
**Product:** IJMM Tools  
**Public route:** `/qr-code-generator`

## Scope

The tool creates QR codes for HTTP(S) links, plain text, and Wi-Fi network configuration. Users can select error correction, choose high-contrast colors, preview the result, and download a PNG.

## Architecture

- `lib/tools/qr.ts` owns payload validation, Wi-Fi escaping, color contrast, matrix generation, capacity errors, and stable result contracts.
- `components/tools/qr-code-generator/QrCodeGeneratorTool.tsx` owns controlled inputs, Canvas rendering, PNG download, and allowlisted analytics events.
- `app/qr-code-generator/page.tsx` owns the root route, metadata, structured data, visible guidance, FAQs, and related links.
- `data/tools.ts` remains the publication source of truth.

User content is encoded and rendered locally. URLs, text, SSIDs, and Wi-Fi passwords are never sent to IJMM Tools or included in analytics.

## Dependency decision

`qrcode-generator@2.0.4` is used only to encode a standards-compatible QR matrix. Browsers do not provide a native QR encoding API, and implementing QR versions, masks, and Reed–Solomon correction manually would create unacceptable interoperability risk.

- Transitive dependencies: 0.
- Published ESM module: 51,907 bytes raw / 11,113 bytes gzip.
- Final route-specific production chunk, including the complete QR interface: 42,469 bytes raw / 14,197 bytes gzip.
- Loading scope: QR route only; other tool routes do not import the encoder.

Canvas and browser download APIs handle drawing and PNG output without another package.

## Safety rules

- Content limit: 2,000 characters, with additional capacity enforcement by QR error-correction level.
- URL mode accepts only complete HTTP and HTTPS addresses.
- Wi-Fi delimiters and escape characters are encoded according to the common Wi-Fi QR payload format.
- Secured Wi-Fi modes require a password; open networks omit it.
- The dark color must be darker than the background with a contrast ratio of at least 3:1.
- A four-module quiet zone is always preserved.

## Verification

Tests cover text, URL protocols, Wi-Fi escaping, open and protected networks, length limits, capacity overflow, every error-correction level, square boolean matrices, high-contrast colors, and unsafe color combinations.
