// WRITE use_figma script — Input field box border: border-secondary -> border-primary.
// Approved by Mike 2026-11-09 ("Set to border primary proceed"). DUPLICATE only.
// Scope: Input field (set 17517:11024) variants with Destructive=False and State != Disabled whose own `Input`
// frame stroke is bound to Colors/Border/border-secondary (expected 24). Disabled (8) and Destructive (21)
// variants, Payment method icon frames and everything else are left untouched.
// Preconditions are checked for ALL targets before the first write. Writes: one strokes assignment per target
// (same paint, color bound to border-primary via setBoundVariableForPaint). No other property changes.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '17517:11024', EXPECTED = 24;
const FROM = 'VariableID:5263:373123', TO = 'VariableID:5270:371435'; // border-secondary -> border-primary
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(SET_ID);
const to = await figma.variables.getVariableByIdAsync(TO), from = await figma.variables.getVariableByIdAsync(FROM);
if (!set || set.type !== 'COMPONENT_SET' || !to || !from || to.name !== 'Colors/Border/border-primary' || from.name !== 'Colors/Border/border-secondary') throw new Error('precondition: set or variables');
const targets = [];
for (const v of set.children) {
  if (!/Destructive=False/.test(v.name) || /State=Disabled/.test(v.name)) continue;
  const frames = v.findAll(n => n.type === 'FRAME' && n.name === 'Input' && Array.isArray(n.strokes) && n.strokes.length === 1 && n.strokes[0].boundVariables && n.strokes[0].boundVariables.color);
  if (frames.length !== 1) throw new Error('precondition: ' + v.name + ' has ' + frames.length + ' bound Input frames');
  const f = frames[0];
  if (f.id.includes(';')) throw new Error('precondition: Input frame inside an instance in ' + v.name);
  if (f.strokes[0].boundVariables.color.id !== FROM) throw new Error('precondition: ' + v.name + ' Input stroke is not border-secondary');
  targets.push([v, f]);
}
if (targets.length !== EXPECTED) throw new Error('precondition: ' + targets.length + ' targets, expected ' + EXPECTED);
const results = [];
for (const [v, f] of targets) {
  const before = f.strokes[0].boundVariables.color.id;
  const paints = f.strokes.slice();
  paints[0] = figma.variables.setBoundVariableForPaint(paints[0], 'color', to);
  f.strokes = paints;
  const after = f.strokes[0].boundVariables && f.strokes[0].boundVariables.color && f.strokes[0].boundVariables.color.id;
  results.push({ variant: v.name, id: v.id, layer: f.id, before, after, ok: after === TO, weight: f.strokeWeight });
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), count: results.length, allOk: results.every(r => r.ok), results };
