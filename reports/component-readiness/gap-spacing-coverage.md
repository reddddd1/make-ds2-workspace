# Gap and spacing token coverage — login components (read-only audit)

> 2026-11-10, duplicate `PpnTy1pkB2FTZFq6i6seSy`. Script: `scripts/components/gap-spacing-audit.js` (read-only). Data: `gap-spacing-audit.json`.
>
> - **Scope:** every Auto Layout frame on the own layers of Button, Input field, Alert, Modal, `_Modal header` and `_Modal actions`. Nested instances are excluded; they belong to their own component.
> - **Sections 1–4 are the read-only audit before D-G1.** Section 5 has the state after D-G1 (2026-11-10). `gap-spacing-audit.json` now holds the after-read; the before-read is `../D-G1-spacing/gap-spacing-audit-before.json`.

## 1. Classification

Each `itemSpacing` (gap), wrap `counterAxisSpacing` (gap) and `padding*` value is classified:

- **semantic:** bound to a `3. Spacing` variable (`spacing-xs`, `spacing-md` …);
- **primitive:** bound to `_Primitives`;
- **remote:** bound to another library;
- **hardcoded:** unbound and > 0;
- **zero:** unbound 0;
- **auto:** `SPACE_BETWEEN`.

| Component | Frames | Gaps: semantic / primitive / remote / **hardcoded** / zero | Paddings: semantic / primitive / remote / **hardcoded** / zero |
|---|---|---|---|
| Button | 222 | 96 / 0 / 0 / **0** / 126 | 492 / 0 / 0 / **156** / 240 |
| Input field | 313 | 252 / 0 / 0 / **46** / 15 | 418 / 0 / 0 / **0** / 834 |
| Alert | 20 | 20 / 0 / 0 / **0** / 0 | 20 / 0 / 0 / **0** / 60 |
| Modal | 3 | 0 / 0 / 0 / **0** / 3 | 6 / 0 / 0 / **0** / 6 |
| `_Modal header` | 6 | 3 / 0 / 0 / **1** / 2 | 3 / 0 / 0 / **0** / 21 |
| `_Modal actions` | 10 | 4 / 0 / 0 / **0** / 6 | 18 / 0 / 0 / **0** / 22 |
| **Total** | 574 | 375 / **0** / **0** / **47** / 152 | 957 / **0** / **0** / **156** / 1,183 |

- **Coverage of non-zero values:** gaps **369 / 416 = 89 %** bound; paddings **894 / 1,050 = 85 %** bound. Every binding uses the **semantic** `3. Spacing` collection. There are **no primitive or remote spacing bindings**.
- **Minor inconsistency (harmless):** some 0 values are bound to `spacing-none`, others are unbound. Unbound 0 is accepted (no token needed).

## 2. Missing bindings (all hardcoded values)

| # | Where | Field | Value | Count | Existing token? | Fix |
|---|---|---|---|---|---|---|
| M1 | Input field `…/Content/wrapper` (Leading icon, sm Default, Payment) | gap | **6** | 5 | **Yes:** `spacing-sm` (6) | Bind to `spacing-sm`. No new token, no visual change |
| M2 | Input field `optional` tag wrapper | gap | **10** | 41 | **No** (scale has 8 and 12) | Needs decision D-G1 |
| M3 | `_Modal header` `Content/wrapper` | gap | **10** | 1 | **No** | Needs decision D-G1 |
| M4 | Button root, md size | padding top/bottom | **10** | 120 | **No** | Needs decision D-G1 |
| M5 | Button root, md size | padding left/right | **14** | 36 | **No** | Needs decision D-G1 |

**10 px and 14 px exist nowhere in the system:** not in the registry (`spacing.*` has 0.5, 1, 1.5, 2, 3 … but no 2.5 / 3.5), not in Figma `_Primitives`, not in `3. Spacing`. They are inherited Untitled UI values (button md = 10 × 14).

### Decision D-G1: 10 px and 14 px (needs approval; nothing implemented)

| Option | What | Values / layout | Token change |
|---|---|---|---|
| **A (recommended)** | Add the two Tailwind-standard steps `spacing.2_5` (10 px) and `spacing.3_5` (14 px) to the registry, and as Figma primitives (`spacing/2_5`, `spacing/3_5`, convention §8). Bind M2–M5 to them | Unchanged | 2 registry tokens + 2 Figma variables. Code classes are standard `p-2.5` / `px-3.5`, no custom names |
| B | Accept M2–M5 as documented exceptions | Unchanged | None; criterion G2 then counts them as exceptions |
| C | Snap to the scale (10 → 8 or 12, 14 → 12 or 16) | **Changes** Button and Input layout | None; rejected by "preserve existing values" |

