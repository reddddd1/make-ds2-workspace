# registry/

Machine-readable component registry for MAKER-DS-v2 (`xJoAz66aekAToyhBmfGNt0`), built in task **P1-04** (2026-11-09). Agents should read this instead of re-scanning Figma. It is a **snapshot**: re-run the extractor before relying on it after any library change.

## Files

| File | Contents |
|---|---|
| `components.json` | The registry (schema `1.0.0`). Built by `scripts/build-registry.py` |
| `raw/figma-extract-2026-11-09.json` | Unmodified output of `scripts/figma-registry-extract.js` for all 29 component pages (6 read-only `use_figma` calls) |
| `raw/figma-rerun-2026-11-09.json` | Second read of Buttons + Modals, used for the stability check |

Rebuild: `python3 -I scripts/build-registry.py registry/raw/figma-extract-2026-11-09.json registry/components.json` (validates before writing).

## `components.json` structure

- `source`: file key, read time range, extractor path and SHA-256, `mode: read-only`.
- `totals.all` / `totals.base`: `base` = the 24 base-component pages plus the Slot page (the audit §2.3 scope); `primitives` = Colors, Logos, Typography, Effect styles, Design annotations.
- `reconciliation`: audit §2.3 expectations vs actual, plus spot checks.
- `instanceSwapProperties`, `textProperties`: every INSTANCE_SWAP and TEXT property in the file.
- `dependencies`: every component used as a nested instance, with key, `remote`, `source` classification, `usedBy` and instance count.
- `components[]`: one entry per component set or standalone component: `kind`, `name`, `id`, `key`, `page`, `scope`, `variantCount`, `axes`, full `properties` (name, id, type, default, variant `options`; for INSTANCE_SWAP the resolved `defaultRef` and `preferred` keys), `nestedInstances`, `exposedInstances`, `dependencies`, `bindings` (bound/raw solid fills and strokes, text layers without a text style, up to 3 sample paths each), `slotNamedLayers`, `variantsWithoutAutoLayout`.

## Limits (read before using)

- **Binding scan:** solid fills, solid strokes and text-style presence on each component's own layers. Nested instances are not descended. Spacing, radius, effect and text-style IDs are **not** scanned (P1-05).
- **Variant IDs/names per variant are not stored** (kept out to stay within MCP return limits). Axes and options are. P1-08 checkers read variants live.
- **Remote library attribution is UNVERIFIED.** The Plugin API gives `remote: true` and the key, not the library name. `Icon wrapper` (`b8295cee…`) is assumed to be the MAKER Icon library; `Home Indicator` is presumably the iOS kit.
- **Orphans:** 46 local dependencies resolve to main components that are on no page (`parent = null`, `removed = false`). Verified for 25 of them on 2026-11-09.

## Verification (2026-11-09)

| Check | Result |
|---|---|
| Totals vs audit §2.3 (base scope) | 68 sets ✓ · 1,169 variants (audit ~1,170) ✓ · 12 standalone ✓ · 1 TEXT ✓ · **8 INSTANCE_SWAP (audit said 7)** |
| Whole file | 77 sets · 1,212 variants · 18 standalone (95 owners) — same as an independent count pass |
| Spot checks | Buttons/Button 118 variants / 7 props ✓ · Input field 53 ✓ |
| Re-run stability | Buttons (9 sets) and Modals (3 sets) re-read 4 min later: identical |
| Raw spot checks | Link brand Focused fill = white at 0.1% opacity, unbound ✓ · Tag count text has no text style (Inter Medium 10) ✓ · App store badge vector stroke raw black ✓ |
| JSON | Parses; structural validation in `build-registry.py` passes |
| Writes | None. Every script reviewed for mutating calls before running |
