# Component guidelines

> **Decision status (2026-11-09):** classifications are PROPOSED. Button + Input changes approved for **planning only** (D-04). Alert replaces Card as the 4th pilot (D-07). Single-option axis removal deferred (D-08). Secondary border deferred (D-09). No component edits in Phase 1.

### 4. Component architecture findings

#### 4.1 Cross-cutting findings

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

#### 4.2 Classification (PROPOSED)

| Classification | Components |
|---|---|
| **KEEP** | Buttons/Button icon, Button loading icon, _Button group base, Button group, Navigation button group, Tab/filter sets, Radio / Checkbox, _Checkbox base, Radio group item/group, Avatar family, Tooltip, Help icon, Helper text, _Input title, Select, Slider, _Control handle, Navigator, _Indicator, _Nav item base/button, Loading indicator, Textelement, Divider, Background overlay, Spacer, Illustration wrapper, Virtual/Physical card |
| **OPTIMIZE** | **Buttons/Button** (TEXT label prop; parent-level icon swap; Pressed state; bind spinner), **Input field** (TEXT props for label/placeholder/hint; Hover/Pressed; md size; parent-level icon swap; F2 guard), Badge (icon swap), _Dropdown list item (Icon variant → boolean + swap), Toggle (remove single-option axes), _Modal header (TEXT props), _Modal actions (remove single-option axes), Alert (TEXT props, icon swap), Progress bar (33-option Progress axis → review for code) |
| **SLOT** | **Modal** (`Drawer content` legacy slot → native slot), Dropdown (menu content), Header navigation (actions region), Alert (actions region, optional), **new Card** (content region) |
| **REPAIR** | Buttons/Button destructive (no Disabled state; local placeholder swap default), Tag count (4 unstyled text nodes), Textarea input field (3 unbound fills), _Nav featured card / _Application nav menu button (unbound fill/stroke), Social button (6 unbound fills; acceptable if brand logos), text styles listed in §3, `focus-ring-error` stale colour, legacy `Slot` component (deprecate after native slots) |
| **REVIEW** (design decision) | Social button + groups (is social sign-in in scope?), Verification code (needed for OTP/2FA? only 4 digits), Mobile app store badge (marketing only?), Button action / Button navigation (overlap with Button; `onTap`), Date pickers (desktop-heavy), _Nav featured card / account card (desktop SaaS patterns), _Mega input field base, Secondary button border (C-9), component colour tier (171 vars) |

Recommendation principle: only change a component when it improves maintainability, reliability, usability or automation. Most KEEP items are left untouched even where minor polish is possible.
