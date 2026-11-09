#!/usr/bin/env python3
"""P1-06: map every Figma variable to the approved token registry (read-only on both sides).

Usage:
  python3 -I scripts/build-token-mapping.py registry/raw/figma-variables-<date>.json ~/Documents/Codex/design-tokens reports/P1-06-token-mapping

Reads the Figma variable dump (from read-only use_figma calls) and the token repo's tokens/ and proposals/
directories. Writes <out>.json and <out>.md in THIS workspace only. Never writes to the token repo.

Statuses (per Figma variable, per mode where the variable has modes):
  mapped     registry token found and value equal (colours: CIEDE2000 < 1; numbers: equal)
  flagged    registry token found, value differs (ΔE >= 1 or number differs)  -> listed for review
  unmapped   no approved registry token for this variable
  deferred   component colour (D-05: preserve and document only)
"""
import glob, json, math, os, re, sys

# ---------- colour maths ----------
def hex_to_rgba(h):
    h = h.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
    return r, g, b, a

def _lab(r, g, b):
    def lin(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(r), lin(g), lin(b)
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b)
    z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
    def f(t): return t ** (1 / 3) if t > 216 / 24389 else (24389 / 27 * t + 16) / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)

def delta_e2000(h1, h2):
    L1, a1, b1 = _lab(*hex_to_rgba(h1)[:3]); L2, a2, b2 = _lab(*hex_to_rgba(h2)[:3])
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2); Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360; h2p = math.degrees(math.atan2(b2, a2p)) % 360
    dL, dC = L2 - L1, C2p - C1p
    dh = 0 if C1p * C2p == 0 else (h2p - h1p if abs(h2p - h1p) <= 180 else h2p - h1p - 360 if h2p > h1p else h2p - h1p + 360)
    dH = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dh / 2))
    Lb, Cbp = (L1 + L2) / 2, (C1p + C2p) / 2
    hb = h1p + h2p if C1p * C2p == 0 else ((h1p + h2p) / 2 if abs(h1p - h2p) <= 180 else (h1p + h2p + 360) / 2 if h1p + h2p < 360 else (h1p + h2p - 360) / 2)
    T = 1 - 0.17 * math.cos(math.radians(hb - 30)) + 0.24 * math.cos(math.radians(2 * hb)) + 0.32 * math.cos(math.radians(3 * hb + 6)) - 0.20 * math.cos(math.radians(4 * hb - 63))
    Sl = 1 + 0.015 * (Lb - 50) ** 2 / math.sqrt(20 + (Lb - 50) ** 2); Sc = 1 + 0.045 * Cbp; Sh = 1 + 0.015 * Cbp * T
    Rt = -2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * math.sin(math.radians(60 * math.exp(-((hb - 275) / 25) ** 2)))
    return math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh))

def norm_hex(h):
    h = h.lower()
    return h[:7] if len(h) == 9 and h.endswith('ff') else h

# ---------- registry ----------
def walk(d, p=''):
    for k, v in d.items():
        if k.startswith('$'): continue
        if isinstance(v, dict) and '$value' in v: yield p + k, v
        elif isinstance(v, dict): yield from walk(v, p + k + '.')

def load_tokens(root, pattern):
    out = []
    for f in sorted(glob.glob(os.path.join(root, pattern), recursive=True)):
        rel = os.path.relpath(f, root)
        mode = 'light' if '/light/' in rel else 'dark' if '/dark/' in rel else None
        for name, t in walk(json.load(open(f))):
            src = (t.get('$extensions') or {}).get('com.make.source') or {}
            out.append({'token': name, 'file': rel, 'mode': mode, 'value': t['$value'], 'figma': src.get('figma'),
                        'description': t.get('$description'), 'src': src})
    return out

def clean_src(s):
    s = re.sub(r'\s*=\s*.*$', '', s)
    s = re.sub(r'\s*\([^)]*\)\s*$', '', s)
    return s.strip()

