// READ-ONLY use_figma collector — R-SLOT-01 (slot migration safety) for one component set (default: Modal).
// Works before migration (legacy INSTANCE_SWAP "Drawer content" + local `Slot` placeholder) and after
// (native SLOT properties, if present). Set SET_KEY (component-set key), SET_ID (node ID when run in the
// library file, enables getInstancesAsync), RUN.
// Per instance: linkage, instance-swap and slot property values, `limitViolations` (if the API exposes it),
// and a hash of the slot region's structure (what a migration must preserve).
// Mutation review: only getNodeByIdAsync, loadAsync, findAllWithCriteria, getInstancesAsync,
// getMainComponentAsync and property reads. Never calls createSlot or any setter.
// E3 (P2-00): also finds native SLOT nodes inside each instance (after migration) and records per slot its
// name, child count, children signature hash and SlotNode.limitViolations. The legacy region is found by
// layer name (Slot / Drawer content / Body). SET_KEY differs per file (keys change in a copy, P1-03):
// original Modal dac269c2…, duplicate Modal 3e0e0b6d… (see README); in the library file prefer SET_ID.
const SET_KEY = '__SET_KEY__', SET_ID = null, RUN = '__RUN__', LIMIT = 48000;
// skipInvisibleInstanceChildren is a plugin-runtime option, not stored in the file: with the default (true) hidden
// layers inside instances are omitted from reads, which makes instance and main trees incomparable.
figma.skipInvisibleInstanceChildren = false;
function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, '0'); }
function sig(n, path, acc) { acc.push(path + '|' + n.type + '|' + n.name + '|' + (n.visible === false ? 'h' : 'v')); if (n.type !== 'INSTANCE' && 'children' in n) n.children.forEach((c, i) => sig(c, path + '.' + i, acc)); }
let instances = [], method;
const set = SET_ID ? await figma.getNodeByIdAsync(SET_ID) : null;
if (set && set.type === 'COMPONENT_SET') {
  method = 'getInstancesAsync';
  for (const v of set.children.filter(c => c.type === 'COMPONENT')) instances.push(...await v.getInstancesAsync());
} else {
  method = 'page scan';
  for (const p of figma.root.children) {
    await p.loadAsync();
    for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) {
      const mc = await i.getMainComponentAsync();
      const s = mc && mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : null;
      if (s && s.key === SET_KEY) instances.push(i);
    }
  }
}
const rows = [];
for (const i of instances) {
  const mc = await i.getMainComponentAsync();
  let pg = i; while (pg && pg.type !== 'PAGE') pg = pg.parent;
  const props = {};
  for (const [k, v] of Object.entries(i.componentProperties || {})) {
    if (v.type === 'INSTANCE_SWAP') { const n = await figma.getNodeByIdAsync(v.value); props[k.split('#')[0]] = 'swap:' + (n ? n.name + '/' + (n.key || '') : v.value); }
    else if (v.type === 'SLOT') props[k.split('#')[0]] = 'slot:' + JSON.stringify(v.value);
  }
  const region = i.findOne(n => n.type !== 'SLOT' && /^(Slot|Drawer content|Body)$/i.test(n.name)) || null;
  const slots = [];
  for (const sl of i.findAll(n => n.type === 'SLOT')) {
    const sa = []; (sl.children || []).forEach((c, k) => sig(c, String(k), sa));
    slots.push({ name: sl.name, children: (sl.children || []).length, hash: fnv(sa.join('\n')), nodes: sa.length,
      limitViolations: 'limitViolations' in sl ? sl.limitViolations : 'n/a (API not present)' });
  }
  const acc = []; if (region) sig(region, '0', acc);
  rows.push({ id: i.id, page: pg ? pg.name : null, linked: !!mc, remote: mc ? mc.remote : null, mainName: mc ? mc.name : null,
    props, slots, slotRegion: region ? region.name + ' (' + region.type + ')' : null, slotHash: fnv(acc.join('\n')), slotNodes: acc.length,
    limitViolations: 'limitViolations' in i ? i.limitViolations : 'n/a (API not present)' });
}
const r = { check: 'slots', version: 'E3', run: RUN, fileKey: figma.fileKey, readAt: new Date().toISOString(), setKey: SET_KEY, method, instanceCount: rows.length, instances: rows };
const size = JSON.stringify(r).length;
return size > LIMIT ? { oversize: size, count: rows.length } : r;
