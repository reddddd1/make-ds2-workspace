# P1-08 — Read-only regression checkers: verification report

> 2026-11-09 · Phase 1 · read-only. Scripts: `scripts/regression/` (see its README). Figma files: original library `xJoAz66aekAToyhBmfGNt0` and pilot scratch `uMQLqPDG5I4rZAAHlhpInJ`. No Figma file, variable or token was changed.

## 1. Pass runs — baseline vs current, two independent Figma reads (VERIFIED)

| Check | Target | Verdict | Checks | Failed | Known issues | Baseline read (UTC) | Current read (UTC) |
|---|---|---|---|---|---|---|---|
| `variants-library` | Library (original): 6 pilot sets, 180 variants + file fingerprint | **PASS** | 19 | 0 | 0 | 14:12:03 | 14:14:15 |
| `slots-library` | Library (original): Modal instances (getInstancesAsync) | **PASS** | 5 | 0 | 0 | 14:12:04 | 14:14:17 |
| `instances-library-modals` | Library (original): Modals page, 2 frames, 20 instances | **PASS** | 15 | 0 | 3 | 14:12:09 | 14:14:21 |
| `instances-scratch` | Pilot scratch: 10 login screens, 72 instances | **PASS** | 71 | 0 | 0 | 14:12:16 | 14:14:28 |
| `slots-scratch` | Pilot scratch: Modal instances (page scan) | **PASS** | 1 | 0 | 0 | 14:12:19 | 14:14:30 |

Each comparison was run twice; the two report sets are byte-identical. Reports: `pass-*.md` / `pass-*.json`; snapshots: `snapshots/`.

**What the pass runs establish (baseline state, VERIFIED):**

- Pilot scratch: 72/72 instances linked to the library (`linked-remote`), **0 missing / 0 extra layers vs main** (R-FIGMA-01), 1728 bindings captured with Light/Dark/effective values (R-PENPOT-01), 84 icon wrappers and 84 glyphs, all from the library. 5 dark screens carry an explicit `1. Color modes = Dark mode`.
- Library: 6 pilot sets (Buttons/Button 118, Input field 53, Modal 1, _Modal header 1, _Modal actions 3, Alert 4) hashed per variant; fingerprint 681 variables / 7 collections / 393 paint, 65 text, 25 effect, 8 grid styles. Variant hashes were also identical to a pre-fix read at 14:09 UTC (third independent read).
- Modal: 1 instance in the library (legacy `Drawer content` swap → local `Slot`), 0 in the pilot scratch. `limitViolations`: API not present in this Plugin API version.

## 2. Deliberate mismatches — edited JSON, not Figma (VERIFIED)

`python3 -I scripts/regression/selftest.py reports/P1-08-regression` → exit 0. Inputs and reports in `selftest/`.

| Scenario | Edit | Expected | Got | First failing check |
|---|---|---|---|---|
| `r-paper-01-partial-change` | Change reaches only `Hierarchy=Primary, State=Default` (7 variants); spec scope = all Primary (35) | FAIL | **FAIL** ✓ | [Buttons/Button] R-PAPER-01 expected = actual changed variants — expected 35, actual 7; NOT changed: Size=md,  |
| `r-paper-01-full-change` | Control: change reaches all 35 Primary variants, nothing else | PASS | **PASS** ✓ | — |
| `protection-mismatch` | One Alert variant hash + variable count 681→680 in baseline | FAIL | **FAIL** ✓ | file fingerprint (variables, collections, styles) unchanged — baseline {'collections': [['_Primitives', 309, ' |
| `r-penpot-01-binding-lost` | Binding hash of one instance on a dark screen | FAIL | **FAIL** ✓ | [D1 Sign in — default — dark (AI generate] R-PENPOT-01 bindings + Light/Dark/effective values unchanged — Inpu |
| `r-figma-01-layer-dropped` | Instance lost `Helper text` (pilot F2 pattern) | FAIL | **FAIL** ✓ | [L1 Sign in — default (AI generated)] R-FIGMA-01 instance layer tree = main (no new divergence) — Input field: |
| `linkage-new-orphan` | Baseline says linked; current orphan | FAIL | **FAIL** ✓ | [Playground do not delete] linkage: no new orphan/detached instance — _Modal header (orphan) |
| `icon-source-local` | One glyph no longer from the library | FAIL | **FAIL** ✓ | [L3 Sign in — loading (AI generated)] icons from library only (no new violation) — Input field: wrappers 2/2 l |
| `r-slot-01-content-and-count` | Slot-region hash + instance count | FAIL | **FAIL** ✓ | instance count unchanged — 2 → 1 (getInstancesAsync) |

## 3. Findings (VERIFIED)

1. **Hidden layers are omitted from instance reads by default.** `figma.skipInvisibleInstanceChildren` is `true` in this environment; with it, every instance looked structurally different from its main (false R-FIGMA-01 failures on all 72 scratch instances). The collectors set it to `false` (plugin-runtime option, not stored in the file). With that, instance and main trees match exactly. Any future structural check must do the same.
2. **3 orphan instances on the library Modals page** ("Playground do not delete"): two `_Modal header/Center aligned/Mobile` and one `Pagination dot group` whose main components no longer exist. Listed as known baseline issues; any new orphan fails.
3. **No pilot F2 regression present now:** after the hidden-layer fix, all 72 scratch instances match their mains (0/0). The F2 pattern (dropped `Helper text`) is covered by self-test scenario `r-figma-01-layer-dropped`.

## 4. Limits

- R-PENPOT-01 resolves Light, Dark and effective values in a fresh call; the literal Light→Dark→Light mode toggle is a write and belongs to Phase 2 (duplicate only).
- `updatedAt` is not available through the Plugin API; protection uses per-variant content hashes + file fingerprint. Hashes cover structure, visibility, bindings, layout numbers, size, text, fills, effect style and nested-instance component keys — not every possible property (e.g. constraints, export settings).
- Visual diff (criterion 4 in `regression-checks.md`) is not part of these checkers; it needs screenshots in Phase 2.
- Collectors return ≤ 48 KB per call; large pages must be split with `FRAME_IDS` / fewer `SET_IDS`.

## Subscription status

**Current plan:** Tokens Studio Free (assumed; unverified) · **Workflow status:** Unblocked · **Paid features encountered:** none · **Upgrade required now:** No · **Next anticipated dependency:** direct Git sync (Team), only if D-03 chooses Tokens Studio.
