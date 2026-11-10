// WRITE use_figma script — Task A follow-up: show the existing (hidden) `color/border/primary` stroke on the 4 Placeholder
// cells of `_Mega input field base` (sm, md, lg, xs) so empty OTP cells have a visible boundary (WCAG 1.4.11).
// Approved by Mike 2026-11-10 ("Yes, show borders"); this also changes the look of the 4-digit variants (accepted).
// DUPLICATE ONLY. Writes: strokes[0].visible = true on exactly those 4 variants. No token, variable, size or binding change.
// Guard: the other 20 cells are unchanged; the 4 targets keep their stroke binding, weight and size.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', BORDER_PRIMARY = 'VariableID:5270:371435';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: duplicate only');
const base = await figma.getNodeByIdAsync('1106:66560');
if (!base || base.name !== '_Mega input field base' || base.children.length !== 24) throw new Error('precondition: base set');
const targets = base.children.filter(v => /^State=Placeholder, /.test(v.name));
if (targets.length !== 4) throw new Error('precondition: 4 Placeholder cells');
for (const t of targets) {
  const s = t.strokes;
  if (s.length !== 1 || s[0].visible !== false || !s[0].boundVariables || !s[0].boundVariables.color || s[0].boundVariables.color.id !== BORDER_PRIMARY) throw new Error('precondition: stroke of ' + t.name + ' ' + JSON.stringify(s));
}
const snap = v => JSON.stringify([v.name, v.width, v.height, v.strokeWeight, v.strokes, v.fills, v.findAll(() => true).map(n => [n.name, n.visible, n.width, n.height, 'fills' in n ? n.fills : null, 'strokes' in n ? n.strokes : null])]);
const others = base.children.filter(v => !targets.includes(v)); const ob = others.map(snap);
const tb = targets.map(t => [t.width, t.height, t.strokeWeight, JSON.stringify(t.children.map(c => [c.name, c.visible, c.fills]))]);
for (const t of targets) t.strokes = t.strokes.map(p => Object.assign({}, p, { visible: true }));
if (others.some((v, i) => snap(v) !== ob[i])) throw new Error('GUARD: another cell changed');
targets.forEach((t, i) => {
  const s = t.strokes[0];
  if (s.visible !== true || !s.boundVariables || s.boundVariables.color.id !== BORDER_PRIMARY) throw new Error('GUARD: stroke of ' + t.name);
  if (JSON.stringify([t.width, t.height, t.strokeWeight, JSON.stringify(t.children.map(c => [c.name, c.visible, c.fills]))]) !== JSON.stringify(tb[i])) throw new Error('GUARD: ' + t.name + ' changed beyond the stroke');
});
return { check: 'otp-placeholder-border', changed: targets.map(t => [t.id, t.name, t.strokeWeight, t.strokes[0].visible]) };
