# MAKE DS2 — Refactoring Audit & Implementation Plan

- **Date:** 2026-11-09
- **Prepared by:** Claude (Cowork), audit and planning only
- **Mode:** AUDIT AND PLANNING ONLY. Nothing in Figma, the token repo or any production code was changed.
- **Status:** **PROPOSED — awaiting Mike's approval (§15).** Nothing in this document is approved unless it cites an existing ADR.
- **Excluded from the workflow:** Jev.

### Evidence labels used throughout

| Label | Meaning |
|---|---|
| **VERIFIED** | Checked during this audit (live Figma read-back, official docs) or recorded with evidence in an earlier project report |
| **APPROVED** | Decided by Mike, recorded as an Accepted ADR in `DECISIONS.md` |
| **PROPOSED** | Recommendation in this document; not approved |
| **UNVERIFIED** | Not checked, or the source was unreachable |
| **BLOCKED** | Cannot proceed without access or a decision |

### Evidence sources

| Source | What it gave | Status |
|---|---|---|
| Figma library **MAKER-DS-v2** (`xJoAz66aekAToyhBmfGNt0`) | Live read-only `use_figma` inventory of all 24 component pages, variables and styles (this audit, ~28 read-only `use_figma` calls, 0 writes) | VERIFIED |
| Project docs: `FIGMA-AUDIT-REPORT`, `DECISIONS` (ADR-0001–0010), `INVENTORY`, `ROADMAP`, `LOGIN-SPECS`, `FIGMA-AI-DS-PILOT`, `PAPER-AI-DS-PILOT`, `PENPOT-AI-DS-PILOT`, `PENPOT-FEASIBILITY` | Token audit, decisions, pilot results | VERIFIED (as recorded 2026-11-08/09) |
| GitHub `reddddd1/design-tokens` | Not reachable from this cloud session (no GitHub access granted) | **UNVERIFIED** — state taken from `INVENTORY.md` / ADR-0010 |
| Tokens Studio pricing (tokens.studio/pricing) | Plan structure and price | VERIFIED (page read 2026-11-09); docs plan page failed to load |
| Figma Help Center + Plugin API docs on Slots | Slot availability and API surface | VERIFIED (docs read 2026-11-09); behaviour on MAKER DS **not tested** |
| Production app repo (GitLab) | — | **BLOCKED** (no GitLab access; connector needs authorization) |

---

## 1. Executive summary

1. **The library is in better structural shape than expected.** 68 component sets (~1,170 variants) plus 12 standalone components. Colour binding is near-complete: across all sets only **15 unbound solid fills, 3 unbound strokes and 4 unstyled text nodes** were found (VERIFIED). Auto layout is used everywhere it matters.
2. **The main weaknesses are in the component API, not the visuals.** These are what make AI generation fragile:
   - **No TEXT component properties** on any core component (only Tooltip has one). Labels are edited by reaching into nested layers. This was the cause of fragility in the Figma pilot (F4).
   - **Icons are not swappable from the parent** on the core Button. The `Icon` instance-swap lives on a nested, *non-exposed* `Icon wrapper` from the MAKER Icon library.
   - **15 variant axes have only one option** (e.g. `Toggle Text=False`, `Select Size=lg`, `Modal actions Destructive=False`). These are leftovers from pruning the Untitled UI kit and mislead agents and code mapping.
   - **No native Figma Slots yet.** Modal uses a legacy workaround: a 36 × 36 local `Slot` placeholder plus an instance swap (`Drawer content`). The library's own page says this is "temporary, to be deprecated after native Figma slots".
3. **Tokens.** The Figma variable architecture is already effectively two-tier (hidden `_Primitives` → `1. Color modes` with Light/Dark), but it has 171 component-level colours, raw-number radius, string font weights, **288 of 681 variables on `ALL_SCOPES`**, and **0 variables with code syntax**. The canonical DTCG registry exists and follows ADR-0003–0008. As of the last record it holds 118 primitives, 8 semantic typography tokens and 11 semantic colours per mode, scoped to the login pilot.
4. **Figma is the strongest AI production surface** (Figma pilot: 72/72 linked instances, 174/174 bound, atomic writes, $0.51 per screen vs $1.21 Paper). Paper and Penpot stay exploration tools, as the brief says.
5. **Subscription:** no paid Tokens Studio feature is needed for the audit or for Phase 1. **Direct Git sync is listed as a paid ("Team") plugin feature.** A free workaround exists (scripted registry → Figma variable sync via the Plugin API), so this is **not a blocker today**. See §9.
6. **Recommended pilot: Button, Input field (Text Field), Modal and a new Card.** The library has **no generic Card component**, so the Card pilot needs a design decision (§12, D-07).
7. **Biggest governance conflict:** ADR-0005 says Figma stays read-only this phase. The brief now wants refactoring in an approved **duplicate**. That is compatible (the original stays untouched), but **ADR-0005 needs an amendment** before Phase 2 (D-01).

---

## 2. Current-state inventory

### 2.1 Files and libraries (VERIFIED)

