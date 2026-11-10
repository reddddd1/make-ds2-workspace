// figma-snapshot.js — READ-ONLY snapshot for use_figma (schema make.figma-snapshot/2). Never writes to the file.
// use_figma returns at most 48 KB, so large files are snapshotted in PARTS and reassembled from the session
// transcript by collect-snapshot.py. Edit only CONFIG.
//   parts: list of [part, from, to]
//     ["vars", 0, 230]     collections + variables[from, to)  (sorted by id; ~230 per call for the DS duplicate)
//     ["styles", 0, 200]   paint styles[from, to) sorted by name; add ["styles", 200, 400, "te"] for text + effect styles
//     ["bindings"]         node-binding counts per variable over CONFIG.pages (all pages if null)
//   Small files (scratch): run all parts in one call, e.g. [["vars",0,9999],["styles",0,9999,"te"],["bindings"]].
// Value encoding (per mode, in collection mode order):
//   "@<id>"               alias to VariableID:<id>
//   "#rrggbbaa"           colour exactly representable in 8 bits (|x*255 - round| < 1e-4 per channel)
//   "#rrggbbaa~r,g,b,a"   colour with sub-8-bit precision: hex is the rounded value, raw floats (9 s.f.) follow
//   JSON                  number / string / boolean
const CONFIG = {
  fileKey: "PpnTy1pkB2FTZFq6i6seSy",
  parts: [["vars", 0, 230]],
  pages: null,
  digest: false,       // true = return only FNV hashes per part (cheap idempotency check against a stored baseline)
};
if (figma.fileKey !== CONFIG.fileKey) throw new Error("wrong file " + figma.fileKey);
const id = (s) => s.replace(/^VariableID:/, "");
const h2 = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
const exact = (x) => Math.abs(x * 255 - Math.round(x * 255)) < 1e-4;
const col = (c) => { const a = c.a ?? 1, hx = "#" + h2(c.r) + h2(c.g) + h2(c.b) + h2(a);
  return [c.r, c.g, c.b, a].every(exact) ? hx : hx + "~" + [c.r, c.g, c.b, a].map((x) => +x.toPrecision(9)).join(","); };
const enc = (x) => (x && x.type === "VARIABLE_ALIAS" ? "@" + id(x.id) : x && typeof x === "object" && "r" in x ? col(x) : JSON.stringify(x));
const bv = (o) => (o.boundVariables ? Object.entries(o.boundVariables).map(([k, x]) => k + ":" + (Array.isArray(x) ? x.map((y) => id(y.id)).join("+") : id(x.id))).join(";") : "");
const results = [];
for (const [part, from = 0, to = 1e9, extra] of CONFIG.parts) {
  const out = { schema: "make.figma-snapshot/2", fileKey: figma.fileKey, takenAt: new Date().toISOString(), part, from };
  if (part === "vars") {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    out.collections = cols.map((c) => [c.id, c.name, c.modes.map((m) => m.modeId + "=" + m.name), c.variableIds.length, c.hiddenFromPublishing ? 1 : 0]);
    const vars = (await figma.variables.getLocalVariablesAsync()).sort((a, b) => (a.id < b.id ? -1 : 1));
    out.total = vars.length; out.to = Math.min(to, vars.length);
    out.variables = vars.slice(from, to).map((v) => { const c = cols.find((k) => k.id === v.variableCollectionId);
      return [id(v.id), v.key, v.name, cols.indexOf(c), v.resolvedType[0], v.scopes.join(","), v.hiddenFromPublishing ? 1 : 0,
        Object.keys(v.codeSyntax).length ? JSON.stringify(v.codeSyntax) : "", v.description, c.modes.map((m) => enc(v.valuesByMode[m.modeId]))]; });
  }
  if (part === "styles") {
    const ps = (await figma.getLocalPaintStylesAsync()).sort((a, c) => (a.name < c.name ? -1 : 1));
    out.paintTotal = ps.length; out.to = Math.min(to, ps.length);
    out.paint = ps.slice(from, to).map((s) => [s.name, s.paints.map((p) => p.type === "SOLID" ? col({ ...p.color, a: p.opacity ?? 1 }) + (bv(p) ? "|" + bv(p) : "") + (p.visible === false ? "|hidden" : "") : p.type).join(" ")]);
    if (extra === "te") {
      out.text = (await figma.getLocalTextStylesAsync()).map((s) => [s.name, s.fontName.family + " " + s.fontName.style, s.fontSize, JSON.stringify(s.lineHeight), JSON.stringify(s.letterSpacing), bv(s)]);
      out.effect = (await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s.effects.map((e) => e.type + (e.color ? col(e.color) : "") + (bv(e) ? "|" + bv(e) : "")).join(" ")]);
    }
  }
  if (part === "bindings") {
    const counts = {}; let nodes = 0; const ab = { fills: "f", strokes: "s", effects: "e" };
    const add = (v, where) => { const k = id(v), w = ab[where] || where; counts[k] ??= {}; counts[k][w] = (counts[k][w] || 0) + 1; };
    const scan = (n) => { nodes++;
      for (const [k, x] of Object.entries(n.boundVariables || {})) if (!(k in ab)) for (const y of Array.isArray(x) ? x : [x]) if (y && y.id) add(y.id, k);
      for (const p of ["fills", "strokes"]) if (Array.isArray(n[p])) for (const q of n[p]) if (q.boundVariables && q.boundVariables.color) add(q.boundVariables.color.id, p);
      if (Array.isArray(n.effects)) for (const e of n.effects) if (e.boundVariables && e.boundVariables.color) add(e.boundVariables.color.id, "effects");
      if ("children" in n) for (const c of n.children) scan(c); };
    const pages = figma.root.children.filter((p) => !CONFIG.pages || CONFIG.pages.includes(p.name));
    for (const p of pages) { await p.loadAsync(); for (const c of p.children) scan(c); }
    out.pages = pages.length; out.nodes = nodes;
    out.counts = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, Object.entries(v).map(([w, n]) => w + n).join(",")]));
  }
  if (CONFIG.digest) {   // digest mode: replace payloads by FNV-1a hashes (compare with collect-snapshot.py --digest of a stored baseline)
    const fnv = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(16); };
    for (const k of ["collections", "variables", "paint", "text", "effect", "counts"]) if (k in out) out[k] = "fnv:" + fnv(JSON.stringify(out[k]));
  }
  results.push(out);
}
return results.length === 1 ? results[0] : results;
