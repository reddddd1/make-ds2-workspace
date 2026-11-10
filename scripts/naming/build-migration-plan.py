#!/usr/bin/env python3
"""Builds the proposed naming migration plan (batches) from the refreshed audit. Read-only, deterministic.

Inputs : reports/token-naming/audit.json                       (build-naming-audit.py, current Figma names)
         reports/naming-followup/figma-variables-current.json  (682 variables read after the pilot)
Outputs: reports/token-naming-migration-plan.md
         reports/token-naming/batches/batch-<n>.json            (exact ID / old / new lists, for later approval)
Usage  : python3 -I scripts/naming/build-migration-plan.py
"""
import json, os
from collections import Counter, defaultdict
W = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = lambda p: json.load(open(os.path.join(W, p)))
au = J('reports/token-naming/audit.json')
cur = J('reports/naming-followup/figma-variables-current.json')
rows = au['rows']
done = [r for r in rows if r['status'] != 'candidate']
rem = [r for r in rows if r['status'] == 'candidate']
mapped = {r['variableId'] for r in rows} | {r['variableId'] for r in au['radiusDeferred']}

# ---------- family completeness (mapped vs Figma-only members of the same Figma group) ----------
def fam_of(coll, name):
    p = name.split('/')
    return coll + ' › ' + ('/'.join(p[:2]) if p[0] in ('Colors',) else p[0])
fam = defaultdict(lambda: {'mapped': 0, 'figmaOnly': 0, 'figmaOnlyEx': []})
for c in cur['collections']:
    if c['name'] in ('4. Widths', '5. Containers', '2. Radius', '3. Spacing'): continue
    for v in c['variables']:
        if v['name'].startswith('Component colors/') or v['id'] in mapped: continue
        f = fam[fam_of(c['name'], v['name'])]; f['figmaOnly'] += 1
        if len(f['figmaOnlyEx']) < 4: f['figmaOnlyEx'].append(v['name'])
for r in rows + au['radiusDeferred']:
    if r['token'].startswith('radius.'): continue
    fam[fam_of(r['collection'], r['originalName'])]['mapped'] += 1

def family(r): return fam_of(r['collection'], r['originalName'])
def split(r): return fam[family(r)]['figmaOnly'] > 0

# ---------- batches ----------
def grp(t):
    s = t.split('.')
    if s[0] == 'spacing': return 'spacing'
    if s[0] == 'font': return 'typography'
    if s[0] == 'color' and s[1] in ('bg', 'text', 'border', 'fg', 'focus-ring'): return 'roles'
    if s[0] == 'color' and s[1] in ('white', 'black', 'transparent') or (s[0] == 'color' and s[1].startswith('gray')): return 'neutrals'
    return 'palette'
BATCHES = [
 ('1', 'Spacing primitives', 'spacing',
  'Complete family (all 32 `Spacing/*` primitives are registry-backed; `spacing/3` already done), 0 direct component bindings, reached only through the `3. Spacing`, `4. Widths` and `5. Containers` aliases. Lowest risk and leaves no split group.',
  'Aliases from `3. Spacing` (17), `4. Widths` (12), `5. Containers` (3) resolve to the same IDs and values; old names contain U+2024 ONE DOT LEADER (`0․5`, `1․5`), so the preflight compares exact strings.'),
 ('2', 'Brand, status and accent palettes', 'palette',
  'Primitives reached through semantic-role and component-colour aliases plus one paint style each; only `Green lime/500` has direct bindings (35). Splits families unless decision D-2 completes them first.',
  'Every aliasing role and component colour still resolves; the paint styles `Brand/*`, `Error/*`, `Success/*`, `Warning/*` keep their references.'),
 ('3', 'Neutral palettes and base colours', 'neutrals',
  'Gray (light/dark), Gray iron/modern, white, black, transparent. `white` (36), `black` (24) and a few gray steps have direct bindings; `transparent` is aliased by 15 shadow variables. Gray names are also the C4 Tailwind-default hazard in code (unchanged by a Figma rename).',
  'Shadow and overlay aliases resolve; Dark-mode role values unchanged; `Gray (dark mode)` → `gray-dark` family slug.'),
 ('4', 'Semantic roles (text, border)', 'roles',
  'Designer-facing names (`text-success-primary` …) with direct bindings (39). Medium risk: changes the names designers pick from; split groups (`Colors/Text` keeps 21 Figma-only roles).',
  'Per-component binding counts identical; Light and Dark values per role identical.'),
 ('5', 'Typography primitives', 'typography',
  'Highest exposure: 3,596 direct bindings and 96 text-style references (`Font family/font-family-primary` alone: 1,013 bindings, 33 styles). Medium risk; families stay split (11 font sizes, 9 line heights, 5 weights are Figma-only).',
  'All text styles keep their bound variable IDs; `fontSize`, `lineHeight`, `fontStyle`, `fontFamily`, `paragraphSpacing` binding counts identical; STRING weight values (`"Regular"`, `"Medium"`) unchanged.'),
]
os.makedirs(os.path.join(W, 'reports/token-naming/batches'), exist_ok=True)
plan = []
for bid, title, g, why, verify in BATCHES:
    rs = sorted([r for r in rem if grp(r['token']) == g], key=lambda r: r['token'])
    b = {'batch': bid, 'title': title, 'count': len(rs), 'directBindings': sum(r['directUses'] for r in rs), 'styleRefs': sum(r['styleRefs'] for r in rs),
         'aliasedBy': sum(r['aliasedBy'] for r in rs), 'risk': dict(Counter(r['risk'] for r in rs)), 'splitFamilies': sorted({family(r) for r in rs if split(r)}),
         'rows': [{'id': r['variableId'], 'collection': r['collection'], 'old': r['current'], 'new': r['proposed'], 'token': r['token'], 'directBindings': r['directUses'],
                   'components': r['componentCount'], 'styleRefs': r['styleRefs'], 'aliasedBy': r['aliasedBy'], 'risk': r['risk']} for r in rs]}
    json.dump({'status': 'PROPOSED — not approved, not applied', 'fileKey': 'PpnTy1pkB2FTZFq6i6seSy', **b}, open(os.path.join(W, f'reports/token-naming/batches/batch-{bid}.json'), 'w'), indent=1, ensure_ascii=False)
    plan.append((b, why, verify))
