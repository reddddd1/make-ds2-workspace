# Regression check: instances — FAIL

- File `PpnTy1pkB2FTZFq6i6seSy` · baseline `baseline` (2026-11-09T17:41:21.276Z) vs current `after-p2-01` (2026-11-09T17:57:12.982Z)
- Spec: none (nothing may change)
- Checks: 17 · failed: 2 · totals: {'inst': 20, 'linked': 17, 'bind': 1907}

| Result | Check | Detail |
|---|---|---|
| ❌ | [Playground do not delete] R-PENPOT-01 bindings + Light/Dark/effective values unchanged | _Modal actions (59→59); _Modal actions (59→59); Radio group (343→343); _Modal actions (59→59); _Date picker menu (940→940) |
| ❌ | [Modals] R-PENPOT-01 bindings + Light/Dark/effective values unchanged | Flow heading (26→26); Content item (46→46); Content item (26→26); Modal (118→118); Content item (46→46) |
| ✅ | same screens | baseline 2, current 2 |
| ✅ | [Playground do not delete] explicit modes unchanged | none (inherits default) |
| ✅ | [Playground do not delete] screen-level bindings unchanged (R-PENPOT-01) | 79 → 79 |
| ✅ | [Playground do not delete] instance count unchanged | 14 → 14 |
| ✅ | [Playground do not delete] E2 text content and nested-component overrides preserved |  |
| ✅ | [Playground do not delete] linkage: no new orphan/detached instance |  |
| ✅ | [Playground do not delete] R-FIGMA-01 instance layer tree = main (no new divergence) |  |
| ✅ | [Playground do not delete] icons from library only (no new violation) |  |
| ✅ | [Modals] explicit modes unchanged | none (inherits default) |
| ✅ | [Modals] screen-level bindings unchanged (R-PENPOT-01) | 85 → 85 |
| ✅ | [Modals] instance count unchanged | 6 → 6 |
| ✅ | [Modals] E2 text content and nested-component overrides preserved |  |
| ✅ | [Modals] linkage: no new orphan/detached instance |  |
| ✅ | [Modals] R-FIGMA-01 instance layer tree = main (no new divergence) |  |
| ✅ | [Modals] icons from library only (no new violation) |  |

## Known baseline issues (3) — present before and after, not counted as regressions

- [Playground do not delete] _Modal header: orphan (already in baseline)
- [Playground do not delete] _Modal header: orphan (already in baseline)
- [Playground do not delete] Pagination dot group/lg/Dot/Primary light bg/False: orphan (already in baseline)
