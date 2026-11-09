# Pilot plan — Buttons/Button & Input field (P1-10, D-04)

> **Status: PLAN ONLY — APPROVED FOR PLANNING (D-04).** Nothing here is implemented. All changes are for the **verified duplicate** in an approved Phase 2; the original `xJoAz66aekAToyhBmfGNt0` is never edited. Labels: **VERIFIED** (read from Figma on 2026-11-09, evidence in `reports/P1-10-pilot/`), **PROPOSED** (recommendation), **UNVERIFIED** (needs a probe or test), **DECISION** (Mike).
> Inputs: registry (P1-04/05), token mapping & dry-run (P1-06/09), regression checkers (P1-08), token-repo specs `specs/components/button.md` and `text-field.md`.

## 1. Current state (VERIFIED)

### Buttons/Button (`3287:427074`, 118 variants)

- Axes: Size `xxs/sm/md/lg` × Hierarchy `Primary/Primary_alt/Link brand/Secondary` × State `Default/Hover/Focused/Disabled/Loading` × Icon only `False/True` = 160 combinations, **118 exist** (Link brand has no icon-only; Primary_alt has no Disabled; `xxs` is partial).
- Properties: BOOLEAN `Loading text`, `Show L icon`, `Show R icon` + 4 variant axes. **No TEXT, no INSTANCE_SWAP.**
- Structure (non-icon-only): `Icon wrapper` (L, `visible ← Show L icon`) → `Text padding › Text` → `Icon wrapper` (R, `visible ← Show R icon`). Link brand has `Text` directly (no `Text padding`). Icon-only: one `Icon wrapper`. Loading: `Buttons/Button loading icon` + text (`visible ← Loading text`).
- Counts: **76** variants with a label text layer (56 at `Text padding › Text`, 20 Link brand at `Text`), default `{CTA Label}`. **153** `Icon wrapper` instances: 60 leading + 60 trailing + 33 icon-only. **25** Loading variants (16 with label).
- `Icon wrapper` (MAKER Icon library, remote, key `b8295cee…`) carries its own INSTANCE_SWAP `Icon` (default `squircle-dashed`, 1 preferred value) plus `Currency`, `Crypto` swaps.
- Hover today (md, Icon only=False): Primary fill `bg-brand-primary_hover` (→ Brand/500), label `text-white`; Primary_alt fill primitive `Green lime/500`, label `text-primary_on-brandsecondary`; Link brand label `text-brand-primary-hover`; Secondary fill `utility-brand-25` (component colour, D-05), label `text-brand-primary-hover`.
- **10 Hover variants are identical to their Default** (all Primary_alt and Secondary icon-only; P1-08 hashes): `md/lg/sm/xxs Primary_alt`, `md/lg/sm Primary_alt icon-only`, `md/lg/sm Secondary icon-only`.
- From P1-05: `Size=md` padding is entirely unbound (10/14 px; no token exists until proposal 0006); stroke widths unbound everywhere.

### Input field (`17517:11024`, 53 variants)

- Axes: Size `lg/sm` × Type (7) × Destructive × State `Placeholder/Filled/Focused/Disabled` = 112 combinations, **53 exist**; types are tied to sizes (Search types only `sm`; Payment, Password, Leading dropdown, Leading icon only `lg`).
- Properties: **4 variant axes only — no BOOLEAN, TEXT or INSTANCE_SWAP.** No Hover/Pressed state.
- Structure is **inconsistent across variants**: **16 different text-layer layouts** for 53 variants; a label-like text exists in only **15–22** of 53 variants (15 with a strict reading: layers literally named or reading `Label`/`Phone number`/`Card number`, or `Password` next to a masked value; 22 with the lenient rule used in appendix A — e.g. `Card number` is placeholder text in Placeholder variants but a label in Filled); 0–4 text layers per variant. `Helper text` (nested component) is present in all 53. 79 `Icon wrapper` instances, 18 hidden (Destructive variants hide the trailing icon).
- This is the structure behind pilot finding **F2** (variant switch dropped "Helper text") and **C-8**.

