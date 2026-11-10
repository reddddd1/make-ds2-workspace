#!/usr/bin/env python3
"""Audit of the Figma variable groups that are only partly registry-backed (naming follow-up, Decision 1). Read-only, deterministic.

Inputs (all saved read-only reads / local files):
  reports/naming-followup/figma-variables-current.json   682 variables (component colours slim)
  reports/naming-followup/vars/CC-*.json                 171 component colours with alias targets
  reports/naming-followup/pilot-set-bindings.json        bindings inside the 6 pilot component sets
  reports/token-naming/live-usage-duplicate.json         bindings per variable ID across all 95 main components + style refs
  reports/token-naming/audit.json                        registry-backed (mapped) variables and their original names
  <design-tokens>/tokens/**                              registry values (equivalence check)
Outputs: reports/token-naming-group-audit.md, reports/token-naming/group-audit.json
Usage: python3 -I scripts/naming/build-group-audit.py <design-tokens dir>
Never writes to Figma or the token repo.
"""
import json, glob, os, re, sys
from collections import Counter, defaultdict
TOK = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Documents/Codex/design-tokens')
W = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = lambda p: json.load(open(os.path.join(W, p)))

# ---------------- Figma variables (full alias graph) ----------------
fig = {}
cur = J('reports/naming-followup/figma-variables-current.json')
for c in cur['collections']:
    if c.get('slim'): continue
    for v in c['variables']: fig[v['id']] = dict(v, collection=c['name'], modes=c['modes'])
for f in ('CC-utility', 'CC-components', 'CC-alpha'):
    d = J(f'reports/naming-followup/vars/{f}.json')
    for c in d['collections']:
        for v in c['variables']: fig[v['id']] = dict(v, collection=c['name'], modes=c['modes'])
assert len(fig) == 682, len(fig)
aliased_by = defaultdict(set)
for v in fig.values():
    for x in v['values'].values():
        if isinstance(x, dict) and x.get('alias'): aliased_by[x['alias']].add(v['id'])
def resolve(vid, mode, depth=0):
    v = fig.get(vid)
    if not v or depth > 8: return None
    x = v['values'].get(mode) if mode in v['values'] else next(iter(v['values'].values()))
    if isinstance(x, dict) and x.get('alias'): return resolve(x['alias'], mode, depth + 1)
    return x.lower() if isinstance(x, str) and x.startswith('#') else x

# ---------------- registry ----------------
def walk(d, p=''):
    for k, v in d.items():
        if k.startswith('$'): continue
        if isinstance(v, dict) and '$value' in v: yield p + k, v
        elif isinstance(v, dict): yield from walk(v, p + k + '.')
reg = defaultdict(dict)
for f in sorted(glob.glob(TOK + '/tokens/**/*.tokens.json', recursive=True)):
    mode = 'Light mode' if '/light/' in f else 'Dark mode' if '/dark/' in f else 'all'
    for p, t in walk(json.load(open(f))): reg[p][mode] = t['$value']
def reg_hex(p, mode, depth=0):
    e = reg.get(p)
    if not e or depth > 6: return None
    v = e.get(mode, e.get('all'))
    if isinstance(v, str) and v.startswith('{'): return reg_hex(v.strip('{}'), mode, depth + 1)
    return v.get('hex', '').lower() if isinstance(v, dict) and 'hex' in v else v
reg_prim_hex = defaultdict(list)
for p, e in reg.items():
    if p.startswith('color.') and 'all' in e:
        h = reg_hex(p, 'all')
        if h: reg_prim_hex[h].append(p)
reg_roles = {p: (reg_hex(p, 'Light mode'), reg_hex(p, 'Dark mode')) for p, e in reg.items() if 'Light mode' in e}

# ---------------- mapped (registry-backed) variables ----------------
au = J('reports/token-naming/audit.json')
mapped = {r['variableId']: r for r in au['rows'] + au['radiusDeferred']}

