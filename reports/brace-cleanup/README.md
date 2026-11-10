# Curly-bracket cleanup in component texts (2026-11-10, Mike's request)

> Duplicate `PpnTy1pkB2FTZFq6i6seSy` only. Original library untouched; no token or variable change; nothing published. Each script was guarded on the file key and is atomic.

Placeholder texts like `{CTA Label}`, `{Label}`, `{Text main}` and `{Support text}` now read `CTA Label`, `Label`, `Text main`, `Support text`.

## What changed

| What | Count |
|---|---|
| Text layers in main components | **347**: Radio groups 192, Buttons 46, Tags 30, Badges 27, Inputs 20, Dropdowns 13, Tab & filter 10, Progress 5, Label 4 |
| TEXT property defaults | **8**: Modals 3 (`Title`, description, `_Modal body text`), Checkboxes 2 (`Label`, `Description`), Alerts 2 (`Title`, `Description`), Inputs 1 |
| Overrides on nested instances inside components | **296**: Radio groups 224, Inputs 47, Dropdowns 25 |
| Stray `]` from mistyped placeholders (`{Item selected]`, `{Secondary text]`) | **21** removed |

Characters were deleted one at a time, so the text styles and mixed formatting were kept.

Instances that use the default property value now show the clean text. Instances with their own text keep it.

## Verification

- Every page with components was scanned (32 pages, about 1,400 components): **0** curly brackets left in component texts or TEXT defaults.
- Spot re-read in a separate call: the Inputs page has 0 brackets. The Input field placeholder shows "Label · Required · Placeholder text · Optional · Support text".

## Not touched

- Instances on the Playground page and in the scratch/consumer files: they aren't components. Their own text overrides stay as they are, while inherited defaults update.
- Remote components from the MAKER Icon library.

Subscription: Tokens Studio Free (not used) · unblocked · no upgrade.
