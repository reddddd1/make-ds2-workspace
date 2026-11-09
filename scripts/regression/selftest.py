#!/usr/bin/env python3
"""Self-test for the regression comparator (P1-08). Local only; never talks to Figma.

Takes the real baseline/current snapshots, writes deliberately mismatched JSON copies (one per scenario)
into <out>/selftest/, runs compare.py on each and asserts the expected verdict and failing check.

Usage: python3 -I scripts/regression/selftest.py reports/P1-08-regression
"""
import copy, json, os, subprocess, sys

ROOT = sys.argv[1]
S = os.path.join(ROOT, 'snapshots'); T = os.path.join(ROOT, 'selftest'); os.makedirs(T, exist_ok=True)
CMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'compare.py')
load = lambda n: json.load(open(os.path.join(S, n)))


def write(name, obj):
    p = os.path.join(T, name); json.dump(obj, open(p, 'w'), ensure_ascii=False, indent=1); return p


def run(name, base, cur, expect, must_contain, spec=None):
    out = os.path.join(T, name)
    cmd = [sys.executable, '-I', CMP, base, cur, '--out', out] + (['--spec', spec] if spec else [])
    p = subprocess.run(cmd, capture_output=True, text=True)
    verdict = 'PASS' if p.returncode == 0 else 'FAIL' if p.returncode == 1 else 'ERROR'
    rep = json.load(open(out + '.json'))
    failed = [r['check'] + ' — ' + str(r['detail']) for r in rep['rows'] if not r['pass']]
    ok = verdict == expect and (not must_contain or any(must_contain in f for f in failed))
    return {'scenario': name, 'expected': expect, 'got': verdict, 'ok': ok, 'failedChecks': failed[:4]}


results = []
vb, vc = 'variants-library-baseline.json', 'variants-library-current.json'

# 1. R-PAPER-01 — the Paper incident: a change meant for every Primary button reached only State=Default.
b = load(vb); c = load(vc)
for s in c['sets']:
    if s['name'] == 'Buttons/Button':
        for v in s['variants']:
            if 'Hierarchy=Primary,' in v[1] and 'State=Default' in v[1]: v[2] = 'changed1'
cur = write('r-paper-01-current.json', c)
spec = write('r-paper-01-spec.json', {'sets': {'Buttons/Button': {'scope': {'Hierarchy': ['Primary']}}}})
results.append(run('r-paper-01-partial-change', os.path.join(S, vb), cur, 'FAIL', 'R-PAPER-01', spec))

# 1b. Same spec, change reached every Primary variant -> PASS (proves the checker is not just always failing).
c2 = load(vc)
for s in c2['sets']:
    if s['name'] == 'Buttons/Button':
        for v in s['variants']:
            if 'Hierarchy=Primary,' in v[1]: v[2] = 'changed1'
results.append(run('r-paper-01-full-change', os.path.join(S, vb), write('r-paper-01-full-current.json', c2), 'PASS', None, spec))

# 2. Library protection: an unexpected edit outside any scope (one Alert variant) and a variable count change.
b = load(vb); b['sets'][-1]['variants'][0][2] = 'deadbeef'; b['fingerprint']['variables'] = 680
results.append(run('protection-mismatch', write('protection-baseline.json', b), os.path.join(S, vc), 'FAIL', 'no change outside expected scope'))

# 3. R-PENPOT-01: a dark-screen instance whose bindings/values differ from the baseline.
ib, ic = 'instances-scratch-baseline.json', 'instances-scratch-current.json'
b = load(ib)
d1 = next(s for s in b['screens'] if s['explicitModes'])
d1['instances'][1]['bindHash'] = '00000000'
results.append(run('r-penpot-01-binding-lost', write('r-penpot-01-baseline.json', b), os.path.join(S, ic), 'FAIL', 'R-PENPOT-01'))

# 4. R-FIGMA-01: an instance whose layer tree lost a layer (current edited: Helper text dropped, as pilot F2).
c = load(ic); inst = c['screens'][1]['instances'][1]
inst['missing'] = 1; inst['missingEx'] = ['0.1|INSTANCE (Helper text)']
results.append(run('r-figma-01-layer-dropped', os.path.join(S, ib), write('r-figma-01-current.json', c), 'FAIL', 'R-FIGMA-01'))

# 5. Linkage: baseline says linked, current orphan (library Modals page; real orphans stay "known").
mb, mc = 'instances-library-modals-baseline.json', 'instances-library-modals-current.json'
b = load(mb)
o = next(i for s in b['screens'] for i in s['instances'] if i['link'] == 'orphan'); o['link'] = 'linked-local'
results.append(run('linkage-new-orphan', write('linkage-baseline.json', b), os.path.join(S, mc), 'FAIL', 'linkage'))

# 6. Icons: an icon glyph no longer from the library.
c = load(ic); inst = next(i for s in c['screens'] for i in s['instances'] if i['icons'][2])
inst['icons'] = [inst['icons'][0], inst['icons'][1], inst['icons'][2], inst['icons'][3] - 1]; inst['badIcons'] = ['arrow-right (local)']
results.append(run('icon-source-local', os.path.join(S, ib), write('icons-current.json', c), 'FAIL', 'icons'))

# 7. R-SLOT-01: slot content changed and an extra instance appeared.
sb, sc = 'slots-library-baseline.json', 'slots-library-current.json'
b = load(sb); b['instances'][0]['slotHash'] = '11111111'; b['instanceCount'] = 2
results.append(run('r-slot-01-content-and-count', write('r-slot-01-baseline.json', b), os.path.join(S, sc), 'FAIL', 'slot content preserved'))

json.dump(results, open(os.path.join(T, 'selftest-results.json'), 'w'), ensure_ascii=False, indent=1)
for r in results: print(('OK  ' if r['ok'] else 'BAD ') + f"{r['scenario']}: expected {r['expected']}, got {r['got']}" + (f" — {r['failedChecks'][0][:150]}" if r['failedChecks'] else ''))
sys.exit(0 if all(r['ok'] for r in results) else 1)
