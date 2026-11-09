# P2-03 — Buttons/Button `State=Pressed` (duplicate)

> 2026-11-09 · Approved by Mike: "All 25" (Pressed for every combination that has Hover; Pressed = Hover, per `specs/button.md`: "Pressed (touch) = hover"). Target: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original was not touched and nothing was published.

## Result (VERIFIED)

- **`State` gains the option `Pressed`.** `Buttons/Button` goes from 118 to **143** variants (md 7, lg 7, sm 7, xxs 4).
- **Each Pressed variant is an exact copy of its Hover sibling:** same layers, the same variable bindings (so future token changes to hover also reach Pressed), same effects, same `Label` / `Show L icon` / `Show R icon` property links. **25/25 identical** apart from the variant name (`pressed-equals-hover.json`).
- **Placement:** a new block below the existing variants, in rows Primary / Primary_alt / Secondary / Link brand, each variant in its Hover sibling's column (`button-after.png`).
- **Layout only:**
  - the set is 1506 → 1790 px tall (+284);
  - `Buttons/Button destructive`, `Buttons/Button action` and `Buttons/Button navigation` moved down 284 px;
  - the `Buttons` section grew by 284 px.
  - Their content is unchanged (full-file hash below).

## Verification

| Check | Result |
|---|---|
| R-PAPER-01 (`spec.json`: Pressed added, property definitions may change) vs the P2-02 baseline | **PASS**: no variant removed; 118 existing variants **unchanged**; 25 added; all other pilot sets unchanged; fingerprint unchanged → `r-paper-01.md` |
| Pressed = Hover (hash with the variant name normalised) | **25/25** |
| Full-file content hash, all 95 components, before vs after | **Only `Buttons/Button` changed**; the 3 moved sets and the other 91 identical (`fullfile-before.json` / `fullfile-after.json`) |
| Cover page | 0 components (stray clones removed, see below) |
| Existing instances | No instance uses Pressed (new option), so none change |

## What went wrong and how it was fixed (all within the approved change)

1. **`clone()` of a variant does not stay in its component set.** The 25 clones landed on the **Cover** page, the current page (`write-1-clone.json`). Fixed by moving them into the set with `appendChild` and re-applying their positions (`write-2-move-into-set.json`). Cover was then checked to be clean.
2. **Clones lose their component-property links** (`componentPropertyReferences`): 48 links on the 16 labelled variants (`Label`, `Show L icon`, `Show R icon`). Found by the Pressed = Hover check; restored from each Hover sibling, layer by layer, after checking structure parity (`write-3-restore-refs.json`).
3. `scripts/components/button-pressed-state.js` now records the correct single-pass sequence (clone → appendChild → restore links) for any future variant cloning.

## Notes

- **10 Pressed variants give no visible feedback**: their Hover already looks the same as Default (Primary_alt, and Secondary icon-only). Mike chose all 25 knowing this. A distinct pressed look would be a later design change.
- The `Size=lg, Link brand` Pressed copies its Hover, which uses `text-brand-secondary_hover` (inconsistency noted in P2-01).
- New baseline for the next task: `variants-after.json`.

## Subscription status

Tokens Studio Free (assumed; not used) · Unblocked · no paid features · no upgrade.
