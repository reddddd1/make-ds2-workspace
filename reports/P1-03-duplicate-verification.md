# P1-03 — Figma duplicate verification (read-only)

> 2026-11-09 · Approved by D-02. **Every call was read-only.** Each `use_figma` script was checked for mutating calls before it ran. Nothing was written to either file. Raw reads are in `reports/P1-03/`.
> Labels: VERIFIED / UNVERIFIED / DECISION (Mike).

## Files

| | Original (protected) | Duplicate (refactor target) |
|---|---|---|
| Name | MAKER-DS-v2 | MAKER-DS-v2 (WIP Refactor) |
| File key | `xJoAz66aekAToyhBmfGNt0` | `PpnTy1pkB2FTZFq6i6seSy` |
| URL | — | https://www.figma.com/design/PpnTy1pkB2FTZFq6i6seSy/MAKER-DS-v2--WIP-Refactor- |

## Result: PASS, with two items for Mike

| Check | Original | Duplicate | Result |
|---|---|---|---|
| File key differs | — | — | ✓ VERIFIED |
| Pages (names, order, IDs) | 39 | 39 | ✓ identical |
| Component sets / variants / standalone components | 77 / 1,212 / 18 | 77 / 1,212 / 18 | ✓ identical |
| Base scope (audit and registry: 68 sets / 1,169 variants / 12 standalone) | in the 95 owners above | same | ✓ |
| Node IDs of all 95 owners | — | — | ✓ identical |
| Set names, variant counts, property-definition hashes | — | — | ✓ identical (95/95) |
| **Content hash of all 95 owners** (every layer: type, name, visibility, bound variable IDs, padding/gap/radius/stroke/opacity/size, text content, text/fill/stroke/effect style names, fills, nested instance → main component (+ key if remote)) | — | — | ✓ **identical 95/95** (second read, see below) |
| Variable collections (names, modes, counts, IDs) | 7 · 681 | 7 · 681 | ✓ identical |
| Styles (paint / text / effect / grid) | 393 / 65 / 25 / 8 | 393 / 65 / 25 / 8 | ✓ identical |
| **Published as a library?** | 58 CURRENT · 10 CHANGED · 27 UNPUBLISHED | **95 UNPUBLISHED** | ✓ duplicate is not published |
| Component keys | — | — | differ for all 95 (expected for a copy) |
| Variable IDs / variable keys | — | — | IDs **identical**, keys **differ** (5 sampled) |
| Library subscriptions | MAKER Icon library, MAKER DS v2, 7 community kits | **7 community kits only** | ⚠ see item 1 |

### Validation: two independent reads

- **Read 1** (17:24 UTC, fingerprint): counts, IDs and property hashes. **Read 2** (17:25–17:28 UTC, content hash of every owner) gave the same counts: 95 owners, 1,212 variants.
- The first content hash differed on 45 owners. Every one of them contains text or styled layers. The cause is `textStyleId`, which embeds the style **key**, and style keys change in a copy. When style IDs are resolved to style names (hash v2, run on both files), **all 95 owners match**. No style was missing in either file. This is the same pattern as the component and variable keys.

## Items for Mike

1. **The duplicate is not subscribed to the MAKER Icon library.** Existing icon instances still point to the same remote Icon-library components (included in the hash, 95/95 identical), so nothing is broken today. But the planned icon work (P2-04, `docs/icon-library-strategy.md` §6.3) needs the library enabled to swap icons. **Action (Mike, in Figma UI):** enable the MAKER Icon library in the duplicate's Assets → Libraries before Phase 2. Do **not** enable "MAKER DS v2" in the duplicate: it would let the copy pull components from the original. DECISION.
2. **The original has 10 components with unpublished edits (CHANGED):** Filter group, Dropdown, Select, Verification code input field, Textarea input field, Helper text, Input field, Date picker dropdown, Date picker modal, Textelement. The duplicate copies the file's current state, so it includes these edits, which consumers of the published v2 library do not have yet. Input field is a pilot component (P1-10). Nothing to do in Phase 1. Be aware of this when comparing the duplicate against screens built from the published library. Never publish the original.

## Consequences for later phases

- **Token sync (spec §2.6, resolved):** variable IDs survive the copy, so the sync map can be keyed by variable ID and the P1-09 dry-run applies to the duplicate unchanged. Variable keys differ, so any key-based reference must be re-seeded from the duplicate (P2-00/P2-01).
- **Regression suite:** IDs are the same, so `collect-*` scripts run on the duplicate without changes. Hashes that include style IDs must resolve them to names (as in hash v2) when comparing across files. A re-baseline **on the duplicate** (P2-00) avoids the issue for same-file comparisons.
- **Protection baseline:** the plan's `updatedAt` sample was replaced in P1-08 by content hashes, which are stronger. The original's baseline is `reports/P1-08-regression/` plus `reports/P1-13/protection-check.md`. Hash v2 of the original (`reports/P1-03/hash-v2-original.json`) is added as a full-file baseline covering all 95 owners.

## Evidence (`reports/P1-03/`)

| File | Content |
|---|---|
| `fingerprint-original.json`, `fingerprint-duplicate.json` | Read 1: totals, publish status, collections, styles, 5 sample variables, pages, per-set ID/name/count/prop-hash/key/status |
| `hash-v1-*.json` | Content hash with raw style IDs (45/95 differ: style keys) |
| `hash-v2-*.json` | Content hash with style names (95/95 identical) |
| `get_libraries` output | In the session transcript; summarised above |

## Subscription status

**Current plan:** Tokens Studio Free (assumed; not used) · **Workflow status:** Unblocked · **Paid features encountered:** none · **Upgrade required now:** No · **Next anticipated dependency:** none.