assert sum(b['count'] for b, _, _ in plan) == len(rem), 'every remaining candidate must be in exactly one batch'

L = ['# Token naming migration plan (PAUSED — Mike, 2026-11-09: partial groups accepted; no batch scheduled)', '',
     '> 2026-11-09, after the accepted 11-variable pilot. Generated by `scripts/naming/build-migration-plan.py` from the refreshed audit (`reports/token-naming/audit.json`, Figma names read 20:42 UTC). Exact per-batch mappings: `reports/token-naming/batches/batch-<n>.json`. **No further variable is renamed until Mike approves a batch\'s exact mapping.** Convention: `docs/token-naming-convention.md` (conditionally approved, unchanged).', '',
     '## 1. Scope', '',
     '| | Variables |', '|---|---|',
     f"| Registry-backed rename candidates (approved map, radius excluded) | {len(rows)} |",
     f"| Already renamed by the pilot | {len(done)} |",
     f"| **Remaining, planned below** | **{len(rem)}** (all cosmetic: Figma values already equal the registry; dry-run 0 operations) |",
     f"| Excluded: radius (deferred, proposal R1) | {len(au['radiusDeferred'])} mapped + 1 Figma-only |",
     '| Excluded: component-level colours (D-05) | 171 |',
     '| Excluded: Figma-only variables (no registry token; requirement 4) | 368 |',
     '| Excluded: `4. Widths`, `5. Containers` (no registry tokens) | 15 |',
     '| Tailwind default overrides | Still blocked pending ADR-0009 (option A build profile; nothing in this plan changes it) |', '',
     '## 2. Batches', '',
     '| Batch | Content | Variables | Direct bindings | Style refs | Aliased by | Risk | Leaves split groups? |', '|---|---|---|---|---|---|---|---|']
for b, _, _ in plan:
    L.append(f"| **{b['batch']}** | {b['title']} | {b['count']} | {b['directBindings']:,} | {b['styleRefs']} | {b['aliasedBy']} | {b['risk']} | {'no' if not b['splitFamilies'] else 'yes: ' + str(len(b['splitFamilies']))} |")
L += ['', '**Order rationale:** zero-binding complete family first (proves the generalised scripts at scale), then alias-only palettes, then neutrals with a few direct bindings, then designer-facing roles, typography last (largest blast radius: every text layer and text style). Renames are name-only and ID-based, so no batch depends technically on another; the order manages exposure and lets each batch\'s validation build confidence for the next.', '']
for b, why, verify in plan:
    L += [f"### Batch {b['batch']} — {b['title']} ({b['count']})", '', f"**Why here:** {why}", '', f"**Batch-specific checks:** {verify}", '']
    if b['splitFamilies']:
        L += ['**Groups left split** (Figma-only members keep old names): ' + '; '.join(f"`{f}` ({fam[f]['figmaOnly']} kept, e.g. `{fam[f]['figmaOnlyEx'][0]}`)" for f in b['splitFamilies']), '']
    L += ['| Variable ID | Old name | New name | Token | Bindings / comps | Styles | Aliased by | Risk |', '|---|---|---|---|---|---|---|---|']
    for r in b['rows']:
        L.append(f"| `{r['id']}` | `{r['old']}` | `{r['new']}` | `{r['token']}` | {r['directBindings']} / {r['components']} | {r['styleRefs']} | {r['aliasedBy']} | {r['risk']} |")
    L.append('')
