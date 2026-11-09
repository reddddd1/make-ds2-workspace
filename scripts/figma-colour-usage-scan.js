// READ-ONLY use_figma body for P1-07: which colour variables each component uses.
// Counts variable bindings on solid fills, solid strokes and effect colours of each component's own
// layers (nested instances not descended), directly or via a paint style that is bound to a variable.
// Set PAGES to page IDs. Returns, per component, { variableName: [direct, viaStyle] } for COLOR variables.
// Mutation review: only getNodeByIdAsync, loadAsync, findAllWithCriteria, getVariableByIdAsync,
// getStyleByIdAsync and property reads. No writes of any kind.
const PAGES = ['__PAGE__'], LIMIT = 48000;
const vcache = new Map(), scache = new Map();
async function vname(id) {
  if (!vcache.has(id)) { const v = await figma.variables.getVariableByIdAsync(id); vcache.set(id, v ? v.name + (v.remote ? ' (remote)' : '') : 'unresolved:' + id); }
  return vcache.get(id);
}
async function styleVar(id) {
  if (!id || typeof id !== 'string') return null;
  if (!scache.has(id)) {
    const s = await figma.getStyleByIdAsync(id); let n = null;
    if (s && s.paints && s.paints[0] && s.paints[0].boundVariables && s.paints[0].boundVariables.color) n = await vname(s.paints[0].boundVariables.color.id);
    scache.set(id, n);
  }
  return scache.get(id);
}
function bump(acc, name, i) { if (!acc[name]) acc[name] = [0, 0]; acc[name][i]++; }
async function scan(n, acc) {
  for (const [prop, styleProp] of [['fills', 'fillStyleId'], ['strokes', 'strokeStyleId']]) {
    if (!(prop in n) || !Array.isArray(n[prop])) continue;
    for (const p of n[prop]) {
      if (p.type !== 'SOLID' || p.visible === false) continue;
      if (p.boundVariables && p.boundVariables.color) bump(acc, await vname(p.boundVariables.color.id), 0);
      else { const sv = await styleVar(n[styleProp]); if (sv) bump(acc, sv, 1); }
    }
  }
  if ('effects' in n && Array.isArray(n.effects)) for (const e of n.effects) if (e.visible !== false && e.boundVariables && e.boundVariables.color) bump(acc, await vname(e.boundVariables.color.id), 0);
}
async function walk(n, acc, depth) {
  if (n.type === 'INSTANCE' && depth > 0) return;
  await scan(n, acc);
  if ('children' in n) for (const c of n.children) await walk(c, acc, depth + 1);
}
const items = [];
for (const pid of PAGES) {
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  const lone = page.findAllWithCriteria({ types: ['COMPONENT'] }).filter(c => !c.parent || c.parent.type !== 'COMPONENT_SET');
  for (const o of [...sets, ...lone]) {
    const acc = {};
    const variants = o.type === 'COMPONENT_SET' ? o.children.filter(c => c.type === 'COMPONENT') : [o];
    for (const v of variants) await walk(v, acc, 0);
    items.push({ name: o.name, id: o.id, page: page.name.trim(), colours: acc });
  }
}
const r = { fileKey: figma.fileKey, readAt: new Date().toISOString(), scan: 'P1-07', items };
const size = JSON.stringify(r).length;
return size > LIMIT ? { oversize: size, perItem: items.map(i => [i.name, JSON.stringify(i).length]) } : r;
