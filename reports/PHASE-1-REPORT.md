# MAKE DS2 — Phase 1 milestone report (P1-13)

> 2026-11-09 · Phase 1 approved by Mike (D-12). **Phase 1 is complete except P1-03 (blocked: waiting for the duplicate's URL).** Nothing beyond Phase 1 was executed. **Phase 2 is proposed below and needs Mike's explicit approval.**
> Labels: VERIFIED / APPROVED / PROPOSED / UNVERIFIED / BLOCKED / DECISION (Mike).

## 1. Summary

- 11 of 12 tasks done, 1 blocked (P1-03). Every result is committed in `reddddd1/make-ds2-workspace`; the only token-repo change is ADR-0011 (P1-02), committed and pushed.
- **No Figma write, no variable or token change, no publish.** Every `use_figma` script was reviewed for mutating calls before running. The original library's protection check (fingerprint + 180 pilot-variant hashes) is **identical at the end of Phase 1** to the P1-08 baseline (`reports/P1-13/protection-check.md`, PASS, read 17:01 UTC).
- Regression suite, component registry, binding scan, token mapping, sync spec + dry-run and three pilot plans are ready for Phase 2.

## 2. Task status and evidence

| ID | Task | Status | Evidence | Commit |
|---|---|---|---|---|
| P1-01 | Workspace & environment inspection | **DONE** (report in chat, per Mike: no file) | Git state of both repos, token counts (10 approved / 15 proposal token files), Figma MCP account | — |
| P1-02 | ADR-0011 in `design-tokens` | **DONE**, pushed | `decisions/ADR-0011-duplicate-library-refactoring.md`, one line on ADR-0005 | `dcee093` (token repo) |
| P1-03 | Verify the Figma duplicate | **DONE** (after this report) | `reports/P1-03-duplicate-verification.md` — identical copy, unpublished, Icon library not subscribed | (P1-03 commit) |
| P1-04 | Component registry | **DONE** | `registry/components.json` (95 owners; 68 sets / 1,169 variants / 12 standalone in base scope = audit) | `6edf894` |
| P1-05 | Extended binding scan | **DONE** | `reports/P1-05-bindings.md`, `bindingScan` in registry | `cfee6be` |
| P1-06 | Figma → registry token mapping | **DONE** | `reports/P1-06-token-mapping.{md,json}` (681 variables) | `d952e7b` |
| P1-07 | 171 component colours (D-05) | **DONE** | `docs/component-colours.md` (171 rows, all "preserve; not migrated") | `68ce0bb` |
| P1-08 | Read-only regression checkers | **DONE** | `scripts/regression/`, `reports/P1-08-regression/` (5 PASS runs, 8/8 self-test scenarios) | `a7331e4` |
| P1-09 | Token-sync spec + dry-run (D-03) | **DONE** — spec **APPROVED** by Mike | `docs/token-sync-spec.md`, `reports/P1-09-dryrun/` (0 conflicts, 1 create, 11 alias updates) | `328f299` |
| P1-10 | Button & Input field pilot plan (D-04) | **DONE** (plan) | `docs/pilot-button-input.md`, `reports/P1-10-pilot/` | `1fadbcf` |
| P1-11 | Modal native-Slot feasibility (D-06) | **DONE** (plan) | `docs/pilot-modal-slot.md`, `reports/P1-11-modal-slot/` | `c9523e9` |
| P1-12 | Alert pilot plan (D-07) | **DONE** (plan) | `docs/pilot-alert.md`, `reports/P1-12-alert/` | `6205dbd` |
| P1-13 | This report | **DONE** | `reports/PHASE-1-REPORT.md`, `reports/P1-13/` | (this commit) |

## 3. Key findings (VERIFIED)

**Library structure**
1. 46 nested-instance dependencies point to **main components that no longer exist** (295 instances), including 9 icon-like ones not from the MAKER Icon library; 3 orphan instances on the Modals page playground (P1-04, P1-08).
2. Instance-swap properties: 8, not 7 (audit missed `Illustration wrapper`); 17 single-option variant axes (audit: 15).
3. Hidden layers inside instances are omitted from Plugin API reads by default (`skipInvisibleInstanceChildren`); every structural check must turn it off (P1-08).

**Tokens and bindings**
4. Stroke widths are never bound (no border-width variables exist); `Size=md` button padding (10/14 px) is unbound — no matching token until **proposal 0006** (P1-05).
5. All approved primitives match Figma exactly; 8 semantic colours differ in 11 places — all approved remaps (proposals 0002/0004), i.e. Figma does not yet show the approved values (P1-06, P1-09).
6. Only 18 of 171 component colours are used in the library; 8 components bind primitives directly; 4 bind another library's variables (P1-07).

**Components**
7. Input field: 16 different internal layouts across 53 variants, no boolean/TEXT/swap properties — the root of pilot finding F2 (P1-10).
8. 10 Button Hover variants are identical to Default (Primary_alt, Secondary icon-only) (P1-10).
9. Alert `Color=Error` uses the Brand icon (defect); Featured-icon glyph contrast fails for Gray/Success (P1-12).
10. Slots are GA; Modal's instance-swap placeholder "cannot be converted directly" (Figma) — migration is manual-assisted; only 1 Modal instance found (P1-11).
11. Dark-mode Link-brand label is 3.47:1 today (fails 4.5:1); the approved remap fixes it (6.48:1) (P1-12).

## 4. Open issues

| # | Issue | Owner | Blocks |
|---|---|---|---|
| O-1 | ~~Duplicate not provided~~ — resolved 2026-11-09 (P1-03). Remaining: enable MAKER Icon library in the duplicate | Mike | P2-04 icon swaps |
| O-2 | Proposal 0006 (spacing 2.5/3.5, border-width, component tokens) undecided | Mike | Binding `md` padding and stroke widths |
| O-3 | Library analytics: Modal / Alert / Button / Input usage in other team files | Mike | Modal slot migration census; impact estimates |
| O-4 | `design-tokens` commits authored as `mike@MacBook-Air.local` (no repo `user.email`) | Mike | Nothing (attribution only) |
| O-5 | Node.js not installed → token validator (`npm run check`) not runnable | Mike (install) | Validator evidence for future token changes |
| O-6 | `docs/project-handoff.md` and the implementation-plan status column still show the start-of-Phase-1 state | Agent, on approval | Nothing |
| O-7 | P1-01 doc inconsistencies (missing "§Handoff checklist", ADR-0002 references, startup-prompt conflict) | Agent, on approval | Nothing |
| O-8 | Company design data in a personal GitHub account; social sign-in / OTP scope; dark surface black vs gray-950; GitLab access; legacy login screenshots | Mike | Fidelity measurement, production handoff |

## 5. Decisions pending (from the Phase 1 plans)

| From | Decision |
|---|---|
| P1-10 | Button `Label` default text · icon mechanism (Option B first) · Pressed scope (25 / 15 / new design) · Input field approach (normalise login variants first) · approve checker enhancements E1/E2 |
| P1-11 | Slot settings and default content · rename `[Slot]` → `Body` · run Library analytics · approve E3 |
| P1-12 | Fix `Color=Error` → Critical icon · add `Color=Warning` · alert icon decorative or status · expose Featured icon vs local container · default texts |
| P1-09 | Per-row approval of the 12 sync rows (only when Phase 2 and write mode are approved) |

## 6. Subscription status

**Current plan:** Tokens Studio Free (assumed; unverified — no Tokens Studio use in this project) · **Workflow status:** Unblocked · **Paid features encountered:** none · **Upgrade required now:** No · **Next anticipated dependency:** none — the scripted `use_figma` sync (D-03) needs no Tokens Studio feature. No SUBSCRIPTION BLOCKER was raised in Phase 1.

## 7. Phase 2 proposal (PROPOSED — needs Mike's approval)

**Scope:** pilot changes on the **verified duplicate only** — Button, Input field (login variants), Modal, Alert — plus the approved token remaps. Never the original; never publish (publishing stays Mike's manual step). One task at a time; stop and report after each. Every structural change runs the P1-08 suite (R-PAPER-01, R-PENPOT-01, R-FIGMA-01, R-SLOT-01, linkage, bindings, icons, Light + Dark, persistence).

| ID | Task | Depends on | Writes | Acceptance | Approval needed |
|---|---|---|---|---|---|
| **P2-00** | Finish P1-03 (verify duplicate) · checker enhancements E1–E3 · re-baseline all collectors on the duplicate · `selftest.py` | O-1 | Workspace only | Duplicate verified; enhanced suite passes self-test and two baseline runs agree | **Approved 2026-11-09 · DONE** (`reports/P2-00-regression/`) |
| **P2-01** | Token sync on the duplicate: re-run the dry-run there, then apply the approved rows (1 create + 11 alias updates) | P2-00 | Duplicate variables | Post-sync dry-run = 0 operations; deletes/retypes/renames 0; R-PENPOT-01 shows only the approved value changes | **Approved 2026-11-09 · DONE** (`reports/P2-01-sync/`) |
| **P2-02** | Button `Label` TEXT property (76 variants) | P2-00 | Duplicate component | R-PAPER-01 76 changed / 42 unchanged; all scratch label overrides preserved (E2) | Change approval |
| **P2-03** | Button `State=Pressed` (25 variants, 118 → 143) | P2-02 | Duplicate component | Each Pressed hash = its Hover sibling; no existing variant changed | Pressed-scope decision |
| **P2-04** | Icon access: probe nested-property binding; then Option B (expose `Icon wrapper` / Featured icon / Alert action buttons) | P2-00 | Duplicate components | Glyph overrides unchanged; icons from library only; 0 new divergence | Mechanism decision |
| **P2-05** | Input field: normalise the 13 login variants, then `Value` / `Label` TEXT properties | P2-00 | Duplicate component | R-FIGMA-01 0 new divergence after every state switch; login screens unchanged visually | Input approach decision |
| **P2-06** | Alert: TEXT properties, Error → Critical icon, gap binding, optional Warning | P2-04 | Duplicate component | §4 counts of `pilot-alert.md`; contrast table recomputed | Alert decisions |
| **P2-07** | Modal body → native Slot (census, copy test, convert, restore, deprecate legacy `Slot`) | P2-00, O-3 | Duplicate component | R-SLOT-01 PASS; instance count and content preserved; `limitViolations` empty | Slot decisions + Library analytics |
| **P2-08** | Phase 2 report: rebuild the 10 login screens against the duplicate, Light + Dark, fidelity only with approved reference screenshots | all above | Duplicate consumer copy | Report with evidence; nothing published | Phase 3 request |

Not in Phase 2 (backlog): D-08 single-option axes, D-09 Secondary border, D-10 scopes/code syntax, 171 component colours (D-05), Card (D-07), screen automation (Phase 4), deleting orphan components or the legacy `Slot`.
