# Token sync — validation spec (P1-09 step 1)

> **Status: APPROVED — Mike, chat, 2026-11-09: "Approve as written".** This approves §2–§7 and the five proposed defaults in §9 (no renames; creates use the target group's Figma naming and copy sibling scopes; map file in this workspace `sync/`; dry-run reads the original library read-only until the duplicate is verified). Rows below still labelled PROPOSED are approved as **spec rules for the dry-run**; any actual write remains unapproved (B-06).
> Decision D-03 (APPROVED, conditional): prefer a free scripted `use_figma` sync, but **before implementing**, validate that it preserves values, aliases, modes, naming and existing bindings; no overwrite of tokens or variables without approval.
> This document defines what such a sync would do and what the **read-only dry-run** (P1-09 step 2) must report. **Nothing here is implemented.** Step 2 starts only after Mike approves this spec. **Write mode is not approved** (backlog B-06).

## 1. Scope

| Item | Rule | Label |
|---|---|---|
| Direction | **One-way: registry → Figma.** The token repo (`reddddd1/design-tokens`, `tokens/` only, never `proposals/`) is the source (ADR-0001/0010). Figma is never read back into the registry by the sync | APPROVED (ADR-0001) |
| Target file | **Only the verified duplicate** (D-01/D-02, ADR-0011). The script refuses to run its write path when `figma.fileKey === 'xJoAz66aekAToyhBmfGNt0'`. The **dry-run** may read the original when no verified duplicate exists | APPROVED (D-01) / PROPOSED (dry-run target) |
| Objects | Local **variables** in `_Primitives`, `1. Color modes`, `2. Radius`, `3. Spacing`, `6. Typography` | PROPOSED |
| Out of scope | Text, paint, effect and grid **styles** (semantic typography tokens map to text styles, not variables); `4. Widths`, `5. Containers` (no registry tokens); the **171 component colours** (D-05); variable **scopes** and **code syntax** (D-10); collections and modes themselves; components and bindings | PROPOSED / APPROVED (D-05) |
| Tokens Studio | Not used (D-03, D-11 operating rule) | APPROVED |

## 2. Identity — how a token finds its Figma variable

1. **Registry key:** the token path (e.g. `color.text.error-primary`) plus mode (`light`, `dark`, or none).
2. **Figma key:** **variable ID** (`VariableID:…`), never the name. IDs are what bindings point to, so matching and updating by ID is what keeps bindings intact.
3. **Link between them:** a **map file** in this workspace, `sync/figma-variable-map.<fileKey>.json`, one per target file:
   `{ "<token path>": { "collection": "…", "variableId": "…", "figmaName": "…", "lastSynced": { "<mode>": "<value or alias>" } } }`
4. **Seeding the map** (first run): match on the token's recorded `$extensions["com.make.source"].figma` name against Figma names in the collection, using the P1-06 rules (full name for primitives, spacing and typography; short name for theme colours; ` (…)` / ` = …` annotations stripped; radius by recorded name). Every seeded pair is shown in the dry-run and becomes final only when Mike approves the map.
5. A match is **ambiguous** (→ conflict, §6) if one token matches two variables or two tokens match one variable.
6. **UNVERIFIED:** whether variable IDs survive file duplication. P1-03 must check; until then the map is keyed by file and never reused across files.

## 3. Mapping rules

| Aspect | Registry | Figma | Rule | Label |
|---|---|---|---|---|
| **Collections** | `primitives/` | `_Primitives` (colour, spacing), `2. Radius`, `6. Typography` | By recorded source; no new collections | PROPOSED |
| | `themes/light`, `themes/dark` | `1. Color modes` | Theme tokens go only to `1. Color modes` | PROPOSED |
| **Modes** | no mode | single mode (`Style`, `Mode 1`, `Value`) | Write to the collection's only mode | PROPOSED |
| | `light` / `dark` | `Light mode` / `Dark mode` | Mapped **by mode name**, configured once; a missing mode is a conflict. Modes are never added, removed or renamed | PROPOSED |
| **Colour value** | `srgb` components + `hex` (+ alpha) | RGBA 0–1 | Compare at 8-bit RGBA (hex). Equal → unchanged. Different → `update-value`, with ΔE2000 reported | PROPOSED |
| **Dimension** | `{value, unit: "px"}` | FLOAT | Equal number → unchanged | PROPOSED |
| **Line height** | ratio + `com.make.source.px` | FLOAT (px) | Compare against the recorded px; ratio is never written to Figma | PROPOSED |
| **Font weight** | number 400/500/600/700 | STRING `Regular`/`Medium`/`Semibold`/`Bold` | Fixed table (token-conventions); Figma keeps STRING type | PROPOSED |
| **Font family** | string[] | STRING | First entry of the stack | PROPOSED |
| **Aliases** | `"{color.error.600}"` | `VARIABLE_ALIAS` → variable ID | **Aliases stay aliases.** The target token is resolved through the map to its variable ID and written as an alias; never flattened to a raw value. Alias target not mapped and not created in the same change set → conflict | PROPOSED |
| **Type** | `$type` | `resolvedType` | Must already match; **type is never changed** (would break bindings) | PROPOSED |
| **Naming** | Tailwind paths (ADR-0004) | Figma names (`Colors/Brand/600`, `radius-md`) | **No renames in the sync.** Figma keeps its names; the map records the relationship. Any rename is a separate change set needing its own approval | PROPOSED |

## 4. Operations

| Operation | When | Approval |
|---|---|---|
| `unchanged` | Value/alias already equal in every mode | — |
| `update-value` | Raw value differs | **Mike, per row** (visible change) |
| `update-alias` | Alias target differs (e.g. light `text-error-primary`: `Error/500` → `Error/600`) | **Mike, per row** (visible change unless the resolved value is equal) |
| `create` | Approved registry token with no Figma variable (e.g. `color.gray.450`) | **Mike, per row**, incl. the proposed Figma name (Figma naming style of the target group, e.g. `Colors/Gray (light mode)/450`) |
| `skip-out-of-scope` | Component colours, styles, Widths/Containers | — (reported only) |
| `figma-only` | Figma variable with no registry token (e.g. 214 legacy primitives, `radius-lg` 10 px, semantic spacing) | — (**kept**, reported only) |
| `conflict` | See §6 | Blocks the whole change set until resolved |

**Never** (not even with approval inside a sync run; each would need a separate decision): delete a variable · delete-and-recreate · change `resolvedType` · rename a variable, collection or mode · add/remove modes · change scopes or code syntax · touch any binding on any node · write to the original library · publish.

## 5. How the D-03 conditions are guaranteed and checked

| D-03 condition | Guarantee in the design | Checked by |
|---|---|---|
| **Values preserved** | Only rows Mike approved change; every other variable is `unchanged` or `figma-only` and is not written | Dry-run lists every row; after a write, re-running the dry-run must report **0 operations** (idempotence) |
| **Aliases preserved** | Alias → alias by ID; no flattening; 3-hop limit and type match from the token contract | Dry-run validates every alias target exists (or is created first in the same set) |
| **Modes preserved** | Mode mapping by name; no mode creation/removal | Fingerprint check (P1-08 `collect-variants.js`: collections, modes, counts) before/after |
| **Naming preserved** | No renames; creates follow the Figma group naming | Dry-run asserts `renames = 0`; fingerprint names unchanged |
| **Bindings preserved** | Update in place by variable ID; never delete/recreate/retype | Dry-run asserts `deletes = 0`, `retypes = 0`; after a write, P1-08 `collect-instances.js` (R-PENPOT-01) on the duplicate and pilot screens: binding hashes may change **only** for approved rows (values), never binding counts or variable IDs |
| **No unapproved overwrite** | Write path (later) takes the **approved change-set file** as input, not the registry directly | Change-set file is the dry-run output with Mike's approval recorded per row |

## 6. Conflict rules

A conflict blocks the change set. The dry-run lists each with a reason:

1. **Ambiguous identity** — one token ↔ several variables, or the reverse.
2. **Type mismatch** — registry `$type` vs Figma `resolvedType`.
3. **Missing alias target** — alias points to a token that has no variable and no `create` in the set.
4. **Missing mode** — registry mode has no Figma mode of that name.
5. **Drift (both sides changed)** — the Figma value differs from `lastSynced` **and** the registry value differs from `lastSynced`. First run has no `lastSynced`: every difference is an `update-*` for approval, not a conflict.
6. **Protected target** — a row would write to a component colour, a style, or the original file.
7. **Contract violation** — registry token fails `npm run check` (if the validator can run) or the token-contract alias rules.

## 7. Dry-run (P1-09 step 2, after approval) — what it will be

- **Read side (Figma):** a read-only `use_figma` collector returns every variable in scope with **ID**, name, collection, `resolvedType`, and per-mode raw value or alias target ID. No writes; reviewed for mutating calls like all Phase 1 scripts.
- **Read side (registry):** local Python reads `design-tokens/tokens/` (read-only; `git status` clean before and after).
- **Diff:** local Python builds the change set per §2–§6. Writes only to this workspace: `reports/P1-09-dryrun.{json,md}` and a draft `sync/figma-variable-map.<fileKey>.json` (status `proposed`).
- **Report contents:** counts per operation; one row per token × mode with before → after (alias names and hex), ΔE2000, the approval flag, and the **components affected** (from the P1-07 colour-usage scan / registry), plus assertions `deletes = 0`, `retypes = 0`, `renames = 0`, `writes to original = 0`.
- **Target:** the verified duplicate if P1-03 is done; otherwise the original library, **read-only** (labelled as such).
- **Validation:** run twice → identical output; script review for mutating calls; original library fingerprint unchanged (P1-08 `collect-variants.js`).

### Predicted first change set (from P1-06 data — the dry-run must confirm)

- `unchanged`: 119 mapped variables (95 primitives, 11 radius, 10 typography, 3 colour-mode variables equal in both modes).
- `update-alias`: **11 rows on 8 semantic colour variables** — all approved registry remaps from proposals 0002 / 0004 (visible changes in Figma):
  `text-primary_on-brandprimary` (dark → white) · `text-brand-primary` (dark → brand.400) · `text-brand-primary-hover` (light → brand.700, dark → brand.300) · `text-error-primary` (light → error.600) · `text-warning-primary` (light → warning.700) · `text-success-primary` (light → success.700) · `border-primary` (light → gray.450, dark → gray-dark.600) · `bg-brand-primary_hover` (light and dark → brand.700).
- `create`: **1** — `color.gray.450` (`#8a8e97`), needed by `border-primary` light.
- `figma-only` (kept): 383 variables without a registry token; `skip-out-of-scope`: 171 component colours.
- `conflict`: 0 expected.

## 8. Write path (later phase — not approved, documented for completeness)

Order: creates (primitives) → value updates (primitives) → alias updates (themes). Before writing: full snapshot of every in-scope variable's values per mode (rollback file). Each batch is one `use_figma` call on the duplicate; on error, stop and restore from the snapshot. After writing: dry-run again (must be 0 operations), P1-08 regression suite, Light **and** Dark visual check. Requires Phase 2 approval and approval of the specific change set.

## 9. Decisions needed from Mike (to approve this spec)

1. **Approve the spec as written** (rules §2–§7), or mark changes.
2. **Naming:** confirm **no renames** in the sync (Figma names stay; mapping recorded).
3. **Creates:** confirm new primitives are named in the target group's Figma style (e.g. `Colors/Gray (light mode)/450`). Scopes for created variables are D-10 (deferred) — proposed: copy the scopes of the sibling variables in the same group, so no new scope policy is introduced.
4. **Map file location:** this workspace (`sync/`) in Phase 2; recording Figma variable IDs in the token repo's `$extensions` would be a later proposal there.
5. **Dry-run target now:** original library read-only (proposed), or wait for the verified duplicate.
