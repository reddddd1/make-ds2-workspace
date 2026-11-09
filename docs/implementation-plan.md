# Implementation plan — Phase 1 backlog

> **Phase 1 is APPROVED (D-12, Mike, 2026-11-09). Phases 2–4 are NOT approved.**
> Phase 1 = safe foundations: inspection, validation, documentation and explicitly approved preparation. **No component refactoring, no token or variable writes, no bulk migration, no publishing.**
> Work the tasks **one at a time, in order**. Stop and report after each task; start the next only when Mike says so.
> **Status 2026-11-09:** Phase 1 complete (P1-03 verified 2026-11-09). Milestone report and Phase 2 proposal: `reports/PHASE-1-REPORT.md`.

## Global rules for every Phase 1 task

- **Figma:** read-only. Scripts may only read. Before any `use_figma` call, confirm the script contains no mutating calls (`create*`, `set*`, `remove`, `appendChild`, `insertChild`, `detachInstance`, `importComponentByKeyAsync` into a page, `setProperties`, `setBoundVariable`, `setValueForMode`, `combineAsVariants`, `createSlot`, publishing, any property assignment on a node). `figma.setCurrentPageAsync()` is allowed: it only navigates. **Never target `xJoAz66aekAToyhBmfGNt0` with anything but reads.**
- **`design-tokens` repo:** read-only, except the doc-only ADR-0011 entry in P1-02.
- **This workspace:** writes allowed (reports, registry, read-only scripts). Commit locally after Mike confirms; **push only with Mike's go-ahead**, after checking remote = `github.com/reddddd1/make-ds2-workspace`, branch = `main`, and listing the commits.
- Label every finding VERIFIED / APPROVED / PROPOSED / UNVERIFIED / BLOCKED. Never claim a fidelity percentage without approved reference images.
- Raise the **SUBSCRIPTION BLOCKER** alert (`subscription-policy.md`) if any task needs a paid feature.
- Each task ends with: what was done, evidence, open issues, and the subscription status block.

## Order and status

| ID | Task | Priority | Depends on | Status |
|---|---|---|---|---|
| **P1-01** | Workspace & environment inspection (read-only) | P0 | — | **DONE** (report in chat, no file — per Mike) |
| P1-02 | Record ADR-0011 (D-01) in `design-tokens` (`decisions/ADR-0011-*.md`; the repo has no `DECISIONS.md`) | P0 | P1-01 | **DONE** (`dcee093`, pushed) |
| P1-03 | Verify Mike's Figma duplicate (read-only) | P0 | P1-01, **Mike provides URL** | **DONE** (`reports/P1-03-duplicate-verification.md`) |
| P1-04 | Component registry from MAKER-DS-v2 (read-only) | P0 | P1-01 | **DONE** (`6edf894`) |
| P1-05 | Extended binding scan (spacing, radius, effects, text) | P1 | P1-04 | **DONE** (`cfee6be`) |
| P1-06 | Figma → registry token mapping report (read-only) | P1 | P1-01 | **DONE** (`d952e7b`) |
| P1-07 | Inventory of the 171 component-level colours (D-05) | P1 | P1-06 | **DONE** (`68ce0bb`) |
| P1-08 | Read-only regression checkers | P0 | P1-04 | **DONE** (`a7331e4`) |
| P1-09 | Token-sync validation spec + read-only dry-run (D-03) | P1 | P1-06; **Mike approves spec before dry-run code** | **DONE** — spec approved by Mike (`328f299`) |
| P1-10 | Button & Input field pilot plan (D-04) | P1 | P1-04, P1-05 | **DONE** (`1fadbcf`) |
| P1-11 | Modal native-Slot feasibility (D-06) | P1 | P1-04 | **DONE** (`c9523e9`) |
| P1-12 | Alert pilot plan (D-07) | P2 | P1-04 | **DONE** (`6205dbd`) |
| P1-13 | Phase 1 milestone report + Phase 2 proposal | P0 | all above | **DONE** (`039f95e`) |

