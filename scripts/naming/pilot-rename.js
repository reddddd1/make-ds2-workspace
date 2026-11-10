// use_figma script — token naming pilot: rename 11 variables BY ID on the duplicate. NOT YET APPROVED TO RUN WITH APPLY = true.
// Mapping = reports/token-naming-pilot.md §2 (final review, read 2026-11-09T19:59:53Z). Name-only: values, aliases, scopes,
// codeSyntax, hiddenFromPublishing, collections and modes are never touched.
// APPLY = false (default): read-only preflight. Returns the planned operations and every precondition result; writes nothing.
// APPLY = true: only after Mike approves the exact mapping. Each call is atomic in Figma (a thrown error rolls back the call).
// Rollback: run with ROLLBACK = true (swaps old/new; same preconditions in reverse).
const APPLY = false, ROLLBACK = false;
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy';
const MAP = [
  ['VariableID:5248:377715', 'Colors/Brand/600', 'color/brand/600'],
  ['VariableID:23468:2', 'Colors/Gray (light mode)/450', 'color/gray/450'],
  ['VariableID:5270:371419', 'Colors/Background/bg-brand-primary', 'color/bg/brand-primary'],
  ['VariableID:5353:380427', 'Colors/Background/bg-brand-primary_hover', 'color/bg/brand-primary-hover'],
  ['VariableID:6137:268549', 'Colors/Text/text-brand-primary', 'color/text/brand-primary'],
  ['VariableID:5263:373125', 'Colors/Text/text-error-primary', 'color/text/error-primary'],
  ['VariableID:5270:371435', 'Colors/Border/border-primary', 'color/border/primary'],
  ['VariableID:7371:212918', 'Colors/Effects/Focus rings/focus-ring-primary', 'color/focus-ring/primary'],
  ['VariableID:5253:372203', 'Spacing/3 (12px)', 'spacing/3'],
  ['VariableID:7407:110365', 'Font size/text-md', 'font/size/base'],
  ['VariableID:7405:102287', 'Font weight/semibold', 'font/weight/semibold'],
];
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
const all = await figma.variables.getLocalVariablesAsync();
const ops = [], problems = [];
for (const [id, oldName, newName] of MAP) {
  const from = ROLLBACK ? newName : oldName, to = ROLLBACK ? oldName : newName;
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v) { problems.push(id + ': not found'); continue; }
  if (v.remote) problems.push(id + ': remote variable');
  if (v.name !== from) problems.push(`${id}: name is "${v.name}", expected "${from}"`);
  const clash = all.filter(o => o.variableCollectionId === v.variableCollectionId && o.id !== id && o.name === to);
  if (clash.length) problems.push(`${id}: "${to}" already exists in the collection (${clash.map(c => c.id).join(', ')})`);
  ops.push({ id, from, to, before: { type: v.resolvedType, scopes: v.scopes, hidden: v.hiddenFromPublishing, codeSyntax: v.codeSyntax, modes: Object.keys(v.valuesByMode).length } });
}
if (ops.length !== 11) problems.push('expected 11 operations, got ' + ops.length);
if (problems.length) throw new Error('PRECONDITIONS FAILED (nothing written): ' + problems.join(' | '));
if (!APPLY) return { mode: 'preflight (no writes)', rollback: ROLLBACK, fileKey: figma.fileKey, ops };
for (const op of ops) (await figma.variables.getVariableByIdAsync(op.id)).name = op.to;
const after = [];
for (const op of ops) { const v = await figma.variables.getVariableByIdAsync(op.id); after.push({ id: op.id, name: v.name, ok: v.name === op.to && v.resolvedType === op.before.type && JSON.stringify(v.scopes) === JSON.stringify(op.before.scopes) && v.hiddenFromPublishing === op.before.hidden }); }
if (!after.every(a => a.ok)) throw new Error('VERIFY FAILED, call rolled back: ' + JSON.stringify(after.filter(a => !a.ok)));
return { mode: 'APPLIED', rollback: ROLLBACK, fileKey: figma.fileKey, writtenAt: new Date().toISOString(), after };
