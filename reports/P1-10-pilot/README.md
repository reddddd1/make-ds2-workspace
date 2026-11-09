# P1-10 — evidence for `docs/pilot-button-input.md`

Read-only reads on 2026-11-09 (no writes; scripts reviewed for mutating calls):

| File | Source | Content |
|---|---|---|
| `raw-button.json` | original library `xJoAz66aekAToyhBmfGNt0` | Buttons/Button: property definitions, per-variant text layers, nested instances, property references, md Hover/Default bindings, `Icon wrapper` swap properties |
| `raw-input.json` | original library | Input field: per-variant text layers, nested instances (visibility), `Icon wrapper` swap definitions + preferred-value counts |
| `raw-scratch.json` | pilot scratch `uMQLqPDG5I4rZAAHlhpInJ` | 44 Button/Input instances: variant, booleans, text overrides (`*` = differs from main), visible glyphs |

Cross-checks against the P1-04 registry: Buttons/Button 118 variants / 7 properties / 153 `Icon wrapper` instances; Input field 53 variants / 4 properties / 79 `Icon wrapper` / 53 `Helper text` — all match. Pressed count (25) = Hover variants in the P1-08 baseline snapshot.

Subscription status: Tokens Studio Free (assumed; unverified) · Unblocked · no paid features · upgrade not required.