**Mike-owned (not for Claude Code):** create the duplicate (D-02) · decide Proposal 0006 · confirm MAKE is fine with design data in a personal GitHub account · supply legacy login screenshots · authorise GitLab access.

---

## P1-01 — Workspace & environment inspection (read-only) — FIRST TASK

| Field | Detail |
|---|---|
| **Objective** | Confirm Claude Code has everything Phase 1 needs, and record the real state of this workspace and the token repo |
| **Dependencies** | None |
| **Affected assets** | Read: this workspace, `~/Documents/Codex/design-tokens` (local clone of the ADR-0010 canonical repo; confirmed in P1-01), Figma MCP connection. Write: `reports/P1-01-environment.md` only |
| **Required tools** | git, shell (read commands), Node/npm (version check only), Figma MCP (`whoami`, read-only) |
| **Proposed operations** | 1. Read `CLAUDE.md` and all `docs/`. 2. `git status`, `git log`, `git remote -v` here; list the handoff files that are uncommitted. 3. Locate `design-tokens`; report remote URL, branch, last commits, `git status`, whether `tokens/` is committed and pushed (compare `HEAD` with `origin/main` without fetching changes into the working tree; `git fetch` is allowed), counts of token files in `tokens/` vs `proposals/`. 4. If `node_modules` already exists there, run its validator (`npm run check` or the documented equivalent) and record the result; **if not, don't install — report it**. 5. Check Figma MCP availability (`whoami`); don't open any file yet. 6. Check the docs listed in `CLAUDE.md` → Docs exist. 7. Write the report |
| **Acceptance criteria** | Report contains: workspace git state; token repo remote/branch/HEAD vs origin; token counts; validator result or "not run (deps missing)"; Figma MCP status and account; list of missing access; subscription status block. **No file outside `reports/` changed; no file in `design-tokens` changed** (`git status` clean before and after) |
| **Validation** | Show `git status` of both repos before and after; diff of this workspace = only the new report (plus the uncommitted handoff files already present) |
| **Rollback** | Delete `reports/P1-01-environment.md` |
| **Approval** | Approved (D-12). Committing the handoff files + report: ask Mike first. Pushing: ask Mike first |
| **Risks / effort** | Low risk. ~15–30 min. Risk: `design-tokens` path differs → ask Mike |

## P1-02 — Record ADR-0011 in the token repo (doc-only)

| Field | Detail |
|---|---|
| **Objective** | Make D-01 part of the canonical decision record |
| **Dependencies** | P1-01 (repo state known, clean working tree) |
| **Affected assets** | `design-tokens/decisions/` only: new `ADR-0011-duplicate-library-refactoring.md` (text from `docs/decisions.md` §2) and an "Amended by: ADR-0011" line under ADR-0005's status. (Originally written as `DECISIONS.md`; the repo keeps one file per ADR — corrected in P1-01/P1-02 with Mike's approval.) |
| **Required tools** | git, editor |
| **Proposed operations** | Edit the file; show the diff; on Mike's OK, commit on `main` with message "docs: ADR-0011 duplicate-library refactoring (D-01)"; push only on separate OK after the ADR-0010 push checks |
| **Acceptance criteria** | Diff touches only the two ADR files in `decisions/`; ADR-0005 text otherwise unchanged; validator still passes (if runnable) |
| **Validation** | `git diff --stat` = 1 file; re-read the file |
| **Rollback** | `git restore` / delete the ADR files before commit, or `git revert dcee093` after |
| **Approval** | D-01 approved the content. Commit and push each need Mike's confirmation |
| **Risks / effort** | Low. ~10 min |

## P1-03 — Verify the Figma duplicate (read-only)

