# CLAUDE.md — MAKE DS2 refactoring workspace

> **STATUS: DRAFT SKELETON. No implementation is authorised.**
> The audit (`docs/audit.md`) is PROPOSED and awaiting Mike's approval. Until `docs/decisions.md` records an approval for a phase, Claude Code may only read, inspect and report. **Do not** edit Figma, push tokens, or run write scripts.

## Objective

Modernise the MAKE DS2 Figma library (MAKER-DS-v2) into an AI-friendly design system: two-tier DTCG tokens, light/dark, mobile-first, Figma-native components with properties and selective Slots. Targets: React + Tailwind (web), React Native + NativeWind (mobile). Preserve MAKE's visual identity; don't redesign to match Tailwind defaults.

## Source-of-truth hierarchy (APPROVED: ADR-0001, ADR-0005, ADR-0010)

1. **Tokens:** private GitHub repo `reddddd1/design-tokens` (separate repo; not this one) is canonical for approved DTCG tokens.
2. **Shipped UI:** the production app repo (GitLab), eventually the implementation source of truth.
3. **Figma:** approved design reference. Original library is **read-only**.
4. **Paper / Penpot:** exploration only. Never a token or component authority.

## Figma protection rules

- Original library: **MAKER-DS-v2, file `xJoAz66aekAToyhBmfGNt0`. Never write to it.** Every write script must assert its target file key is not this one.
- Refactoring happens only in an approved duplicate (not yet created; decision D-01/D-02).
- Check the original's component `updatedAt` before and after any session that touches the duplicate.
- Never publish a library update. Publishing is Mike's manual step.

## Token conventions (see `docs/token-conventions.md`)

Tailwind/NativeWind-shaped names (ADR-0004); Figma colour values preserved (ADR-0005); Tailwind radius names and values (ADR-0006); WCAG 2.2 AA minimum (ADR-0008); no global override of Tailwind defaults (ADR-0009 pending).

## Components, Slots, icons

- Variants for state/size · instance swap for controlled replacement · component properties for common edits · variables for style · **Slots only for flexible composition**. Don't convert every nested component to a Slot.
- Icons come only from the published **MAKER Icon library**. Follow the swap procedure in `docs/icon-library-strategy.md` §6.3. Never detach.

## Regression requirements (see `docs/regression-checks.md`)

Every structural change records expected vs actual affected counts, structural read-back, visual diff, linkage, token bindings, icons, Light and Dark, and persistence. Permanent scenarios: **R-PAPER-01** (variant-scope miss), **R-PENPOT-01** (propagation lost after theme refresh), R-FIGMA-01 (layer dropped on variant switch), R-SLOT-01. Visual similarity alone is never proof.

## Tokens Studio

Free first. Never buy, trial or upgrade. Raise the SUBSCRIPTION BLOCKER alert (`docs/subscription-policy.md`) and stop only the blocked task.

## Approval gates

- Each phase (1 Foundations · 2 Component pilot · 3 Controlled migration · 4 Screen automation) needs Mike's explicit approval. Approving one doesn't approve the next.
- Mike approves design changes, token changes, subscription changes and anything production-impacting.
- Before any push: check remote URL, branch and the commits list; report first.

## Out of scope

- **Jev is excluded from this workflow.**

## Docs

`docs/audit.md` (full audit) · `implementation-plan.md` · `decisions.md` · `architecture.md` · `token-conventions.md` · `token-migration-map.md` · `component-guidelines.md` · `slots-strategy.md` · `icon-library-strategy.md` · `regression-checks.md` · `subscription-policy.md` · `project-handoff.md`
