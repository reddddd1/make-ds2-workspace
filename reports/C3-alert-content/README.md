# C3 — Alert content properties (duplicate)

> 2026-11-10. Approved by Mike ("Start C3").
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only.
> - **Not changed:** no token or variable change, the original library (untouched); nothing was published.
> - **Script:** `scripts/components/alert-content-properties.js`. One atomic call; preconditions checked first; the in-call guard compares all texts, visibility, the gap and sizes before vs after.

## Result: **PASS**

| Change | Detail |
|---|---|
| `Title` | New TEXT property (default `{Title}`), bound to the title in all 4 variants (Brand, Default, Error, Success) |
| `Description` | New TEXT property (default = the current supporting text), bound to the supporting text in all 4 variants. The existing `Supporting text` show/hide toggle is kept on the same layer |
| Content gap | `Content/wrapper` gap (12 px, unbound) linked to `3. Spacing › spacing-lg` (12 px), matching its sibling frames |

Alert properties are now: `Title`, `Description`, `Supporting text`, `Actions`, `Show icon`, `Show close?`, `Color`.

## Validation

| Check | Result |
|---|---|
| R-PAPER-01 (scope: Alert) vs the post-C2 baseline | **PASS 23/23**: exactly the 4 Alert variants changed; Button, Input field, Modal, `_Modal header`, `_Modal actions`, Helper text unchanged; fingerprint unchanged (`r-paper-01.md`) |
| Pixel diff, Light | **Pixel-identical** (296,020 px, 0 different) |
| Existing instances | **0** Alert instances in the file, so none affected |

## Not done

- A `Warning` colour variant (optional; only if wanted).
- The Featured-icon Dark-mode issue (S-2, deferred).

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
