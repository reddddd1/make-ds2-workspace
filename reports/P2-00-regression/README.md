# P2-00 — Regression-suite enhancements and re-baseline on the duplicate

> 2026-11-09 · **Approved by Mike: P2-00 only** (P2-01 onward still need separate approval). Workspace writes only. **No Figma write in any file.** Every `use_figma` script was checked for mutating calls before it ran (reads only, plus the runtime option `skipInvisibleInstanceChildren`, which is not saved in the file). Labels: VERIFIED / UNVERIFIED / DECISION (Mike).

## 1. What changed (scripts/regression/)

| Enhancement | Collector | Effect | Needed by |
|---|---|---|---|
| **E1** | `collect-variants.js` | Variant hash now includes each layer's **name**, **component property references** and **exposed-instance flag**. Style and local-component references are file-independent, using names instead of keys | P2-02 `Label` TEXT property, P2-04 exposure, P2-06 Alert props, P2-07 `[Slot]`→`Body` rename |
| **E2** | `collect-instances.js` | Per instance: text-content hash and nested-component override hash. A lost label override or a reset icon now **fails** the check | P2-02, P2-05 (override loss risk, `pilot-button-input.md` §6) |
| **E3** | `collect-slots.js` | Finds native `SLOT` nodes, their content and `limitViolations`. `SET_KEY` must now be set per file | P2-07 Modal slot migration |
| Comparator | `compare.py` | E2/E3 checks; snapshots from different collector versions are refused; `--cross-file`; spec key `allowSlotChange` | all |
| Self-test | `selftest.py` | +7 scenarios (E2 ×2, E3 ×2, version refusal, cross-file refusal and PASS) | — |

## 2. Re-baseline: two independent reads per collector (VERIFIED)

| Comparison | File | Scope | Verdict | Checks | Baseline (UTC) | Second read (UTC) |
|---|---|---|---|---|---|---|
| `variants-library` | **Duplicate** | 6 pilot sets, 180 variants, plus fingerprint | **PASS** | 19 / 0 failed | 17:40:09 | 17:43:52 |
| `slots-library` | **Duplicate** | Modal instances (getInstancesAsync) | **PASS** | 6 / 0 | 17:41:17 | 17:43:53 |
| `instances-library-modals` | **Duplicate** | Modals page, 2 frames, 20 instances | **PASS** | 17 / 0 (3 known orphans) | 17:41:21 | 17:43:57 |
| `instances-scratch` | Pilot scratch | 10 login screens, 72 instances | **PASS** | 81 / 0 | 17:42:08 | 17:44:03 |
| `slots-scratch` | Pilot scratch | Modal instances (page scan) | **PASS** | 1 / 0 (0 instances) | 17:42:09 | 17:44:05 |
| `variants-original-vs-duplicate` (`--cross-file`) | Original vs duplicate | 6 pilot sets, 180 variants | **PASS** | 19 / 0 | 17:40:17 (original) | 17:40:09 (duplicate) |

- **Baseline state of the duplicate:** 180 pilot variants. Fingerprint: 681 variables, 7 collections, styles 393 / 65 / 25 / 8, 0 missing styles. Modal: 1 instance (legacy `Drawer content` swap → local `Slot`), 0 native slots. `limitViolations` is not exposed on these nodes. Modals page: 20 instances; the same 3 orphans as P1-08 (known).
- **Original protection baseline (E1):** `snapshots/variants-original-protection.json`. It is identical to the duplicate, so any later difference between the two files will be the Phase 2 changes and nothing else.
- **Pilot scratch** is a consumer of the **original** published library. Its baseline is for P2-08 (screens rebuilt against the duplicate); it does not track the duplicate.

## 3. Self-test (VERIFIED)

`python3 -I scripts/regression/selftest.py reports/P2-00-regression` → exit 0, **15/15 scenarios as expected** (`selftest/selftest-results.json`). The 8 P1-08 scenarios still behave as before on the new snapshots. On the old P1-08 snapshots they still pass, and those report files are unchanged.

| New scenario | Edit (JSON only) | Expected | Got |
|---|---|---|---|
| `e2-text-override-lost` | Button label text hash changed | FAIL | FAIL ✓ |
| `e2-nested-override-lost` | Nested component (icon) changed | FAIL | FAIL ✓ |
| `e3-slot-content-changed` | Native slot content changed | FAIL | FAIL ✓ |
| `e3-limit-violation` | `limitViolations` non-empty | FAIL | FAIL ✓ |
| `version-mismatch-refused` | E1 vs pre-E1 snapshot | exit 2 | exit 2 ✓ |
| `cross-file-refused-without-flag` | Original vs duplicate without `--cross-file` | exit 2 | exit 2 ✓ |
| `cross-file-original-vs-duplicate` | Same, with `--cross-file` | PASS | PASS ✓ |

## 4. Limits (still true)

- E1, E2 and E3 are proven against the current files and edited JSON. Their behaviour on real property bindings, exposure and native slots can only be shown after a Phase 2 change on the duplicate (first evidence: P2-02 / P2-07).
- E2 `propsHash` is informational. Adding a property changes it by design, so it is not checked.
- Visual diff and the literal Light→Dark→Light mode toggle are still Phase 2 write-side steps.
- The MAKER Icon library is still not enabled in the duplicate (P1-03). It does not affect these reads, but **P2-04 needs it** (Mike, Figma UI).

## Subscription status

**Current plan:** Tokens Studio Free (assumed; not used) · **Workflow status:** Unblocked · **Paid features encountered:** none · **Upgrade required now:** No · **Next anticipated dependency:** none (P2-01 uses the scripted `use_figma` sync).
