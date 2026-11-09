# Icon-library strategy

> **Decision status (2026-11-09):** keep the MAKER Icon library. Parent-level icon swaps for Button/Input are **approved for planning only** (D-04). No component edits in Phase 1.

### 6. Icon-library strategy

**Keep the published MAKER Icon library** (VERIFIED in use: remote `Icon wrapper` set + individual icons). No evidence supports changing it.

#### 6.1 Current structure (Buttons/Button, VERIFIED)

```
Buttons/Button (variant)
├── Icon wrapper  [remote, MAKER Icon library]  visible ← "Show L icon"
│   └── squircle-dashed [remote icon]  mainComponent ← "Icon" (swap prop on Icon wrapper, not on Button)
├── Text  (no TEXT property)
└── Icon wrapper  visible ← "Show R icon"
    └── squircle-dashed  mainComponent ← "Icon"
```

The placeholder icon is `squircle-dashed`. The Figma pilot swapped it successfully to `arrow-right` by setting the nested instance's property. All instances stayed linked.

#### 6.2 Proposed change (on the duplicate, Phase 2)

- **Option A (preferred, PROPOSED):** add parent-level `INSTANCE_SWAP` properties `Icon leading` / `Icon trailing` on Buttons/Button, wired to the nested `Icon wrapper → Icon`, with **preferred values from the MAKER Icon library**. Same model on Input field, Badge, Alert, _Dropdown list item. Fix Button destructive's default (local placeholder → library icon).
- **Option B:** mark the nested `Icon wrapper` instances as **exposed instances**. Cheaper; still two levels in the properties panel.

#### 6.3 AI icon-swap procedure (PROPOSED for CLAUDE.md)

1. Identify the parent instance and its main component set (must be remote, from MAKER DS v2).
2. Read the parent's `componentProperties`.
3. Locate the icon `INSTANCE_SWAP` property (Option A) — or, until then, the nested `Icon wrapper` instance and its `Icon` property.
4. Resolve the target icon **by component key from the MAKER Icon library** (`importComponentByKeyAsync`). Never use a local or community icon.
5. Set the property with `setProperties`. Never detach.
6. Read back: still linked (`mainComponent.remote = true`), wrapper size unchanged, icon fill still bound to the same `fg-*` variable.
7. Verify every state of that instance's variant family that the screen uses, in Light **and** Dark (R-PAPER-01 lesson).

#### 6.4 Structures that block reliable swapping

- Core Button / Input field: swap property not on the parent (C-2).
- `_Dropdown list item`: icon is a **variant** (`Icon=True/False`), not a swap.
- Badge: boolean show/hide only, no swap.
- Button destructive: swap default is a local placeholder; no preferred values.
