// WRITE use_figma script — Task B (Input field validation). Approved by Mike 2026-11-10 ("Proceed"; decisions: 'Required' tag,
// property-driven password reveal, Focused + error for all types and sizes). DUPLICATE ONLY. No token or variable change.
// One atomic call; preconditions first; in-call guard (throw → rollback).
//  1. Password, Destructive=True, Filled: the hidden md "Icon wrapper" (info) becomes the visible lg wrapper with the eye icon,
//     like the non-error Filled state (the user can reveal the password while fixing an error).
//  2. TEXT property `Password` (default "●●●●●●●●") bound to the password text in Password Filled, Filled (error), Focused,
//     Disabled. Typing plain text = password shown; the exposed eye can be swapped to `eye-off` (MAKER Icon library).
//  3. BOOLEAN `Show required` (default false) + a "Required" tag (copy of the `_Input title` tag) in every `Label row`.
//  4. State=Focused + Destructive=True for all 8 Size/Type pairs that lack it: clones of each Destructive Filled variant with
//     the field frame stroke → `border-error` and effect style `Focus rings/focus-ring-error-shadow-xs`.
// Guard: every existing variant except Password error/Filled keeps its texts, visibility and sizes; Password error/Filled
// changes only the eye; the 26 instances outside the set keep their texts and sizes.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', ORIGINAL = 'xJoAz66aekAToyhBmfGNt0';
const SET_ID = '17517:11024', OTP_FIELD_ID = '1106:66757';
const BORDER_ERROR = 'VariableID:5353:385108', BORDER_ERROR_SUBTLE = 'VariableID:5263:373126';
const RING_ERROR_STYLE = 'S:5a02afc49d3953c6a7daaac92718ed2dabc0fba6,';
const WRAPPER_LG_KEY = 'cbd0f73ffee42eea334bd1de1395fde36b1b55aa', EYE_ID = '21539:1367', DOTS = '●●●●●●●●';
if (figma.fileKey === ORIGINAL || figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
// ---------- preconditions ----------
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || set.type !== 'COMPONENT_SET' || set.name !== 'Input field' || set.children.length !== 53) throw new Error('precondition: set');
const defs = set.componentPropertyDefinitions;
if (Object.keys(defs).some(k => /^(Show required|Password)#/.test(k))) throw new Error('precondition: properties exist');
const byName = n => set.children.find(v => v.name === n);
const pairs = [['sm', 'Default'], ['sm', 'Search'], ['sm', 'Search + Tags'], ['lg', 'Default'], ['lg', 'Password'], ['lg', 'Leading icon'], ['lg', 'Leading drowdown'], ['lg', 'Payment']];
for (const [s, t] of pairs) {
  if (byName(`Size=${s}, Type=${t}, Destructive=True, State=Focused`)) throw new Error('precondition: focused error exists for ' + s + ' ' + t);
  if (!byName(`Size=${s}, Type=${t}, Destructive=True, State=Filled`)) throw new Error('precondition: no error/Filled for ' + s + ' ' + t);
}
const errFilledPw = byName('Size=lg, Type=Password, Destructive=True, State=Filled');
const pwContent = errFilledPw.findOne(n => n.type === 'FRAME' && n.name === 'Content');
const pwWrap = pwContent.children.find(n => n.type === 'INSTANCE' && n.name === 'Icon wrapper');
if (!pwWrap || pwWrap.visible !== false) throw new Error('precondition: hidden wrapper in Password error/Filled');
const wrapperLg = await figma.importComponentByKeyAsync(WRAPPER_LG_KEY);
const eye = await figma.getNodeByIdAsync(EYE_ID);
if (!wrapperLg || !eye || eye.name !== 'eye') throw new Error('precondition: lg wrapper / eye');
const iconKey = Object.keys(pwWrap.componentProperties).find(k => k.startsWith('Icon#'));
const pwTexts = ['Size=lg, Type=Password, Destructive=False, State=Filled', 'Size=lg, Type=Password, Destructive=True, State=Filled', 'Size=lg, Type=Password, Destructive=False, State=Focused', 'Size=lg, Type=Password, Destructive=False, State=Disabled']
  .map(n => byName(n).findOne(x => x.type === 'TEXT' && x.parent && x.parent.name === 'wrapper'));
if (pwTexts.some(t => !t || t.characters !== DOTS || (t.componentPropertyReferences && t.componentPropertyReferences.characters))) throw new Error('precondition: password texts');
const labelRows = set.children.map(v => v.findOne(n => n.type === 'FRAME' && n.name === 'Label row')).filter(Boolean);
if (labelRows.length !== 13) throw new Error('precondition: ' + labelRows.length + ' label rows');
const otp = await figma.getNodeByIdAsync(OTP_FIELD_ID);
const titleMain = await otp.children[0].findOne(n => n.name === '_Input title').getMainComponentAsync();
const tagSrc = titleMain.findOne(n => n.type === 'FRAME' && n.findOne && !!n.findOne(x => x.type === 'TEXT' && x.characters === 'Required') && n.children.length === 1);
if (!tagSrc || tagSrc.name !== 'optional') throw new Error('precondition: Required tag source');
const ringStyle = await figma.getStyleByIdAsync(RING_ERROR_STYLE); if (!ringStyle || ringStyle.name !== 'Focus rings/focus-ring-error-shadow-xs') throw new Error('precondition: ring style');
const vBorderError = await figma.variables.getVariableByIdAsync(BORDER_ERROR); if (!vBorderError) throw new Error('precondition: border-error');
// instances outside the set
const ids = new Set(set.children.map(c => c.id)); const insts = [];
for (const p of figma.root.children) { await p.loadAsync(); for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) insts.push(i); } }
if (insts.length !== 26) throw new Error('precondition: ' + insts.length + ' instances');
const snapInst = () => JSON.stringify(insts.map(i => [Math.round(i.width * 100), Math.round(i.height * 100), i.findAll(n => n.type === 'TEXT').map(t => [t.characters, t.visible])]));
const inTag = n => { for (let p = n; p; p = p.parent) { if (p.name === 'Required tag') return true; if (p.type === 'COMPONENT') return false; } return false; };
const snapV = v => JSON.stringify([v.width, v.height, v.findAll(n => !inTag(n)).map(n => [n.type, n.name, n.visible, Math.round(n.width * 100), Math.round(n.height * 100), n.type === 'TEXT' ? n.characters : ''])]);
const existing = set.children.slice(); const before = existing.map(snapV); const bi = snapInst();
// fonts
const fonts = new Set(); for (const t of [...set.findAll(n => n.type === 'TEXT'), ...tagSrc.findAll(n => n.type === 'TEXT')]) { if (t.characters.length) { for (const f of t.getRangeAllFontNames(0, t.characters.length)) if (f && f.family) fonts.add(JSON.stringify(f)); } else if (t.fontName && t.fontName.family) fonts.add(JSON.stringify(t.fontName)); }
for (const f of fonts) await figma.loadFontAsync(JSON.parse(f));
// ---------- writes ----------
// 1. eye in Password error/Filled
pwWrap.swapComponent(wrapperLg);
pwWrap.setProperties({ [iconKey]: eye.id });
pwWrap.visible = true;
// 2. Password property
const kPw = set.addComponentProperty('Password', 'TEXT', DOTS);
for (const t of pwTexts) t.componentPropertyReferences = Object.assign({}, t.componentPropertyReferences || {}, { characters: kPw });
// 3. Required tag
const kReq = set.addComponentProperty('Show required', 'BOOLEAN', false);
for (const row of labelRows) { const tag = tagSrc.clone(); row.appendChild(tag); tag.name = 'Required tag'; tag.componentPropertyReferences = { visible: kReq }; }
// 4. Focused + error
const copyRefs = (src, dst) => { if (src.componentPropertyReferences && Object.keys(src.componentPropertyReferences).length) dst.componentPropertyReferences = Object.assign({}, src.componentPropertyReferences);
  if (src.type === 'INSTANCE' && dst.type === 'INSTANCE') { if (src.isExposedInstance) dst.isExposedInstance = true; return; }
  if ('children' in src) src.children.forEach((c, i) => copyRefs(c, dst.children[i])); };
