// WRITE use_figma script — P2-05: normalise the 13 login Input field variants (lg Default / lg Password) to the
// text-field spec anatomy (design-tokens specs/components/text-field.md): Label row / Input box / Helper text.
// Approved by Mike 2026-11-09 ("Normalise"). DUPLICATE only. Set ONLY to a list of variant ids to limit the run.
// Per variant (all checks for all targets run before the first write):
//   - Label row (new frame, H, gap spacing-xs) at index 0 with the label text: the existing floating label if the
//     variant has one, else a new text ("Label" / "Password"); style Text sm/Medium, fill text-secondary (700).
//   - Input box (the frame named `Input` with the bound stroke) moved to index 1 of the variant (outer wrapper removed).
//     Its children rebuilt to one shape: Content (H, gap/padding spacing-sm, fill) › wrapper (H, gap spacing-sm) ›
//     [value text, optional tag] + Icon wrapper. Box paddings, radius, fill, stroke, effects and fixed height are kept.
//   - Helper text untouched. Empty legacy frames removed (only after checking they hold no text or instance).
// No colour/token changes beyond the label's own style and fill.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '17517:11024';
const ONLY = null; // e.g. ['17517:10998']
const V_SM = 'VariableID:6425:327765', V_XS = 'VariableID:6298:45386', V_LABEL_FILL = 'VariableID:5340:371764';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(SET_ID);
const labelStyle = (await figma.getLocalTextStylesAsync()).find(s => s.name === 'Text sm/Medium');
const vSm = await figma.variables.getVariableByIdAsync(V_SM), vXs = await figma.variables.getVariableByIdAsync(V_XS), vLab = await figma.variables.getVariableByIdAsync(V_LABEL_FILL);
if (!set || !labelStyle || !vSm || !vXs || !vLab) throw new Error('precondition: set/style/variables');
let targets = set.children.filter(v => /Size=lg, Type=(Default|Password),/.test(v.name));
if (ONLY) targets = targets.filter(v => ONLY.includes(v.id));
if (!ONLY && targets.length !== 13) throw new Error('precondition: ' + targets.length + ' login variants');
const own = (root, pred) => root.findAll(pred).filter(n => { let a = n.parent; while (a && a !== root) { if (a.type === 'INSTANCE') return false; a = a.parent; } return true; });
const plans = [];
for (const v of targets) {
  if (v.children.some(c => c.name === 'Label row')) throw new Error('precondition: already normalised ' + v.name);
  const boxes = own(v, n => n.type === 'FRAME' && n.name === 'Input' && Array.isArray(n.strokes) && n.strokes.length === 1 && n.strokes[0].boundVariables && n.strokes[0].boundVariables.color);
  if (boxes.length !== 1) throw new Error('precondition: box count ' + v.name);
  const B = boxes[0];
  const O = own(B, n => n.type === 'FRAME' && n.name === 'optional')[0] || null;
  const texts = own(B, n => n.type === 'TEXT' && !(O && (n.parent === O)));
  if (texts.length < 1 || texts.length > 2) throw new Error('precondition: text count ' + texts.length + ' in ' + v.name);
  const L = texts.length === 2 ? texts[0] : null, V = texts.length === 2 ? texts[1] : texts[0];
  const icons = own(B, n => n.type === 'INSTANCE' && n.name === 'Icon wrapper');
  if (icons.length !== 1) throw new Error('precondition: icon count ' + v.name);
  const I = icons[0];
  const helper = v.children.find(c => c.type === 'INSTANCE' && c.name === 'Helper text');
  if (!helper) throw new Error('precondition: helper ' + v.name);
  // everything left behind must be empty frames
  const keep = new Set([V, L, O, I].filter(Boolean));
  const inKeep = (n) => { let a = n; while (a && a !== B) { if (keep.has(a)) return true; a = a.parent; } return false; };
  const leftovers = B.findAll(n => !inKeep(n) && (n.type === 'TEXT' || n.type === 'INSTANCE'));
  if (leftovers.length) throw new Error('precondition: leftover content in ' + v.name + ': ' + leftovers.map(n => n.name));
  const outer = B.parent === v ? null : B.parent;
  if (outer && (outer.parent !== v || outer.children.length !== 1)) throw new Error('precondition: outer wrapper shape ' + v.name);
  const type = /Type=Password/.test(v.name) ? 'Password' : 'Default';
  plans.push({ v, B, O, L, V, I, outer, labelText: L ? L.characters : (type === 'Password' ? 'Password' : 'Label') });
}
// fonts
const fonts = new Map([[labelStyle.fontName.family + '|' + labelStyle.fontName.style, labelStyle.fontName], ['Inter|Regular', { family: 'Inter', style: 'Regular' }]]);
for (const p of plans) for (const t of [p.L, p.V].filter(Boolean)) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.set(f.family + '|' + f.style, f);
for (const f of fonts.values()) await figma.loadFontAsync(f);
const bindPaint = (node, variable) => { node.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable)]; };
function frame(name, gapVar) { const f = figma.createFrame(); f.name = name; f.fills = []; f.clipsContent = false; f.layoutMode = 'HORIZONTAL'; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.counterAxisAlignItems = 'CENTER'; f.setBoundVariable('itemSpacing', gapVar); return f; }
// ---- writes ----
const results = [];
for (const p of plans) {
  const { v, B, O, L, V, I, outer } = p;
  const oldChildren = B.children.slice();
  // FIX (2026-11-09 run): move the existing label out of the box BEFORE the old wrappers are removed,
  // otherwise it is deleted with them (the failed call was rolled back by Figma; nothing was lost).
  const row = frame('Label row', vXs);
  v.insertChild(0, row); row.layoutSizingHorizontal = 'HUG';
  if (L) row.appendChild(L);
  // box contents
  const content = frame('Content', vSm); content.setBoundVariable('paddingTop', vSm); content.setBoundVariable('paddingBottom', vSm);
  const wrap = frame('wrapper', vSm);
  B.appendChild(content); content.layoutSizingHorizontal = 'FILL'; content.layoutSizingVertical = 'FILL';
  content.appendChild(wrap); wrap.layoutSizingHorizontal = 'FILL';
  wrap.appendChild(V); if (O) wrap.appendChild(O);
  content.appendChild(I);
  // only remove legacy frames still directly in the box (moved nodes now live elsewhere)
  for (const c of oldChildren) if (c !== content && !c.removed && c.parent === B) c.remove();
  B.setBoundVariable('itemSpacing', vSm);
  // label
  let label = L;
  if (!label) { label = figma.createText(); label.characters = p.labelText; row.appendChild(label); }
  label.name = 'Label';
  await label.setTextStyleIdAsync(labelStyle.id);
  bindPaint(label, vLab);
  label.layoutSizingHorizontal = 'HUG'; label.layoutSizingVertical = 'HUG';
  // box to variant level
  if (outer) { v.insertChild(1, B); if (!outer.removed && outer.children.length === 0) outer.remove(); }
  B.layoutSizingHorizontal = 'FILL';
  results.push({ variant: v.name, label: label.characters, value: V.characters, height: Math.round(v.height), order: v.children.map(c => c.name) });
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), count: results.length, results };