# ---------------- usage ----------------
live = J('reports/token-naming/live-usage-duplicate.json')
pil = J('reports/naming-followup/pilot-set-bindings.json')['use']
def usage(vid):
    u = live['use'].get(vid) or {'n': 0, 'c': 0, 'top': []}
    st = live['styles'].get(vid) or {'n': 0, 'ex': []}
    p = pil.get(vid.replace('VariableID:', ''), {})
    return u, st, p
def mirror_only(v, st):
    """The library mirrors every palette primitive as a paint style of the same name ('Brand/25' for Colors/Brand/25)."""
    if st['n'] != 1: return False
    return st['ex'][0] == 'paint: ' + v['name'].replace('Colors/', '', 1)

# Needed by the pilot components: bound in a pilot set, or an alias target (transitively) of something that is
needed = set('VariableID:' + k for k in pil if '/' not in k)
frontier = list(needed)
while frontier:
    x = frontier.pop()
    v = fig.get(x)
    if not v: continue
    for val in v['values'].values():
        if isinstance(val, dict) and val.get('alias') and val['alias'] not in needed:
            needed.add(val['alias']); frontier.append(val['alias'])

# ---------------- groups ----------------
def fam_of(coll, name):
    p = name.split('/')
    return coll + ' › ' + ('/'.join(p[:2]) if p[0] in ('Colors',) else p[0])
EXCL = ('4. Widths', '5. Containers', '2. Radius', '3. Spacing')
groups = defaultdict(lambda: {'mapped': [], 'members': []})
for vid, r in mapped.items():
    if r['token'].startswith('radius.'): continue
    groups[fam_of(r['collection'], r['originalName'])]['mapped'].append(r)
for vid, v in fig.items():
    if v['collection'] in EXCL or v['name'].startswith('Component colors/') or vid in mapped: continue
    groups[fam_of(v['collection'], v['name'])]['members'].append(v)
partial = {k: g for k, g in groups.items() if g['mapped'] and g['members']}

# ---------------- proposed names (convention §8/§9) ----------------
FAMILY = {'Gray (light mode)': 'gray', 'Gray (dark mode)': 'gray-dark', 'Gray (dark mode alpha)': 'gray-dark-alpha'}
def slug(s): return s.replace('é', 'e').replace('_', '-').replace(' ', '-').lower()
TW_SIZE = {12: 'xs', 14: 'sm', 16: 'base', 18: 'lg', 20: 'xl', 24: '2xl', 30: '3xl', 36: '4xl', 48: '5xl', 60: '6xl', 72: '7xl'}  # Tailwind 4.3.5 default text sizes (px)
FIG_SIZE_PX = {}  # figma size name (text-md, display-xs …) -> px, from the Font size variables
for v in fig.values():
    if v['collection'] == '6. Typography' and (v['name'].startswith('Font size/') or mapped.get(v['id'], {}).get('originalName', '').startswith('Font size/')):
        nm = mapped[v['id']]['originalName'] if v['id'] in mapped else v['name']
        FIG_SIZE_PX[nm.split('/', 1)[1]] = resolve(v['id'], 'Value')
