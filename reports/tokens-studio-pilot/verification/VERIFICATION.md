# Tokens Studio pilot: verification of the 17 primitive changes and sync baseline

- **Date:** 2026-11-10, 15:20–15:50 UTC
- **Approved by Mike:** "focused verification task … Do not expand synchronization yet."
- **Files involved:**
  - DS duplicate `PpnTy1pkB2FTZFq6i6seSy`
  - Untouched reference: the original library `xJoAz66aekAToyhBmfGNt0` (read only)
  - New scratch file **"DS2 – Tokens Studio idempotency test (scratch)"** `WVQqJt4NTRSzDbR6Qqv7tn` (MAKE Design drafts; contains test fixtures only)
- **Writes:**
  - Scratch file: a fixture and 2 Tokens Studio exports.
  - DS duplicate: **1 Tokens Studio export of the unchanged pilot tokens (export #2)**. It is proven to have changed nothing (§5).
- **Not touched:**
  - the original library
  - publishing
  - `tokens/`
  - the test branch: not merged, no new commits
  - anything outside the 30 pilot variables

## Answer in one paragraph

Tokens Studio **did change values, not only serialization**, but only for **4 of the 17** pilot primitives. Those 4 held colours with more precision than 8 bits per channel; Tokens Studio rewrote them as the exact 8-bit value of the registry hex.

- The largest per-channel shift is **0.44/255**. In every case the **8-bit hex is unchanged**, so any 8-bit render or export is the same (assumption: Figma rasterises to 8-bit sRGB).
- The other 13 primitives are **byte-identical** to the untouched original library.
- Not changed:
  - aliases, modes, names, scopes, IDs, keys and publishing flags
  - node bindings
  - all 293 non-pilot primitives and all 379 non-pilot paint styles (identical to the original library)
- Three paint styles bound to the changed variables now report the new value. Warning/700's style keeps a stale cached colour.
- A **second export of unchanged tokens is idempotent**: proven in the scratch copy first, then in the DS duplicate.

## 1. The 17 variables (tested, `use_figma` read-back)

- All 17: collection `_Primitives`, mode "Style", scopes `ALL_SCOPES`, `hiddenFromPublishing=false`, `codeSyntax {}`, no description. There are no aliases: they are literals.
- Before/after values are raw floats ×255. **"Original"** is the untouched library; "now" is the DS duplicate.
- The current variable keys are in `adapters/tokens-studio/figma-binding.pilot.json`.

| Variable ID | Name | Hex (both) | Original → now | Max shift | Result |
|---|---|---|---|---|---|
| 6671:87760 | Colors/Gray (dark mode)/600 | #61656c | G 100.667 → 101 | 0.33/255 | **quantised** |
| 5248:377754 | Colors/Success/700 | #067647 | 5.58/118.42/71.40 → 6/118/71 | 0.42/255 | **quantised** |
| 5248:377737 | Colors/Warning/400 | #fdb022 | 252.77/176.28/34.23 → 253/176/34 | 0.28/255 | **quantised** |
| 5248:377740 | Colors/Warning/700 | #b54708 | 181.44/71.32/7.56 → 181/71/8 | 0.44/255 | **quantised** |
| 5248:377712–716, 377725–727, 377751, 377686, 17489:6180/6181 | Brand 300–700, Error 400–600, Success/400, Base/white, Green lime 400/500 | unchanged | identical to the original (already 8-bit) | 0 | identical |
| 23468:2 | color/gray/450 | #8a8e97 | not in the original (created by P2-01, 8-bit) | 0 | identical to the P2-01 read-back hex |

- **Registry check:** `tokens/` holds these as hex plus 4-decimal components (e.g. success.700 `[0.0235, 0.4627, 0.2784]`, which is 6/118/71). The registry is canonical, so the new Figma value is the registry value. The old sub-8-bit floats were never in the registry.

## 2. Comparison with the untouched reference (tested)

| Scope | Result |
|---|---|
| 293 non-pilot `_Primitives` (values, scopes, hidden, codeSyntax, description) | **fingerprint identical** to the original library (`1db182d4`) |
| 379 paint styles not bound to a pilot primitive (name + paints + bindings) | **identical** to the original library (`f3677a76`), all 36 groups |
| 14 paint styles bound to pilot primitives | 10 identical. **Gray (dark mode)/600, Success/700, Warning/400** now hold the quantised value. **Warning/700**'s style still reports the old float (stale cache, see §3) |
| `1. Color modes` (292), Spacing, Radius, Widths, Containers, Typography | unchanged across the first export (before/after fingerprints, §A4 of the pilot report) |
| Reconstructed pre-sync → current, run through the new comparator | `REPRESENTATION-ONLY`, 7 findings (4 variables, 3 styles), **0 blocking** |

## 3. Effective behaviour

| Area | Changed? | Evidence |
|---|---|---|
| Token value at 8-bit / hex | **No** | Hex identical for all 17 |
| Raw variable value | **Yes, 4 variables**, ≤ 0.44/255 per channel | §1 |
| Aliases (13 semantics × 2 modes) | No | identical alias IDs |
| Names, IDs, keys, scopes, hidden, codeSyntax | No | per-variable snapshot |
| Paint styles | 3 styles resolve to the quantised value. Warning/700 keeps a stale cached float | Reproduced exactly in the scratch copy, so this is Figma's style-cache behaviour, not a DS defect |
| Node bindings | No | Export #2 digest identical, 21,176 nodes. In scratch, 13/13 bindings identical across both exports |
| Rendering | **No at 8-bit** (assumption: 8-bit sRGB rasterisation). Not tested on wide-gamut or HDR output | — |

**Policy note.** ADR-0005 says "preserve Figma colour values". These 4 shifts are invisible at 8-bit, but strictly they are value edits made by the sync, so they are recorded here rather than called harmless. **220 Figma colour variables** (192 primitives, 28 in Color modes) hold sub-8-bit values, so any future export of them will quantise them the same way. That needs a decision before Batch B2 (§7).

## 4. What cannot be verified (the earlier snapshot was aggregate only)

1. **The duplicate's own pre-sync floats.**
   - They are inferred from the original library. The duplicate was copied from it, and no recorded task edited these 4 variables.
   - The original export-1 fingerprint is consistent with exactly these changes but can't prove it per variable.
   - **Assumption.**
2. **Pre-sync names of non-pilot primitives.**
   - The name fingerprint differs from the original because of earlier approved renames. Those renames can't be separated from export 1 per variable.
   - Export 1 ran with "Update names" OFF and only the pilot themes. The scratch replay renamed nothing.
3. **Pre-sync node-binding counts.** None were captured before export 1. Indirect evidence:
   - variable IDs unchanged
   - 0 created or deleted
   - the binding fingerprint is identical across export 2
4. **Text and effect styles** were folded into one style fingerprint before export 1. They are now baselined separately and unchanged across export 2.

## 5. Baseline and idempotency (tested)

**Per-variable baseline: `verification/baseline-2026-11-10.json`.**
- Contents:
  - 686 variables: ID, key, name, collection, type, scopes, hidden, codeSyntax, description, every mode value with 8-bit hex plus raw floats when sub-8-bit, aliases by ID
  - 7 collections with modes
  - 393 paint, 65 text and 25 effect styles, including bound variables
  - node-binding counts for 616 variables across 40 pages (21,176 nodes)
- Observed in passing (pre-existing, also in the original library): **121 paint styles are bound to variable IDs that don't exist locally**. Not in scope; flagged for the backlog.

**Idempotency.**

| Run | File | Before → after | Verdict |
|---|---|---|---|
| Export #1 of the pilot sets onto a fixture with the original floats | scratch | S0 → S1 | `REPRESENTATION-ONLY` (the same 4 variables and 3 styles as the DS; Warning/700's style also stale). 0 created; matched by name across a different file |
| Export #2, unchanged tokens | scratch | S1 → S2 | **`IDENTICAL`** |
| Pre-export gate | DS duplicate | baseline → now | all 6 part digests equal |
| Export #2, unchanged tokens | DS duplicate | baseline → after | **all 6 part digests equal: `IDENTICAL`** |

**Comparator self-test:** 12/12 synthetic mutations classified correctly.
- Identical
- In-scope representation; out-of-scope representation → blocking
- Value, alias, rename, scope, duplicate, removal and binding changes → blocking
- Style representation vs a style hex change

## 6. Verification procedure for every future Tokens Studio export

Tools are in the workspace under `scripts/sync/`: `figma-snapshot.js`, `collect-snapshot.py`, `digest-baseline.py`, `compare-snapshots.mjs`, `test-compare.mjs`.

1. **Scope.**
   - The batch is defined by `adapters/tokens-studio/figma-binding.<batch>.json`, generated on a branch.
   - Run `npm run check` and `check:tokens-studio` and confirm both pass.
   - List the expected reuse, creates and updates.
2. **Scratch first.** For any batch with new token types or sub-8-bit values:
   - replicate its variables in the scratch file
   - export twice
   - require export #1 to be `REPRESENTATION-ONLY` as predicted and export #2 to be `IDENTICAL`
3. **Pre-gate on the DS.** Run `figma-snapshot.js` with `digest:true`. Every part must equal the stored baseline digest, or a newer approved one. If not, stop: something else changed the file.
4. **Export.**
   - Tokens Studio → Export styles & variables.
   - Variables: only the types in scope. Styles: none.
   - "Update existing style and variable names" OFF; "Remove styles and variables without connection to a token" OFF.
   - Only the batch's themes.
   - Before clicking Export, screenshot the options and themes.
5. **Post-gate.** Take a full snapshot in parts (5 calls for the DS), run `collect-snapshot.py`, then:
   `compare-snapshots.mjs BEFORE AFTER --scope figma-binding.<batch>.json`
   - **Pass:** `IDENTICAL`, or `REPRESENTATION-ONLY` with every finding in scope and listed in step 1's prediction.
   - **Anything else:** stop. Report, roll back with Figma version history (Mike), and do not repeat.
6. **Idempotency.** Export again and run a digest. It must be `IDENTICAL`.
7. **Record.** Store the new baseline JSON plus digest, and write a dated row in the pilot report and the map file's `history`.

## 7. Proposed next batches (not started, needs approval)

Expected numbers come from `verification/expansion-candidates.json`: registry ∩ approved map ∩ baseline.

| Batch | Tokens | Reuse | Create | Value update | Representation (quantise) | Bindings / styles touched | Prerequisites |
|---|---|---|---|---|---|---|---|
| **B1: 8-bit-exact colour primitives** | 21 (black, transparent, gray 50/100/500/800, gray-dark 50/500, brand 50/100/200/800, error 50–300, gray-modern 25, gray-iron 950, green-lime 200, magenta 400/500) | 21 | 0 | 0 | **0** | values unchanged; 18 bound styles unaffected | Extend the binding file only. **Recommended next**: a pure no-op, provable with the digests |
| B2: sub-8-bit colour primitives | 26 (gray 25–950 subset, gray-dark 200–900, warning 50–900, success 50–950, gray-modern 300/800) | 26 | 0 | 0 at hex | **26** variables + 26 bound styles | values change ≤ 0.5/255 | **Decision D-S1** (below) |
| B3: spacing primitives | 34 (`_Primitives`, hidden, e.g. `Spacing/0․5 (2px)`, `Spacing/256 (1,024px)`) | 34 | 0 | 0 | 0 | 1 direct node binding (`Spacing/5`), others via aliases | The generator needs dimension → number support. Names with U+2024 and commas are UNVERIFIED. Run on scratch first |

**Excluded from synchronization (kept out of scope):**
- the 171 deferred component-level colours (D-05)
- radius: 11 tokens; registry names are offset from Figma (e.g. `radius.sm`=4 vs `radius-xs`), naming R1 unresolved
- Tailwind global overrides (ADR-0009)
- typography primitives: 11 with unit/type mismatches (line-height ratio vs px, weight 400 vs "Regular", font stack vs family). 1 is unmapped
- 8 typography composites (these would be text styles; style export stays off)
- every Figma-only legacy variable not in the registry. The registry has no further semantic colour tokens beyond the 13 already synced, so semantic expansion needs registry proposals first.

**Decision needed, D-S1 (sub-8-bit Figma colours).** Choose one:
- **(a)** Accept quantisation to registry hex as the sync's normal behaviour. It is invisible at 8-bit, the registry is canonical, and ADR-0005's "preserve Figma colour values" would be read at hex precision.
- **(b)** Keep sub-8-bit variables out of Tokens Studio exports until the registry stores full-precision components.
- **(c)** Leave the 4 already-quantised pilot variables as they are under (a), or restore their original floats from the original library under (b). Restoring would be a separate, approved `use_figma` write.
