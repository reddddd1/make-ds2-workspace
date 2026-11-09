# Pilot plan — Modal body as a native Slot (P1-11, D-06)

> **Status: PLAN ONLY — APPROVED FOR PLANNING (D-06).** No slot was created and no slot API was called. All changes are for the **verified duplicate** in an approved Phase 2; the original `xJoAz66aekAToyhBmfGNt0` is never edited. Labels: **VERIFIED** (docs read or Figma read on 2026-11-09), **UNVERIFIED** (needs a test on the duplicate), **PROPOSED**, **DECISION** (Mike). Evidence: `reports/P1-11-modal-slot/probe.json`.

## 1. Verdict

| Question | Answer | Label |
|---|---|---|
| Are native Slots available? | **Yes — GA since 2026-06-10** ("Slots GA", Figma plugin update). All plans; publishable to libraries | VERIFIED (docs) |
| Can they be created/edited through `use_figma`? | **Supported via the Plugin API.** `ComponentNode.createSlot(): SlotNode`, property type `'SLOT'` via `addComponentProperty(name, 'SLOT', …, { slotSettings, preferredValues })`, `SlotNode.resetSlot()`, `SlotNode.limitViolations`. The probe found `createSlot` present (`typeof … === 'function'`) in this file's runtime (not called) | VERIFIED (docs + read-only probe); **behaviour UNTESTED** |
| Can slot content in instances be filled by script? | Docs: `setProperties` does **not** work for slot properties; edit slot content in instances with normal frame APIs (`appendChild`/`insertChild` on the instance's SlotNode); "some nodes are not allowed in slot nodes" (unspecified). Forum reports describe failures replacing slot contents via MCP | VERIFIED (docs); **UNVERIFIED in practice** |
| MCP read tools (design context, Code Connect) | Help article: "MCP support is coming soon". Code Connect docs say the remote MCP server can traverse slots; forum reports say reading nodes inside slots is still unreliable | **Partial / UNVERIFIED** |
| **Overall** | **Feasible via `use_figma` (Plugin API) for creating the slot on the main component. Migrating existing instances is manual-assisted** (see §3). Agents reading slot content through MCP read tools may be unreliable until Figma ships MCP support | — |

Sources (read 2026-11-09): [Plugin update 2026-06-10 "Slots GA"](https://developers.figma.com/docs/plugins/updates/2026/06/10/update/) · [SlotNode](https://developers.figma.com/docs/plugins/api/SlotNode/) · [SlotSettings](https://developers.figma.com/docs/plugins/api/SlotSettings/) · [ComponentNode](https://developers.figma.com/docs/plugins/api/ComponentNode/) · [Working with component properties](https://developers.figma.com/docs/plugins/working-with-component-properties/) · [Help: Use slots](https://help.figma.com/hc/en-us/articles/38231200344599-Use-slots-to-build-flexible-components-in-Figma) · [Help: Migrate a library to using slots](https://help.figma.com/hc/en-us/articles/38607529833751/) · forum threads on MCP + slots ([1](https://forum.figma.com/report-a-problem-6/figma-mcp-cannot-read-nodes-inside-slot-components-54329), [2](https://forum.figma.com/report-a-problem-6/figma-mcp-claude-unable-to-replace-slot-contents-54011)).

## 2. Current Modal (VERIFIED, read-only)

```
Modal (set 4057:415205, 1 variant "Type=Default slotted", 390×844, vertical auto layout)
├── Background overlay (instance)
├── Modal (frame, vertical)
│   ├── _Modal header (instance)
│   ├── [Slot] (frame, vertical auto layout, no layout grid, 390×40)
│   │   ├── Slot (instance of local component 17540:4885, 36×36 ❖ placeholder)  mainComponent ← "Drawer content"
│   │   └── _Scroll bar (control fill with bottom padding) (instance, hidden)
│   └── _Modal actions (instance)
└── Spacer for max-height (frame)
```

- Properties: `Drawer content` INSTANCE_SWAP (default: local `Slot`; **1 preferred value, key `28e7187…`, which resolves to no component in this file** — orphaned or from another file) + `Type` (single option).
- Legacy `Slot` component: **2 instances in the whole file** — the one inside Modal's main, and the sub-layer of the only Modal instance. No other component uses it.
- **Modal instances: 1 in the library** (`17546:4435`, page Modals, frame "Modals"), content = default `Slot`; **0 in the pilot scratch file** (P1-08 `collect-slots`). **Usage in other team files: UNVERIFIED** — Mike can check Library analytics for "Modal".
- File has **0** SLOT nodes today.

## 3. What Figma says about this exact pattern (VERIFIED, migration article)

- Shared placeholder component nested in parents → **detach the placeholder** (or delete it) → **Convert to slot**. "If designers have customized instances of the 'slot placeholder', the overrides … won't carry over."
- Variant/instance-swap "Slot swap" property (Modal's `Drawer content`) → "**cannot be converted directly**"; "**existing Slot swap bindings will break**, so instances won't auto update".
- Constraints: no slot on a component's **top-level** layer (Modal's `[Slot]` is nested — OK); a slot can only be applied to a **frame** without a layout grid (`[Slot]` qualifies); component properties can't be applied to layers **inside** a slot; removing a slot property **resets** instance slot content.

Consequence: any Modal instance whose `Drawer content` was swapped to real content will **lose** that content when the swap property is replaced. In the files we can see, the only instance uses the default placeholder, so there is nothing to lose there.

## 4. Migration plan (PROPOSED, Phase 2, duplicate only, manual-assisted)

| Step | Action | How | Check |
|---|---|---|---|
| 0 | Usage census | Mike: Library analytics for Modal across team files. Agent: `collect-slots.js` on the duplicate + every consumer file Mike names | Record per instance: `Drawer content` value, page, file |
| 1 | Baseline | `collect-variants` (Modal, _Modal header, _Modal actions), `collect-slots` (enhanced, see E3), `collect-instances` on the Modals page frames; Light + Dark screenshots of the playground Modal | Saved snapshots |
| 2 | Feasibility test on a **copy** | In the duplicate, on an unpublished copy of the Modal component: `createSlot()` inside `[Slot]`, set `slotSettings`, insert one instance, `resetSlot()`; read back `limitViolations`, structure, linkage | Behaviour matches docs; no exceptions; copy deleted afterwards only with approval |
| 3 | Convert the real Modal | On Modal main: create the slot where the `Slot` instance is (inside `[Slot]`); remove the `Slot` placeholder instance; delete the `Drawer content` property | One SLOT property, one SlotNode, 0 INSTANCE_SWAP |
| 4 | Restore instance content | For each instance whose `Drawer content` was not the default (step 0), insert an instance of that component into the instance's slot (`appendChild` on the instance SlotNode) | Content equals step-0 record |
| 5 | Verify | R-SLOT-01 + R-FIGMA-01 + linkage + Light/Dark | See §5 |
| 6 | Deprecate legacy `Slot` | Mark deprecated in its description; **do not delete** (deletion is a separate approval) | No instance uses it |

**Slot settings (PROPOSED):** `minChildren` 1 (a modal body is never empty), `maxChildren` none, `allowPreferredValuesOnly` false, `displayEmptyByDefault` false, `stretchChildOnInsert` true (body fills the 358 px column). Default content: a simple text/placeholder frame "Modal content" (DECISION — keeps the "never empty" rule visible in the library). Preferred values: none at first (the old preferred key is orphaned).

**`[Slot]` frame:** the hidden `_Scroll bar` stays a sibling of the slot inside `[Slot]` (not slot content), so its scroll behaviour is unchanged. Rename `[Slot]` → `Body` (DECISION; rename is cosmetic).

## 5. Regression checks (R-SLOT-01 and others)

| Check | Expected |
|---|---|
| Modal variant count | 1 → 1; `_Modal header` / `_Modal actions` hashes unchanged |
| Modal properties | `Drawer content` (INSTANCE_SWAP) removed; one `SLOT` property added (`allowPropDefsChange: ["Modal"]` in the spec) |
| Instance count | unchanged (1 in library + N from step 0) |
| Linkage | 100% linked |
| Slot content | per instance equals step-0 record (default content where it was the placeholder) |
| `limitViolations` | `[]` on every instance |
| R-FIGMA-01 | 0 new divergence (instance tree vs main) |
| R-PENPOT-01 | bindings + Light/Dark/effective values unchanged outside the slot |
| Visual | Light + Dark screenshot diff: only the placeholder area changes |
| Persistence | re-read in a separate call; after reload where practical |

**Checker enhancement E3 (prerequisite):** `collect-slots.js` finds the slot region by layer name (`Slot` / `Drawer content`). After migration it must also find nodes of type `SLOT` and record `limitViolations` from the SlotNode, the SLOT property value, and the slot's children signature. Small change; re-baseline afterwards.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Instances with swapped `Drawer content` lose content (documented) | Step 0 census + step 4 restore; Mike confirms the list before step 3 |
| Script can't fill instance slots reliably (forum reports) | Step 2 test on a copy; if it fails, step 4 is done manually in the UI and verified by script |
| MCP read tools can't see slot content | Agents use `use_figma` (Plugin API) reads, not design-context reads, for slot content until Figma ships MCP support |
| Unknown consumer files | Library analytics before publishing any change; publishing stays a manual step by Mike |
| Removing the slot property later resets all instance content | Treat the slot property as permanent once published; changes only via `editComponentProperty` |

## 7. Decisions requested

1. Approve the slot settings and default content ("Modal content" placeholder, `minChildren` 1).
2. Rename `[Slot]` → `Body`? (cosmetic)
3. Mike to run Library analytics for Modal usage before Phase 2.
4. Approve checker enhancement E3 with E1/E2 (P1-10) as Phase 2 preparation.
