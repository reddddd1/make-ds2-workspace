// WRITE use_figma script — D-G1 (Option A) step 1: create the two spacing variables. Approved by Mike 2026-11-10
// ("MAKE DS2 — D-G1 Approved: Spacing Coverage. I approve Option A for D-G1."; alias names spacing-2_5 / spacing-3_5).
// DUPLICATE ONLY. Source: token-sync dry-run reports/D-G1-spacing/dryrun-before (create = 2, conflicts = 0).
// Writes (one atomic call; all preconditions checked before the first write):
//  1. _Primitives  `spacing/2_5` = 10, `spacing/3_5` = 14 (name per convention §8, like the renamed `spacing/3`);
//     scopes + hiddenFromPublishing copied from sibling `Spacing/2 (8px)`.
//  2. 3. Spacing   `spacing-2_5` → alias spacing/2_5, `spacing-3_5` → alias spacing/3_5;
//     scopes + hiddenFromPublishing copied from sibling `spacing-md`.
// No delete, rename, value change of existing variables, binding, style, component or publish call.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', ORIGINAL = 'xJoAz66aekAToyhBmfGNt0';
const PRIM_SIBLING = 'VariableID:5253:372202', SEM_SIBLING = 'VariableID:6298:45387';
const NEW = [['spacing/2_5', 10, 'spacing-2_5'], ['spacing/3_5', 14, 'spacing-3_5']];
if (figma.fileKey === ORIGINAL || figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
// ---- preconditions ----
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find(c => c.name === '_Primitives'), sem = cols.find(c => c.name === '3. Spacing');
if (!prim || !sem || prim.modes.length !== 1 || sem.modes.length !== 1) throw new Error('precondition: collections');
const ps = await figma.variables.getVariableByIdAsync(PRIM_SIBLING), ss = await figma.variables.getVariableByIdAsync(SEM_SIBLING);
if (!ps || ps.name !== 'Spacing/2 (8px)' || ps.variableCollectionId !== prim.id) throw new Error('precondition: primitive sibling');
if (!ss || ss.name !== 'spacing-md' || ss.variableCollectionId !== sem.id) throw new Error('precondition: semantic sibling');
const names = async c => { const s = new Set(); for (const id of c.variableIds) s.add((await figma.variables.getVariableByIdAsync(id)).name.toLowerCase()); return s; };
const pn = await names(prim), sn = await names(sem);
for (const [p, , s] of NEW) { if (pn.has(p.toLowerCase())) throw new Error('precondition: ' + p + ' exists'); if (sn.has(s)) throw new Error('precondition: ' + s + ' exists'); }
const before = { prim: prim.variableIds.length, sem: sem.variableIds.length };
if (before.sem !== 17) throw new Error('precondition: 3. Spacing has ' + before.sem);
// ---- writes ----
const created = [];
for (const [pName, px, sName] of NEW) {
  const p = figma.variables.createVariable(pName, prim, 'FLOAT');
  p.setValueForMode(prim.modes[0].modeId, px);
  p.scopes = ps.scopes.slice(); p.hiddenFromPublishing = ps.hiddenFromPublishing;
  const s = figma.variables.createVariable(sName, sem, 'FLOAT');
  s.setValueForMode(sem.modes[0].modeId, figma.variables.createVariableAlias(p));
  s.scopes = ss.scopes.slice(); s.hiddenFromPublishing = ss.hiddenFromPublishing;
  created.push({ primitive: { id: p.id, name: p.name, value: p.valuesByMode[prim.modes[0].modeId], scopes: p.scopes, hidden: p.hiddenFromPublishing },
    semantic: { id: s.id, name: s.name, alias: s.valuesByMode[sem.modes[0].modeId], scopes: s.scopes, hidden: s.hiddenFromPublishing } });
}
// ---- guard ----
const after = { prim: prim.variableIds.length, sem: sem.variableIds.length };
if (after.prim !== before.prim + 2 || after.sem !== before.sem + 2) throw new Error('GUARD: counts ' + JSON.stringify([before, after]));
for (const c of created) if (c.semantic.alias.type !== 'VARIABLE_ALIAS' || c.semantic.alias.id !== c.primitive.id) throw new Error('GUARD: alias');
return { check: 'dg1-create', fileKey: figma.fileKey, writtenAt: new Date().toISOString(), before, after, created,
  siblings: { prim: { scopes: ps.scopes, hidden: ps.hiddenFromPublishing, codeSyntax: ps.codeSyntax }, sem: { scopes: ss.scopes, hidden: ss.hiddenFromPublishing, codeSyntax: ss.codeSyntax } } };
