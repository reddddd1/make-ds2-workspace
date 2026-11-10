# Stale names after the naming pilot — references and proposed metadata updates (FOR REVIEW, nothing applied)

> 2026-11-09. Decision 2: "approved for planning and validation".
>
> - **Stable identifier:** the Figma variable ID. It is identical in the original and the duplicate (P1-03), and a rename never changes it.
> - **Status:** nothing has been modified. The token repo is untouched (`git status` clean), and so is the approved map. The three diffs below were made and tested on scratch copies, and each passes `git apply --check` against the real files.

## 1. Every reference to the 11 old names

Searched both repositories for the 11 exact pre-pilot names (`git`/`node_modules` excluded):

| Where | Files (refs) | What it is | Proposed action |
|---|---|---|---|
| `design-tokens/tokens/**` | 6 files, **17 entries**: 4 primitives with the full Figma name; 6 roles × 2 themes with the short name (`bg-brand-primary` …); `color.gray.450` with no Figma name at all | Registry metadata `$extensions["com.make.source"].figma` | **Update, metadata only** (diff A) |
| `design-tokens/audit/**`, `proposals/0001`, `0003`, `0005` | 10 files (7 audit, 3 proposals) | Dated audit of the **original** library and historic proposals | Keep (historical record; the original still uses the old names) |
| `sync/figma-variable-map.PpnTy1pkB2FTZFq6i6seSy.json` (approved map) | 11 `figmaName` fields | Token ↔ variable link; the ID is authoritative, the name is informational | **Update the 11 `figmaName` fields** (diff B) |
| `scripts/token-sync/dryrun.py` | — (logic, see §3) | Seeds token ↔ variable by name when run without `--map` | **Tool fix:** seed by ID first (diff C) |
| `scripts/naming/pilot-rename.js`, `build-pilot-review.py`, `build-migration-plan.py` | 3 | Pilot mapping, rollback, documentation of exceptions | Keep (rollback needs the old names) |
| `scripts/token-sync/apply-changeset.js`, `scripts/components/rebind-input-border.js`, `scripts/build-token-mapping.py` | 3 | Completed one-off scripts (P2-01, P2-01b, P1-06) | Keep. `rebind-input-border.js` checks the old name in a precondition, so a re-run would **refuse safely** |
| `docs/token-sync-spec.md` (3), `docs/token-naming-convention.md` (3), `docs/project-handoff.md` (1) | 3 | Examples and status text | Keep. Optional later wording for `token-sync-spec.md` §4 "creates use the target group's naming style" once groups are migrated |
| `registry/raw/*`, `registry/components.json`, `reports/**` | ~40 | Dated snapshots and evidence | Keep (evidence must not be rewritten) |

## 2. Diff A — registry metadata (`design-tokens`, proposed)

File: `reports/naming-followup/stale-names/design-tokens-registry-metadata.diff` (6 files, +51 / −17).

For each of the 11 tokens, inside `$extensions["com.make.source"]` only:
- `figma` → the current Figma name in the refactor library;
- `figmaLegacy` → the pre-pilot name (still the name in the original library and in older reports);
- `figmaVariableId` → the stable ID. This is what TOKEN-CONTRACT §5 already asks for: "and the Figma variable ID when there is one".

