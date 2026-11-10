# D-G1 — Spacing coverage: 10px and 14px tokens + bindings (duplicate)

> 2026-11-10. Approved by Mike: "MAKE DS2 — D-G1 Approved: Spacing Coverage. I approve Option A for D-G1." Alias names `spacing-2_5` / `spacing-3_5` chosen by Mike.
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original library is untouched; nothing was published.
> - **Not changed:** the 171 component colours, radius, all existing token values, Tailwind defaults. No `gap-tight` / `gap-default` / `gap-loose`.
> - **Nothing committed** in either repository.

## Result: **PASS** — 203 / 203 hardcoded values bound; 0 remain

## 1. Token registry (`design-tokens`, uncommitted)

| Change | Detail |
|---|---|
| `tokens/primitives/spacing.tokens.json` | +`spacing.2_5` = 10px, +`spacing.3_5` = 14px (key style of `0_5` / `1_5`); `$extensions` carries `tailwind`, `figma` and `figmaVariableId`. No other key, value, alias or type changed |
| `proposals/0007-spacing-2-5-3-5/` | `PROPOSAL.md` (why, alternatives, validation, quoted approval) + the proposed file |
| `CHANGELOG.md` | One entry under Unreleased |

The full diff is in `design-tokens.diff`.

**Validation:**

- `npm run validate`: ✔ primitives 118 → 120.
- `npm run check`: 29/29.
- `dist/` resolved tokens: 137 → 139, only the two new tokens added (light and dark).
- Naming collision checks C1–C13: unchanged.

**Tailwind (4.3.5)**, from `scripts/naming/compile-check.mjs` scenario S5, 60/60:

- New steps:
  - `p-2.5` → `padding: calc(var(--spacing) * 2.5)`;
  - `px-3.5` → `padding-inline: calc(var(--spacing) * 3.5)`;
  - `py-2.5`, `gap-2.5` and `gap-3.5` work the same way.
- Existing utilities are unchanged: `p-0.5`, `p-1.5`, `p-2`, `p-3`, `px-4`, `gap-1`, and the 48 earlier checks.
- No per-step variable is emitted. Spacing stays the single `--spacing` multiplier.

## 2. Figma variables (approved sync process)

| Step | Result |
|---|---|
| Live read before (`figma-spacing-before.json`) | Identical to the last sync dump (49 spacing variables) |
| Dry-run before (`dryrun-before/`) | **create 2** (`spacing.2_5`, `spacing.3_5`), conflicts 0, deletes / renames / retypes 0 |
| Write (`scripts/components/dg1-create-spacing-variables.js`, `create-result.json`) | `_Primitives` `spacing/2_5` = 10 (`VariableID:23540:2`), `spacing/3_5` = 14 (`VariableID:23540:4`), scopes `[]` and hidden from publishing, like their siblings. `3. Spacing` `spacing-2_5` → `spacing/2_5` (`VariableID:23540:3`), `spacing-3_5` → `spacing/3_5` (`VariableID:23540:5`), scope `GAP`, like `spacing-md`. `_Primitives` 310 → 312, `3. Spacing` 17 → 19. Nothing deleted or recreated |
| Map | `sync/figma-variable-map.PpnTy1pkB2FTZFq6i6seSy.json`: 2 entries + history line |
| Dry-run after (`dryrun-after/`) | **0 operations**: unchanged 139 → 141, conflicts 0. The two `3. Spacing` aliases appear as figma-only (+2), as for every `3. Spacing` variable: the registry has no such tier |

The Figma display name follows convention §8 (`spacing/2_5`, as for the renamed `spacing/3`). The dry-run suggested `Spacing/2_5` from its sibling's legacy capitalisation. New variables appear at the end of their collection; the Plugin API cannot reorder them.

## 3. Bindings — before / after

Written by `scripts/components/dg1-bind-spacing.js` (`bind-result.json`). It is one atomic call. The precondition required the exact counts below; only `setBoundVariable` was used.

