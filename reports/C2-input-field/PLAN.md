# C2 — Input field usability: exact change plan (FOR APPROVAL, nothing written)

> 2026-11-10, duplicate `PpnTy1pkB2FTZFq6i6seSy`. Based on two read-only inspections (`inspect-structure.json`, `inspect-helper-text.json`).
>
> **Design goal:** make the Input field usable from the properties panel **without changing how any main component or existing instance looks**.

## What the inspection found

| Finding | Consequence |
|---|---|
| Helper text is a nested **`Helper text` component** (`17515:929`, 15 variants: Size sm/md/lg × Status Informative default/subtle, Success, Error, Alert). It has **no text property**, and the nested instance in Input field is **not exposed** | Users can't switch helper status (Error, Success …) or edit its text from an Input instance |
| All 15 Helper text variants show the same text `{Support text}`. Inside Input field, 32 variants show it and 21 Destructive variants override it to `{Error}` | A `Text` property with default `{Support text}` changes nothing visible |
| `optional` (the "Optional" tag) is hidden in **40** variants with no toggle | Can't be shown without layer edits |
| The 18 hidden **icon wrappers** are the trailing help icon, hidden on purpose in Destructive variants | **Not a defect.** Binding them to a toggle would un-hide them in error states, so they are left alone |
| Existing instances: **26**, all `sm, Default, Filled` inside the date pickers, with helper **hidden** and their own date text | Must stay exactly as they are |

## Proposed writes (one atomic call; all preconditions checked first)

| # | Component | Change | Visual effect on main components |
|---|---|---|---|
| 1 | `Helper text` (15 variants) | Add TEXT property **`Text`** (default `{Support text}`), bound to its text layer | None (default = current text) |
| 2 | `Input field` (53 variants) | **Expose** the nested `Helper text` instance (`isExposedInstance`), so an Input instance shows Helper text's `Size`, `Status` and `Text` | None |
| 3 | `Input field` (53) | Add BOOLEAN **`Show helper`** (default **true**), bound to the Helper text layer's visibility | None (all are visible today) |
| 4 | `Input field` (40) | Add BOOLEAN **`Show optional`** (default **false**), bound to the `optional` tag's visibility | None (all are hidden today) |

**In-call guard:** after the writes, the same call re-reads the 26 date-picker instances. If any helper becomes visible or any value text changes, it throws, and Figma rolls the whole call back.

## Deliberately not in this task

- Extending `Label`/`Text` to the other types (sm, Search, Leading icon, Leading dropdown, Payment). These types have no label row, and their value texts differ ("Search", "Card number", "+34 …"), so a shared property default would change what main components show. That is structural (like P2-05) and would get its own proposal if needed.
- Hidden help icons in Destructive variants (intentional).
- Any token change (the Input field already uses existing variables).

## Validation (targeted)

1. **Regression:** E1 on Input field + Helper text vs a fresh baseline. Expect all 53 + 15 variants to change (new property links and exposure), no variants added or removed, and no other set changed.
2. **Instances:** the 26 date-picker instances keep helper hidden and their date texts.
3. **Pixel diff:** Light screenshots of Input field and Helper text before and after must be **pixel-identical** (proves "no visual change").
4. **Behaviour test, read-only:** on an existing instance, the new properties are listed (`Show helper`, `Show optional`, plus the exposed Helper text `Status`/`Text`).

## Rollback

A single script reverses it: remove the 3 added properties (bound layers return to their current state) and un-expose the 53 nested instances.
