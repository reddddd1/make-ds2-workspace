#!/usr/bin/env python3
"""Compute FNV-1a digests (same as figma-snapshot.js digest mode) of the RAW snapshot parts stored in a session transcript.
Usage: digest-baseline.py SESSION.jsonl FILE_KEY AFTER_ISO BEFORE_ISO"""
import json, sys
def fnv(s):   # FNV-1a over UTF-16 code units, identical to the JS version
    b, x = s.encode('utf-16-le'), 2166136261
    for i in range(0, len(b), 2):
        x ^= int.from_bytes(b[i:i + 2], 'little'); x = (x * 16777619) & 0xffffffff
    return format(x, 'x')
def js(o): return json.dumps(o, separators=(',', ':'), ensure_ascii=False)
src, key, after, before = sys.argv[1:5]
seen = {}
for line in open(src, encoding='utf-8'):
    try: d = json.loads(line)
    except ValueError: continue
    m = d.get('message') or {}
    for b in (m.get('content') or []) if isinstance(m, dict) else []:
        if not (isinstance(b, dict) and b.get('type') == 'tool_result'): continue
        c = b.get('content'); texts = [c] if isinstance(c, str) else [x.get('text', '') for x in c or [] if isinstance(x, dict)]
        for t in texts:
            if '"make.figma-snapshot/2"' not in t: continue
            try: r = json.loads(t)
            except ValueError: continue
            for p in (r if isinstance(r, list) else [r]):
                if p['fileKey'] != key or not (after <= p['takenAt'] < before) or isinstance(p.get('variables', p.get('paint', p.get('counts'))), str): continue
                seen[(p['part'], p.get('from', 0))] = {k: 'fnv:' + fnv(js(p[k])) for k in ['collections', 'variables', 'paint', 'text', 'effect', 'counts'] if k in p}
print(json.dumps({f'{k[0]}@{k[1]}': v for k, v in sorted(seen.items())}, indent=1))
