#!/usr/bin/env python3
"""Token naming audit (read-only). Builds the rename map, generated names and collision checks.

Inputs (all read-only):
  - design-tokens/tokens/**            canonical DTCG registry (paths, types, values, Figma source)
  - design-tokens/reference/tailwind-4.3.5.tokens.json   Tailwind default theme reference
  - sync/figma-variable-map.<dup>.json approved token -> Figma variable ID map (129 pairs)
  - reports/naming-followup/figma-variables-current.json  duplicate's 682 variables (read after the naming pilot);
    falls back to reports/P2-01-sync/after/figma-variables-after.json (post-sync read) if absent
  - reports/P2-01-sync/after/dryrun.json                 registry vs Figma value comparison (0 operations)
  - registry/raw/figma-colour-usage-*.json, figma-bindings-*.json  component usage (P1-05/P1-07 scans)
Outputs: reports/token-naming/audit.json and the data sections of
  reports/token-rename-migration-map.md, reports/token-naming-conflicts.md
Usage: python3 -I scripts/naming/build-naming-audit.py <design-tokens dir>
Deterministic: same inputs -> byte-identical outputs. Never writes to the token repo or Figma.
"""
import json, glob, os, re, sys
from collections import defaultdict, Counter

TOK = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Documents/Codex/design-tokens')
W = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = lambda p: json.load(open(os.path.join(W, p)))

# ---------------- registry ----------------
def walk(d, p=''):
    for k, v in d.items():
        if k.startswith('$'): continue
        if isinstance(v, dict) and '$value' in v: yield p + k, v
        elif isinstance(v, dict): yield from walk(v, p + k + '.')

reg = {}
for f in sorted(glob.glob(TOK + '/tokens/**/*.tokens.json', recursive=True)):
    rel = os.path.relpath(f, TOK); mode = 'light' if '/light/' in rel else 'dark' if '/dark/' in rel else None
    tier = 'theme' if '/themes/' in rel else 'semantic' if '/semantic/' in rel else 'primitive'
    data = json.load(open(f))
    for path, t in walk(data):
        e = reg.setdefault(path, {'path': path, 'tier': tier, 'file': rel, 'values': {}, 'figma': None, 'tailwind': None, 'description': t.get('$description')})
        e['values'][mode or 'all'] = t['$value']
        src = (t.get('$extensions') or {}).get('com.make.source') or {}
        e['figma'] = e['figma'] or src.get('figma'); e['tailwind'] = e['tailwind'] or src.get('tailwind'); e['classes'] = e.get('classes') or src.get('classes')

def hexof(v):
    return v.get('hex') if isinstance(v, dict) and 'hex' in v else None

def resolve(path, mode, depth=0):
    e = reg.get(path)
    if not e or depth > 5: return None
    v = e['values'].get(mode) or e['values'].get('all')
    if isinstance(v, str) and v.startswith('{'): return resolve(v.strip('{}'), mode, depth + 1)
    return v

# ---------------- Tailwind default theme (4.3.5 reference) ----------------
twref = json.load(open(TOK + '/reference/tailwind-4.3.5.tokens.json'))
tw_keys = {p for p, _ in walk(twref)}
tw_ref_vals = {p: t['$value'] for p, t in walk(twref)}
# Authoritative default-theme variable list, extracted from the installed tailwindcss 4.3.5 theme.css by
# scripts/naming/compile-check.mjs (the reference JSON above has no font families, so it under-reports C4).
TWVARS_F = os.path.join(W, 'reports/token-naming/compile-check/tailwind-theme-vars.json')
twvars = json.load(open(TWVARS_F))['vars'] if os.path.exists(TWVARS_F) else {}

# ---------------- naming rules (the contract) ----------------
PALETTE_ROOTS = {'white', 'black', 'transparent'}
def generated(path):
    """token path -> (namespace, css var for Tailwind v4 @theme, example utilities, NativeWind v4 config key)."""
    s = path.split('.')
    if s[0] == 'color':
        if s[1] in PALETTE_ROOTS:
            return ('color', f'--color-{s[1]}', [f'bg-{s[1]}', f'text-{s[1]}', f'border-{s[1]}'], f"colors.{s[1]}")
        if s[1] == 'bg':     return ('background-color', f'--background-color-{s[2]}', [f'bg-{s[2]}'], f"backgroundColor['{s[2]}']")
        if s[1] == 'text':   return ('text-color', f'--text-color-{s[2]}', [f'text-{s[2]}'], f"textColor['{s[2]}']")
        if s[1] == 'border': return ('border-color', f'--border-color-{s[2]}', [f'border-{s[2]}'], f"borderColor['{s[2]}']")
        if s[1] == 'fg':     return ('color', f'--color-fg-{s[2]}', [f'text-fg-{s[2]}', f'fill-fg-{s[2]}'], f"colors.fg['{s[2]}']")
        if s[1] == 'focus-ring': return ('ring-color', f'--ring-color-{s[2]}', [f'ring-{s[2]}', f'outline-{s[2]}*'], f"ringColor['{s[2]}']")
        fam, step = s[1], s[2]
        return ('color', f'--color-{fam}-{step}', [f'bg-{fam}-{step}', f'text-{fam}-{step}', f'border-{fam}-{step}'], f"colors['{fam}']['{step}']")
    if s[0] == 'spacing':
        n = s[1].replace('_', '.')
        return ('spacing', '--spacing (multiplier 4px; no per-key var)', [f'p-{n}', f'gap-{n}', f'm-{n}'], f"spacing['{n}'] (Tailwind 3 default scale)")
    if s[0] == 'radius':  return ('radius', f'--radius-{s[1]}', [f'rounded-{s[1]}'], f"borderRadius['{s[1]}']")
    if s[0] == 'font':
        kind, name = s[1], s[2]
        if kind == 'size':           return ('text', f'--text-{name}', [f'text-{name}'], f"fontSize['{name}']")
        if kind == 'weight':         return ('font-weight', f'--font-weight-{name}', [f'font-{name}'], f"fontWeight['{name}']")
        if kind == 'family':         return ('font', f'--font-{name}', [f'font-{name}'], f"fontFamily['{name}']")
        if kind == 'line-height':    return ('leading', f'--leading-{name}', [f'leading-{name}'], f"lineHeight['{name}']")
        if kind == 'letter-spacing': return ('tracking', f'--tracking-{name}', [f'tracking-{name}'], f"letterSpacing['{name}']")
    if s[0] == 'typography':
        return ('composite (text style)', '— (not a theme variable)', [type_class(path)], '— (component style / NativeWind plugin)')
    return ('?', '?', [], '?')

