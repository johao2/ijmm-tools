# Password Generator — Engineering Specification

**Owner:** IJMM System  
**Product:** IJMM Tools  
**Public route:** `/password-generator`

## Scope

The tool generates random passwords locally with a configurable length of 4–128 characters. Users can include lowercase letters, uppercase letters, numbers, and symbols, and optionally exclude visually ambiguous characters.

## Security architecture

- `lib/tools/password.ts` owns validation, character pools, secure selection, shuffling, and strength estimation.
- Production randomness comes exclusively from the browser Web Crypto API through `crypto.getRandomValues`.
- Character selection uses rejection sampling before modulo reduction to prevent modulo bias.
- Every enabled character group is guaranteed to appear at least once.
- There is no `Math.random()` fallback. If cryptographic randomness is unavailable, generation fails closed with a user-facing error.
- Passwords never leave the browser and are never included in analytics events.

The strength indicator is a mathematical estimate based on length and available character-set size. It is guidance rather than a guarantee about account or service security.

## Architecture

- `components/tools/password-generator/PasswordGeneratorTool.tsx` manages interaction and presentation.
- `components/ui/Checkbox.tsx` and `components/ui/RangeInput.tsx` provide reusable accessible controls.
- `app/password-generator/page.tsx` provides the root route, metadata, structured data, visible guidance, FAQs, and related links.
- `data/tools.ts` is the publication source of truth.

## Result contract

A successful result contains the generated password, character-pool size, estimated entropy, and strength classification. Failures use stable codes:

- `INVALID_LENGTH`
- `NO_CHARACTER_SET`
- `RANDOM_UNAVAILABLE`

## Verification

Tests cover every character group individually, combined group guarantees, exact length, ambiguous-character exclusion, invalid lengths, empty configuration, failing random sources, strength boundaries, and input immutability. A deterministic source is injected only during tests; production always uses Web Crypto.
