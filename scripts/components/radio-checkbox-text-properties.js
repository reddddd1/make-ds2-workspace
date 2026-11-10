// WRITE use_figma script — Component task C4: Radio / Checkbox text properties. Approved by Mike 2026-11-10 ("Start C4").
// DUPLICATE ONLY. No token change; no visual change intended (defaults = current text).
// Writes (one atomic call; preconditions first; in-call guard):
//  1. TEXT property `Label` (default "{Text main}") → `Text and supporting text/Text` in the 32 `Text=True` variants.
//  2. TEXT property `Description` (default "{Text secondary}") → `Text and supporting text/Supporting text` in the same 32
//     (its existing `Supporting text` visibility link is kept).
// Note: a VARIANT property is already called `Text` (True/False), hence the names `Label` / `Description`.
// Guard: all 84 variants' texts/visibility/sizes and all 27 existing instances' texts unchanged, else the call throws (rollback).
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '1097:63652';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || set.type !== 'COMPONENT_SET' || set.name !== 'Radio / Checkbox' || set.children.length !== 84) throw new Error('precondition: set');
const defs = set.componentPropertyDefinitions;
if (Object.keys(defs).some(k => ['Label', 'Description'].includes(k.split('#')[0]))) throw new Error('precondition: properties already exist');
const supKey = Object.keys(defs).find(k => k.startsWith('Supporting text#'));
const labels = [], descs = [];
for (const v of set.children.filter(c => /Text=True/.test(c.name))) {
  const f = v.findOne(n => n.type === 'FRAME' && n.name === 'Text and supporting text');
  const t = f && f.children.find(c => c.type === 'TEXT' && c.name === 'Text');
  const d = f && f.children.find(c => c.type === 'TEXT' && c.name === 'Supporting text');
  if (!t || t.characters !== '{Text main}' || (t.componentPropertyReferences && t.componentPropertyReferences.characters)) throw new Error('precondition: label in ' + v.name);
  if (!d || d.characters !== '{Text secondary}' || !d.componentPropertyReferences || d.componentPropertyReferences.visible !== supKey) throw new Error('precondition: description in ' + v.name);
  labels.push(t); descs.push(d);
}
if (labels.length !== 32) throw new Error('precondition: ' + labels.length + ' Text=True variants');
const ids = new Set(set.children.map(c => c.id)); const insts = [];
for (const p of figma.root.children) { await p.loadAsync(); for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) insts.push(i); } }
if (insts.length !== 27) throw new Error('precondition: ' + insts.length + ' instances');
const snapInst = () => JSON.stringify(insts.map(i => i.findAll(n => n.type === 'TEXT').map(t => [t.characters, t.visible])));
const snapMain = () => JSON.stringify(set.children.map(v => [v.findAll(n => n.type === 'TEXT').map(t => [t.characters, t.visible]), v.width, v.height]));
const bi = snapInst(), bm = snapMain();
for (const t of [...labels, ...descs]) for (const f of t.getRangeAllFontNames(0, t.characters.length)) if (f && f.family) await figma.loadFontAsync(f);
// ---- writes ----
const kLabel = set.addComponentProperty('Label', 'TEXT', '{Text main}');
const kDesc = set.addComponentProperty('Description', 'TEXT', '{Text secondary}');
for (const t of labels) t.componentPropertyReferences = Object.assign({}, t.componentPropertyReferences || {}, { characters: kLabel });
for (const d of descs) d.componentPropertyReferences = Object.assign({}, d.componentPropertyReferences || {}, { characters: kDesc });
// ---- guard ----
if (snapInst() !== bi) throw new Error('GUARD: existing instance text changed, rolled back');
if (snapMain() !== bm) throw new Error('GUARD: main component text/visibility/size changed, rolled back');
if (descs.some(d => d.componentPropertyReferences.visible !== supKey)) throw new Error('GUARD: Supporting text link lost, rolled back');
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), label: kLabel, description: kDesc, labels: labels.length, descriptions: descs.length, instancesChecked: insts.length,
  props: Object.keys(set.componentPropertyDefinitions) };