ROLE_PREFIX = {'Background': ('bg', 'bg-'), 'Text': ('text', 'text-'), 'Border': ('border', 'border-'), 'Foreground': ('fg', 'fg-')}
def proposed(v):
    """-> (name, deterministic, note)"""
    n = v['name']; p = n.split('/')
    if v['collection'] == '_Primitives' and p[0] == 'Colors':
        fam = FAMILY.get(p[1], slug(p[1]))
        return f'color/{fam}/{p[2]}', True, ''
    if v['collection'] == '1. Color modes' and p[0] == 'Colors':
        if p[1] in ROLE_PREFIX:
            ns, pre = ROLE_PREFIX[p[1]]
            role = re.sub(r'\s*\([^)]*\)', '', p[2])
            role = role[len(pre):] if role.startswith(pre) else role
            note = ''
            if re.search(r'on-brand(primary|secondary|tertiary)', role):
                return f'color/{ns}/{slug(role)}', False, 'run-together `on-brand…` word: split needs a naming decision'
            return f'color/{ns}/{slug(role)}', True, note
        if p[1] == 'Effects':
            if p[2] == 'Focus rings':
                return 'color/focus-ring/' + slug(p[3].replace('focus-ring-', '')), True, ''
            if p[2] == 'Shadows':
                return 'color/shadow/' + slug(p[3].replace('shadow-', '')), False, 'no `color.shadow.*` namespace in the convention yet (shadows are effect styles in code)'
    if v['collection'] == '6. Typography':
        kind, nm = p[0], p[1]
        if kind == 'Font size':
            px = FIG_SIZE_PX.get(nm)
            return (f'font/size/{TW_SIZE[px]}', True, f'{px}px = Tailwind `{TW_SIZE[px]}` (name by value)') if px in TW_SIZE else (f'font/size/{slug(nm)}', False, f'{px}px has no Tailwind size name')
        if kind == 'Line height':
            px = FIG_SIZE_PX.get(nm)
            return (f'font/line-height/{TW_SIZE[px]}', True, f'pairs with font size {px}px') if px in TW_SIZE else (f'font/line-height/{slug(nm)}', False, 'paired font size has no Tailwind name')
        if kind == 'Font weight':
            if 'italic' in nm: return f'font/weight/{slug(nm)}', False, 'italic is a style, not a weight, in Tailwind (`italic` utility)'
            return f'font/weight/{slug(nm)}', True, ''
        if kind == 'Font family':
            return 'font/family/' + slug(nm.replace('font-family-', '')), False, 'no Tailwind family slot for a secondary/display font (e.g. `font/family/display`?)'
    return slug(n), False, 'no rule'

# ---------------- classify ----------------
CLASSES = ['Required canonical token', 'Existing alias or equivalent', 'Legacy but still used', 'Unused or intentionally excluded', 'Requires design decision']
def equivalent(v):
    if v['type'] != 'COLOR': return []
    if v['collection'] == '_Primitives':
        return reg_prim_hex.get(resolve(v['id'], 'Style') or '', [])
    lv, dv = resolve(v['id'], 'Light mode'), resolve(v['id'], 'Dark mode')
    grp = v['name'].split('/')[1] if v['name'].startswith('Colors/') else ''
    ns = {'Background': 'bg', 'Text': 'text', 'Border': 'border', 'Foreground': 'fg'}.get(grp, 'focus-ring' if 'Focus rings' in v['name'] else None)
    # same role namespace only (a text colour is never "equivalent" to a background role), same value in Light AND Dark
    return [p for p, (l, d) in sorted(reg_roles.items()) if ns and p.split('.')[1] == ns and l == lv and d == dv and l]
rows = []
for gname in sorted(partial):
    g = partial[gname]
    for v in sorted(g['members'], key=lambda v: v['name']):
        u, st, p = usage(v['id'])
        ab = sorted(aliased_by.get(v['id'], []))
        ab_kind = Counter('registry-backed' if a in mapped else 'component colour' if fig[a]['name'].startswith('Component colors/') else 'Figma-only' for a in ab)
        out = sorted({x['name'] for x in v['values'].values() if isinstance(x, dict) and x.get('alias')})
        name, det, note = proposed(v)
        eq = equivalent(v)
        used = u['n'] > 0 or bool(ab) or (st['n'] > 0 and not mirror_only(v, st))
        if eq: cls, why = CLASSES[1], 'same value as registry ' + ', '.join(f'`{x}`' for x in eq[:3])
        elif not used: cls, why = CLASSES[3], 'no bindings, no aliases' + (', only its mirror paint style' if st['n'] else '')
        elif not det: cls, why = CLASSES[4], note
        elif v['id'] in needed: cls, why = CLASSES[0], 'bound in a pilot component' if sum(p.values()) else 'alias target of a variable the pilot components use'
        else: cls, why = CLASSES[2], 'used outside the pilot components'
        bind = u['n']; sref = st['n']
        risk = 'high' if bind >= 200 or sref >= 10 else 'medium' if bind > 0 or ab or sref > 1 else 'low'
        values = {m: (('→ ' + x['name']) if isinstance(x, dict) else x) for m, x in v['values'].items()}
        rows.append({'group': gname, 'id': v['id'], 'name': v['name'], 'type': v['type'], 'values': values, 'proposed': name, 'deterministic': det, 'nameNote': note,
                     'class': cls, 'why': why, 'equivalent': eq, 'aliasesOut': out, 'aliasedBy': len(ab), 'aliasedByKinds': dict(ab_kind),
                     'aliasedByEx': [fig[a]['name'] for a in ab[:3]], 'bindings': bind, 'components': u['c'], 'topComponents': u['top'][:3],
                     'pilotBindings': p, 'styleRefs': sref, 'styleEx': st['ex'][:2], 'mirrorStyleOnly': mirror_only(v, st), 'neededByPilot': v['id'] in needed, 'risk': risk})

