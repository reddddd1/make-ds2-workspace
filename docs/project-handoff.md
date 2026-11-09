# Project handoff — Phase 1

> **Handoff issued 2026-11-09 for Phase 1 only (D-12).** This file lets Claude Code work without the Cowork conversation.
> **Status updated 2026-11-09 after P1-13** (Phase 1 milestone report: `reports/PHASE-1-REPORT.md`).

## Current status

| Item | State | Label |
|---|---|---|
| Refactoring audit | Complete (`docs/audit.md`) | VERIFIED evidence |
| Decisions D-01–D-12 | Reconciled (`docs/decisions.md`) | APPROVED / PLANNING / DEFERRED as listed |
| Phase 1 | **Complete** (P1-01…P1-13 done; see `reports/PHASE-1-REPORT.md`, `reports/P1-03-duplicate-verification.md`) | APPROVED · VERIFIED |
| Phase 2 | **P2-00 done; P2-01 done** (token sync applied to the duplicate: 1 create + 11 alias updates, `reports/P2-01-sync/README.md`); Input field border → `border-primary` on 24 variants and Focused ring → brand on 8 (`reports/P2-01b-input-border/`). P2-02…P2-08 **not approved**: each needs Mike's approval | P2-00/P2-01 APPROVED · VERIFIED; rest PROPOSED |
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
| MAKER Icon library enabled in the duplicate | P2-04 icon swaps | Waiting on Mike (Figma UI) |
| GitLab app repo | Phase 2+ (ADR-0009, Code Connect) | BLOCKED |
| Legacy login screenshots | Fidelity measurement | Waiting on Mike |

## Unresolved questions

1. Has MAKE approved company design data in a personal GitHub account?
2. Is social sign-in in scope? Is OTP/2FA needed?
3. Dark surface: pure black or gray-950?
4. Who publishes library updates, on which plan/seat?
5. App framework versions and ADR-0009 (devs).
6. Is "Primary_alt" still used?

## Excluded

**Jev is excluded from this workflow.**
