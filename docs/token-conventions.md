# Token conventions

> **Status:** APPROVED rules from `reddddd1/design-tokens` ADR-0003–0008. The detailed ADR-0004 mapping still needs Mike's confirmation. Canonical copy lives in the token repo; this is a summary.

| Token path | Web CSS var | Class |
|---|---|---|
| `color.brand.600` | `--color-brand-600` | `bg-brand-600` |
| `spacing.4`, `spacing.0_5` | `--spacing-4` | `p-4`, `gap-0.5` |
| `radius.md` (6px) | `--radius-md` | `rounded-md` |
| `font.size.base` | `--text-base` | `text-base` |
| `color.bg.primary` (theme) | `--background-color-primary` | `bg-primary` |
| `color.text.tertiary` (theme) | `--text-color-tertiary` | `text-tertiary` |
| `color.border.error` (theme) | `--border-color-error` | `border-error` |

## Mapping rules from Figma

- Families slugified: `Gray (dark mode)` → `gray-dark`, `Green lime` → `green-lime`; steps keep numbers including `25`.
- Font sizes use Tailwind names where they exist (`text-md` → `base`); `xxs`, `xxxs`, `display-xs` keep Figma names.
- Weights: Regular 400 `normal`, Medium 500, Semibold 600, Bold 700.
- Semantic names: drop `(900)` shades, `_`/space → `-`, split run-together words.
- Radius maps **by value** (Figma `radius-md` 8px → `radius.lg`); 20px → custom `radius.2-5xl`.
- Each token records its Figma source in `$extensions["com.make.source"].figma`.

## Format (PENDING devs, applied provisionally)

DTCG 2025.10 `*.tokens.json`; colours `srgb` + required `hex`; dimensions in px.

## Guardrails

- Preserve Figma colour values; flag any visible change for Mike.
- WCAG 2.2 AA minimum; report actual ratios, never rounded up.
- No global Tailwind/NativeWind default overrides until ADR-0009.
