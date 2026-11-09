# Regression checkers (P1-08, enhanced in P2-00) — read-only

Permanent regression suite for every structural change from Phase 2 on (`docs/regression-checks.md`). Built and verified read-only in Phase 1. **Collectors only read Figma; the comparator never talks to Figma.**

## How it works

1. **Baseline:** before a change, run the relevant collector(s) with `RUN = 'baseline'`; save the returned JSON.
2. **Change** (Phase 2+, duplicate file only, separately approved).
3. **Current:** run the same collector(s) again in a **fresh** `use_figma` call with `RUN = 'current'`.
4. **Compare:** `python3 -I scripts/regression/compare.py <baseline.json> <current.json> [--spec spec.json] --out <report>` → `PASS` (exit 0) / `FAIL` (exit 1), Markdown + JSON report.

## Files

| File | Runs in | Covers |
|---|---|---|
| `collect-variants.js` | library (original or duplicate) | **R-PAPER-01** (per-variant feature hash for every variant of the given sets; optional `PROBE` layer presence) + **library protection** (fingerprint: collections, variable count, style counts, property-definition hashes). Replaces `updatedAt`, which the Plugin API does not expose |
| `collect-instances.js` | consumer file (or library pages) | **Linkage** (linked-remote / linked-local / orphan / detached), **R-FIGMA-01** (instance layer tree vs main component, by index and type), **R-PENPOT-01** (every binding with Light, Dark and effective value), **icon source** (every `Icon wrapper` and glyph must come from the MAKER Icon library) |
| `collect-slots.js` | library or consumer | **R-SLOT-01** (instance count, linkage, instance-swap/SLOT property values, slot-region structure hash, `limitViolations`) |
| `compare.py` | local | All rules below |
| `selftest.py` | local | Builds deliberately mismatched JSON copies and asserts each fails (and one control passes) |

Parameters are the constants on the first lines of each collector (`SET_IDS`, `PAGE_ID`, `FRAME_IDS`, `SET_KEY`/`SET_ID`, `RUN`, `PROBE`, `DETAIL`, `ICON_SET_KEYS`). Paste the file body into `use_figma` with the constants filled in; change nothing else.

## P2-00 enhancements (collector versions E1 / E2 / E3)

| Collector | Version | Adds |
|---|---|---|
| `collect-variants.js` | `E1` | Per layer: **name**, **`componentPropertyReferences`** and **`isExposedInstance`** — binding a layer to a TEXT/BOOLEAN/INSTANCE_SWAP property, exposing a nested instance or renaming a layer now changes the variant hash. **File-independent:** styles by name, local nested components by `set > variant` name, remote ones by key — so the original and the duplicate hash identically (P1-03: style/component keys change in a copy; node and variable IDs do not) |
| `collect-instances.js` | `E2` | Per instance: `textHash` (every text layer's characters by path, nested instances included), `overrideHash` (every nested instance's main component), `propsHash` (own property values — informational, not checked) |
| `collect-slots.js` | `E3` | Per instance: native `SLOT` nodes (name, children, signature hash, `SlotNode.limitViolations`); legacy region also found as `Body`. `SET_KEY` is now a required parameter |

`compare.py` refuses snapshots from different collector versions (exit 2: re-baseline). `--cross-file` compares two files (only meaningful for E1 variant snapshots). Spec key `allowSlotChange: true` permits a planned change of native slot content (R-SLOT-01 migration step).

### Parameters per file (verified 2026-11-09)

| File | Key | Pages / sets |
|---|---|---|
| Duplicate (refactor target) | `PpnTy1pkB2FTZFq6i6seSy` | Modals page `172:4293`; Modal set `4057:415205`, key `3e0e0b6ddc2953d43e9beaed6c558bce1d85788e` |
| Original (protected, read-only) | `xJoAz66aekAToyhBmfGNt0` | Same node IDs; Modal key `dac269c2f44bb35a05ce44f3b985285788201c98` |
| Pilot scratch (consumer of the original) | `uMQLqPDG5I4rZAAHlhpInJ` | Login page `5:289` |
| Pilot sets (same IDs in both libraries) | — | Buttons/Button `3287:427074`, Input field `17517:11024`, Modal `4057:415205`, _Modal header `4055:413620`, _Modal actions `4057:414352`, Alert `1130:81134` |

Current baselines: `reports/P2-00-regression/snapshots/` (P1-08 snapshots are pre-E1 and kept for history only).

## Rules enforced by `compare.py`

| Check | Fails when |
|---|---|
| variants (no spec = protection mode) | any variant hash, property-definition hash, variant list or file fingerprint differs |
| variants + spec (R-PAPER-01) | any in-scope variant did **not** change (expected count ≠ actual), the probe is missing in an in-scope variant, or any variant **outside** the scope changed |
| instances | screen or instance set differs; (E2) text content or nested-component overrides of an instance differ; a **new** orphan/detached instance; a **new** missing/extra layer vs main (R-FIGMA-01); any binding or its Light/Dark/effective value differs (R-PENPOT-01); explicit screen mode differs; a **new** icon not from the library |
| slots (R-SLOT-01) | instance count differs; an instance is unlinked; property values or slot-region hash differ; (E3) native slot content differs (unless `allowSlotChange`); any `limitViolations` non-empty |

Issues already present in the baseline (e.g. existing orphans) are listed as **known baseline issues**, not regressions.

Spec example (Paper incident scope — the change must reach every Primary variant, all states and sizes):

```json
{"sets": {"Buttons/Button": {"scope": {"Hierarchy": ["Primary"]}, "probe": "visible"}}}
```
(`probe` needs `PROBE = '<layer name>'` in the collector.)

## Read-only guarantees and one runtime setting

- Calls used: `getNodeByIdAsync`, `getStyleByIdAsync`, `findAll`, `loadAsync`, `findAllWithCriteria`, `findOne`, `getMainComponentAsync`, `getInstancesAsync`, variable/collection getters, `resolveForConsumer`, `getLocal*StylesAsync`. No `create*`, `set*`, `remove`, `append`, `insert`, `detach`, `import*`, `createSlot`, `swapComponent`, and no assignment to any node.
- The collectors set **`figma.skipInvisibleInstanceChildren = false`**. This is a plugin-runtime option (not saved in the file). With the default (`true`) hidden layers inside instances are omitted from reads, which made every instance look structurally different from its main (found and verified in P1-08).
- **R-PENPOT-01 limitation:** switching a frame's mode is a write, so Phase 1 checks resolve every binding for Light, Dark and the node's effective mode in a fresh call. The literal Light → Dark → Light toggle is a Phase 2 step on the duplicate, followed by these same collectors.

## Verified on 2026-11-09

See `reports/P1-08-regression/README.md`.
