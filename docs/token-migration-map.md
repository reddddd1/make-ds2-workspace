# Token migration map

> **Status: PROPOSED — not approved.** Generated from `docs/audit.md` (2026-11-09). Labels: VERIFIED · APPROVED (cites an ADR) · PROPOSED · UNVERIFIED · BLOCKED.
> Claude Code must not act on anything here until Mike approves the matching decision (see `docs/decisions.md`).

### 7. Token migration proposal

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
