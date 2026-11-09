# Claude Code startup prompt — P1-01 only

Open `~/Documents/Codex/MAKEDSv2-refactor-plan` in Claude Code Desktop and paste:

```text
You are working in the MAKE DS2 refactoring workspace. Phase 1 is approved; nothing beyond it is.

1. Read CLAUDE.md, then docs/decisions.md, docs/implementation-plan.md and docs/project-handoff.md in full before doing anything.
2. Execute ONLY task P1-01 "Workspace & environment inspection (read-only)" exactly as specified in docs/implementation-plan.md.
3. Rules for this run:
   - Read-only everywhere except creating reports/P1-01-environment.md in this workspace.
   - Do not modify ~/Documents/Codex/design-tokens (git fetch is allowed; no checkout, pull, install, commit or push there). Run its validator only if node_modules already exists.
   - Figma: only check that the Figma MCP is available (whoami). Do not open, read or write any Figma file in this task.
   - Do not commit or push anything. When the report is written, show me `git status` for both repos and propose a commit for this workspace; wait for my answer.
4. End with: findings (labelled VERIFIED / UNVERIFIED / BLOCKED), missing access, and the subscription status block from docs/subscription-policy.md.
5. Then stop. Do not start P1-02 or any other task until I say so.
```