summary = []
for gname in sorted(partial):
    rs = [r for r in rows if r['group'] == gname]
    cc = Counter(r['class'] for r in rs)
    summary.append({'group': gname, 'registryBacked': len(partial[gname]['mapped']), 'figmaOnly': len(rs), 'classes': dict(cc),
                    'bindings': sum(r['bindings'] for r in rs), 'styleRefs': sum(r['styleRefs'] for r in rs)})
out = {'groups': len(partial), 'figmaOnlyMembers': len(rows), 'byClass': dict(Counter(r['class'] for r in rows)), 'summary': summary, 'rows': rows}
json.dump(out, open(os.path.join(W, 'reports/token-naming/group-audit.json'), 'w'), indent=1, ensure_ascii=False, sort_keys=True)

# ---------------- Markdown ----------------
REC = {
 'Required canonical token': 'Propose a registry token (proposal, separate approval), then rename with its group',
 'Existing alias or equivalent': 'No new value: either a registry alias to the equivalent token, or rebind to it and retire the duplicate (structural, separate approval)',
 'Legacy but still used': 'Keep; decide per group whether to add a token (completes the group) or mark deprecated in Figma',
 'Unused or intentionally excluded': 'Exclude from the registry; keep in Figma for now, candidate for removal later (separate approval)',
 'Requires design decision': 'Mike / design decides the role or name first (see note)',
}
L = ['# Partially renamed groups — audit and proposal (PROPOSED, nothing changed)', '',
     '> 2026-11-09. Decision 1 follow-up: consistent naming across complete Figma groups is the target. **No rename executed and no registry token created.** Generated by `scripts/naming/build-group-audit.py` from saved read-only reads (`reports/naming-followup/`) and the token repo (read-only).', '',
     '## Summary', '',
     f"- **{len(partial)} groups** contain both registry-backed variables (renamed or planned) and Figma-only variables: **{len(rows)} Figma-only variables** to classify.",
     '- By class: ' + ', '.join(f"**{k}** {v}" for k, v in sorted(Counter(r['class'] for r in rows).items(), key=lambda x: CLASSES.index(x[0]))) + '.',
     '- **Rules (deterministic, applied in this order):**',
     '  1. *Existing alias or equivalent*: same value as a registry token (primitives: same hex; roles: same resolved value in Light **and** Dark).',
     '  2. *Unused or intentionally excluded*: no component bindings, nothing aliases it, and no style use beyond its own mirror paint style.',
     '  3. *Requires design decision*: the convention gives no unambiguous name (italic weights, sizes without a Tailwind name, secondary font, shadow colours, run-together `on-brand…` roles).',
     '  4. *Required canonical token*: bound inside a pilot component set (Button, Input field, Modal, _Modal header, _Modal actions, Alert) or an alias target, directly or transitively, of a variable those components use.',
     '  5. *Legacy but still used*: everything else that is used (bindings in other components, aliases from roles/component colours, or real style use).',
     '- **Usage:** bindings = own-layer bindings across all 95 main components (rule v2). Pilot = bindings inside the 6 pilot sets. Aliased by = variables whose value points to it (registry-backed / component colour / Figma-only).',
     '- **Risk** (for a later rename): high = ≥ 200 bindings or ≥ 10 style refs; medium = any binding, alias or > 1 style ref; low = otherwise. Renames stay name-only and ID-based.', '',
     '## Groups', '',
     '| Group | Registry-backed | Figma-only | Required | Equivalent | Legacy used | Unused | Decision | Bindings (Figma-only) | Recommendation |', '|---|---|---|---|---|---|---|---|---|---|']
