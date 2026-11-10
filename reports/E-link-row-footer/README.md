# Task E: Link gray, selection rows, footer. Read-only plan (2026-11-10)

> Duplicate `PpnTy1pkB2FTZFq6i6seSy`, **read-only**: 3 `use_figma` reads, 0 writes, nothing published.
> Next step: **each item below needs Mike's approval before any write.**

## What the orphans are (VERIFIED)

An orphan is a local main component with no parent: it sits on no page, so designers can't find, edit or maintain it.

| Orphan main | Instances (whole file) | Used in | Notes |
|---|---|---|---|
| `Buttons/Button/{sm,md}/Link gray/Default/False` | 22 + 22 | Radio group item, Radio group | Text `text-tertiary (600)`. Old Untitled UI property model (`⬅️ Icon leading`, `🔀 … swap`), which isn't the current Button API |
| `Buttons/Button/{sm,md}/Link gray/Disabled/False` | 4 + 4 | Radio group item | Text `fg-disabled` |
| `Buttons/Button/lg/Link gray/Default/False` | 1 | `_Modal actions` (checkbox variant, "Settings") | Plus an orphan local `settings-01` icon |
| `Radio group item/{True,False}/{sm,md}/{Radio button,Checkbox}/Default/{Desktop,Mobile}` | 16 mains, 40 instances | Radio group (`Type=Radio button`, `Type=Checkbox`) | Plan rows ("Basic plan / $10/month"); fills and texts already bound |
| `check` (local icon, not the MAKER Icon library) | **80** | Radio group item 48, Radio group 16, **`_Checkbox base` 12**, other 4 | The **login checkbox** (`_Checkbox base`) uses it. Vector stroke not bound to a variable |

`Buttons/Button` today: Hierarchy = Primary, Secondary, Link brand, Primary_alt (150 variants). Link brand has 24 variants: xxs/sm/md/lg × Default, Hover, Focused, Pressed, Disabled, Loading. **No Link gray.**

## Proposed fix (needs approval, item by item)

| # | Change | Method | Affected | Risk |
|---|---|---|---|---|
| **E1** | Add **`Hierarchy=Link gray`** to `Buttons/Button`: 24 variants cloned from Link brand, with the text and icon colours rebound to `text-tertiary` / `fg-tertiary` (hover `text-tertiary_hover` if it exists, else `text-secondary`) and Disabled → `fg-disabled`. Same `Label` property, icons and states as Link brand | Clone inside the set, rebind colours only | 150 → 174 variants; existing variants untouched | Low (additive) |
| **E2** | **Swap the 53 orphan Link gray instances** (Radio group item 26 + Radio group 26 + `_Modal actions` 1) to the new E1 variants with `swapComponent`, keeping their text | Swap, then check each one's text, size and visibility | 3 sets | Medium: old property model, so icon visibility overrides need mapping |
| **E3** | Move the 16 orphan **plan rows** into `Radio group item` as `Type=Radio button` and `Type=Checkbox` variants (the Desktop/Mobile, sm/md and Selected combinations that exist), **then swap** the 40 instances in `Radio group` to them | Clone the orphan mains into the set; swap; check | Radio group item 96 → 112 | Medium: variant-matrix gaps (only `State=Default` exists for these types) |
| **E4** | Swap the **80 `check` icon instances** to the MAKER Icon library `check` (icon procedure §6.3), stroke bound to the existing variable used per state | Swap and verify stroke binding, Light and Dark | Includes the **login checkbox** | Medium: visible pixel change if the library glyph differs. Pixel diff required |
| **E5** | **Auth footer** (new local component `Auth footer`): "Don't have an account? **Sign up**" and a terms line, built from text styles + Button Link brand/gray instances, with `Prompt`, `Link` and `Show terms` properties | New component | New | Low, but content needs your call |

Order if approved: **E1 → E2 → E4 → E3 → E5**. E1/E2 unblock Link gray everywhere, and E4 touches the login checkbox. E3 is not on the login path.

## Validation per write (R-PAPER-01, R-PENPOT-01, R-FIGMA-01)

- Expected vs actual counts (E1: 24 new variants; E2: 53/53 swapped; E3: 40/40; E4: 80/80).
- 0 orphan mains referenced afterwards (re-run this inspection).
- Texts, sizes and visibility per swapped instance unchanged.
- Bindings Light + Dark.
- Pixel diff: Radio groups, Modals, Checkboxes and Buttons sections; changes only where intended.
- Re-read in a separate call.
- Original library untouched.

