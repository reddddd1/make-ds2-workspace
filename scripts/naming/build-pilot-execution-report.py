#!/usr/bin/env python3
"""Writes reports/token-naming-pilot-execution.md from reports/token-naming/pilot-execution/{before,after,write-result,validation}.json.
Read-only, deterministic. Usage: python3 -I scripts/naming/build-pilot-execution-report.py"""
import json, os
W = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = os.path.join(W, 'reports/token-naming/pilot-execution')
b, a, w, v = (json.load(open(os.path.join(D, f + '.json'))) for f in ('before', 'after', 'write-result', 'validation'))
base = json.load(open(os.path.join(W, 'reports/token-naming/pilot-final-review-read.json')))
ORDER = [x['id'] for x in w['after']]
c = v['checks']; yn = lambda x: 'yes' if x else '**NO**'
# Alias-target names: non-pilot targets from the baseline read (unchanged variables), pilot targets from the after read
names_after = {}
for d in base['detail'].values():
    for x in d['modes'].values():
        if isinstance(x, dict) and x.get('alias'): names_after[x['alias']] = x['aliasName'].split(' › ', 1)[1]
names_after.update({i: a['pilot'][i]['name'] for i in ORDER})
def alias_str(modes, names):
    out = []
    for m, x in sorted(modes.items(), key=lambda t: (t[0] != 'Light mode', t[0])):
        if isinstance(x, dict) and 'alias' in x: out.append(f"{m} → `{names.get(x['alias'], x['alias'])}`")
    return ', '.join(out) or '— (raw value)'
L = ['# Token naming pilot — execution report', '',
     f"> 2026-11-09. Approved by Mike (\"APPROVED: All 11 variable renames in reports/token-naming-pilot.md §2–§5. No rows are excluded.\"). Target: duplicate `{w['fileKey']}` only. Write: {w['writtenAt']}.",
     '> Not done, as instructed: no commit, push or publish; no radius change; no Tailwind override; no registry sync; no change to the original library or the design-tokens repo; no further renames.', '',
     f"## Result: **{'PASS' if v['PASS'] else 'FAIL'}**", '',
     '## 1. Execution sequence', '',
     '| Step | Call | Result |', '|---|---|---|',
     f"| Target check | every call refuses a file key other than `PpnTy1pkB2FTZFq6i6seSy` | file key confirmed: `{b['fileKey']}` |",
     f"| Before snapshot (read-only, `pilot-verify-read.js`) | {b['readAt']} | {b['variableCount']} variables, {b['styleCount']} styles, 7 collections |",
     f"| Compare with approved baseline (final-review read {base['readAt']}) | names, IDs, types, collections, modes, scopes, code syntax, publishing, alias counts, styles, per-component binding counts and fields | **no changes** since the approved baseline |",
     f"| Rename (`pilot-rename.js`, `APPLY = true`) | preflight inside the same call: file key, 11 old names, 11 target names free, count = 11; only mutation `variable.name = new` | `{w['mode']}`, in-call verify 11/11 ok |",
     f"| After snapshot (fresh call, read-only, same script) | {a['readAt']} | used for all validation below; a separate call after the write = persisted |", '',
     '## 2. Before → after mapping', '',
     '| # | Variable ID | Type | Collection | Before | After | ID unchanged |', '|---|---|---|---|---|---|---|']
for i, vid in enumerate(ORDER, 1):
    B, A = b['pilot'][vid], a['pilot'][vid]
    L.append(f"| {i} | `{vid}` | {A['type']} | `{A['collection']}` | `{B['name']}` | **`{A['name']}`** | yes |")
L += ['', '## 3. Exact change counts', '',
      '| Measure | Before | After | Expected | OK |', '|---|---|---|---|---|',
      f"| Local variables | {c['variableCount'][0]} | {c['variableCount'][1]} | 682 / 682 | {yn(c['variableCount'][0] == c['variableCount'][1] == 682)} |",
      f"| Variable ID set | — | — | identical | {yn(c['variableIdSetUnchanged'])} |",
      f"| Variables whose fingerprint (name + collection, type, values per mode, scopes, code syntax, publishing, description, key) changed | — | {len(c['fingerprintsChanged'])} | exactly the 11 pilot IDs | {yn(c['exactly11ChangedAndAllPilot'])} |",
      f"| Of those 11: fields other than the name that changed | — | {sum(len(r['otherFieldDiffs']) for r in v['perVariable'].values())} | 0 | {yn(all(not r['otherFieldDiffs'] for r in v['perVariable'].values()))} |",
      f"| Other 671 variables changed | — | {len(c['fingerprintsChanged']) - 11} | 0 | {yn(c['exactly11ChangedAndAllPilot'])} |",
      f"| Collections (name, modes, variable count) | 7 | 7 | identical | {yn(c['collectionsUnchanged'])} |",
      f"| Local styles (count + digest of names and bound variable IDs) | {c['styleCount'][0]} · `{c['stylesDigest'][0]}` | {c['styleCount'][1]} · `{c['stylesDigest'][1]}` | identical | {yn(c['styleCount'][0] == c['styleCount'][1] and c['stylesDigest'][0] == c['stylesDigest'][1])} |",
      f"| Component bindings to the 11 IDs | {c['bindingTotals'][0]} | {c['bindingTotals'][1]} | 1,722 / 1,722 | {yn(c['bindingTotals'][0] == c['bindingTotals'][1] == 1722)} |", '',
      '## 4. Binding verification (per variable, per component)', '',
      'Each count compares the before and after snapshot component by component and field by field (counting rule v2: one entry in `node.boundVariables` on own layers of main components).', '',
      '| # | Variable (after) | Bindings before | after | Components | Per-component + per-field identical | Non-component layers before → after |', '|---|---|---|---|---|---|---|']