def type_class(path):
    """Composite typography -> `type-*` utility. Rule T: drop `typography.`, drop a leading `text` group
    (the default body group), join the rest with `-`.  typography.text.base.medium -> type-base-medium;
    a future typography.display.sm.semibold -> type-display-sm-semibold."""
    s = path.split('.')[1:]
    if s and s[0] == 'text': s = s[1:]
    return 'type-' + '-'.join(s)

# Proposal R1 (radius by value): registry key = the px value; none/full keep Tailwind's built-in statics.
def radius_r1(px):
    return 'full' if px >= 9999 else 'none' if px == 0 else str(int(px)) if float(px).is_integer() else str(px).replace('.', '_')

def figma_proposed(path):
    return path.replace('.', '/')

# ---------------- Figma (duplicate, post-sync) ----------------
FIG_CURRENT = 'reports/naming-followup/figma-variables-current.json'
fig = J(FIG_CURRENT) if os.path.exists(os.path.join(W, FIG_CURRENT)) else J('reports/P2-01-sync/after/figma-variables-after.json')
FIG_SOURCE = FIG_CURRENT if os.path.exists(os.path.join(W, FIG_CURRENT)) else 'reports/P2-01-sync/after/figma-variables-after.json'
fvars = {}
for c in fig['collections']:
    for v in c['variables']:
        fvars[v['id']] = dict(v, collection=c['name'])
byname = {(v['collection'], v['name']): v for v in fvars.values()}
aliased_by = defaultdict(list)
for v in fvars.values():
    for mv in (v.get('values') or {}).values():
        if isinstance(mv, dict) and mv.get('alias'): aliased_by[mv['alias']].append(v['name'])

def fig_hex(vid, mode, depth=0):
    v = fvars.get(vid)
    if not v or depth > 6 or not v.get('values'): return None
    x = v['values'].get(mode) or next(iter(v['values'].values()))
    if isinstance(x, dict): return fig_hex(x['alias'], mode, depth + 1) if x.get('alias') else None
    return x

# ---------------- map + dryrun ----------------
mp = J('sync/figma-variable-map.PpnTy1pkB2FTZFq6i6seSy.json')['map']
dr = J('reports/P2-01-sync/after/dryrun.json')
unchanged = defaultdict(set)
for r in dr['rows']:
    if r['op'] == 'unchanged': unchanged[r['token']].add(r.get('mode'))
ops_pending = Counter(r['op'] for r in dr['rows'] if r['op'] in ('create', 'update-value', 'update-alias', 'conflict'))

# ---------------- component usage ----------------
use = defaultdict(lambda: defaultdict(int))  # variable name -> component -> count
for it in J('registry/raw/figma-colour-usage-2026-11-09.json')['items']:
    for var, (d, s) in it['colours'].items():
        use[var.replace(' (remote)', '')][it['name']] += d + s
for it in J('registry/raw/figma-bindings-2026-11-09.json')['general']:
    for cls, info in (it.get('classes') or {}).items():
        for key, n in (info.get('boundVars') or {}).items():
            name = key.split('/', 1)[1] if re.match(r'^(\d\. [^/]+|_Primitives)/', key) else key
            use[name][it['name']] += n

# Live usage on the duplicate (preferred; ID-based, includes typography bindings and style references)
LIVE = os.path.join(W, 'reports/token-naming/live-usage-duplicate.json')
live = json.load(open(LIVE)) if os.path.exists(LIVE) else None
def usage(name, vid=None):
    if live is not None and vid is not None:
        u = live['use'].get(vid)
        st = live['styles'].get(vid, {'n': 0, 'ex': []})
        if u: return u['n'], [tuple(x) for x in u['top']], u['c'], st
        return 0, [], 0, st
    u = use.get(name, {})
    return sum(u.values()), sorted(u.items(), key=lambda x: -x[1]), len(u), {'n': 0, 'ex': []}

