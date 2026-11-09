// READ-ONLY use_figma collector — R-PAPER-01 (variant-scope coverage) + library protection fingerprint.
// Run in the LIBRARY file (original or duplicate). Set SET_IDS (component set node IDs), RUN (label),
// PROBE (optional layer name whose presence/visibility is reported per variant, e.g. a new arrow icon).
// Per variant it returns a hash of every own-layer feature (structure by index, type, visibility,
// bound variable IDs, layout numbers, size, text, nested-instance component key). A change anywhere in a
// variant changes its hash. The file fingerprint (variable collections, style counts, property-definition
// hashes) replaces `updatedAt`, which the Plugin API does not expose.
// Mutation review: only getNodeByIdAsync, getMainComponentAsync, variables/style getters and getStyleByIdAsync and property reads.
// E1 (P2-00): each layer line also carries its name, componentPropertyReferences and isExposedInstance, so
// binding a layer to a TEXT/BOOLEAN/INSTANCE_SWAP property, exposing a nested instance or renaming a layer
// changes the variant hash. File-independent: styles are recorded by name and local nested components by
// set > variant name (remote ones by key), so the same component hashes identically in the original and a
// duplicate (style and component keys change when a file is copied; node and variable IDs do not — P1-03).
const SET_IDS = ['__SET_ID__'], RUN = '__RUN__', PROBE = null, LIMIT = 48000;
// skipInvisibleInstanceChildren is a plugin-runtime option, not stored in the file: with the default (true) hidden
// layers inside instances are omitted from reads, which makes instance and main trees incomparable.
figma.skipInvisibleInstanceChildren = false;
function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, '0'); }
const styleNames = {};
async function sn(id) { if (!id || typeof id !== 'string') return String(id); if (!(id in styleNames)) { const st = await figma.getStyleByIdAsync(id); styleNames[id] = st ? st.name : 'missing:' + id; } return styleNames[id]; }
const r2 = (x) => typeof x === 'number' ? Math.round(x * 100) / 100 : String(x);
function bvs(n) {
  const out = []; const bv = n.boundVariables || {};
  for (const k of Object.keys(bv).sort()) { const v = bv[k]; const ids = Array.isArray(v) ? v.map(a => a && a.id) : [v && v.id]; out.push(k + '=' + ids.join(',')); }
  for (const prop of ['fills', 'strokes']) if (prop in n && Array.isArray(n[prop])) n[prop].forEach((p, i) => { if (p.boundVariables && p.boundVariables.color) out.push(prop + i + '.color=' + p.boundVariables.color.id); });
  if ('effects' in n && Array.isArray(n.effects)) n.effects.forEach((e, i) => { const b = e.boundVariables || {}; for (const k of Object.keys(b).sort()) out.push('effect' + i + '.' + k + '=' + b[k].id); });
  return out.join(';');
}
async function nums(n) {
  const f = [];
  for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing', 'counterAxisSpacing', 'cornerRadius', 'strokeWeight', 'opacity', 'layoutMode']) if (k in n) f.push(k[0] + k.slice(-3) + '=' + r2(n[k]));
  if ('width' in n) f.push('w=' + r2(n.width) + ',h=' + r2(n.height));
  if (n.type === 'TEXT') f.push('t=' + fnv(n.characters) + ',st=' + await sn(n.textStyleId));
  if ('fills' in n && Array.isArray(n.fills)) f.push('fl=' + n.fills.map(p => p.type + (p.visible === false ? '-' : '') + (p.color ? r2(p.color.r) + '/' + r2(p.color.g) + '/' + r2(p.color.b) + '/' + r2(p.opacity) : '')).join('|'));
  for (const k of ['fillStyleId', 'strokeStyleId', 'effectStyleId']) if (k in n && n[k]) f.push(k.slice(0, 2) + 's=' + await sn(n[k]));
  return f.join(';');
}
async function features(n, path, acc, depth, probe) {
  const refs = n.componentPropertyReferences ? Object.keys(n.componentPropertyReferences).sort().map(k => k + '>' + n.componentPropertyReferences[k]).join(',') : '';
  let line = path + '|' + n.type + '|' + n.name + '|' + (n.visible === false ? 'h' : 'v') + '|' + bvs(n) + '|' + await nums(n) + '|pr=' + refs + (n.type === 'INSTANCE' && n.isExposedInstance ? '|ex' : '');
  if (n.type === 'INSTANCE' && depth > 0) {
    const mc = await n.getMainComponentAsync();
    const ms = mc && mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : mc;
    acc.push(line + '|inst=' + (!mc ? 'null' : mc.remote ? 'remote:' + mc.key : 'local:' + ms.name + '>' + mc.name));
    if (PROBE && n.name === PROBE) probe.found = true, probe.visible = probe.visible || n.visible !== false;
    return;
  }
  if (PROBE && depth > 0 && n.name === PROBE) probe.found = true, probe.visible = probe.visible || n.visible !== false;
  acc.push(line);
  if ('children' in n) for (let i = 0; i < n.children.length; i++) await features(n.children[i], path + '.' + i, acc, depth + 1, probe);
}
const sets = [];
for (const id of SET_IDS) {
  const set = await figma.getNodeByIdAsync(id);
  if (!set || set.type !== 'COMPONENT_SET') { sets.push({ id, error: 'not a component set' }); continue; }
  const defs = set.componentPropertyDefinitions;
  const variants = [];
  for (const v of set.children.filter(c => c.type === 'COMPONENT')) {
    const acc = [], probe = { found: false, visible: false };
    await features(v, '0', acc, 0, probe);
    const row = [v.id, v.name, fnv(acc.join('\n')), acc.length];
    if (PROBE) row.push(probe.found ? (probe.visible ? 'visible' : 'hidden') : 'absent');
    variants.push(row);
  }
  sets.push({ id, name: set.name, key: set.key, propDefsHash: fnv(JSON.stringify(defs)), variantCount: variants.length, variants });
}
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const fingerprint = {
  collections: cols.map(c => [c.name, c.variableIds.length, c.modes.map(m => m.name).join('/')]),
  missingStyles: Object.values(styleNames).filter(x => x.startsWith('missing:')).length,
  variables: cols.reduce((a, c) => a + c.variableIds.length, 0),
  paintStyles: (await figma.getLocalPaintStylesAsync()).length,
  textStyles: (await figma.getLocalTextStylesAsync()).length,
  effectStyles: (await figma.getLocalEffectStylesAsync()).length,
  gridStyles: (await figma.getLocalGridStylesAsync()).length,
};
const r = { check: 'variants', version: 'E1', run: RUN, fileKey: figma.fileKey, readAt: new Date().toISOString(), probe: PROBE, fingerprint, sets };
const size = JSON.stringify(r).length;
return size > LIMIT ? { oversize: size } : r;
