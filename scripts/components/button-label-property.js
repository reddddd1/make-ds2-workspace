// WRITE use_figma script — P2-02: Buttons/Button `Label` TEXT property (default "Button").
// Approved by Mike 2026-11-09 (start P2-02 with default "Button"). DUPLICATE only.
// Writes: 1 addComponentProperty on the set + componentPropertyReferences on the label text layer of each of the
// 76 `Icon only=False` variants. Nothing else (no text edits, no structure, no other property, no publish).
// Preconditions for ALL targets are checked before the first write.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '3287:427074', EXPECTED = 76, DEFAULT = 'Button', OLD = '{CTA Label}';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || set.type !== 'COMPONENT_SET' || set.name !== 'Buttons/Button') throw new Error('precondition: set');
if (Object.keys(set.componentPropertyDefinitions).some(k => k.split('#')[0] === 'Label')) throw new Error('precondition: Label property already exists');
const own = (root) => root.findAll(n => n.type === 'TEXT').filter(t => { let a = t.parent; while (a && a !== root) { if (a.type === 'INSTANCE') return false; a = a.parent; } return true; });
const targets = [];
for (const v of set.children) {
  const t = own(v);
  if (/Icon only=True/.test(v.name)) { if (t.length) throw new Error('precondition: icon-only variant has text ' + v.name); continue; }
  if (t.length !== 1) throw new Error('precondition: ' + v.name + ' has ' + t.length + ' own text layers');
  if (t[0].characters !== OLD) throw new Error('precondition: ' + v.name + ' label is ' + t[0].characters);
  if (t[0].componentPropertyReferences && t[0].componentPropertyReferences.characters) throw new Error('precondition: already bound ' + v.name);
  targets.push([v, t[0]]);
}
if (targets.length !== EXPECTED) throw new Error('precondition: ' + targets.length + ' targets, expected ' + EXPECTED);
// fonts must be loaded before the text content can follow the property default
const fonts = new Map();
for (const [, t] of targets) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.set(f.family + '|' + f.style, f);
for (const f of fonts.values()) await figma.loadFontAsync(f);
// ---- writes ----
const key = set.addComponentProperty('Label', 'TEXT', DEFAULT);
const results = [];
for (const [v, t] of targets) {
  t.componentPropertyReferences = { characters: key };
  results.push({ variant: v.name, layer: t.id, chars: t.characters, ok: t.componentPropertyReferences.characters === key && t.characters === DEFAULT });
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), propertyKey: key, fonts: [...fonts.keys()], count: results.length, allOk: results.every(r => r.ok), bad: results.filter(r => !r.ok) };