# ---------------- rows for mapped variables ----------------
RADIUS_SHIFT = None
rows = []
radius_rows = []   # DEFERRED (Mike, 2026-11-09): radius variables are not renamed; listed with proposal R1 only
for tok, m in sorted(mp.items()):
    vid = m['variableId']; v = fvars.get(vid, {})
    ns, cssvar, utils, nw = generated(tok)
    cur = v.get('name') or m['figmaName']
    prop = figma_proposed(tok)
    e = reg.get(tok)
    modes = sorted(k for k in (e['values'] if e else {}) )
    equal = bool(unchanged.get(tok))
    n, comps, ncomp, styl = usage(cur, vid)
    al = aliased_by.get(vid, [])
    # change class
    cls = 'cosmetic' if equal else 'value'
    # risk
    risk, why = 'low', 'name-only; bindings use the variable ID'
    orig = m['figmaName']  # name in the approved map = name before any rename; risk is judged on it
    if tok.startswith('radius.'):
        cur_step = orig.replace('radius-', ''); tgt = tok.split('.', 1)[1]
        if cur_step != tgt: risk, why = 'high', f'name step shifts ({cur_step} → {tgt}); same name means a different size after rename'
    elif tok.startswith('font.size.') or tok.startswith('font.line-height.'):
        if not orig.endswith('-' + tok.split('.')[-1]): risk, why = 'medium', 'Figma size name differs from Tailwind name (text-md → base)'
    elif tok.startswith('color.') and tok.split('.')[1] in ('bg', 'text', 'border', 'focus-ring'):
        risk, why = 'medium', 'semantic role renamed (Untitled UI name designers know)'
    elif tok.startswith('font.weight.') or tok.startswith('font.family.'):
        risk, why = 'medium', 'Figma name differs (regular → normal / primary → sans)'
    elif tok.startswith('color.gray-dark.'):
        risk, why = 'low', 'family slug (Gray (dark mode) → gray-dark)'
    row = {'token': tok, 'collection': v.get('collection') or m['collection'], 'variableId': vid, 'current': cur, 'proposed': prop,
                 'cssVar': cssvar, 'namespace': ns, 'utilities': utils, 'nativewind': nw, 'modes': modes, 'valueEqual': equal,
                 'class': cls, 'risk': risk, 'riskWhy': why, 'directUses': n, 'components': comps[:6], 'componentCount': ncomp, 'styleRefs': styl['n'], 'styleEx': styl['ex'],
                 'aliasedBy': len(al), 'tier': e['tier'] if e else None, 'originalName': orig,
                 'status': 'DONE (pilot 2026-11-09)' if cur == prop else 'candidate'}
    if tok.startswith('radius.'):
        px = fig_hex(vid, 'Mode 1'); key = radius_r1(px)
        row.update({'status': 'DEFERRED: not renamed', 'r1Token': f'radius.{key}', 'r1Figma': f'radius/{key}', 'r1Utility': f'rounded-{key}', 'px': px})
        radius_rows.append(row)
    else:
        rows.append(row)

# ---------------- variables not renamed ----------------
mapped_ids = {m['variableId'] for m in mp.values()}
not_renamed = Counter(); figma_only = []
for v in fvars.values():
    if v['id'] in mapped_ids: continue
    if v['name'].startswith('Component colors/'): not_renamed['component colour (D-05, 171): unchanged'] += 1
    elif v['collection'] in ('4. Widths', '5. Containers'): not_renamed['Widths/Containers (no registry tokens): unchanged'] += 1
    else:
        not_renamed['figma-only in synced collections: unchanged in this migration'] += 1; figma_only.append(v)

# registry tokens with no Figma variable (structural)
no_fig = [p for p in sorted(reg) if p not in mp]

# ---------------- collisions / conflicts ----------------
conf = []
def add(cid, sev, kind, detail, items): conf.append({'id': cid, 'severity': sev, 'kind': kind, 'detail': detail, 'items': items})

# C1: same utility class from two tokens
cls_map = defaultdict(list)
for p in reg:
    ns, cv, utils, _ = generated(p)
    for u in utils: cls_map[u.rstrip('*')].append(p)
dups = {u: ps for u, ps in cls_map.items() if len(ps) > 1}
add('C1', 'high' if dups else 'none', 'Same utility class from two registry tokens', f'{len(dups)} duplicate class(es)', sorted(dups.items()))

# C2: text-* colour keys vs font-size keys (Tailwind checks colour first, so a colour key hides a font size)
text_color_keys = {p.split('.')[2] for p in reg if p.startswith('color.text.')}
color_keys = {('-'.join(p.split('.')[1:])) for p in reg if p.startswith('color.') and p.split('.')[1] not in ('bg', 'text', 'border', 'focus-ring')}
font_sizes = {p.split('.')[2] for p in reg if p.startswith('font.size.')} | {k.split('.')[2] for k in tw_keys if k.startswith('font.size.')}
over = sorted((text_color_keys | color_keys) & font_sizes)
add('C2', 'high' if over else 'none', 'text-* colour vs font-size key overlap (colour wins in Tailwind 4.3.5)', f'{len(over)} overlap(s); checked {len(text_color_keys)} text-colour + {len(color_keys)} palette keys vs {len(font_sizes)} font sizes', over)

# C3: font-* family vs weight key overlap
fam = {p.split('.')[2] for p in reg if p.startswith('font.family.')} | {k.split('.')[2] for k in tw_keys if k.startswith('font.family.')}
wgt = {p.split('.')[2] for p in reg if p.startswith('font.weight.')} | {k.split('.')[2] for k in tw_keys if k.startswith('font.weight.')}
add('C3', 'high' if fam & wgt else 'none', 'font-* family vs weight overlap', f'families {sorted(fam)}; weights {len(wgt)}', sorted(fam & wgt))

# C4: registry keys that override a Tailwind default theme key
def tw_equiv(p):
    s = p.split('.')
    if s[0] == 'color' and s[1] not in ('bg', 'text', 'border', 'fg', 'focus-ring'): return '.'.join(s)
    if s[0] in ('radius',): return p
    if s[0] == 'font' and s[1] in ('size', 'weight', 'family', 'line-height', 'letter-spacing'): return p
    return None
def tw_px(s):
    """Tailwind default value string -> comparable (px float, plain number, or normalised string)."""
    s = s.strip()
    m = re.fullmatch(r'(-?[\d.]+)(rem|px|em)?', s)
    if m:
        n = float(m.group(1)); u = m.group(2)
        if n == 0: return 0.0
        return n * 16 if u == 'rem' else n if u == 'px' else (n, u) if u else n
    return re.sub(r"[\s'\"]", '', s).lower()
def reg_cmp(v):
    if isinstance(v, dict) and 'hex' in v: return v['hex'].lower()
    if isinstance(v, dict) and 'value' in v: return 0.0 if v['value'] == 0 else float(v['value']) if v.get('unit') == 'px' else (v['value'], v.get('unit'))
    if isinstance(v, list): return ','.join(re.sub(r"[\s'\"]", '', x).lower() for x in v)
    return float(v) if isinstance(v, (int, float)) else v
def fmt_val(v):
    if isinstance(v, dict) and 'hex' in v: return v['hex']
    if isinstance(v, dict) and 'value' in v: return f"{v['value']}{v.get('unit', '')}"
    if isinstance(v, list): return ', '.join(v[:2]) + (', …' if len(v) > 2 else '')
    return str(v)
