# Token naming pilot — execution report

> 2026-11-09. Approved by Mike ("APPROVED: All 11 variable renames in reports/token-naming-pilot.md §2–§5. No rows are excluded."). Target: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. Write: 2026-11-09T20:21:15.748Z.
> Not done, as instructed: no commit, push or publish; no radius change; no Tailwind override; no registry sync; no change to the original library or the design-tokens repo; no further renames.

## Result: **PASS**

## 1. Execution sequence

| Step | Call | Result |
|---|---|---|
| Target check | every call refuses a file key other than `PpnTy1pkB2FTZFq6i6seSy` | file key confirmed: `PpnTy1pkB2FTZFq6i6seSy` |
| Before snapshot (read-only, `pilot-verify-read.js`) | 2026-11-09T20:20:33.905Z | 682 variables, 483 styles, 7 collections |
| Compare with approved baseline (final-review read 2026-11-09T19:59:53.156Z) | names, IDs, types, collections, modes, scopes, code syntax, publishing, alias counts, styles, per-component binding counts and fields | **no changes** since the approved baseline |
| Rename (`pilot-rename.js`, `APPLY = true`) | preflight inside the same call: file key, 11 old names, 11 target names free, count = 11; only mutation `variable.name = new` | `APPLIED`, in-call verify 11/11 ok |
| After snapshot (fresh call, read-only, same script) | 2026-11-09T20:21:51.507Z | used for all validation below; a separate call after the write = persisted |

## 2. Before → after mapping

| # | Variable ID | Type | Collection | Before | After | ID unchanged |
|---|---|---|---|---|---|---|
| 1 | `VariableID:5248:377715` | COLOR | `_Primitives` | `Colors/Brand/600` | **`color/brand/600`** | yes |
| 2 | `VariableID:23468:2` | COLOR | `_Primitives` | `Colors/Gray (light mode)/450` | **`color/gray/450`** | yes |
| 3 | `VariableID:5270:371419` | COLOR | `1. Color modes` | `Colors/Background/bg-brand-primary` | **`color/bg/brand-primary`** | yes |
| 4 | `VariableID:5353:380427` | COLOR | `1. Color modes` | `Colors/Background/bg-brand-primary_hover` | **`color/bg/brand-primary-hover`** | yes |
| 5 | `VariableID:6137:268549` | COLOR | `1. Color modes` | `Colors/Text/text-brand-primary` | **`color/text/brand-primary`** | yes |
| 6 | `VariableID:5263:373125` | COLOR | `1. Color modes` | `Colors/Text/text-error-primary` | **`color/text/error-primary`** | yes |
| 7 | `VariableID:5270:371435` | COLOR | `1. Color modes` | `Colors/Border/border-primary` | **`color/border/primary`** | yes |
| 8 | `VariableID:7371:212918` | COLOR | `1. Color modes` | `Colors/Effects/Focus rings/focus-ring-primary` | **`color/focus-ring/primary`** | yes |
| 9 | `VariableID:5253:372203` | FLOAT | `_Primitives` | `Spacing/3 (12px)` | **`spacing/3`** | yes |
| 10 | `VariableID:7407:110365` | FLOAT | `6. Typography` | `Font size/text-md` | **`font/size/base`** | yes |
| 11 | `VariableID:7405:102287` | STRING | `6. Typography` | `Font weight/semibold` | **`font/weight/semibold`** | yes |

## 3. Exact change counts

| Measure | Before | After | Expected | OK |
|---|---|---|---|---|
| Local variables | 682 | 682 | 682 / 682 | yes |
| Variable ID set | — | — | identical | yes |
| Variables whose fingerprint (name + collection, type, values per mode, scopes, code syntax, publishing, description, key) changed | — | 11 | exactly the 11 pilot IDs | yes |
| Of those 11: fields other than the name that changed | — | 0 | 0 | yes |
| Other 671 variables changed | — | 0 | 0 | yes |
| Collections (name, modes, variable count) | 7 | 7 | identical | yes |
| Local styles (count + digest of names and bound variable IDs) | 483 · `60523ba6` | 483 · `60523ba6` | identical | yes |
| Component bindings to the 11 IDs | 1722 | 1722 | 1,722 / 1,722 | yes |

## 4. Binding verification (per variable, per component)

Each count compares the before and after snapshot component by component and field by field (counting rule v2: one entry in `node.boundVariables` on own layers of main components).

