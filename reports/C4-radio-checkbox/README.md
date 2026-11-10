# C4 — Radio / Checkbox text properties (duplicate)

> 2026-11-10. Approved by Mike ("Start C4").
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only.
> - **Not changed:** no token or variable, the original library (untouched); nothing was published.
> - **Script:** `scripts/components/radio-checkbox-text-properties.js`. One atomic call; preconditions first; the in-call guard compared all 84 variants and all 27 existing instances.

## Result: **PASS**

| Change | Detail |
|---|---|
| `Label` | New TEXT property (default `{Text main}`), bound to the label in the 32 `Text=True` variants (Checkbox and Radio; sm and md; every state; checked and unchecked) |
| `Description` | New TEXT property (default `{Text secondary}`), bound to the supporting text in the same 32. The existing `Supporting text` show/hide toggle is kept |

Named `Label` / `Description` because a variant property is already called `Text` (True/False).

**For the login screens:** the "Remember me" checkbox text is now set from the properties panel.

## Validation

| Check | Result |
|---|---|
| R-PAPER-01 (scope `Text=True`) vs the 06:07 baseline | **PASS 14/14**: exactly 32 variants changed; the 52 text-less variants, `_Checkbox base` (52), `_Modal actions` (3) and Input field (53) unchanged; fingerprint unchanged (`r-paper-01.md`) |
| Pixel diff, Light (whole set) | **Pixel-identical** (1,516,032 px, 0 different) |
| Existing instances (27) | Unchanged. 26 text-less ones (inside Tag, Input field, dropdown and nav items) are unaffected. The one with text (`_Modal actions`: "Don't show again") keeps its text, now held as `Label = Don't show again` (`checks-instances.json`) |

## Result for login readiness

Every DS component on the 10 login screens (Button, Input field, Radio / Checkbox) now has its text and options available as properties; Status Bar and Home Indicator are device chrome, not DS.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
