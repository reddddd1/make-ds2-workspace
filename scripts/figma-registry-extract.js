// READ-ONLY use_figma body for the P1-04 component registry.
// Set PAGES to a list of page node IDs (grouped so each return stays under LIMIT bytes).
// Pages are loaded with page.loadAsync() (no page switching). If a return is oversize, the
// script returns per-item sizes instead, and the group is split.
// Mutation review: only getNodeByIdAsync, loadAsync, findAllWithCriteria, getMainComponentAsync
// and property reads. No create*/set*/remove/append/insert/detach/import calls, no assignments to nodes.
const PAGES = ['__PAGE__'], LIMIT = 48000;
const nameCache = new Map();
async function ref(id) {
  if (!id) return null;
  if (nameCache.has(id)) return nameCache.get(id);
  const n = await figma.getNodeByIdAsync(id);
  let r = null;
  if (n) { const s = n.parent && n.parent.type === 'COMPONENT_SET' ? n.parent : n; r = { name: s.name, variant: s === n ? null : n.name, key: n.key || null, remote: !!n.remote }; }
  nameCache.set(id, r);
  return r;
}
async function walk(n, acc, depth, variantName) {
  if (n.type === 'INSTANCE' && depth > 0) {
    acc.inst++;
    if (n.isExposedInstance) acc.exposed.add(n.name);
    const mc = await n.getMainComponentAsync();
    if (!mc) { acc.missingMain++; return; }
    const s = mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : mc;
    let d = acc.deps.get(s.key);
    if (!d) { d = { name: s.name, key: s.key, isSet: s.type === 'COMPONENT_SET', remote: !!mc.remote, count: 0, layers: new Set() }; acc.deps.set(s.key, d); }
    d.count++; d.layers.add(n.name);
    return;
  }
  const raw = (kind) => { acc[kind]++; if (acc.samples[kind].length < 3) acc.samples[kind].push(variantName + ' > ' + n.name); };
  if ('fills' in n && Array.isArray(n.fills)) for (const f of n.fills) if (f.type === 'SOLID' && f.visible !== false) { if (f.boundVariables && f.boundVariables.color) acc.boundFill++; else if (!n.fillStyleId) raw('rawFill'); }
  if ('strokes' in n && Array.isArray(n.strokes)) for (const f of n.strokes) if (f.type === 'SOLID' && f.visible !== false) { if (f.boundVariables && f.boundVariables.color) acc.boundStroke++; else if (!n.strokeStyleId) raw('rawStroke'); }
  if (n.type === 'TEXT') { acc.text++; if (!n.textStyleId) raw('rawText'); }
  if (/slot/i.test(n.name)) acc.slotNamed++;
  if ('children' in n) for (const c of n.children) await walk(c, acc, depth + 1, variantName);
}
async function audit(owner) {
  const isSet = owner.type === 'COMPONENT_SET';
  const variants = isSet ? owner.children.filter(c => c.type === 'COMPONENT') : [owner];
  const defs = owner.componentPropertyDefinitions;
  const props = [];
  for (const [k, v] of Object.entries(defs)) {
    const p = { name: k.split('#')[0], id: k, type: v.type, default: v.defaultValue };
    if (v.type === 'VARIANT') p.options = v.variantOptions;
    if (v.type === 'INSTANCE_SWAP') {
      p.defaultRef = await ref(v.defaultValue);
      const pv = v.preferredValues || [];
      p.preferredCount = pv.length;
      p.preferred = pv.slice(0, 25).map(x => ({ type: x.type, key: x.key }));
    }
    props.push(p);
  }
  const axes = props.filter(p => p.type === 'VARIANT').map(p => p.name);
  const acc = { inst: 0, exposed: new Set(), missingMain: 0, deps: new Map(), boundFill: 0, boundStroke: 0, rawFill: 0, rawStroke: 0, text: 0, rawText: 0, slotNamed: 0, samples: { rawFill: [], rawStroke: [], rawText: [] } };
  let noAutoLayout = 0;
  for (const v of variants) { await walk(v, acc, 0, v.name); if (v.layoutMode === 'NONE') noAutoLayout++; }
  return {
    kind: isSet ? 'set' : 'component', name: owner.name, id: owner.id, key: owner.key,
    hasDescription: !!owner.description, variantCount: isSet ? variants.length : null,
    axes, properties: props,
    nestedInstances: acc.inst, missingMainComponent: acc.missingMain,
    exposedInstances: [...acc.exposed],
    dependencies: [...acc.deps.values()].map(d => ({ name: d.name, key: d.key, isSet: d.isSet, remote: d.remote, count: d.count, layers: [...d.layers].slice(0, 6) })),
    bindings: { boundFill: acc.boundFill, boundStroke: acc.boundStroke, rawFill: acc.rawFill, rawStroke: acc.rawStroke, textLayers: acc.text, rawText: acc.rawText, samples: acc.samples },
    slotNamedLayers: acc.slotNamed, variantsWithoutAutoLayout: noAutoLayout,
  };
}
const pagesOut = [];
for (const pid of PAGES) {
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  const lone = page.findAllWithCriteria({ types: ['COMPONENT'] }).filter(c => !c.parent || c.parent.type !== 'COMPONENT_SET');
  const items = [];
  for (const o of [...sets, ...lone]) { const it = await audit(o); it.page = page.name.trim(); it.pageId = page.id; items.push(it); }
  pagesOut.push({ page: page.name.trim(), pageId: page.id, sets: sets.length, standalone: lone.length, items });
}
const r = { fileKey: figma.fileKey, readAt: new Date().toISOString(), pages: pagesOut };
const size = JSON.stringify(r).length;
if (size > LIMIT) return { oversize: size, perItem: pagesOut.flatMap(p => p.items.map(i => [p.page, i.name, JSON.stringify(i).length])) };
return r;
