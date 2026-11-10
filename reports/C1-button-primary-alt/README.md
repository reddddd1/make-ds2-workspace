# C1 — Button `Primary_alt` states (duplicate)

> 2026-11-09. Component task 1, approved by Mike ("Go").
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only.
> - **Not changed:** the original library (untouched), the registry and other tokens; nothing was published.
> - **Script:** `scripts/components/button-primary-alt-states.js` (one atomic call, all preconditions checked before the first write).

## Result: **PASS**

| Change | Detail |
|---|---|
| **Fills linked to semantic roles** | All **35** Primary_alt variants (20 text + 15 icon-only). Default / Focused / Loading → `Colors/Background/bg-brand-secondary`; Hover / Pressed → `Colors/Background/bg-brand-secondary_hover`. Previously all bound to the primitive `Colors/Green lime/500` |
| **Visible state feedback** | Hover and Pressed now `#d9ff75` (lime 400) vs Default `#d0ff00` (lime 500). Default, Focused and Loading look exactly as before |
| **New `State=Disabled` for Primary_alt** | **7** variants (md, lg, sm, xxs text; md, lg, sm icon-only), copies of the matching `Primary` Disabled variants. `Label`, `Show L icon` and `Show R icon` links restored (3 per text variant) |
| Layout only | The set grew 1790 → 1862 px (new bottom band). `Button destructive`, `Button action` and `Button navigation` moved down 72 px, and the `Buttons` section grew 72 px |

## Validation (targeted)

| Check | Result |
|---|---|
| R-PAPER-01, scope `Hierarchy=Primary_alt` (`spec.json`) vs the 21:00 baseline | **PASS 21/21**: exactly the 35 in-scope variants changed; only the 7 Primary_alt Disabled variants added; the other 108 Button variants and Input field, Modal, `_Modal header`, `_Modal actions` and Alert unchanged; property definitions and file fingerprint unchanged (`r-paper-01.md`) |
| New Disabled = Primary Disabled (layers, bindings, property links, sizes, text; root name aside) | **7/7 identical** (`checks-after.json`) |
| Light / Dark values (md) | Default/Focused/Loading `#d0ff00` both modes; Hover/Pressed `#d9ff75` both modes; Disabled `#f5f5f5` Light, `#13161b` Dark (`bg-disabled`) |
| Existing instances | **0** instances of any Primary_alt variant in the file, so no instance is affected |
| Cover page | Clean (clones moved into the set within the same call) |
| Visual | `button-before.png` → `button-after.png` |

## Open (not done; needs separate approval)

**Registry tokens for Primary_alt:** the bound roles exist in Figma but have no registry token yet. For code, the minimal incremental addition is:

| Proposed token | Figma variable | Light / Dark |
|---|---|---|
| `color.bg.brand-secondary` | `Colors/Background/bg-brand-secondary` `VariableID:5363:390066` | `{color.green-lime.500}` / same |
| `color.bg.brand-secondary-hover` | `Colors/Background/bg-brand-secondary_hover` `VariableID:17490:23029` | `{color.green-lime.400}` / same |

Both alias existing registry primitives (`color.green-lime.400`, `color.green-lime.500`), so no new primitive is needed. Not added, per the "request approval before any token change" rule.

Primary_alt's label (`text-primary_on-brandsecondary`) and focus ring (`focus-ring-alt`) are also Figma-only. They can follow when needed; the label name needs the naming decision from the group audit.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
