# P2-06a — Alert icons per colour + Error → Critical (duplicate)

> 2026-11-09 · Approved by Mike ("Yea") after he asked to use alert icons from the MAKER Icon library. This is part 1 of P2-06 (Alert). The rest of P2-06 (TEXT properties, gap binding, optional Warning) is still pending. Target: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original was not touched and nothing was published.

## Correction to P2-04

`Featured icon` is **from the MAKER Icon library** (component set key `845127259cdd…`), not from another library as P2-04 first said. Its inner `Icon wrapper` is not exposed by that library, so consumers still can't swap it from an Alert instance. But the glyph **can** be set inside the Alert main components, which is what this change does.

## Change (VERIFIED)

| Alert `Color` | Featured icon colour | Glyph (MAKER Icon library) | Before |
|---|---|---|---|
| Default | Gray | `info` | Gray · `squircle-dashed` |
| Brand | Brand | `circle-alert` | Brand · `squircle-dashed` |
| Error | **Critical** (fixes the known defect) | `octagon-alert` | **Brand** · `squircle-dashed` |
| Success | Success | `circle-check` | Success · `squircle-dashed` |

- **Writes** (`scripts/components/alert-icons.js`):
  - 4 library icons imported by key;
  - 1 `setProperties` (Featured icon Color on `Color=Error`);
  - 4 Icon-swap `setProperties` on the nested Icon wrapper.
  - All are overrides inside the Alert main components. The Icon library itself is not edited. Result: `write-result.json` (`allOk`).
- **Unused for now:** `triangle-alert` is reserved for an optional `Color=Warning` variant (P2-06 decision).

## Verification

| Check | Result |
|---|---|
| Glyph + colour read back per variant | 4/4 as in the table (`glyphs-after.json`) |
| E1 hash vs the P2-04 baseline | Only `Alert › Color=Error` changed (its Featured icon variant changed). Button, Input field, Modal sets unchanged; fingerprint unchanged |
| Screenshot (`alert-before.png` → `alert-after.png`) | Error is now red with an octagon; each colour has a meaningful icon |
| Alert instances | 0 in the file, so nothing else affected |

## Findings

1. **Checker limit (E1):** glyph swaps *inside* a nested instance don't change the variant hash. The hash records each nested instance's own main component, not overrides within it. That's why 3 of the 4 glyph changes were confirmed by a direct read instead. Possible enhancement **E4**: record nested-instance property/override values in the variant hash.
2. **Default (Gray) Featured icon draws a purple glyph** (`fg-brand-secondary_alt`, from the Icon library). Gray glyph contrast on its container is 2.56:1 (`pilot-alert.md` §2). Fixing that belongs to the Icon library. DECISION: report it to that library's owner, or use a local icon container later.

3. **Where the icon colours come from (VERIFIED, read-only, both files).**
   - The Featured icon's background and glyph are bound to DS colour tokens: `bg-tertiary` / `fg-brand-secondary_alt`, `bg-brand-primary_subtle` / `fg-brand-primary (600)`, `bg-error-primary` / `fg-error-primary`, `bg-success-secondary` / `fg-success-secondary`.
   - In the duplicate these are **remote** variables, coming through the MAKER Icon library. Their keys match the **original MAKER DS v2** variables (7 of 8; `fg-success-secondary` has no local counterpart in the original today). They are **not** the duplicate's own variables (different keys).
   - **Consequence:** token changes made in the duplicate (e.g. P2-01) do **not** reach these icons. They follow the published original until the Icon library is re-linked to the new DS library after it is published. That's a step for the Icon library, owned by Mike, and part of the publish/cut-over plan.
   - Changing which token an icon colour uses (e.g. Gray glyph `fg-brand-secondary_alt` → a gray token) is likewise an edit in the Icon library, not in this file.

## Subscription status

Tokens Studio Free (assumed; not used) · Unblocked · no paid features · no upgrade.