STATIC_BUILTIN = {'radius.none', 'radius.full'}   # rounded-none / rounded-full are static utilities, not theme keys
ovr = []
for p in sorted(reg):
    if p in STATIC_BUILTIN or p.startswith(('spacing.', 'typography.')): continue
    ns, cssvar, _, _ = generated(p)
    if not cssvar.startswith('--') or cssvar not in twvars: continue
    mv = resolve(p, 'light') or resolve(p, 'all')
    q = tw_equiv(p)
    tref = tw_ref_vals.get(q) if q else None
    tv = hexof(tref).lower() if hexof(tref) else tw_px(twvars[cssvar])
    same = reg_cmp(mv) == tv
    ovr.append((p, cssvar, fmt_val(mv), twvars[cssvar] + (f' ({hexof(tref)})' if hexof(tref) else ''), 'same value' if same else 'DIFFERENT value'))
diff_ovr = [o for o in ovr if o[4] != 'same value']
add('C4', 'high', 'Registry key would redefine a Tailwind default theme variable (global override; ADR-0009 pending)', f'{len(ovr)} key(s) shared with the 4.3.5 default theme, {len(diff_ovr)} with a different value', ovr)

# C5: Figma proposed-name duplicates / collisions with existing names in the same collection
prop_names = Counter((r['collection'], r['proposed']) for r in rows)
dup_prop = [k for k, n in prop_names.items() if n > 1]
clash = [(r['collection'], r['proposed']) for r in rows if (r['collection'], r['proposed']) in byname and byname[(r['collection'], r['proposed'])]['id'] != r['variableId']]
add('C5', 'high' if dup_prop or clash else 'none', 'Figma proposed name duplicates or clashes with an existing variable', f'{len(dup_prop)} duplicate(s), {len(clash)} clash(es) with current names', dup_prop + clash)

# C6: name re-use with a different meaning across the rename (radius steps, font sizes)
shift = [(r['current'], r['proposed'], r['token']) for r in rows if r['risk'] == 'high']
deferred_shift = [(r['current'], r['proposed'], f"{r['px']}px") for r in radius_rows if r['risk'] == 'high']
add('C6', 'high' if shift else 'none', 'Same short name, different size after rename (human confusion; not a technical clash)',
    f'{len(shift)} in the rename candidates. Radius is DEFERRED: the ADR-0006 names would shift {len(deferred_shift)} of {len(radius_rows)} mapped radius variables; proposal R1 shifts 0',
    shift + [('DEFERRED',) + d for d in deferred_shift])

# C7: spacing values that are not a multiple of 4px (multiplier rule)
nonmul = []
for p in sorted(reg):
    if p.startswith('spacing.'):
        v = resolve(p, 'all'); n = float(p.split('.')[1].replace('_', '.'))
        if not (isinstance(v, dict) and abs(v.get('value', -1) - n * 4) < 1e-9): nonmul.append((p, v))
add('C7', 'high' if nonmul else 'none', 'Spacing token not equal to n × 4px (would break the --spacing multiplier rule)', f'{len(nonmul)} of {sum(1 for p in reg if p.startswith("spacing."))}', nonmul)

# C8: Figma-only variables (synced collections) whose resolved value duplicates a registry token (reuse, don't duplicate)
reg_hex = defaultdict(list)
for p, e in reg.items():
    if e['tier'] == 'primitive' and p.startswith('color.'):
        h = hexof(resolve(p, 'all'))
        if h: reg_hex[h.lower()].append(p)
dupval = []
for v in figma_only:
    if v['type'] != 'COLOR' or v['collection'] != '_Primitives': continue
    h = fig_hex(v['id'], 'Style')
    if isinstance(h, str) and h.lower() in reg_hex: dupval.append((v['name'], h, reg_hex[h.lower()]))
add('C8', 'medium' if dupval else 'none', 'Figma-only primitive with the same value as a registry primitive (merge candidate, structural)', f'{len(dupval)} variable(s)', sorted(dupval))

# C9: registry paths using non-standard utility shapes
odd = [p for p in reg if re.search(r'\d-\d', p)] + [p for p in reg if '_' in p]
add('C9', 'low', 'Non-standard path segments (decimal / custom step)', 'spacing `_` → `.` in classes (p-0.5); radius `2-5xl` → `rounded-2-5xl` (custom, not Tailwind)', sorted(odd))

# C10: Figma-only names that would normalise to the same slug as a mapped token's proposed name
FAMILY_SUFFIX = {'light mode': '', 'dark mode': '-dark', 'dark mode alpha': '-dark-alpha'}  # ADR-0004 family rule (+ alpha, proposed)
def slug(n):
    n = re.sub(r'\s*\(([^)]*)\)', lambda m: FAMILY_SUFFIX.get(m.group(1).lower(), ''), n)
    n = n.replace('é', 'e').replace('_', '-').replace(' ', '-').lower()
    return n
prop_by = {(r['collection'], r['proposed']): r for r in rows}
amb = []
for v in figma_only:
    s = slug(v['name']).replace('colors/', 'color/')
    s2 = re.sub(r'^color/(text|background|border|foreground)/(text|bg|border|fg)-', lambda m: f"color/{ {'text':'text','background':'bg','border':'border','foreground':'fg'}[m.group(1)] }/", s)
    for cand in {s, s2}:
        r = prop_by.get((v['collection'], cand))
        if r: amb.append((v['name'], cand, r['current']))
add('C10', 'medium' if amb else 'none', 'A kept (Figma-only) variable would normalise to the same name as a renamed variable', f'{len(amb)} case(s)', sorted(set(amb)))

