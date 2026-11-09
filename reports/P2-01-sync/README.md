# P2-01 — Token sync on the duplicate: report

> 2026-11-09 · Approvals (Mike, chat): start P2-01 ("Approve"), then **all 12 rows and the variable map ("Approve everything")**.
> Target: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original `xJoAz66aekAToyhBmfGNt0` was **not written**; a read check after the write confirms it is unchanged. Nothing was published. `design-tokens` was not changed (clean at `dcee093`).
> Labels: VERIFIED / UNVERIFIED / DECISION (Mike).

## 1. What was written (VERIFIED)

One `use_figma` call at 17:54:30 UTC: `scripts/token-sync/apply-changeset.js`. Its result is in `write-result.json` (`allOk: true`).

- **Guards:**
  - Refuses any file other than the duplicate.
  - Checks every precondition before the first write: each row's current alias, both modes, the target variables, and that R1 does not already exist.
- **R1:** created `Colors/Gray (light mode)/450` = `#8a8e97` in `_Primitives` (`VariableID:23468:2`). Scopes were copied from its sibling Gray/400 (`ALL_SCOPES`). Not hidden from publishing, same as the sibling.
- **R2–R12:** 11 alias updates (`setValueForMode`). Every row was read back and matches its target.
- **No other write calls:** nothing was deleted, renamed or retyped; no binding, style, component, code syntax or publish call.

## 2. Verification (fresh read-only calls after the write)

| Check | Expected | Result |
|---|---|---|
| Variable diff, 681 → 682 | +1 (R1); exactly 11 value slots changed; no name, type or scope change | **+1 · 11 slots · 0 other changes** ✓ |
| Post-sync dry-run (spec §5: idempotence) | 0 operations, 0 conflicts | **0 create / 0 update · 139 unchanged · 0 conflicts** ✓ (with the approved map, see §4) |
| Fingerprint | Only `_Primitives` 309 → 310 | ✓; styles 393/65/25/8 unchanged; collections and modes unchanged |
| `collect-variants` (E1), 180 pilot variants | Changes only where a fill uses a Light-mode-changed variable | **14 changed (all Buttons/Button `State=Hover`), 166 unchanged, 0 mismatches vs prediction.** Property definitions, variant counts and layer counts unchanged ✓ |
| `collect-instances` (E2), Modals page, 20 instances | Binding *values* change only where an approved variable is bound; counts, structure, text, overrides, linkage unchanged | **11 changed, all bind an approved variable; 9 unchanged, none do.** Binding counts, R-FIGMA-01, E2 hashes, linkage and icons unchanged ✓. The comparator's 2 R-PENPOT-01 "fails" are these expected value changes |
| Original library | 681 variables; `border-primary` = Gray/300 / Gray dark/700; no Gray/450 | ✓ unchanged (17:58 UTC) |
| Light screenshots, before (original) vs after (duplicate) | Visible changes on Button Hover and borders | Button Primary/Secondary/Link Hover darker; Alert border darker; `screens/` |
| **Dark screenshots** | — | **Not done:** switching a frame to Dark mode is a write outside this approval. Dark values were checked by reading each variable (R6 brand text 3.47 → 6.48:1, etc.). DECISION: a scratch frame in Dark mode on the duplicate, or wait for P2-08 |

## 3. Findings

1. **R4 does not reach the Input field's visible border.** The input box stroke is bound to `border-secondary` (Gray/200 `#e9eaeb`, about 1.2:1 on white). Only an inner `optional` frame uses `border-primary`. The Alert border does use `border-primary` and is now `#8a8e97` (3.28:1).
   - So the registry intent "Input border (default)" for `color.border.primary` doesn't match how Figma binds the inputs.
   - **DECISION:** either rebind the Input field box stroke to `border-primary` in P2-05 (a component change), or decide that the input border is a different token.
2. **`Size=lg, Link brand, Hover` uses `text-brand-secondary_hover`**, while every other Link-brand Hover uses `text-brand-primary-hover`. That's why it didn't change with R7. This is an existing inconsistency (add it to the Button pilot list).
3. **Primary Hover used to be *lighter* than Default** (Brand/500 vs 600). After R2 it is darker (Brand/700), as the registry intends.
4. **Checker limit:** the variant hash records resolved *fill* colours but not resolved *stroke* colours (it does record the bound stroke variable IDs). Border-colour changes show up in `collect-instances` (R-PENPOT-01) and in screenshots, not in R-PAPER-01. Possible E4 (stroke colours), not urgent.
5. **Tool fix: `dryrun.py --map`.** After R1 existed, the dry-run reported 2 false conflicts, because `color.gray.450` has no recorded Figma name to match on. It now reads the **approved** map file, as spec §2.3 says the map is the link. Without `--map`, the pre-write dry-run output is byte-identical to before.

## 4. Files

| File | Content |
|---|---|
| `change-set.md` | The 12 approved rows |
| `dryrun/` | Pre-write read (681 variables) and dry-run (1 create, 11 alias updates) |
| `write-result.json` | Write call result (before/after per row) |
| `after/figma-variables-after.json`, `after/dryrun.*` | Post-write read and dry-run (0 operations) |
| `after/variants-after.json`, `after/fill-vars-pilot.json` | R-PAPER-01 evidence and fill-variable attribution |
| `after/instances-modals-after.json`, `after/bound-vars-modals.json`, `after/cmp-instances-modals.*` | R-PENPOT-01 evidence and attribution |
| `screens/*-before.png` / `*-after.png` | Light screenshots of Button, Input field, Alert (original vs duplicate) |
| `../../sync/figma-variable-map.PpnTy1pkB2FTZFq6i6seSy.json` | **Approved** map, 128 pairs + `color.gray.450 → VariableID:23468:2` |

## 5. Rollback

`write-result.json` holds every row's previous alias. Restoring R2–R12 is 11 `setValueForMode` calls. Removing R1 means deleting a variable, which the sync spec never allows, so it would need Mike's explicit approval. Nothing to roll back at present: all checks passed.

## 6. New baselines for the next tasks

`after/variants-after.json` and `after/instances-modals-after.json` replace the P2-00 duplicate baselines for P2-02 onwards.

## Subscription status

**Current plan:** Tokens Studio Free (assumed; not used) · **Workflow status:** Unblocked · **Paid features encountered:** none · **Upgrade required now:** No · **Next anticipated dependency:** none.
