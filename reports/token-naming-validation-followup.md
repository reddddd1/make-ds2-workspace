# Token naming pilot — follow-up validation (consolidated)

> 2026-11-09, 20:30–20:50 UTC, duplicate `PpnTy1pkB2FTZFq6i6seSy` only. Authorised by Mike: "Naming Pilot Accepted, Validation Follow-up Approved". **Every Figma call in this follow-up was read-only.**
>
> **Not done:** no variable renamed, no value changed, nothing published, the original library and the token repo untouched (`design-tokens` git status: clean). Pilot report: `reports/token-naming-pilot-execution.md`. Migration plan: `reports/token-naming-migration-plan.md`.

## Result: **PASS**, with one item verified at value level only (Dark-mode visuals, §6)

| # | Requested check | Result |
|---|---|---|
| 1 | Reconcile 681 → 682 variables | **Explained, expected:** the +1 is `VariableID:23468:2` (`color/gray/450`), created by the approved P2-01 sync |
| 2 | Descriptions and keys of the 11 renamed variables | **Unchanged** (11/11 keys identical; descriptions empty before and after) |
| 3 | Refresh instance and naming baselines | **Done** (new baselines listed in §3) |
| 4 | Component-structure regression | **PASS**: 19/19 checks, 204/204 variant hashes identical |
| 5 | Light / Dark visual comparison | **Light: pixel-identical** (3 components, 0 of 2,740,620 pixels differ). **Dark: value-identical; not rendered** (needs a write; §6) |
| 6 | No unintended changes | **Confirmed**: whole-file variable diff since P2-01 = exactly the 11 names; instance bindings explained to the last line |

## 1. 681 → 682 variables

- **681:** every inventory up to and including the P2-01 pre-write read (P1-03, P1-06, P1-09, P2-00, P2-01 dry-run) was taken before the sync.
- **682:** P2-01 R1 created `VariableID:23468:2` (Gray light 450, `#8a8e97`) in `_Primitives` for the approved `border-primary` contrast fix. The fingerprint in that report reads "Only `_Primitives` 309 → 310".
- **ID check:**
  - the current 682 IDs = the 681 IDs in `reports/P2-01-sync/dryrun/figma-variables-duplicate.json` + `VariableID:23468:2`;
  - none missing, none other added.
- **The original library** still has 681 (P2-01 check); it was not read or written in this follow-up.

## 2. Descriptions and keys (11 renamed variables)

Read-only read after the pilot (`reports/naming-followup/desc-key-darkframes.json`), compared with the pre-rename final-review read (19:59 UTC):

- **Keys:** 11/11 identical.
- **Descriptions:** `""` → `""` for all 11.
- **Remote:** `false` for all.

This closes the limitation noted in the pilot report, where description and key were only inside a combined fingerprint.

## 3. Refreshed baselines (current duplicate state)

| Baseline | File | Content |
|---|---|---|
| Variables (naming baseline) | `reports/naming-followup/figma-variables-current.json` | All 682 variables, values per mode and alias targets. 5 read-only reads with `collect-variables.js`; one extra prefix read because 4 roles now start with lowercase `color/` |
| Component structure (E1) | `reports/naming-followup/variants-after-naming-pilot.json` | 6 pilot sets, 204 variants, file fingerprint |
| Instances (E2, R-PENPOT-01) | `reports/naming-followup/instances-modals-after-naming-pilot.json` | Modals page, 2 screens, 20 instances; **binding lines now print the new names** (re-baselined, as the pilot report required) |
| Naming audit | `reports/token-naming/audit.json`, `reports/token-rename-migration-map.md`, `reports/token-naming-conflicts.md` | Re-generated from the new variable baseline: 117 candidates, **11 marked DONE (pilot), 106 remaining**; checks C1–C13 unchanged |
| Usage | `reports/token-naming/live-usage-duplicate.json` | Kept (keyed by variable ID, counting rule v2). The pilot proved per-component binding counts identical after the rename, so it remains current |
| Sync dry-run (`--map`) | `reports/naming-followup/dryrun/` | **0 operations, 0 conflicts**, 139 unchanged, 682 read. The ID-based registry link is intact |

## 4. Component-structure regression (R-PAPER-01 + protection)

- **Collector:** `collect-variants.js` E1, read-only, 20:39 UTC, on Buttons/Button, Input field, Modal, _Modal header, _Modal actions and Alert.
- **Baseline:** the last pre-rename snapshot (P2-05 part 2, 19:29 UTC).
- **Command:** `compare.py`, protection mode (nothing may change). Report: `reports/naming-followup/pass-variants-vs-p2-05.md`.

**Result: PASS, 19/19 checks:**
- the file fingerprint (682 variables, 7 collections, styles 393/65/25/8, 0 missing) is unchanged;
- property definitions of all 6 sets are unchanged;
- no variant was removed;
- **all 204 variant hashes are identical** (they include bound variable IDs, layer names, property references and exposure flags).

