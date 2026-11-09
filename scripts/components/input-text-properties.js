// WRITE use_figma script — P2-05 part 2: Input field TEXT properties on the 13 normalised login variants.
// Approved by Mike 2026-11-09 ("Recomended" = option a). DUPLICATE only.
//   `Label` (TEXT, default "Label")            -> the `Label row › Label` text in all 13 login variants
//   `Text`  (TEXT, default "Placeholder text") -> the value/placeholder text in the 7 Type=Default login variants
// Password value text (masked dots) is left unbound. Writes: 2 addComponentProperty + 20 componentPropertyReferences.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '17517:11024';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(SET_ID);
const names = Object.keys(set.componentPropertyDefinitions).map(k => k.split('#')[0]);
if (names.includes('Label') || names.includes('Text')) throw new Error('precondition: properties already exist');
const login = set.children.filter(v => /Size=lg, Type=(Default|Password),/.test(v.name));
if (login.length !== 13) throw new Error('precondition: 13 login variants');
const labels = [], values = [];
for (const v of login) {
  const row = v.children[0];
  if (!row || row.name !== 'Label row' || row.children.length !== 1 || row.children[0].type !== 'TEXT') throw new Error('precondition: label row ' + v.name);
  labels.push(row.children[0]);
  if (/Type=Default/.test(v.name)) {
    const box = v.children[1];
    const t = box && box.name === 'Input' ? box.findOne(n => n.type === 'TEXT' && n.name === 'Text' && n.parent.name === 'wrapper') : null;
    if (!t) throw new Error('precondition: value text ' + v.name);
    values.push(t);
  }
}
if (labels.length !== 13 || values.length !== 7) throw new Error('precondition: ' + labels.length + ' labels, ' + values.length + ' values');
for (const t of [...labels, ...values]) for (const f of t.getRangeAllFontNames(0, t.characters.length)) if (f && typeof f === 'object' && f.family) await figma.loadFontAsync(f);
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' }); await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const kLabel = set.addComponentProperty('Label', 'TEXT', 'Label');
const kText = set.addComponentProperty('Text', 'TEXT', 'Placeholder text');
for (const t of labels) t.componentPropertyReferences = { characters: kLabel };
for (const t of values) t.componentPropertyReferences = { characters: kText };
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), kLabel, kText, labels: labels.map(t => t.characters), values: values.map(t => t.characters),
  ok: labels.every(t => t.componentPropertyReferences.characters === kLabel) && values.every(t => t.componentPropertyReferences.characters === kText) };
