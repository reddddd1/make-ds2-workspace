# Colour variable naming migration: plan (not executed)

- **Date:** 2026-11-11
- **File:** DS duplicate `PpnTy1pkB2FTZFq6i6seSy` ("MAKER DS v2 (WIP Refactor)")
- **Status:** read-only so far. **No variable was renamed, and the Tokens Studio adapter was not changed.** I generated an adapter preview in a throwaway copy outside the repo.
- **Scope:** names of COLOR variables only. IDs, keys, values, modes, aliases, scopes, codeSyntax, styles and bindings stay the same. Canonical `tokens/` stays the same; this was checked by diff.
- **Out of scope:** radius, typography, spacing (whose names are also mixed), global Tailwind, paint/text/effect **style** names, and the semantic migration of component colours.

## 1. Inventory (read-only, 2026-11-11 07:47 UTC)

The file has 570 COLOR variables: 278 in `_Primitives` and 292 in `1. Color modes`. **8** already use `color/…`. **562** still use old names. No variable has codeSyntax set. The 2026-11-10 baseline names match the current names (0 drift).

| Layer | Old groups | Variables | Registry-bound |
|---|---|---|---|
| Primitives (`_Primitives`) | `Colors/<Family>/<step>` (25 families + Base) | 276 | 36 |
| Semantic (`1. Color modes`) | `Colors/Text` 25, `Background` 40, `Border` 11, `Foreground` 19, `Effects/Shadows` 17, `Effects/Focus rings` 3 | 115 | 7 |
| Component (`1. Color modes`) | `Component colors/Utility` 127, `Alpha` 20, `Components/*` 24 | 171 | 0 |
| **Total to rename** | | **562** | **43** |

## 2. Mapping rules (deterministic; `build-color-rename-map.mjs`)

Figma `/` is the registry `.`. The normalisation follows ADR-0004.

| Rule | Old | New | Example |
|---|---|---|---|
| R1 primitives | `Colors/<Family>/<step>` | `color/<family-slug>/<step>` | `Colors/Gray (dark mode)/600` → `color/gray-dark/600` |
| R1 base | `Colors/Base/<x>` | `color/<x>` | `Colors/Base/white` → `color/white` |
| R2 semantic | `Colors/<Role>/<prefix>-<leaf>` | `color/<role>/<leaf>` (Text→text, Background→bg, Border→border, Foreground→fg, Focus rings→focus-ring, Shadows→shadow) | `Colors/Background/bg-primary_hover` → `color/bg/primary-hover` |
| R3 utility | `Component colors/Utility/<F>/utility-<f>-<step>[_alt]` | `color/utility/<f>/<step>[-alt]` | `utility-brand-600_alt` → `color/utility/brand/600-alt` |
| R3 alpha | `Component colors/Alpha/alpha-<x>` | `color/alpha/<x>` | `alpha-white-90` → `color/alpha/white-90` |
| R3 components | `Component colors/Components/…/<leaf>` | `color/component/<leaf>` | `button-primary-icon_hover` → `color/component/button-primary-icon-hover` |
| Leaf normalisation | drop `(900)`; `on-brandprimary` → `on-brand-primary`; `_` and spaces → `-`; lowercase | | `text-primary (900)` → `color/text/primary` |
| R0 registry wins | a registry-bound variable gets exactly its registry key | | see exception E1 |

Family slugs:

- `Gray (light mode)` → `gray`
- `Gray (dark mode)` → `gray-dark`
- `Gray (dark mode alpha)` → `gray-dark-alpha`
- `Rosé` → `rose`
- Two-word families take a hyphen: `blue-dark`, `gray-iron`, `green-lime`, etc.

## 3. Collisions and exceptions

**Blocking: 0.**

| Check | Result |
|---|---|
| Two old names mapping to one new name (same collection) | 0 |
| New name already used by another variable | 0 |
| Same name in both collections | 0 |
| A name that is both a leaf and a group (this would break the Tokens Studio tree) | 0 |
| Registry-bound new names = registry keys | 43/43 (1 needed R0) |

The exceptions below need a yes or no from you. The defaults are shown.

| # | Item | Default |
|---|---|---|
| E1 | `text-primary_on-brandprimary` becomes `color/text/primary-on-brand` (registry key), not the rule's `primary-on-brand-primary`. Its siblings become `primary-on-brand-secondary` and `primary-on-brand-tertiary` | Keep the registry key, because canonical keys don't change |
| E2 | 12 shade hints are dropped, e.g. `text-primary (900)` → `color/text/primary`. Values don't change; only the hint in the name goes | Drop them (ADR-0004) |
| E3 | `Base` is flattened: `color/white`, `color/black`, `color/transparent` | Flatten them (registry keys) |
| E4 | `shadow-skeumorphic-inner(-border)` keeps the misspelling | Keep it. Fixing the spelling is not a mechanical rule, so it needs a separate yes |
| E5 | The 171 component colours get a **cosmetic** rename only (`color/utility`, `color/alpha`, `color/component`). They have no registry tokens. Merging or retiring them stays **deferred** | Include them as batch N2 |