### Consumer usage — pilot scratch `uMQLqPDG5I4rZAAHlhpInJ` (VERIFIED)

- 44 instances: **26 Buttons/Button** (`md Link brand Default` ×14, `lg Primary Default` ×8, `lg Primary Loading` ×2, `lg Secondary Default` ×2) and **18 Input field** (`lg Password Filled` ×6, `lg Default Filled` ×4, `lg Default Placeholder` ×4, `lg Password Placeholder` ×2, `lg Default Destructive Filled` ×2). All linked to the library; 0/0 layer divergence (P1-08).
- **All 26 button labels are text overrides** ("Sign in", "Forgot password?", "Signing in…" …). Input labels/values are overrides too ("Email", "alex@make.test", error message).
- Icons: 8 `arrow-right` (button trailing), 6 `eye`, 2 `info`, 2 `circle-alert`, and **16 visible `squircle-dashed` placeholders** inside Input field instances (no property to hide or swap them from the parent).

## 2. Proposed changes

### 2.1 Buttons/Button — TEXT property (PROPOSED)

| Property | Type | Default | Bound to | Variants affected |
|---|---|---|---|---|
| `Label` | TEXT | `Button` (replaces `{CTA Label}`) — DECISION | `characters` of the label `Text` layer | **76** (all `Icon only=False`, incl. 16 Loading variants); 42 icon-only variants unaffected |

Loading uses the same `Label` (consumers set "Signing in…"); `Loading text` stays as the visibility boolean.

### 2.2 Buttons/Button & Input field — parent-level icon swap (PROPOSED, one mechanism to choose)

The glyph lives **inside** the remote `Icon wrapper` (its `Icon` swap). A component property on Buttons/Button can only be applied to layers the component owns, not to layers inside a nested instance — **UNVERIFIED for the Plugin API; must be probed on the duplicate before choosing.**

| Option | What changes | Pros | Cons / risk |
|---|---|---|---|
| **B — expose nested instances** (recommended first step) | Set the `Icon wrapper` instances as **exposed instances** (60 L + 60 R + 33 icon-only on Button; up to 79 on Input field) | No structural change; existing glyph overrides (8 `arrow-right`) are untouched; `Icon` swap and its preferred values come from the Icon library | Two levels in the properties panel; preferred values controlled by the Icon library (currently 1) |
| **A1 — parent INSTANCE_SWAP on the wrapper's glyph** (audit §6.2 Option A) | `Icon leading` / `Icon trailing` on Buttons/Button bound to the glyph inside `Icon wrapper` | One-level control, preferred values set on Button | **Only if the probe shows it is possible**; otherwise not available |
| **A2 — restructure** | Replace each `Icon wrapper` with a sized frame + glyph instance, then add `Icon leading` / `Icon trailing` INSTANCE_SWAP (preferred values: MAKER Icon library keys) | One-level control | **Structural change on 153 layers** (R-FIGMA-01 risk); existing glyph overrides may reset; icon colour binding must be re-applied |

Preferred values for A1/A2 (PROPOSED, all from the MAKER Icon library): the glyphs already used in the pilot (`arrow-right`, `eye`, `info`, `circle-alert`) plus the default `squircle-dashed`; Mike/design extends the list. Icons are never detached and never taken from community kits (`docs/icon-library-strategy.md` §6.3).

### 2.3 Buttons/Button — `State=Pressed` (PROPOSED)

- New option `Pressed` on the `State` axis, created **for every combination that has `Hover`: 25 variants** (md 7, lg 7, sm 7, xxs 4; Primary 4+3, Primary_alt 4+3, Link brand 4, Secondary 4+3). **118 → 143 variants.**
- Each Pressed variant is a copy of its Hover sibling: **same variable bindings** (not values), same structure, same effects (spec `button.md`: "Pressed (touch) = hover"). Because it binds the hover *variable*, the approved hover remap (P1-09: `bg-brand-primary_hover` Brand/500 → brand.700) flows into Pressed automatically when the token sync runs.
- **DECISION:** the 10 Hover variants identical to Default (Primary_alt, Secondary icon-only) would give **no pressed feedback**. Options: accept (scope = login uses Primary/Secondary text buttons only), or limit Pressed to the 15 combinations where Hover differs, or design a distinct pressed look (design change).
- No consumer instance uses Pressed today → no existing instance changes.

