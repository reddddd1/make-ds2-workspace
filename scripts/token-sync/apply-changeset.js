// WRITE use_figma script — P2-01 token sync, change set approved by Mike 2026-11-09 ("Approve everything").
// Applies exactly the approved rows of reports/P2-01-sync/change-set.md to the DUPLICATE only.
// Safety:
//  - Refuses any file other than the duplicate (and always the original xJoAz66aekAToyhBmfGNt0).
//  - Verifies every precondition (collections, modes, current alias of each row, R1 absent) BEFORE writing anything;
//    on any mismatch it throws and nothing is written.
//  - Writes: 1 createVariable + setValueForMode + scopes on that new variable (R1), 11 setValueForMode alias updates.
//    No delete, rename, retype, binding, style, component or publish call.
//  - Returns before/after for every row so the result can be verified and rolled back.
// Rows are generated from reports/P2-01-sync/dryrun/dryrun.json (not hand-typed); 'NEW' = the R1 variable.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', ORIGINAL = 'xJoAz66aekAToyhBmfGNt0';
const CREATE = { name: 'Colors/Gray (light mode)/450', hex: '#8a8e97', collection: '_Primitives', sibling: 'VariableID:5248:377701' };
const ROWS = [ // [variableId, mode, expected current alias target, new alias target]
  ['VariableID:5353:380427', 'Dark mode', 'VariableID:5248:377714', 'VariableID:5248:377716'],
  ['VariableID:5353:380427', 'Light mode', 'VariableID:5248:377714', 'VariableID:5248:377716'],
  ['VariableID:5270:371435', 'Dark mode', 'VariableID:6671:87761', 'VariableID:6671:87760'],
  ['VariableID:5270:371435', 'Light mode', 'VariableID:5248:377700', 'NEW'],
  ['VariableID:6137:268549', 'Dark mode', 'VariableID:5248:377715', 'VariableID:5248:377713'],
  ['VariableID:17499:16144', 'Dark mode', 'VariableID:5248:377714', 'VariableID:5248:377712'],
  ['VariableID:17499:16144', 'Light mode', 'VariableID:5248:377714', 'VariableID:5248:377716'],
  ['VariableID:5263:373125', 'Light mode', 'VariableID:5248:377726', 'VariableID:5248:377727'],
  ['VariableID:6139:331930', 'Dark mode', 'VariableID:6671:87754', 'VariableID:5248:377686'],
  ['VariableID:5270:371446', 'Light mode', 'VariableID:5248:377752', 'VariableID:5248:377754'],
  ['VariableID:5270:371444', 'Light mode', 'VariableID:5248:377738', 'VariableID:5248:377740'],
];
if (figma.fileKey === ORIGINAL || figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
// ---- preconditions (read-only) ----
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find(c => c.name === CREATE.collection);
const cm = cols.find(c => c.name === '1. Color modes');
if (!prim || !cm || prim.modes.length !== 1) throw new Error('precondition: collections');
const modeId = (name) => { const m = cm.modes.find(x => x.name === name); if (!m) throw new Error('precondition: mode ' + name); return m.modeId; };
for (const id of prim.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); if (v.name === CREATE.name) throw new Error('precondition: ' + CREATE.name + ' already exists (' + v.id + ')'); }
const sibling = await figma.variables.getVariableByIdAsync(CREATE.sibling);
if (!sibling || sibling.name !== 'Colors/Gray (light mode)/400') throw new Error('precondition: sibling');
const checked = [];
for (const [vid, mode, expected, target] of ROWS) {
  const v = await figma.variables.getVariableByIdAsync(vid);
  if (!v || v.variableCollectionId !== cm.id || v.resolvedType !== 'COLOR') throw new Error('precondition: variable ' + vid);
  const cur = v.valuesByMode[modeId(mode)];
  if (!cur || cur.type !== 'VARIABLE_ALIAS' || cur.id !== expected) throw new Error('precondition: ' + v.name + ' ' + mode + ' is ' + JSON.stringify(cur) + ', expected alias ' + expected);
  if (target !== 'NEW') { const t = await figma.variables.getVariableByIdAsync(target); if (!t || t.resolvedType !== 'COLOR' || t.variableCollectionId !== prim.id) throw new Error('precondition: target ' + target); }
  checked.push([v, mode]);
}
// ---- writes ----
const h = (i) => parseInt(CREATE.hex.slice(i, i + 2), 16) / 255;
const nv = figma.variables.createVariable(CREATE.name, prim, 'COLOR');
nv.setValueForMode(prim.modes[0].modeId, { r: h(1), g: h(3), b: h(5), a: 1 });
nv.scopes = sibling.scopes.slice();
const results = [];
for (let i = 0; i < ROWS.length; i++) {
  const [vid, mode, expected, target] = ROWS[i]; const [v] = checked[i];
  const tid = target === 'NEW' ? nv.id : target;
  v.setValueForMode(modeId(mode), figma.variables.createVariableAlias(await figma.variables.getVariableByIdAsync(tid)));
  const after = v.valuesByMode[modeId(mode)];
  results.push({ variable: v.name, mode, before: expected, after: after.id, ok: after.type === 'VARIABLE_ALIAS' && after.id === tid });
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(),
  created: { id: nv.id, name: nv.name, value: CREATE.hex, scopes: nv.scopes, siblingScopes: sibling.scopes, hiddenFromPublishing: nv.hiddenFromPublishing, siblingHidden: sibling.hiddenFromPublishing },
  results, allOk: results.every(r => r.ok) };
