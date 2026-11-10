#!/usr/bin/env python3
"""Copy the most recent use_figma JSON result whose text starts with a given prefix out of a Claude Code
session transcript into a file (the tool output itself can't be written to disk directly).
Usage: python3 -I extract-tool-result.py <transcript.jsonl> <prefix> <out.json> [contains]"""
import json, sys
T, prefix, out = sys.argv[1:4]; contains = sys.argv[4] if len(sys.argv) > 4 else None
got = None
for line in open(T):
    try: d = json.loads(line)
    except Exception: continue
    c = (d.get('message') or {}).get('content')
    if not isinstance(c, list): continue
    for b in c:
        if b.get('type') != 'tool_result': continue
        cc = b.get('content'); texts = [cc] if isinstance(cc, str) else [x.get('text', '') for x in (cc or []) if isinstance(x, dict)]
        for t in texts:
            t = t.strip()
            if t.startswith(prefix) and (contains is None or contains in t): got = t
if got is None: sys.exit('not found')
json.dump(json.loads(got), open(out, 'w'), indent=1, sort_keys=True, ensure_ascii=False); print('saved', out)
