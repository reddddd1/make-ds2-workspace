# Project handoff — Phase 1

> **Handoff issued 2026-11-09 for Phase 1 only (D-12).** This file lets Claude Code work without the Cowork conversation.
> **Status updated 2026-11-09 after P1-13** (Phase 1 milestone report: `reports/PHASE-1-REPORT.md`).

## Current status

| Item | State | Label |
|---|---|---|
| Refactoring audit | Complete (`docs/audit.md`) | VERIFIED evidence |
| Decisions D-01–D-12 | Reconciled (`docs/decisions.md`) | APPROVED / PLANNING / DEFERRED as listed |
| Phase 1 | **Complete** (P1-01…P1-13 done; see `reports/PHASE-1-REPORT.md`, `reports/P1-03-duplicate-verification.md`) | APPROVED · VERIFIED |
| Phase 2 | **P2-00 done; P2-01 done** (token sync applied to the duplicate: 1 create + 11 alias updates, `reports/P2-01-sync/README.md`); Input field border → `border-primary` on 24 variants and Focused ring → brand on 8 (`reports/P2-01b-input-border/`); **P2-02 done**: Button `Label` TEXT property, default "Button", 76 variants, 101/101 instance labels kept (`reports/P2-02-button-label/`); **P2-03 done**: Button `State=Pressed` (25 variants = Hover, 118 → 143; `reports/P2-03-button-pressed/`); **P2-04 done**: 285 nested instances exposed (Button/Input field icon swaps, Alert Featured icon + action buttons; `reports/P2-04-icon-access/`); **P2-06a done**: Alert icons per colour (info / circle-alert / octagon-alert / circle-check) + Error → Critical (`reports/P2-06a-alert-icons/`); **P2-05 done**: 13 login Input field variants normalised to the spec anatomy (Label row / box / helper) + `Label` (13) / `Text` (7) TEXT properties (`reports/P2-05-input-normalise/`). P2-06 (rest)…P2-08 **not approved**: each needs Mike's approval | P2-00/P2-01 APPROVED · VERIFIED; rest PROPOSED |
| Phases 3–4 | Not approved | — |
| Figma duplicate | **MAKER-DS-v2 (WIP Refactor)** — verified identical copy, not published; not yet subscribed to MAKER Icon library (Mike to enable before Phase 2). Read-only until Phase 2 is approved | VERIFIED (P1-03) |
| Duplicate URL / file key | https://www.figma.com/design/PpnTy1pkB2FTZFq6i6seSy/MAKER-DS-v2--WIP-Refactor- · `PpnTy1pkB2FTZFq6i6seSy` | VERIFIED (P1-03) |
| Token repo live state | `main` = `origin/main` at `dcee093` (ADR-0011, P1-02); `tokens/` pushed; 10 approved + 15 proposal token files; validator not runnable (no Node.js) | VERIFIED (P1-01, P1-02) |
| App repo (GitLab) | No access; Claude GitLab connector needs authorization | BLOCKED |
| Tokens Studio | Free (operating rule); no paid feature needed in Phase 1; scripted sync needs none | UNVERIFIED plan · Unblocked |
| Original library protection | Fingerprint + 180 pilot-variant hashes unchanged at end of Phase 1 (`reports/P1-13/protection-check.md`) | VERIFIED |

## Identifiers

| Asset | Identifier | Notes |
|---|---|---|
| Original library | MAKER-DS-v2 `xJoAz66aekAToyhBmfGNt0` (published "MAKER DS v2", team) | **Protected** |
| Icon library | "MAKER Icon library" (team), library key `lk-afa529fd36c16e1464ab8ba439bc03238c179a387d9b8e2ab257153dbe13bd534efdb9f03fc2eaad15f971319ca00773b2489e351b1b842b253c9548017b7165` | File key UNVERIFIED |
| DS library key | "MAKER DS v2" `lk-38bd95fb4c03f746fc5c0fabb50b49c1513fe964066ac7179f2554d3294cfc72d40b5fa681c5a40f0963369ae17ba33af2b93904edc29f648b4088e43bc9691a` | For scoped `search_design_system` |
| Figma pilot scratch | "DS2 – Figma Pilot – scratch" `uMQLqPDG5I4rZAAHlhpInJ` | 10 login screens, consumer test bed |
| Penpot scratch | `3681d377-bc58-8110-8008-ea451983d03c` | Synthetic tokens only |
| Token repo | `github.com/reddddd1/design-tokens` (private); local `~/Documents/Codex/design-tokens` (VERIFIED, P1-01) | Canonical tokens; ADR-0011 added (P1-02) |
| This workspace | `~/Documents/Codex/MAKEDSv2-refactor-plan` → `github.com/reddddd1/make-ds2-workspace` (private) | One commit per Phase 1 task (`git log`) |

### Pilot component references (original library)

| Component | Node ID | Variants |
|---|---|---|
| Buttons/Button | `3287:427074` (page `1:1183`) | 118 |
| Buttons/Button destructive | `17503:16162` | 68 |
| Input field | `17517:11024` (page `85:1269`) | 53 |
| Modal / _Modal header / _Modal actions | `4057:415205` / `4055:413620` / `4057:414352` (page `172:4293`); legacy `Slot` component `17540:4885` | 1 / 1 / 3 |
| Alert | `1130:81134` (page `176:4256`) | 4 |

