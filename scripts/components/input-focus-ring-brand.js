// WRITE use_figma script — Input field focus ring: neutral -> brand. Approved by Mike 2026-11-09
// ("Use brand color for focus ring"). DUPLICATE only.
// Scope: Input field variants with Destructive=False and State=Focused (expected 8). On each, the own `Input`
// frame whose effect style is "Focus rings/focus-ring-shadow-secondary-xs" gets the existing local style
// "Focus rings/focus-ring-shadow-primary-xs" (same ring/gap/shadow structure, brand colour). Nothing else changes:
// border stays border-primary; error focus states and all other variants are untouched; no style is created or edited.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '17517:11024', EXPECTED = 8;
const FROM_NAME = 'Focus rings/focus-ring-shadow-secondary-xs', TO_NAME = 'Focus rings/focus-ring-shadow-primary-xs';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const styles = await figma.getLocalEffectStylesAsync();
const from = styles.find(s => s.name === FROM_NAME), to = styles.find(s => s.name === TO_NAME);
if (!from || !to) throw new Error('precondition: effect styles not found');
if (to.effects.length !== from.effects.length || to.effects.some((e, i) => e.type !== from.effects[i].type || e.spread !== from.effects[i].spread || e.radius !== from.effects[i].radius)) throw new Error('precondition: styles differ in structure');
const set = await figma.getNodeByIdAsync(SET_ID);
const targets = [];
for (const v of set.children) {
  if (!/Destructive=False/.test(v.name) || !/State=Focused/.test(v.name)) continue;
  const frames = v.findAll(n => n.type === 'FRAME' && n.name === 'Input' && !n.id.includes(';') && n.effectStyleId === from.id);
  if (frames.length !== 1) throw new Error('precondition: ' + v.name + ' has ' + frames.length + ' Input frames with ' + FROM_NAME);
  targets.push([v, frames[0]]);
}
if (targets.length !== EXPECTED) throw new Error('precondition: ' + targets.length + ' targets, expected ' + EXPECTED);
const results = [];
for (const [v, f] of targets) {
  await f.setEffectStyleIdAsync(to.id);
  results.push({ variant: v.name, id: v.id, layer: f.id, ok: f.effectStyleId === to.id, stroke: f.strokes[0] && f.strokes[0].boundVariables && f.strokes[0].boundVariables.color ? f.strokes[0].boundVariables.color.id : null });
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), from: FROM_NAME, to: TO_NAME, toEffects: to.effects.map(e => ({ type: e.type, spread: e.spread, radius: e.radius, bound: Object.keys(e.boundVariables || {}) })), count: results.length, allOk: results.every(r => r.ok), results };