def grec(s):
    c = s['classes']
    if c.get(CLASSES[4]): return 'Design decisions first, then complete'
    if c.get(CLASSES[0]) or c.get(CLASSES[2]): return 'Complete via a registry proposal'
    return 'Complete by mapping to existing tokens / excluding unused'
for s in summary:
    c = s['classes']
    L.append(f"| `{s['group']}` | {s['registryBacked']} | {s['figmaOnly']} | {c.get(CLASSES[0], 0)} | {c.get(CLASSES[1], 0)} | {c.get(CLASSES[2], 0)} | {c.get(CLASSES[3], 0)} | {c.get(CLASSES[4], 0)} | {s['bindings']:,} | {grec(s)} |")
L += ['', '## What each class means for the group', '', '| Class | Proposed handling |', '|---|---|'] + [f'| {k} | {REC[k]} |' for k in CLASSES] + ['']
for s in summary:
    g = s['group']; rs = [r for r in rows if r['group'] == g]
    L += [f"## {g}", '', f"Registry-backed (renamed or planned): " + ', '.join(f"`{r['originalName']}`" + (' ✓' if r.get('status', '').startswith('DONE') else '') for r in sorted(partial[g]['mapped'], key=lambda r: r['originalName'])) + '  (✓ = renamed by the pilot)', '',
          '| Variable ID | Current name | Proposed name | Class | Why | Value(s) | Aliases → | Aliased by | Bindings / comps (pilot) | Styles | Risk |', '|---|---|---|---|---|---|---|---|---|---|---|']
    for r in rs:
        vals = ' · '.join(f"{m.split(' ')[0]}: {x}" for m, x in r['values'].items())
        ab = (f"{r['aliasedBy']} ({', '.join(f'{k} {v}' for k, v in sorted(r['aliasedByKinds'].items()))})") if r['aliasedBy'] else '—'
        pb = sum(r['pilotBindings'].values())
        L.append(f"| `{r['id']}` | `{r['name']}` | `{r['proposed']}`{'' if r['deterministic'] else ' ⚠'} | {r['class']} | {r['why']} | {vals} | {', '.join('`' + x + '`' for x in r['aliasesOut']) or '—'} | {ab} | {r['bindings']} / {r['components']}" + (f" ({pb} pilot)" if pb else '') + f" | {r['styleRefs']}{' (mirror)' if r['mirrorStyleOnly'] else ''} | {r['risk']} |")
    L.append('')
L += ['## Not changed by this proposal', '', '- No rename, no registry token, no value. The 171 component colours, radius (deferred) and Tailwind global overrides (ADR-0009) are out of scope.',
      '- Groups outside the 18 (e.g. `Colors/Blue`, `Colors/Gray (dark mode alpha)`, `Font size` display sizes are inside `Font size`) keep their names until a registry proposal covers them.', '']
open(os.path.join(W, 'reports/token-naming-group-audit.md'), 'w').write('\n'.join(L) + '\n')
print(len(partial), 'groups;', len(rows), 'figma-only;', dict(Counter(r['class'] for r in rows)))
for s in summary: print(f"  {s['group']:45} mapped={s['registryBacked']:2} figmaOnly={s['figmaOnly']:2} {s['classes']}")