## Decisions needed

1. **Approve E1 + E2** (Link gray in Button + re-linking its 53 uses)?
2. **Link gray hover colour:** `text-tertiary_hover` if it exists (I'll check before writing), otherwise `text-secondary`?
3. **E4 check icon:** swap to the MAKER Icon library `check` (consistent with the icon rule; a possible small glyph change on the login checkbox), or keep the local glyph and just give it a page?
4. **E3:** do this now, or leave it for later? It isn't used by the login flow.
5. **E5 footer copy:** "Don't have an account? Sign up" + "By continuing you agree to our Terms and Privacy Policy". Is that OK?

Subscription: Tokens Studio Free (not used) · unblocked · no upgrade.

---

## Applied 2026-11-10 (Mike approved E1–E5 in chat)

Duplicate `PpnTy1pkB2FTZFq6i6seSy` only. Original library untouched, no token or variable created or changed, nothing published. Every write was guarded on the file key and atomic (one failed E3 attempt rolled back fully and was retried).

| # | Result | Evidence (structural read-back in separate calls) |
|---|---|---|
| **E1** Link gray | `Buttons/Button` 150 → **174** variants; `Hierarchy` options now Primary, Secondary, Link brand, Primary_alt, **Link gray** (xxs/sm/md/lg × Default, Hover, Focused, Pressed, Disabled, Loading). Colours: text `text-tertiary (600)` (Light #535862, Dark #94979c); Hover/Pressed `text-tertiary_hover`; icons `fg-quaternary (400)` / `_hover`; Disabled unchanged (`fg-disabled`, `fg-disabled_subtle`); focus ring unchanged. Existing 150 variants unchanged (id+name guard) | Binding counts per variable; 0 brand bindings left |
| E1 correction | **Cloning variants inside a set dropped their component-property references** (`Label`, `Show L/R icon`, `Loading text`). Restored all 64 references from the Link brand twins; all 24 now match Link brand exactly | Reference comparison 24/24 |
| **E2** Re-link | **53/53** orphan Link gray uses swapped (Radio group item + Radio group 52, `_Modal actions` 1). Text kept 53/53, icons off as before. Old sm/md Link gray were both 14/20, so all map to `Size=md` (93×20 vs 94×20 before: Semibold → Medium, the current Link convention). "Settings" in `_Modal actions` keeps its leading icon, now the MAKER Icon library `settings` | Per-instance text, size and icon check |
| **E4** Check icon | **12/12** local `check` instances in `_Checkbox base` swapped to the MAKER Icon library `check` (`d890890f…`), with size, position, stroke variable and stroke weight kept. All nested uses follow: **107** library `check` instances, 0 unbound strokes | **Pixel-identical**: export fingerprints of `_Checkbox base` and `Radio / Checkbox` unchanged |
| **E3** Plan rows | `Radio group item` 96 → **112** variants (`Type` + Radio button, Checkbox; State=Default only, as before). Unreferenced `Badge` booleans dropped. **40/40** Radio group uses swapped, texts and sizes kept | **Pixel-identical**: Radio group export fingerprint unchanged; existing 96 variants unchanged |
| **E5** Auth footer | New local component **`Auth footer`** (`23577:7909`, Miscellaneous assets page), 358 wide, hug height: Prompt (Text sm/Regular, `text-tertiary`) + exposed Link brand Button "Sign up" + Terms (Text xs/Regular, `text-tertiary`, centred). Properties `Prompt`, `Terms` (TEXT), `Show terms` (BOOLEAN); gaps `spacing-md` / `spacing-xs` | Instance test: 46 px with terms, 20 px without |
| Orphans | **0** instances left on any of the 23 orphan mains; 5 orphan mains were purged by Figma once unused | Read-back |

**New lesson for the workflow (R-FIGMA-02):** `clone()` of a variant inside a component set loses `componentPropertyReferences`. After cloning, always compare references with the source and restore them.

Not verified: pixel diff of the Link gray change on the Radio groups and Modals pages. It isn't exportable to the local diff tool from this session, and the change is intended (gray Link, Medium weight).

Subscription: Tokens Studio Free (not used) · unblocked · no upgrade.
