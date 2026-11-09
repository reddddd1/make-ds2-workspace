#!/usr/bin/env python3
"""Regression comparator (P1-08). Local only; never talks to Figma.

Usage:
  python3 -I scripts/regression/compare.py <baseline.json> <current.json> [--spec spec.json] [--out report-basename]

Both snapshots must come from the same collector (`check` = variants | instances | slots).
Exit code 0 = PASS, 1 = FAIL, 2 = usage error.

variants  (R-PAPER-01 + library protection): every variant in an expected-change scope must have changed
          (and, with a probe, show the probe); every variant outside the scope must be unchanged; variant
          set, property definitions and file fingerprint must match unless the spec allows a change.
          Spec: {"sets": {"<set name>": {"scope": {"State": ["Hover", ...]}, "probe": "visible"}},
                 "allowFingerprintChange": false, "allowPropDefsChange": ["<set name>"]}
          Without a spec, nothing may change (protection mode).
instances (linkage, R-FIGMA-01, R-PENPOT-01, icon source): same screens and instances; every instance linked
          (no NEW orphan/detached; issues already in the baseline are listed as known); 0 new missing/extra layers vs main; binding count and hash (Light, Dark,
          effective values) identical; screen modes identical; every icon wrapper and glyph from the library.
slots     (R-SLOT-01): same instance count; every instance linked; property values and slot-region hash
          per instance unchanged; limitViolations empty (or API not present).
"""
import argparse, json, sys


def parse_variant(name):
    out = {}
    for part in name.split(','):
        if '=' in part:
            k, v = part.split('=', 1); out[k.strip()] = v.strip()
    return out


def in_scope(props, scope):
    return all(props.get(k) in vals for k, vals in scope.items())


def cmp_variants(b, c, spec, R):
    spec = spec or {}
    sets_spec = spec.get('sets', {})
    if b['fingerprint'] != c['fingerprint']:
        R.check('file fingerprint (variables, collections, styles) unchanged', spec.get('allowFingerprintChange', False),
                f"baseline {b['fingerprint']} vs current {c['fingerprint']}")
    else:
        R.check('file fingerprint (variables, collections, styles) unchanged', True, f"{c['fingerprint']['variables']} variables, {len(c['fingerprint']['collections'])} collections")
    bsets = {s['id']: s for s in b['sets']}
    for cs in c['sets']:
        bs = bsets.get(cs['id'])
        name = cs.get('name', cs['id'])
        if not bs:
            R.check(f'[{name}] present in baseline', False, 'set missing from baseline'); continue
        allow_defs = name in spec.get('allowPropDefsChange', [])
        R.check(f'[{name}] property definitions unchanged', bs['propDefsHash'] == cs['propDefsHash'] or allow_defs,
                'changed (allowed by spec)' if allow_defs and bs['propDefsHash'] != cs['propDefsHash'] else '')
        bv = {v[0]: v for v in bs['variants']}; cv = {v[0]: v for v in cs['variants']}
        removed = [bv[k][1] for k in bv if k not in cv]; added = [cv[k][1] for k in cv if k not in bv]
        R.check(f'[{name}] no variants removed', not removed, ', '.join(removed[:5]))
        if added:
            R.check(f'[{name}] no unexpected variants added', name in sets_spec and sets_spec[name].get('allowAdded', False), ', '.join(added[:5]))
        s = sets_spec.get(name)
        scope = s.get('scope', {}) if s else None
        expected, changed_in, missing_change, unexpected, probe_bad = [], [], [], [], []
        for vid, row in cv.items():
            if vid not in bv: continue
            props = parse_variant(row[1]); changed = row[2] != bv[vid][2]
            if s is not None and in_scope(props, scope):
                expected.append(row[1])
                if changed: changed_in.append(row[1])
                else: missing_change.append(row[1])
                if s.get('probe') and (len(row) < 5 or row[4] != s['probe']): probe_bad.append(f"{row[1]} (probe {row[4] if len(row) > 4 else 'n/a'})")
            elif changed:
                unexpected.append(row[1])
        if s is not None:
            R.check(f'[{name}] R-PAPER-01 expected = actual changed variants', not missing_change,
                    f'expected {len(expected)}, actual {len(changed_in)}' + (f'; NOT changed: {", ".join(missing_change[:6])}' + (' …' if len(missing_change) > 6 else '') if missing_change else ''))
            if s.get('probe'):
                R.check(f'[{name}] probe "{s["probe"]}" in every in-scope variant', not probe_bad, '; '.join(probe_bad[:6]))
        R.check(f'[{name}] no change outside expected scope ({len(cv)} variants)', not unexpected,
                f'{len(unexpected)} changed: ' + ', '.join(unexpected[:6]) + (' …' if len(unexpected) > 6 else '') if unexpected else '')