| Asset | Identifier | Notes |
|---|---|---|
| Original library | MAKER-DS-v2, file `xJoAz66aekAToyhBmfGNt0`, published as "MAKER DS v2" (team library) | **Protected. Never modified.** |
| Icon library | "MAKER Icon library" (team library, separate file) | Provides `Icon wrapper` set and individual icon components (e.g. `squircle-dashed`, `arrow-right`, `x`). File key not recorded: **UNVERIFIED** |
| Pilot scratch file | "DS2 – Figma Pilot – scratch" `uMQLqPDG5I4rZAAHlhpInJ` | Consumes the library; contains the login pilot screens |
| Penpot scratch | `3681d377-bc58-8110-8008-ea451983d03c` | Synthetic tokens only |
| Libraries enabled *on the DS file itself* | MAKER Icon library, Material 3, Simple Design System, iOS 18/26, watchOS/visionOS/macOS 26 | Noise for agents searching the design system. Proposed: scope agent searches to MAKER DS v2 + Icon library keys |
| Duplicate for refactoring | — | **Does not exist yet** (D-02) |

### 2.2 Pages

Cover, Changelog (empty), Primitives (Colors, Logos, Typography, Effect styles, Design annotations, **Slot (temporary)**), 24 base-component pages, Miscellaneous assets, Archive/Sources/Playground (empty). **"Empty states" page contains no components.**

### 2.3 Component sets (VERIFIED, live read-back 2026-11-09)

Columns: variants · property summary (B = boolean, I = instance swap, T = text, V = variant axis) · unbound fills/strokes/text.

