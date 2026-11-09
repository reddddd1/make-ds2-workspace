# P2-04 — Icon access via exposed nested instances (duplicate)

> 2026-11-09 · Approved by Mike ("Added. Go on"), after he enabled the **MAKER Icon library** in the duplicate (confirmed with `get_libraries`). Option B from `docs/pilot-button-input.md` §2.2: expose, don't restructure. Target: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original was not touched and nothing was published.

## Change (VERIFIED)

| Component | Exposed nested instances | Count | What designers get on an instance |
|---|---|---|---|
| Buttons/Button | every `Icon wrapper` (leading, trailing, icon-only; Pressed included) | **194** in 118 variants | the wrapper's **Icon** swap (MAKER Icon library), plus `Crypto`/`Currency` swaps and its size/type variants, right in the button's properties |
| Input field | every `Icon wrapper` | **79** in 46 variants | same Icon swap |
| Alert | `Featured icon` (4) + the two action `Buttons/Button` (8) | **12** in 4 variants | Featured icon Color/Size/Type; each action button's `Label`, Hierarchy, Size, State, icon toggles (and, nested, their Icon swaps) |

- **Not exposed:**
  - the Alert close `x`;
  - the button loading spinner;
  - Helper text, Tag, Payment method icon, Radio / Checkbox inside Input field.
- **Only write:** `isExposedInstance = true` (`scripts/components/expose-nested-instances.js`, refuses any file other than the duplicate, counts checked before writing, `write-result.json`).
- **No visual change**, no structural change, no glyph or override changed.

## Verification

| Check | Result |
|---|---|
| **Existing instances** (104 Button, 6 Input field, 0 Alert): nested glyph per position, text, property values | **0 of 110 changed** (`instances-before.json` ↔ `instances-after.json`) |
| Variant attribution (E1 hash, which includes the exposure flag) vs the P2-03 baseline | Changed exactly the variants holding an exposed instance: **Button 118/143, Input field 46/53, Alert 4/4**; 0 mismatches. Modal / _Modal header / _Modal actions unchanged; property definitions and fingerprint unchanged |
| Icon swap reachable from a Button instance | Yes: `21495:14720` lists 2 exposed `Icon wrapper` with `Icon` / `Crypto` / `Currency` swaps |

## Findings

1. **Alert `Featured icon` exposes nothing of its own.** (Corrected: it is from the **MAKER Icon library** itself, not another library; see `reports/P2-06a-alert-icons/`.) Its inner `Icon wrapper` isn't exposed there. So the Alert glyph (`squircle-dashed`) **still cannot be swapped from the Alert**. Options for P2-06:
   - (a) ask the owner of the Featured icon library to expose its icon;
   - (b) replace it with a local icon container using the MAKER Icon library (`pilot-alert.md` §3.3 b), which is a structural change.
   - **DECISION.**
2. Exposing makes the properties panel two-level: Button → Icon wrapper → Icon. That's the known trade-off of option B vs A2 (restructure into one-level `Icon leading`/`Icon trailing` swaps).
3. Preferred values for the Icon swap come from the MAKER Icon library's own component (currently 1 preferred value). Curating them belongs to that library, not this file.

## Next baseline

`variants-after.json`

## Subscription status

Tokens Studio Free (assumed; not used) · Unblocked · no paid features · no upgrade.
