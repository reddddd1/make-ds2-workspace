// WRITE use_figma script — temporary Dark-mode regression frame (naming follow-up, Decision 3, approved by Mike 2026-11-09).
// DUPLICATE ONLY. Writes, and nothing else:
//   1. creates page PAGE_NAME (refuses if a page with that name already exists),
//   2. creates ONE frame FRAME_NAME on it, sets its explicit variable mode for `1. Color modes` to Dark mode
//      and binds its fill to Colors/Background/bg-primary,
//   3. places instances (createInstance) of existing local main components inside that frame.
// Never edits a main component, never detaches, never publishes. Removal: dark-mode-frame-remove.js (frame only).
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy';
const PAGE_NAME = '🧪 Regression scratch (temporary)';
const FRAME_NAME = 'TEMP — Dark-mode regression test (naming follow-up 2026-11-09) — safe to delete';
const PICK = {
  '3287:427074': ['Size=md, Hierarchy=Primary, State=Default, Icon only=False', 'Size=md, Hierarchy=Primary, State=Hover, Icon only=False',
                  'Size=md, Hierarchy=Primary, State=Pressed, Icon only=False', 'Size=md, Hierarchy=Primary, State=Focused, Icon only=False',
                  'Size=md, Hierarchy=Primary, State=Disabled, Icon only=False', 'Size=md, Hierarchy=Primary_alt, State=Default, Icon only=False',
                  'Size=md, Hierarchy=Secondary, State=Default, Icon only=False', 'Size=md, Hierarchy=Link brand, State=Default, Icon only=False'],
  '17517:11024': ['Size=lg, Type=Default, Destructive=False, State=Placeholder', 'Size=lg, Type=Default, Destructive=False, State=Filled',
                  'Size=lg, Type=Default, Destructive=False, State=Focused', 'Size=lg, Type=Default, Destructive=False, State=Disabled',
                  'Size=lg, Type=Default, Destructive=True, State=Placeholder', 'Size=lg, Type=Password, Destructive=False, State=Filled'],
  '1130:81134': ['Color=Default', 'Color=Brand', 'Color=Error', 'Color=Success'],
  '4057:415205': ['Type=Default slotted'],
};
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
if (figma.root.children.some(p => p.name === PAGE_NAME)) throw new Error('REFUSED: page already exists');
const col = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === '1. Color modes');
const dark = col && col.modes.find(m => m.name === 'Dark mode');
const bgPrimary = await figma.variables.getVariableByIdAsync('VariableID:5269:371407');
if (!dark || !bgPrimary || bgPrimary.name !== 'Colors/Background/bg-primary') throw new Error('precondition: Dark mode / bg-primary');
// resolve every requested variant before writing anything
const rows = [];
for (const [setId, names] of Object.entries(PICK)) {
  const set = await figma.getNodeByIdAsync(setId);
  if (!set || set.type !== 'COMPONENT_SET') throw new Error('precondition: set ' + setId);
  const comps = names.map(n => set.children.find(c => c.type === 'COMPONENT' && c.name === n));
  if (comps.some(c => !c)) throw new Error('precondition: variant missing in ' + set.name + ': ' + names.filter((n, i) => !comps[i]).join(' | '));
  rows.push({ set, comps });
}
const page = figma.createPage(); page.name = PAGE_NAME;
const frame = figma.createFrame(); page.appendChild(frame);   // created on the current page, moved at once (same atomic call; the user's view is not switched)
frame.name = FRAME_NAME;
frame.layoutMode = 'VERTICAL'; frame.primaryAxisSizingMode = 'AUTO'; frame.counterAxisSizingMode = 'AUTO';
frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = 40; frame.itemSpacing = 40;
frame.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', bgPrimary)];
frame.setExplicitVariableModeForCollection(col, dark.modeId);
const created = [];
for (const { set, comps } of rows) {
  const row = figma.createFrame(); frame.appendChild(row);
  row.name = set.name; row.fills = []; row.layoutMode = 'HORIZONTAL'; row.layoutWrap = 'WRAP';
  row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO'; row.resize(1400, 10); row.itemSpacing = 24; row.counterAxisSpacing = 24;
  for (const c of comps) { const inst = c.createInstance(); row.appendChild(inst); created.push({ id: inst.id, main: c.id, set: set.name, variant: c.name }); }
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), pageId: page.id, frameId: frame.id, frameName: frame.name,
  explicitModes: frame.explicitVariableModes, instances: created.length, created };
