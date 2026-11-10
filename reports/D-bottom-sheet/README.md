# Task D — Bottom sheet: does the Modal support the session-timeout layout? (read-only)

> 2026-11-10. Approved by Mike: "go".
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy`. **Read-only:** no writes, no tokens, nothing published.
> - **P2-07 (native Slot):** still deferred; the existing swap slot was assessed as is.
> - **Evidence:** `modal-anatomy.json`, `modal-light.png`.

## Verdict: **YES, with three fixable gaps.** The Modal is already a mobile bottom sheet

Session-timeout sheet: optional icon, "Your session is about to expire", "You'll be signed out in 0:59", **Stay signed in** / **Sign out**, usually no close.

| Need | Modal today | Fit |
|---|---|---|
| Bottom-anchored mobile sheet | 390 × 844 viewport, overlay, panel at the bottom, 32px top radii (bound), Home Indicator | ✅ |
| Grab handle | **`Notch` 48 × 4 exists** in `_Modal header`. Correction to the triage: it said "no grabber" | ✅ (decorative, 1.2:1 / 1.84:1) |
| Icon / illustration | `Show img` + an `Illustration` swap (placeholder by default) | ✅ by swap, e.g. a Featured icon with a clock |
| Title + countdown text | `{Title}` and `{Text content…}`: put the countdown in the supporting text. Contrast 19.45 / 19.60 and 7.14 / 7.16 | ⚠ **Not TEXT properties**: editable only as layer overrides (like Alert before C3) |
| Body slot | `Drawer content` swap, default **pink `Slot` placeholder** (❖), no show/hide toggle; its 1 preferred value doesn't resolve | ❌ **The placeholder appears on screens** unless it's swapped to real content; there's no ready body component |
| Two stacked actions | `_Modal actions` stacks Primary ("Confirm") + Secondary ("Cancel") at Mobile; labels via Button `Label` | ⚠ **Buttons show their placeholder L/R icons** (dashed circles) and **aren't exposed**, so labels and icons must be changed inside the layers |
| No close for a forced timeout | `Show close` toggle | ✅ (the close icon is 2.4:1 in Light, below 3:1, only when it's shown) |
| Light / Dark | Sheet `bg-primary`: white / **black**. Overlay `bg-overlay` @40%: Light dims the page to #d6d6d6 (sheet vs. page 1.45:1). Dark: #0c0e12 at 10% × 40% ≈ **no dimming** | ⚠ **In Dark the black sheet on a black page has no visible edge (1.0:1)**. Only the content and the notch show where it starts |

## Proposed fixes (each needs approval; none changes the Modal's architecture or slot mechanism)

| # | Fix | Where | Visual change |
|---|---|---|---|
| D1 | `Title` / `Description` TEXT properties (defaults = current text), the C3 pattern | `_Modal header` | None |
| D2 | Expose the two Buttons in `_Modal actions` and turn their placeholder icons off by default (`Show L/R icon` = false) | `_Modal actions` (3 variants) | Placeholder icons disappear (intended) |
| D3 | A small body component (`_Modal body text`, TEXT property, `text-tertiary`) to swap into `Drawer content`; optionally also an empty one. The swap property and slot stay as they are | New local component | None until used |
| D4 | **Dark separation (design/token decision):** options: (a) sheet surface `bg-primary_alt` / `bg-secondary` in Dark; (b) a 1px top border `border-secondary`; (c) a stronger Dark overlay | `Modal` panel or `bg-overlay` | Dark only |

With D1–D3, a session-timeout sheet can be set up from the properties panel alone. D4 decides whether it reads as a sheet in Dark.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.

---

## Fixes D1–D3 applied (2026-11-10, approved: "Yes, D1–D3")

> **Script:** `scripts/components/modal-d1-d3.js`: one atomic call; preconditions; in-call guard. Duplicate only.
> - **Not changed:** no token or variable.
> - **Unchanged architecture:** the `Drawer content` swap slot keeps its default (P2-07 deferred).
> - **Evidence:** `fix/`.

| # | Change | Result |
|---|---|---|
| D1 | `_Modal header`: TEXT properties **`Title`** (`#23571:0`) and **`Description`** (`#23571:2`), defaults = current text. The header instance in `Modal` is exposed | The Modal's properties panel shows Title / Description. The Playground header's custom texts ("Change your payment method" …) moved into the property values unchanged |
| D2 | `_Modal actions`, all 3 variants: the 6 main Buttons are **exposed**, with `Show L icon` / `Show R icon` = **false**. The actions instance in `Modal` is exposed | Labels and icons can be edited from the Modal panel. Placeholder icons are gone. The checkbox variant's tertiary "Settings" button is left as is (it has no Show-icon properties) |
| D3 | New local component **`_Modal body text`** (`23571:17526`): TEXT property `Text` (default `{Body text}`), Text sm/Regular, `text-tertiary`, 358 wide, no padding or gap. Placed under the Modal set and **added to the `Drawer content` preferred values** (the existing entry is kept) | Swap it in from the Modal panel instead of the pink Slot. The **default is still the Slot placeholder** (unchanged) |

### Validation

| Check | Result |
|---|---|
| In-call guard | All **9 consumer instances** of the three sets (Modals + Playground) kept their texts and sizes. `Modal` kept its texts and sizes. The swap default is unchanged; preferred values went from 1 → 2 |
| Re-read in a separate call | Property links, exposure (header, actions, 6 Buttons), icons off, the body component's style and variable binding: all persist |
| Pixel diff, Modals section | 2,104 px differ: action-button icons (actions set, Modal, Modal instance) + the new `{Body text}` component. Nothing else |
| Pixel diff, Playground | 1,572 px differ: the placeholder icons disappeared from the CTA / Next / Skip / Confirm / Cancel buttons (they inherited the default). Intended |
| Light / Dark | No colour changed. The new body text uses `text-tertiary`, the same as the header's supporting text (7.14 / 7.16) |

**Still open: D4.** The Dark sheet has no visible edge. This is a design/token decision; nothing was changed.

Subscription: Tokens Studio Free (not used) · unblocked · no upgrade.