### 2.4 Input field — TEXT properties (PROPOSED, depends on a structure DECISION)

| Property | Bound to | Variants | Note |
|---|---|---|---|
| `Value` | the value/placeholder text layer | **50–52** (`sm Search + Tags Disabled` has no text layer; 2 more depend on the label/value reading) | Placeholder and value share one layer per variant |
| `Label` | the label text layer | **15–22** today | Only where a label layer exists; exact set confirmed on the duplicate (appendix A) |
| `Hint` | text inside nested `Helper text` | **0** directly | Not bindable from Input field (nested instance). Needs Option B (expose `Helper text`) or a TEXT property on the `Helper text` component itself |

Per-variant layer mapping: appendix A (generated from the read).

**DECISION before any Input field change:** with 16 layouts and a label in only 15 of 53 variants, TEXT properties will behave differently per variant and a variant switch can still lose content (F2). Options: (a) **normalise structure first** — one layout (label row / input box / message row, as in `specs/components/text-field.md`) across all 53 variants, then add properties — a structural change needing its own approval and the full regression suite; (b) bind only where layers exist and accept the inconsistency; (c) limit the pilot to the login variants (`lg Default` and `lg Password`, 4 states × Destructive = 13 variants) and normalise those first. **Recommended: (c)**, then extend.

No Pressed/Hover for Input field: not in the spec (inputs use Focused).

## 3. Expected counts per change (for R-PAPER-01)

| Change | Set | In scope (must change) | Out of scope (must not change) | Variant total after |
|---|---|---|---|---|
| `Label` TEXT prop | Buttons/Button | 76 (`Icon only=False`) | 42 (`Icon only=True`) | 118 |
| Expose `Icon wrapper` (Option B) | Buttons/Button | 118 (every variant has ≥ 1 wrapper except the 25 Loading → **93**) | 25 Loading | 118 |
| `State=Pressed` | Buttons/Button | 25 new variants; each must equal its Hover sibling's feature hash | 118 existing | **143** |
| `Value` / `Label` TEXT props (option c) | Input field | 13 login variants | 40 | 53 |

Instance-level (pilot scratch, 26 buttons + 18 inputs): every label/value override **unchanged** (text equal to baseline), 8 `arrow-right` glyphs unchanged, 100% linked, 0 new layer divergence.

## 4. Regression plan (Phase 2, per change, on the duplicate)

**Prerequisites (small checker enhancements, PROPOSED, before any Phase 2 write):**
- **E1** `collect-variants.js`: include `componentPropertyReferences` and `isExposedInstance` in each layer's feature line — today a property binding does **not** change a variant hash, so R-PAPER-01 could not see TEXT-property or exposure changes.
- **E2** `collect-instances.js`: record each text layer's characters (hashed) and each nested glyph's component key per instance — today override loss would not be detected.
- Re-baseline after E1/E2 (on the duplicate), then run P1-08 `selftest.py`.