# C11: kept (Figma-only) vs renamed variable that read the same once separators are ignored (radius-lg vs radius/lg)
flat = lambda n: re.sub(r'[\s/_-]', '', slug(n)).replace('colors', 'color')
renamed_flat = defaultdict(list)
for r in rows: renamed_flat[(r['collection'], flat(r['proposed']))].append(r)
look = []
for v in figma_only:
    for r in renamed_flat.get((v['collection'], flat(v['name'])), []):
        look.append((v['name'], str(fig_hex(v['id'], 'Mode 1') if v['type'] != 'COLOR' else fig_hex(v['id'], 'Style')), r['proposed'], r['current'], str(resolve(r['token'], 'all'))))
add('C11', 'high' if look else 'none', 'Kept variable and renamed variable read the same with separators ignored, but differ in value',
    f'{len(look)} case(s) in the rename candidates (the radius-lg vs radius/lg case disappears with radius deferred; R1 removes it permanently, see C13)', sorted(look))

# C12: composite typography classes (`type-*`): unique, no clash with Tailwind core prefixes, no doubled words
typo = sorted(p for p in reg if p.startswith('typography.'))
tcls = Counter(type_class(p) for p in typo)
bad = [c for c, k in tcls.items() if k > 1] + [type_class(p) for p in typo if re.search(r'type-(text|type)-', type_class(p))]
add('C12', 'high' if bad else 'none', 'Composite typography `type-*` classes: duplicates or awkward doubled words',
    f'{len(typo)} composites → {len(tcls)} unique classes; Tailwind 4.3.5 has no core `type-*` utility (compile check S2: `type-base` generates nothing)', sorted(bad) or [(type_class(p), p, (reg[p].get('figma') or '')) for p in typo])

# C13: radius proposal R1 (by value) on ALL Figma radius variables (mapped + kept): unique names, no shift, no Tailwind default key
fig_radius = sorted((v for v in fvars.values() if v['collection'] == '2. Radius'), key=lambda v: fig_hex(v['id'], 'Mode 1'))
r1 = []
for v in fig_radius:
    px = fig_hex(v['id'], 'Mode 1'); key = radius_r1(px)
    tok = next((t for t, m in mp.items() if m['variableId'] == v['id']), None)
    n, _, nc, _ = usage(v['name'], v['id'])
    r1.append({'id': v['id'], 'figma': v['name'], 'px': px, 'adr0006Token': tok, 'r1Token': f'radius.{key}', 'r1Figma': f'radius/{key}',
               'r1Utility': f'rounded-{key}', 'r1Var': '— (static built-in)' if key in ('none', 'full') else f'--radius-{key}',
               'twDefault': (f'--radius-{key}' in twvars), 'uses': n, 'components': nc})
r1_dup = [k for k, c in Counter(x['r1Token'] for x in r1).items() if c > 1]
r1_tw = [x['r1Var'] for x in r1 if x['twDefault']]
add('C13', 'high' if r1_dup or r1_tw else 'none', 'Radius proposal R1 (name = px value): duplicate names or Tailwind default keys',
    f'{len(r1)} Figma radius variables → {len(set(x["r1Token"] for x in r1))} unique R1 names; {len(r1_tw)} Tailwind default key(s); 0 shifts (name = value)', r1_dup + r1_tw)


# ---------------- build handling (ADR-0009 pending; option A = defaults-safe) ----------------
ROLE = ('bg', 'text', 'border', 'fg', 'focus-ring')
c4_by = {o[0]: o for o in ovr}
def emit(tok, cssvar):
    s = tok.split('.')
    if s[0] == 'spacing': return 'not emitted: Tailwind `--spacing` multiplier'
    if tok in STATIC_BUILTIN: return 'not emitted: static built-in'
    if s[0] == 'color' and s[1] in ROLE: return '`@theme` (role)'
    if s[0] == 'typography': return '`@utility`'
    if tok in c4_by:
        return 'not emitted: equals Tailwind default' if c4_by[tok][4] == 'same value' else 'C4: `:root --make-*` only until ADR-0009'
    if s[0] == 'color': return '`:root --make-*` only (option A)'
    return '`@theme`'
for r in rows + radius_rows: r['build'] = emit(r['token'], r['cssVar'])

CC_F = os.path.join(W, 'reports/token-naming/compile-check/results.json')
cc = json.load(open(CC_F)) if os.path.exists(CC_F) else None

out = {'inputs': {'tokens': TOK, 'mapRows': len(mp), 'figmaVariables': len(fvars), 'dryrunPending': dict(ops_pending),
                  'liveUsage': (live or {}).get('readAt'), 'liveCountingRule': (live or {}).get('countingRule'), 'tailwindThemeVars': len(twvars)},
       'counts': {'renameRows': len(rows), 'renamedByPilot': sum(1 for r in rows if r['status'] != 'candidate'), 'remaining': sum(1 for r in rows if r['status'] == 'candidate'), 'byClass': dict(Counter(r['class'] for r in rows)), 'byRisk': dict(Counter(r['risk'] for r in rows)),
                  'radiusDeferred': len(radius_rows), 'notRenamed': dict(not_renamed), 'registryWithoutFigmaVariable': len(no_fig)},
       'rows': rows, 'radiusDeferred': radius_rows, 'radiusR1': r1, 'registryWithoutFigmaVariable': no_fig, 'conflicts': conf,
       'compileCheck': cc['summary'] if cc else None}
os.makedirs(os.path.join(W, 'reports/token-naming'), exist_ok=True)
json.dump(out, open(os.path.join(W, 'reports/token-naming/audit.json'), 'w'), ensure_ascii=False, indent=1, sort_keys=True)
print(json.dumps(out['counts'], indent=1)); print('conflicts:', [(c['id'], c['severity'], c['detail']) for c in conf])

# =====================================================================================================
# Markdown reports (data sections are generated; narrative lives in the same strings for reproducibility)
# =====================================================================================================
def comps_str(r):
    extra = (f" · aliased by {r['aliasedBy']}" if r['aliasedBy'] else '') + (f" · {r['styleRefs']} style(s) e.g. {r['styleEx'][0]}" if r.get('styleRefs') else '')
    if r['directUses'] == 0:
        return ('no direct component bindings' + extra) if extra else 'no bindings, aliases or style references found'
    top = ', '.join(f"{n} ({c})" for n, c in r['components'][:3])
    more = f" +{r['componentCount'] - 3} more" if r['componentCount'] > 3 else ''
    return f"{top}{more} · {r['directUses']} bindings in {r['componentCount']} components" + extra