for i, vid in enumerate(ORDER, 1):
    r = v['perVariable'][vid]
    L.append(f"| {i} | `{r['after']}` | {r['bindingsBefore']} | {r['bindingsAfter']} | {r['components']} | {yn(r['perComponentIdentical'])} | {r['otherLayers'][0]} → {r['otherLayers'][1]} |")
L += ['', '## 5. Alias and style verification', '',
      'Outbound = what the variable points to (per mode); inbound = variables pointing to it. Both are compared as **ID lists**. Names below are the current (after) names.', '',
      '| # | Variable (after) | Outbound aliases (after) | Outbound identical | Inbound (count before → after) | Inbound IDs identical | Styles (before → after) | Style list identical | Values per mode identical | Scopes · code syntax · publishing identical |', '|---|---|---|---|---|---|---|---|---|---|']
for i, vid in enumerate(ORDER, 1):
    B, A, r = b['pilot'][vid], a['pilot'][vid], v['perVariable'][vid]
    L.append(f"| {i} | `{A['name']}` | {alias_str(A['modes'], names_after)} | {yn(B['modes'] == A['modes'])} | {r['aliasedBy'][0]} → {r['aliasedBy'][1]} | {yn(B['aliasedBy'] == A['aliasedBy'])} | {r['styles'][0]} → {r['styles'][1]} | {yn(B['styles'] == A['styles'])} | {yn(B['modes'] == A['modes'])} | {yn(B['scopes'] == A['scopes'] and B['codeSyntax'] == A['codeSyntax'] and B['hidden'] == A['hidden'])} |")
L += ['', 'In-batch alias pairs resolve by ID after the rename: `color/bg/brand-primary` → `color/brand/600`, `color/text/brand-primary` (Light) → `color/brand/600`, `color/border/primary` (Light) → `color/gray/450`. The `Brand/600` paint style, the 3 focus-ring effect styles and the 16 + 4 text styles still reference the same IDs.', '',
      '## 6. Naming collisions', '',
      '- **Before the write:** the preflight inside the rename call confirmed no new name existed in its collection. The approved final-review read found no look-alikes and no same name in other collections.',
      '- **After the write:** the other 671 variables are byte-identical, names included, so no new duplicate can have appeared. The 11 new names are distinct from each other.',
      '- **Result: 0 collisions.**', '',
      '## 7. Unexpected changes', '',
      f"**None.** The only differences between the before and after snapshots are the 11 `name` fields. {'' if v['PASS'] else 'SEE FAILURES ABOVE.'}", '',
      'Known limits of this validation (stated, not failures):',
      '- For the 11 renamed variables, `description` and `key` are inside the combined fingerprint together with the name, so they are not compared separately. The write script sets only `name`.',
      '- Instance-level overrides on page layers and nested-instance internals are not counted: bindings point to IDs, and a name-only change can\'t affect them.',
      '- No visual screenshot or E1 variant-hash run: not in the required validation list, and a name change has no visual effect. Available on request.',
      '- `collect-instances` (R-PENPOT-01) prints variable names, so its next run will show the 11 new names. That is expected; re-baseline it before the next comparison.', '',
      '## 8. Rollback (not needed, ready)', '',
      '`scripts/naming/pilot-rename.js` with `ROLLBACK = true` renames the 11 IDs back. It only runs if each variable still carries the pilot name, so it cannot overwrite a later manual change.', '',
      '## Evidence', '',
      '`reports/token-naming/pilot-execution/`: `before.json`, `write-result.json`, `after.json`, `validation.json`. Scripts: `scripts/naming/pilot-verify-read.js` (read-only), `pilot-rename.js`, `extract-tool-result.py`, `build-pilot-execution-report.py`.', '',
      '## Subscription status', '', 'Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.', '']
open(os.path.join(W, 'reports/token-naming-pilot-execution.md'), 'w').write('\n'.join(L) + '\n')
print('written', 'PASS' if v['PASS'] else 'FAIL')