## Pilot findings carried forward

- **Figma pilot:** CONDITIONAL GO. 72/72 linked instances, 174/174 bound, 0 raw values, atomic writes, $0.51/screen. F1 unpublished headline/nav header; F2 variant switch dropped "Helper text"; F3 iOS status bar/home indicator not mode-aware; F4 no TEXT props.
- **Paper pilot:** exploration only; partial writes; arrows reached Primary Default but not Hover/Focus/Disabled → **R-PAPER-01**.
- **Penpot pilot:** main gap rebind didn't carry the binding to copies; reverted after theme refresh → **R-PENPOT-01**.

## Known regressions to guard against

R-PAPER-01, R-PENPOT-01, R-FIGMA-01, R-SLOT-01 (`docs/regression-checks.md`). Read-only checkers: `scripts/regression/` (P1-08); they must set `figma.skipInvisibleInstanceChildren = false`.

## Phase 1 outputs to start from

| Need | File |
|---|---|
| Component inventory | `registry/components.json` (+ `bindingScan`) |
| Token mapping / sync | `reports/P1-06-token-mapping.md`, `docs/token-sync-spec.md` (APPROVED), `reports/P1-09-dryrun/` |
| Component colours | `docs/component-colours.md` |
| Pilot plans | `docs/pilot-button-input.md`, `docs/pilot-modal-slot.md`, `docs/pilot-alert.md` |
| Open issues and decisions | `reports/PHASE-1-REPORT.md` §4–§5 |

## Access requirements

| Need | For | Status |
|---|---|---|
| Figma MCP in Claude Code Desktop (read access to the library, icon library, scratch file) | P1-03…P1-12 | VERIFIED (P1-01: Full seat, MAKE Design; reads used through P1-13) |
| Local `design-tokens` clone | P1-01, P1-02, P1-06 | VERIFIED (P1-01) |
| Node.js (token validator `npm run check`) | Token changes | Not installed (O-5) |
| Library analytics (Modal/Alert/Button/Input usage in team files) | P2-07, impact estimates | Waiting on Mike (O-3) |
| Figma duplicate URL | P1-03 | VERIFIED (provided 2026-11-09) |
| MAKER Icon library enabled in the duplicate | P2-04 icon swaps | VERIFIED enabled (2026-11-09) |
| GitLab app repo | Phase 2+ (ADR-0009, Code Connect) | BLOCKED |
| Legacy login screenshots | Fidelity measurement | Waiting on Mike |

## Unresolved questions

1. Has MAKE approved company design data in a personal GitHub account?
2. Is social sign-in in scope? Is OTP/2FA needed?
3. Dark surface: pure black or gray-950?
4. Who publishes library updates, on which plan/seat?
5. App framework versions and ADR-0009 (devs).
6. Is "Primary_alt" still used?

## Decide before shipping (Mike asked to be reminded, 2026-11-09)

Raise these with Mike when the duplicate is ready to publish/ship. Do not act on them before then.

| # | Decision | Options | Context |
|---|---|---|---|
| S-1 | **Figma variable naming vs Tailwind names.** *Revision 2, 2026-11-09: convention CONDITIONALLY APPROVED; **11-variable pilot APPLIED on the duplicate 2026-11-09 20:21 UTC, validation PASS** (`reports/token-naming-pilot-execution.md`); no further renames approved; follow-up validation PASS (`reports/token-naming-validation-followup.md`, Dark visuals value-level only); 106 remaining candidates in 5 proposed batches (`reports/token-naming-migration-plan.md`), awaiting approval; Decisions 1–3 (2026-11-09): group audit of 18 partial groups / 175 Figma-only variables (`reports/token-naming-group-audit.md`), stale-name diffs prepared not applied (`reports/token-naming-stale-names.md`), Dark-mode frame test PASS with pre-existing Featured-icon (S-2) discrepancy (`reports/token-naming-dark-mode-validation.md`); radius DEFERRED (R1 by-value proposal); Tailwind default overrides BLOCKED pending ADR-0009 (option A build overrides nothing); typography → `type-*`. Node.js 26.13.0 LTS installed; compile check 48/48. Nothing renamed.* Figma names are still Untitled UI-style (`Colors/Text/text-brand-primary`, `bg-brand-primary_hover`, `radius-sm` = Tailwind `radius.md`); Tailwind names live only in the token repo and `sync/figma-variable-map.*.json` | (1) **Code syntax** (D-10, recommended first): attach the Tailwind name to each variable, leaving the names as they are; (2) **Rename** the variables to the token paths (visible to everyone; needs a migration note) | Sync spec: "no renames in the sync". D-10 deferred |
| S-2 | **Re-link the MAKER Icon library to the new DS.** **Known issue (confirmed 2026-11-09, `reports/token-naming-dark-mode-validation.md`): in Dark mode the 4 Alert Featured-icon circles stay Light (5 remote bindings); nonblocking for Light, deferred.** Featured icon colours use the *original* MAKER DS v2 variables (remote, via the Icon library), so duplicate token changes don't reach them | Update the Icon library's DS subscription when the new DS is published; also fix the Gray Featured icon glyph token (`fg-brand-secondary_alt` → gray) there | `reports/P2-06a-alert-icons/` finding 3 |

## Excluded

**Jev is excluded from this workflow.**
