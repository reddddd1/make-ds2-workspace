# Decisions

Labels: **APPROVED** · **APPROVED (conditional)** · **APPROVED FOR PLANNING** (plan only, no implementation) · **DEFERRED** · **PENDING** · **REJECTED**.

Source of approvals: Mike Salcedo, Cowork chat, **2026-11-09**. Agents may not change any status in this file.

---

## 1. Refactor decisions (audit §15), reconciled

| ID | §15 recommendation | Mike's decision (2026-11-09) | Status | What it allows in Phase 1 | What it does NOT allow |
|---|---|---|---|---|---|
| **D-01** | Amend ADR-0005 to allow refactoring in a duplicate | Approved. Original published library stays untouched | **APPROVED** | Record the amendment as ADR-0011 in `design-tokens/DECISIONS.md` (doc-only, task P1-02) | Any change to the original library `xJoAz66aekAToyhBmfGNt0`, ever |
| **D-02** | Create the duplicate; name "MAKER DS v3 – WIP" | Approved. **Mike creates it.** Record its URL/ID once provided. No library is modified until the duplicate is verified | **APPROVED** (name not approved: Mike chooses) | Read-only verification of the duplicate once Mike supplies the URL (P1-03) | Creating, renaming or editing the duplicate; publishing |
| **D-03** | Scripted free `use_figma` sync instead of Tokens Studio Team | Conditionally approved. Prefer free script. **Before implementing**, validate it preserves values, aliases, modes, naming and existing bindings. No overwrite of tokens or variables without approval | **APPROVED (conditional)** | Write a validation spec and a **read-only dry-run** diff (registry vs Figma variables) (P1-09) | Any write mode; any variable/token create, update or delete |
| **D-04** | Button + Input API changes: TEXT props, parent icon swaps, Pressed | Approved for **pilot planning**. Inspect existing architecture first. No implementation in Phase 1 | **APPROVED FOR PLANNING** | Read-only inspection + written pilot plan (P1-10) | Editing components, adding properties or variants |
| **D-05** | Don't migrate the 171 component colours | Approved as **defer**. Preserve current appearance and document them for future evaluation | **APPROVED** (defer + document) | Read-only inventory of the 171 colours (P1-07) | Mapping, renaming, deleting or remapping them |
| **D-06** | Native Slot for Modal body first | Approved for **pilot planning**. Verify API/MCP support; preserve linkage | **APPROVED FOR PLANNING** | Docs check + read-only capability probe (no slot creation) + written plan (P1-11) | Creating slots or running Figma's migrate-to-slots flow |
| **D-07** | New slot-native Card (or Alert as substitute) | **Pilot the existing Alert component.** No new Card now | **APPROVED** (Alert replaces Card) | Read-only inspection + Alert pilot plan (P1-12) | Creating a Card component |
| **D-08** | Remove 15 single-option variant axes | Deferred | **DEFERRED** (backlog) | Nothing | Any axis removal |
| **D-09** | Secondary button border | Deferred | **DEFERRED** (backlog) | Nothing | Changing the Secondary spec or component |
| **D-10** | Variable scopes + `codeSyntax.WEB` | Deferred | **DEFERRED** (backlog) | Nothing | Setting scopes or code syntax |
| **D-11** | Stay on Tokens Studio Free | Deferred as a formal item; **operating rule confirmed: remain on Free; notify Mike if a verified paid feature becomes necessary** | **DEFERRED** (operating rule in force) | Follow `subscription-policy.md` | Any purchase, trial or plan change |
| **D-12** | Approve Phase 1 for Claude Code | Approved: handoff for **Phase 1 only** | **APPROVED** | Phase 1 backlog in `implementation-plan.md` | Phases 2–4 |

### Reconciliation notes (gaps closed)

1. **D-02 naming:** the "MAKER DS v3 – WIP" name was a recommendation only. Mike names the duplicate.
2. **D-03:** "validate before implementing" is satisfied in Phase 1 by a spec and a dry-run that **reads** both sides and reports differences. Writing to Figma variables is a later, separate approval.
3. **D-06:** "verify API/MCP support" is done without creating slots: official docs plus a read-only check that the API surface exists (e.g. `typeof component.createSlot`). A real slot test needs the verified duplicate and a separate approval.
4. **D-07:** Alert takes the Card's place as the 4th pilot. The audit's Card rows are superseded. Pilot set = **Button, Input field, Modal, Alert**.
5. **D-08–D-11:** none of their details were reviewed. Nothing in Phase 1 depends on them. The Free-plan operating rule comes from the brief's policy, not from an approved D-11.
6. **Proposal 0006** (login component tokens) is still Mike's decision in the token repo. Phase 1 does not apply it.
7. **Token repo writes:** the only approved write to `design-tokens` in Phase 1 is the doc-only ADR-0011 entry (D-01), shown as a diff and committed after Mike confirms. Reports from Phase 1 go into **this** workspace, not into `design-tokens`.

