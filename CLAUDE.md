# CLAUDE.md — MAKE DS2 refactoring workspace

> **Approved scope: PHASE 1 ONLY** (D-12, Mike, 2026-11-09). Safe foundations: inspection, validation, documentation and explicitly approved preparation.
> **Not allowed:** component refactoring, token or variable writes, bulk migration, publishing, Phases 2–4.
> Work one backlog task at a time (`docs/implementation-plan.md`), in order. **Stop and report after each task.**

## Objective

Modernise the MAKE DS2 Figma library (MAKER-DS-v2) into an AI-friendly design system: two-tier DTCG tokens, light/dark, mobile-first, Figma-native components with properties and selective Slots, for React + Tailwind (web) and React Native + NativeWind (mobile). Preserve MAKE's visual identity; don't redesign to match Tailwind defaults.

## Source-of-truth hierarchy (APPROVED)

1. **Tokens:** private GitHub `reddddd1/design-tokens` (local: `~/Documents/Codex/design-tokens`, confirm in P1-01) is canonical for approved DTCG tokens (ADR-0001, ADR-0010). **Read-only in Phase 1**, except the doc-only ADR-0011 entry (P1-02).
2. **Shipped UI:** the production app repo (GitLab, no access yet).
3. **Figma:** approved design reference. Refactoring only ever in Mike's designated duplicate (D-01/ADR-0011), and not in Phase 1.
4. **Paper / Penpot:** exploration only.

## Figma protection rules

- Original library **MAKER-DS-v2 `xJoAz66aekAToyhBmfGNt0` — never write to it.** Phase 1 is read-only for **every** Figma file.
- Before each `use_figma` call, check the script has no mutating calls (list in `implementation-plan.md` → Global rules).
- Duplicate: not yet created. When Mike gives the URL, record it in `docs/project-handoff.md` and verify it read-only (P1-03). No library is modified until it's verified, and even then only in an approved later phase.
- Never publish. Never accept library updates in consumer files.
- Scope design-system searches to MAKER DS v2 + MAKER Icon library (community kits are also enabled on the file).

## Tokens

Tailwind/NativeWind-shaped names (ADR-0004); preserve Figma colour values (ADR-0005); Tailwind radius names and values (ADR-0006); dark mode flat in pilot (ADR-0007); WCAG 2.2 AA minimum, ratios never rounded up (ADR-0008); no global Tailwind/NativeWind default overrides (ADR-0009 pending). 171 component colours: preserve and document only (D-05). Details: `docs/token-conventions.md`, `docs/token-migration-map.md`.

## Components, Slots, icons

- Pilot set: **Button, Input field, Modal, Alert** (Alert replaces Card, D-07). Phase 1 = plans only.
- Variants for state/size · instance swap for controlled replacement · component properties for common edits · variables for style · Slots only for flexible composition.
- Icons only from the published **MAKER Icon library**; swap procedure in `docs/icon-library-strategy.md` §6.3. Never detach.

## Regression requirements

Every structural change (from Phase 2 on) needs: expected vs actual counts, structural read-back, visual diff, linkage, bindings, icons, Light **and** Dark, persistence. Permanent scenarios **R-PAPER-01** (variant-scope miss) and **R-PENPOT-01** (propagation lost after theme refresh), plus R-FIGMA-01 and R-SLOT-01. Visual similarity alone is never proof. In Phase 1 you build these as read-only checkers (P1-08). See `docs/regression-checks.md`.

## Tokens Studio

Stay on **Free**. Never buy, trial or change plans. If a task needs a verified paid feature with no acceptable free workaround, stop **only that task** and raise the SUBSCRIPTION BLOCKER alert (`docs/subscription-policy.md`). Report subscription status at the end of every task.

## Git

- Commit locally only after Mike confirms. Push only with Mike's go-ahead, after checking remote, branch and the commit list.
- This repo: `github.com/reddddd1/make-ds2-workspace` (private). Token repo push rules: ADR-0010.

## Approval gates

Mike approves: design changes, token/variable changes, subscription changes, publishing, anything production-impacting, and each new phase. Deferred items D-08 to D-11 and backlog B-01…B-10 are **not** approved.

## Out of scope

**Jev is excluded from this workflow.**

## Docs

| Doc | Use |
|---|---|
| `docs/decisions.md` | **Approved decisions and limits (read first)** |
| `docs/implementation-plan.md` | Phase 1 backlog with acceptance criteria |
| `docs/project-handoff.md` | Status, identifiers, access, pilot findings |
| `docs/regression-checks.md` | Acceptance criteria + regression scenarios |
| `docs/subscription-policy.md` | Tokens Studio policy and blocker format |
| `docs/architecture.md`, `docs/token-conventions.md`, `docs/token-migration-map.md` | Architecture and tokens |
| `docs/component-guidelines.md`, `docs/slots-strategy.md`, `docs/icon-library-strategy.md` | Components |
| `docs/audit.md` | Full audit (2026-11-09 snapshot; statuses superseded by `decisions.md`) |
