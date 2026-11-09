# Architecture

> **Status:** APPROVED where an ADR is cited; otherwise PROPOSED.

## Systems

```
reddddd1/design-tokens (DTCG, canonical)  ──release──▶  App repo (GitLab): Tailwind web / NativeWind RN
        │                                                     ▲
        │ one-way sync (D-03, PROPOSED: scripted use_figma)   │ Storybook verification
        ▼                                                     │
MAKER DS duplicate (Figma, refactor target) ── screens ──▶ Approved flows ──▶ code
        ▲
        │ read-only reference
MAKER-DS-v2 original (xJoAz66aekAToyhBmfGNt0)  +  MAKER Icon library (published)

Paper / Penpot: exploration only (alternatives, states, reviews) → approved-flow spec → rebuilt natively in Figma
```

## Token tiers (APPROVED structure, ADR-0003/0004)

1. **Primitives** — raw values (`color.brand.600`, `spacing.4`, `radius.xl`, `font.size.base`).
2. **Semantic** — purpose aliases, with Light/Dark values in `themes/{light,dark}` (`color.bg.brand-primary`, `color.text.primary`, `color.border.error`).

No component tier (D-05, PROPOSED).

## AI production workflow (brief §9)

A. Figma baseline from published components → B. Paper/Penpot exploration → C. Approved-flow spec → D. Native Figma reconstruction with linked instances → E. Validation (linkage, variants, bindings, auto layout, icons, Slots, Light/Dark, responsive, fidelity).

## Responsibilities

- **Claude Cowork:** research, read-only audits, decisions, planning, handoff.
- **Claude Code Desktop:** approved repo changes, scripts, Figma automation on the duplicate, registry, regression tooling.