---

## 2. Proposed ADR-0011 text (for P1-02)

> # ADR-0011: Refactoring in a designated duplicate of MAKER-DS-v2
>
> - **Status:** Accepted. Source: Mike in chat, 2026-11-09 (D-01, D-02). Agents may not edit this status.
> - **Amends:** ADR-0005 ("Figma stays read-only").
>
> ## Decision
> - Refactoring is permitted **only** in a designated duplicate of the MAKE DS2 library, created by Mike. Its file URL/ID is recorded in `make-ds2-workspace/docs/project-handoff.md` once provided.
> - The original published library MAKER-DS-v2 (`xJoAz66aekAToyhBmfGNt0`) remains **untouched**.
> - No library is modified until the duplicate has been verified (read-only).
> - Each refactoring phase needs its own approval. Publishing stays a manual step by Mike.
> - Every other part of ADR-0005 stays in force (registry independent of Figma; mapping maintained; visible differences flagged).

---

## 3. Inherited decisions (token repo `DECISIONS.md`)

| ADR | Decision | Status |
|---|---|---|
| 0001 | Token repo is the only authority for approved tokens; app repo for shipped UI; Figma reference; Paper never a token authority | APPROVED (amended by 0010) |
| 0002 | Temporary hosting | Superseded by 0010 |
| 0003 | DTCG 2025.10, sRGB + hex, px | PENDING (devs); provisional |
| 0004 | Tailwind/NativeWind naming | APPROVED (detailed mapping to confirm) |
| 0005 | Figma read-only; preserve Figma colour values; flag visible differences | APPROVED; **amended by D-01 (ADR-0011)** |
| 0006 | Tailwind radius names and values; map by value; flag 10/20px | APPROVED |
| 0007 | Dark mode flat during pilot; shadow colour as theme token | APPROVED |
| 0008 | WCAG 2.2 AA minimum; fixes via semantic remaps | APPROVED |
| 0009 | Disable Tailwind default palette? | PENDING (devs) |
| 0010 | GitHub `reddddd1/design-tokens` canonical | APPROVED |

## 4. Workspace decisions (Mike, 2026-11-09)

- This workspace is a separate git repo at `~/Documents/Codex/MAKEDSv2-refactor-plan`, remote `github.com/reddddd1/make-ds2-workspace` (private). **APPROVED, VERIFIED pushed (025c85b)**
- `design-tokens` stays a separate repo, not a submodule. **APPROVED**

## 4b. Naming migration — simplified (Mike, 2026-11-09, "Simplify and Move Forward")

- **Priority:** a reliable, usable MAKE DS2 library over perfect naming or full token coverage. **APPROVED**
- **Done:** `dryrun.py` ID-first seeding; 11 map display names; 17 registry metadata-only updates (`figma`, `figmaLegacy`, `figmaVariableId`) applied to the token repo working tree after preflight (keys/values/aliases unchanged, `dist/` identical except `builtAt`, 29/29 tests, dry-run 0 operations with and without map). Token repo change **not committed**. **APPLIED**
- **18 partially renamed groups are accepted as a temporary state.** Documented in `reports/token-naming-group-audit.md`; the migration is not expanded. **APPROVED**
- **Missing canonical tokens are added incrementally**, only when an approved component task needs them, and only with approval before any token change. **APPROVED**
- **Unchanged:** legacy (Figma-only) variables, radius naming (R1 deferred), Tailwind global defaults (ADR-0009), batches 1–5 of the naming plan (paused, not scheduled). **APPROVED**
- **Alert Dark-mode Featured-icon circle = known issue S-2** (remote MAKER Icon library variables ignore the DS Dark mode). Broader icon-library migration deferred. **RECORDED**
- **Next priority:** component readiness — functional defects over cosmetic naming; targeted validation per change. Login screens (P2-08) stay on hold. **APPROVED**

## 5. Rejected alternatives (do not reintroduce)

- Figma radius names with Figma values (P5): superseded by ADR-0006.
- Replacing Figma brand colours with the Tailwind palette: rejected (ADR-0005 amendment).
- OKLCH as stored colour space: rejected for now (ADR-0003).
- Paper or Penpot as the authoritative component library: rejected; exploration only.
- Converting every nested component to a Slot: rejected (brief).
- **New Card component for the pilot: not now** (D-07; Alert instead).
- Paid Tokens Studio as the default sync path: not chosen (D-03).
- **Jev in the workflow: excluded.**