GROUPS = [('Theme colours (semantic, Light/Dark)', lambda t: t.startswith('color.') and t.split('.')[1] in ROLE),
          ('Typography primitives', lambda t: t.startswith('font.')),
          ('Spacing primitives', lambda t: t.startswith('spacing.')),
          ('Colour primitives', lambda t: t.startswith('color.'))]
seen = set(); L = []
L += ['# Token rename migration map (PROPOSED — nothing renamed)', '',
      '> Revision 2, 2026-11-09, after Mike\'s naming decisions: convention conditionally approved; **radius deferred** (not renamed); Tailwind default overrides **blocked** pending ADR-0009; composite typography uses **`type-*`**. Generated by `scripts/naming/build-naming-audit.py` from the registry, the approved variable map, the duplicate\'s post-sync variable read and a live usage scan. Rules: `docs/token-naming-convention.md`. Collisions: `reports/token-naming-conflicts.md`. **No Figma variable, token file or GitHub file was changed.**', '',
      '## Summary', '',
      f"- **Rename candidates:** {len(rows)} Figma variables that map 1:1 to an approved registry token (approved map, keyed by variable ID). Radius excluded. **{sum(1 for r in rows if r['status'] != 'candidate')} already renamed by the pilot; {sum(1 for r in rows if r['status'] == 'candidate')} remaining.** Figma names read from `{FIG_SOURCE}`.",
      f"- **Change class:** {dict(Counter(r['class'] for r in rows))}. Every candidate is **cosmetic**: its Figma value already equals the registry value (post-P2-01 dry-run: 0 pending operations). No value change is bundled with a rename.",
      f"- **Risk:** {dict(Counter(r['risk'] for r in rows))}. (Revision 1 had 7 high-risk radius rows; they are now deferred.)",
      f"- **Radius: DEFERRED.** {len(radius_rows)} mapped radius variables keep their names, values and bindings. A collision-free by-value proposal (R1) is listed below for review only.",
      f"- **Not renamed in this migration:** " + '; '.join(f"{k} = {v}" for k, v in sorted(not_renamed.items())) + '.',
      f"- **Registry tokens with no Figma variable:** {len(no_fig)} (`font.letter-spacing.normal` + 8 `typography.text.*` composites → `type-*` utilities and Figma text styles, not variables). Structural, out of scope.",
      f"- **Usage figures corrected:** live scan re-run {(live or {}).get('readAt', '?')} with counting rule v2 (one binding = one `node.boundVariables` entry). Revision 1 counted colour bindings twice (paint-level and node-level); typography and spacing figures were already right.", '',
      '## What a rename does and does not change', '',
      '| Unchanged by a Figma variable rename | Changed |', '|---|---|',
      '| Variable **ID** (bindings, aliases and text/effect/paint styles point to IDs) | Variable **name** shown in the Figma picker, Dev Mode and the Plugin API |',
      '| Values in every mode, alias targets, scopes, collection, mode names, `hiddenFromPublishing`, key | Names recorded in `$extensions["com.make.source"].figma` in the registry (needs a token-repo update, separate approval) |',
      '| Component structure, R-PAPER-01 variant hashes (they store variable IDs) | `collect-instances.js` binding lines (they print variable names) → **re-baseline R-PENPOT-01 after renaming** |',
      '| Published library consumers (until published) | `dryrun.py` name-based seeding (use `--map`, which is ID-based) |', '',
      'Column legend: **Class** cosmetic = name only · value = value would change · structural = token added/merged/split or rebinding needed. **Risk** high = the same short name means a different value after the rename. **Build** = how the generator emits the token while ADR-0009 is pending (option A, see conflicts report C4).', '']
for title, pred in GROUPS:
    grp = [r for r in rows if pred(r['token']) and r['token'] not in seen]
    if not grp: continue
    seen |= {r['token'] for r in grp}
    L += [f'## {title} ({len(grp)})', '', '| Current Figma name | Proposed Figma name | Canonical token | Tailwind v4 variable | Utilities | NativeWind v4 config key | Build | Class | Risk | Affected components (direct bindings) |', '|---|---|---|---|---|---|---|---|---|---|']
    for r in sorted(grp, key=lambda r: r['token']):
        L.append(f"| `{r['collection']}` › `{r['current']}` | `{r['proposed']}` | `{r['token']}` | `{r['cssVar']}` | {', '.join('`'+u+'`' for u in r['utilities'])} | `{r['nativewind']}` | {r['build']} | {r['class']}{' · **DONE (pilot)**' if r['status'] != 'candidate' else ''} | **{r['risk']}**{(' — ' + r['riskWhy']) if r['risk'] != 'low' else ''} | {comps_str(r)} |")
    L.append('')
L += [f'## Radius — DEFERRED, not renamed ({len(r1)} Figma variables)', '',
      'Names, values and bindings stay exactly as they are. The ADR-0006 registry names (column 3) would shift most names by one step; proposal **R1** (name = px value) shifts none. R1 is for review only and needs an ADR-0006 amendment and a token-repo change (both separate approvals). Details: `docs/token-naming-convention.md` §6.', '',
      '| Figma variable (kept) | Value | Registry token today (ADR-0006) | R1 registry token | R1 Figma name | R1 Tailwind | Uses (bindings / components) |', '|---|---|---|---|---|---|---|']
for x in r1:
    L.append(f"| `{x['figma']}` | {x['px']}px | {('`' + x['adr0006Token'] + '`') if x['adr0006Token'] else '— (no token)'} | `{x['r1Token']}` | `{x['r1Figma']}` | `{x['r1Utility']}` ({x['r1Var']}) | {x['uses']} / {x['components']} |")
