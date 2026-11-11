#!/usr/bin/env python3
"""Expected figma-snapshot.js digests after an approved rename map is applied to a stored baseline.
Rebuilds the raw `vars` rows from a collected make.figma-snapshot/2 baseline (verifying the result
against the stored baseline digest first), applies the renames by ID, and prints the digests that
figma-snapshot.js digest mode must return afterwards. Any other change in the file gives a different digest.
Usage: expected-digest.py BASELINE.json BASELINE-DIGEST.json [RENAME-MAP.json ...] [--window 230]"""
import json, sys
def fnv(s):
    b, x = s.encode('utf-16-le'), 2166136261
    for i in range(0, len(b), 2):
        x ^= int.from_bytes(b[i:i + 2], 'little'); x = (x * 16777619) & 0xffffffff
    return format(x, 'x')
def js(o): return json.dumps(o, separators=(',', ':'), ensure_ascii=False)
a = sys.argv[1:]
win = int(a[a.index('--window') + 1]) if '--window' in a else 230
a = [x for i, x in enumerate(a) if x != '--window' and (i == 0 or a[i - 1] != '--window')]
base, digest, maps = json.load(open(a[0])), json.load(open(a[1])), a[2:]
cols = base['collections']; names = [c['name'] for c in cols]
def rows(vs):
    return [[v['id'], v['key'], v['name'], names.index(v['col']), v['type'], v['scopes'], v['hidden'], v['codeSyntax'], v['desc'],
             [v['values'][m.split('=', 1)[1]] for m in cols[names.index(v['col'])]['modes']]] for v in vs]
def vdig(vs):
    r = rows(sorted(vs, key=lambda v: 'VariableID:' + v['id']))   # same order as figma-snapshot.js (sort by full id string)
    return {f'vars@{i}': 'fnv:' + fnv(js(r[i:i + win])) for i in range(0, len(r), win)}
got = vdig(base['variables'])
for k, v in got.items():
    if digest[k]['variables'] != v: sys.exit(f'reconstruction mismatch at {k}: {v} vs stored {digest[k]["variables"]}')
renamed = 0
byid = {v['id']: v for v in base['variables']}
for m in maps:
    for r in json.load(open(m))['renames']:
        v = byid[r['id']]
        if v['name'] != r['old']: sys.exit(f'{r["id"]}: baseline name {v["name"]!r} != map old {r["old"]!r}')
        v['name'] = r['new']; renamed += 1
exp = {k: dict(digest[k]) for k in digest}
for k, v in vdig(base['variables']).items(): exp[k]['variables'] = v
print(json.dumps({'renamesApplied': renamed, 'expected': exp}, indent=1))
