// WRITE use_figma script — Component task C3: Alert content properties. Approved by Mike 2026-11-10 ("Start C3").
// DUPLICATE ONLY. No token change, no main-component visual change intended (defaults = current text; bound gap = same 12 px).
// Writes (one atomic call; preconditions first; in-call guard):
//  1. TEXT property `Title` (default "{Title}") → the title text layer in all 4 Alert variants.
//  2. TEXT property `Description` (default = current supporting text) → the supporting text layer in all 4 variants
//     (its existing `Supporting text` visibility link is kept).
//  3. `Content/wrapper` gap (12 px, unbound) → bound to `3. Spacing › spacing-lg` (12 px), as its sibling frames already are.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', ALERT = '1130:81134', SPACING_LG = 'VariableID:6298:45389';
const DESC = '{Text Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum dolor.}';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(ALERT);
if (!set || set.type !== 'COMPONENT_SET' || set.name !== 'Alert' || set.children.length !== 4) throw new Error('precondition: Alert set');
if (Object.keys(set.componentPropertyDefinitions).some(k => ['Title', 'Description'].includes(k.split('#')[0]))) throw new Error('precondition: properties already exist');
const lg = await figma.variables.getVariableByIdAsync(SPACING_LG);
if (!lg || lg.name !== 'spacing-lg') throw new Error('precondition: spacing-lg');
const supKey = Object.keys(set.componentPropertyDefinitions).find(k => k.startsWith('Supporting text#'));
const titles = [], descs = [], wrappers = [];
for (const v of set.children) {
  const tsf = v.findOne(n => n.name === 'Text and supporting text' && n.type === 'FRAME');
  const t = tsf && tsf.children.find(c => c.type === 'TEXT' && c.name === 'Text');
  const d = tsf && tsf.children.find(c => c.type === 'TEXT' && c.name === 'Supporting text');
  const w = tsf && tsf.parent;
  if (!t || t.characters !== '{Title}' || (t.componentPropertyReferences && t.componentPropertyReferences.characters)) throw new Error('precondition: title in ' + v.name);
  if (!d || d.characters !== DESC || !d.componentPropertyReferences || d.componentPropertyReferences.visible !== supKey) throw new Error('precondition: description in ' + v.name);
  if (!w || w.name !== 'wrapper' || w.itemSpacing !== 12 || (w.boundVariables && w.boundVariables.itemSpacing)) throw new Error('precondition: wrapper gap in ' + v.name);
  titles.push(t); descs.push(d); wrappers.push(w);
}
for (const t of [...titles, ...descs]) for (const f of t.getRangeAllFontNames(0, t.characters.length)) if (f && f.family) await figma.loadFontAsync(f);
const snap = () => JSON.stringify(set.children.map(v => v.findAll(n => n.type === 'TEXT').map(t => [t.characters, t.visible])).concat([wrappers.map(w => w.itemSpacing), set.children.map(v => [v.width, v.height])]));
const before = snap();
// ---- writes ----
const kTitle = set.addComponentProperty('Title', 'TEXT', '{Title}');
const kDesc = set.addComponentProperty('Description', 'TEXT', DESC);
for (const t of titles) t.componentPropertyReferences = Object.assign({}, t.componentPropertyReferences || {}, { characters: kTitle });
for (const d of descs) d.componentPropertyReferences = Object.assign({}, d.componentPropertyReferences || {}, { characters: kDesc });
for (const w of wrappers) w.setBoundVariable('itemSpacing', lg);
// ---- guard ----
if (snap() !== before) throw new Error('GUARD: visible text, visibility, gap or size changed, rolled back');
if (descs.some(d => d.componentPropertyReferences.visible !== supKey)) throw new Error('GUARD: Supporting text visibility link lost, rolled back');
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), title: kTitle, description: kDesc, titles: titles.length, descriptions: descs.length, gapsBound: wrappers.length,
  props: Object.keys(set.componentPropertyDefinitions) };
