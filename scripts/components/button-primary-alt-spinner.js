// WRITE use_figma script — Task C follow-up. Approved by Mike 2026-11-10 ("Yes, fix it").
// DUPLICATE ONLY. In the 7 `Buttons/Button` Primary_alt Loading variants, the spinner arc (nested `Line` stroke override) is
// rebound from `Colors/Foreground/fg-primary (900)` (white in Dark → 1.16:1 on lime) to
// `Colors/Text/text-primary_on-brandsecondary` (black in both modes; the role the label already uses). No other paint, size or
// structure changes; no token or variable is created or changed.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', FG_PRIMARY = 'VariableID:5353:380348', ON_SECONDARY = 'VariableID:17488:32591';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: duplicate only');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync('3287:427074');
if (!set || set.name !== 'Buttons/Button') throw new Error('precondition: set');
const vOn = await figma.variables.getVariableByIdAsync(ON_SECONDARY);
if (!vOn || vOn.name !== 'Colors/Text/text-primary_on-brandsecondary') throw new Error('precondition: variable');
const targets = set.children.filter(v => /Hierarchy=Primary_alt, State=Loading/.test(v.name));
if (targets.length !== 7) throw new Error('precondition: ' + targets.length + ' Primary_alt Loading variants');
const lines = targets.map(v => { const sp = v.findOne(n => n.type === 'INSTANCE' && n.findOne && n.findOne(x => x.name === 'Line') && n.findOne(x => x.name === 'Background')); return sp && sp.findOne(x => x.name === 'Line'); });
if (lines.some(l => !l || l.strokes.length !== 1 || !l.strokes[0].boundVariables || l.strokes[0].boundVariables.color.id !== FG_PRIMARY)) throw new Error('precondition: arc strokes');
const snapAll = () => JSON.stringify(set.children.map(v => v.findAll(() => true).filter(n => !lines.includes(n)).map(n => [n.name, n.visible, Math.round(n.width * 100), Math.round(n.height * 100),
  ...['fills', 'strokes'].map(p => Array.isArray(n[p]) ? n[p].map(f => (f.boundVariables && f.boundVariables.color && f.boundVariables.color.id) || f.type).join(',') : '')])));
const before = snapAll(); const widths = lines.map(l => [l.strokeWeight, l.width, l.height, JSON.stringify(l.arcData)]);
for (const l of lines) l.strokes = l.strokes.map(p => figma.variables.setBoundVariableForPaint(p, 'color', vOn));
if (lines.some((l, i) => l.strokes[0].boundVariables.color.id !== ON_SECONDARY || JSON.stringify([l.strokeWeight, l.width, l.height, JSON.stringify(l.arcData)]) !== JSON.stringify(widths[i]))) throw new Error('GUARD: arc');
if (snapAll() !== before) throw new Error('GUARD: something else changed');
return { check: 'primary-alt-spinner', rebound: targets.map(v => v.name) };
