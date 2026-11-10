# Authentication component readiness — final (2026-11-10)

> Approved by Mike: "MAKE DS2 — Authentication Component Final Readiness".
>
> - **Target:** duplicate `PpnTy1pkB2FTZFq6i6seSy`. This task was read-only in Figma; the original library is untouched; nothing was published.
> - **Registry:** proposal 0008 is applied in the working tree and **not committed**. Exact diff: `design-tokens-0008.diff`.
> - **P2-08 (login screens):** ON HOLD. **P2-07 (Modal native Slot):** DEFERRED; the existing swap slot is kept.

## Verdict: **READY.** No remaining critical defects

Components on the 10 login screens: Button (26 instances), Input field (18), Radio / Checkbox (8), plus device chrome (Status Bar, Home Indicator; not DS components). Alert and Modal, with `_Modal header` and `_Modal actions`, are the remaining pilot components.

| Component | R1 variants / states | R2 content as properties | R3 icons swappable | R4 semantic colours | R5 Light / Dark | G1–G4 spacing | Evidence |
|---|---|---|---|---|---|---|---|
| Button | ✅ incl. Primary_alt Disabled, Pressed | ✅ | ✅ 205 / 205 | ✅ (C1; registry 0008) | ✅ | ✅ (D-G1) | C1, P2-03, D-G1 |
| Input field | ✅ | ✅ (C2, P2-05) | ✅ 79 / 79 | ✅ | ✅ | ✅ (D-G1) | C2, D-G1 |
| Radio / Checkbox | ✅ 84 | ✅ (C4) | n/a | ✅ | ✅ | ✅ **(this task)** | C4, `gap-audit-radio-checkbox.json` |
| Alert | ✅ | ✅ (C3) | ✅ | ✅ (except S-2) | ⚠ S-2 | ✅ | C3, P2-06a |
| Modal + parts | ✅ | ✅ (swap slot) | ✅ (except close icon) | ✅ | ✅ | ✅ (D-G1) | P2-01 pilot |

## 1. Radio / Checkbox spacing (G1–G4): **PASS**

Read-only audit (`gap-audit-radio-checkbox.json`). The 84 variants cover:

- type: Checkbox 52, Radio 32;
- size: xs 12, sm 36, md 36;
- state: Default, Hover, Focused, Disabled (21 each);
- checked, unchecked and indeterminate;
- with text (32) and without text (52).

| Field | Bound (`3. Spacing`) | Zero | Hardcoded | Primitive / remote |
|---|---|---|---|---|
| Gaps (148 frames) | 48: `spacing-xxs` 2 ×16, `spacing-md` 8 ×16, `spacing-lg` 12 ×16 | 100 | **0** | **0** |
| Paddings | 32: `spacing-xxs` 2 | 560 | **0** | **0** |

`_Checkbox base` (52 variants) has no Auto Layout, only fixed-size boxes, so G1–G4 don't apply to it.

## 2. Primary_alt semantic tokens (proposal 0008): **all conditions pass**, not committed

| Token | Light | Dark | Figma (unchanged) | Tailwind |
|---|---|---|---|---|
| `color.bg.brand-secondary` | `{color.green-lime.500}` #d0ff00 | same | `Colors/Background/bg-brand-secondary` | `bg-brand-secondary` |
| `color.bg.brand-secondary-hover` | `{color.green-lime.400}` #d9ff75 | same | `Colors/Background/bg-brand-secondary_hover` | `bg-brand-secondary-hover` |

| Condition | Result |
|---|---|
| Exist as Figma semantic variables | ✅ `1. Color modes`, fill scopes (`figma-brand-secondary.json`). Used by the 35 Primary_alt Button fills |
| Light/Dark values and aliases preserved | ✅ Same aliases in both modes (dark flat, ADR-0007). Sync dry-run: 4 rows `unchanged`, 0 create / update / conflict, so **no Figma write** (`dryrun/`) |
| No duplicate role | ✅ No registry token has this role or these values. Figma's `focus-ring-alt` / `bg-avatar-color1` share the values but are different roles. Figma `text-brand-secondary` / `fg-brand-secondary` are **blue**: same word, other namespace (convention §10) |
| Use documented | ✅ `$description`, `proposals/0008-bg-brand-secondary/PROPOSAL.md` |
| Tailwind / NativeWind | ✅ Tailwind 4.3.5 compile S6, 69/69. New classes resolve to the roles; the existing classes in the check compile identically; no `--color-*` key, so no global override. NativeWind: **static check only** (same class names, static hex values, no default-palette key collision); there is no NativeWind compile in this environment |
| Existing tokens / appearance unchanged | ✅ `dist/` adds only these 2 per mode, with 0 removed / changed; Figma untouched |
| Full validation suite | ✅ `npm run check` (validate + 29 tests). Contrast: black label on the backgrounds is **17.99:1** / **18.51:1** (text AA 4.5). Existing contrast pair files 0002 and 0004 pass, unchanged |

Registry diff: +2 entries in each of `tokens/themes/light/color.tokens.json` and `tokens/themes/dark/color.tokens.json` (40 lines added, 0 removed), plus `proposals/0008-bg-brand-secondary/` and 1 CHANGELOG line.

## 3. Remaining critical defects

**None.** The three functional defects (C1 Primary_alt, C2 Input field, C3 Alert) and C4 are resolved. Spacing coverage is 100 %.

## 4. Known limitations (nonblocking)

| # | Limitation | Effect on login screens | Owner / when |
|---|---|---|---|
| L1 | **S-2:** Alert Featured-icon circles stay Light in Dark mode (remote icon-library variables) | Only if an Alert is shown in Dark | Icon-library re-link, pre-ship (S-2) |
| L2 | **Touch targets** below 44 pt / 48 dp: button md 40, link 20–24, checkbox 16–20 (spec 0006 C8) | Screen-level hit-slop / padding in code; visuals unchanged | Dev, at implementation |
| L3 | Text on Primary_alt (`text-primary_on-brandsecondary`, black) and `text-quaternary` are **not registry tokens**. Black passes 17.99:1; quaternary is 4.34:1 on canvas, so login uses `text.tertiary` | Use `color.black` / `text.tertiary` in code | Add only if a component task needs it |
| L4 | The contrast pair file of proposal 0006 references `color.bg.brand-subtle`, which isn't in the registry, so that pair report stops. Same before and after 0008 | None for screens; a gap in the token tooling | Separate fix if wanted |
| L5 | Modal uses the legacy `Drawer content` swap slot; the `_Modal header` close icon is absolute and not swappable | Login screens don't use Modal | P2-07 deferred |
| L6 | Primary icon-only Hover/Pressed: unbound gradient border (6 variants); `Link brand` Focused fill at 0.1 % white | None (inherited detail; invisible hit area) | — |
| L7 | Fixed root widths (Input field, Alert, Modal parts) | Set instances to Fill in the screen layout | Per screen |
| L8 | Naming: 18 partially renamed groups, radius naming deferred, no global Tailwind defaults (ADR-0009). New Figma variables keep their legacy names (e.g. `bg-brand-secondary_hover`) | Code uses registry names; Figma shows legacy names | Deferred (S-1, pre-ship) |
| L9 | Dark mode is flat for brand colours in the pilot (ADR-0007) | Primary_alt looks the same in both modes | By decision |

## Next (needs your approval)

P2-08 screen assembly: the 10 login screens from these components, in the scratch file, Light and Dark, with the standard regression checks.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
