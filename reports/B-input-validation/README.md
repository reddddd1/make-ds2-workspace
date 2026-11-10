# Task B — Input field validation states (duplicate)

> 2026-11-10. Approved by Mike: "Proceed". His decisions: a "Required" tag; property-driven password reveal; Focused + error for all types and both sizes.
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy` only. The original library is untouched; nothing was published.
> - **Not changed:** no token or variable was created or changed.
> - **Scripts:**
>   - `scripts/components/input-field-validation.js`: one atomic call; preconditions first; in-call guard;
>   - `scripts/components/input-required-tag-gap.js`: value-preserving follow-up.

## Result: **PASS** — Input field 53 → 61 variants

| # | Change | Detail |
|---|---|---|
| 1 | **The eye stays in error** | `Password, Destructive=True, Filled`: the hidden 16px info wrapper became the visible 20px wrapper with the **eye** icon, as in the non-error Filled state. Users can now reveal the password while correcting it |
| 2 | **Password reveal (property-driven)** | New TEXT property **`Password`** (default `●●●●●●●●`), bound to the password text in Filled, Filled (error), Focused, Disabled and the new Focused (error). Type plain text to show the password. The eye icon is already exposed, so swap it to **`eye-off`** (MAKER Icon library, key `568d8558…`) for the "shown" look. The Placeholder text ("Password") is unchanged |
| 3 | **Required marker** | New BOOLEAN **`Show required`** (default **off**, so nothing changes until it's set). A "Required" tag (copy of the OTP label's tag: `text-quaternary` text, `color/border/primary` outline, `radius-xs`) sits after the label in all 13 label rows + the 2 new ones |
| 4 | **Focused + error** (8 new variants) | sm Default, Search, Search + Tags; lg Default, Password, Leading icon, Leading dropdown, Payment. Each is a copy of its error/Filled variant with border **`border-error`** (stronger than the `border-error_subtle` used at rest) and effect style **`Focus rings/focus-ring-error-shadow-xs`**. Helper text stays Error; property links copied |

## Validation

| Check | Result |
|---|---|
| In-call guard | Every existing variant except Password error/Filled kept its texts, visibility and sizes; Password error/Filled changed only the eye; **26 existing instances** (Date picker components, the Modals page) kept their texts and sizes; count 61 |
| E1 hashes (`variants-before.json` → `variants-after.json`) | **40 / 53 unchanged.** 13 changed, all expected: the 13 variants with a label row (hidden Required tag added; 4 of them also got the `Password` link; Password error/Filled also got the eye). 8 added. File fingerprint unchanged |
| Pixel diff of the set (Light) | The only content change is **Password error/Filled (178 px: the eye)**. The other differences are the old bottom edge of the set frame (rows 916–919), which is now inside the taller set |
| New variants | 0 unbound colours, 0 remote. The Required tag's 10px gap (single child, copied unbound from the OTP tag) is now bound to `spacing-2_5`, so Input field still has **0 hardcoded spacing** |
| Light / Dark (values, `checks-new-variants.json`) | All colours are semantic with Dark values. The error focus ring uses `focus-ring-error` (#ff0466 in both modes) + `bg-primary` gap + `shadow-xs` |

**Contrast** (actual ratios, ADR-0008):

| Pair | Light | Dark |
|---|---|---|
| Error border (`border-error`), UI 3:1 | 3.84 ✅ | 7.30 ✅ |
| Error focus ring, UI 3:1 | 3.84 ✅ | 5.46 ✅ |
| "Required" tag text (`text-quaternary`, 10px) | 4.56 ✅ | 7.16 ✅ |

## Notes and limits

- **Required tag:** the same 10px tag as the OTP label. It's 10px text (T1 in proposal 0005: 10px is below mobile readability guidance). In code, mark the field with `aria-required` too.
- **Not visually checked with the tag on:** `Show required` is off by default, and the tag is a straight copy of the OTP tag (already rendered there). It will be visible on the screens once set.
- **Other types have no label row** (sm types, Leading icon, Leading dropdown, Payment), so `Show required` affects only lg Default and Password. That's an existing structure, not changed here.
- The OTP's `_Input title` tag has the same unbound 10px gap; left as is (outside this task).

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
