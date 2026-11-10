# MAKE DS2 — component readiness status

> 2026-11-09, duplicate `PpnTy1pkB2FTZFq6i6seSy`.
>
> **Scope:** the pilot components Button, Input field, Modal (+ `_Modal header`, `_Modal actions`) and Alert. Functional problems only; naming differences are out of scope.
>
> **Evidence:** one read-only audit (`scripts/components/component-readiness-audit.js` → `reports/component-readiness/`) plus the regression and Dark-mode evidence from today.
>
> **Not done:** no component changed in this step; nothing published; the original library is untouched; the login screens stay on hold.

## 1. Completed

| Area | Done |
|---|---|
| Tokens ↔ Figma | P2-01 sync (11 values + `gray.450`); 11-variable naming pilot (PASS); `dryrun.py` ID-first seeding; map display names; 17 registry metadata-only updates (`figmaVariableId`), preflighted: keys, values, aliases and build output unchanged. The token repo change is **uncommitted** |
| Button | `Label` TEXT property; `State=Pressed` (25 variants); icon swap via 194/194 exposed icon instances |
| Input field | Border → `border-primary`, focus ring → brand; 13 login variants (lg Default/Password) normalised with `Label` / `Text` properties; 79/79 icon instances exposed |
| Alert | Meaningful MAKER icons per colour; Featured icon and action buttons exposed |
| Validation tooling | E1/E2/E3 regression collectors; per-variable rename snapshots; pixel diff; Dark-mode frame test (create → verify → remove) |
| Light / Dark | Light pixel-identical after the pilot; Dark 731/736 bindings correct across 19 live instances (5 = S-2) |

## 2. Remaining critical component defects (functional)

| # | Component | Defect | Effect for users | Evidence |
|---|---|---|---|---|
| C1 ✅ **RESOLVED 2026-11-09** (`reports/C1-button-primary-alt/`) | **Button `Primary_alt`** | Default, Hover and Pressed all fill with the primitive `Colors/Green lime/500`; there is **no `Disabled` variant** (Primary, Secondary and Link brand have one) | No hover/pressed feedback; no disabled state for the secondary-brand button; colour bypasses the semantic (Light/Dark) layer | `detail-button-primary-alt-states.json`; 35 primitive bindings |
| C2 ✅ **RESOLVED 2026-11-10** (`reports/C2-input-field/`; Label/Text on non-login types deliberately not changed) | **Input field** | Helper text is not a property; the optional tag (40 layers) and help/leading icons (18) are hidden layers with **no BOOLEAN toggle**; `Label`/`Text` properties exist on **13 of 53** variants (login lg Default/Password only) | Designers must dig into layers to edit helper text, show icons or change text in sm, Search, Leading icon, Payment and dropdown types | `audit-pilot-sets.json` (hiddenNoProp 58), `detail-button-input.json` |
| C3 ✅ **RESOLVED 2026-11-10** (`reports/C3-alert-content/`) | **Alert** | No `Title` / `Description` TEXT properties (only the Actions, Supporting text, Show icon and Show close booleans) | Every Alert instance needs layer edits for its content | `audit-pilot-sets.json` |

## 3. Known nonblocking limitations

| Limitation | Why nonblocking |
|---|---|
| **S-2:** Alert Featured-icon circles stay Light in Dark mode (5 remote bindings) | Known; correct in Light; fix belongs to the deferred Icon-library re-link |
| Unbound spacing: Button root padding (40), Input inner gaps (46), Alert/Modal header gaps (5) | Values are correct; only token linkage is missing. Fix opportunistically inside the tasks below |
| Primary icon-only Hover/Pressed: unbound gradient border (6 variants) | Skeuomorphic detail inherited from Untitled UI; no Light/Dark impact on the fill |
| `Link brand` Focused root fill: white at 0.1 % opacity | Invisible hit area, not a Dark defect |
| Fixed root widths (Input field, Alert, Modal parts) | Instances can be set to Fill in auto layout; responsive sizing is a per-screen choice |
| Modal uses the legacy `Drawer content` INSTANCE_SWAP slot (P2-07 native slot pending) | Works; native Slot migration needs Library analytics first |
| Close-icon wrappers in Alert and `_Modal header` are absolute and not swappable | Close icons rarely change; position is intentional |
| Naming: 18 partially renamed groups, radius naming, Tailwind defaults (ADR-0009) | Accepted or deferred (Mike, 2026-11-09) |

## 4. Next three highest-value tasks (each needs approval before any write)

1. **Button `Primary_alt` states (C1).**
   - Rebind the fills to the existing semantic variables `Colors/Background/bg-brand-secondary` and `bg-brand-secondary_hover` (Hover and Pressed). Add 4–8 `Disabled` variants copied from Primary's Disabled pattern.
   - *Token impact:* two registry tokens (`color.bg.brand-secondary`, `…-hover`) would be the first incremental additions. Approval is asked separately.
   - *Validation:* E1 scoped to `Hierarchy=Primary_alt`; Light screenshot plus a Dark binding check.
2. **Input field usability (C2).**
   - Add a `Helper text` TEXT property and `Show helper` / `Show icon` / `Show optional` BOOLEAN properties bound to the existing hidden layers.
   - Extend `Label`/`Text` to the other lg types (and sm where the layer structure allows).
   - Login variants keep their current look.
   - *Validation:* E1 per changed variant, instance text preserved, Light screenshot.
3. **Alert content properties (C3, = P2-06 remainder).**
   - `Title` and `Description` TEXT properties; bind the content gap.
   - An optional `Warning` colour variant only if you want it.
   - *Validation:* E1 (4 variants), instance texts preserved, Light plus a Dark binding check.

Per task, validation stays targeted: E1 for the changed set only, binding and instance checks for that component, and one screenshot. There is no full-library audit per change.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
