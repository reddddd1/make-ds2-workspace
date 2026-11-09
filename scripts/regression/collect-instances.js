// READ-ONLY use_figma collector — consumer screens: linkage, R-FIGMA-01 (instance vs main layer tree),
// R-PENPOT-01 (bindings + values per mode, re-read in a fresh call), icon source.
// Run in a CONSUMER file (e.g. pilot scratch uMQLqPDG5I4rZAAHlhpInJ). Set PAGE_ID, RUN, optional
// FRAME_IDS (default: every top-level frame on the page), ICON_SET_KEYS (allowed icon component-set keys:
// MAKER Icon library "Icon wrapper"), DETAIL (instance IDs whose binding lines are returned in full).
// No mode is switched (that would be a write): every binding is resolved for Light mode, Dark mode and the
// node's effective mode (variable.resolveForConsumer) in this call.
// Mutation review: only getNodeByIdAsync, loadAsync, findAllWithCriteria, getMainComponentAsync,
// variables getters, resolveForConsumer and property reads. Instances inside component definitions are skipped.
// E2 (P2-00): per instance, textHash = every text layer's characters (by path, nested instances included) and
// overrideHash = every nested instance's main component (remote key, or local set > variant name), so a lost
// text override or a swapped/reset nested component fails the check. propsHash records the instance's own
// component property values (informational: adding a property changes it by design).
const PAGE_ID = '__PAGE_ID__', RUN = '__RUN__', FRAME_IDS = null, DETAIL = [], LIMIT = 48000;
const ICON_SET_KEYS = ['b8295cee7375c7b7216cb412047f771ce86fbf9d'];
// skipInvisibleInstanceChildren is a plugin-runtime option, not stored in the file: with the default (true) hidden
// layers inside instances are omitted from reads, which makes instance and main trees incomparable.
figma.skipInvisibleInstanceChildren = false;
function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, '0'); }
const hex = (c) => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('') + (c.a !== undefined && c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '');
const fmt = (x) => x && typeof x === 'object' && 'r' in x ? hex(x) : typeof x === 'number' ? Math.round(x * 100) / 100 : String(x);
const vCache = new Map(), cCache = new Map();
async function variable(id) { if (!vCache.has(id)) vCache.set(id, await figma.variables.getVariableByIdAsync(id)); return vCache.get(id); }
async function collection(id) { if (!cCache.has(id)) cCache.set(id, await figma.variables.getVariableCollectionByIdAsync(id)); return cCache.get(id); }
async function valueIn(v, modeName, depth) {
  if (!v || depth > 8) return '?';
  const col = await collection(v.variableCollectionId);
  let modeId = col ? (col.modes.find(m => m.name === modeName) || null) : null;
  modeId = modeId ? modeId.modeId : Object.keys(v.valuesByMode)[0];
  const x = v.valuesByMode[modeId];
  if (x && x.type === 'VARIABLE_ALIAS') return valueIn(await variable(x.id), modeName, depth + 1);
  return fmt(x);
}
function aliases(n) {
  const out = []; const bv = n.boundVariables || {};
  for (const k of Object.keys(bv).sort()) { const v = bv[k]; (Array.isArray(v) ? v : [v]).forEach((a, i) => a && a.id && out.push([k + (Array.isArray(v) ? i : ''), a.id])); }
  for (const prop of ['fills', 'strokes']) if (prop in n && Array.isArray(n[prop])) n[prop].forEach((p, i) => { if (p.boundVariables && p.boundVariables.color) out.push([prop + i + '.color', p.boundVariables.color.id]); });
  if ('effects' in n && Array.isArray(n.effects)) n.effects.forEach((e, i) => { const b = e.boundVariables || {}; for (const k of Object.keys(b).sort()) out.push(['effect' + i + '.' + k, b[k].id]); });
  return out;
}
async function bindingLines(n, path, lines) {
  for (const [field, id] of aliases(n)) {
    const v = await variable(id);
    let eff = '?'; try { eff = fmt(v.resolveForConsumer(n).value); } catch (e) { eff = 'err'; }
    lines.push(`${path}|${field}|${v ? v.name : 'unresolved:' + id}|L=${await valueIn(v, 'Light mode', 0)}|D=${await valueIn(v, 'Dark mode', 0)}|E=${eff}`);
  }
  if ('children' in n) for (let i = 0; i < n.children.length; i++) await bindingLines(n.children[i], path + '.' + i, lines);
}
function structure(n, path, acc, depth) {
  acc.push(path + '|' + (depth === 0 ? 'ROOT' : n.type));
  if (n.type === 'INSTANCE' && depth > 0) return;
  if ('children' in n) n.children.forEach((c, i) => structure(c, path + '.' + i, acc, depth + 1));
}
async function overrides(inst) {
  const texts = [], comps = [];
  async function walk(n, path) {
    if (n.type === 'TEXT') texts.push(path + '|' + fnv(n.characters));
    if (n.type === 'INSTANCE' && path !== '0') { const m = await n.getMainComponentAsync(); const ms = m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m; comps.push(path + '|' + (!m ? 'null' : m.remote ? 'remote:' + m.key : 'local:' + ms.name + '>' + m.name)); }
    if ('children' in n) for (let i = 0; i < n.children.length; i++) await walk(n.children[i], path + '.' + i);
  }
  await walk(inst, '0');
  const props = Object.keys(inst.componentProperties || {}).sort().map(k => k.split('#')[0] + '=' + String(inst.componentProperties[k].value));
  return { texts: texts.length, textHash: fnv(texts.join('\n')), nested: comps.length, overrideHash: fnv(comps.join('\n')), propsHash: fnv(props.join('\n')) };
}
function diff(a, b) { const m = new Map(); a.forEach(x => m.set(x, (m.get(x) || 0) + 1)); const out = []; b.forEach(x => { if (m.get(x)) m.set(x, m.get(x) - 1); else out.push(x); }); return out; }
async function linkState(mc) { if (!mc) return 'detached-or-missing'; if (mc.remote) return 'linked-remote'; return mc.parent ? 'linked-local' : 'orphan'; }
async function icons(inst, stats) {
  for (const n of inst.findAllWithCriteria({ types: ['INSTANCE'] })) {
    const mc = await n.getMainComponentAsync();
    const set = mc && mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : null;
    if (set && ICON_SET_KEYS.includes(set.key)) {
      stats.wrappers++; if (mc.remote) stats.wrappersLib++;
      for (const g of n.findAllWithCriteria({ types: ['INSTANCE'] })) { const gm = await g.getMainComponentAsync(); stats.glyphs++; if (gm && gm.remote) stats.glyphsLib++; else stats.badGlyphs.push(g.name); }
    }
  }
}
const page = await figma.getNodeByIdAsync(PAGE_ID);
await page.loadAsync();
const frames = FRAME_IDS ? await Promise.all(FRAME_IDS.map(id => figma.getNodeByIdAsync(id))) : page.children.filter(f => f.type === 'FRAME' || f.type === 'SECTION');
const screens = [];
for (const f of frames) {
  const own = [];
  // frame's own (non-instance) layers' bindings
  async function ownLines(n, path) { if (n.type === 'INSTANCE') return; for (const [field, id] of aliases(n)) { const v = await variable(id); let eff = '?'; try { eff = fmt(v.resolveForConsumer(n).value); } catch (e) { eff = 'err'; } own.push(`${path}|${field}|${v ? v.name : id}|E=${eff}`); } if ('children' in n) for (let i = 0; i < n.children.length; i++) await ownLines(n.children[i], path + '.' + i); }
  await ownLines(f, '0');
  const tops = f.findAllWithCriteria({ types: ['INSTANCE'] }).filter(i => { let a = i.parent; while (a && a !== f) { if (a.type === 'INSTANCE' || a.type === 'COMPONENT' || a.type === 'COMPONENT_SET') return false; a = a.parent; } return true; });
  const rows = [];
  for (const inst of tops) {
    const mc = await inst.getMainComponentAsync();
    const s1 = [], s2 = [];
    structure(inst, '0', s1, 0); if (mc) structure(mc, '0', s2, 0);
    const missing = mc ? diff(s1, s2) : [], extra = mc ? diff(s2, s1) : [];
    const lines = []; await bindingLines(inst, '0', lines);
    const ic = { wrappers: 0, wrappersLib: 0, glyphs: 0, glyphsLib: 0, badGlyphs: [] }; await icons(inst, ic);
    const set = mc && mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : mc;
    const row = { id: inst.id, name: inst.name, main: mc ? (set.name + (set !== mc ? ' › ' + mc.name : '')) : null, mainKey: mc ? mc.key : null,
      link: await linkState(mc), missing: missing.length, extra: extra.length, missingEx: missing.slice(0, 3), extraEx: extra.slice(0, 3),
      bindings: lines.length, bindHash: fnv(lines.join('\n')), ...(await overrides(inst)), icons: [ic.wrappers, ic.wrappersLib, ic.glyphs, ic.glyphsLib], badIcons: ic.badGlyphs.slice(0, 5) };
    if (DETAIL.includes(inst.id)) row.lines = lines;
    rows.push(row);
  }
  const modes = [];
  for (const [colId, modeId] of Object.entries(f.explicitVariableModes || {})) { const c = await collection(colId); const m = c && c.modes.find(x => x.modeId === modeId); modes.push((c ? c.name : colId) + '=' + (m ? m.name : modeId)); }
  screens.push({ id: f.id, name: f.name, explicitModes: modes, ownBindings: own.length, ownHash: fnv(own.join('\n')), instances: rows });
}
const r = { check: 'instances', version: 'E2', run: RUN, fileKey: figma.fileKey, page: page.name, readAt: new Date().toISOString(), iconSetKeys: ICON_SET_KEYS, screens };
const size = JSON.stringify(r).length;
return size > LIMIT ? { oversize: size, perScreen: screens.map(s => [s.name, JSON.stringify(s).length]) } : r;