def cmp_instances(b, c, spec, R):
    bs = {s['id']: s for s in b['screens']}
    R.check('same screens', set(bs) == {s['id'] for s in c['screens']}, f"baseline {len(bs)}, current {len(c['screens'])}")
    tot = dict(inst=0, linked=0, bind=0)
    for s in c['screens']:
        b0 = bs.get(s['id'])
        if not b0: continue
        nm = s['name'][:40]
        R.check(f'[{nm}] explicit modes unchanged', b0['explicitModes'] == s['explicitModes'], f"{b0['explicitModes']} → {s['explicitModes']}" if b0['explicitModes'] != s['explicitModes'] else ', '.join(s['explicitModes']) or 'none (inherits default)')
        R.check(f'[{nm}] screen-level bindings unchanged (R-PENPOT-01)', b0['ownHash'] == s['ownHash'] and b0['ownBindings'] == s['ownBindings'], f"{b0['ownBindings']} → {s['ownBindings']}")
        bi = {i['id']: i for i in b0['instances']}; ci = {i['id']: i for i in s['instances']}
        R.check(f'[{nm}] instance count unchanged', len(bi) == len(ci) and set(bi) == set(ci), f'{len(bi)} → {len(ci)}' + (f"; missing {[bi[k]['name'] for k in bi if k not in ci][:3]}" if set(bi) - set(ci) else ''))
        bad_link, figma01, bind_bad, icon_bad = [], [], [], []
        for iid, i in ci.items():
            tot['inst'] += 1; tot['bind'] += i['bindings']
            bb = bi.get(iid) or {}
            linked = i['link'] in ('linked-remote', 'linked-local')
            if linked: tot['linked'] += 1
            elif bb.get('link') == i['link']: R.known(f"[{nm}] {i['name']}: {i['link']} (already in baseline)")
            else: bad_link.append(f"{i['name']} ({i['link']})")
            if i['missing'] or i['extra']:
                msg = f"{i['name']}: missing {i['missing']} {i['missingEx']}, extra {i['extra']} {i['extraEx']}"
                if bb and (bb.get('missing'), bb.get('extra')) == (i['missing'], i['extra']): R.known(f"[{nm}] R-FIGMA-01 {msg} (already in baseline)")
                else: figma01.append(msg)
            if bb and (bb['bindHash'] != i['bindHash'] or bb['bindings'] != i['bindings']): bind_bad.append(f"{i['name']} ({bb['bindings']}→{i['bindings']})")
            w, wl, g, gl = i['icons']
            if w != wl or g != gl or i['badIcons']:
                msg = f"{i['name']}: wrappers {wl}/{w} lib, glyphs {gl}/{g} lib {i['badIcons']}"
                if bb and bb.get('icons') == i['icons']: R.known(f"[{nm}] icons {msg} (already in baseline)")
                else: icon_bad.append(msg)
            if bb and bb['icons'] != i['icons']: icon_bad.append(f"{i['name']}: icon counts {bb['icons']} → {i['icons']}")
        R.check(f'[{nm}] linkage: no new orphan/detached instance', not bad_link, '; '.join(bad_link[:5]))
        R.check(f'[{nm}] R-FIGMA-01 instance layer tree = main (no new divergence)', not figma01, '; '.join(figma01[:3]))
        R.check(f'[{nm}] R-PENPOT-01 bindings + Light/Dark/effective values unchanged', not bind_bad, '; '.join(bind_bad[:5]))
        R.check(f'[{nm}] icons from library only (no new violation)', not icon_bad, '; '.join(icon_bad[:3]))
    R.totals = tot