let maxY = 0; for (const c of set.children) maxY = Math.max(maxY, c.y + c.height);
const added = [];
pairs.forEach(([s, t], i) => {
  const src = byName(`Size=${s}, Type=${t}, Destructive=True, State=Filled`);
  const c = src.clone(); set.appendChild(c); c.x = 16 + i * 440; c.y = Math.ceil(maxY + 40);
  c.name = `Size=${s}, Type=${t}, Destructive=True, State=Focused`;
  copyRefs(src, c);
  const frames = c.findAll(n => n.type === 'FRAME' && n.name === 'Input' && n.strokes.some(p => p.boundVariables && p.boundVariables.color && p.boundVariables.color.id === BORDER_ERROR_SUBTLE));
  if (frames.length !== 1) throw new Error('GUARD: ' + frames.length + ' error-bordered Input frames in ' + c.name);
  const f = frames[0];
  f.strokes = f.strokes.map(p => figma.variables.setBoundVariableForPaint(p, 'color', vBorderError));
  added.push([c, f]);
});
for (const [, f] of added) await f.setEffectStyleIdAsync(RING_ERROR_STYLE);
let mx = 0, my = 0; for (const c of set.children) { mx = Math.max(mx, c.x + c.width); my = Math.max(my, c.y + c.height); }
set.resizeWithoutConstraints(Math.max(set.width, Math.ceil(mx + 16)), Math.ceil(my + 16));
// ---------- guard ----------
existing.forEach((v, i) => { if (v === errFilledPw) return; if (snapV(v) !== before[i]) throw new Error('GUARD: existing variant changed: ' + v.name); });
if (pwWrap.visible !== true || !pwWrap.findOne(n => n.type === 'INSTANCE' && n.name === 'eye')) throw new Error('GUARD: eye not shown');
if (snapInst() !== bi) throw new Error('GUARD: an existing instance changed');
if (set.children.length !== 61) throw new Error('GUARD: count ' + set.children.length);
const pd = set.componentPropertyDefinitions;
for (const [c] of added) { const src = byName(c.name.replace('State=Focused', 'State=Filled'));
  const t1 = src.findAll(n => n.type === 'TEXT').map(t => t.characters).join('|'), t2 = c.findAll(n => n.type === 'TEXT').map(t => t.characters).join('|');
  if (t1 !== t2 || Math.round(src.height) !== Math.round(c.height)) throw new Error('GUARD: clone differs from source ' + c.name); }
return { check: 'input-validation-write', fileKey: figma.fileKey, writtenAt: new Date().toISOString(), variants: set.children.length,
  props: Object.entries(pd).map(([k, d]) => k + ':' + d.type + (d.type === 'VARIANT' ? '=' + d.variantOptions.join('/') : '')),
  added: added.map(([c]) => [c.id, c.name]), labelRowsTagged: labelRows.length, passwordTextsBound: pwTexts.length, instancesChecked: insts.length,
  refsOnClones: added.map(([c]) => c.findAll(n => n.componentPropertyReferences && Object.keys(n.componentPropertyReferences).length).length) };
