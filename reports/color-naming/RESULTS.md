# Colour variable naming migration: results

- **Date:** 2026-11-11
- **File:** DS duplicate `PpnTy1pkB2FTZFq6i6seSy`. The original library was not touched, and nothing was published or merged.
- **Approval:** Mike, 2026-11-11.
  - N1: approved, with exceptions E1–E3.
  - N2: approved on condition that N1 passed.
  - Spelling fix: `skeumorphic` → `skeuomorphic`.
- **Named Figma version:** "pre-colour-naming", saved before any edit.

## Method

- Each rename script computes the plan from the approved rules in the file, then compares it with the reviewed map. The row count and an FNV hash of all `id / old / new` rows must match:
  - N1: 391 rows, hash `f46e30ee`
  - N2: 171 rows, hash `678138e9`
- On any difference the script writes nothing. Only `variable.name` is written.
- **Verification:** `expected-digest.py` takes the 11-10 baseline and reproduces its stored digests exactly. It then applies the map by ID and predicts the digests `figma-snapshot.js` must return. A match means the file changed by the listed renames and nothing else: no ID, key, value, alias, mode, scope, codeSyntax, description, collection, style or binding change.

## Pre-check (07:56 UTC)

| Part | Digest |
|---|---|
| vars | `c3e09557` / `cb744e70` / `ff6b4a2d`, 686 variables |
| collections | `292be3df` |
| paint styles | `4af95ce1` / `8fa60ebc` |
| text styles | `aeb4e67d` |
| effect styles | `22766d6a` |
| bindings | `9373b264` (23,056 nodes) |

All of these equal the 11-10 baseline except bindings. The bindings digest moved since 11-10 because of the auth-screen build; `9373b264` is the new reference.

## Batch N1: primitives and semantic

| Check | Result |
|---|---|
| Renamed | **391**: 391 written, 0 read-back mismatches, 0 duplicate names |
| Created / deleted | **0 / 0** (686 → 686) |
| Vars digests | `d732b381` / `84f2e09e` / `5a2d32aa` = **expected** |
| Collections, styles, text, effects, bindings digests | **unchanged** |
| Unexpected changes | **none** |

## Tokens Studio adapter (coordinated with N1)

- **Change:** `figma-binding.pilot.json` has 43 `figmaName` updates; each now equals its registry path. The adapter was regenerated.
  - `check:tokens-studio` ✔ and `npm run check` 29/29 pass.
  - `tokens/` has no diff.
  - All 85 variable keys are unchanged.
  - All 51 colour names equal the live Figma names, checked by variable ID.
- **Commits:**
  - local `936bdbf` on `tokens-studio/b3-spacing`
  - remote: 3 web commits `17885a2`, `bdb4717`, `67766b4`, verified in the GitHub commit list
  - `main` is untouched
- **Export lock:** no export ran while names and adapter disagreed. The Figma rename came first and the adapter push next; the first export ran only after both were done.
- **Scratch rehearsal** (`WVQqJt4NTRSzDbR6Qqv7tn`): 22 fixtures were renamed by the same rules, then exported (Color + Number variables; styles off; update names off; remove off).
  - All 69 existing variables were reused, with IDs, names and values fingerprints identical.
  - 0 duplicates.
  - 21 variables were created. These are exactly the B1 tokens the scratch file never had; it is a test file.
- **DS export** with the same settings: **0 created, 0 duplicates, all digests identical**. The export was a no-op, so matching succeeded.
- Tokens Studio's pending local change in the scratch file was **not pushed**.

## Batch N2: component colours (cosmetic)

| Check | Result |
|---|---|
| Renamed | **171**: 0 read-back mismatches, 0 duplicate names |
| Created / deleted | **0 / 0** (686) |
| Vars digests | `a24fb3e` / `43be1eeb` / `ea78197` = **expected** (N1+N2) |
| Styles, text, effects, bindings | **unchanged** |
| Colour variables still on old names | **0** of 570 |

- No variable was merged or removed, no registry token was created, no value or alias changed, and no component was edited. The adapter is unaffected, because component colours are not in it.

## Auth screens (section `23610:7`)

- 19 frames.
- 101 top-level instances: 97 local DS components and 4 Icon-library icons. 0 have a missing main component.
- 54/54 authored paints are bound.
- **Not caused by the migration:** the "Welcome back!" headline on 01.01.01 (`23621:1303`) no longer uses a DS text style, and the screens now have 54 bound paints instead of 52. These are manual edits made in the file before this run; the bindings digest was taken at the pre-check and did not change across the migration. They were left as found.

## Rollback

- Available per batch: `rename-N{1,2}-rollback.js` (same rows, reversed), or restore the version "pre-colour-naming". Then revert the 3 adapter commits.

## Out of scope / not done

- Paint, text and effect **style** names still use `Colors/…`.
- Spacing variable names are still mixed.
- Component colours have not been migrated semantically.
- None of these were started.