| Token | Files | `figma` before → after | `figmaVariableId` |
|---|---|---|---|
| `color.brand.600` | primitives/color | `Colors/Brand/600` → `color/brand/600` | `VariableID:5248:377715` |
| `color.gray.450` | primitives/color-a11y | *(none, `custom: true`)* → `color/gray/450` (no legacy name; created in P2-01) | `VariableID:23468:2` |
| `spacing.3` | primitives/spacing | `Spacing/3 (12px)` → `spacing/3` | `VariableID:5253:372203` |
| `font.size.base` | primitives/typography | `Font size/text-md` → `font/size/base` | `VariableID:7407:110365` |
| `font.weight.semibold` | primitives/typography | `Font weight/semibold` → `font/weight/semibold` | `VariableID:7405:102287` |
| `color.bg.brand-primary` | themes/light + dark | `bg-brand-primary` → `color/bg/brand-primary` | `VariableID:5270:371419` |
| `color.bg.brand-primary-hover` | themes/light + dark | `bg-brand-primary_hover` → `color/bg/brand-primary-hover` | `VariableID:5353:380427` |
| `color.text.brand-primary` | themes/light + dark | `text-brand-primary` → `color/text/brand-primary` | `VariableID:6137:268549` |
| `color.text.error-primary` | themes/light + dark | `text-error-primary` → `color/text/error-primary` | `VariableID:5263:373125` |
| `color.border.primary` | themes/light + dark | `border-primary` → `color/border/primary` | `VariableID:5270:371435` |
| `color.focus-ring.primary` | themes/light + dark | `focus-ring-primary` → `color/focus-ring/primary` | `VariableID:7371:212918` |

**What does not change:** token keys, values, aliases, types, descriptions, tiers. Checked on the scratch copy:
- **all 10 token files are identical outside `com.make.source`;**
- `npm run validate`: `tokens valid (primitives=118 semantic=8 theme:dark=11 theme:light=11)`, the same as now;
- `npm test`: **29/29 pass**, before and after (Node 26.13.0 LTS; dependencies installed in the scratch copy only).

**Alternative** (if you prefer `figma` to keep describing the original library): leave `figma` as is and add only `figmaVariableId` (+ `figmaDuplicate`). Diff A's layout makes that a two-line change per entry.

**Process (after approval):** per TOKEN-CONTRACT §6, the change goes in as `proposals/0007-figma-variable-ids/` with a `PROPOSAL.md`, then `npm run check`, then your merge. Nothing is written to `tokens/` directly.

## 3. Diff C — dry-run seeding by ID (workspace tool, proposed)

File: `reports/naming-followup/stale-names/dryrun-id-first-seeding.diff` (one block, `scripts/token-sync/dryrun.py`).

**Problem found while validating diff A:** without `--map`, the dry-run matches tokens to Figma variables by name. There are two issues:
- for `1. Color modes` it keeps only names starting with `Colors/`, so the renamed roles (`color/…`) are dropped;
- its short-name fallback becomes ambiguous (`color/text/brand-primary` and `color/bg/brand-primary` both shorten to `brand-primary`).

**Fix:** use `figmaVariableId` first, then the exact full name, then (legacy) the short name; accept both `Colors/` and `color/`.

| Dry-run (current Figma export, 682 variables) | No `--map` | With `--map` (approved map) |
|---|---|---|
| Current tool + current registry | **17 false "create"**, 0 conflicts | 0 operations ✓ |
| Current tool + registry diff A | 6 false creates, **7 conflicts** | 0 operations ✓ |
| **Fixed tool + registry diff A** | **0 operations ✓** | **0 operations ✓** |
| Fixed tool + current registry | 17 creates (honest: names are stale) | 0 operations ✓ |

**Backward compatibility:** on the pre-pilot P2-01 export, the fixed tool produces **byte-identical** `dryrun.json`, `dryrun.md` and proposed map compared with the current tool.

## 4. Diff B — approved map `figmaName` (workspace, proposed)

File: `reports/naming-followup/stale-names/sync-map-figmaName.diff`.

- **Changed:** 11 entries, `figmaName` only.
- **Unchanged:** variable IDs, collections, statuses and `lastSynced`; header fields (`fileKey`, `status: approved`, `spec`) identical.
- The map stays approved because the identity (ID) is unchanged. Applying this diff updates a display field.

## 5. Order if approved

1. Diff C (tool) → 2. Diff B (map) → 3. Diff A via `proposals/0007-…` (token repo). After each step, both dry-runs must report 0 operations.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
