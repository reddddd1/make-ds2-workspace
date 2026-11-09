# scripts/

| Script | Type | Status |
|---|---|---|
| `figma-component-audit.js` | **Read-only** `use_figma` body used for the 2026-11-09 audit. Replace `__PAGE__` with a page node ID; run once per page | VERIFIED (used) |
| `figma-registry-extract.js` | **Read-only** `use_figma` body for the P1-04 registry. Set `PAGES` to a list of page IDs; pages are loaded with `loadAsync()` (no page switching). Returns per-item sizes instead of data if over 48 KB | VERIFIED (used, P1-04) |
| `figma-binding-scan.js` | **Read-only** `use_figma` body for P1-05. Set `PAGES`; set `FULL` to set names that need complete raw paths | VERIFIED (used, P1-05) |
| `build-token-mapping.py` | Local only, P1-06. Maps every Figma variable (raw dump in `registry/raw/figma-variables-*.json`) to the approved tokens in `design-tokens/tokens/` (read-only; also notes pending proposals). Writes `reports/P1-06-token-mapping.{json,md}` here. Python stdlib, CIEDE2000 built in. Replaces `design-tokens/scripts/build-figma-mapping.mjs` for this purpose (that script writes into the token repo and maps to Tailwind, not the registry) | VERIFIED (used, P1-06) |
| `figma-colour-usage-scan.js` | **Read-only** `use_figma` body for P1-07. Set `PAGES`; returns per component the colour variables bound on own layers (fills, strokes, effect colours; direct or via paint style) | VERIFIED (used, P1-07) |
| `build-component-colours.py` | Local only, P1-07. Builds `docs/component-colours.md` from the variable dump and the usage scan; exits non-zero unless there are exactly 171 rows | VERIFIED (used, P1-07) |
| `build-registry.py` | Local only. Builds and validates `registry/components.json` from a raw extract. `python3 -I scripts/build-registry.py <raw.json> <out.json> [<bindings.json>]` | VERIFIED (used, P1-04) |

Rules: write scripts are added only after a phase is approved, and must refuse to run against the original library `xJoAz66aekAToyhBmfGNt0`.
