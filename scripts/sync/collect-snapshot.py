#!/usr/bin/env python3
"""Reassemble a make.figma-snapshot/2 baseline from use_figma results in a Claude session transcript.

use_figma returns at most 48 KB per call, so figma-snapshot.js is run in parts (vars windows, styles
windows, bindings). This script finds those tool results in the session .jsonl (newest run wins per
part/window), checks completeness and writes one canonical JSON file.

Usage: collect-snapshot.py SESSION.jsonl OUT.json [--file-key KEY] [--after ISO] [--before ISO]
"""
import json, sys

def results(path):
    for line in open(path, encoding="utf-8"):
        try:
            d = json.loads(line)
        except ValueError:
            continue
        m = d.get("message") or {}
        for b in m.get("content") or [] if isinstance(m, dict) else []:
            if not (isinstance(b, dict) and b.get("type") == "tool_result"):
                continue
            c = b.get("content")
            texts = [c] if isinstance(c, str) else [x.get("text", "") for x in c or [] if isinstance(x, dict)]
            for t in texts:
                if '"make.figma-snapshot/2"' in t:
                    try:
                        r = json.loads(t)
                    except ValueError:
                        continue
                    yield from (r if isinstance(r, list) else [r])   # small files: all parts in one call

def main(a):
    src, out = a[0], a[1]
    key = a[a.index("--file-key") + 1] if "--file-key" in a else None
    after = a[a.index("--after") + 1] if "--after" in a else ""
    before = a[a.index("--before") + 1] if "--before" in a else "9999"
    parts = {}
    for r in results(src):
        if (key and r["fileKey"] != key) or not (after <= r["takenAt"] < before):
            continue
        k = (r["part"], r.get("from", 0))
        if k not in parts or parts[k]["takenAt"] < r["takenAt"]:
            parts[k] = r
    vars_ = sorted([p for k, p in parts.items() if k[0] == "vars"], key=lambda p: p["from"])
    if not vars_:
        sys.exit("no vars parts found")
    total = vars_[0]["total"]
    rows, nxt = [], 0
    for p in vars_:
        if p["from"] != nxt:
            sys.exit(f"gap in variables: expected from={nxt}, got {p['from']}")
        rows += p["variables"]; nxt = p["to"]
    if nxt != total or len(rows) != total:
        sys.exit(f"incomplete variables: {len(rows)}/{total}")
    cols = next(p["collections"] for p in vars_ if "collections" in p)
    styles = sorted([p for k, p in parts.items() if k[0] == "styles"], key=lambda p: p.get("from", 0))
    paint = [r for p in styles for r in p["paint"]]
    if styles and len(paint) != styles[0]["paintTotal"]:
        sys.exit(f"incomplete paint styles: {len(paint)}/{styles[0]['paintTotal']}")
    text = next((p["text"] for p in styles if "text" in p), None)
    effect = next((p["effect"] for p in styles if "effect" in p), None)
    bind = parts.get(("bindings", 0))
    times = sorted(p["takenAt"] for p in parts.values())
    snap = {
        "schema": "make.figma-snapshot/2", "fileKey": vars_[0]["fileKey"], "takenFrom": times[0], "takenTo": times[-1],
        "collections": [{"id": c[0], "name": c[1], "modes": c[2], "count": c[3], "hidden": c[4]} for c in cols],
        "variables": [{"id": r[0], "key": r[1], "name": r[2], "col": cols[r[3]][1], "type": r[4], "scopes": r[5],
                       "hidden": r[6], "codeSyntax": r[7], "desc": r[8],
                       "values": dict(zip([m.split("=", 1)[1] for m in cols[r[3]][2]], r[9]))} for r in rows],
        "paintStyles": [{"name": r[0], "paints": r[1]} for r in paint] if styles else None,
        "textStyles": [{"name": r[0], "font": r[1], "size": r[2], "lineHeight": r[3], "letterSpacing": r[4], "bound": r[5]} for r in text] if text else None,
        "effectStyles": [{"name": r[0], "effects": r[1]} for r in effect] if effect else None,
        "bindings": {"pages": bind["pages"], "nodes": bind["nodes"], "counts": bind["counts"]} if bind else None,
    }
    json.dump(snap, open(out, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {out}: {len(snap['variables'])} variables, {len(paint)} paint / {len(text or [])} text / "
          f"{len(effect or [])} effect styles, bindings for {len(bind['counts']) if bind else 0} ids over {bind['nodes'] if bind else 0} nodes")

if __name__ == "__main__":
    main(sys.argv[1:])
