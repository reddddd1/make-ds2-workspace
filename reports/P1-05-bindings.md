# P1-05 — Extended binding scan (read-only)

> **Status:** complete, 2026-11-09. Source: MAKER-DS-v2 `xJoAz66aekAToyhBmfGNt0`, read-only. Script: `scripts/figma-binding-scan.js` (SHA-256 `1162d53ec4156eb3`). Data: `registry/components.json` → `components[].bindingScan`; raw dump `registry/raw/figma-bindings-2026-11-09.json`.

Labels: **VERIFIED** = read from the file in this task; **PROPOSED** = recommendation, not approved; **UNVERIFIED** = not checked.

## 1. Scope and method

- All 95 components (77 sets + 18 standalone) were scanned; tables below use the **base** scope (68 sets + 12 standalone, as audit §2.3).
- Each component's own layers only. Nested instances are not descended (their bindings belong to their own component).
- Classes: **padding** and **gap** (auto-layout frames; gap skipped for space-between and single-child frames), **radius** (per corner when mixed), **stroke width** (only where a visible stroke exists), **effect** (style / variable-bound / raw), **text** (text style / variable-bound / raw).
- `zero` = unbound value of 0 (not a finding). `raw` = unbound non-zero value. Radius values the scan read from per-corner fields on nodes without corners were removed as a scan artifact (`notApplicable`).
- Colour fills/strokes were covered in P1-04 and are not repeated here.

## 2. Totals (base scope, VERIFIED)

| Class | Bound to variable | Styled | Raw (unbound, non-zero) | Zero (unbound) | Raw share of non-zero |
|---|---|---|---|---|---|
| padding | 2913 | 0 | **437** | 5046 | 13.0% |
| gap | 1090 | 0 | **21** | 142 | 1.9% |
| radius | 1051 | 0 | **39** | 1926 | 3.6% |
| strokeWidth | 0 | 0 | **776** | 113 | 100.0% |
| effect | 18 | 208 | **19** | 0 | 7.8% |
| text | 4 | 979 | **0** | 0 | 0.0% |

## 3. Key findings

1. **Stroke width is never bound (776 raw, 0 bound). VERIFIED.** The file has no border-width variables at all (collections: `_Primitives` = 277 colours + 32 spacing; `2. Radius`; `3. Spacing`; `4. Widths`; `5. Containers`; `6. Typography`). Values: 1 px ×450, 1.5 px ×135 (avatars, illustrations), 2 px ×102 (focus/hover), plus a long tail (illustration vectors, progress/loading rings 4–28 px). The token repo's pending **Proposal 0006** contains `border-width` primitives (incl. 1 px). Fixing this depends on Mike's decision on 0006, then a Phase 2 binding pass.
2. **Buttons/Button `Size=md` padding is entirely unbound (10/14 px; icon-only 10/10). VERIFIED.** Every other size is bound. `lg Secondary` also has raw top/bottom 10 px (5 variants). Neither 10 px nor 14 px exists in Figma's spacing scale (semantic: 0, 2, 4, 6, 8, 12, 16, 20, 24, 32…; primitives likewise). Proposal 0006 adds `spacing.2_5` (10 px) and `spacing.3_5` (14 px). Buttons/Button destructive mirrors this (72 raw).
3. **Text is fully systematised. VERIFIED.** 979 text layers use a text style; 4 (Tag count) are bound to typography variables instead (`text-xxs`, `text-sm`) — P1-04's "4 raw text" for Tag count is corrected: they are variable-bound, not raw. 0 raw text in base scope.
4. **Effects are almost all styled** (208 styled, 18 variable-bound focus rings on Social button). 19 raw in base: Navigation button group (`GLASS` effect, 1), Mobile app store badge (inner shadow, 4), Virtual/Physical card blurs (14).
5. **One mis-bound variable. VERIFIED.** Progress bar binds **radius** to `3. Spacing/spacing-md` (8 px) on 33 layers instead of a `2. Radius` variable. Visual result is the same today (8 px = `radius-md`), but a spacing change would silently change the radius. No other padding/gap/radius binding points to an unexpected collection.
6. **Radius is in good shape** (1,051 bound, 39 raw). Raw radii: Mobile app store badge 7/8 px (12), Tooltip arrow shape 1 px (12), Virtual/Physical card freeze layer 13 px (7), `_Nav featured card` QR handles (5), `_Nav account card menu item` 6 px (2), Navigation button group 999 (1).
7. **Gap: 21 raw** — Alert content wrapper 12 px (4, token `spacing-lg` exists), Tag content 5 px (7, no token), Textarea tag wrap counter-axis 8 px (5, `spacing-md` exists), Avatar group negative overlap −4/−8/−12 (3, intentional), `_Input title` 2 px (1), `_Date picker menu` 12 px (1).