**Per change:**
1. Baseline: `collect-variants` (set + fingerprint), `collect-instances` (scratch screens, and the duplicate's own usage), `collect-slots` not needed.
2. Change on the duplicate (one change per approval).
3. Current: same collectors in a fresh call.
4. `compare.py` with a spec: R-PAPER-01 scope from §3 (e.g. `{"sets":{"Buttons/Button":{"scope":{"Icon only":["False"]}}}}`); R-FIGMA-01 0 new divergence; R-PENPOT-01 bindings + Light/Dark/effective values unchanged on the scratch screens; icons from library only; linkage 100%.
5. For Pressed: variant count 118 → 143 (`allowAdded`), and each Pressed hash = its Hover hash.
6. Light **and** Dark screenshots of the 10 login screens before/after; visual diff only where intended (none for TEXT props and exposure).
7. Persistence: re-read in a separate call; after file reload where practical.

## 5. Risks

| Risk | Where | Mitigation |
|---|---|---|
| Override loss when a text layer is bound to a new TEXT property | 26 button labels, 18 input texts | Expected to be preserved by Figma (**UNVERIFIED** here) — test on one duplicate instance first; E2 check |
| Variant switch drops a layer (F2/C-8) | Input field (16 layouts) | Structure decision §2.4; R-FIGMA-01 after every `setProperties` |
| Nested-instance property binding not possible | Option A1 | Probe first; fall back to Option B |
| Restructuring breaks glyph overrides / icon colour bindings | Option A2 | Only with explicit approval; R-FIGMA-01 + icon check + R-PENPOT-01 |
| Pressed gives no feedback | 10 combos (Primary_alt, Secondary icon-only) | DECISION §2.3 |
| Hover colour changes with token sync | Primary/Secondary hover & Pressed | Intended (approved remap); sequence: Pressed bound to the same variable, so one sync covers both |
| Unbound `md` padding and stroke widths copied into Pressed | 7 md + all Pressed | Parity with Hover today; bind later when proposal 0006 is decided |
| Placeholder glyph visible in consumer screens | 16 Input field instances | Out of D-04 scope; needs a visibility boolean or Option B + swap — note for P1-13 |

## 6. Decisions requested (none blocks the rest of Phase 1)

1. Button `Label` default text (`Button` proposed).
2. Icon-swap mechanism: Option B first (recommended), A1 only if the probe allows it, A2 only with explicit approval.
3. Pressed scope: all 25, the 15 with distinct hover, or a new pressed design for Primary_alt.
4. Input field approach: normalise login variants first (recommended), all 53, or bind-as-is.
5. Approve checker enhancements E1/E2 as part of Phase 2 preparation.

## Appendix A — Input field text layers per variant (VERIFIED read, roles PROPOSED)

Generated from `reports/P1-10-pilot/raw-input.json`. Path = child-index path inside the variant. Role heuristic: `Optional` = optional tag; `JP` = country code; `Label`/`Phone number`/`Card number`, or the first of two candidate texts = LABEL; otherwise VALUE. Confirm on the duplicate before binding.

| Variant (Size, Type, Destructive, State) | Text layers → proposed role | Icon wrappers |
|---|---|---|
| sm, Default, False, Filled | `0.0.0.0.1.0` VALUE ({Text})<br>`0.0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search, False, Filled | `0.0.1.0` LABEL (Search)<br>`0.0.1.1.0.0` VALUE ({Search string}) | 2 |
| sm, Search + Tags, False, Filled | `0.0.1.2` VALUE (Larry) | 2 |
| sm, Default, True, Filled | `0.0.0.0.1.0` VALUE ({Text})<br>`0.0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search, True, Filled | `0.0.1.0` LABEL (Search)<br>`0.0.1.1.0.0` VALUE ({Search string}) | 2 |
| sm, Search + Tags, True, Filled | `0.0.1.2` VALUE (Larry) | 2 |
| sm, Default, False, Focused | `0.0.0.1.0` VALUE ({Text})<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search, False, Focused | `0.0.1.0` LABEL (Search)<br>`0.0.1.1.0.0` VALUE ({Search string}) | 2 |
| sm, Search + Tags, False, Focused | `0.0.1.2` VALUE (Larry) | 2 |
| sm, Default, False, Disabled | `0.0.0.1.0` VALUE ({Text})<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search, False, Disabled | `0.0.0.1.0` LABEL (Search)<br>`0.0.0.1.1.0` VALUE ({Search string})<br>`0.0.0.1.2.0` optional tag (Optional) | 2 |
| sm, Search + Tags, False, Disabled | — none — | 2 |
| sm, Default, True, Disabled | `0.0.0.1.0` VALUE ({Text})<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| lg, Default, False, Placeholder | `0.0.0.0.0.0` VALUE (Placeholder text)<br>`0.0.0.0.0.1.0` optional tag (Optional) | 1 |
| lg, Password, False, Placeholder | `0.0.0.0.0.0` VALUE (Password) | 1 |
| lg, Leading icon, False, Placeholder | `0.0.0.0.1.0` VALUE (Placeholder text)<br>`0.0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Default, False, Placeholder | `0.0.0.1.0` VALUE (Placeholder text)<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search, False, Placeholder | `0.0.0.1.0` VALUE (Search)<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search + Tags, False, Placeholder | `0.0.0.1.0` VALUE (Search)<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| lg, Default, True, Placeholder | `0.0.0.0.0.0` VALUE (Placeholder text)<br>`0.0.0.0.0.1.0` optional tag (Optional) | 1 |
| lg, Password, True, Placeholder | `0.0.0.0.0.0` VALUE (Password) | 1 |
| lg, Leading icon, True, Placeholder | `0.0.0.0.1.0` VALUE (Placeholder text)<br>`0.0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Default, True, Placeholder | `0.0.0.1.0` VALUE (Placeholder text)<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search, True, Placeholder | `0.0.0.1.0` VALUE (Search)<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| sm, Search + Tags, True, Placeholder | `0.0.0.1.0` VALUE (Search)<br>`0.0.0.1.1.0` optional tag (Optional) | 2 |
| lg, Leading drowdown, False, Placeholder | `0.0.0.0.0` country code (JP)<br>`0.0.0.1.0.0` VALUE (+34 600 123 456)<br>`0.0.0.1.0.1.0` optional tag (Optional) | 2 |
| lg, Payment, False, Placeholder | `0.0.0.0.1.0` LABEL (Card number)<br>`0.0.0.0.1.1.0` optional tag (Optional) | 0 |
| lg, Payment, True, Placeholder | `0.0.0.0.1.0` LABEL (Card number)<br>`0.0.0.0.1.1.0` optional tag (Optional) | 0 |
| lg, Payment, False, Disabled | `0.0.0.0.1.0` VALUE (5424 9812 1891 9015)<br>`0.0.0.0.1.1.0` optional tag (Optional) | 0 |
| lg, Payment, True, Disabled | `0.0.0.0.1.0` VALUE (5424 9812 1891 9015)<br>`0.0.0.0.1.1.0` optional tag (Optional) | 0 |
| lg, Leading drowdown, True, Placeholder | `0.0.0.0.0` country code (JP)<br>`0.0.0.1.0.0` VALUE (+34 600 123 456)<br>`0.0.0.1.0.1.0` optional tag (Optional) | 2 |
| lg, Leading drowdown, False, Filled | `0.0.0.0.0` country code (JP)<br>`0.0.0.1.0` LABEL (Phone number)<br>`0.0.0.1.1.0.0` VALUE (+34 600 123 456)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 2 |
| lg, Payment, False, Filled | `0.0.0.1.0` LABEL (Card number)<br>`0.0.0.1.1.0.0` VALUE (5424 9812 1891 9015)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 0 |
| lg, Payment, True, Filled | `0.0.0.1.0` LABEL (Card number)<br>`0.0.0.1.1.0.0` VALUE (5424 9812 1891 9015)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 0 |
| lg, Payment, False, Focused | `0.0.0.1.0` LABEL (Card number)<br>`0.0.0.1.1.0.0` VALUE (5424 9812 1891 9015)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 0 |
| lg, Leading drowdown, True, Filled | `0.0.0.0.0` country code (JP)<br>`0.0.0.1.0` LABEL (Phone number)<br>`0.0.0.1.1.0.0` VALUE (+34 600 123 456)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 2 |
| lg, Leading drowdown, False, Focused | `0.0.0.0.0` country code (JP)<br>`0.0.0.1.0` LABEL (Phone number)<br>`0.0.0.1.1.0.0` VALUE (+34 600 123 456)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 2 |
| lg, Leading drowdown, False, Disabled | `0.0.0.0.0` country code (JP)<br>`0.0.0.1.0` LABEL (Phone number)<br>`0.0.0.1.1.0.0` VALUE (+34 600 123 456)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 2 |
| lg, Leading drowdown, True, Disabled | `0.0.0.0.0` country code (JP)<br>`0.0.0.1.0` LABEL (Phone number)<br>`0.0.0.1.1.0.0` VALUE (+34 600 123 456)<br>`0.0.0.1.1.0.1.0` optional tag (Optional) | 2 |
| lg, Default, False, Filled | `0.0.0.0.0` LABEL (Label)<br>`0.0.0.0.1.0.0` VALUE ({Text})<br>`0.0.0.0.1.0.1.0` optional tag (Optional) | 1 |
| lg, Password, False, Filled | `0.0.0.0` LABEL (Password)<br>`0.0.0.1.0.0` VALUE (●●●●●●●●) | 1 |
| lg, Leading icon, False, Filled | `0.0.0.0.0` LABEL (Label)<br>`0.0.0.0.1.1.0` VALUE ({Text})<br>`0.0.0.0.1.1.1.0` optional tag (Optional) | 2 |
| lg, Default, True, Filled | `0.0.0.0.0` LABEL (Label)<br>`0.0.0.0.1.0.0` VALUE ({Text})<br>`0.0.0.0.1.0.1.0` optional tag (Optional) | 1 |
| lg, Password, True, Filled | `0.0.0.0.0` LABEL (Password)<br>`0.0.0.0.1.0.0` VALUE (●●●●●●●●) | 1 |
| lg, Leading icon, True, Filled | `0.0.0.0.0` LABEL (Label)<br>`0.0.0.0.1.1.0` VALUE ({Text})<br>`0.0.0.0.1.1.1.0` optional tag (Optional) | 2 |
| lg, Default, False, Focused | `0.0.0.0.0.0` VALUE ({Text})<br>`0.0.0.0.0.1.0` optional tag (Optional) | 1 |
| lg, Password, False, Focused | `0.0.0.0.0` LABEL (Password)<br>`0.0.0.0.1.0.0` VALUE (●●●●●●●●) | 1 |
| lg, Leading icon, False, Focused | `0.0.0.0.1.0` VALUE ({Text})<br>`0.0.0.0.1.1.0` optional tag (Optional) | 2 |
| lg, Default, False, Disabled | `0.0.0.0.0.0` LABEL (Label)<br>`0.0.0.0.0.1` VALUE ({Text})<br>`0.0.0.0.0.2.0` optional tag (Optional) | 1 |
| lg, Password, False, Disabled | `0.0.0.0.0.0` VALUE (●●●●●●●●) | 1 |
| lg, Leading icon, False, Disabled | `0.0.0.0.1.0` VALUE ({Text})<br>`0.0.0.0.1.1.0` optional tag (Optional) | 2 |
| lg, Default, True, Disabled | `0.0.0.0.0.0` VALUE ({Text})<br>`0.0.0.0.0.1.0` optional tag (Optional) | 1 |
| lg, Leading icon, True, Disabled | `0.0.0.0.1.0` VALUE ({Text})<br>`0.0.0.0.1.1.0` optional tag (Optional) | 2 |

Variants with a LABEL layer: **22** — sm, Search, False, Filled; sm, Search, True, Filled; sm, Search, False, Focused; sm, Search, False, Disabled; lg, Payment, False, Placeholder; lg, Payment, True, Placeholder; lg, Leading drowdown, False, Filled; lg, Payment, False, Filled; lg, Payment, True, Filled; lg, Payment, False, Focused; lg, Leading drowdown, True, Filled; lg, Leading drowdown, False, Focused; lg, Leading drowdown, False, Disabled; lg, Leading drowdown, True, Disabled; lg, Default, False, Filled; lg, Password, False, Filled; lg, Leading icon, False, Filled; lg, Default, True, Filled; lg, Password, True, Filled; lg, Leading icon, True, Filled; lg, Password, False, Focused; lg, Default, False, Disabled.

