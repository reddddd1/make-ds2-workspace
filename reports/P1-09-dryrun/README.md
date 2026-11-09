# P1-09 — Token-sync dry-run: evidence

> 2026-11-09 · Spec `docs/token-sync-spec.md` **APPROVED** (Mike, "Approve as written"). Step 2 = read-only dry-run against the **original library** (approved default while no verified duplicate exists). **Write mode not approved (B-06). No Figma, variable or token was changed.**

## Result (VERIFIED) — see `dryrun.md` for every row

| Operation | Rows | Spec prediction (§7) |
|---|---|---|
| conflict | **0** | 0 |
| create | **1** — `color.gray.450` → `Colors/Gray (light mode)/450` `#8a8e97` | 1 |
| update-alias | **11** on 8 semantic colour variables (approved remaps, proposals 0002/0004; ΔE2000 1.6–25.5) | 11 |
| update-value | 0 | 0 |
| unchanged | 127 token×mode rows (116 primitive + 11 theme) | 119 variables (same set) |
| figma-only (kept) | 368 | 383 — the spec counted `4. Widths` + `5. Containers` (15) here; the dry-run classifies them `skip-out-of-scope` per spec §1 |
| skip-out-of-scope | 195 = 171 component colours + 15 Widths/Containers + 9 text-style tokens | — |

Assertions: deletes 0 · retypes 0 · renames 0 · writes performed 0 · target is the original → the write path would refuse it.

## Validation

| Check | Result |
|---|---|
| Collector reviewed for mutating calls (`scripts/token-sync/collect-variables.js`) | only variable getters and property reads |
| Variables read | 681 in 4 calls (= audit total) |
| Diff run twice | `dryrun.json`, `dryrun.md`, map file byte-identical |
| Second, independent Figma read | all 510 in-scope variables identical to the P1-06 read at 13:08 UTC (component colours read as IDs only) |
| Token repo | `git status` clean before and after; read-only |
| Original library untouched | P1-08 protection check (fingerprint + 180 pilot-variant hashes) vs the 14:12 baseline: **PASS** (`protection-check.md`) |

## Files

- `figma-variables-dryrun-1.json` — raw read (IDs, types, per-mode values / alias target IDs).
- `dryrun.json` / `dryrun.md` — the change set (rows, assertions, conflicts).
- `figma-variable-map.xJoAz66aekAToyhBmfGNt0.proposed.json` — seeded token → variable-ID map, status **proposed** (not approved, not used). Spec §2.6: IDs may not survive duplication; a map for the duplicate must be seeded and approved separately.
- `protection-after-p1-09.json`, `protection-check.{md,json}` — original-library protection evidence.

## What approval would be needed next (not requested now)

Any write needs Phase 2 approval **and** per-row approval of the 12 rows above, on the verified duplicate only (P1-03). Rerun the dry-run there first: variable IDs and the map must be re-seeded for that file.

## Subscription status

**Current plan:** Tokens Studio Free (assumed; unverified) · **Workflow status:** Unblocked · **Paid features encountered:** none · **Upgrade required now:** No · **Next anticipated dependency:** none for this path (scripted `use_figma` sync, D-03).