## 4. Per-component counts (base scope)

Format per class: bound / raw (zero omitted; styled shown for effect and text). Only components with at least one non-zero value.

| Page | Component | Padding b/r | Gap b/r | Radius b/r | Stroke w. b/r | Effect st/b/r | Text st/b/r |
|---|---|---|---|---|---|---|---|
| Buttons | Buttons/Button | 382/**122** | 76/0 | 102/0 | 0/**10** | 22/0/0 | 76/0/0 |
| Buttons | Buttons/Button destructive | 216/**72** | 44/0 | 60/0 | 0/**3** | 15/0/0 | 44/0/0 |
| Buttons | Social button | 54/**162** | 27/0 | 54/0 | 0/**54** | 36/18/0 | 27/0/0 |
| Buttons | Social button groups | 0/0 | 6/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Buttons | Mobile app store badge | 0/0 | 0/0 | 0/**12** | 0/**18** | 0/0/**4** | 0/0/0 |
| Buttons | Buttons/Button loading icon | 0/0 | 0/0 | 0/0 | 0/**4** | 0/0/0 | 0/0/0 |
| Buttons | Buttons/Button icon | 48/0 | 0/0 | 12/0 | 0/0 | 0/0/0 | 0/0/0 |
| Buttons | Buttons/Button action | 0/0 | 3/0 | 0/0 | 0/0 | 0/0/0 | 3/0/0 |
| Buttons | Buttons/Button navigation | 12/0 | 3/0 | 3/0 | 0/0 | 0/0/0 | 3/0/0 |
| Button groups | _Button group base | 120/**8** | 16/0 | 0/0 | 0/**32** | 8/0/0 | 24/0/0 |
| Button groups | Button group | 0/0 | 0/0 | 3/0 | 0/**3** | 3/0/0 | 0/0/0 |
| Button groups | Navigation button group | 2/**2** | 1/0 | 0/**1** | 0/0 | 0/0/**1** | 0/0/0 |
| Tab & filter groups | _Tab button base | 48/0 | 8/0 | 8/0 | 0/**4** | 0/0/0 | 8/0/0 |
| Tab & filter groups | _Filter button base | 12/0 | 2/0 | 2/0 | 0/0 | 0/0/0 | 2/0/0 |
| Tab & filter groups | Tab group | 0/0 | 4/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Tab & filter groups | Filter group | 0/0 | 1/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Badges | Badge | 108/0 | 27/0 | 27/0 | 0/0 | 0/0/0 | 27/0/0 |
| Tags | Tag | 120/0 | 32/**7** | 30/0 | 0/**30** | 0/0/0 | 30/0/0 |
| Tags | Tag count | 16/**4** | 0/0 | 6/0 | 0/0 | 0/0/0 | 2/4/0 |
| Dropdowns | _Dropdown list item | 42/**40** | 6/0 | 10/0 | 0/0 | 0/0/0 | 10/0/0 |
| Dropdowns | Dropdown | 2/0 | 0/0 | 1/0 | 0/**1** | 1/0/0 | 0/0/0 |
| Dropdowns | Select | 257/0 | 53/0 | 51/0 | 0/**51** | 15/0/0 | 45/0/0 |
| Dropdowns | _Scroll bar (control fill with bottom padding) | 3/**1** | 0/0 | 1/0 | 0/**1** | 0/0/0 | 0/0/0 |
| Inputs | _Mega input field base | 48/0 | 0/0 | 12/0 | 0/**6** | 0/0/0 | 12/0/0 |
| Inputs | Verification code input field | 0/0 | 9/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Inputs | Textarea input field | 43/**14** | 52/**5** | 14/0 | 0/**42** | 0/0/0 | 16/0/0 |
| Inputs | Helper text | 0/0 | 15/0 | 0/0 | 0/0 | 0/0/0 | 15/0/0 |
| Inputs | Input field | 422/0 | 118/0 | 93/0 | 0/**93** | 8/0/0 | 119/0/0 |
| Inputs | _Input title | 5/0 | 2/**1** | 1/0 | 0/**1** | 0/0/0 | 4/0/0 |
| Toggles | _Toggle base | 64/0 | 0/0 | 32/0 | 0/0 | 20/0/0 | 0/0/0 |
| Checkboxes | Radio / Checkbox | 32/0 | 48/0 | 0/0 | 0/0 | 0/0/0 | 64/0/0 |
| Checkboxes | _Checkbox base | 0/0 | 0/0 | 60/0 | 0/**28** | 13/0/0 | 0/0/0 |
| Radio groups | Radio group item | 384/0 | 368/0 | 96/0 | 0/**96** | 24/0/0 | 256/0/0 |
| Radio groups | Radio group | 0/0 | 20/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Avatars | Avatar label group | 0/0 | 4/0 | 0/0 | 0/0 | 0/0/0 | 8/0/0 |
| Avatars | Avatar | 0/0 | 0/0 | 80/0 | 0/**80** | 0/0/0 | 48/0/0 |
| Avatars | _Avatar company icon | 0/0 | 0/0 | 6/0 | 0/**6** | 0/0/0 | 0/0/0 |
| Avatars | _Avatar add button | 60/0 | 0/0 | 12/0 | 0/**12** | 3/0/0 | 0/0/0 |
| Avatars | Avatar group | 0/0 | 3/**3** | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Tooltips | Tooltip | 56/0 | 7/0 | 14/**12** | 0/0 | 14/0/0 | 21/0/0 |
| Progress indicators | Progress bar | 0/0 | 22/0 | 99/0 | 0/0 | 0/0/0 | 22/0/0 |
| Progress indicators | Progress circle | 0/0 | 1/0 | 0/0 | 0/**10** | 0/0/0 | 10/0/0 |
| Sliders | Slider | 0/0 | 0/0 | 60/0 | 0/0 | 0/0/0 | 0/0/0 |
| Sliders | _Control handle | 12/0 | 0/0 | 12/0 | 0/**12** | 12/0/0 | 6/0/0 |
| Navigators | _Indicator | 0/0 | 0/0 | 2/0 | 0/0 | 0/0/0 | 0/0/0 |
| Navigators | Navigator | 0/0 | 5/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| App Navigation | _Nav featured card | 31/0 | 22/0 | 7/**5** | 0/**14** | 1/0/0 | 16/0/0 |
| App Navigation | _Nav account card menu item | 56/**8** | 12/0 | 10/**2** | 0/**4** | 0/0/0 | 8/0/0 |
| App Navigation | Header navigation | 6/0 | 4/0 | 0/0 | 0/**2** | 0/0/0 | 0/0/0 |
| App Navigation | _Nav item base | 36/0 | 12/0 | 6/0 | 0/0 | 4/0/0 | 6/0/0 |
| App Navigation | _Application nav menu button | 24/0 | 0/0 | 6/0 | 0/0 | 2/0/0 | 0/0/0 |
| App Navigation | _Nav item button | 48/0 | 0/0 | 12/0 | 0/0 | 4/0/0 | 0/0/0 |
| Modals | _Modal actions | 18/0 | 4/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Modals | _Modal header | 3/0 | 3/0 | 1/0 | 0/0 | 0/0/0 | 2/0/0 |
| Modals | Modal | 6/0 | 0/0 | 4/0 | 0/0 | 0/0/0 | 0/0/0 |
| Alerts & notifications | Alert | 20/0 | 16/**4** | 4/0 | 0/**4** | 0/0/0 | 8/0/0 |
| Date pickers | _Date picker list item | 24/0 | 0/0 | 6/0 | 0/0 | 2/0/0 | 6/0/0 |
| Date pickers | _Date picker menu | 47/0 | 20/**1** | 4/0 | 0/**5** | 0/0/0 | 7/0/0 |
| Date pickers | _Calendar cell | 0/0 | 0/0 | 12/0 | 0/0 | 0/0/0 | 12/0/0 |
| Date pickers | Date picker modal | 12/0 | 2/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Loading indicators | Loading indicator | 0/0 | 8/0 | 0/0 | 0/**16** | 0/0/0 | 8/0/0 |
| Label | Textelement | 0/0 | 4/0 | 0/0 | 0/0 | 0/0/0 | 4/0/0 |
| Illustration and assets | Virtual card | 0/0 | 0/0 | 6/**3** | 0/0 | 0/0/**6** | 0/0/0 |
| Illustration and assets | Physical card | 0/0 | 0/0 | 8/**4** | 0/**36** | 0/0/**8** | 0/0/0 |
| Illustration and assets | Illustration/placeholder | 0/0 | 0/0 | 0/0 | 0/**9** | 0/0/0 | 0/0/0 |
| Illustration and assets | Illustration/lego | 0/0 | 0/0 | 0/0 | 0/**71** | 0/0/0 | 0/0/0 |
| Illustration and assets | Illustration/secure | 0/0 | 0/0 | 0/0 | 0/**10** | 0/0/0 | 0/0/0 |
| Illustration and assets | Illustration/Custom img | 0/0 | 0/0 | 0/0 | 0/**4** | 0/0/0 | 0/0/0 |
| Illustration and assets | Empty card | 0/0 | 0/0 | 2/0 | 0/**3** | 0/0/0 | 0/0/0 |
| Miscellaneous assets | Divider | 2/0 | 0/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Miscellaneous assets | Background overlay | 0/0 | 0/0 | 0/0 | 0/0 | 1/0/0 | 0/0/0 |
| Miscellaneous assets | Spacer | 12/0 | 0/0 | 0/0 | 0/0 | 0/0/0 | 0/0/0 |
| Slot (temporary - to be deprecated after native figma slots is introduced) | Slot | 0/**4** | 0/0 | 0/0 | 0/**1** | 0/0/0 | 0/0/0 |

## 5. Pilot sets — complete raw findings with node paths (VERIFIED)

### Buttons/Button (`3287:427074`, 118 variants)

| Class | Bound | Styled | Raw | Zero |
|---|---|---|---|---|
| padding | 382 | 0 | 122 | 192 |
| gap | 76 | 0 | 0 | 0 |
| radius | 102 | 0 | 0 | 72 |
| strokeWidth | 0 | 0 | 10 | 0 |
| effect | 0 | 22 | 0 | 0 |
| text | 0 | 76 | 0 | 0 |

**padding — 122 raw.** Values: `paddingTop=10` ×33, `paddingRight=14` ×14, `paddingBottom=10` ×33, `paddingLeft=14` ×14, `paddingRight=10` ×14, `paddingLeft=10` ×14

<details><summary><code>paddingTop=10</code> — 33 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Default, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=False [paddingTop]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=False [paddingTop]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=False [paddingTop]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=False [paddingTop]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=False [paddingTop]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=False [paddingTop]
- Size=md, Hierarchy=Primary, State=Default, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=True [paddingTop]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=True [paddingTop]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=True [paddingTop]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=True [paddingTop]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=True [paddingTop]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=True [paddingTop]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=True [paddingTop]
- Size=lg, Hierarchy=Secondary, State=Default, Icon only=False [paddingTop]
- Size=lg, Hierarchy=Secondary, State=Disabled, Icon only=False [paddingTop]
- Size=lg, Hierarchy=Secondary, State=Focused, Icon only=False [paddingTop]
- Size=lg, Hierarchy=Secondary, State=Hover, Icon only=False [paddingTop]
- Size=lg, Hierarchy=Secondary, State=Loading, Icon only=False [paddingTop]

</details>

<details><summary><code>paddingRight=14</code> — 14 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Default, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=False [paddingRight]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=False [paddingRight]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=False [paddingRight]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=False [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=False [paddingRight]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=False [paddingRight]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=False [paddingRight]

</details>

<details><summary><code>paddingBottom=10</code> — 33 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Default, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=False [paddingBottom]
- Size=md, Hierarchy=Primary, State=Default, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=True [paddingBottom]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=True [paddingBottom]
- Size=lg, Hierarchy=Secondary, State=Default, Icon only=False [paddingBottom]
- Size=lg, Hierarchy=Secondary, State=Disabled, Icon only=False [paddingBottom]
- Size=lg, Hierarchy=Secondary, State=Focused, Icon only=False [paddingBottom]
- Size=lg, Hierarchy=Secondary, State=Hover, Icon only=False [paddingBottom]
- Size=lg, Hierarchy=Secondary, State=Loading, Icon only=False [paddingBottom]

</details>

<details><summary><code>paddingLeft=14</code> — 14 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Default, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=False [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=False [paddingLeft]

</details>

<details><summary><code>paddingRight=10</code> — 14 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Default, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=True [paddingRight]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=True [paddingRight]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=True [paddingRight]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=True [paddingRight]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=True [paddingRight]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=True [paddingRight]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=True [paddingRight]

</details>

<details><summary><code>paddingLeft=10</code> — 14 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Default, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Default, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Default, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Disabled, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary, State=Focused, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Focused, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Focused, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary, State=Hover, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Hover, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary, State=Loading, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Primary_alt, State=Loading, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Hover, Icon only=True [paddingLeft]
- Size=md, Hierarchy=Secondary, State=Loading, Icon only=True [paddingLeft]

</details>

**strokeWidth — 10 raw.** Values: `1` ×7, `2` ×3

<details><summary><code>1</code> — 7 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Disabled, Icon only=False
- Size=md, Hierarchy=Primary, State=Disabled, Icon only=True
- Size=lg, Hierarchy=Primary, State=Disabled, Icon only=False
- Size=lg, Hierarchy=Primary, State=Disabled, Icon only=True
- Size=sm, Hierarchy=Primary, State=Disabled, Icon only=False
- Size=xxs, Hierarchy=Primary, State=Disabled, Icon only=False
- Size=sm, Hierarchy=Primary, State=Disabled, Icon only=True

</details>

<details><summary><code>2</code> — 3 node(s)</summary>

- Size=md, Hierarchy=Primary, State=Hover, Icon only=True
- Size=lg, Hierarchy=Primary, State=Hover, Icon only=True
- Size=sm, Hierarchy=Primary, State=Hover, Icon only=True

</details>

### Input field (`17517:11024`, 53 variants)

| Class | Bound | Styled | Raw | Zero |
|---|---|---|---|---|
| padding | 422 | 0 | 0 | 846 |
| gap | 118 | 0 | 0 | 18 |
| radius | 93 | 0 | 0 | 224 |
| strokeWidth | 0 | 0 | 93 | 0 |
| effect | 0 | 8 | 0 | 0 |
| text | 0 | 119 | 0 | 0 |

**strokeWidth — 93 raw.** Values: `1` ×93

<details><summary><code>1</code> — 93 node(s)</summary>

- Size=sm, Type=Default, Destructive=False, State=Filled > Input
- Size=sm, Type=Default, Destructive=False, State=Filled > Input > wrapper > Content > wrapper > optional
- Size=sm, Type=Search, Destructive=False, State=Filled > Input
- Size=sm, Type=Search + Tags, Destructive=False, State=Filled > Input
- Size=sm, Type=Default, Destructive=True, State=Filled > Input
- Size=sm, Type=Default, Destructive=True, State=Filled > Input > wrapper > Content > wrapper > optional
- Size=sm, Type=Search, Destructive=True, State=Filled > Input
- Size=sm, Type=Search + Tags, Destructive=True, State=Filled > Input
- Size=sm, Type=Default, Destructive=False, State=Focused > Input
- Size=sm, Type=Default, Destructive=False, State=Focused > Input > Content > wrapper > optional
- Size=sm, Type=Search, Destructive=False, State=Focused > Input
- Size=sm, Type=Search + Tags, Destructive=False, State=Focused > Input
- Size=sm, Type=Default, Destructive=False, State=Disabled > Input
- Size=sm, Type=Default, Destructive=False, State=Disabled > Input > Content > wrapper > optional
- Size=sm, Type=Search, Destructive=False, State=Disabled > Input
- Size=sm, Type=Search, Destructive=False, State=Disabled > Input > Content > wrapper > optional
- Size=sm, Type=Search + Tags, Destructive=False, State=Disabled > Input
- Size=sm, Type=Default, Destructive=True, State=Disabled > Input
- Size=sm, Type=Default, Destructive=True, State=Disabled > Input > Content > wrapper > optional
- Size=lg, Type=Default, Destructive=False, State=Placeholder > Input > Input
- Size=lg, Type=Default, Destructive=False, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=lg, Type=Password, Destructive=False, State=Placeholder > Input > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Placeholder > Input > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=sm, Type=Default, Destructive=False, State=Placeholder > Input
- Size=sm, Type=Default, Destructive=False, State=Placeholder > Input > Content > wrapper > optional
- Size=sm, Type=Search, Destructive=False, State=Placeholder > Input
- Size=sm, Type=Search, Destructive=False, State=Placeholder > Input > Content > wrapper > optional
- Size=sm, Type=Search + Tags, Destructive=False, State=Placeholder > Input
- Size=sm, Type=Search + Tags, Destructive=False, State=Placeholder > Input > Content > wrapper > optional
- Size=lg, Type=Default, Destructive=True, State=Placeholder > Input > Input
- Size=lg, Type=Default, Destructive=True, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=lg, Type=Password, Destructive=True, State=Placeholder > Input > Input
- Size=lg, Type=Leading icon, Destructive=True, State=Placeholder > Input > Input
- Size=lg, Type=Leading icon, Destructive=True, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=sm, Type=Default, Destructive=True, State=Placeholder > Input
- Size=sm, Type=Default, Destructive=True, State=Placeholder > Input > Content > wrapper > optional
- Size=sm, Type=Search, Destructive=True, State=Placeholder > Input
- Size=sm, Type=Search, Destructive=True, State=Placeholder > Input > Content > wrapper > optional
- Size=sm, Type=Search + Tags, Destructive=True, State=Placeholder > Input
- Size=sm, Type=Search + Tags, Destructive=True, State=Placeholder > Input > Content > wrapper > optional
- Size=lg, Type=Leading drowdown, Destructive=False, State=Placeholder > Input > Input
- Size=lg, Type=Leading drowdown, Destructive=False, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=lg, Type=Payment, Destructive=False, State=Placeholder > Input > Input
- Size=lg, Type=Payment, Destructive=False, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=lg, Type=Payment, Destructive=True, State=Placeholder > Input > Input
- Size=lg, Type=Payment, Destructive=True, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=lg, Type=Payment, Destructive=False, State=Disabled > Input > Input
- Size=lg, Type=Payment, Destructive=False, State=Disabled > Input > Input > Content > wrapper > optional
- Size=lg, Type=Payment, Destructive=True, State=Disabled > Input > Input
- Size=lg, Type=Payment, Destructive=True, State=Disabled > Input > Input > Content > wrapper > optional
- Size=lg, Type=Leading drowdown, Destructive=True, State=Placeholder > Input > Input
- Size=lg, Type=Leading drowdown, Destructive=True, State=Placeholder > Input > Input > Content > wrapper > optional
- Size=lg, Type=Leading drowdown, Destructive=False, State=Filled > Input > Input
- Size=lg, Type=Leading drowdown, Destructive=False, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Payment, Destructive=False, State=Filled > Input > Input
- Size=lg, Type=Payment, Destructive=False, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Payment, Destructive=True, State=Filled > Input > Input
- Size=lg, Type=Payment, Destructive=True, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Payment, Destructive=False, State=Focused > Input > Input
- Size=lg, Type=Payment, Destructive=False, State=Focused > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Leading drowdown, Destructive=True, State=Filled > Input > Input
- Size=lg, Type=Leading drowdown, Destructive=True, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Leading drowdown, Destructive=False, State=Focused > Input > Input
- Size=lg, Type=Leading drowdown, Destructive=False, State=Focused > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Leading drowdown, Destructive=False, State=Disabled > Input > Input
- Size=lg, Type=Leading drowdown, Destructive=False, State=Disabled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Leading drowdown, Destructive=True, State=Disabled > Input > Input
- Size=lg, Type=Leading drowdown, Destructive=True, State=Disabled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Default, Destructive=False, State=Filled > Input > Input
- Size=lg, Type=Default, Destructive=False, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Password, Destructive=False, State=Filled > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Filled > Input > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Default, Destructive=True, State=Filled > Input > Input
- Size=lg, Type=Default, Destructive=True, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Password, Destructive=True, State=Filled > Input > Input
- Size=lg, Type=Leading icon, Destructive=True, State=Filled > Input > Input
- Size=lg, Type=Leading icon, Destructive=True, State=Filled > Input > Input > wrapper > Content > wrapper > optional
- Size=lg, Type=Default, Destructive=False, State=Focused > Input > Input
- Size=lg, Type=Default, Destructive=False, State=Focused > Input > Input > Content > wrapper > optional
- Size=lg, Type=Password, Destructive=False, State=Focused > Input > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Focused > Input > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Focused > Input > Input > Content > wrapper > optional
- Size=lg, Type=Default, Destructive=False, State=Disabled > Input > Input
- Size=lg, Type=Default, Destructive=False, State=Disabled > Input > Input > wrapper > Content > optional
- Size=lg, Type=Password, Destructive=False, State=Disabled > Input > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Disabled > Input > Input
- Size=lg, Type=Leading icon, Destructive=False, State=Disabled > Input > Input > Content > wrapper > optional
- Size=lg, Type=Default, Destructive=True, State=Disabled > Input > Input
- Size=lg, Type=Default, Destructive=True, State=Disabled > Input > Input > Content > wrapper > optional
- Size=lg, Type=Leading icon, Destructive=True, State=Disabled > Input > Input
- Size=lg, Type=Leading icon, Destructive=True, State=Disabled > Input > Input > Content > wrapper > optional

</details>

### Modal (`4057:415205`, 1 variants)

| Class | Bound | Styled | Raw | Zero |
|---|---|---|---|---|
| padding | 6 | 0 | 0 | 6 |
| gap | 0 | 0 | 0 | 2 |
| radius | 4 | 0 | 0 | 3 |
| strokeWidth | 0 | 0 | 0 | 0 |
| effect | 0 | 0 | 0 | 0 |
| text | 0 | 0 | 0 | 0 |

**No raw values.**

### _Modal header (`4055:413620`, 1 variants)

| Class | Bound | Styled | Raw | Zero |
|---|---|---|---|---|
| padding | 3 | 0 | 0 | 21 |
| gap | 3 | 0 | 0 | 1 |
| radius | 1 | 0 | 0 | 7 |
| strokeWidth | 0 | 0 | 0 | 0 |
| effect | 0 | 0 | 0 | 0 |
| text | 0 | 2 | 0 | 0 |

**No raw values.**

### _Modal actions (`4057:414352`, 3 variants)

| Class | Bound | Styled | Raw | Zero |
|---|---|---|---|---|
| padding | 18 | 0 | 0 | 22 |
| gap | 4 | 0 | 0 | 3 |
| radius | 0 | 0 | 0 | 13 |
| strokeWidth | 0 | 0 | 0 | 0 |
| effect | 0 | 0 | 0 | 0 |
| text | 0 | 0 | 0 | 0 |

**No raw values.**

### Alert (`1130:81134`, 4 variants)

| Class | Bound | Styled | Raw | Zero |
|---|---|---|---|---|
| padding | 20 | 0 | 0 | 60 |
| gap | 16 | 0 | 4 | 0 |
| radius | 4 | 0 | 0 | 16 |
| strokeWidth | 0 | 0 | 4 | 0 |
| effect | 0 | 0 | 0 | 0 |
| text | 0 | 8 | 0 | 0 |

**gap — 4 raw.** Values: `12` ×4

<details><summary><code>12</code> — 4 node(s)</summary>

- Color=Brand > Content > wrapper
- Color=Default > Content > wrapper
- Color=Error > Content > wrapper
- Color=Success > Content > wrapper

</details>

**strokeWidth — 4 raw.** Values: `1` ×4

<details><summary><code>1</code> — 4 node(s)</summary>

- Color=Brand
- Color=Default
- Color=Error
- Color=Success

</details>

## 6. Spot checks (separate read-only call, VERIFIED)

| Finding | Re-read result |
|---|---|
| Buttons/Button `md, Primary, Default` padding raw | padding = 10/14/10/14, no padding bindings. Control `sm` = 6/8/6/8, all four bound |
| Alert `Color=Default` content wrapper gap raw 12 | `itemSpacing` = 12, vertical, not bound (`spacing-lg` = 12 exists) |
| Input field `sm, Default, Filled` stroke width raw | `strokeWeight` = 1, only stroke *colour* bound |
| Progress bar radius bound to spacing | `Progress=0%, Label=Right` › Progress bar: radius 8 bound to `3. Spacing/spacing-md` |

## 7. Implications for later tasks (PROPOSED, not approved)

- **P1-10 (Button/Input plan):** include binding `md` padding and all stroke widths, conditional on Proposal 0006 (`spacing.2_5`, `spacing.3_5`, `border-width`). Without 0006, `md` padding can only stay raw or change value — a visible change that needs Mike's approval.
- **P1-12 (Alert plan):** bind the content-wrapper gap to `spacing-lg` (same value, no visual change) and the 1 px border once a border-width token exists.
- **Modal set:** no raw spacing/radius/stroke/effect/text values. Clean baseline for the Slot pilot (P1-11).
- **Progress bar:** rebind radius from `spacing-md` to `radius-md` (same 8 px) — candidate for a later REPAIR item; not in any approved phase.
- **Regression (P1-08):** use these per-class counts as the binding baseline; any Phase 2 change must not increase `raw` for any class.

## 8. Limits

- Width/height bindings (`4. Widths`) and min/max sizes were not scanned.
- Effects: one effect per node is classified (the first visible one). Multi-effect stacks with mixed binding are not split.
- Text: a node with a text style is counted as styled even if individual segments override it (`textStyleId` mixed counts as raw).
- Non-pilot sets carry up to 2 sample paths per raw value; complete paths for those need a targeted re-run with `FULL` set.

## 9. Evidence and validation

- 6 general scan calls (29 pages, 95 owners) + 2 pilot full-path calls + 3 verification reads. All scripts reviewed for mutating calls before running; none present.
- Pilot counts identical between general and full runs (e.g. Buttons/Button padding 382 bound / 122 raw / 192 zero in both).
- `registry/components.json` rebuilt and validated (`scripts/build-registry.py`, every component has `bindingScan`).
- `design-tokens` read only (spacing/radius/proposal 0006 files); `git status` clean.

## Subscription status

**Current plan:** Tokens Studio Free (assumed; unverified) · **Workflow status:** Unblocked · **Paid features encountered:** none · **Upgrade required now:** No · **Next anticipated dependency:** direct Git sync (Team), only if D-03 chooses Tokens Studio.