| # | Variable (after) | Bindings before | after | Components | Per-component + per-field identical | Non-component layers before → after |
|---|---|---|---|---|---|---|
| 1 | `color/brand/600` | 0 | 0 | 0 | yes | 0 → 0 |
| 2 | `color/gray/450` | 0 | 0 | 0 | yes | 0 → 0 |
| 3 | `color/bg/brand-primary` | 151 | 151 | 15 | yes | 29 → 29 |
| 4 | `color/bg/brand-primary-hover` | 20 | 20 | 5 | yes | 0 → 0 |
| 5 | `color/text/brand-primary` | 30 | 30 | 2 | yes | 0 → 0 |
| 6 | `color/text/error-primary` | 34 | 34 | 3 | yes | 0 → 0 |
| 7 | `color/border/primary` | 420 | 420 | 22 | yes | 6 → 6 |
| 8 | `color/focus-ring/primary` | 167 | 167 | 18 | yes | 1 → 1 |
| 9 | `spacing/3` | 0 | 0 | 0 | yes | 0 → 0 |
| 10 | `font/size/base` | 716 | 716 | 21 | yes | 16 → 16 |
| 11 | `font/weight/semibold` | 184 | 184 | 21 | yes | 10 → 10 |

## 5. Alias and style verification

Outbound = what the variable points to (per mode); inbound = variables pointing to it. Both are compared as **ID lists**. Names below are the current (after) names.

| # | Variable (after) | Outbound aliases (after) | Outbound identical | Inbound (count before → after) | Inbound IDs identical | Styles (before → after) | Style list identical | Values per mode identical | Scopes · code syntax · publishing identical |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `color/brand/600` | — (raw value) | yes | 12 → 12 | yes | 1 → 1 | yes | yes | yes |
| 2 | `color/gray/450` | — (raw value) | yes | 1 → 1 | yes | 0 → 0 | yes | yes | yes |
| 3 | `color/bg/brand-primary` | Light mode → `color/brand/600`, Dark mode → `color/brand/600` | yes | 0 → 0 | yes | 0 → 0 | yes | yes | yes |
| 4 | `color/bg/brand-primary-hover` | Light mode → `Colors/Brand/700`, Dark mode → `Colors/Brand/700` | yes | 1 → 1 | yes | 0 → 0 | yes | yes | yes |
| 5 | `color/text/brand-primary` | Light mode → `color/brand/600`, Dark mode → `Colors/Brand/400` | yes | 0 → 0 | yes | 0 → 0 | yes | yes | yes |
| 6 | `color/text/error-primary` | Light mode → `Colors/Error/600`, Dark mode → `Colors/Error/400` | yes | 0 → 0 | yes | 0 → 0 | yes | yes | yes |
| 7 | `color/border/primary` | Light mode → `color/gray/450`, Dark mode → `Colors/Gray (dark mode)/600` | yes | 0 → 0 | yes | 0 → 0 | yes | yes | yes |
| 8 | `color/focus-ring/primary` | Light mode → `Colors/Brand/500`, Dark mode → `Colors/Brand/500` | yes | 0 → 0 | yes | 3 → 3 | yes | yes | yes |
| 9 | `spacing/3` | — (raw value) | yes | 1 → 1 | yes | 0 → 0 | yes | yes | yes |
| 10 | `font/size/base` | — (raw value) | yes | 0 → 0 | yes | 4 → 4 | yes | yes | yes |
| 11 | `font/weight/semibold` | — (raw value) | yes | 0 → 0 | yes | 16 → 16 | yes | yes | yes |

In-batch alias pairs resolve by ID after the rename: `color/bg/brand-primary` → `color/brand/600`, `color/text/brand-primary` (Light) → `color/brand/600`, `color/border/primary` (Light) → `color/gray/450`. The `Brand/600` paint style, the 3 focus-ring effect styles and the 16 + 4 text styles still reference the same IDs.

## 6. Naming collisions

- **Before the write:** the preflight inside the rename call confirmed no new name existed in its collection. The approved final-review read found no look-alikes and no same name in other collections.
- **After the write:** the other 671 variables are byte-identical, names included, so no new duplicate can have appeared. The 11 new names are distinct from each other.
- **Result: 0 collisions.**

## 7. Unexpected changes

**None.** The only differences between the before and after snapshots are the 11 `name` fields. 

Known limits of this validation (stated, not failures):
- For the 11 renamed variables, `description` and `key` are inside the combined fingerprint together with the name, so they are not compared separately. The write script sets only `name`.
- Instance-level overrides on page layers and nested-instance internals are not counted: bindings point to IDs, and a name-only change can't affect them.
- No visual screenshot or E1 variant-hash run: not in the required validation list, and a name change has no visual effect. Available on request.
- `collect-instances` (R-PENPOT-01) prints variable names, so its next run will show the 11 new names. That is expected; re-baseline it before the next comparison.

## 8. Rollback (not needed, ready)

`scripts/naming/pilot-rename.js` with `ROLLBACK = true` renames the 11 IDs back. It only runs if each variable still carries the pilot name, so it cannot overwrite a later manual change.

## Evidence

`reports/token-naming/pilot-execution/`: `before.json`, `write-result.json`, `after.json`, `validation.json`. Scripts: `scripts/naming/pilot-verify-read.js` (read-only), `pilot-rename.js`, `extract-tool-result.py`, `build-pilot-execution-report.py`.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.

