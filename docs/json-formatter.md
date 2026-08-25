# JSON Formatter — Engineering Specification

**Owner:** IJMM System  
**Product:** IJMM Tools  
**Public route:** `/json-formatter`

## Scope

The tool formats, validates, and minifies standards-compliant JSON entirely in the browser. It accepts every valid JSON root type: object, array, string, number, boolean, and `null`.

## Architecture

- `lib/tools/json.ts` contains the pure parsing, validation, serialization, size, type, and error-location logic.
- `components/tools/json-formatter/JsonFormatterTool.tsx` handles controlled input, presentation, copy, download, and allowlisted analytics events.
- `app/json-formatter/page.tsx` provides the root-level route, metadata, visible educational content, breadcrumbs, and matching structured data.
- `components/ui/Textarea.tsx` is the shared accessible multiline input.

No content entered into the tool is sent to a backend, analytics provider, or advertising component.

## Safety rules

- Maximum input length: 5,000,000 characters to limit main-thread pressure.
- A leading byte-order mark is accepted.
- Integers outside JavaScript's safe integer range are rejected before parsing to prevent silent precision loss. They should be represented as quoted strings.
- Syntax errors return a stable code and include line, column, and excerpt when the browser runtime exposes a usable location.
- Downloads use an ephemeral browser Blob URL and do not upload the result.

## Result contract

Successful operations return the operation, output, UTF-8 byte count, character count, and root value type. Failures return one of:

- `EMPTY_INPUT`
- `INVALID_JSON`
- `INPUT_TOO_LARGE`
- `UNSAFE_INTEGER`
- `PROCESSING_ERROR`

## Verification

Unit tests cover formatting with each indentation mode, minification, all root types, empty and invalid input, byte-order marks, unsafe integers, numeric variants, Unicode byte counts, oversized input, and registry publication.