def cmp_slots(b, c, spec, R):
    R.check('instance count unchanged', b['instanceCount'] == c['instanceCount'], f"{b['instanceCount']} → {c['instanceCount']} ({c['method']})")
    bi = {i['id']: i for i in b['instances']}
    for i in c['instances']:
        tag = f"[{i['page']} · {i['id']}]"
        R.check(f'{tag} linked', i['linked'], i['mainName'] or 'no main component')
        bb = bi.get(i['id'])
        if not bb:
            R.check(f'{tag} present in baseline', False, 'new instance'); continue
        R.check(f'{tag} property values unchanged', bb['props'] == i['props'], f"{bb['props']} → {i['props']}" if bb['props'] != i['props'] else json.dumps(i['props'], ensure_ascii=False))
        R.check(f'{tag} slot content preserved', bb['slotHash'] == i['slotHash'], f"{i['slotRegion']}, {i['slotNodes']} nodes")
        lv = i['limitViolations']
        R.check(f'{tag} limitViolations empty', lv in ([], None) or (isinstance(lv, str) and lv.startswith('n/a')), str(lv))
    for k in bi:
        if k not in {i['id'] for i in c['instances']}: R.check(f"[{bi[k]['page']} · {k}] still present", False, 'instance missing')


class Result:
    def __init__(self): self.rows = []; self.totals = None; self.known_issues = []
    def known(self, msg): self.known_issues.append(msg)
    def check(self, name, ok, detail=''): self.rows.append({'check': name, 'pass': bool(ok), 'detail': detail})
    @property
    def passed(self): return all(r['pass'] for r in self.rows)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('baseline'); ap.add_argument('current'); ap.add_argument('--spec'); ap.add_argument('--out')
    a = ap.parse_args()
    b, c = json.load(open(a.baseline)), json.load(open(a.current))
    spec = json.load(open(a.spec)) if a.spec else None
    if b.get('check') != c.get('check'): print('baseline and current come from different collectors'); sys.exit(2)
    if b.get('fileKey') != c.get('fileKey'): print('baseline and current come from different files'); sys.exit(2)
    R = Result()
    {'variants': cmp_variants, 'instances': cmp_instances, 'slots': cmp_slots}[c['check']](b, c, spec, R)
    fails = [r for r in R.rows if not r['pass']]
    verdict = 'PASS' if R.passed else 'FAIL'
    lines = [f"# Regression check: {c['check']} — {verdict}", '',
             f"- File `{c['fileKey']}` · baseline `{b.get('run')}` ({b['readAt']}) vs current `{c.get('run')}` ({c['readAt']})",
             f"- Spec: `{a.spec}`" if a.spec else '- Spec: none (nothing may change)',
             f"- Checks: {len(R.rows)} · failed: {len(fails)}" + (f" · totals: {R.totals}" if R.totals else ''), '',
             '| Result | Check | Detail |', '|---|---|---|']
    lines += [f"| {'✅' if r['pass'] else '❌'} | {r['check']} | {str(r['detail']).replace('|', '/')} |" for r in sorted(R.rows, key=lambda r: r['pass'])]
    if R.known_issues:
        lines += ['', f'## Known baseline issues ({len(R.known_issues)}) — present before and after, not counted as regressions', ''] + [f'- {k}' for k in R.known_issues]
    md = '\n'.join(lines) + '\n'
    if a.out:
        open(a.out + '.md', 'w').write(md)
        json.dump({'check': c['check'], 'verdict': verdict, 'baseline': a.baseline, 'current': a.current, 'spec': a.spec, 'rows': R.rows, 'totals': R.totals, 'knownIssues': R.known_issues},
                  open(a.out + '.json', 'w'), ensure_ascii=False, indent=1)
    print(f"{c['check']}: {verdict} ({len(R.rows)} checks, {len(fails)} failed)")
    for r in fails[:12]: print('  ✗', r['check'], '—', str(r['detail'])[:200])
    sys.exit(0 if R.passed else 1)


if __name__ == '__main__':
    main()
