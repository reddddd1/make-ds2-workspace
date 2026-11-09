#!/usr/bin/env python3
"""P1-09 step 2: read-only token-sync dry-run (docs/token-sync-spec.md, APPROVED 2026-11-09).

Usage:
  python3 -I scripts/token-sync/dryrun.py <figma-variables.json> <design-tokens dir> <out dir> [--usage registry/raw/figma-colour-usage-*.json]

Inputs are read only: a variable dump from scripts/token-sync/collect-variables.js and the token repo's tokens/.
Writes only to <out dir>: dryrun.json, dryrun.md and figma-variable-map.<fileKey>.proposed.json.
No Figma access, no writes to the token repo. Exit 0 = no conflicts, 1 = conflicts present.
"""
import argparse, glob, json, math, os, re, sys
from collections import Counter, defaultdict

ORIGINAL = 'xJoAz66aekAToyhBmfGNt0'
MODES = {'light': 'Light mode', 'dark': 'Dark mode'}                      # §3 mode mapping by name
WEIGHT = {400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold'}    # §3 font weight table
IN_SCOPE = {'_Primitives', '1. Color modes', '2. Radius', '3. Spacing', '6. Typography'}
TYPE_OK = {'color': {'COLOR'}, 'dimension': {'FLOAT'}, 'number': {'FLOAT'}, 'fontWeight': {'STRING'}, 'fontFamily': {'STRING'}}


# ---------- helpers ----------
def walk(d, p=''):
    for k, v in d.items():
        if k.startswith('$'): continue
        if isinstance(v, dict) and '$value' in v: yield p + k, v
        elif isinstance(v, dict): yield from walk(v, p + k + '.')


def clean_src(s):
    s = re.sub(r'\s*=\s*.*$', '', s)
    return re.sub(r'\s*\([^)]*\)\s*$', '', s).strip()


def short(name):
    return re.sub(r'\s*\([^)]*\)\s*$', '', name.split('/')[-1]).strip()


def rgba(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def _lab(c):
    def lin(x): return x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(x) for x in c)
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047; y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b; z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 216 / 24389 else (24389 / 27 * t + 16) / 116
    return 116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))


def de2000(h1, h2):
    L1, a1, b1 = _lab(rgba(h1)); L2, a2, b2 = _lab(rgba(h2))
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2); Cb = (C1 + C2) / 2; G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2; C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p, h2p = math.degrees(math.atan2(b1, a1p)) % 360, math.degrees(math.atan2(b2, a2p)) % 360
    dh = 0 if C1p * C2p == 0 else (h2p - h1p if abs(h2p - h1p) <= 180 else h2p - h1p - 360 if h2p > h1p else h2p - h1p + 360)
    dL, dC, dH = L2 - L1, C2p - C1p, 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dh / 2))
    Lb, Cbp = (L1 + L2) / 2, (C1p + C2p) / 2
    hb = h1p + h2p if C1p * C2p == 0 else ((h1p + h2p) / 2 if abs(h1p - h2p) <= 180 else (h1p + h2p + 360) / 2 if h1p + h2p < 360 else (h1p + h2p - 360) / 2)
    T = 1 - .17 * math.cos(math.radians(hb - 30)) + .24 * math.cos(math.radians(2 * hb)) + .32 * math.cos(math.radians(3 * hb + 6)) - .2 * math.cos(math.radians(4 * hb - 63))
    Sl = 1 + .015 * (Lb - 50) ** 2 / math.sqrt(20 + (Lb - 50) ** 2); Sc = 1 + .045 * Cbp; Sh = 1 + .015 * Cbp * T
    Rt = -2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * math.sin(math.radians(60 * math.exp(-((hb - 275) / 25) ** 2)))
    return round(math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh)), 2)


def token_hex(v):
    if not isinstance(v, dict) or 'hex' not in v: return None
    h = v['hex'].lower()
    a = v.get('alpha')
    if a is not None and a < 1: h = h[:7] + format(round(a * 255), '02x')
    return h


