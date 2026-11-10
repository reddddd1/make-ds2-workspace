# Tokens Studio pilot: pre-sync report (auth tokens)

- **Date:** 2026-11-10
- **Status:** A1 done (branch on GitHub, verified). A2 is blocked on two credential steps that only Mike can do (see the end of this report). **No Figma writes, no change to `tokens/`.** A2–A4 are waiting.
- **Target file:** DS duplicate `PpnTy1pkB2FTZFq6i6seSy`. It is never the original library.
- **Canonical source:** `reddddd1/design-tokens` `main` @ `964d736`. Tokens Studio is an interface to it, not a source.
- **Rules followed:**
  - spec `docs/token-sync-spec.md`: identity by variable ID, no renames, no new collections or modes, no binding edits
  - ADR-0011
  - deferred items untouched: naming, radius, legacy colour

## Pilot scope

13 semantic auth tokens and the 17 primitives they alias, 30 variables in total:

- `themes/{light,dark}/color.tokens.json` (12)
- `color-states.tokens.json` (1)

## Read-back result (tested, `use_figma` read-only, 2 calls)

| Check | Result |
|---|---|
| All 30 map entries resolve to an existing variable | ✅ 30/30 |
| Primitive hex values = registry | ✅ 17/17 |
| Semantic aliases per mode = registry (Light and Dark) | ✅ 26/26 (13 tokens × 2 modes) |
| Duplicate variable names in the file | 0 (686 local variables) |
| Collections or modes involved | `_Primitives` (mode "Style" `5248:3`) · `1. Color modes` ("Light mode" `5256:0`, "Dark mode" `5353:0`) |

**The pilot set is already in sync.** A correct first sync is therefore a **no-op**, which makes it a safe test: any change Tokens Studio proposes is a defect of the configuration, not a real update.

## The six required items

| # | Item | Pilot answer |
|---|---|---|
| 1 | Tokens to be **created** | **0** expected. Any "create" in the Tokens Studio preview means a name mismatch, so abort (see the risk below) |
| 2 | Tokens to be **updated** | **0** value changes (all values and aliases match) |
| 3 | Existing variables **reused** | **30**: 17 in `_Primitives`, 13 in `1. Color modes`. IDs and keys are in `preview/$themes.json` |
| 4 | Variables **at risk of duplication** | **23 of 30** if Tokens Studio uses registry names. Only 7 Figma variables already carry registry-style names: 5 semantic (`color/text/error-primary`, `color/text/brand-primary`, `color/bg/brand-primary`, `color/bg/brand-primary-hover`, `color/border/primary`) and 2 primitives (`color/brand/600`, `color/gray/450`). The other 23 are `Colors/…` names (e.g. `Colors/Text/text-success-primary`, `Colors/Brand/700`). **Mitigated** by the adapter below, which names tokens exactly like the Figma variables: expected risk 0, but **UNVERIFIED** until the dry run |
| 5 | Impact on **aliases and component bindings** | None expected. Variable IDs stay the same, so every existing binding stays the same. Aliases are rewritten to the same targets. The risk is only if Tokens Studio creates new variables, because then components would stay bound to the old ones and the two would drift. Hence the "0 creates" abort rule |
| 6 | **Light/Dark mode mapping** | registry `themes/light` → `1. Color modes` / **Light mode** (`5256:0`) · registry `themes/dark` → **Dark mode** (`5353:0`) · registry `primitives` → `_Primitives` / **Style** (`5248:3`). In Tokens Studio: theme group "1. Color modes" with themes "Light mode" and "Dark mode"; the primitives set is `source` |

## Tokens Studio compatibility (labelled)

| Topic | Status | Note |
|---|---|---|
| GitHub sync, multi-file sets, `$themes.json` / `$metadata.json` | documented (vendor), **untested here** | Mike sets the provider up with his own GitHub token; I never enter credentials |
| DTCG `$value` / `$type` | documented (W3C format option) | |
| DTCG 2025.10 **colour objects** (`{colorSpace, components, hex}`) | **unknown / likely unsupported** | So the adapter emits hex strings |
| Matching to existing variables | **unknown**: name-based vs `$figmaVariableReferences` (keys) | The preview pre-fills references with the real keys *and* uses Figma names, so both paths match |
| Token names with spaces or parentheses (`Colors/Gray (dark mode)/600`) | **unknown** | First thing to check in the dry run |
| "Remove variables not connected to tokens" option | documented | **Must stay OFF.** It would delete the other 656 variables |
| Plan tier (Pro is needed for variable sync) | stated by Mike: Organization / Enterprise | |

