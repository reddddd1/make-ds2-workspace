# P2-01 — Token sync on the duplicate: change set for approval

> 2026-11-09 · Mike approved **starting P2-01** ("Approve"). Spec: `docs/token-sync-spec.md` (APPROVED). **Nothing has been written.** Every read in this step was read-only, and `design-tokens` is clean at `dcee093`.
> Writing needs Mike's approval of **each row below and of the variable map** (spec §2.4, §4). The write runs on the duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The write script refuses the original `xJoAz66aekAToyhBmfGNt0`.

## Dry-run on the duplicate (VERIFIED)

- 4 read-only collector calls (17:49 UTC): **681 variables**. Every variable ID, name, type and per-mode value is **identical** to the original's P1-09 read.
- Change set: **1 create · 11 update-alias · 0 update-value · 0 conflicts**. Also 127 unchanged, 368 Figma-only (kept), 195 out of scope (171 component colours, 15 Widths/Containers, 9 text-style tokens).
- Assertions: deletes 0 · retypes 0 · renames 0 · writes 0.
- **All 702 dry-run rows are identical to P1-09.** Details: `dryrun/dryrun.md`, `dryrun/dryrun.json`.
- Variable map (128 token → variable-ID pairs): `dryrun/figma-variable-map.PpnTy1pkB2FTZFq6i6seSy.proposed.json`. Status: **proposed**.

## Rows

| # | Op | Figma variable | Mode | Before → After | ΔE2000 | Visible effect (components using it) |
|---|---|---|---|---|---|---|
| R1 | create | `Colors/Gray (light mode)/450` | — | — → `#8a8e97` (scopes copied from the Gray (light mode) siblings) | — | none by itself; needed by R4 |
| R2 | alias | `bg-brand-primary_hover` | light | Brand/500 `#7373f5` → Brand/700 `#2323f0` | 21.3 | Primary button hover, darker (Button 7, Toggle 2, Calendar cell 1) |
| R3 | alias | `bg-brand-primary_hover` | dark | Brand/500 → Brand/700 | 21.3 | same, dark mode |
| R4 | alias | `border-primary` | light | Gray/300 `#d5d7da` → Gray/450 `#8a8e97` | 20.5 | **Default borders noticeably darker**: inputs, selects, textareas, checkboxes, tags, social buttons, button groups, Alert (≈220 bindings). Fixes 3:1 non-text contrast |
| R5 | alias | `border-primary` | dark | Gray dark/700 `#373a41` → Gray dark/600 `#61656c` | 14.8 | same, dark mode, lighter |
| R6 | alias | `text-brand-primary` | dark | Brand/600 `#5656f3` → Brand/400 `#9090f6` | 18.6 | Link-brand labels in dark mode: 3.47:1 → 6.48:1 (Button 24, Badge 6) |
| R7 | alias | `text-brand-primary-hover` | light | Brand/500 → Brand/700 `#2323f0` | 21.3 | Link hover darker (Button 7) |
| R8 | alias | `text-brand-primary-hover` | dark | Brand/500 → Brand/300 `#ababf8` | 17.1 | Link hover lighter in dark mode (Button 7) |
| R9 | alias | `text-error-primary` | light | Error/500 `#ff0466` → Error/600 `#ca0050` | 11.7 | Error text darker (Destructive button 28, Badge 3, Helper text 3) |
| R10 | alias | `text-primary_on-brandprimary` | dark | Gray dark/50 `#f7f7f7` → white | 1.6 | Barely visible (Tab button, Tag count, Flow heading, DS header) |
| R11 | alias | `text-success-primary` | light | Success/500 `#17b26a` → Success/700 `#067647` | 20.6 | Success text darker (Badge 3, Helper text 3) |
| R12 | alias | `text-warning-primary` | light | Warning/500 `#f79009` → Warning/700 `#b54708` | 25.5 | Warning text darker (Badge 6, Helper text 3) |

All 11 alias rows are the approved registry remaps (proposals 0002/0004, ADR-0008 contrast fixes). They change only the duplicate's appearance. The original library and published consumers are unaffected.

## Write plan (spec §8) once approved

1. **Snapshot:** read every in-scope variable's per-mode values into `rollback-snapshot.json` (read-only).
2. **Write, one `use_figma` call on the duplicate:**
   - Guard: abort if `figma.fileKey` ≠ `PpnTy1pkB2FTZFq6i6seSy`.
   - R1: create the variable in `_Primitives`, copying scopes from its siblings.
   - R2–R12: `setValueForMode` with an alias to the target variable ID.
   - Nothing else is touched: no deletes, renames, retypes, binding changes or publishing.
3. **Verify (fresh calls):**
   - The dry-run must report **0 operations**.
   - The fingerprint should change only by +1 variable.
   - `collect-variants`: the 180 pilot variant hashes stay unchanged, because they record bound variable IDs and those IDs don't change.
   - `collect-instances` on the Modals page: binding hashes change **only** where R2–R12 variables are bound, and binding counts stay the same (R-PENPOT-01).
   - Light **and** Dark screenshots of Button, Input field and Alert.
4. **Rollback:** if any check fails, restore R2–R12 from the snapshot and remove R1 (the only variable created).

## Approval requested

- [x] Rows R1–R12 — **APPROVED, Mike, 2026-11-09: "Approve everything"**
- [x] Variable map — **APPROVED** (same message); saved as `sync/figma-variable-map.PpnTy1pkB2FTZFq6i6seSy.json`

Applied 17:54:30 UTC; results and verification: `README.md`. Correction: §"Write plan" step 3 predicted unchanged variant hashes. The hash includes resolved fill colours, so 14 Button Hover variants changed, exactly as attributed in `README.md` §2.
