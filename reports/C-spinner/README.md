# Task C — Loading spinner (duplicate)

> 2026-11-10. Approved by Mike: "Next task".
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original library is untouched; nothing was published.
> - **Not changed:** no token or variable.
> - **Script:** `scripts/components/loading-indicator-hug.js`.

## Result: **PASS**: width fixed; Primary_alt spinner fixed in Dark

### 1. `Loading indicator`: fixed 512px → Hug (done)

| | Before | After |
|---|---|---|
| Root width | **512px FIXED** (desktop leftover) for all 8 variants | **Hug**: 66px (sm, md) / 85px (lg, xl) |
| Content | Spinner (+ optional "Loading..." text) centred | Unchanged; each variant moved so the spinner stays in place |
| Pixel diff of the whole set | — | **Pixel-identical** (779,008 px, 0 different) |
| Instances | None anywhere in the file (checked in-call) | No consumer affected |

The colours are semantic, so Light/Dark is already correct:

- arc `fg-brand-primary`, **5.22** Light / **5.49** Dark on `bg-primary`;
- track `bg-tertiary` (Line simple) or `bg-primary` (Line spinner);
- text `text-secondary`.

### 2. The spinner inside Button (`Buttons/Button loading icon`, used by 25 Button + 18 Button destructive Loading variants)

The colours come from instance overrides, read in both modes (`button-spinner-colours.json`, `button-spinner-paints.json`):

| Hierarchy | Arc colour | On | Light | Dark |
|---|---|---|---|---|
| **Primary_alt** (7 variants) | `fg-primary` | lime `bg-brand-secondary` | 16.66 | **1.16 ❌**: `fg-primary` turns white in Dark while the button stays lime, so **the spinner almost disappears** |
| Primary | `button-primary-icon` (component tier) | `bg-brand-primary` | 2.46 | 2.46 |
| Secondary | `fg-brand-secondary_alt` | `utility-brand-25` | 2.68 | 6.48 |
| Link brand | `fg-brand-secondary_alt` | page background | 2.79 | 7.50 |

**Fix (applied 2026-11-10, approved: "Yes, fix it"; script `scripts/components/button-primary-alt-spinner.js`):**

- Rebind the arc in the 7 Primary_alt Loading variants to **`text-primary_on-brandsecondary`**, the role its label already uses. It's black in both modes: **17.98 / 17.98**.
- The visible effect in Light is the arc going from #0a0d12 to #000000 (barely perceptible, but not pixel-identical). Dark becomes correct.
- It's a semantic variable, so the deferred component-colour tier isn't touched.

**Not proposed now:** Primary / Secondary / Link brand arcs are below 3:1 in Light (2.46–2.79).

- A spinner next to a "Loading" label isn't the only cue, so this is nonblocking.
- Primary uses the deferred component-colour tier (`button-primary-icon`), so changing it belongs with the 171 deferred colours.

**Result of the fix:**

| Check | Result |
|---|---|
| Arc in the 7 Primary_alt Loading variants (md, lg, sm, xxs; text and icon-only) | `text-primary_on-brandsecondary`: Light **#000000**, Dark **#000000**, so **17.98:1 in both modes** (was 16.66 / **1.16**) |
| In-call guard | Every other layer of all 150 Button variants is unchanged (paints, visibility, sizes); arc weight, size and arc shape unchanged |
| Re-read in a separate call | All 7 bindings persist (`verify-primary-alt.json`) |
| Pixel diff, md text variant (Light) | 43 of 4,040 px differ, all on the arc, which goes from #0a0d12 to #000000 (`primary-alt-loading-md-diff.png`) |
| Consumer instances of these 7 variants in the file | 0 |

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
