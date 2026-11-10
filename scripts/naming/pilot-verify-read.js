// READ-ONLY use_figma script — before/after snapshot for the 11-variable naming pilot.
// No setters, no create/remove/append, no name assignment. Refuses any file other than the duplicate.
// Returns:
//   pilot   : per pilot ID — name, collection, type, modes (raw/alias), scopes, codeSyntax, hidden, aliasedBy (IDs),
//             styles referencing it, component bindings per component and field, bindings on non-component layers
//   vars    : every local variable (ID without the 'VariableID:' prefix) -> FNV-1a of name + collection, type,
//             valuesByMode, scopes, codeSyntax, hidden, description, key
//   styles  : count + one combined FNV over every local text/effect/paint style (name + bound variable IDs)
//   collections: id -> [name, modes, variableIds count]
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
const PILOT = ['VariableID:5248:377715', 'VariableID:23468:2', 'VariableID:5270:371419', 'VariableID:5353:380427', 'VariableID:6137:268549', 'VariableID:5263:373125',
  'VariableID:5270:371435', 'VariableID:7371:212918', 'VariableID:5253:372203', 'VariableID:7407:110365', 'VariableID:7405:102287'];
const ids = new Set(PILOT);
const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stable = o => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(x => [x, v[x]])) : v);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const colById = Object.fromEntries(cols.map(c => [c.id, c]));
const all = await figma.variables.getLocalVariablesAsync();
const vars = {};
for (const v of all) vars[v.id.replace('VariableID:', '')] = fnv(stable({ n: v.name, c: v.variableCollectionId, t: v.resolvedType, m: v.valuesByMode, s: v.scopes, cs: v.codeSyntax, h: v.hiddenFromPublishing, d: v.description, k: v.key }));
const collections = {};
for (const c of cols) collections[c.id] = [c.name, c.modes.map(m => m.name).join('|'), c.variableIds.length];
const pilot = {};
for (const id of PILOT) {
  const v = all.find(x => x.id === id); if (!v) { pilot[id] = null; continue; }
  const c = colById[v.variableCollectionId];
  const modes = {};
  for (const m of c.modes) { const x = v.valuesByMode[m.modeId]; modes[m.name] = (x && x.type === 'VARIABLE_ALIAS') ? { alias: x.id } : x; }
  pilot[id] = { name: v.name, collection: c.name, type: v.resolvedType, modes, scopes: v.scopes, codeSyntax: v.codeSyntax, hidden: v.hiddenFromPublishing,
    aliasedBy: all.filter(o => Object.values(o.valuesByMode).some(x => x && x.type === 'VARIABLE_ALIAS' && x.id === id)).map(o => o.id).sort(),
    styles: [], comps: {}, otherLayers: 0 };
}
const styles = {}; // style id -> fingerprint (combined in the return value)
for (const [kind, list] of [['text', await figma.getLocalTextStylesAsync()], ['effect', await figma.getLocalEffectStylesAsync()], ['paint', await figma.getLocalPaintStylesAsync()]]) {
  for (const s of list) {
    const hits = [];
    const scan = bv => { if (bv) for (const [f, val] of Object.entries(bv)) for (const a of [].concat(val)) if (a && a.id) hits.push(f + ':' + a.id); };
    scan(s.boundVariables);
    if (kind === 'paint') s.paints.forEach((p, i) => scan(p.boundVariables && Object.fromEntries(Object.entries(p.boundVariables).map(([f, a]) => ['p' + i + f, a]))));
    if (kind === 'effect') s.effects.forEach((e, i) => scan(e.boundVariables && Object.fromEntries(Object.entries(e.boundVariables).map(([f, a]) => ['e' + i + f, a]))));
    styles[s.id] = fnv(kind + s.name + hits.sort().join(','));
    for (const id of new Set(hits.map(h => h.split(':').slice(1).join(':')))) if (ids.has(id)) pilot[id].styles.push(kind + ': ' + s.name);
  }
}
figma.skipInvisibleInstanceChildren = false;
for (const p of figma.root.children) {
  await p.loadAsync();
  const visit = (n, owner) => {
    let o = owner;
    if (!o && (n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET'))) o = n.name;
    if (n.boundVariables) for (const [f, val] of Object.entries(n.boundVariables)) for (const a of [].concat(val)) if (a && ids.has(a.id)) {
      if (o) { const r = pilot[a.id].comps[o] = pilot[a.id].comps[o] || { n: 0, fields: {} }; r.n++; r.fields[f] = (r.fields[f] || 0) + 1; } else pilot[a.id].otherLayers++;
    }
    if (n.type === 'INSTANCE' || !('children' in n)) return;
    for (const ch of n.children) visit(ch, o);
  };
  for (const top of p.children) visit(top, null);
}
for (const id of PILOT) pilot[id].styles.sort();
return { fileKey: figma.fileKey, readAt: new Date().toISOString(), variableCount: all.length, styleCount: Object.keys(styles).length, stylesDigest: fnv(Object.keys(styles).sort().map(k => k + '=' + styles[k]).join(';')), collections, pilot, vars };