## 5. Instance regression (R-PENPOT-01, R-FIGMA-01, linkage, icons)

- **Collector:** `collect-instances.js` E2, read-only, 20:40 UTC, duplicate Modals page.
- **Extra field for this run:** each binding hash was also computed with the 11 old names substituted back in (`bindHashOldNames`). This separates a name change from a real change.
- **Baseline:** the last E2 snapshot of this page (`reports/P2-01-sync/after/instances-modals-after.json`, 17:57 UTC).

| Check | Result |
|---|---|
| Screens, instance set | 2 screens, 20 instances; same IDs |
| Linkage, missing/extra layers vs main (R-FIGMA-01), text (`textHash`), nested-component overrides, property values, icons from the MAKER Icon library | **Identical for 20/20** |
| Binding counts | Identical for 20/20 (e.g. Radio group 343, _Date picker menu 940) |
| Binding lines with Light, Dark and effective values, old names restored | **19/20 identical** to the baseline. **Screen-level own bindings (79 + 85) identical** |
| The 1 remaining instance: `_Date picker menu` `21214:6370` | **Fully explained:** its nested Input fields carry P2-01b's approved border rebinding (`border-secondary` → `border-primary`, made after this baseline). Restoring the 11 old names **and** those 4 P2-01b bindings reproduces the baseline hash exactly (`a0a37151`). No other difference |
| Bindings that use a renamed variable | 119 across the 20 instances, all resolving to the same values in Light and Dark |

P2-01b's report states "No Input field instances on the duplicate's Modals page"; the ones inside `_Date picker menu` are nested in another component, so they weren't counted there. This nested effect is recorded here for the first time. It is the approved P2-01b change, not a pilot effect.

## 6. Visual comparison

**Light mode: pixel-identical.** The same nodes at the same render sizes as the last pre-rename screenshots, compared with `scripts/naming/pixel-diff.cjs` (pixelmatch, threshold 0, anti-aliasing included):

| Component | Before (pre-rename) | After (this follow-up) | Pixels | Differing |
|---|---|---|---|---|
| Buttons/Button (all 143 variants) | `reports/P2-03-button-pressed/button-after.png` | `reports/naming-followup/screens/button-light-after-naming.png` | 1,611,200 | **0** |
| Input field (all 53 variants) | `reports/P2-05-input-normalise/input-after-properties.png` | `…/input-light-after-naming.png` | 833,400 | **0** |
| Alert (4 variants) | `reports/P2-06a-alert-icons/alert-after.png` | `…/alert-light-after-naming.png` | 296,020 | **0** |

**Dark mode: verified by value, not rendered.**
- **Why no render:** a read-only scan found only one frame in the whole duplicate set to Dark mode: a 128 × 40 documentation badge. Showing Button, Input field or Alert in Dark mode means setting a frame's variable mode, which is a write this follow-up isn't authorised to make.
- **Evidence instead:**
  - Every Dark-mode value of all 682 variables is unchanged (§7).
  - Each of the 20 instance binding lines (including its Dark value) is identical after name normalisation (§5).
  - A rename can't change a value.
- **Decision D-4:**
  - (a) approve a temporary Dark-mode frame on a scratch page of the duplicate, with instances of the 3 components; screenshot it, then delete it;
  - (b) accept the value-level evidence;
  - (c) cover Dark visuals in P2-08 (login screens in Light and Dark).

## 7. No unintended changes

| Scope | Comparison | Result |
|---|---|---|
| All 682 variables | Current export vs the P2-01 after-export (17:57 UTC), all fields except names | **Exactly 11 names changed; 0 differences** in values per mode, alias targets (IDs), types, scope counts and collections. 11 alias *display names* changed, because those aliases point to renamed variables (same IDs) |
| Variants | §4 | 204/204 identical |
| Instances | §5 | All differences attributed (renames + approved P2-01b) |
| Styles | Pilot after-read, 20:21 UTC | 483 styles, digest identical |
| Registry link | Dry-run `--map` | 0 operations |
| Token repo | `git status` | Clean |

## 8. Tooling added (all read-only or local)

| File | Purpose |
|---|---|
| `scripts/naming/pixel-diff.cjs` | Local PNG comparison (pngjs 7.0.0 + pixelmatch 5.3.0, installed only in the scratch folder) |
| `scripts/naming/build-migration-plan.py` | Generates the migration plan and per-batch mapping files |
| `scripts/naming/build-naming-audit.py` | Now reads the post-pilot variable export and marks renamed rows `DONE (pilot)`. Risk is judged on the original name |
| `collect-instances.js` (copy for this run only) | Added `bindHashOldNames` / `ownHashOldNames` / `renamedBindings`. The repository version is unchanged |

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