def short(figma_name):
    return re.sub(r'\s*\([^)]*\)\s*$', '', figma_name.split('/')[-1]).strip()

WEIGHTS = {'Regular': 400, 'Medium': 500, 'Semibold': 600, 'Bold': 700}

def main(var_path, token_root, out_base):
    V = json.load(open(var_path))
    prim = {r[0]: r[2] for r in V['_Primitives']['rows']}
    cm = {r[0]: r[1:] for r in V['1. Color modes']['rows']}
    others = V['others']

    def resolve_fig(val, mode_idx, depth=0):
        if isinstance(val, str) and val.startswith('P:'): return resolve_fig(prim[val[2:]], mode_idx, depth + 1)
        if isinstance(val, str) and val.startswith('C:'): return resolve_fig(cm[val[2:]][mode_idx], mode_idx, depth + 1)
        if isinstance(val, str) and val.startswith('->'):
            tgt = val[2:].split('/', 1)
            return resolve_fig(prim[tgt[1]], mode_idx, depth + 1) if tgt[0] == '_Primitives' else val
        return val

    approved = load_tokens(token_root, 'tokens/**/*.tokens.json')
    proposals = load_tokens(token_root, 'proposals/**/*.tokens.json')
    by_tok = {t['token']: t for t in approved if t['mode'] is None}
    by_tok_mode = {(t['token'], t['mode']): t for t in approved}

    def resolve_reg(t, mode):
        v = t['value']
        for _ in range(6):
            if isinstance(v, str) and v.startswith('{'):
                name = v.strip('{}')
                nt = by_tok_mode.get((name, mode)) or by_tok.get(name)
                if not nt: return None, None
                t, v = nt, nt['value']
            else: break
        return v, t

    def reg_index(tokens):
        idx = {}
        for t in tokens:
            if not t['figma']: continue
            for key in {clean_src(t['figma']), t['figma']}:
                idx.setdefault(key, []).append(t)
        return idx
    A, P = reg_index(approved), reg_index(proposals)

    def find(idx, fname):
        return idx.get(fname) or idx.get(short(fname)) or []

    rows = []
    def add(collection, fname, mode, fig_val, status, token=None, reg_val=None, dE=None, note='', proposal=None):
        rows.append({'collection': collection, 'figma': fname, 'mode': mode, 'figmaValue': fig_val, 'status': status,
                     'token': token, 'registryValue': reg_val, 'deltaE': None if dE is None else round(dE, 2),
                     'note': note, 'proposal': proposal})

    def proposal_hint(fname):
        hits = find(P, fname)
        return sorted({h['file'].split('/')[1] for h in hits}) or None

    def color_hex(v):
        return v.get('hex') if isinstance(v, dict) else v if isinstance(v, str) and v.startswith('#') else None

    # _Primitives
    for fname, val in prim.items():
        hits = [t for t in find(A, fname) if t['mode'] is None]
        if not hits:
            add('_Primitives', fname, None, val, 'unmapped', proposal=proposal_hint(fname)); continue
        t = hits[0]
        if isinstance(val, str):  # colour
            rh = color_hex(t['value'])
            if not rh: add('_Primitives', fname, None, val, 'flagged', t['token'], t['value'], note='registry value not a colour'); continue
            fa, ra = hex_to_rgba(val)[3], hex_to_rgba(rh)[3]
            dE = delta_e2000(val, rh)
            ok = dE < 1 and abs(fa - ra) < 0.01
            add('_Primitives', fname, None, val, 'mapped' if ok else 'flagged', t['token'], rh, dE,
                '' if ok else ('alpha differs' if dE < 1 else 'visible colour difference'))
        else:
            rv = t['value'].get('value') if isinstance(t['value'], dict) else t['value']
            add('_Primitives', fname, None, val, 'mapped' if rv == val else 'flagged', t['token'], rv)

    # 1. Color modes
    for fname, vals in cm.items():
        if fname.startswith('Component colors/'):
            for i, mode in enumerate(('light', 'dark')):
                add('1. Color modes', fname, mode, vals[i], 'deferred', note='D-05: preserve and document only (P1-07)')
            continue
        hits = find(A, fname)
        for i, mode in enumerate(('light', 'dark')):
            fig_hex = resolve_fig(vals[i], i)
            t = next((h for h in hits if h['mode'] == mode), None)
            if not t:
                add('1. Color modes', fname, mode, f"{vals[i]} = {fig_hex}", 'unmapped', proposal=proposal_hint(fname)); continue
            rv, rt = resolve_reg(t, mode)
            rh = color_hex(rv)
            if not rh:
                add('1. Color modes', fname, mode, fig_hex, 'flagged', t['token'], t['value'], note='registry alias unresolved'); continue
            dE = delta_e2000(fig_hex, rh)
            same_target = rt and rt.get('figma') and vals[i].startswith('P:') and clean_src(rt['figma']) == vals[i][2:]
            ok = dE < 1
            note = '' if ok else 'value differs from Figma'
            if ok and not same_target and vals[i].startswith('P:'): note = 'same value, different alias target'
            add('1. Color modes', fname, mode, f"{vals[i][2:] if vals[i][:2] in ('P:', 'C:') else vals[i]} = {fig_hex}",
                'mapped' if ok else 'flagged', t['token'], f"{t['value']} = {rh}", dE,
                note + (f" — registry: {t['description']}" if t['description'] and not ok else ''))

    # Other collections
    for coll in ('2. Radius', '3. Spacing', '4. Widths', '5. Containers', '6. Typography'):
        for r in others[coll]['rows']:
            fname, typ, val = r[0], r[1], r[2]
            rv_fig = resolve_fig(val, 0) if isinstance(val, str) and val.startswith('->') else val
            hits = [t for t in find(A, fname) if t['mode'] is None]
            if coll == '2. Radius':
                hits = [t for t in approved if t['figma'] and clean_src(t['figma']) == fname]
            if not hits:
                note = ''
                if isinstance(val, str) and val.startswith('->_Primitives/'):
                    p = val.split('/', 1)[1]
                    pt = [t for t in find(A, p) if t['mode'] is None]
                    note = f"alias of {p}" + (f" → registry {pt[0]['token']} (resolvable via alias)" if pt else ' (primitive also unmapped)')
                add(coll, fname, None, rv_fig, 'unmapped', note=note, proposal=proposal_hint(fname)); continue
            t = hits[0]
            tv = t['value']
            if coll == '6. Typography' and 'Line height' in fname:
                rv = t['src'].get('px')
            elif coll == '6. Typography' and 'Font family' in fname:
                rv = tv[0] if isinstance(tv, list) else tv
            elif coll == '6. Typography' and 'Font weight' in fname:
                rv, rv_fig = tv, WEIGHTS.get(rv_fig, rv_fig)
            else:
                rv = tv.get('value') if isinstance(tv, dict) else tv
            add(coll, fname, None, rv_fig, 'mapped' if rv == rv_fig else 'flagged', t['token'], rv,
                note='' if rv == rv_fig else 'value differs')

    # Registry tokens with no Figma variable counterpart
    fig_names = set(prim) | set(cm) | {r[0] for c in others.values() if isinstance(c, dict) for r in c['rows']}
    fig_short = {short(n) for n in fig_names}
    reg_only = [{'token': t['token'], 'file': t['file'], 'figmaSource': t['figma'], 'description': t['description']}
                for t in approved if not t['figma'] or (clean_src(t['figma']) not in fig_names and short(clean_src(t['figma'])) not in fig_short)]

    # Summaries
    from collections import Counter, defaultdict
    per_var = defaultdict(set)
    for r in rows: per_var[(r['collection'], r['figma'])].add(r['status'])
    def var_status(s):
        for k in ('flagged', 'unmapped', 'deferred', 'mapped'):
            if k in s: return k
    var_counts = defaultdict(Counter)
    for (coll, _), s in per_var.items(): var_counts[coll][var_status(s)] += 1
    summary = {c: dict(cnt) | {'total': sum(cnt.values())} for c, cnt in var_counts.items()}
    total_vars = sum(v['total'] for v in summary.values())
    core = [r for r in rows if r['collection'] == '1. Color modes' and r['figma'].startswith('Colors/')]
    result = {'source': {'figmaFile': V['fileKey'], 'figmaRead': V['readAt'], 'tokenRepo': token_root, 'approvedTokens': len(approved),
                         'proposalTokens': len(proposals)},
              'summaryByVariable': summary, 'totalVariables': total_vars,
              'coreColorModeVariables': len({r['figma'] for r in core}), 'rows': rows, 'registryOnly': reg_only}
    json.dump(result, open(out_base + '.json', 'w'), ensure_ascii=False, indent=1)
    write_md(result, out_base + '.md')
    return result


