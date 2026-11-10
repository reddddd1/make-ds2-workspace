# Dark-mode visual validation (temporary regression frame) — result

> 2026-11-09, 20:57–21:00 UTC, duplicate `PpnTy1pkB2FTZFq6i6seSy` only. Decision 3, approved by Mike; scratch page chosen by Mike: a new dedicated page.
>
> **Not done:** no master component modified, nothing published, no product screen created. Only the temporary frame was removed; no other content was deleted.

## Result: **PASS for the naming pilot**, plus **1 pre-existing discrepancy** (Alert Featured icon stays Light)

## 1. What was written and removed

| Step | Node | Detail |
|---|---|---|
| Create page | `23518:2` `🧪 Regression scratch (temporary)` | Last page in the file (39 → 40 pages). **Kept empty** for future regression runs, as agreed; removing it needs your OK |
| Create frame | `23518:3` `TEMP — Dark-mode regression test (naming follow-up 2026-11-09) — safe to delete` | `1. Color modes` explicit mode = **Dark mode**; fill bound to `Colors/Background/bg-primary` (resolves to `#000000` in Dark) |
| Place instances | 19 linked instances of existing main components | Button ×8 (Primary Default/Hover/Pressed/Focused/Disabled, Primary_alt, Secondary, Link brand); Input field ×6 (lg Placeholder/Filled/Focused/Disabled, Destructive, Password); Alert ×4 (Default, Brand, Error, Success); Modal ×1 |
| Layout fix (same frame only) | the frame's 4 row frames | Hug height, no clipping (the first screenshot clipped the rows) |
| **Remove** | `23518:3` only | Script refused unless ID, name prefix, page, 4 rows and 19 linked local instances all matched. Fresh read afterwards: the frame and all 19 instances are gone; the scratch page has 0 children; page list otherwise unchanged |

Scripts: `scripts/regression/dark-mode-frame.js`, `scripts/regression/dark-mode-frame-remove.js`.

## 2. Bindings and component relationships (read-only verification)

| Check | Result |
|---|---|
| Frame mode | `1. Color modes` = Dark mode (`5353:0`) ✓ |
| Linkage | 19/19 instances linked to the expected **local** main component (no remote, orphan or detached) ✓ |
| Structure (R-FIGMA-01) | 19/19 instance layer trees identical to their main component ✓ |
| Bindings resolved in the frame vs expected Dark value (variable chain read in Dark mode) | **731 / 736 equal**. 136 of these bindings have different Light and Dark values, so the test does exercise Dark |
| Bindings to the 11 renamed variables | **53, all equal to their expected Dark value**: `font/size/base` 24 · `color/border/primary` 13 · `color/text/brand-primary` 7 · `color/bg/brand-primary` 3 · `color/bg/brand-primary-hover` 2 · `color/focus-ring/primary` 2 · `color/text/error-primary` 1 · `font/weight/semibold` 1 |
| Main components after the test (`collect-variants` E1 vs the 20:39 baseline) | **PASS 19/19**: 204/204 variant hashes, property definitions, file fingerprint (682 variables, 393/65/25/8 styles) unchanged ✓ |

## 3. Visual evidence

`reports/naming-followup/dark-mode/dark-frame.png` (1480 × 1640):
- Buttons, Input fields (default, focused ring, error, disabled, password), Alerts and the Modal render with Dark surfaces, borders and text.
- Brand, focus and error colours use their Dark values.

## 4. Discrepancy (pre-existing, not caused by the rename)

**The 4 Alert Featured icons stay Light in Dark mode** (light circle behind the glyph; 5 of the 736 bindings).

- **Cause:** the Featured icon is a **remote** component from the MAKER Icon library. Its colour variables are remote variables in other libraries' `1. Color modes` collections (`VariableCollectionId:88d42a78…/8790:935` for Default, Brand and Error; `…24ea2d5b…/8790:935` for the Success stroke). A frame's Dark mode only applies to collections it sets a mode for; this frame sets only the duplicate's local collection.
- **Affected bindings:** fill of `bg-tertiary` (Default), `bg-error-primary` (Error) and `bg-success-secondary` (Success); stroke of `fg-brand-primary (600)` (Brand) and `fg-success-secondary` (Success). The other Featured-icon bindings have identical Light and Dark values.
- **Not related to the pilot:** none of these is a renamed variable or a local variable.
- **Relation to known items:** this is the reminder **S-2 (re-link the Icon library to the new DS)** in visible form. It also affects every consumer screen in Dark mode.
- **Options (none executed):**
  - (a) Re-link or republish the MAKER Icon library against the new DS, so Featured icons use the DS's own collection (S-2).
  - (b) Rebind the Alert's Featured icon colours to local variables in the duplicate (component change, separate approval).
  - (c) As a stop-gap, consumer frames also set Dark mode for the remote collection(s).

Evidence: `reports/naming-followup/dark-mode/` (`write-result-create.json`, `verify-bindings.json`, `featured-icon-remote-variables.json`, `write-result-remove.json`, `verify-removed.json`, `variants-after-dark-test.json`, `pass-variants-after-dark-test.md`, `dark-frame.png`).

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
