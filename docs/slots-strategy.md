# Figma Slots strategy

> **Decision status (2026-11-09):** Modal body is the first native-Slot candidate, **approved for planning only** (D-06). Verify API/MCP support read-only (P1-11). No slot creation in Phase 1. Card rows are superseded: no new Card now (D-07).

### 5. Figma Slots candidates

#### 5.1 Feasibility (verified from official docs, 2026-11-09)

| Check | Result | Status |
|---|---|---|
| 1. Figma support | Slots are documented for **all plans**, publishable to libraries; no beta label. Publishing library updates needs a paid plan (MAKE already publishes team libraries) | VERIFIED (docs) |
| 2. API operations | Plugin API has `ComponentPropertyType 'SLOT'`, `ComponentNode.createSlot()`, `SlotNode` (`resetSlot()`, `limitViolations`), `SlotSettings` (`minChildren`, `maxChildren`, `allowPreferredValuesOnly`, …). Filling uses generic `appendChild`/`insertChild`. The help article says "**MCP support is coming soon**" | VERIFIED (docs); **behaviour through `use_figma` on MAKER DS is UNTESTED** |
| 3. Linkage preserved | Unknown until tested on the duplicate. Docs: removing a slot property from a main **resets slot content in instances** | UNVERIFIED |
| 4. Migration risks | Can't put a slot on a component's top-level layer; component properties can't be applied to layers inside a slot (moving a layer in removes its property); slot layout is only editable on the main; limit violations warn but don't throw | VERIFIED (docs) |
| 5. Regression tests | Defined in §8 / R-SLOT-01 | PROPOSED |
| 6. Manual steps | Figma has a "Migrate a library to using slots" flow; whether it can be scripted end to end is unknown. Plan for a **manual-assisted** migration of the pilot components | UNVERIFIED |

#### 5.2 Candidates (PROPOSED)

| Candidate | Why a slot | Keep as-is |
|---|---|---|
| **Modal** body | Already slot-shaped (legacy `Slot` + `Drawer content` swap with 1 preferred value). Direct replacement | Header and actions stay sub-components with properties |
| **Card** content (new) | No Card exists; design it slot-native from the start | Variants for elevation/border only |
| Dropdown menu | List content is open-ended | `_Dropdown list item` stays a component |
| Header navigation actions | Varying right-side content per screen | Breakpoint variant |
| Alert actions | Optional, low priority | Color variant, booleans |

**Not slots:** Button icons (use instance swap), Input field leading content (instance swap or variant; slots would let agents put anything in a field), Checkbox/Radio, Badge, Tag.

**Order of preference preserved:** Variants for state/size · Instance swap for controlled replacement · Component properties for common customisation · Variables for style · Slots only for flexible composition.
