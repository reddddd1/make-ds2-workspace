# Implementation plan

> **Status: PROPOSED — not approved.** Generated from `docs/audit.md` (2026-11-09). Labels: VERIFIED · APPROVED (cites an ADR) · PROPOSED · UNVERIFIED · BLOCKED.
> Claude Code must not act on anything here until Mike approves the matching decision (see `docs/decisions.md`).

### 11. Prioritized implementation phases (PROPOSED)

Each phase needs its own approval. Approving one does **not** approve the next.

#### Phase 1 — Foundations (read-only + repo work Claude Code may do with approval)

| ID | Task | Priority |
|---|---|---|
| P1-01 | Inspect `reddddd1/design-tokens` locally: branch, remote, `tokens/` vs `proposals/`, validator passes | P0 |
| P1-02 | Generate machine-readable component registry from MAKER-DS-v2 (read-only) into `registry/components.json` | P0 |
| P1-03 | Extend the read-only scan to spacing, radius, effect and text-style bindings per component | P1 |
| P1-04 | Regenerate Figma → registry token mapping against the live repo | P1 |
| P1-05 | Build regression scripts R-PAPER-01, R-PENPOT-01, R-FIGMA-01, R-SLOT-01 as read-only checkers | P0 |
| P1-06 | Decide Proposal 0006 (login component tokens) | P1 (Mike) |

#### Phase 2 — Component pilot (duplicate only)

| ID | Task |
|---|---|
| P2-01 | Create the duplicate (Mike), record its file key |
| P2-02 | Buttons/Button: TEXT label prop, parent icon swaps with library preferred values, Pressed state, spinner binding |
| P2-03 | Input field: TEXT props (label, placeholder, hint), icon swap, Hover/Pressed, decision on md size |
| P2-04 | Modal: legacy `Slot` → native slot for body |
| P2-05 | Card: build slot-native (if D-07 approves) |
| P2-06 | Run the full regression suite; publish nothing |

#### Phase 3 — Controlled migration (duplicate)

Remaining OPTIMIZE/REPAIR items in §4.2, single-option axis clean-up, variable scopes and code syntax, registry → Figma sync, then a decision on publishing.

#### Phase 4 — Screen automation

Approved-flow spec format → native Figma assembly pipeline → regression + visual diff → cost reporting.

### 12. Pilot component recommendations

| Pilot | Figma source | What it proves | Key checks |
|---|---|---|---|
| **Button** | Buttons/Button (118 variants) | TEXT props, parent icon swap, new state across 4 hierarchies × 4 sizes × 6 states | R-PAPER-01 (all states get the change), icon procedure §6.3, contrast |
| **Text Field** | Input field (53 variants) | TEXT props on a complex set, new states, layer integrity on variant switch | R-FIGMA-01, error/destructive, Password type |
| **Modal** | Modal + _Modal header/actions | Native slot replacing legacy slot | R-SLOT-01, instance content survives |
| **Card** | **None exists** | Slot-native new component | Needs D-07; if rejected, substitute **Alert** (actions region) |

Login screens from the Figma pilot (10 screens, scratch file) become the consumer test bed: after each pilot change, the same screens are re-pointed to the duplicate and re-validated.

### 8. Automation feasibility

