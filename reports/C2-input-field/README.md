# C2 — Input field usability (duplicate)

> 2026-11-10. Approved by Mike ("Apply C2"); plan in `PLAN.md`.
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only.
> - **Not changed:** no token or variable, the original library (untouched); nothing was published.
> - **Script:** `scripts/components/input-field-usability.js`. One atomic call; preconditions checked first; the in-call guard would have rolled everything back if an existing instance or main component had changed.

## Result: **PASS**

**What designers get on any Input field instance now:**

| Property | Type | Default | What it does |
|---|---|---|---|
| `Show helper` | BOOLEAN | on | Shows or hides the helper line |
| `Show optional` | BOOLEAN | off | Shows the "Optional" tag next to the value (40 variants that have it) |
| **Helper text** (exposed nested instance) | `Status`, `Size`, `Text` | Informative default · md · `{Support text}` | Switch the helper to **Error / Success / Alert / Informative subtle** and edit its text, straight from the Input field |
| `Label`, `Text` (existing, login variants) | TEXT | unchanged | — |

On the `Helper text` component itself (used elsewhere too), the new `Text` TEXT property has default `{Support text}`, the text all 15 variants already showed.

## Validation

| Check | Result |
|---|---|
| R-PAPER-01 (`spec.json`): Input field + Helper text in scope vs the 05:35 baseline | **PASS 24/24**: exactly 53 + 15 variants changed (new links / exposure); none added or removed; Button, Modal, `_Modal header`, `_Modal actions`, Alert unchanged; fingerprint unchanged (`r-paper-01.md`) |
| **Pixel diff, Light** | Input field set and Helper text set **pixel-identical** before vs after (833,400 + 123,256 px, 0 different) |
| Existing instances (26, date pickers) | Unchanged: helper still hidden (its earlier manual hide is now `Show helper = false`), dates preserved (17 × "Jan 10, 2025", 9 × "Jan 16, 2025"). They now list `Show helper`, `Show optional` and the exposed Helper text properties (`checks-instances.json`) |
| Main components | 21 Destructive variants still show `{Error}`; 32 others `{Support text}`; all 40 `optional` tags still hidden |

## Deliberately not changed

- `Label`/`Text` on the non-login types (sm, Search, Leading icon, Leading dropdown, Payment). These are structural, and a shared default would change displayed text. Separate proposal if needed.
- Help icons hidden in Destructive variants (intentional per state).

## Rollback

Remove the 3 properties (`Text` on Helper text; `Show helper`, `Show optional` on Input field) and set `isExposedInstance = false` on the 53 nested Helper text instances. The bound layers return to their current state.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