L += ['## 3. Procedure for every batch (same as the accepted pilot)', '',
      '1. **Approval** of the batch\'s exact mapping (`batch-<n>.json`).',
      '2. **Before snapshot** (read-only, `pilot-verify-read.js` generalised to the batch ID list): names, values, aliases both ways, scopes, code syntax, publishing, description, key, styles, per-component and per-field bindings, fingerprint of all 682 variables.',
      '3. **Preflight + rename** (`pilot-rename.js` generalised; only mutation `variable.name`): exact old names, targets free, file = duplicate, count = batch size; in-call verify, atomic rollback on any mismatch.',
      '4. **After snapshot** in a fresh call and comparison: exactly N names changed, 0 other differences across 682 variables, styles digest equal, binding counts per component and field equal.',
      '5. **Regression:** `collect-variants` (E1) on the pilot sets = identical hashes; `collect-instances` (E2) Modals page with old-name normalisation = identical; Light screenshots pixel-identical; sync dry-run `--map` = 0 operations.',
      '6. **Report** + rollback ready (`ROLLBACK = true`, only acts while the batch names are still in place).', '',
      '## 4. Decisions needed before batch 2', '',
      f"- **D-1 Batch 1 (Spacing):** approve its exact mapping when ready. It is the only batch that leaves no split group.",
      f"- **D-2 Split groups:** {sum(1 for f in fam.values() if f['mapped'] and f['figmaOnly'])} Figma groups would end up half renamed (e.g. `Colors/Brand`: 9 registry-backed renamed, 3 Figma-only kept). Options: (a) accept the split as an interim state; (b) first propose registry tokens for the missing family members (growth model; token-repo change, separate approval), then rename whole families; (c) rename only complete families now (batch 1) and pause the rest. Recommendation: (b) for palettes and typography, because a half-renamed picker is harder for designers than either naming scheme alone.",
      '- **D-3 Map and registry names:** the approved variable map (`sync/figma-variable-map.PpnTy1pkB2FTZFq6i6seSy.json`) and the registry `com.make.source.figma` still record the 11 old names. The ID link is unaffected (dry-run 0 operations). Update both after the migration via a proposal (registry = token repo, separate approval).',
      '- **D-4 Dark-mode visual check:** see the validation report (needs approval for a temporary Dark-mode frame, or accept value-level evidence).', '',
      '## 5. Convention exceptions and edge cases (the convention itself is unchanged)', '',
      'Every proposed name follows `docs/token-naming-convention.md` §8 (registry path, dots → slashes). These are the places where applying it needs care or differs from a plain reading:', '',
      '| # | Case | Variables | Handling |', '|---|---|---|---|',
      '| X-1 | Old names contain U+2024 ONE DOT LEADER, not a full stop (`Spacing/0․5 (2px)`, `Spacing/1․5 (6px)`) | 2 (batch 1) | Preflight compares the exact stored string; new names use the registry path `spacing/0_5`, `spacing/1_5` (class `p-0.5`, `p-1.5`) |',
      '| X-2 | Registry path keeps `_` for a decimal point in the Figma name | 2 (batch 1) | Accepted (C9); readable in the picker and maps 1:1 to the token |',
      '| X-3 | Figma STRING weight variables hold style names (`"Regular"`, `"Medium"`, `"Semibold"`) | 2 (batch 5) + 1 done | Name only; values stay strings; code generator maps to 400/500/600 from the registry |',
      '| X-4 | Figma name differs from the Tailwind-shaped name: `Font weight/regular` → `font/weight/normal`, `Font family/font-family-primary` → `font/family/sans`, `Font size/text-md` → `font/size/base` (done) | 2 (batch 5) | Registry name wins (ADR-0004); `font/family/sans` value is `Inter` in Figma vs the full stack in the registry (C4: `--font-sans` not overridden in code) |',
      '| X-5 | Line height: Figma stores px (24), registry stores a ratio (1.5) with the px in `$extensions` | 3 (batch 5) | Equal under the sync spec (dry-run unchanged); rename only |',
      '| X-6 | Family slug rule: `Gray (dark mode)` → `gray-dark`, `Gray (light mode)` → `gray` | 20 (batch 3) | ADR-0004 rule; `Gray (dark mode alpha)` stays Figma-only |',
      '| X-7 | Run-together word split: `text-primary_on-brandprimary` → `color/text/primary-on-brand` | 1 (batch 4) | Registry name (convention §9 rule 2) |',
      '| X-8 | Split groups after renaming only registry-backed members (also true after the pilot: e.g. `Colors/Brand` now holds 11 old-name steps next to `color/brand/600`) | 18 groups | Decision D-2 |',
      '| X-9 | Approved map and registry still record pre-pilot Figma names for the 11 renamed variables | 11 | Decision D-3; ID link unaffected |', '']
open(os.path.join(W, 'reports/token-naming-migration-plan.md'), 'w').write('\n'.join(L) + '\n')
print('plan written', [(b['batch'], b['count']) for b, _, _ in plan], 'remaining', len(rem))