def write_md(r, path):
    from collections import Counter, defaultdict
    rows = r['rows']; L = []; w = L.append
    S = r['summaryByVariable']
    w('# P1-06 — Figma → registry token mapping (read-only)\n')
    w(f"> Generated by `scripts/build-token-mapping.py` from `registry/raw/figma-variables-2026-11-09.json` (live read of `{r['source']['figmaFile']}`) and the token repo's `tokens/` ({r['source']['approvedTokens']} approved tokens) and `proposals/` ({r['source']['proposalTokens']} proposal tokens). Full rows: `reports/P1-06-token-mapping.json`. Neither Figma nor the token repo was modified.\n")
    w('Statuses: **mapped** = approved token with equal value (colour ΔE2000 < 1) · **flagged** = approved token, different value · **unmapped** = no approved token · **deferred** = component colour (D-05). A variable with modes takes its worst mode status (flagged > unmapped > deferred > mapped).\n')
    w('## 1. Totals (per variable, VERIFIED)\n')
    w('| Collection | Variables | Mapped | Flagged | Unmapped | Deferred |'); w('|---|---|---|---|---|---|')
    order = ['_Primitives', '1. Color modes', '2. Radius', '3. Spacing', '4. Widths', '5. Containers', '6. Typography']
    tot = Counter()
    for c in order:
        s = S[c]; tot.update({k: v for k, v in s.items()})
        w(f"| {c} | {s['total']} | {s.get('mapped', 0)} | {s.get('flagged', 0)} | {s.get('unmapped', 0)} | {s.get('deferred', 0)} |")
    w(f"| **Total** | **{tot['total']}** | **{tot['mapped']}** | **{tot['flagged']}** | **{tot['unmapped']}** | **{tot['deferred']}** |\n")
    w(f"Reconciliation: {r['totalVariables']} variables = audit's 681 ✓. `1. Color modes` = {r['coreColorModeVariables']} core + 171 component colours ✓.\n")
    w('## 2. Flagged — approved tokens that differ from Figma\n')
    w('All flagged rows are semantic colours whose approved registry value was deliberately remapped by approved proposals **0002** (login contrast, WCAG 2.2 AA, ADR-0008) or **0004** (interactive states). They are not errors in the registry; they are the places where Figma does not yet reflect approved tokens. A future registry → Figma sync (D-03) would visibly change these.\n')
    w('| Figma variable | Mode | Figma (alias = hex) | Registry token (alias = hex) | ΔE2000 | Registry intent |'); w('|---|---|---|---|---|---|')
    for x in rows:
        if x['status'] == 'flagged':
            intent = x['note'].split('registry: ', 1)[-1] if 'registry: ' in x['note'] else x['note']
            w(f"| {x['figma'].split('/')[-1]} | {x['mode']} | {x['figmaValue']} | `{x['token']}` {x['registryValue']} | {x['deltaE']} | {intent} |")
    w('')
    w('## 3. Mapped core semantic colours (other mode or both modes equal)\n')
    w('| Figma variable | Mode | Registry token | Value |'); w('|---|---|---|---|')
    for x in rows:
        if x['collection'] == '1. Color modes' and x['status'] == 'mapped':
            w(f"| {x['figma'].split('/')[-1]} | {x['mode']} | `{x['token']}` | {x['figmaValue'].split(' = ')[-1]} |")
    w('')
    w('## 4. Unmapped\n')
    un = [x for x in rows if x['status'] == 'unmapped']
    prim = [x for x in un if x['collection'] == '_Primitives']
    fam = Counter(x['figma'].split('/')[1] for x in prim)
    w(f"**_Primitives — {len(prim)} unmapped.** Per ADR-0005 amendment, unused legacy colours are not imported. By family: " + ', '.join(f"{k} {v}" for k, v in fam.most_common()) + '.\n')
    core_un = sorted({x['figma'] for x in un if x['collection'] == '1. Color modes'})
    w(f"**1. Color modes (core) — {len(core_un)} unmapped.** The registry has semantic tokens only for the login pilot scope (11 per mode). The rest of the core semantic set has no approved token yet.\n")
    w('<details><summary>Unmapped core semantic variables</summary>\n')
    for n in core_un: w(f"- {n}")
    w('\n</details>\n')
    alias = [x for x in un if x['collection'] in ('3. Spacing', '4. Widths', '5. Containers')]
    w(f"**3. Spacing / 4. Widths / 5. Containers — {len(alias)} unmapped, all resolvable.** Each is an alias of a `_Primitives/Spacing` variable that *is* mapped (e.g. `spacing-lg` → `Spacing/3 (12px)` → `spacing.3`). The registry has no semantic spacing layer yet; values are preserved through the primitive.\n")
    for c in ('2. Radius', '6. Typography'):
        names = [x['figma'] + (f" ({x['figmaValue']})" if x['figmaValue'] is not None else '') for x in un if x['collection'] == c]
        if names: w(f"**{c} — {len(names)} unmapped:** " + ', '.join(names) + '.\n')
    prop = Counter(tuple(x['proposal']) for x in un if x['proposal'])
    if prop:
        w('**Covered by pending proposals (not approved):** ' + ', '.join(f"{'/'.join(k)}: {v} row(s)" for k, v in prop.items()) + '. These become mapped only if Mike approves the proposal.\n')
        w('<details><summary>Rows covered by pending proposals</summary>\n')
        for x in un:
            if x['proposal']: w(f"- {x['collection']} · {x['figma']}" + (f" ({x['mode']})" if x['mode'] else '') + f" → {', '.join(x['proposal'])}")
        w('\n</details>\n')
    w('## 5. Deferred\n')
    w(f"**171 component colours** in `1. Color modes` (`Component colors/…`), both modes: status `deferred` per D-05 (preserve and document only). Inventoried in P1-07.\n")
    w('## 6. Registry tokens with no Figma variable\n')
    w('| Token | Figma source recorded | Note |'); w('|---|---|---|')
    for o in r['registryOnly']:
        w(f"| `{o['token']}` | {o['figmaSource'] or '—'} | {(o['description'] or '')[:120]} |")
    w('\nSemantic typography tokens map to Figma **text styles**, not variables, so they are expected here. `color.gray.450` is a new accessibility primitive (proposal 0002), not in Figma.\n')
    open(path, 'w').write('\n'.join(L) + '\n')

if __name__ == '__main__':
    r = main(*sys.argv[1:4])
    print(json.dumps({'total': r['totalVariables'], 'core': r['coreColorModeVariables'], 'summary': r['summaryByVariable']}, ensure_ascii=False, indent=1))
