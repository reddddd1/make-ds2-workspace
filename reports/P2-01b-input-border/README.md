# P2-01b — Input field border → `border-primary` (duplicate)

> 2026-11-09 · Approved by Mike: "Set to border primary proceed" (finding 1 of `reports/P2-01-sync/README.md`). This is the input-border part of P2-05, done early. Target: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original was not touched and nothing was published.

## Change (VERIFIED)

- **What:** the input box (`Input` frame) stroke moved from `Colors/Border/border-secondary` (Gray/200 `#e9eaeb`, about 1.2:1) to `Colors/Border/border-primary`. After P2-01 that resolves to Gray/450 `#8a8e97` in Light (3.28:1) and Gray dark/600 in Dark.
- **Scope: 24 Input field variants**, `Destructive=False` × `State ∈ {Placeholder, Filled, Focused}`.
- **Left unchanged on purpose:**
  - 8 `State=Disabled` variants, still on `border-secondary`. A disabled field is meant to look inactive and is exempt from the 3:1 rule. **DECISION** if they should change too.
  - 21 `Destructive=True` variants (`border-error_subtle`).
  - 7 `Payment method icon` frames (`border-secondary`; an icon frame, not the input border).
- **Script:** `scripts/components/rebind-input-border.js`.
  - Refuses any file other than the duplicate.
  - Checks all 24 targets before the first write: exactly one bound `Input` frame each, not inside an instance, currently `border-secondary`.
  - Only write: the stroke paint's colour binding. Stroke weight (1) and every other property are unchanged.
  - Result: `write-result.json` (`allOk: true`, 24/24).

## Verification

| Check | Result |
|---|---|
| R-PAPER-01 (`spec.json`: Input field `Destructive=False`, State Placeholder/Filled/Focused) against the P2-01 post-sync baseline | **PASS: expected 24, actual 24**; 0 changes outside scope in all 6 pilot sets (180 variants); property definitions unchanged; fingerprint unchanged (682 variables) → `r-paper-01.md` |
| Light screenshot (`input-before-border.png` → `input-after-border.png`) | Placeholder, Filled and Focused input outlines visibly darker; Disabled and Error rows unchanged |
| Consumer instances | No Input field instances on the duplicate's Modals page. The pilot scratch file uses the original library, so it's unaffected until P2-08 |
| Dark mode | Not screenshotted (needs a Dark-mode scratch frame, a write outside this approval); `border-primary` Dark = Gray dark/600 `#61656c` (P2-01 R5) |

## Focus ring → brand (VERIFIED)

Approved by Mike: "Use brand color for focus ring" (18:09 UTC).

- **What:** on the 8 `Destructive=False, State=Focused` variants, the `Input` frame's effect style changed from `Focus rings/focus-ring-shadow-secondary-xs` to the existing `Focus rings/focus-ring-shadow-primary-xs`.
  - The two styles have the same structure: 4 px ring, 2 px white gap, xs shadow. Only the ring colour differs.
  - The ring is bound to `Colors/Effects/Focus rings/focus-ring-primary`, which resolves to `#7373f5` (Brand/500) in Light.
- **Not changed:** no effect style was created or edited. The border stays `border-primary`. Error focus states keep their own ring.
- **Script:** `scripts/components/input-focus-ring-brand.js`. Same guards as above; the only write is `setEffectStyleIdAsync`. Result: `write-result-focus-ring.json`, 8/8 `allOk`.
- **R-PAPER-01** (`spec-focus-ring.json`) against the post-border baseline: **PASS, 8 expected, 8 changed**, 0 outside scope across the 180 pilot variants, fingerprint unchanged → `r-paper-01-focus-ring.md`.
- **Screenshot** `input-after-focus-ring.png`: the Focused row shows the brand ring; every other row is unchanged.
- **Dark:** `focus-ring-primary` is Brand/500 in both modes. Not screenshotted.

## Subscription status

Tokens Studio Free (assumed; not used) · Unblocked · no paid features · no upgrade.
