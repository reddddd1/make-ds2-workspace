#!/usr/bin/env python3
"""Build registry/components.json from a raw figma-registry-extract.js dump, then validate it.

Usage: python3 -I scripts/build-registry.py registry/raw/<extract>.json registry/components.json
Reads only local files. Never talks to Figma.
"""
import hashlib, json, os, sys
from collections import Counter

SCHEMA_VERSION = "1.0.0"
# Pages the 2026-11-09 audit (§2.3) did not count as base components.
NON_AUDIT_PAGES = {"↳ Colors", "↳ Logos", "↳ Typography", "↳ Effect styles", "↳ Design annotations"}
# Audit §2.3 expectations, for reconciliation only.
AUDIT = {"sets": 68, "variants_approx": 1170, "standalone": 12, "text_props": 1, "instance_swap_props": 7}
SPOT = {"Buttons/Button": {"variants": 118, "props": 7}, "Input field": {"variants": 53}}

ITEM_REQUIRED = {
    "kind": str, "name": str, "id": str, "key": str, "page": str, "pageId": str, "scope": str,
    "hasDescription": bool, "axes": list, "properties": list, "nestedInstances": int,
    "missingMainComponent": int, "exposedInstances": list, "dependencies": list, "bindings": dict,
    "slotNamedLayers": int, "variantsWithoutAutoLayout": int,
}
PROP_TYPES = {"BOOLEAN", "TEXT", "INSTANCE_SWAP", "VARIANT", "SLOT"}


def sha256(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def build(raw):
    items = []
    for p in raw["pages"]:
        for it in p["items"]:
            it = dict(it)
            it["scope"] = "primitives" if it["page"] in NON_AUDIT_PAGES else "base"
            items.append(it)
    owner_keys = {i["key"]: i for i in items}

    # Dependency index
    deps = {}
    for i in items:
        for d in i["dependencies"]:
            e = deps.setdefault(d["key"], {"name": d["name"], "key": d["key"], "isSet": d["isSet"],
                                           "remote": d["remote"], "usedBy": [], "instanceCount": 0})
            e["usedBy"].append(i["name"])
            e["instanceCount"] += d["count"]
    for e in deps.values():
        if e["remote"]:
            e["source"] = "remote library (library name UNVERIFIED; Plugin API does not expose it)"
        elif e["key"] in owner_keys:
            e["source"] = "local (this file)"
        else:
            e["source"] = "local orphan: main component is on no page (parent=null, removed=false; VERIFIED for 25 sampled 2026-11-09)"
        e["usedBy"] = sorted(set(e["usedBy"]))

    def totals(sel):
        sets = [i for i in sel if i["kind"] == "set"]
        lone = [i for i in sel if i["kind"] == "component"]
        ptypes = Counter(p["type"] for i in sel for p in i["properties"])
        return {
            "componentSets": len(sets), "variants": sum(i["variantCount"] for i in sets),
            "standaloneComponents": len(lone), "propertyTypes": dict(sorted(ptypes.items())),
            "rawFill": sum(i["bindings"]["rawFill"] for i in sel),
            "rawStroke": sum(i["bindings"]["rawStroke"] for i in sel),
            "rawText": sum(i["bindings"]["rawText"] for i in sel),
        }

    base = [i for i in items if i["scope"] == "base"]
    t_all, t_base = totals(items), totals(base)
    swaps = [{"component": i["name"], "property": p["name"], "default": (p.get("defaultRef") or {}).get("name"),
              "preferredCount": p.get("preferredCount", 0), "scope": i["scope"]}
             for i in items for p in i["properties"] if p["type"] == "INSTANCE_SWAP"]
    texts = [{"component": i["name"], "property": p["name"], "scope": i["scope"]}
             for i in items for p in i["properties"] if p["type"] == "TEXT"]

    by_name = {i["name"]: i for i in items}
    spot = {}
    for n, exp in SPOT.items():
        i = by_name.get(n)
        act = {"variants": i["variantCount"], "props": len(i["properties"])} if i else None
        spot[n] = {"expected": exp, "actual": act,
                   "match": bool(act) and all(act[k] == v for k, v in exp.items())}

    recon = {
        "componentSets": {"audit": AUDIT["sets"], "actual": t_base["componentSets"]},
        "variants": {"audit": "~%d" % AUDIT["variants_approx"], "actual": t_base["variants"]},
        "standaloneComponents": {"audit": AUDIT["standalone"], "actual": t_base["standaloneComponents"]},
        "textProperties": {"audit": AUDIT["text_props"], "actual": sum(1 for t in texts if t["scope"] == "base")},
        "instanceSwapProperties": {"audit": AUDIT["instance_swap_props"], "actual": sum(1 for s in swaps if s["scope"] == "base")},
        "spotChecks": spot,
    }

    read_times = sorted(p["readAt"] for p in raw["pages"])
    return {
        "schemaVersion": SCHEMA_VERSION,
        "source": {
            "fileKey": raw["fileKey"], "file": "MAKER-DS-v2 (published as \"MAKER DS v2\")",
            "readAt": {"first": read_times[0], "last": read_times[-1]},
            "extractor": "scripts/figma-registry-extract.js",
            "extractorSha256": sha256(os.path.join(os.path.dirname(__file__), "figma-registry-extract.js")),
            "mode": "read-only",
        },
        "scopeNote": "scope=base matches the audit §2.3 count; scope=primitives = Colors, Logos, Typography, Effect styles, Design annotations pages.",
        "bindingsNote": "Raw counts cover solid fills, solid strokes and text-style presence on each component's own layers; nested instances are not descended. Spacing/radius/effect bindings are P1-05.",
        "totals": {"all": t_all, "base": t_base},
        "reconciliation": recon,
        "instanceSwapProperties": swaps,
        "textProperties": texts,
        "dependencies": sorted(deps.values(), key=lambda e: (not e["remote"], e["source"], e["name"])),
        "components": items,
    }


def validate(reg):
    errs = []
    for k in ("schemaVersion", "source", "totals", "components", "dependencies"):
        if k not in reg:
            errs.append("missing top-level " + k)
    seen = set()
    for i in reg["components"]:
        where = i.get("name", "?")
        for f, t in ITEM_REQUIRED.items():
            if not isinstance(i.get(f), t) or (t is int and isinstance(i.get(f), bool)):
                errs.append(f"{where}: field {f} missing or not {t.__name__}")
        if i.get("kind") == "set" and not isinstance(i.get("variantCount"), int):
            errs.append(f"{where}: set without variantCount")
        if i.get("id") in seen:
            errs.append(f"{where}: duplicate id")
        seen.add(i.get("id"))
        for p in i.get("properties", []):
            if p.get("type") not in PROP_TYPES:
                errs.append(f"{where}: unknown property type {p.get('type')}")
            if p.get("type") == "VARIANT" and not p.get("options"):
                errs.append(f"{where}: variant property {p.get('name')} without options")
    return errs


if __name__ == "__main__":
    raw_path, out_path = sys.argv[1], sys.argv[2]
    reg = build(json.load(open(raw_path)))
    errs = validate(reg)
    if errs:
        print("INVALID:\n  " + "\n  ".join(errs))
        sys.exit(1)
    json.dump(reg, open(out_path, "w"), ensure_ascii=False, indent=1)
    json.load(open(out_path))  # round-trip parse check
    print("valid;", json.dumps(reg["totals"]), "\n", json.dumps(reg["reconciliation"], ensure_ascii=False))
