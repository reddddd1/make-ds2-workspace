# make-ds2-workspace

Planning and implementation workspace for the **MAKE DS2 design-system refactor** (Figma library MAKER-DS-v2 → AI-friendly, token-driven system).

> **Status (2026-11-09): Phase 1 approved** (inspection, validation, documentation, approved preparation). Phases 2–4 not approved. See `docs/decisions.md`.

## Start here

1. Open this folder in Claude Code Desktop.
2. Claude reads `CLAUDE.md`, then `docs/decisions.md` and `docs/implementation-plan.md`.
3. Use the startup prompt in `docs/claude-code-startup-prompt.md`. It runs only task **P1-01**.

## Layout

| Path | Contents |
|---|---|
| `CLAUDE.md` | Rules for Claude Code (scope, protection, gates) |
| `docs/` | Decisions, Phase 1 backlog, regression requirements, subscription policy, strategies, full audit |
| `reports/` | Task reports produced during Phase 1 |
| `registry/` | Machine-readable component registry (P1-04) |
| `scripts/` | Read-only audit and regression scripts |

## Related repos

- **Tokens:** `reddddd1/design-tokens` (private, canonical DTCG registry; kept separate).
- **App:** company GitLab (no access yet).

## Owner

Mike Salcedo (design orchestrator, final design approver). Jev is excluded from this workflow.
