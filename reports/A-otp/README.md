# Task A — OTP / PIN input: 6 digits (duplicate)

> 2026-11-10. Approved by Mike: "Yes, start OTP". His decisions: 48px cells with 8px gaps; 6 states; text + link + countdown for resend; keep Space Grotesk.
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original library is untouched; nothing was published.
> - **Not changed:** no token or variable was created or changed; only existing semantic variables are used.
> - **Scripts:**
>   - `scripts/components/otp-six-digit.js`: one atomic call; preconditions first; in-call guard. The first attempt stopped in the font-loading step (an empty text layer) before any write, so nothing was changed; it passed after the fix.
>   - `scripts/components/otp-resend-icons-off.js`: follow-up that hides the Button's placeholder icons in the resend link.

## Result: **PASS**

| Component | Before | After |
|---|---|---|
| `_Mega input field base` (one cell) | 12 variants: Placeholder, Focused, Filled, Disabled × sm 64, md 80, lg 96 | **24**: + **Error** and **Verified** for every size; + **xs** (48 × 48, `radius-2xl` 16) for all 6 states |
| `Verification code input field` | 3 variants, 4 digits only | **9**: new **State** axis; the existing 3 are now `…, State=Default` (otherwise unchanged); **6 new `Size=xs, Digits=6`** variants |

**The 6-digit variants** (each 328 × 124; the cell row is 6 × 48 + 5 × 8 = **328px**, which fits a 390px screen with 16px margins):

| State | Cells | Helper text | Resend row |
|---|---|---|---|
| Default | 6 × Placeholder | Informative, `{Support text}` | "Didn't get a code? **Resend**" |
| Focused | 1st Focused, others Placeholder | Informative | Resend |
| Filled | 6 × Filled (sample `482916`) | Informative | Resend |
| Error | 6 × Error: `border-error`, digits `color/text/error-primary` | **Error**, `{Error}` | Resend |
| Verified | 6 × Verified: `border-success`, digits `text-success-primary` | **Success**, `{Success}` | Resend |
| Disabled | 6 × Disabled | Informative | Button **Disabled**, "**Resend in 0:30**" |

**Properties:**

- `Label` (existing, shows or hides the title);
- **`Show resend`** (new BOOLEAN);
- Helper text and the resend Button are **exposed**, so their text, status, state and countdown label can be set from the properties panel.

The resend row is built from existing parts: Text sm/Regular in `text-tertiary`, plus Button Link brand sm with both icons off. Gaps are bound to `spacing-xs`.

## Validation

| Check | Result |
|---|---|
| In-call guard | 15 existing variants structurally unchanged (layers, bindings, sizes, texts, instance targets); counts 24 / 9; axes as expected; every 6-digit row exactly 328px |
| E1 hashes (`variants-before.json` → `variants-after.json`) | `_Mega input field base`: **12 / 12 existing unchanged**, 12 added. `Verification code input field`: the 3 existing hashes changed **only because of the rename** (`, State=Default`; E1 hashes the layer name). Structure is unchanged per the guard and pixel-identical; 6 added. File fingerprint (variables, styles) unchanged |
| Pixel diff, existing variants (Light) | **Pixel-identical**, 0 differing pixels: field sm / md / lg; cells Filled sm, Focused md, Disabled lg |
| Bindings in the 18 new variants | 0 unbound paints, 0 remote colours, 0 hardcoded spacing; radius bound |
| Instances | None outside the two sets (checked before writing), so no consumer is affected |
| Light / Dark (values) | Every colour is a semantic `1. Color modes` variable with its own Dark value (`checks-new-variants.json`) |

**Contrast** (actual ratios, ADR-0008; digits are 30px, which counts as large text with a 3:1 minimum):

| Pair | Light | Dark | Result |
|---|---|---|---|
| Digit, Filled / Focused (`text-brand-tertiary_alt`) | 5.22 | 4.02 | ✅ (large text) |
| Digit, Error | 5.78 | 7.30 | ✅ |
| Digit, Verified | 5.69 | 10.36 | ✅ |
| Resend prompt (`text-tertiary`) | 7.14 | 7.16 | ✅ |
| Cell border, Error / Focused (UI 3:1) | 3.84 / 3.81 | 7.30 / 7.50 | ✅ |
| Cell border, **Verified** (`border-success`) | **2.75** | 10.36 | ⚠ below 3:1 in Light. The state is also shown by the digit colour (5.69) and the Success helper text with its icon |
| **Placeholder cells** (empty), border `color/border/primary` (UI 3:1); **fixed 2026-11-10**, see below | 3.28 | 3.58 | ✅ (before: border hidden, no visible boundary) |

## Open points (your decision; nothing changed)

1. **Verified border, Light 2.75:1:** keep it (the state is also shown by colour and text), or use a darker success border (no such token exists today, so it would be a token decision)?
2. **Countdown:** it's shown on the Disabled state. In other states, set the exposed Resend button to Disabled with label "Resend in 0:30".
3. Space Grotesk still needs bundling in the mobile app (T3); the registry has no display-font token yet.

## Follow-up 2026-11-10: visible border on empty cells (approved: "Yes, show borders")

Script `scripts/components/otp-placeholder-border.js` (`write-result-placeholder-border.json`) made the existing, previously hidden 1px `color/border/primary` stroke visible on the 4 `State=Placeholder` cells (sm, md, lg, xs). Nothing else changed: no size, binding or token change, and the guard checked the other 20 cells.

| Check | Result |
|---|---|
| Cells set, pixel diff | 1,480 px changed, **all inside the 4 Placeholder cells**; 0 elsewhere |
| Field set, pixel diff | Changes only where Placeholder cells appear: the 3 four-digit variants (4,864 px), 6-digit Default (1,584) and Focused (1,320 = its 5 empty cells). **0** in Filled, Error, Verified and Disabled |
| Contrast, border on background | Light #8a8e97 on #ffffff **3.28** · Dark #61656c on #000000 **3.58** (UI minimum 3:1) |

This visibly changes the 4-digit variants (approved). There are still no instances outside the sets.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
