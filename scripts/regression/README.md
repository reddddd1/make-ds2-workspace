# Regression checkers (P1-08) — read-only

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

## Rules enforced by `compare.py`

| Check | Fails when |
|---|---|
| variants (no spec = protection mode) | any variant hash, property-definition hash, variant list or file fingerprint differs |
| variants + spec (R-PAPER-01) | any in-scope variant did **not** change (expected count ≠ actual), the probe is missing in an in-scope variant, or any variant **outside** the scope changed |
| instances | screen or instance set differs; a **new** orphan/detached instance; a **new** missing/extra layer vs main (R-FIGMA-01); any binding or its Light/Dark/effective value differs (R-PENPOT-01); explicit screen mode differs; a **new** icon not from the library |
| slots (R-SLOT-01) | instance count differs; an instance is unlinked; property values or slot-region hash differ; `limitViolations` non-empty |

Issues already present in the baseline (e.g. existing orphans) are listed as **known baseline issues**, not regressions.

Spec example (Paper incident scope — the change must reach every Primary variant, all states and sizes):

```json
{"sets": {"Buttons/Button": {"scope": {"Hierarchy": ["Primary"]}, "probe": "visible"}}}
```
(`probe` needs `PROBE = '<layer name>'` in the collector.)

## Read-only guarantees and one runtime setting

- Calls used: `getNodeByIdAsync`, `loadAsync`, `findAllWithCriteria`, `findOne`, `getMainComponentAsync`, `getInstancesAsync`, variable/collection getters, `resolveForConsumer`, `getLocal*StylesAsync`. No `create*`, `set*`, `remove`, `append`, `insert`, `detach`, `import*`, `createSlot`, `swapComponent`, and no assignment to any node.
- The collectors set **`figma.skipInvisibleInstanceChildren = false`**. This is a plugin-runtime option (not saved in the file). With the default (`true`) hidden layers inside instances are omitted from reads, which made every instance look structurally different from its main (found and verified in P1-08).
- **R-PENPOT-01 limitation:** switching a frame's mode is a write, so Phase 1 checks resolve every binding for Light, Dark and the node's effective mode in a fresh call. The literal Light → Dark → Light toggle is a Phase 2 step on the duplicate, followed by these same collectors.

## Verified on 2026-11-09

See `reports/P1-08-regression/README.md`.