## Proposed architecture (no second definition of any token)

```
design-tokens (canonical DTCG)
  └─ scripts/build-tokens-studio.mjs  (new, generated output, CI-checked)
       └─ adapters/tokens-studio/   ← generated: Figma-named, hex values, $themes.json with IDs/keys
            └─ branch tokens-studio/pilot-auth  ← Tokens Studio reads this (pull only)
                 └─ Tokens Studio → Figma duplicate (manual "Export to Figma", pilot sets only)
validation: existing Claude Code scripts (dry-run diff, read-back by variable ID)
```

- Edits made in Tokens Studio, if any, come back as a PR against the adapter. They are not merged until the generator reproduces them from canonical tokens. No auto-push.
- The generated adapter is the same pattern as `adapters/tailwind`: derived output, not a second copy.

`preview/` holds a **local draft** of the adapter output for the 30 pilot tokens (3 sets, `$themes.json` and `$metadata.json`). It is uncommitted and nothing is pushed.

## Steps that need approval (in order)

1. **A1:** Add `scripts/build-tokens-studio.mjs` and `adapters/tokens-studio/` (pilot scope only) on a local branch `tokens-studio/pilot-auth`, run `npm run check`, then **push that branch** to `reddddd1/design-tokens` (a remote change, gate 2). `main` stays the same.
2. **A2 (Mike, in the plugin):** set up GitHub sync on branch `tokens-studio/pilot-auth`, adapter path, **pull only**. Confirm the plan tier.
3. **A3:** Dry run in the duplicate: Tokens Studio "Export to Figma → Variables" with **only** the pilot themes selected and the "remove unconnected" option **OFF**.
   - Before confirming, I read the preview and abort if it shows any create, rename or delete.
4. **A4:** Read back the 30 variables by ID, plus the variable count (686), plus a binding spot-check. Write a report.

## A1 applied (2026-11-10, approved by Mike: "Approve A1"; plan tier stated: Organization / Enterprise)

- `design-tokens` local branch `tokens-studio/pilot-auth`, commit `38a1fbe` (on top of `main` `964d736`). **`tokens/` unchanged.**
  - `scripts/build-tokens-studio.mjs` (generator, `--check` mode)
  - `adapters/tokens-studio/figma-binding.pilot.json` (30 tokens: variable ID, key and current Figma name)
  - `adapters/tokens-studio/tokens/{pilot/*.json,$themes.json,$metadata.json}`
  - `adapters/tokens-studio/README.md`
  - npm scripts `build:tokens-studio` and `check:tokens-studio`