| Page | Component set | Var. | Properties | Unbound |
|---|---|---|---|---|
| Buttons | **Buttons/Button** | 118 | B×3 (Loading text, Show L/R icon) · V: Size xxs/sm/md/lg, Hierarchy Primary/Secondary/Link brand/Primary_alt, State Default/Hover/Focused/Disabled/Loading, Icon only | 4 fills |
| | Buttons/Button destructive | 68 | B×3 · **I×2** (leading/trailing) · V: Size, Hierarchy (no Primary_alt), State **(no Disabled)**, Icon only | 0 |
| | Social button | 54 | V: Social, Supporting text, Theme, State | 6 fills (brand logos) |
| | Social button groups | 6 | V×2 | 0 |
| | Mobile app store badge | 12 | V×3 | 2 strokes |
| | Buttons/Button loading icon | 2 | V: Size sm/md | 0 |
| | Buttons/Button icon | 12 | V: Intent, Size | 0 |
| | Buttons/Button action | 3 | V: State Default/Disabled/**onTap** | 0 |
| | Buttons/Button navigation | 3 | V: State Default/Active/Disabled | 0 |
| Button groups | _Button group base · Button group · (Navigation button group) | 32 · 3 · 1 | base has **I×1** | 0 |
| Tab & filter | _Tab button base · _Filter button base · Tab group · (Filter group) | 8 · 2 · 4 · 1 | B×3 on base | 0 |
| Badges | Badge | 27 | B×2 (L/R icon, **no swap**) · V×3 | 0 |
| Tags | Tag · Tag count | 30 · 6 | Tag `Icon=False` single option | 4 text (Tag count) |
| Dropdowns | _Dropdown list item · Dropdown · Select · (_Scroll bar) | 11 · 2 · 25 | Icon as **variant**, not swap; `Dropdown Type=Button`, `Select Size=lg` single options | 0 |
| Inputs | **Input field** | 53 | V: Size **lg/sm only**, Type ×7 (Default, Leading dropdown, Payment, Leading icon, Password, Search, Search + Tags), Destructive, State Placeholder/Filled/Focused/Disabled (**no Hover/Pressed**) | 0 |
| | Textarea input field · Helper text · _Input title · _Mega input field base · Verification code input field | 14 · 15 · 3 · 12 · 3 | Verification `Digits=4` single option | 3 fills (Textarea) |
| Toggles | _Toggle base · Toggle | 16 · 16 | `Type=Default`, `Text=False` single options | 0 |
| Checkboxes | Radio / Checkbox · _Checkbox base | 84 · 52 | B×1 · V×6 | 0 |
| Radio groups | Radio group item · Radio group | 96 · 20 | Breakpoint Mobile/Desktop | 0 |
| Avatars | Avatar · Avatar label group · Avatar group · _Avatar company icon · _Avatar add button | 80 · 4 · 3 · 6 · 12 | `Status icon=False` single option | 0 |
| Tooltips | Tooltip · Help icon | 14 · 28 | **Tooltip has the library's only TEXT property** | 0 |
| Progress | Progress bar · Progress circle | 33 · 5 | `Shape=Circle` single option | 0 |
| Sliders | Slider · _Control handle | 30 · 9 | | 0 |
| Navigators | Navigator · _Indicator | 5 · 2 | | 0 |
| App Navigation | Header navigation · _Nav item base · _Nav item button · _Nav account card menu item · _Nav featured card · _Application nav menu button | 2 · 6 · 12 · 8 · 6 · 6 | 3 sets have **I×1**; Header `Open=False`, `Style=Simple` single options | 3 fills, 1 stroke |
| Modals | **Modal** · _Modal header · _Modal actions | 1 · 1 · 3 | Modal: **I `Drawer content`** (legacy slot, default = local `Slot` 36×36, 1 preferred value); `_Modal actions Destructive=False`, `Breakpoint=Mobile` single options | 0 |
| Alerts | Alert | 4 | B×4 · V: Color | 0 |
| Date pickers | Date picker dropdown · Date picker modal · _Date picker menu · _Calendar cell · _Date picker list item | 16 · 4 · 4 · 12 · 6 | Desktop/Mobile breakpoints | 0 |
| Loading | Loading indicator | 8 | | 0 |
| Label | Textelement | 4 | | 0 |
| Illustration | Illustration wrapper · Virtual card · Physical card · (8 illustration components) | 8 · 3 · 4 | Payment cards, not UI cards | — |
| Misc | Divider · Background overlay · Spacer | 1 · 1 · 6 | | — |
| Slot (temp.) | (Slot) standalone | 1 | Legacy slot placeholder | — |

**Totals:** 68 component sets, ~1,170 variants, 12 standalone components. 0 native `SLOT` properties. 1 `TEXT` property. 7 `INSTANCE_SWAP` properties (Button destructive ×2, _Button group base, 3 App-navigation bases, Modal `Drawer content`; none on the core Button or Input field).

**Scope of the unbound scan:** solid fills, solid strokes and text-style presence on each component's own layers (nested instances excluded). Spacing, radius and effect bindings were **not** scanned per component (UNVERIFIED). That's Phase 1 task P1-03.

### 2.4 Variables and styles (VERIFIED, unchanged since 2026-11-08 audit)

| Collection | Modes | Vars |
|---|---|---|
| `_Primitives` (hidden) | Style | 309 |
| `1. Color modes` | Light mode, Dark mode | 292 (121 core semantic + 171 component colours) |
| `2. Radius` | Mode 1 | 12 (raw numbers) |
| `3. Spacing` | Mode 1 | 17 |
| `4. Widths` | Mode 1 | 12 |
| `5. Containers` | Value | 3 |
| `6. Typography` | Value | 36 |

- **681 variables; 0 with code syntax; 288 with `ALL_SCOPES`** (new finding: pollutes every property picker and gives agents no scope signal).
- Styles: 393 paint (364 bound), 65 text, 25 effect, 8 grid.

### 2.5 Token registry (last recorded state; live repo **UNVERIFIED**)

Per `INVENTORY.md` (2026-11-08): approved 118 primitives (32 spacing, 11 radius, 63 colour, 1 a11y colour, 11 typography), 8 semantic typography, 11 semantic colours per mode (light/dark). Proposal 0006 (login component tokens) is under review. ADR-0002 notes that approved token files existed locally on Mike's Mac and GitHub had docs and proposals up to `48ca779`. **Whether `tokens/` has since been pushed is unverified.**

---

## 3. Token architecture assessment

| Area | Finding | Status |
|---|---|---|
| Tiering in Figma | Already primitive → semantic (`_Primitives` hidden → `1. Color modes`). Plus a 3rd **component tier** (171 component colours, e.g. utility, alpha and per-component) | VERIFIED |
| Tiering in registry | `primitives/` → `semantic/` → `themes/{light,dark}/`. The themes folder is the semantic tier's per-mode values, so this **is** the two-tier model with modes | VERIFIED (docs) |
| Naming | Untitled UI semantic names are already Tailwind-shaped (`bg-primary`, `text-tertiary`). Normalisation rules are in ADR-0004 (parenthetical shades, `_` → `-`, run-together words) | APPROVED (ADR-0004) |
| Values | Preserve Figma colour values as custom primitives; Tailwind is naming/integration foundation. Spacing = Tailwind (identical). Radius = Tailwind names **and** values; 10px/20px flagged | APPROVED (ADR-0005 amendment, ADR-0006) |
| Duplicates | Separate `Gray (light)`, `Gray (dark)`, `Gray (dark alpha)` families; several Untitled palettes exist only as legacy paint styles (Gray blue/cool/neutral/true/warm, Moss, Teal, Indigo, Violet, Fuchsia) | VERIFIED |
| Hardcoded values | Radius collection holds raw numbers, not primitive aliases; font weights are strings ("Semibold") | VERIFIED |
| Stale / broken | `focus-ring-error` uses unbound `#f04438` (old Untitled red) instead of `#ff0466`. Text style "Display xs" is 18px but `display-xs` variable is 28px; "Display sm" line height bound to the wrong variable; paragraph spacing bound to font-size variables | VERIFIED (2026-11-08) |
| Circular references | None detected in the 2026-11-08 checksum-verified extraction; the registry validator rejects cycles | VERIFIED (registry) / no evidence of any in Figma |
| Light/dark | Dark `bg-primary` is pure black; `text-brand-primary` unchanged in dark (4.02:1, fails); all dark shadows transparent (ADR-0007: keep flat during pilot) | VERIFIED / APPROVED |
| Accessibility | Light: error text 3.85, warning 2.35, success 2.76, primary hover 3.82, input border 1.44 — all corrected in the registry via semantic remaps (ADR-0008) | APPROVED |
| Code syntax | 0 variables have `codeSyntax.WEB`; Dev Mode can't show class names | VERIFIED |
| Scopes | 288 variables on `ALL_SCOPES` | VERIFIED |
| Figma ↔ code naming conflicts | Radius (`md` = 8 in Figma, 6 in Tailwind); font size `text-md` vs `base`; `gray` collides with Tailwind default gray (ADR-0009 pending) | VERIFIED |
| Tailwind default palette | Not decided; adapters must not override defaults globally | PENDING (ADR-0009, devs) |
| Token format | DTCG 2025.10, sRGB + hex, px dimensions — provisional | PROPOSED (ADR-0003, devs) |

**Assessment:** The token *architecture* is sound and largely decided. The open risk is the **Figma ↔ registry relationship.** The registry is canonical (ADR-0001/0010) but the library's variables still carry legacy names and values. Screens built in Figma bind to Figma variables, not registry tokens. A sync direction must be chosen before Phase 3 (D-03).

---

## 4. Component architecture findings

### 4.1 Cross-cutting findings

| # | Finding | Impact on AI generation | Evidence |
|---|---|---|---|
| C-1 | **No TEXT properties** on Button, Input field, Checkbox, Modal header, Alert, Badge, Tag… | Agents must edit nested text by index; fragile across variant switches | VERIFIED (live) + Figma pilot F4 |
| C-2 | **Core Button icons aren't parent-swappable.** `Show L/R icon` booleans toggle a nested `Icon wrapper` (remote, MAKER Icon library); the swap property `Icon` lives on that nested instance, which is **not exposed** (`isExposedInstance = false`) | Icon swaps require deep traversal; designers can't swap from the Button's panel | VERIFIED (live, Primary md, all 5 states) |
| C-3 | Button destructive *does* have parent-level swaps, but their default is a **local "placeholder"** component with **0 preferred values**, so it isn't tied to the icon library | Inconsistent icon model between Button and Button destructive | VERIFIED |
| C-4 | **15 single-option variant axes** (Toggle Type/Text, _Toggle base Type, _Modal header Type, Select Size, Dropdown Type, Tag Icon, Avatar label group Status icon, Header nav Open/Style, Progress circle Shape, Verification Digits, Modal actions Destructive/Breakpoint, Modal Type) | Misleading props; code mapping generates dead enums | VERIFIED |
| C-5 | **No mobile Pressed state.** Only Hover (pointer-only). `Button action` uses `onTap`, a different convention | Mobile-first gap; inconsistent state naming | VERIFIED; LOGIN-SPECS adds Pressed |
| C-6 | **Size scales don't align:** Button xxs/sm/md/lg vs Input field lg/sm (no md) | Mismatched rows in forms | VERIFIED |
| C-7 | **Missing components:** no generic Card; `_Page headline and support text` and nav header `Status` are used in published screens but **not importable** (unpublished/private); no auth layout; Empty states page is empty; status bar and home indicator come from iOS community kits and are **not mode-aware** | AI must hand-build or skip these | VERIFIED (live + Figma pilot F1, F3) |
| C-8 | **Variant switch can drop a layer:** `setProperties({Destructive: True})` on a cloned Input field with a hidden helper produced an instance missing "Helper text" | Silent structural defect | VERIFIED (Figma pilot F2) |
| C-9 | Secondary button = tinted ghost without border in Figma; our spec says a 1.5px brand border | Spec vs Figma disagreement | VERIFIED (Figma pilot F7) |
| C-10 | No component descriptions on the audited sets | Agents get no usage guidance from Figma | VERIFIED (Buttons page) |

### 4.2 Classification (PROPOSED)

| Classification | Components |
|---|---|
| **KEEP** | Buttons/Button icon, Button loading icon, _Button group base, Button group, Navigation button group, Tab/filter sets, Radio / Checkbox, _Checkbox base, Radio group item/group, Avatar family, Tooltip, Help icon, Helper text, _Input title, Select, Slider, _Control handle, Navigator, _Indicator, _Nav item base/button, Loading indicator, Textelement, Divider, Background overlay, Spacer, Illustration wrapper, Virtual/Physical card |
| **OPTIMIZE** | **Buttons/Button** (TEXT label prop; parent-level icon swap; Pressed state; bind spinner), **Input field** (TEXT props for label/placeholder/hint; Hover/Pressed; md size; parent-level icon swap; F2 guard), Badge (icon swap), _Dropdown list item (Icon variant → boolean + swap), Toggle (remove single-option axes), _Modal header (TEXT props), _Modal actions (remove single-option axes), Alert (TEXT props, icon swap), Progress bar (33-option Progress axis → review for code) |
| **SLOT** | **Modal** (`Drawer content` legacy slot → native slot), Dropdown (menu content), Header navigation (actions region), Alert (actions region, optional), **new Card** (content region) |
| **REPAIR** | Buttons/Button destructive (no Disabled state; local placeholder swap default), Tag count (4 unstyled text nodes), Textarea input field (3 unbound fills), _Nav featured card / _Application nav menu button (unbound fill/stroke), Social button (6 unbound fills; acceptable if brand logos), text styles listed in §3, `focus-ring-error` stale colour, legacy `Slot` component (deprecate after native slots) |
| **REVIEW** (design decision) | Social button + groups (is social sign-in in scope?), Verification code (needed for OTP/2FA? only 4 digits), Mobile app store badge (marketing only?), Button action / Button navigation (overlap with Button; `onTap`), Date pickers (desktop-heavy), _Nav featured card / account card (desktop SaaS patterns), _Mega input field base, Secondary button border (C-9), component colour tier (171 vars) |

Recommendation principle: only change a component when it improves maintainability, reliability, usability or automation. Most KEEP items are left untouched even where minor polish is possible.

---

## 5. Figma Slots candidates

### 5.1 Feasibility (verified from official docs, 2026-11-09)

| Check | Result | Status |
|---|---|---|
| 1. Figma support | Slots are documented for **all plans**, publishable to libraries; no beta label. Publishing library updates needs a paid plan (MAKE already publishes team libraries) | VERIFIED (docs) |
| 2. API operations | Plugin API has `ComponentPropertyType 'SLOT'`, `ComponentNode.createSlot()`, `SlotNode` (`resetSlot()`, `limitViolations`), `SlotSettings` (`minChildren`, `maxChildren`, `allowPreferredValuesOnly`, …). Filling uses generic `appendChild`/`insertChild`. The help article says "**MCP support is coming soon**" | VERIFIED (docs); **behaviour through `use_figma` on MAKER DS is UNTESTED** |
| 3. Linkage preserved | Unknown until tested on the duplicate. Docs: removing a slot property from a main **resets slot content in instances** | UNVERIFIED |
| 4. Migration risks | Can't put a slot on a component's top-level layer; component properties can't be applied to layers inside a slot (moving a layer in removes its property); slot layout is only editable on the main; limit violations warn but don't throw | VERIFIED (docs) |
| 5. Regression tests | Defined in §8 / R-SLOT-01 | PROPOSED |
| 6. Manual steps | Figma has a "Migrate a library to using slots" flow; whether it can be scripted end to end is unknown. Plan for a **manual-assisted** migration of the pilot components | UNVERIFIED |

### 5.2 Candidates (PROPOSED)

| Candidate | Why a slot | Keep as-is |
|---|---|---|
| **Modal** body | Already slot-shaped (legacy `Slot` + `Drawer content` swap with 1 preferred value). Direct replacement | Header and actions stay sub-components with properties |
| **Card** content (new) | No Card exists; design it slot-native from the start | Variants for elevation/border only |
| Dropdown menu | List content is open-ended | `_Dropdown list item` stays a component |
| Header navigation actions | Varying right-side content per screen | Breakpoint variant |
| Alert actions | Optional, low priority | Color variant, booleans |

**Not slots:** Button icons (use instance swap), Input field leading content (instance swap or variant; slots would let agents put anything in a field), Checkbox/Radio, Badge, Tag.

**Order of preference preserved:** Variants for state/size · Instance swap for controlled replacement · Component properties for common customisation · Variables for style · Slots only for flexible composition.

---

## 6. Icon-library strategy

**Keep the published MAKER Icon library** (VERIFIED in use: remote `Icon wrapper` set + individual icons). No evidence supports changing it.

### 6.1 Current structure (Buttons/Button, VERIFIED)

```
Buttons/Button (variant)
├── Icon wrapper  [remote, MAKER Icon library]  visible ← "Show L icon"
│   └── squircle-dashed [remote icon]  mainComponent ← "Icon" (swap prop on Icon wrapper, not on Button)
├── Text  (no TEXT property)
└── Icon wrapper  visible ← "Show R icon"
    └── squircle-dashed  mainComponent ← "Icon"
```

The placeholder icon is `squircle-dashed`. The Figma pilot swapped it successfully to `arrow-right` by setting the nested instance's property. All instances stayed linked.

### 6.2 Proposed change (on the duplicate, Phase 2)

- **Option A (preferred, PROPOSED):** add parent-level `INSTANCE_SWAP` properties `Icon leading` / `Icon trailing` on Buttons/Button, wired to the nested `Icon wrapper → Icon`, with **preferred values from the MAKER Icon library**. Same model on Input field, Badge, Alert, _Dropdown list item. Fix Button destructive's default (local placeholder → library icon).
- **Option B:** mark the nested `Icon wrapper` instances as **exposed instances**. Cheaper; still two levels in the properties panel.

### 6.3 AI icon-swap procedure (PROPOSED for CLAUDE.md)

1. Identify the parent instance and its main component set (must be remote, from MAKER DS v2).
2. Read the parent's `componentProperties`.
3. Locate the icon `INSTANCE_SWAP` property (Option A) — or, until then, the nested `Icon wrapper` instance and its `Icon` property.
4. Resolve the target icon **by component key from the MAKER Icon library** (`importComponentByKeyAsync`). Never use a local or community icon.
5. Set the property with `setProperties`. Never detach.
6. Read back: still linked (`mainComponent.remote = true`), wrapper size unchanged, icon fill still bound to the same `fg-*` variable.
7. Verify every state of that instance's variant family that the screen uses, in Light **and** Dark (R-PAPER-01 lesson).

### 6.4 Structures that block reliable swapping

- Core Button / Input field: swap property not on the parent (C-2).
- `_Dropdown list item`: icon is a **variant** (`Icon=True/False`), not a swap.
- Badge: boolean show/hide only, no swap.
- Button destructive: swap default is a local placeholder; no preferred values.

---

## 7. Token migration proposal

The existing ADRs already define the mapping rules. This table shows the remaining **proposed** mappings for the pilot components (beyond what's APPROVED in `INVENTORY.md`). Visual impact is "none" unless stated.

| Existing token/value (Figma) | Proposed primitive | Proposed semantic token | Affected components | Visual impact | Rationale | Approval |
|---|---|---|---|---|---|---|
| `bg-brand-primary` → Brand/600 `#5656f3` (primary button fill) | `color.brand.600` (exists) | `color.bg.brand-primary` (exists) | Button Primary | None | Already approved | APPROVED (0002/0003) |
| `bg-brand-primary_hover` (3.82:1 with white) | `color.brand.700` | `color.bg.brand-primary-hover` | Button Primary hover/pressed | **Darker hover** | WCAG fix | APPROVED (ADR-0008) |
| `border-primary` 1.44:1 | `color.gray.450` (new) | `color.border.primary` | Input field | **Darker border** | 3:1 non-text | APPROVED (0002) |
| `text-error-primary` Error/500 | `color.error.600` | `color.text.error-primary` | Helper text, Input error | **Darker** | 3.85 → 5.79 | APPROVED |
| disabled bg / fg / border (Figma names to confirm in P1-04) | existing gray steps | `color.bg.disabled`, `color.fg.disabled`, `color.border.disabled-subtle` | Button, Input, Checkbox disabled | None | Needed by pilot | PROPOSED (0006) |
| brand subtle tint (Figma name to confirm in P1-04) | `color.brand.25` (new primitive) | `color.bg.brand-subtle` | Button Secondary | None | Needed by Secondary | PROPOSED (0006) |
| `border-brand` | `color.brand.500` | `color.border.brand` | Button Secondary, focus | None (if C-9 keeps no border, unused) | Depends on D-09 | PROPOSED (0006) |
| `bg-primary` (Modal surface; dark = pure black) | white / dark value per open question 6 (UNVERIFIED mapping) | `color.bg.primary` | Modal, Card | **Dark: pure black vs gray-950 — decision** | Dark surface policy | PROPOSED |
| overlay (Figma name to confirm) | gray-950 at alpha (UNVERIFIED) | `color.bg.overlay` | Modal backdrop | None | Pilot needs it | PROPOSED |
| `radius-3xl` 20px | `radius.2-5xl` (custom) | (used directly) | Button lg | None | ADR-0006 by-value mapping | APPROVED (0001) |
| `radius-2xl` 16px | `radius.2xl` | — | Button md, Modal, Card | None | By value | APPROVED |
| `spacing-xl` etc. (t-shirt) | `spacing.<n>` | not introduced (use primitives directly) | All | None | Untitled t-shirt spacing deferred | PROPOSED |
| `shadow-*` gray-950 alpha; dark = transparent | `shadow.{xs…3xl}` geometry | `color.shadow` per mode | Modal, Card, Dropdown | None (flat dark kept) | ADR-0007 | PROPOSED |
| `focus-ring-error` `#f04438` (unbound) | `color.error.500` | `color.focus-ring.error` | Input error focus | **Changes stale red to brand error** | Stale value | PROPOSED |
| 171 component colours (utility/alpha/per-component) | — | **Not migrated**; map to core semantics when a component needs them | Avatars, badges, featured cards | None | Two-tier model; avoid a component tier | PROPOSED (D-05) |
| Font weights "Semibold" (strings) | `font.weight.semibold` 600 | `typography.text.*.semibold` | All text | None | ADR-0004 | APPROVED (0005) |
| Display/Space Grotesk sizes | — | Deferred until a screen needs them | Headings | — | Growth model | APPROVED (deferral) |

Full colour-by-colour mapping lives in the repo (`audit/mapping/figma-to-tokens.md`). Claude Code regenerates it in Phase 1 against the live repo.

**Tailwind / NativeWind compatibility:** ADR-0004 naming produces normal classes (`bg-primary`, `rounded-xl`, `p-4`). Default palette not forced (ADR-0005 amendment). Global overrides stay off until ADR-0009 is decided by the devs.

---

## 8. Automation feasibility

| Opportunity | Classification | Tool | Notes |
|---|---|---|---|
| Token inventory (Figma → JSON) | **Fully automatable** | `use_figma` read script (exists: `scripts/figma-audit.js`) | Checksum-verified in M01 |
| Token migration map | **Automatable with verification** | `build-figma-mapping.mjs` | Visual changes flagged for Mike |
| Token validation / contrast | **Fully automatable** | repo validator (29/29 tests), `contrast-report.mjs` | Deterministic |
| Registry → Figma variables sync (duplicate) | **Automatable with verification** | `use_figma` script (free) or Tokens Studio Team (paid) | §9 |
| Component inventory / registry JSON | **Fully automatable** | `use_figma` read script (this audit's script) | Output to `registry/` |
| Component property optimisation (TEXT props, swaps, remove dead axes) | **Automatable with verification** | `use_figma` writes on the duplicate | Atomic writes; read-back per variant |
| Native Slot migration | **Requires manual intervention** (initially) | Figma UI migration flow + `use_figma` checks | MCP support "coming soon"; API exists but untested |
| Icon swaps on instances | **Automatable with verification** | `use_figma` `setProperties` | Procedure §6.3 |
| Figma screen extraction (for Paper/Penpot) | **Automatable with verification** | `get_design_context`, `get_metadata` | |
| Paper/Penpot handoff | **Automatable with verification** | Paper/Penpot MCP | Synthetic tokens only in Penpot so far |
| Approved-flow specification | **Automatable with verification** | Claude writes spec from approved exploration | Human approves |
| Native Figma screen assembly | **Automatable with verification** | `use_figma` + `figma-generate-design` | Proven in Figma pilot (72/72) |
| Component + token regression checks | **Fully automatable** | `use_figma` structural read-back scripts | §13 acceptance criteria |
| Visual comparison | **Automatable with verification** | `get_screenshot` + pixel diff (pngdiff / pixelmatch) | Needs approved reference images |
| Publish library update / accept in consumer | **Requires manual intervention** | Figma UI | Production-impacting; Mike only |
| Code Connect mapping | **Unsupported / untested** | Figma Code Connect | Needs app repo access (BLOCKED) |
| Documentation | **Fully automatable** | Claude | |
| AI usage & cost reporting | **Automatable with verification** | Session logs | Method used in pilots |

Deterministic scripts handle validation. AI handles architecture, visual judgement and ambiguous design calls.

---

## 9. Subscription status

**Current plan:** Unverified (assumed Free; no Tokens Studio usage recorded in the project)
**Workflow status:** Unblocked
**Paid features encountered:** None used. One **anticipated**: direct Git sync.
**Upgrade required now:** **No**
**Next anticipated subscription dependency:** Tokens Studio *direct Git sync* (Team plan), only if D-03 chooses Tokens Studio as the registry → Figma sync mechanism.

### Verified evidence (tokens.studio/pricing, read 2026-11-09)

- **Free, €0/month:** 1 editor seat, unlimited viewers, "1 project with 1 active branch", "1 theme group with 2 theme options", "1 export configuration". Also states: "Does not include Pro in Tokens Studio for Figma."
- **Team, €39/month billed annually** (extra editors €39/mo each): includes "all paid Figma plugin features", naming **"direct Git-sync"** and **"multi-dimensional theming"**. The old Pro plan has been folded into Team.
- Organization: €499/month billed annually.
- Monthly-billing price: **UNVERIFIED** (only annual figures extracted).
- Plugin-level free features (token editing, sets, variable export, DTCG import): **UNVERIFIED**. The docs plans page failed to load and the plugin wasn't tested.

### Free alternative (PROPOSED)

The registry (GitHub, DTCG) stays canonical. A Claude Code script reads `tokens/` and writes Figma **variables** in the duplicate through `use_figma` (Plugin API: create/update variables, modes, aliases, scopes, code syntax). The Figma pilot proved atomic writes and mode handling.

- **Trade-offs:** no designer-facing token UI inside Figma; designers propose changes via the repo's `proposals/` flow, not in a plugin. The sync script must be maintained.
- **Impact of not upgrading:** none on Phases 1–2. Possibly slower designer edits later.
- **Recommendation:** stay on Free. Re-evaluate after Phase 2 if designers need in-Figma token editing.

No **SUBSCRIPTION BLOCKER** is raised: no approved task currently requires a paid feature, and a free workaround exists.

---

## 10. Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| RK-01 | Accidental write to the original MAKER-DS-v2 library | Low | **Critical** | Duplicate-only rule; scripts assert file key ≠ `xJoAz66aekAToyhBmfGNt0` before any write; `updatedAt` check before/after (Figma pilot V8 method) |
| RK-02 | Variant-scope gaps (change applied to Default only) | **High** (seen in Paper, Penpot) | High | R-PAPER-01: expected vs actual counts across all states/sizes/themes |
| RK-03 | Binding changes not persisting to instances | Medium (seen in Penpot) | High | R-PENPOT-01: re-read in a fresh call after mode switch and reload |
| RK-04 | Variant switch drops layers (F2) | Medium | High | R-FIGMA-01: compare instance layer tree with its main after every `setProperties` |
| RK-05 | Slot migration resets instance content | Medium | High | Pilot on duplicate; snapshot instances; R-SLOT-01 |
| RK-06 | Registry ↔ Figma drift (two token sources) | **High** | High | D-03: one-way sync, generated mapping, CI check |
| RK-07 | Live repo state unknown from Cowork | Medium | Medium | Phase 1 P1-01 runs in Claude Code on Mike's Mac |
| RK-08 | Company design data in a personal GitHub account | Medium | Medium | Mike to confirm with MAKE (ADR-0010, open) |
| RK-09 | Tailwind default overrides break legacy screens | Medium | High | ADR-0006/0009 interim rule: no global override |
| RK-10 | Publishing the duplicate confuses consumers (two "MAKER DS" libraries) | Medium | Medium | Name it clearly (e.g. "MAKER DS v3 – WIP – do not use"); don't publish until Phase 3 approval |
| RK-11 | Slots MCP support incomplete | Medium | Medium | Manual-assisted migration for pilot; re-check docs before Phase 3 |
| RK-12 | No legacy login screenshots → fidelity can't be measured | **High** | Medium | Mike to supply references; fidelity % not claimed until then |
| RK-13 | Community kits enabled on the DS file pollute agent search | Medium | Low | Scope searches to MAKER library keys |
| RK-14 | Tokens Studio paid dependency creeps in | Low | Low | Free-first policy, blocker alert format |

---

## 11. Prioritized implementation phases (PROPOSED)

Each phase needs its own approval. Approving one does **not** approve the next.

### Phase 1 — Foundations (read-only + repo work Claude Code may do with approval)

| ID | Task | Priority |
|---|---|---|
| P1-01 | Inspect `reddddd1/design-tokens` locally: branch, remote, `tokens/` vs `proposals/`, validator passes | P0 |
| P1-02 | Generate machine-readable component registry from MAKER-DS-v2 (read-only) into `registry/components.json` | P0 |
| P1-03 | Extend the read-only scan to spacing, radius, effect and text-style bindings per component | P1 |
| P1-04 | Regenerate Figma → registry token mapping against the live repo | P1 |
| P1-05 | Build regression scripts R-PAPER-01, R-PENPOT-01, R-FIGMA-01, R-SLOT-01 as read-only checkers | P0 |
| P1-06 | Decide Proposal 0006 (login component tokens) | P1 (Mike) |

### Phase 2 — Component pilot (duplicate only)

| ID | Task |
|---|---|
| P2-01 | Create the duplicate (Mike), record its file key |
| P2-02 | Buttons/Button: TEXT label prop, parent icon swaps with library preferred values, Pressed state, spinner binding |
| P2-03 | Input field: TEXT props (label, placeholder, hint), icon swap, Hover/Pressed, decision on md size |
| P2-04 | Modal: legacy `Slot` → native slot for body |
| P2-05 | Card: build slot-native (if D-07 approves) |
| P2-06 | Run the full regression suite; publish nothing |

### Phase 3 — Controlled migration (duplicate)

Remaining OPTIMIZE/REPAIR items in §4.2, single-option axis clean-up, variable scopes and code syntax, registry → Figma sync, then a decision on publishing.

### Phase 4 — Screen automation

Approved-flow spec format → native Figma assembly pipeline → regression + visual diff → cost reporting.

---

## 12. Pilot component recommendations

| Pilot | Figma source | What it proves | Key checks |
|---|---|---|---|
| **Button** | Buttons/Button (118 variants) | TEXT props, parent icon swap, new state across 4 hierarchies × 4 sizes × 6 states | R-PAPER-01 (all states get the change), icon procedure §6.3, contrast |
| **Text Field** | Input field (53 variants) | TEXT props on a complex set, new states, layer integrity on variant switch | R-FIGMA-01, error/destructive, Password type |
| **Modal** | Modal + _Modal header/actions | Native slot replacing legacy slot | R-SLOT-01, instance content survives |
| **Card** | **None exists** | Slot-native new component | Needs D-07; if rejected, substitute **Alert** (actions region) |

Login screens from the Figma pilot (10 screens, scratch file) become the consumer test bed: after each pilot change, the same screens are re-pointed to the duplicate and re-validated.

---

## 13. Acceptance criteria

### Permanent regression scenarios

| ID | Origin | Test |
|---|---|---|
| **R-PAPER-01** | Paper pilot: arrows added to primary buttons reached Default but missed Hover, Focus and Disabled | For any change scoped to a set, list every variant in scope (all states, sizes, themes). **Expected count = actual count**; any variant missing the change fails |
| **R-PENPOT-01** | Penpot pilot: master change didn't persist across instances after theme refresh (gap binding reverted 5/6) | After every main-level change: switch mode Light → Dark → Light, re-read every instance **value and binding** in a fresh call; after reload where practical |
| R-FIGMA-01 | Figma pilot F2 | After every `setProperties`, compare instance layer tree with its main component's; missing or extra layers fail |
| R-SLOT-01 | New | After slot migration: instance count unchanged, slot content preserved per instance, `limitViolations` empty, instances still linked |

### Criteria for every structural change

1. Inventory of affected variants/states/sizes/themes/instances.
2. Expected affected count recorded before the change.
3. Actual count from structural read-back equals expected.
4. Visual comparison against the pre-change screenshot (pixel diff; changes only where intended).
5. Linkage: 100% of instances remote/linked; 0 detached.
6. Token bindings: 100% of required properties bound; 0 raw values introduced.
7. Icons from MAKER Icon library only; size/alignment/colour binding unchanged.
8. Light and Dark both verified.
9. Persistence: re-read in a separate call; after file reload where practical.
10. Original library `updatedAt` unchanged.

Visual similarity alone is never accepted as proof. Fidelity target ~95–98% applies only once approved reference images exist.

---

## 14. Unresolved questions

1. What is the live state of `reddddd1/design-tokens` (are approved `tokens/` pushed)?
2. Has MAKE approved company design data in a personal GitHub account?
3. Is social sign-in in scope for login (Social button sets)?
4. Is OTP/2FA needed (Verification code, only 4 digits)?
5. Should Secondary button have a border (C-9)?
6. Dark surface: pure black (current) or gray-950?
7. Should the 171 component-level colours be dropped or mapped to core semantics?
8. Who can publish library updates, and on which Figma plan/seat?
9. App framework versions (Tailwind, NativeWind, RN) and ADR-0009 (default palette) — dev input.
10. Legacy login screenshots for fidelity measurement.
11. MAKER Icon library file key and owner.
12. Is "Primary_alt" Button hierarchy still used?

---

## 15. Decisions requiring Mike's approval

| ID | Decision | Recommendation |
|---|---|---|
| **D-01** | Amend ADR-0005: allow refactoring in an approved **duplicate** of MAKER-DS-v2 (original stays read-only) | Approve |
| **D-02** | Create the duplicate (Mike does it in Figma); naming and "do not use" labelling | Approve; name "MAKER DS v3 – WIP" |
| **D-03** | Registry → Figma sync mechanism: **scripted `use_figma` sync (free)** vs Tokens Studio Team (paid) | Scripted, free |
| **D-04** | Component API changes on Button and Input field: TEXT props, parent icon swaps, Pressed state | Approve for Phase 2 |
| **D-05** | Don't migrate the 171 component colours; map on demand to core semantics | Approve |
| **D-06** | Native slots for Modal body (Phase 2), Dropdown/Header/Card later | Approve Modal only for now |
| **D-07** | Create a new slot-native Card component (or substitute Alert in the pilot) | Approve new Card |
| **D-08** | Remove 15 single-option variant axes in the duplicate | Approve for Phase 3 |
| **D-09** | Secondary button border (C-9) | Design call |
| **D-10** | Set variable scopes and `codeSyntax.WEB` on the duplicate's variables | Approve for Phase 3 |
| **D-11** | Stay on Tokens Studio Free | Approve |
| **D-12** | Approve **Phase 1** for the Claude Code handoff (Phases 2–4 approved separately) | Approve Phase 1 only |

**STOP.** No handoff package will be created until Mike approves all or part of this plan. If only part is approved, the handoff covers that scope only.