# ---------- main ----------
def main():
    ap = argparse.ArgumentParser(); ap.add_argument('figma'); ap.add_argument('tokens'); ap.add_argument('out'); ap.add_argument('--usage')
    a = ap.parse_args()
    F = json.load(open(a.figma)); file_key = F['fileKey']
    byid, bycol = {}, defaultdict(dict)
    for c in F['collections']:
        for v in c['variables']:
            v = dict(v, collection=c['name'], slim=c.get('slim', False)); byid[v['id']] = v; bycol[c['name']][v['name']] = v
    usage = defaultdict(list)
    if a.usage:
        for it in json.load(open(a.usage))['items']:
            for var, (d, s) in it['colours'].items(): usage[var.replace(' (remote)', '')].append(f"{it['name']} ({d + s})")

    toks = []
    for f in sorted(glob.glob(os.path.join(a.tokens, 'tokens/**/*.tokens.json'), recursive=True)):
        rel = os.path.relpath(f, a.tokens); mode = 'light' if '/light/' in rel else 'dark' if '/dark/' in rel else None
        tier = 'theme' if '/themes/' in rel else 'semantic' if '/semantic/' in rel else 'primitive'
        for name, t in walk(json.load(open(f))):
            src = (t.get('$extensions') or {}).get('com.make.source') or {}
            toks.append({'token': name, 'file': rel, 'mode': mode, 'tier': tier, 'type': t.get('$type'), 'value': t['$value'], 'figma': src.get('figma'), 'src': src, 'description': t.get('$description')})
    # $type may be inherited from a group; infer where missing
    for t in toks:
        if not t['type']:
            v = t['value']
            t['type'] = 'color' if isinstance(v, dict) and 'hex' in v else 'dimension' if isinstance(v, dict) and 'unit' in v else \
                'fontFamily' if isinstance(v, list) else 'fontWeight' if t['token'].startswith('font.weight') else \
                'number' if isinstance(v, (int, float)) else 'typography' if isinstance(v, dict) else 'alias' if isinstance(v, str) else None

    # ---- §2 identity: seed the map ----
    def target_collection(t):
        if t['tier'] == 'theme': return '1. Color modes'
        if t['tier'] == 'semantic': return None                              # semantic typography -> text styles (out of scope)
        if t['token'].startswith('radius.'): return '2. Radius'
        if t['token'].startswith('font.'): return '6. Typography'
        return '_Primitives'

    rows, conflicts, mapping = [], [], {}
    def add(**kw): rows.append(kw)
    tok_var = {}                                                            # (token) -> variable id (primitives and themes share one var per token)
    claims = defaultdict(list)
    pending = []
    for t in toks:
        col = target_collection(t)
        if col is None or not t['figma'] or (t['figma'] and t['figma'].startswith('All Text styles')):
            if t['tier'] == 'semantic' or (t['figma'] or '').startswith('All Text styles'):
                add(op='skip-out-of-scope', token=t['token'], mode=t['mode'], reason='maps to text styles, not variables (§1)'); continue
        cands = []
        if t['figma']:
            names = bycol[col]
            key_full, key_short = clean_src(t['figma']), short(clean_src(t['figma']))
            cands = [v for n, v in names.items() if not v['slim'] and (n == t['figma'] or n == key_full or (t['tier'] == 'theme' and short(n) == key_short))]
            if col == '1. Color modes': cands = [v for v in cands if v['name'].startswith('Colors/')]
        pending.append((t, col, cands))
        for v in cands: claims[v['id']].append(t['token'])

    created = {}
    for t, col, cands in pending:
        if len(cands) > 1:
            conflicts.append({'rule': '1 ambiguous identity', 'token': t['token'], 'detail': [v['name'] for v in cands]}); continue
        if cands and len(set(claims[cands[0]['id']])) > 1:
            conflicts.append({'rule': '1 ambiguous identity', 'token': t['token'], 'detail': sorted(set(claims[cands[0]['id']]))}); continue
        if not cands:
            # §4 create — name in the target group's Figma style, taken from a sibling token
            sib = next((s for s in toks if s['token'].rsplit('.', 1)[0] == t['token'].rsplit('.', 1)[0] and s['figma'] and s is not t and target_collection(s) == col), None)
            prop = (clean_src(sib['figma']).rsplit('/', 1)[0] + '/' + t['token'].rsplit('.', 1)[1]) if sib else None
            if not prop:
                conflicts.append({'rule': 'create without naming sibling', 'token': t['token'], 'detail': 'no sibling with a Figma source'}); continue
            if prop in bycol[col]:
                conflicts.append({'rule': '1 ambiguous identity', 'token': t['token'], 'detail': f'proposed create name {prop} already exists'}); continue
            vid = f'NEW:{prop}'
            created[t['token']] = {'collection': col, 'name': prop, 'id': vid}
            tok_var[t['token']] = vid
            mapping[t['token']] = {'collection': col, 'variableId': None, 'figmaName': prop, 'status': 'create', 'lastSynced': None}
            continue
        v = cands[0]; tok_var[t['token']] = v['id']
        mapping.setdefault(t['token'], {'collection': col, 'variableId': v['id'], 'figmaName': v['name'], 'status': 'proposed', 'lastSynced': None})

    # ---- desired values and diff ----
    tok_by = {(t['token'], t['mode']): t for t in toks}
    def resolve_hex_figma(val, mode_name, depth=0):
        if isinstance(val, dict):
            tv = byid.get(val['alias'])
            if not tv or tv.get('slim') or depth > 6: return None
            return resolve_hex_figma(tv['values'].get(mode_name) or next(iter(tv['values'].values())), mode_name, depth + 1)
        return val

    def reg_target(alias, mode):
        name = alias.strip('{}')
        return tok_by.get((name, mode)) or tok_by.get((name, None))

    for t, col, cands in pending:
        if t['token'] not in tok_var: continue
        vid = tok_var[t['token']]
        is_new = vid.startswith('NEW:')
        v = byid.get(vid)
        if v and t['type'] in TYPE_OK and v['type'] not in TYPE_OK[t['type']] and not (isinstance(t['value'], str) and t['value'].startswith('{')):
            conflicts.append({'rule': '2 type mismatch', 'token': t['token'], 'detail': f"{t['type']} vs {v['type']}"}); continue
        mode_name = MODES[t['mode']] if t['mode'] else (v['values'] and next(iter(v['values'])) if v else None)
        if t['mode'] and v and mode_name not in v['values']:
            conflicts.append({'rule': '4 missing mode', 'token': t['token'], 'detail': mode_name}); continue
        # desired
        val = t['value']
        if isinstance(val, str) and val.startswith('{'):
            tgt = reg_target(val, t['mode'])
            tid = tok_var.get(tgt['token']) if tgt else None
            if not tid:
                conflicts.append({'rule': '3 missing alias target', 'token': t['token'], 'detail': val}); continue
            want = {'alias': tid, 'name': (created.get(tgt['token']) or byid[tid])['name'] if tid else None}
            want_hex = token_hex(tgt['value'])
        elif t['type'] == 'color': want, want_hex = token_hex(val), token_hex(val)
        elif t['type'] == 'dimension': want, want_hex = val['value'], None
        elif t['type'] == 'number': want, want_hex = t['src'].get('px', val), None
        elif t['type'] == 'fontWeight': want, want_hex = WEIGHT.get(val, val), None
        elif t['type'] == 'fontFamily': want, want_hex = (val[0] if isinstance(val, list) else val), None
        else:
            add(op='skip-out-of-scope', token=t['token'], mode=t['mode'], reason=f"type {t['type']} not synced"); continue
        if is_new:
            add(op='create', token=t['token'], mode=t['mode'], collection=col, variable=created[t['token']]['name'], before=None,
                after=want, afterHex=want_hex, approval=True, note='scopes: copy from sibling variables in the same group (§9.3)'); continue
        have = v['values'][mode_name]
        have_hex = resolve_hex_figma(have, mode_name) if t['type'] == 'color' or isinstance(have, dict) else None
        if isinstance(want, dict):
            same = isinstance(have, dict) and have['alias'] == want['alias']
            op = 'unchanged' if same else 'update-alias'
        else:
            same = (not isinstance(have, dict)) and (str(have).lower() == str(want).lower())
            op = 'unchanged' if same else 'update-value'
        dE = de2000(have_hex, want_hex) if (op != 'unchanged' and have_hex and want_hex and len(have_hex) == len(want_hex) == 7) else None
        row = dict(op=op, token=t['token'], mode=t['mode'], collection=col, variableId=vid, variable=v['name'],
                   before=(have['name'] if isinstance(have, dict) else have), beforeHex=have_hex,
                   after=(want['name'] if isinstance(want, dict) else want), afterHex=want_hex, deltaE=dE,
                   approval=op != 'unchanged', description=t['description'])
        if op != 'unchanged' and col == '1. Color modes': row['affected'] = usage.get(v['name'], [])
        add(**row)
        if op == 'unchanged':
            mapping[t['token']]['lastSynced'] = None   # first run: stays null until a write is approved and done

    # ---- Figma-side rows ----
    mapped_ids = {m['variableId'] for m in mapping.values() if m.get('variableId')}
    for vid, v in byid.items():
        if vid in mapped_ids: continue
        if v['collection'] not in IN_SCOPE or v['name'].startswith('Component colors/'):
            add(op='skip-out-of-scope', variable=v['name'], collection=v['collection'], variableId=vid,
                reason='component colour (D-05)' if v['name'].startswith('Component colors/') else 'collection not in sync scope (§1)')
        else:
            add(op='figma-only', variable=v['name'], collection=v['collection'], variableId=vid, reason='no registry token; kept, not written')

    # ---- assertions ----
    ops = Counter(r['op'] for r in rows)
    assertions = {'deletes': 0, 'retypes': 0, 'renames': 0, 'writesPerformed': 0,
                  'targetIsOriginal': file_key == ORIGINAL,
                  'writePathWouldRefuse': file_key == ORIGINAL,
                  'variablesRead': len(byid), 'conflicts': len(conflicts)}
    assert not any(r['op'] in ('delete', 'retype', 'rename') for r in rows)

    os.makedirs(a.out, exist_ok=True)
    rows.sort(key=lambda r: (['conflict', 'create', 'update-value', 'update-alias', 'unchanged', 'figma-only', 'skip-out-of-scope'].index(r['op']), r.get('collection') or '', r.get('token') or '', r.get('mode') or '', r.get('variable') or ''))
    result = {'spec': 'docs/token-sync-spec.md (APPROVED 2026-11-09)', 'fileKey': file_key, 'figmaReads': F['reads'], 'tokenRepo': a.tokens,
              'operations': dict(ops), 'assertions': assertions, 'conflicts': conflicts, 'rows': rows}
    json.dump(result, open(os.path.join(a.out, 'dryrun.json'), 'w'), ensure_ascii=False, indent=1, sort_keys=True)
    json.dump({'fileKey': file_key, 'status': 'proposed — not approved, not used for any write', 'spec': 'docs/token-sync-spec.md §2',
               'map': dict(sorted(mapping.items()))}, open(os.path.join(a.out, f'figma-variable-map.{file_key}.proposed.json'), 'w'), ensure_ascii=False, indent=1)
    write_md(result, os.path.join(a.out, 'dryrun.md'))
    print(json.dumps({'operations': dict(ops), 'conflicts': len(conflicts), 'assertions': assertions}))
    sys.exit(1 if conflicts else 0)


