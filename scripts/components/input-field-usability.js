// WRITE use_figma script — Component task C2: Input field usability. Approved by Mike 2026-11-10 ("Apply C2").
// Plan: reports/C2-input-field/PLAN.md. DUPLICATE ONLY. No token change, no main-component visual change intended.
// Writes (one atomic call; preconditions first; in-call guard rolls everything back on any regression):
//  1. `Helper text` set (15 variants): add TEXT property `Text` (default "{Support text}") → bound to its text layer.
//  2. `Input field` set (53 variants): expose the nested `Helper text` instance (isExposedInstance = true).
//  3. `Input field`: add BOOLEAN `Show helper` (default true) → bound to that nested instance's visibility.
//  4. `Input field`: add BOOLEAN `Show optional` (default false) → bound to the 40 hidden `optional` tag frames' visibility.
// Guard: the 26 existing Input field instances (date pickers) must keep helper visibility and value/helper texts;
//        main variants must keep helper visible, `optional` hidden and helper texts ({Support text} / {Error}).
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', INPUT = '17517:11024', HELPER = '17515:929';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const helperSet = await figma.getNodeByIdAsync(HELPER), inputSet = await figma.getNodeByIdAsync(INPUT);
if (!helperSet || helperSet.type !== 'COMPONENT_SET' || helperSet.name !== 'Helper text' || helperSet.children.length !== 15) throw new Error('precondition: Helper text set');
if (!inputSet || inputSet.type !== 'COMPONENT_SET' || inputSet.name !== 'Input field' || inputSet.children.length !== 53) throw new Error('precondition: Input field set');
const hasProp = (set, name) => Object.keys(set.componentPropertyDefinitions).some(k => k.split('#')[0] === name);
if (hasProp(helperSet, 'Text') || hasProp(inputSet, 'Show helper') || hasProp(inputSet, 'Show optional')) throw new Error('precondition: properties already exist');
const ownDesc = (root, pred) => root.findAll(n => { if (!pred(n)) return false; let p = n.parent; while (p && p !== root) { if (p.type === 'INSTANCE') return false; p = p.parent; } return true; });
// helper text layers
const helperTexts = helperSet.children.map(v => { const t = v.findAll(n => n.type === 'TEXT'); if (t.length !== 1 || t[0].characters !== '{Support text}') throw new Error('precondition: helper text in ' + v.name); return t[0]; });
// input: nested helper instances + optional frames
const helpers = [], optionals = [];
for (const v of inputSet.children) {
  const h = v.children.filter(c => c.type === 'INSTANCE' && c.name === 'Helper text');
  if (h.length !== 1 || h[0].visible === false || h[0].isExposedInstance) throw new Error('precondition: helper instance in ' + v.name);
  const m = await h[0].getMainComponentAsync(); if (!m || m.parent !== helperSet) throw new Error('precondition: helper main in ' + v.name);
  helpers.push(h[0]);
  for (const o of ownDesc(v, n => n.name === 'optional' && n.type === 'FRAME')) {
    if (o.visible !== false || (o.componentPropertyReferences && o.componentPropertyReferences.visible)) throw new Error('precondition: optional in ' + v.name);
    optionals.push(o);
  }
}
if (optionals.length !== 40) throw new Error('precondition: ' + optionals.length + ' optional frames');
// existing instances (snapshot for the guard)
const ids = new Set(inputSet.children.map(c => c.id)); const insts = [];
for (const p of figma.root.children) { await p.loadAsync(); for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) insts.push(i); } }
if (insts.length !== 26) throw new Error('precondition: ' + insts.length + ' Input field instances');
const snap = i => { const h = i.findOne(n => n.name === 'Helper text'); const ht = h && h.findOne(n => n.type === 'TEXT'); return JSON.stringify([h ? h.visible : null, ht ? ht.characters : null, i.findAll(n => n.type === 'TEXT').map(t => t.characters)]); };
const before = insts.map(snap);
const mainSnap = () => inputSet.children.map(v => { const h = v.children.find(c => c.name === 'Helper text'); return [h.visible, h.findOne(n => n.type === 'TEXT').characters]; });
const mainBefore = JSON.stringify(mainSnap());
for (const t of helperTexts) for (const f of t.getRangeAllFontNames(0, t.characters.length)) if (f && f.family) await figma.loadFontAsync(f);
// ---- writes ----
const kText = helperSet.addComponentProperty('Text', 'TEXT', '{Support text}');
for (const t of helperTexts) t.componentPropertyReferences = { characters: kText };
const kHelper = inputSet.addComponentProperty('Show helper', 'BOOLEAN', true);
const kOptional = inputSet.addComponentProperty('Show optional', 'BOOLEAN', false);
for (const h of helpers) { h.isExposedInstance = true; h.componentPropertyReferences = Object.assign({}, h.componentPropertyReferences || {}, { visible: kHelper }); }
for (const o of optionals) o.componentPropertyReferences = { visible: kOptional };
// ---- guard ----
const after = insts.map(snap);
const changed = insts.filter((i, k) => before[k] !== after[k]).map(i => i.id + ' ' + before[insts.indexOf(i)] + ' -> ' + after[insts.indexOf(i)]);
if (changed.length) throw new Error('GUARD: existing instances changed, rolled back: ' + changed.slice(0, 3).join(' | '));
if (JSON.stringify(mainSnap()) !== mainBefore) throw new Error('GUARD: main helper visibility/text changed, rolled back');
if (optionals.some(o => o.visible !== false)) throw new Error('GUARD: optional became visible, rolled back');
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), helperTextProp: kText, showHelper: kHelper, showOptional: kOptional,
  helperTextLayers: helperTexts.length, exposedHelpers: helpers.filter(h => h.isExposedInstance).length, optionalBound: optionals.length, instancesChecked: insts.length,
  inputProps: Object.keys(inputSet.componentPropertyDefinitions), helperProps: Object.keys(helperSet.componentPropertyDefinitions) };