- `npm run check`: tokens valid (primitives 120, semantic 8, themes 13/13), 29/29 tests pass. `check:tokens-studio` passes. The generated sets are identical to `preview/`.
- **Published via GitHub web, through Mike's signed-in Chrome (Mike: "control my pc instead or via chrome").** I created branch `tokens-studio/pilot-auth` from `main` and uploaded the files in 5 web commits. Verified by fetching the raw files: **9/9 byte-identical** (sha256) to local `38a1fbe`; the compare view shows 9 files changed, `tokens/` untouched, "Able to merge". The local branch has the same tree but a different history (1 commit vs 5); to align it, run `git fetch && git reset --hard origin/tokens-studio/pilot-auth` on that branch.
- Housekeeping: git left `.git/HEAD.lock` (the VM can't delete files), so I moved it to `.git/stale-HEAD-lock-20261110`. It's safe to delete.

## A2 status (2026-11-10)

- Tokens Studio for Figma **v2.13.2** opens in the DS duplicate (Chrome). It has **no sync provider configured** and **no Pro licence active** in this plugin instance (it shows "GET PRO").
- Mike enters both himself; agents never enter credentials:
  1. **Licence key:** GET PRO → add licence key.
  2. **GitHub sync:** Settings → Sync providers → Add new → GitHub. Fields:
     - Name `design-tokens pilot`
     - Personal access token: fine-grained, repo `reddddd1/design-tokens` only, Contents **read-only**
     - Repository `reddddd1/design-tokens`
     - Branch `tokens-studio/pilot-auth`
     - File path `adapters/tokens-studio/tokens`
     - Base URL empty
- Then: pull, check the 3 sets and 3 themes, and stop before A3 (export preview).

## A2–A4 done (2026-11-10, Mike: "just do it and not ask me")

**A2: connection (tested).**
- Tokens Studio v2.13.2 in Chrome on the DS duplicate. Pro is active.
- GitHub sync provider "design-tokens pilot": `reddddd1/design-tokens`, branch `tokens-studio/pilot-auth`, path `adapters/tokens-studio/tokens`, W3C DTCG format. Status: Active.
- Mike created and pasted the read-only, fine-grained token himself.
- Pull loaded the 3 sets (`pilot/primitives`, `theme-light`, `theme-dark`) and the 3 themes (`_Primitives`/Style, `1. Color modes`/Light mode and Dark mode).
- Names with spaces and brackets (`Gray (dark mode)`, `Green lime`) resolve without errors.

**A3: export (tested).**
- "Export styles & variables to Figma", with these options:
  - Variables: Color only
  - Styles: none
  - "Update existing style and variable names": OFF
  - "Remove styles and variables without connection to a token": OFF
  - Themes: only the 3 pilot themes
- Tokens Studio has **no change-count preview** at this step (documented gap). I used a before/after fingerprint diff instead (below).

**A4: read-back (tested, `use_figma` read-only, baseline taken right before the export).**

| Check | Before | After |
|---|---|---|
| Local variables | 686 | **686** (0 created, 0 deleted) |
| Collections / modes | 7 · Light mode, Dark mode | 7 · same |
| Duplicate variable names | 0 | **0** |
| `1. Color modes` (13 pilot semantics + 279 others), fingerprint over ID, name, values, scopes, codeSyntax, description | 3e24a88 | **unchanged**, so aliases, modes and names are identical |
| Spacing, Radius, Widths, Containers, Typography | — | **unchanged** |
| `_Primitives` fingerprint | 6714c7c0 | **changed** (c96d7337) |
| Paint/text/effect styles: count | 393/65/25 | 393/65/25 (count unchanged) |
| Paint/text/effect styles: fingerprint (incl. resolved paints) | — | changed |
| 17 pilot primitives, 8-bit hex | registry hex | **17/17 still equal to the registry**; names, scopes, codeSyntax and description unchanged |

- **Interpretation (assumption, not proven).** Tokens Studio rewrote the 17 pilot primitive values as floats from the same hex (e.g. Brand/300 = 171/255). The hex didn't change, but the raw float bits did, so the fingerprint changed. Paint styles bound to those primitives then resolve to the re-encoded floats.
- Without a per-variable baseline I can't prove that no *non-pilot* primitive changed. Tokens Studio only writes the tokens in the selected themes. **Next run:** take a per-variable baseline at 8-bit hex so a no-op is provable.
- **Bindings:** no variable was created, deleted or renamed, and the IDs are unchanged, so component bindings can't have moved.

**Result: the GitHub → Tokens Studio → Figma pilot works without duplicates or renames.** Naming adapter validated: name-based matching reused 30/30 existing variables.
- Gaps:
  - (1) no export preview, so keep the scripted fingerprint diff as the gate
  - (2) float re-encoding is visible in diffs; compare at 8-bit hex
- Token-scope note: the plugin stores Mike's read-only GitHub token locally in Chrome. It expires in 30 days.

## B1 / B3 (2026-11-10)

- **B1: PASS.** 21 hex-precision colour primitives added to the adapter (`b519b49`, pushed to `tokens-studio/pilot-auth`, remote files sha256-verified) and exported to the DS duplicate.
  - Post-export digest equals the stored baseline on all 6 parts: 686 variables, styles, bindings.
- **B3 scratch: PASS.** The generator now emits DTCG `px` dimensions as Tokens Studio `number`.
  - Branch `tokens-studio/b3-spacing` (`ae3c83e`).
  - In the scratch file, 34 spacing primitives were exported, with names, hidden flags, empty scopes and alias/binding fixtures matching the DS.
  - Before/after `compare-snapshots.mjs`: **IDENTICAL**. 34/34 reused, 0 created, aliases and bindings intact.
  - **Not exported to the duplicate** (awaiting approval). The duplicate's Tokens Studio stays on `tokens-studio/pilot-auth`.

- **B3 DS export: PASS (2026-11-10, approved).** Number variables only, from `tokens-studio/b3-spacing`. Pre/post digests identical to the baseline; 34/34 spacing variables reused (IDs, values, hidden, scopes). The duplicate now tracks `tokens-studio/b3-spacing`, which is a superset of the pilot sets and B1.