| # | Where | Field | Value | Before | After | Variable |
|---|---|---|---|---|---|---|
| M4 | Button root, md (text: Primary, Primary_alt, Secondary, 6 states each) | paddingTop / Bottom | 10 | 36 hardcoded | 36 bound | `spacing-2_5` |
| M4 | Button root, md icon-only (same 18 variants) | all 4 paddings | 10 | 72 hardcoded | 72 bound | `spacing-2_5` |
| M4 | Button root, **lg Secondary** (6 states, text) | paddingTop / Bottom | 10 | 12 hardcoded | 12 bound | `spacing-2_5` |
| M5 | Button root, md (text) | paddingLeft / Right | 14 | 36 hardcoded | 36 bound | `spacing-3_5` |
| M2 | Input field `optional` tag wrapper | gap | 10 | 41 hardcoded | 41 bound | `spacing-2_5` |
| M3 | `_Modal header` `Content/wrapper` | gap | 10 | 1 hardcoded | 1 bound | `spacing-2_5` |
| M1 | Input field `…/Content/wrapper` | gap | 6 | 5 hardcoded | 5 bound | `spacing-sm` |
| | **Total** | | | **203** | **203** (0 hardcoded) | 162 / 36 / 5 |

Correction to the audit wording: 12 of the 120 vertical 10px paddings are on **lg Secondary** Buttons (lg Primary uses 12px). The count of 120 was right; the label "md" was not. Link brand Buttons have no padding.

**Coverage, login components** (`gap-spacing-audit-before.json` → `gap-spacing-audit-after.json`):

| Component | Gaps hardcoded | Paddings hardcoded | Non-zero gaps bound | Non-zero paddings bound |
|---|---|---|---|---|
| Button | 0 → 0 | **156 → 0** | 96 / 96 | 492 → **648 / 648** |
| Input field | **46 → 0** | 0 → 0 | 252 → **298 / 298** | 418 / 418 |
| Alert | 0 | 0 | 20 / 20 | 20 / 20 |
| Modal | 0 | 0 | — | 6 / 6 |
| `_Modal header` | **1 → 0** | 0 | 3 → **4 / 4** | 3 / 3 |
| `_Modal actions` | 0 | 0 | 4 / 4 | 18 / 18 |
| **Total** | **47 → 0** | **156 → 0** | 89 % → **100 %** | 85 % → **100 %** |

All bindings use the semantic `3. Spacing` collection. There are no primitive or remote spacing bindings (G2).

## 4. Regression

| Check | Result |
|---|---|
| In-call guard | Every bound field reads back its original value and the intended variable; width/height and every gap/padding number unchanged on 204 variants and 541 Auto Layout frames; **196 existing instances** keep their size |
| E1 variant hashes (`variants-before.json` → `variants-after.json`) | Variant IDs, property definitions and the file fingerprint (styles, collections, 686 variables) are unchanged. Changed hashes, exactly where bindings were added: Button **42 / 150** (36 md + 6 lg Secondary), Input field **40 / 53**, `_Modal header` **1 / 1**. `_Modal actions` **3 / 3**: its nested lg Secondary Button instances inherit the new padding binding (same value). Alert 0 / 4, Modal 0 / 1 |
| Pixel diff, Light (whole sets) | **Pixel-identical**, 0 differing pixels: Button 2,096,612 px, Input field 3,291,760 px, `_Modal header` 371,200 px, Modal 1,211,072 px |
| Dark mode | `_Primitives` and `3. Spacing` have a single mode, so the bound values are the same in Light and Dark by construction. No colour binding was touched; the script only wrote gap/padding bindings |
| Persistence | Re-read in separate calls after the write (audit, E1, dry-run read): all bindings present |

## Login readiness (criteria G1–G4)

All six login component sets now **PASS G1–G4**: Button, Input field, Alert, Modal, `_Modal header`, `_Modal actions`.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
