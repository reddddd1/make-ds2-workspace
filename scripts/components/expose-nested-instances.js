// WRITE use_figma script — P2-04 Option B: expose nested instances so their properties (icon swap, Label…) are
// editable from the parent component. Approved by Mike 2026-11-09 ("Added. Go on" after enabling the MAKER Icon
// library). DUPLICATE only.
// Scope (own nested instances of each variant, not inside another nested instance):
//   Buttons/Button  — every `Icon wrapper` (MAKER Icon library)           expected 194
//   Input field     — every `Icon wrapper`                                 expected 79
//   Alert           — `Featured icon` (4) + the two `Buttons/Button` (8)  expected 12
// Not exposed: Alert close `Icon wrapper`, loading icon, Helper text, Tag, Payment method icon, Radio / Checkbox.
// Only write: isExposedInstance = true. Preconditions (counts, none already exposed) checked before writing.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy';
const PLAN = [
  { set: '3287:427074', name: 'Buttons/Button', pick: (i, m) => i.name === 'Icon wrapper' && m && m.remote, expected: 194 },
  { set: '17517:11024', name: 'Input field', pick: (i, m) => i.name === 'Icon wrapper' && m && m.remote, expected: 79 },
  { set: '1130:81134', name: 'Alert', pick: (i, m, ms) => (i.name === 'Featured icon' && m && m.remote) || (ms && ms.name === 'Buttons/Button'), expected: 12 },
];
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const todo = [];
for (const p of PLAN) {
  const set = await figma.getNodeByIdAsync(p.set);
  if (!set || set.type !== 'COMPONENT_SET' || set.name !== p.name) throw new Error('precondition: set ' + p.name);
  let n = 0;
  for (const v of set.children) {
    const insts = v.findAll(x => x.type === 'INSTANCE').filter(i => { let a = i.parent; while (a && a !== v) { if (a.type === 'INSTANCE') return false; a = a.parent; } return true; });
    for (const i of insts) {
      const m = await i.getMainComponentAsync(); const ms = m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m;
      if (!p.pick(i, m, ms)) continue;
      if (i.isExposedInstance) throw new Error('precondition: already exposed ' + i.id);
      todo.push([p.name, v.name, i]); n++;
    }
  }
  if (n !== p.expected) throw new Error('precondition: ' + p.name + ' ' + n + ' targets, expected ' + p.expected);
}
for (const [, , i] of todo) i.isExposedInstance = true;
const tally = {}; for (const [s, , i] of todo) tally[s] = (tally[s] || 0) + (i.isExposedInstance ? 1 : 0);
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), exposed: tally, total: todo.length };
