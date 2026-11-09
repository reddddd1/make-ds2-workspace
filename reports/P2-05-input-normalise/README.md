# P2-05 — Normalise the 13 login Input field variants + TEXT properties (duplicate)

> 2026-11-09 · Approved by Mike: "Normalise" (option over "three properties" / "skip"). Scope: `Input field` `Size=lg`, `Type=Default | Password`, all states and Destructive (13 variants), per `docs/pilot-button-input.md` §2.4 (c). Target layout: `design-tokens/specs/components/text-field.md`. Target file: duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original was not touched and nothing was published. **Part 2: `Label` + `Text` TEXT properties added (option a, approved).**

## What changed (VERIFIED)

**Before:** a floating-label design with 4–5 different layer structures. The label only showed in Filled / Focused-Password / Disabled-Default, inside the box.

**After:** one structure for all 13 (spec anatomy):

```
Variant (vertical, gap spacing-sm = 6)
├── Label row (H, gap spacing-xs)
│   └── Label  — Text sm/Medium, fill text-secondary (700); "Label" (Default) / "Password" (Password)
├── Input (box: unchanged padding 12/16, radius-3xl 20, fill, stroke, focus ring, fixed height 52)
│   └── Content (H, gap + vertical padding spacing-sm, fill)
│       ├── wrapper (H, gap spacing-sm) › Text (value or placeholder, unchanged style/colour) [+ optional tag]
│       └── Icon wrapper (unchanged, still exposed)
└── Helper text (unchanged)
```

- **Kept as they were:** the existing labels were moved, not recreated. Variants without a label got a new one. Value/placeholder texts, colours, icons, password dots, borders and focus rings are unchanged. Legacy wrapper frames were removed (only after checking they held no text or instance).
- **Size:** variant height 76 → **102 px** (label row 20 + 6 + box 52 + 6 + helper 18). No repositioning needed: rows in the set are 124 px apart.
- **Script:** `scripts/components/input-normalise-login.js`. Refuses any file other than the duplicate; all checks run before writing.

## Verification

| Check | Result |
|---|---|
| E1 hash vs the P2-06a baseline | **Input field: exactly the 13 login variants changed**, the other 40 unchanged. Button, Modal, _Modal header, _Modal actions, Alert unchanged. Property definitions and fingerprint unchanged |
| One structure | All 13 variants have an **identical** layer structure (`checks-after.json` → 1 shape) |
| Existing instances | 6 Input field instances (all `sm`, on Date pickers): unchanged. The pilot scratch login screens use the original library, so they're unaffected until P2-08 |
| Cover page | Clean (no stray nodes) |
| Screenshot | `input-before.png` → `input-after.png`: label above the field in all states for Default and Password |

## Run log (honest record)

1. **Test on 1 variant** (`lg Default Placeholder`): the first attempt stopped at font loading, **before any write**. The label style's font is bound to variables, so Figma reports it as "mixed". Fixed by loading Inter Medium/Regular directly. Second attempt OK, screenshot checked.
2. **Remaining 12:**
   - 1st attempt failed: the existing label was removed together with its old wrapper before being moved out.
   - 2nd attempt failed: the icon was moved and then removed again by the cleanup loop.
   - **Both failed calls were rolled back completely by Figma** (all-or-nothing per call), confirmed by a read. Nothing was lost.
   - 3rd attempt, with both order bugs fixed: 12/12 OK. The script file contains the fixed version.

## Part 2 — TEXT properties (VERIFIED)

Approved by Mike: "Recomended" (option a), 19:29 UTC. Script: `scripts/components/input-text-properties.js`; result in `write-result-properties.json`.

| Property | Type / default | Bound to | Variants |
|---|---|---|---|
| `Label` (`Label#23498:0`) | TEXT · "Label" | `Label row › Label` | **13** (all login variants) |
| `Text` (`Text#23498:54`) | TEXT · "Placeholder text" | value/placeholder text | **7** (`Type=Default`) |

- **Not bound:** the Password value text (masked dots).
- **Expected default effects in the main components:** Password labels show "Label", and Default Filled/Focused/Disabled show "Placeholder text" in their value colour (`input-after-properties.png`). Instances set their own text.
- **E1 vs part 1:** Input field changed **exactly the 13 login variants**; the other 40, plus Button / Modal / Alert, unchanged; fingerprint unchanged (`variants-after-properties.json`).
- **Existing instances:** 6 top-level and 20 nested (inside Date picker components) Input field instances keep their date texts (`checks-after-properties.json`). They use `sm` variants, which aren't bound.

## Decision record (part 2, for reference)

The structure is now uniform, but a TEXT property still has **one default per property**, and binding it shows that default in every bound main-component layer:

- **`Label`** on all 13: default "Label". The Password variants' main label would show "Label" instead of "Password" (instances keep their own text).
- **Value / placeholder:** the bound layer shows "Placeholder text" in Placeholder state, "{Text}" in Filled, and dots in Password. One property would show the same default everywhere, so Password dots and Filled values would change in the main components.

**DECISION (Mike):** e.g. (a) `Label` on all 13 + `Text` on the 7 Default-type variants (default "Placeholder text"), Password text left fixed; (b) `Label` only; (c) no properties for now.

## Subscription status

Tokens Studio Free (assumed; not used) · Unblocked · no paid features · no upgrade.
