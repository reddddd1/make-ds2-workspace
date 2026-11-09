# Pilot plan — Alert (P1-12, D-07: Alert replaces Card)

> **Status: PLAN ONLY — APPROVED FOR PLANNING (D-07).** No Figma change. All changes are for the **verified duplicate** in an approved Phase 2; the original `xJoAz66aekAToyhBmfGNt0` is never edited. Labels: **VERIFIED** (read 2026-11-09; evidence in `reports/P1-12-alert/`), **PROPOSED**, **UNVERIFIED**, **DECISION** (Mike). No token-repo spec exists for Alert yet (`specs/components/` has button, checkbox, link, text-field).

## 1. Current state (VERIFIED)

```
Alert (set 1130:81134) — 4 variants: Color = Default | Brand | Error | Success · 358×152 · vertical auto layout
├── Content (frame)
│   ├── Featured icon (remote instance, set 845127…)       visible ← "Show icon"
│   │   └── Icon wrapper › squircle-dashed (placeholder glyph)
│   └── wrapper (frame, gap 12 px — unbound)
│       ├── Text and supporting text (frame)
│       │   ├── Text "{Title}"                Text md/Medium · text-primary
│       │   └── Supporting text "{Text Lorem…}"  Text sm/Regular · text-secondary   visible ← "Supporting text"
│       └── Actions (frame)                                     visible ← "Actions"
│           ├── Buttons/Button md Link brand  label override "Secondary action"
│           └── Buttons/Button md Link brand  label override "Main action"
└── Icon wrapper (remote, glyph `x`)                            visible ← "Show close?"
Surface: fill bg-primary_alt, border border-primary, stroke width 1 px (unbound)
```

- Properties: BOOLEAN `Actions`, `Supporting text`, `Show icon`, `Show close?` + VARIANT `Color`. **No TEXT, no INSTANCE_SWAP.**
- **The `Color` variant only changes the Featured icon.** Surface, border and text are identical in all 4 variants.
- **Defect: `Color=Error` uses Featured icon `Color=Brand`** (purple brand icon on an error alert). P1-08 already showed Brand and Error with identical hashes. The Featured icon set offers `Brand | Gray | Success | Needs attention | Critical`.
- Featured icon `Color=Gray` draws a **purple** glyph (`fg-brand-secondary_alt`). All Featured icon colours come from **remote variables** of the library that owns Featured icon (UNVERIFIED which library).
- Every Alert shows the **placeholder glyph `squircle-dashed`**; the glyph sits two levels deep (`Featured icon › Icon wrapper › Icon`) and is not swappable from Alert.
- From P1-05: content-wrapper gap **12 px unbound** (×4; `spacing-lg` = 12 exists), border width **1 px unbound** (×4; no border-width token until proposal 0006).
- **Usage: 0 instances** in the library, 0 in the pilot scratch file. Other team files: UNVERIFIED (Library analytics).

## 2. Contrast per colour (VERIFIED computation, WCAG 2.2, ratios truncated — ADR-0008)

| Pair | Requirement | Light | Dark | After approved token remap (P1-09) |
|---|---|---|---|---|
| Title `text-primary` on surface | 4.5:1 | 19.45 ✓ | 16.92 ✓ | — |
| Supporting `text-secondary` on surface | 4.5:1 | 9.46 ✓ | 11.63 ✓ | — |
| Action label `text-brand-primary` on surface | 4.5:1 | 5.22 ✓ | **3.47 ✗** | dark → brand.400: **6.48 ✓** |
| Border `border-primary` vs surface | 3:1 only if the border identifies the alert | 1.44 | 1.59 | gray.450 / gray-dark.600: 3.28 / 3.09 ✓ |
| Featured icon **Brand** glyph on its container | 3:1 (non-text) | 4.74 ✓ | 3.46 ✓ | — |
| Featured icon **Gray** glyph on its container | 3:1 | **2.56 ✗** | 5.41 ✓ | not in registry (remote) |
| Featured icon **Success** glyph on its container | 3:1 | **2.47 ✗** | **1.92 ✗** | not in registry (remote) |

