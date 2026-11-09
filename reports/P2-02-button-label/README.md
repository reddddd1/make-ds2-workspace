# P2-02 — Buttons/Button `Label` TEXT property (duplicate)

> 2026-11-09 · Approved by Mike: start P2-02 with default label "Button" (recommended over `{CTA Label}`). Target: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original was not touched and nothing was published.

## Change (VERIFIED)

- **New property:** `Label` (TEXT, default **"Button"**) on `Buttons/Button`. Property key `Label#23477:0`.
- **Bound layers:** the label text layer of all **76** `Icon only=False` variants now follows the property.
  - 56 at `Text padding › Text`, 20 Link brand at `Text`.
  - Includes the 16 Loading variants. Their `Loading text` boolean is unchanged.
- **Not changed:**
  - the 42 icon-only variants, which have no label;
  - every other property, the structure, styles and bindings.
- **Script:** `scripts/components/button-label-property.js`.
  - Refuses any file other than the duplicate.
  - Checks every precondition before the first write: no existing `Label` property; each of the 76 variants has exactly one own text layer reading `{CTA Label}`, not yet bound; icon-only variants have none.
  - Loads Inter Medium / Semi Bold / Bold.
  - Writes: 1 `addComponentProperty` plus 76 `componentPropertyReferences`. Result: `write-result.json` (76/76 `allOk`).

## Verification

| Check | Result |
|---|---|
| **Instance labels (the main risk)** | **101/101 kept.** Every labelled Button instance in the file ("Apply", "Edit", "Main action", "Copy", "Jan 10, 2025 – Jan 16, 2025"…) has the same text as before, and its `Label` property now holds that text. 0 lost. Compared: `instances-before.json` ↔ `instances-after.json` |
| R-PAPER-01 (`spec.json`: `Icon only=False`, property-definition change allowed) | **PASS: expected 76, actual 76**; 42 icon-only unchanged; Input field, Modal, _Modal header, _Modal actions and Alert unchanged; fingerprint unchanged → `r-paper-01.md` |
| Main components | All 76 labels now read "Button" (`button-after.png`). Labelled buttons are slightly narrower (hug width, shorter text). Instances keep their own text, so their width doesn't change |
| Icon-only instances (3) | Have the `Label` property with the default value; no visible effect (no text layer) |
| Alert (contains 2 Link-brand buttons each) | Labels "Secondary action" / "Main action" unchanged (`alert-after.png`) |

## Notes

- **Nested buttons in other components** (Date picker, Radio group, Modal actions, Alert, App navigation…) keep their texts, all checked above. In their parent components the button label is now editable through the nested Button's `Label` property, once the button is exposed (P2-04, option B).
- **Consumer files** (e.g. the pilot scratch) use the original library and are unaffected until the duplicate is published (Mike's decision).
- Baseline for the next task: `variants-after.json`.

## Subscription status

Tokens Studio Free (assumed; not used) · Unblocked · no paid features · no upgrade.