L += ['', f'## Composite typography → `type-*` ({len(typo)} registry composites, no Figma variables)', '',
      'Rule T: `type-` + path after `typography.`, with the default `text` group dropped. Text styles in Figma are **not renamed** here.', '',
      '| Registry token | Generated class | Figma text style today | Equivalent single utilities (registry note) |', '|---|---|---|---|']
for p in typo:
    L.append(f"| `{p}` | `{type_class(p)}` | `{reg[p].get('figma') or '—'}` | `{reg[p].get('classes') or ''}` |")
L += ['', '## Structural items (not part of a cosmetic rename)', '',
      '| Item | Count | Why structural | Proposed handling |', '|---|---|---|---|',
      f"| Registry tokens with no Figma variable | {len(no_fig)} | `typography.text.*` are composites → Figma **text styles**; `font.letter-spacing.normal` has no variable | Generate `type-*` utilities (convention §7); align text styles in a separate step |",
      f"| Figma-only variables in synced collections | {not_renamed.get('figma-only in synced collections: unchanged in this migration', 0)} | No approved registry token. Renaming them would invent names the registry doesn't have (requirement 4) | Keep names; add tokens through proposals when a component needs them (growth model), then rename with the same rules |",
      '| `3. Spacing` semantic t-shirt variables (`spacing-xs`, `spacing-lg`…) | 17 | Heavily bound in components (P1-05) but deliberately not in the registry ("use primitives directly") | Keep; replacing them means rebinding components (structural, separate approval) |',
      f"| Value-duplicate Figma-only primitives (conflict C8) | 3 | Same value as a registry primitive under another name | Merge candidates: alias or rebind later; never by rename |",
      f"| Radius renames (R1) | {len(r1)} | Needs ADR-0006 amendment + registry path change + 1 new token (`radius.10`) | Deferred (Mike, 2026-11-09) |",
      '| 171 component colours (`Component colors/…`) | 171 | Deferred (D-05) | **Unchanged** |',
      '| `4. Widths`, `5. Containers` | 15 | No registry tokens | Unchanged |', '',
      '## Rollback requirements', '',
      '1. **Before each batch:** fresh read of the batch\'s variables (ID, name, collection, values, scopes, codeSyntax) saved to `reports/token-naming/rename-batch-<n>-before.json`. The approved map already stores each old name (`figmaName`).',
      '2. **Rename by ID only.** Never look a variable up by name inside the write script; refuse any file other than the duplicate.',
      '3. **Rollback** = set `name` back from the before-file, by ID, in one call. Bindings, values and aliases are untouched by a rename, so no other state needs restoring.',
      '4. **After each batch:**',
      '   - E1 variant hashes must be unchanged (IDs only).',
      '   - Instance binding counts must be unchanged.',
      '   - Re-baseline `collect-instances` (names in its lines change by design).',
      '   - The dry-run with `--map` must report 0 operations.',
      '5. **Token repo:** update `com.make.source.figma` for renamed tokens via a proposal (separate approval). Until then the map file is the source of the name ↔ ID link.',
      '6. **Not reversible once published:** consumers would see new names. Rename only before the first publish of the new library, or announce in the changelog.', '']
open(os.path.join(W, 'reports/token-rename-migration-map.md'), 'w').write('\n'.join(L) + '\n')

C = ['# Token naming conflicts and collisions (audit)', '',
     '> Revision 2, 2026-11-09. Generated by `scripts/naming/build-naming-audit.py`. Tailwind behaviour verified in the **tailwindcss 4.3.5** source **and by a local compile** (Node.js ' + (cc['summary']['node'] + ' LTS ' + str(cc['summary']['nodeLts']) if cc else 'n/a') + '; `scripts/naming/compile-check.mjs`, results in `reports/token-naming/compile-check/`). 4.3.5 is the version pinned in `design-tokens/package-lock.json` (installed integrity hash matches the lockfile); the **app** version is still UNVERIFIED. Nothing in Figma or the token repo was changed.', '',
     '## Verified Tailwind 4.3.5 behaviour (basis for the checks)', '',
     '| Behaviour | Evidence | Consequence |', '|---|---|---|',
     '| `bg-*` resolves `--background-color-*` then `--color-*` | source `valueThemeKeys:["--background-color","--color"]`; compile S1: `bg-brand-primary` → `background-color: var(--background-color-brand-primary)`, `bg-bg-brand-primary` → nothing | Roles get plain classes. ADR-0004 hypothesis **confirmed by compile** |',
     '| Text, border and ring colour resolve `--text-color-*`, `--border-color-*`, `--ring-color-*` first | compile S1: `text-error-primary`, `border-primary`, `ring-primary` | Utility-scoped roles work |',
     '| `text-<x>` tries **colour first**, then font size | source: colour branch precedes `--text` | A colour key equal to a font-size key would hide the font size → C2 |',
     '| Spacing is one multiplier `--spacing: 0.25rem` | compile S1: `p-3` → `calc(var(--spacing) * 3)` | Registry spacing (n × 4px) needs **no** emitted variables → C7 |',
     '| `rounded-*` reads only `--radius-*` keys; `none`/`full` are static | compile S3/S3b: `rounded-6` exists only when `--radius-6` is registered; `rounded-5` → nothing | By-value radius keys are safe and never collide with defaults → C13 |',
     '| No core utility uses the `type-` prefix | compile S2: `type-base` → nothing; `md:` and `hover:` variants work on `@utility type-*` | Composite typography can use `type-*` → C12 |',
     '| A key in `@theme` silently replaces the default for **every** screen | compile S4: `bg-gray-100` changes from `oklch(96.7% 0.003 264.542)` to `#f5f5f5` | Why C4 overrides stay blocked until ADR-0009 |', '']
if cc:
    C += [f"**Compile check:** {cc['summary']['passed']}/{cc['summary']['total']} assertions passed (`reports/token-naming/compile-check/results.json`; generated CSS per scenario in the same folder; byte-identical on rerun).", '']
