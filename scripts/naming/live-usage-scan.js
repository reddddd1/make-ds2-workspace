// READ-ONLY use_figma script — live variable usage on the duplicate, keyed by variable ID.
// Output -> reports/token-naming/live-usage-duplicate.json (consumed by build-naming-audit.py).
// No setters, no create/remove/append, no name assignment. Refuses the original library.
//
// Counting rule (v2, 2026-11-09): one binding = one entry in `node.boundVariables` (fills, strokes,
// effects, fontSize, fontStyle, paragraphSpacing, padding, radius, …). Paint- and effect-level
// `boundVariables` are NOT counted again (v1 counted both and doubled every colour binding).
// Scope: own layers of every main component (component sets and standalone components) on all pages;
// instance internals are not descended into (they belong to their own main component).
// Styles: local text / effect / paint styles whose bound variables reference the ID.
const ORIGINAL = 'xJoAz66aekAToyhBmfGNt0';
const PART = 0, PARTS = 2; // output is split to stay under the 48 kB return limit: run with PART = 0 and 1, then merge `use` (styles come with part 0)
if (figma.fileKey === ORIGINAL) throw new Error('REFUSED: original library');
figma.skipInvisibleInstanceChildren = false;
const use = {}, owners = new Set();
const add = (id, owner, field) => {
  const u = use[id] = use[id] || { n: 0, comps: {}, fields: {} };
  u.n++; u.comps[owner] = (u.comps[owner] || 0) + 1; u.fields[field] = (u.fields[field] || 0) + 1;
};
for (const p of figma.root.children) {
  await p.loadAsync();
  const visit = (n, owner) => {
    let o = owner;
    if (!o && (n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET'))) { o = n.name; owners.add(o); }
    if (o && n.boundVariables) for (const [f, val] of Object.entries(n.boundVariables)) for (const a of [].concat(val)) if (a && a.id) add(a.id, o, f);
    if (n.type === 'INSTANCE' || !('children' in n)) return;
    for (const ch of n.children) visit(ch, o);
  };
  for (const top of p.children) visit(top, null);
}
const styles = {};
const scan = (bv, hits) => { if (bv) for (const val of Object.values(bv)) for (const a of [].concat(val)) if (a && a.id) hits.add(a.id); };
for (const [kind, list] of [['text', await figma.getLocalTextStylesAsync()], ['effect', await figma.getLocalEffectStylesAsync()], ['paint', await figma.getLocalPaintStylesAsync()]]) {
  for (const s of list) {
    const hits = new Set(); scan(s.boundVariables, hits);
    if (kind === 'paint') for (const x of s.paints) scan(x.boundVariables, hits);
    if (kind === 'effect') for (const x of s.effects) scan(x.boundVariables, hits);
    for (const h of hits) { const e = styles[h] = styles[h] || { n: 0, ex: [] }; e.n++; if (e.ex.length < 3) e.ex.push(kind + ': ' + s.name); }
  }
}
const out = {};
const keys = Object.keys(use).sort();
for (const [i, id] of keys.entries()) {
  if (i % PARTS !== PART) continue; const u = use[id];
  const top = Object.entries(u.comps).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  out[id] = { n: u.n, c: top.length, top: top.slice(0, 3), fields: u.fields };
}
return { fileKey: figma.fileKey, readAt: new Date().toISOString(), countingRule: 'v2: node.boundVariables entries only', owners: owners.size, part: PART + '/' + PARTS, variablesUsed: keys.length, use: out, styles: PART === 0 ? styles : {} };