## 3. Semantic gap vocabulary (`gap-tight` / `gap-default` / `gap-loose`)

Non-zero gaps in use, by value (bound + hardcoded):

| Value | Bound to | Count | Typical role |
|---|---|---|---|
| 2 | `spacing-xxs` | 16 | Text padding wrappers inside Button |
| **4** | `spacing-xs` | **85** | Icon ↔ label (Button, Input), title ↔ description (Alert) |
| **6** | `spacing-sm` (+5 hardcoded) | **202** | Label ↔ control ↔ helper stack (Input field), sm Button icon gap |
| 8 | `spacing-md` | 53 | Input content row, md Button, Modal action buttons |
| 10 | hardcoded | 42 | Optional tag, Modal header text block |
| **12** | `spacing-lg` | **13** | Between content blocks (Alert content, Modal actions) |
| 16 | `spacing-xl` | 5 | Featured icon ↔ content (Alert), Modal header |

**Assessment:** a role vocabulary is only *partly* justified by actual usage:

- **For:** three clusters carry clear roles. Inside a control (4), stacking a field's parts (6), and between content blocks (12) together cover **300 of 416** non-zero gaps (72 %).
- **Against:**
  1. All bound gaps already use the semantic `3. Spacing` layer. Role names would add a *third* name for the same value (primitive → t-shirt → role).
  2. 8 px (53 uses) and 2/16 px fall outside the three roles, so `spacing-*` stays needed anyway.
  3. The registry deliberately has no `3. Spacing` tier ("use primitives directly"; code uses `gap-1`, `gap-1.5`, `gap-3`), so a role layer would exist only in Figma.

**Recommendation:** do **not** add `gap-tight` / `gap-default` / `gap-loose` now. Keep `3. Spacing` as the semantic gap layer and close M1–M5 instead. If you want role names for designers anyway, the minimal mapping is below. It is value-preserving, Figma-only, and done as aliases (no rebinding needed until components adopt them; approval required):

| Role alias | → | Value | Use |
|---|---|---|---|
| `gap-tight` | `spacing-xs` | 4 | Within a control: icon ↔ label, title ↔ description |
| `gap-default` | `spacing-sm` | 6 | Between a field's parts: label ↔ control ↔ helper |
| `gap-loose` | `spacing-lg` | 12 | Between content blocks |

## 4. Gap coverage against the login-component readiness criteria (before D-G1)

Criteria G1–G4: `reports/component-readiness-status.md` §6.

| Component | G1 bound | G2 no primitive / remote | Result |
|---|---|---|---|
| Alert | ✅ | ✅ | **PASS** |
| Modal | ✅ | ✅ | **PASS** |
| `_Modal actions` | ✅ | ✅ | **PASS** |
| `_Modal header` | ❌ 1 (M3, 10 px) | ✅ | **OPEN**, D-G1 |
| Input field | ❌ 46 (M1 bindable now; M2 10 px) | ✅ | **OPEN**, M1 + D-G1 |
| Button | ❌ 156 (M4/M5, 10/14 px padding) | ✅ | **OPEN**, D-G1 |

## 5. After D-G1 (2026-11-10): all resolved

Option A was approved and applied on the duplicate; details in `../D-G1-spacing/README.md`.

| # | Fix | Count |
|---|---|---|
| M1 | 6px → `spacing-sm` | 5 |
| M2, M3, M4 | 10px → new `spacing-2_5` (→ `spacing/2_5`, registry `spacing.2_5`) | 41 + 1 + 120 |
| M5 | 14px → new `spacing-3_5` (→ `spacing/3_5`, registry `spacing.3_5`) | 36 |

Correction: 12 of the 120 M4 paddings are on **lg Secondary** Buttons, not md.

| Component | G1 bound | G2 no primitive / remote | Result |
|---|---|---|---|
| Button | ✅ (648 / 648 non-zero paddings) | ✅ | **PASS** |
| Input field | ✅ (298 / 298 non-zero gaps) | ✅ | **PASS** |
| `_Modal header` | ✅ | ✅ | **PASS** |
| Alert, Modal, `_Modal actions` | ✅ | ✅ | **PASS** |

**Totals:**

- hardcoded gaps 47 → **0**;
- hardcoded paddings 156 → **0**;
- non-zero coverage: gaps **100 %**, paddings **100 %**, all bound to `3. Spacing`.

**Regression:** pixel-identical (Light; spacing is mode-less) and every instance size unchanged. Role names (`gap-tight` …) were not added.

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
