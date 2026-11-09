# Tokens Studio subscription policy and status

> **Status: PROPOSED — not approved.** Generated from `docs/audit.md` (2026-11-09). Labels: VERIFIED · APPROVED (cites an ADR) · PROPOSED · UNVERIFIED · BLOCKED.
> Claude Code must not act on anything here until Mike approves the matching decision (see `docs/decisions.md`).

## Policy (from Mike's brief, 2026-11-09)

- Start with Tokens Studio **Free**. Never recommend paid only because a feature exists.
- Verify plan capabilities from official docs or actual plugin behaviour.
- Prefer free paths: Figma native variables, GitHub workflows, open-source token tools.
- Never trade away token integrity, light/dark support or the approved architecture to avoid cost.
- **Never purchase, start a paid trial or change a subscription without Mike's explicit approval.**
- Every major milestone reports: Current plan · Workflow status (Unblocked / Workaround / Blocked) · Paid features encountered · Upgrade required now · Next anticipated dependency.

### Mandatory blocker alert (stop only the blocked task)

```
SUBSCRIPTION BLOCKER — TOKENS STUDIO
- Blocked task
- Required feature
- Verified evidence
- Lowest confirmed eligible plan
- Verified price and billing period, if available
- Free alternative and trade-offs
- Impact of not upgrading
- Recommendation
```

## Status at audit time

### 9. Subscription status

**Current plan:** Unverified (assumed Free; no Tokens Studio usage recorded in the project)
**Workflow status:** Unblocked
**Paid features encountered:** None used. One **anticipated**: direct Git sync.
**Upgrade required now:** **No**
**Next anticipated subscription dependency:** Tokens Studio *direct Git sync* (Team plan), only if D-03 chooses Tokens Studio as the registry → Figma sync mechanism.

#### Verified evidence (tokens.studio/pricing, read 2026-11-09)

- **Free, €0/month:** 1 editor seat, unlimited viewers, "1 project with 1 active branch", "1 theme group with 2 theme options", "1 export configuration". Also states: "Does not include Pro in Tokens Studio for Figma."
- **Team, €39/month billed annually** (extra editors €39/mo each): includes "all paid Figma plugin features", naming **"direct Git-sync"** and **"multi-dimensional theming"**. The old Pro plan has been folded into Team.
- Organization: €499/month billed annually.
- Monthly-billing price: **UNVERIFIED** (only annual figures extracted).
- Plugin-level free features (token editing, sets, variable export, DTCG import): **UNVERIFIED**. The docs plans page failed to load and the plugin wasn't tested.

#### Free alternative (PROPOSED)

The registry (GitHub, DTCG) stays canonical. A Claude Code script reads `tokens/` and writes Figma **variables** in the duplicate through `use_figma` (Plugin API: create/update variables, modes, aliases, scopes, code syntax). The Figma pilot proved atomic writes and mode handling.

- **Trade-offs:** no designer-facing token UI inside Figma; designers propose changes via the repo's `proposals/` flow, not in a plugin. The sync script must be maintained.
- **Impact of not upgrading:** none on Phases 1–2. Possibly slower designer edits later.
- **Recommendation:** stay on Free. Re-evaluate after Phase 2 if designers need in-Figma token editing.

No **SUBSCRIPTION BLOCKER** is raised: no approved task currently requires a paid feature, and a free workaround exists.