| Field | Detail |
|---|---|
| **Objective** | Confirm the duplicate Mike created is a faithful, separate copy before any future work targets it |
| **Dependencies** | Mike provides the file URL/ID |
| **Affected assets** | Read: duplicate + original. Write: `docs/project-handoff.md` (record URL/ID), `reports/P1-03-duplicate-verification.md` |
| **Required tools** | Figma MCP (`create_session`, `use_figma` read-only, `get_libraries`) |
| **Proposed operations** | Compare duplicate vs original: page list; component set names, variant counts and property definitions; variable collections, modes and counts; style counts; library subscriptions; confirm file keys differ; record the original's component `updatedAt` for 5 sample sets as the protection baseline |
| **Acceptance criteria** | File key ≠ `xJoAz66aekAToyhBmfGNt0`; 68 sets / ~1,170 variants / 681 variables / 7 collections match (or differences listed); duplicate is **not published** as a library (or report if it is); original's `updatedAt` baseline recorded |
| **Validation** | Two independent read calls give the same counts |
| **Rollback** | n/a (read-only) |
| **Approval** | Approved (D-02). Any edit to the duplicate is **not** approved |
| **Risks / effort** | Risk: duplicate published by accident → flag to Mike. ~20 min |

## P1-04 — Component registry (read-only)

| Field | Detail |
|---|---|
| **Objective** | Machine-readable inventory agents can use instead of re-scanning Figma |
| **Dependencies** | P1-01 |
| **Affected assets** | Read: original library (or verified duplicate). Write: `registry/components.json`, `registry/README.md`, `scripts/` (read-only scripts) |
| **Required tools** | Figma MCP `use_figma` (read), Node for JSON validation |
| **Proposed operations** | Run `scripts/figma-component-audit.js` per page (one call per page, in parallel); extend output with: component keys, full property definitions (names, types, defaults, variant options, preferred values), nested instance dependencies (including MAKER Icon library components and keys), exposed instances, unbound fills/strokes/text; write JSON with a schema version and source file key + timestamp |
| **Acceptance criteria** | 68 component sets and 12 standalone components present (or differences explained); every set has properties and variant counts; JSON validates; matches audit §2.3 totals |
| **Validation** | Re-run on two pages and diff; spot-check Buttons/Button (118 variants, 7 props) and Input field (53) |
| **Rollback** | Delete generated files |
| **Approval** | Approved (D-12) |
| **Risks / effort** | Large returns → keep per-page calls small. ~45–60 min |

## P1-05 — Extended binding scan

| Field | Detail |
|---|---|
| **Objective** | Close the gap noted in audit §2.3: spacing, radius, effect and text-style bindings per component |
| **Dependencies** | P1-04 |
| **Affected assets** | Write: `reports/P1-05-bindings.md`, update `registry/components.json` |
| **Required tools** | `use_figma` (read) |
| **Proposed operations** | For each component's own layers: `boundVariables` for padding/gap/radius/stroke width; effect style IDs; text style IDs; list raw values |
| **Acceptance criteria** | Per-set counts of bound vs raw for each property class; list of raw values with node paths for the 4 pilot sets |
| **Validation** | Spot-check 3 raw findings with `get_design_context` or a targeted read |
| **Rollback** | Delete report; revert registry file |
| **Approval** | Approved (D-12) |
| **Risks / effort** | ~30–45 min |

## P1-06 — Figma → registry token mapping report