| Opportunity | Classification | Tool | Notes |
|---|---|---|---|
| Token inventory (Figma → JSON) | **Fully automatable** | `use_figma` read script (exists: `scripts/figma-audit.js`) | Checksum-verified in M01 |
| Token migration map | **Automatable with verification** | `build-figma-mapping.mjs` | Visual changes flagged for Mike |
| Token validation / contrast | **Fully automatable** | repo validator (29/29 tests), `contrast-report.mjs` | Deterministic |
| Registry → Figma variables sync (duplicate) | **Automatable with verification** | `use_figma` script (free) or Tokens Studio Team (paid) | §9 |
| Component inventory / registry JSON | **Fully automatable** | `use_figma` read script (this audit's script) | Output to `registry/` |
| Component property optimisation (TEXT props, swaps, remove dead axes) | **Automatable with verification** | `use_figma` writes on the duplicate | Atomic writes; read-back per variant |
| Native Slot migration | **Requires manual intervention** (initially) | Figma UI migration flow + `use_figma` checks | MCP support "coming soon"; API exists but untested |
| Icon swaps on instances | **Automatable with verification** | `use_figma` `setProperties` | Procedure §6.3 |
| Figma screen extraction (for Paper/Penpot) | **Automatable with verification** | `get_design_context`, `get_metadata` | |
| Paper/Penpot handoff | **Automatable with verification** | Paper/Penpot MCP | Synthetic tokens only in Penpot so far |
| Approved-flow specification | **Automatable with verification** | Claude writes spec from approved exploration | Human approves |
| Native Figma screen assembly | **Automatable with verification** | `use_figma` + `figma-generate-design` | Proven in Figma pilot (72/72) |
| Component + token regression checks | **Fully automatable** | `use_figma` structural read-back scripts | §13 acceptance criteria |
| Visual comparison | **Automatable with verification** | `get_screenshot` + pixel diff (pngdiff / pixelmatch) | Needs approved reference images |
| Publish library update / accept in consumer | **Requires manual intervention** | Figma UI | Production-impacting; Mike only |
| Code Connect mapping | **Unsupported / untested** | Figma Code Connect | Needs app repo access (BLOCKED) |
| Documentation | **Fully automatable** | Claude | |
| AI usage & cost reporting | **Automatable with verification** | Session logs | Method used in pilots |

Deterministic scripts handle validation. AI handles architecture, visual judgement and ambiguous design calls.

### 10. Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| RK-01 | Accidental write to the original MAKER-DS-v2 library | Low | **Critical** | Duplicate-only rule; scripts assert file key ≠ `xJoAz66aekAToyhBmfGNt0` before any write; `updatedAt` check before/after (Figma pilot V8 method) |
| RK-02 | Variant-scope gaps (change applied to Default only) | **High** (seen in Paper, Penpot) | High | R-PAPER-01: expected vs actual counts across all states/sizes/themes |
| RK-03 | Binding changes not persisting to instances | Medium (seen in Penpot) | High | R-PENPOT-01: re-read in a fresh call after mode switch and reload |
| RK-04 | Variant switch drops layers (F2) | Medium | High | R-FIGMA-01: compare instance layer tree with its main after every `setProperties` |
| RK-05 | Slot migration resets instance content | Medium | High | Pilot on duplicate; snapshot instances; R-SLOT-01 |
| RK-06 | Registry ↔ Figma drift (two token sources) | **High** | High | D-03: one-way sync, generated mapping, CI check |
| RK-07 | Live repo state unknown from Cowork | Medium | Medium | Phase 1 P1-01 runs in Claude Code on Mike's Mac |
| RK-08 | Company design data in a personal GitHub account | Medium | Medium | Mike to confirm with MAKE (ADR-0010, open) |
| RK-09 | Tailwind default overrides break legacy screens | Medium | High | ADR-0006/0009 interim rule: no global override |
| RK-10 | Publishing the duplicate confuses consumers (two "MAKER DS" libraries) | Medium | Medium | Name it clearly (e.g. "MAKER DS v3 – WIP – do not use"); don't publish until Phase 3 approval |
| RK-11 | Slots MCP support incomplete | Medium | Medium | Manual-assisted migration for pilot; re-check docs before Phase 3 |
| RK-12 | No legacy login screenshots → fidelity can't be measured | **High** | Medium | Mike to supply references; fidelity % not claimed until then |
| RK-13 | Community kits enabled on the DS file pollute agent search | Medium | Low | Scope searches to MAKER library keys |
| RK-14 | Tokens Studio paid dependency creeps in | Low | Low | Free-first policy, blocker alert format |