C += ['## Results', '', '| ID | Check | Severity | Result | Recommended resolution |', '|---|---|---|---|---|']
RESOLVE = {
 'C1': 'Generator fails on any duplicate class.',
 'C2': 'Generator fails if a `color.text.*` role or palette key equals a font-size key.',
 'C3': 'Generator fails if a font family equals a weight name.',
 'C4': '**Blocked pending ADR-0009.** Do not override. Generator uses option A (below): same-value keys are not emitted; different-value keys are emitted only as `:root --make-*` variables. Alternatives B–D for developer review.',
 'C5': 'Rename script refuses a name that already exists in the collection.',
 'C6': 'Resolved for now by deferring radius. Permanent fix: R1 (C13).',
 'C7': 'Keep spacing tokens as n × 4px; otherwise emit explicit `--spacing-<n>` keys.',
 'C8': 'Structural: alias or rebind later; never solved by renaming. Not in this migration.',
 'C9': 'Accept `p-0.5`. `rounded-2-5xl` disappears under R1 (`rounded-20`).',
 'C10': 'Generator fails on a kept/renamed name collision after normalisation.',
 'C11': 'Generator fails on look-alike kept/renamed names.',
 'C12': 'Generator fails on a duplicate or doubled-word `type-*` class.',
 'C13': 'R1 recommended for radius (review only; ADR-0006 amendment + token-repo change needed).',
}
for c in conf:
    C.append(f"| {c['id']} | {c['kind']} | {c['severity']} | {c['detail']} | {RESOLVE.get(c['id'], '')} |")
C += ['', '## C4 in full — registry keys that share a Tailwind 4.3.5 default theme variable', '',
      f"Authoritative list: the {len(twvars)} variables in the installed `tailwindcss/theme.css`. **{len(ovr)} shared, {len(diff_ovr)} with a different value.**", '',
      '> Correction to revision 1 (27 shared / 11 different): `font.letter-spacing.normal` was a false positive (0px = 0em) and `font.family.sans` was missed (the reference JSON has no font families). The gray scale accounts for 10 of the 11 real differences.', '',
      '| # | Registry token | Tailwind variable | MAKE value | Tailwind default | Result | Build handling (option A) |', '|---|---|---|---|---|---|---|']
for i, o in enumerate(ovr, 1):
    L4 = 'not emitted (Tailwind default already equals it)' if o[4] == 'same value' else '`:root --make-' + o[0].replace('.', '-') + '` only; no utility'
    C.append(f"| {i} | `{o[0]}` | `{o[1]}` | {o[2]} | {o[3]} | {'same' if o[4] == 'same value' else '**DIFFERENT**'} | {L4} |")
C += ['', '### Backward-compatible alternatives (for developer review; ADR-0009 decides)', '',
      '| Option | What the build does | Existing screens | MAKE values available as | Cost |', '|---|---|---|---|---|',
      '| **A — roles only (recommended interim)** | `@theme` gets semantic roles only (`--background-color-*`, `--text-color-*`, `--border-color-*`, `--ring-color-*`, `--color-fg-*`). Primitives are plain `:root --make-color-*` variables the roles point to. Same-value keys are not emitted. | **Unchanged** (no default key touched) | Role classes (`bg-primary`, `text-error-primary`); raw primitives only via `bg-(--make-color-gray-100)` | Raw palette classes like `bg-gray-100` keep meaning Tailwind gray |',
      '| B — MAKE-only family names | Primitives exposed in `@theme` under names Tailwind does not use, e.g. `gray` → `make-gray` (`bg-make-gray-100`) | Unchanged | Role classes + `bg-make-gray-*` | Registry family rename (token repo, structural); longer names |',
      '| C — scoped entry | A second CSS entry (`make.css`) with full `@theme` incl. the 11 different keys, loaded only by migrated surfaces / the mobile app | Unchanged where `make.css` is not loaded | Everything, with MAKE values | Two builds; a screen must never load both entries |',
      '| D — global override (needs ADR-0009 "yes") | Emit all 28 keys in the single `@theme` (or clear defaults with `--color-gray-*: initial`) | **Changes** every `bg-gray-*` and `font-sans` use | Everything | Visual regression on legacy screens; not backward-compatible |', '',
      'NativeWind: options A–C map to `theme.extend` (A: roles only + `vars()`), so they are equally safe on mobile; D would replace the NativeWind default palette.', '',
      '## Platform risks not computable from the data (to verify in the pilot)', '',
      '| Risk | Why | Mitigation |', '|---|---|---|',
      '| App Tailwind / NativeWind versions unknown | GitLab app repo not accessible; nothing declared in the token repo | Devs confirm; compile check is re-runnable against their exact version (`compile-check.mjs <their node_modules dir>`) |',
      '| `rem` = 14px on native (NativeWind 4 default) | `p-4` would render 14px on mobile vs 16px on web | Pin rem to 16 / emit px in the mobile config; verify in pilot code-gen |',
      '| Focus rings on native | React Native has no box-shadow rings | Native focus style (border/shadow) per component spec |',
      '| Figma `/` grouping changes the picker layout | Groups become `color/bg`, `color/text`… instead of `Colors/Background`… | Designer note with the pilot; reversible by ID |',
      '| Our regression collector prints variable names | `collect-instances` binding lines change after a rename | Re-baseline R-PENPOT-01 right after each batch (expected, not a regression) |',
      '']
for c in conf:
    if not c['items'] or c['id'] == 'C4': continue
    C += [f"### {c['id']} — {c['kind']}", '']
    for it in c['items'][:40]:
        C.append('- ' + (' · '.join(f'`{x}`' if isinstance(x, str) else str(x) for x in it) if isinstance(it, (list, tuple)) else f'`{it}`'))
    C.append('')
open(os.path.join(W, 'reports/token-naming-conflicts.md'), 'w').write('\n'.join(C) + '\n')
print('reports written')