| Field | Detail |
|---|---|
| **Objective** | Up-to-date mapping between Figma variables and approved registry tokens, against the live token repo |
| **Dependencies** | P1-01 |
| **Affected assets** | Read: `design-tokens` (`tokens/`, existing mapping scripts), Figma variables. Write: `reports/P1-06-token-mapping.md` + `.json` **in this workspace** |
| **Required tools** | Node, `use_figma` (read) |
| **Proposed operations** | Reuse `design-tokens/scripts/build-figma-mapping.mjs` **by running it with output redirected here** (don't write into `design-tokens`); classify each Figma variable: mapped / flagged (ΔE ≥ 1) / unmapped / deferred |
| **Acceptance criteria** | Every Figma variable in `_Primitives` + `1. Color modes` (core 121) appears with a status; no changes in `design-tokens` (`git status` clean) |
| **Validation** | Totals reconcile with 681 variables; sample 5 rows manually |
| **Rollback** | Delete reports |
| **Approval** | Approved (D-12) |
| **Risks / effort** | Script may write into its own repo by default → check before running. ~30 min |

## P1-07 — Component-colour inventory (D-05)

| Field | Detail |
|---|---|
| **Objective** | Document the 171 component-level colours for future evaluation; **preserve as-is** |
| **Dependencies** | P1-06 |
| **Affected assets** | Write: `docs/component-colours.md` |
| **Required tools** | `use_figma` (read) |
| **Proposed operations** | List each: name, Light/Dark values, alias target, which components use it (from registry), suggested future core-semantic equivalent (**PROPOSED** only) |
| **Acceptance criteria** | 171 rows (or explained difference); every row says "preserve; not migrated (D-05)" |
| **Validation** | Count check against collection |
| **Rollback** | Delete doc |
| **Approval** | Approved (D-05 defer + document) |
| **Risks / effort** | ~30 min |

## P1-08 — Read-only regression checkers

| Field | Detail |
|---|---|
| **Objective** | Build the permanent regression suite as read-only scripts, ready for Phase 2 |
| **Dependencies** | P1-04 |
| **Affected assets** | Write: `scripts/regression/*.js` (use_figma read bodies) + `scripts/regression/README.md` |
| **Required tools** | `use_figma` (read), Node |
| **Proposed operations** | Implement R-PAPER-01 (expected vs actual change across all variants in scope), R-PENPOT-01 (Light→Dark→Light re-read of values **and** bindings in a fresh call), R-FIGMA-01 (instance vs main layer-tree diff), R-SLOT-01 (instance count, slot content, `limitViolations`, linkage), plus linkage/binding/icon-source/`updatedAt` checks. Each takes a "baseline" JSON and a "current" JSON |
| **Acceptance criteria** | Each checker runs read-only against the Figma pilot scratch file `uMQLqPDG5I4rZAAHlhpInJ` and the original library, producing a pass report; a deliberately mismatched baseline (edited JSON, not Figma) produces a fail |
| **Validation** | Run twice; same result. Review scripts for mutating calls |
| **Rollback** | Delete scripts |
| **Approval** | Approved (D-12). Running checkers on the duplicate later is fine (read-only) |
| **Risks / effort** | ~1.5–2 h |

## P1-09 — Token-sync validation spec + read-only dry-run (D-03)

| Field | Detail |
|---|---|
| **Objective** | Prove, before any implementation, that a free registry → Figma sync would preserve values, aliases, modes, naming and existing bindings |
| **Dependencies** | P1-06. **Step 2 only after Mike approves the spec in step 1** |
| **Affected assets** | Write: `docs/token-sync-spec.md`, later `scripts/token-sync-dryrun.js` (read-only) and `reports/P1-09-dryrun.md` |
| **Required tools** | Node, `use_figma` (read) |
| **Proposed operations** | 1. Spec: mapping rules, how aliases and modes map, naming, how existing bindings are kept (update-in-place by variable ID, never delete/recreate), conflict rules, what the dry-run reports. 2. Dry-run: read registry + Figma variables (on the **verified duplicate** if available, else the original — read-only), output the change set that a sync *would* make: creates / updates / unchanged / conflicts, and any binding that would break |
| **Acceptance criteria** | Spec approved by Mike; dry-run produces a full change set with zero writes; any change that would alter a value, alias, mode, name or binding is listed for approval |
| **Validation** | Confirm zero writes (original `updatedAt` / variable count unchanged); review script for mutating calls |
| **Rollback** | Delete files |
| **Approval** | D-03 conditional. **Write mode is not approved** |
| **Risks / effort** | ~2 h |

## P1-10 — Button & Input field pilot plan (D-04)

| Field | Detail |
|---|---|
| **Objective** | Plan editable text, parent-level icon swaps and a mobile Pressed state for Buttons/Button and Input field, based on inspection |
| **Dependencies** | P1-04, P1-05 |
| **Affected assets** | Write: `docs/pilot-button-input.md` |
| **Required tools** | `use_figma` (read), `get_screenshot` |
| **Proposed operations** | Inspect both sets fully (all variants, nested Icon wrapper, text layers, current hover tokens, consumer usage in the pilot scratch file); propose: TEXT property names and which layers they bind; INSTANCE_SWAP properties with MAKER Icon library preferred values; Pressed state (tokens per LOGIN-SPECS: same as hover), how it fits the variant matrix; expected affected variant counts; regression checks to run; risks (F2 layer drop, instance override loss) |
| **Acceptance criteria** | Plan lists exact expected counts per change (e.g. variants gaining `State=Pressed`), the property definitions, impact on existing instances, and R-PAPER-01/R-FIGMA-01 checks. No Figma writes |
| **Validation** | Counts reproduced from the registry |
| **Rollback** | Delete doc |
| **Approval** | Approved for planning only |
| **Risks / effort** | ~1–1.5 h |

## P1-11 — Modal native-Slot feasibility (D-06)

| Field | Detail |
|---|---|
| **Objective** | Verify Slot API/MCP support and plan replacing Modal's legacy `Slot` + `Drawer content` swap without breaking linkage |
| **Dependencies** | P1-04 |
| **Affected assets** | Write: `docs/pilot-modal-slot.md` |
| **Required tools** | Official Figma docs, `use_figma` (read), Figma MCP tool list |
| **Proposed operations** | Re-check docs (Slots GA status, "MCP support coming soon" note); read-only probe: `typeof` checks for `createSlot`, `SLOT` in property types — **do not call them**; inventory Modal usage (instances of Modal in the library and pilot file, current `Drawer content` values); write migration plan with manual steps, expected counts, R-SLOT-01 checks |
| **Acceptance criteria** | Clear verdict: supported via `use_figma` / supported only in UI / unsupported, with evidence; plan preserves linkage; zero writes |
| **Validation** | Evidence links + probe output in the doc |
| **Rollback** | Delete doc |
| **Approval** | Approved for planning only |
| **Risks / effort** | ~45 min |

## P1-12 — Alert pilot plan (D-07)

| Field | Detail |
|---|---|
| **Objective** | Plan the Alert component pilot (in place of Card) |
| **Dependencies** | P1-04 |
| **Affected assets** | Write: `docs/pilot-alert.md` |
| **Required tools** | `use_figma` (read), `get_screenshot` |
| **Proposed operations** | Inspect Alert (4 variants, booleans Actions/Supporting text/Show icon/Show close, Color variant); propose TEXT props, icon swap, whether the actions region should be a Slot (D-06 learnings), token bindings and contrast per colour |
| **Acceptance criteria** | Plan with expected counts and regression checks; zero writes |
| **Validation** | Counts reproduced from registry |
| **Rollback** | Delete doc |
| **Approval** | Approved (D-07, planning) |
| **Risks / effort** | ~30 min |

## P1-13 — Phase 1 milestone report

| Field | Detail |
|---|---|
| **Objective** | Close Phase 1 and request Phase 2 approval |
| **Dependencies** | P1-01…P1-12 (P1-03 may stay blocked) |
| **Affected assets** | Write: `reports/PHASE-1-REPORT.md` |
| **Proposed operations** | Summarise results, evidence, open issues, subscription status, proposed Phase 2 scope with tasks in the same format |
| **Acceptance criteria** | Every task has a status and evidence; nothing beyond Phase 1 executed |
| **Approval** | Phase 2 needs Mike's explicit approval |

---

## Backlog — not approved (do not start)

| ID | Item | Source |
|---|---|---|
| B-01 | Remove 15 single-option variant axes | D-08 (deferred) |
| B-02 | Secondary button border decision | D-09 (deferred) |
| B-03 | Variable scopes (288 `ALL_SCOPES`) + `codeSyntax.WEB` | D-10 (deferred) |
| B-04 | Formal Tokens Studio plan decision | D-11 (deferred; Free in force) |
| B-05 | Phase 2: implement Button/Input/Modal/Alert pilot changes on the duplicate | needs Phase 2 approval |
| B-06 | Registry → Figma sync write mode | D-03 condition + separate approval |
| B-07 | Remaining OPTIMIZE / REPAIR items (audit §4.2) | Phase 3 |
| B-08 | Screen-automation pipeline | Phase 4 |
| B-09 | Generic Card component | D-07 (not now) |
| B-10 | Migration of the 171 component colours | D-05 (deferred) |