The alert's meaning is carried by its title text, so the icon can be treated as decorative (no 3:1 requirement) **or** as a status indicator (3:1 required). **DECISION.** The Featured icon colours belong to another library; fixing them there is outside this project's scope (report to its owner) — or the Alert uses its own icon container (§3.3, option b).

## 3. Proposed changes (PROPOSED)

### 3.1 TEXT properties

| Property | Bound to | Default | Variants |
|---|---|---|---|
| `Title` | `Text` | `Alert title` (DECISION) | 4 / 4 |
| `Description` | `Supporting text` (keeps its `Supporting text` visibility boolean, renamed `Show description` — DECISION) | `Supporting text` | 4 / 4 |

### 3.2 Colour semantics

| Alert `Color` | Featured icon `Color` today | Proposed |
|---|---|---|
| Default | Gray | Gray |
| Brand | Brand | Brand |
| **Error** | **Brand (defect)** | **Critical** — visible change, DECISION |
| Success | Success | Success |
| *(new)* Warning | — | `Needs attention` — optional new variant (4 → 5), DECISION |

Surface stays neutral for all colours (current design). A tinted surface per colour would be a design change (DECISION, not proposed).

### 3.3 Icon swap

- **(a) Expose nested instances (recommended first):** mark `Featured icon` exposed on all 4 variants. **UNVERIFIED** whether Featured icon exposes its own inner `Icon wrapper` (owned by the remote library); if not, the glyph stays out of reach from Alert.
- **(b) Local icon container:** replace the remote Featured icon with a local frame + `Icon wrapper` (MAKER Icon library), bound to semantic tokens per colour — gives a swappable glyph and contrast control. Structural change on 4 variants; DECISION.
- Close button: keep (`x` from the Icon library).

### 3.4 Actions region — Slot or not (uses P1-11)

**Not a Slot (recommended).** Actions are controlled (0–2 Link-brand buttons); slots are for open composition (`docs/slots-strategy.md`), MCP read support for slot content is still incomplete (P1-11), and component properties cannot live inside a slot. Instead: mark the two action buttons as **exposed instances** so their properties (and the P1-10 `Label` TEXT property once it exists) are editable from the Alert instance; keep the `Actions` boolean.

### 3.5 Token bindings

| Item | Change | Visual impact |
|---|---|---|
| Content-wrapper gap 12 px | bind `3. Spacing/spacing-lg` (12) | none |
| Border width 1 px | bind `border-width.1` when proposal 0006 is approved | none |
| Border colour / dark action label | follow the approved token remap (P1-09 `update-alias` rows) | darker border; lighter dark-mode action label |

## 4. Expected counts (R-PAPER-01 scopes)

| Change | In scope (must change) | Out of scope (unchanged) | Variants after |
|---|---|---|---|
| `Title` / `Description` TEXT props | 4 | 0 | 4 |
| Error → Critical icon | 1 (`Color=Error`) | 3 | 4 |
| Expose Featured icon + action buttons | 4 | 0 | 4 |
| Gap binding | 4 | 0 | 4 |
| Optional `Color=Warning` | +1 new | 4 | 5 |

Instance level: none today (0 instances). Re-check Library analytics before Phase 2.

## 5. Regression checks

Prerequisites E1/E2 (P1-10) — property references and exposure in the variant hash; text content per instance.
Per change: baseline `collect-variants` (Alert, Featured icon not editable), change on the duplicate, fresh `collect-variants` with the §4 scope spec (`allowPropDefsChange: ["Alert"]` for property changes, `allowAdded` for Warning), R-FIGMA-01 on a test instance placed on a scratch page of the duplicate, R-PENPOT-01 Light/Dark values for every binding, icon source (library only), Light + Dark screenshots of all variants. Recompute the §2 contrast table after any colour change.

## 6. Decisions requested

1. Fix `Color=Error` → Featured icon `Critical` (visible change).
2. Add `Color=Warning` (`Needs attention`)?
3. Is the alert icon decorative or a status indicator (decides whether Gray/Success glyph contrast must reach 3:1)?
4. Icon approach: expose Featured icon (a) or local icon container (b).
5. Default texts for `Title` / `Description`.