def write_md(r, path):
    L = []; w = L.append; A = r['assertions']; ops = r['operations']
    w('# P1-09 — Token-sync dry-run (read-only)\n')
    w(f"> Spec: `docs/token-sync-spec.md` (APPROVED 2026-11-09). Target: `{r['fileKey']}`" + (' — **the original library, read only** (no verified duplicate yet; the write path would refuse this file).' if A['targetIsOriginal'] else '.') + ' Generated by `scripts/token-sync/dryrun.py`. **No writes were made or attempted.**\n')
    w('## Summary\n')
    w('| Operation | Rows |'); w('|---|---|')
    for k in ['conflict', 'create', 'update-value', 'update-alias', 'unchanged', 'figma-only', 'skip-out-of-scope']:
        w(f"| `{k}` | {len(r['conflicts']) if k == 'conflict' else ops.get(k, 0)} |")
    w('\n**Assertions:** ' + ' · '.join(f'{k} = {v}' for k, v in A.items()) + '\n')
    w('Rows are per token × mode (registry side) or per variable (Figma-only / out-of-scope). Approval column: every `create` and `update-*` row needs Mike\'s approval before any write (spec §4).\n')
    if r['conflicts']:
        w('## Conflicts\n'); w('| Rule | Token | Detail |'); w('|---|---|---|')
        for c in r['conflicts']: w(f"| {c['rule']} | `{c['token']}` | {c['detail']} |")
        w('')
    w('## Changes a sync would make (need approval)\n')
    w('| Op | Token | Mode | Figma variable | Before | After | ΔE2000 | Components affected (P1-07 usage) | Registry intent |')
    w('|---|---|---|---|---|---|---|---|---|')
    for x in r['rows']:
        if x['op'] in ('create', 'update-value', 'update-alias'):
            b = f"{x.get('before')}" + (f" `{x['beforeHex']}`" if x.get('beforeHex') else '') if x.get('before') is not None else '—'
            af = x['after']['name'] if isinstance(x.get('after'), dict) else x.get('after')
            aft = f"{af}" + (f" `{x['afterHex']}`" if x.get('afterHex') else '')
            aff = ', '.join(x.get('affected') or []) or ('— (new variable)' if x['op'] == 'create' else 'none in library components')
            w(f"| `{x['op']}` | `{x['token']}` | {x.get('mode') or '—'} | {x.get('variable')} | {b} | {aft} | {x.get('deltaE') if x.get('deltaE') is not None else '—'} | {aff} | {(x.get('description') or x.get('note') or '').replace('|', '/')} |")
    w('\n## Unchanged (mapped, equal)\n')
    by = Counter(x['collection'] for x in r['rows'] if x['op'] == 'unchanged')
    w(', '.join(f'{k}: {v}' for k, v in sorted(by.items())) + '. Full list in `dryrun.json`.\n')
    w('## Kept / out of scope\n')
    fo = Counter(x['collection'] for x in r['rows'] if x['op'] == 'figma-only')
    so = Counter(x.get('reason') for x in r['rows'] if x['op'] == 'skip-out-of-scope')
    w('- `figma-only` (kept, never written): ' + ', '.join(f'{k} {v}' for k, v in sorted(fo.items())) + '.')
    w('- `skip-out-of-scope`: ' + '; '.join(f'{k}: {v}' for k, v in so.items()) + '.\n')
    open(path, 'w').write('\n'.join(L) + '\n')


if __name__ == '__main__':
    main()
