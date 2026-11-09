# Decisions

Labels: **APPROVED** (Mike decided; recorded in `reddddd1/design-tokens/DECISIONS.md`) · **PENDING** · **PROPOSED** (this refactor, not approved).

## Inherited decisions (APPROVED unless stated)

| ADR | Decision | Status |
|---|---|---|
| 0001 | Token repo is the only authority for approved tokens; app repo for shipped UI; Figma read-only reference; Paper never a token authority | APPROVED (amended by 0010) |
| 0002 | Temporary hosting | Superseded by 0010 |
| 0003 | DTCG 2025.10, sRGB + hex, px dimensions | PENDING (devs); applied provisionally |
| 0004 | Tailwind/NativeWind naming | APPROVED (detailed mapping to confirm) |
| 0005 | Figma stays read-only; preserve Figma colour values as custom primitives; flag visible differences | APPROVED |
| 0006 | Tailwind radius names and values; map Figma by value; flag 10/20px | APPROVED |
| 0007 | Dark mode stays flat during pilot; shadow colour as theme token | APPROVED |
| 0008 | WCAG 2.2 AA minimum; fixes via semantic remaps | APPROVED |
| 0009 | Disable Tailwind default palette? | PENDING (devs) |
| 0010 | GitHub `reddddd1/design-tokens` is canonical; devs pull releases into GitLab | APPROVED |

## Refactor decisions awaiting Mike (from `audit.md` §15)

| ID | Decision | Recommendation | Status |
|---|---|---|---|
| D-01 | Amend ADR-0005 to allow refactoring in a duplicate | Approve | PROPOSED |
| D-02 | Create the duplicate ("MAKER DS v3 – WIP") | Approve | PROPOSED |
| D-03 | Registry → Figma sync via free scripted `use_figma` | Approve | PROPOSED |
| D-04 | Button + Input field API changes (TEXT props, parent icon swaps, Pressed) | Approve for Phase 2 | PROPOSED |
| D-05 | Don't migrate the 171 component colours | Approve | PROPOSED |
| D-06 | Native Slot for Modal body first | Approve | PROPOSED |
| D-07 | New slot-native Card (or Alert as substitute) | New Card | PROPOSED |
| D-08 | Remove 15 single-option variant axes | Phase 3 | PROPOSED |
| D-09 | Secondary button border | Design call | PROPOSED |
| D-10 | Variable scopes + `codeSyntax.WEB` | Phase 3 | PROPOSED |
| D-11 | Stay on Tokens Studio Free | Approve | PROPOSED |
| D-12 | Approve Phase 1 for Claude Code | Phase 1 only | PROPOSED |

## Repo decisions (Mike, 2026-11-09)

- This workspace is a **separate git repo**, stored at `Documents/Codex/MAKEDSv2-refactor-plan` on Mike's Mac. **APPROVED**
- `design-tokens` stays separate (not a submodule). **APPROVED**
- Contents for now: audit + skeleton, marked PROPOSED/UNVERIFIED. **APPROVED**

## Rejected alternatives (do not reintroduce)

- Keep Figma radius names with Figma values (P5) — superseded by ADR-0006.
- Replace Figma brand colours with Tailwind palette — rejected (ADR-0005 amendment).
- OKLCH as stored colour space — rejected for now (ADR-0003).
- Paper or Penpot as the authoritative component library — rejected; exploration only.
- Converting every nested component to a Slot — rejected by brief.
- Jev in the workflow — excluded.
