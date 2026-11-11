# Pre-screen readiness check (2026-11-10, read-only)

## iOS chrome
- Excluded: no status bar, home indicator or system chrome. Headlines use MAKE DS2 text styles; no headline component is needed.
- One embedded dependency: `_Modal actions` variant `Horizontal fill container / Mobile` contains a remote iOS-kit **Home Indicator** instance. It is visible and not property-controlled.
  - At assembly, hide it with an instance override (no detach), or use the `Vertical fill container` variant, which has none.
  - Not a blocker.

## Auth token consistency: registry ↔ Tokens Studio (`tokens-studio/b3-spacing`) ↔ DS duplicate
- **Tokens Studio:** 3 sets (`pilot/primitives`, `pilot/theme-light`, `pilot/theme-dark`), 3 themes (`_Primitives`/Style, `1. Color modes`/Light + Dark), 98 variable references. `check:tokens-studio` passes (adapter = registry-derived output).
- **Figma:**
  - Post-B3 digests are identical to the per-variable baseline: 686 variables, 0 duplicate names, bindings unchanged.
  - The approved auth components (Button, Input field, Alert, Modal + parts, Radio / Checkbox, OTP, Loading indicator, Button loading icon, Logo, Logomark) bind **96 local variables**:

| Class | Count | Contents | Values vs registry |
|---|---|---|---|
| A: synced (registry + Tokens Studio + Figma) | 12 | 11 colour semantics (brand bg/text, border-primary, error, success, focus ring, …) + Base/white; their alias chains end in the 85 Tokens Studio tokens | ✅ all Light/Dark resolutions equal |
| B: registry + Figma, **not** Tokens Studio-managed (deliberately excluded) | 18 | 8 radius (offset naming, R1 deferred), 10 typography (size, line height, weight, family) | ✅ equal by value. Representation differs (weight 400 vs "Regular", line-height ratio vs px, font stack vs "Inter"), which is why they are excluded |
| C: Figma-only (not in registry) | 66 | 46 colour semantics (e.g. `text-tertiary (600)`, `border-secondary`, `fg-quaternary (400)`), 11 `3. Spacing` aliases (incl. `spacing-2_5`=10 → `spacing/2_5`, `spacing-3_5`=14 → `spacing/3_5`, both Tokens Studio-managed), 9 typography (display sizes, text-xxs/lg, bold, secondary family) | n/a. Alias endpoints: 55 Tokens Studio-managed primitives, 36 registry primitives, 21 Figma-only or literal |

- **Not a blocker for Figma screen assembly.** Every binding resolves in the duplicate, and nothing is missing locally.
- The 66 Figma-only variables (and class B) are **not** synchronised through Tokens Studio and not (or not uniformly) in the registry. **The system is not fully synchronised.** These need registry proposals before code handoff.
- **Remote bindings:** about 11 bindings inside nested remote instances (Icon library / Featured icon, iOS kit) point to external-library variables. This is the known S-2 issue. Not a blocker.

## Components
- No regression since `README.md` (final readiness: READY). No component edits were made since; variable and binding digests are unchanged.
- The addendum covers OTP (6-digit), Loading, Modal, Alert and Logo/Logomark.

## Screen reference
- **Not found.** There is no auth reference frame or page in the DS duplicate (40 pages), and no reference file in Documents or Downloads. The only login frames are the 10 AI-generated screens in the pilot scratch file, which are not a reference.
- The count (19?) and the Light/Dark requirement **can't be verified** until Mike supplies the reference.