## 4. Tokens Studio adapter (preview only, not committed)

- `figma-binding.pilot.json`: **43** `figmaName` values change, each to the token's own registry path (`color.text.success-primary` → `color/text/success-primary`). After this, every colour token's Figma name equals its registry key.
- The generated sets lose their `Colors` top-level group: primitives become `color`, `Spacing`, `spacing`, and the themes become `color` only. `$themes.json` keeps the same **85 variable keys** under the new names.
- Checked by variable key: 98/98 token entries have the same value or alias target. `npm run check:tokens-studio` ✔. `tokens/` is byte-identical.
- **Ordering rule:** Tokens Studio matches variables by name. While Figma and the adapter disagree, an export would create 43 duplicates. So the Figma N1 rename and the adapter change ship in the same window, and **nobody exports in between**.

## 5. Component and screen impact

- Components, styles, aliases and screens reference variables **by ID**, so renaming changes no binding. The 19 auth screens (section `23610:7`) keep all 97 local instances, 4 Icon-library icons and all bound paints.
- **Visible change:** only the names shown in the variables panel, the binding pickers and Dev Mode. There is no codeSyntax to update.
- **Not changed:** the paint-style panel keeps its `Colors/…` style names. That's a separate, optional step.
- **Library publish:** renames are carried as normal variable updates, and consumer bindings follow the variable key. The DS isn't published yet.

## 6. Procedure (two batches, one session)

| Step | Action | Pass condition |
|---|---|---|
| 0 | Name a Figma version checkpoint "pre-colour-naming". Take a digest of the DS (`figma-snapshot.js` digest mode) and compare it with `ds-baseline-digest.json` | Styles, text, effect and bindings digests are unchanged since 11-10 |
| 1 | **Scratch first:** apply the N1 rows that exist in the scratch file, update the scratch file's adapter branch, and export in Tokens Studio | 0 creates; second export is idempotent |
| 2 | **N1 (391: primitives + semantic):** run `rename-N1-forward.js`. Preflight is all-or-nothing, and it reverts itself if a write throws | `ok: true`, 391 written, 0 duplicate names |
| 3 | Snapshot (vars + styles + bindings), then `compare-snapshots.mjs BEFORE AFTER --renames map-N1.json` | `RENAME-ONLY`: 391 EXPECTED-RENAME, 0 VALUE/ALIAS/META/STYLE/BINDING |
| 4 | Commit the adapter change on `tokens-studio/b3-spacing` (Mike pushes). In Tokens Studio, pull and export the pilot themes to the DS | 0 creates; digest unchanged afterwards |
| 5 | **N2 (171 component colours):** run `rename-N2-forward.js`, then compare with `--renames map-N2.json` | `RENAME-ONLY`: 171 |
| 6 | Re-run the auth-screen check on section `23610:7` | 101 instances (97 local), all paints bound, all text styled |

**Rollback:** run `rename-N*-rollback.js`. It uses the same rows reversed and its own preflight; it was tested as a round trip. Alternatively restore the step-0 version checkpoint. Then revert the adapter commit. Rollback is safe at any step, because no ID, value or binding changes.

## 7. Tooling (prepared and tested, offline)

| File | Status |
|---|---|
| `build-color-rename-map.mjs` → `color-rename-map.json` | deterministic, exit 0, 0 blocking |
| `rename-colors.template.js` and `make-rename-payloads.mjs` → `payloads/rename-N{1,2}-{forward,rollback}.js` | N1 27.8k chars, N2 19.5k chars (limit 50k) |
| `compare-snapshots.mjs --renames` | new classes EXPECTED-RENAME (pass) and RENAME-MISSING (block); self-test **18/18** |
| Offline simulation | full map over the 11-10 baseline → `RENAME-ONLY` (562). Mock run: forward, a refused re-run, then rollback → names identical |

## 8. Estimate

- **Agent:** about 1–1.5 h in one session. N1 including the scratch test is about 1 h; N2 is about 15 min.
- **Mike:** about 15 min: approve, push the adapter commit, and watch the Tokens Studio export.
- **Recommendation:** **2 batches**, N1 then N2, back to back. N1 is tied to the adapter; N2 is cosmetic and can be dropped or postponed without affecting N1.
