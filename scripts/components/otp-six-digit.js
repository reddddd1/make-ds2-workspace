// WRITE use_figma script — Task A (OTP / PIN). Approved by Mike 2026-11-10 ("Yes, start OTP"; decisions: 48px cells with 8px gaps,
// 6 states, text + link + countdown resend, keep Space Grotesk). DUPLICATE ONLY. No token or variable change.
// One atomic call; all preconditions before the first write; in-call guard (throw → rollback).
//  A. `_Mega input field base` (12 → 24 variants):
//     - State=Error / Verified for sm, md, lg (clones of Filled: stroke → border-error / border-success,
//       digit → color/text/error-primary / text-success-primary);
//     - Size=xs (48 × 48, radius-2xl) for all 6 states (clones of sm).
//  B. `Verification code input field` (3 → 9 variants):
//     - new VARIANT axis State (existing 3 renamed `…, State=Default`, otherwise unchanged);
//     - 6 variants `Size=xs, Digits=6, State=Default|Focused|Filled|Error|Verified|Disabled` (clones of sm/4 with 6 xs cells);
//     - Helper text status per state; resend row ("Didn't get a code?" + Button Link brand sm "Resend";
//       Disabled → Button Disabled "Resend in 0:30");
//     - BOOLEAN `Show resend`; Helper text + resend Button exposed.
// Guard: the 12 existing cells and 3 existing fields are structurally unchanged (names aside for the 3 fields); no instance
// of these sets exists outside them.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', ORIGINAL = 'xJoAz66aekAToyhBmfGNt0';
const BASE_ID = '1106:66560', FIELD_ID = '1106:66757', BTN_ID = '3287:427074';
const V = { borderError: 'VariableID:5353:385108', borderSuccess: 'VariableID:21259:769', textError: 'VariableID:5263:373125', textSuccess: 'VariableID:5270:371446',
  textTertiary: 'VariableID:5263:372566', radius2xl: 'VariableID:6298:46481', spacingXs: 'VariableID:6298:45386' };
const TEXT_SM_REGULAR = 'S:bb569d8495b285f374e5912fc8e1a6e0f3a254d9,';
const DIGITS = ['4', '8', '2', '9', '1', '6'];
if (figma.fileKey === ORIGINAL || figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
// ---------- preconditions ----------
const base = await figma.getNodeByIdAsync(BASE_ID), field = await figma.getNodeByIdAsync(FIELD_ID), btn = await figma.getNodeByIdAsync(BTN_ID);
if (!base || base.type !== 'COMPONENT_SET' || base.name !== '_Mega input field base' || base.children.length !== 12) throw new Error('precondition: base set');
if (!field || field.type !== 'COMPONENT_SET' || field.name !== 'Verification code input field' || field.children.length !== 3) throw new Error('precondition: field set');
if (base.children.some(v => /Error|Verified|Size=xs/.test(v.name)) || field.children.some(v => /Digits=6|State=/.test(v.name))) throw new Error('precondition: already built');
const vars = {}; for (const [k, id] of Object.entries(V)) { vars[k] = await figma.variables.getVariableByIdAsync(id); if (!vars[k]) throw new Error('precondition: variable ' + k); }
const textStyle = await figma.getStyleByIdAsync(TEXT_SM_REGULAR); if (!textStyle || textStyle.name !== 'Text sm/Regular') throw new Error('precondition: text style');
const cell = (state, size) => base.children.find(v => v.name === 'State=' + state + ', Size=' + size);
for (const s of ['Placeholder', 'Focused', 'Filled', 'Disabled']) for (const z of ['sm', 'md', 'lg']) if (!cell(s, z)) throw new Error('precondition: cell ' + s + ' ' + z);
const btnDefault = btn.children.find(v => v.name === 'Size=sm, Hierarchy=Link brand, State=Default, Icon only=False');
const labelKey = Object.keys(btn.componentPropertyDefinitions).find(k => k.startsWith('Label#'));
if (!btnDefault || !labelKey) throw new Error('precondition: Link brand sm button / Label property');
const fieldSm = field.children.find(v => v.name === 'Size=sm, Digits=4');
const titleKey = Object.keys(field.componentPropertyDefinitions).find(k => k.startsWith('Label#'));
if (!fieldSm || !titleKey) throw new Error('precondition: field sm / Label property');
// no consumers outside the two sets
const ownIds = new Set([...base.children, ...field.children].map(c => c.id)); let outside = 0;
for (const p of figma.root.children) { await p.loadAsync(); for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (!m || !ownIds.has(m.id)) continue; let q = i.parent, inside = false; while (q) { if (q === base || q === field) inside = true; q = q.parent; } if (!inside) outside++; } }
if (outside !== 0) throw new Error('precondition: ' + outside + ' instances outside the sets');
// structural snapshot of existing variants (names excluded)
const snap = async v => { const acc = []; const walk = async n => { const bv = n.boundVariables || {}; const ref = n.componentPropertyReferences || {};
  let line = [n.type, n.name === v.name ? '<root>' : n.name, n.visible, Math.round(n.width * 100), Math.round(n.height * 100), JSON.stringify(Object.keys(bv).sort().map(k => [k, Array.isArray(bv[k]) ? bv[k].map(a => a.id) : bv[k].id])), JSON.stringify(ref),
    JSON.stringify(['fills', 'strokes'].map(p => Array.isArray(n[p]) ? n[p].map(f => (f.boundVariables && f.boundVariables.color && f.boundVariables.color.id) || f.type) : null)), n.type === 'TEXT' ? n.characters : ''].join('|');
  if (n.type === 'INSTANCE') { const m = await n.getMainComponentAsync(); line += '|' + (m && m.id); acc.push(line); return; }
  acc.push(line); if ('children' in n) for (const c of n.children) await walk(c); }; await walk(v); return acc.join('\n'); };
const existing = [...base.children, ...field.children];
const before = []; for (const v of existing) before.push(await snap(v));
// fonts
const fonts = new Set();
const addFonts = n => { for (const t of (n.type === 'TEXT' ? [n] : n.findAll(x => x.type === 'TEXT'))) { if (t.characters.length) { for (const f of t.getRangeAllFontNames(0, t.characters.length)) if (f && f.family) fonts.add(JSON.stringify(f)); } else if (t.fontName && t.fontName.family) fonts.add(JSON.stringify(t.fontName)); } };
addFonts(base); addFonts(field); addFonts(btnDefault); if (textStyle.fontName && textStyle.fontName.family) fonts.add(JSON.stringify(textStyle.fontName));
fonts.add(JSON.stringify({ family: 'Inter', style: 'Regular' }));
for (const f of fonts) await figma.loadFontAsync(JSON.parse(f));
// ---------- writes ----------
const boundPaint = (paints, variable) => paints.map(p => figma.variables.setBoundVariableForPaint(p, 'color', variable));
const recolour = (v, strokeVar, textVar) => { v.strokes = boundPaint(v.strokes, strokeVar); const t = v.findOne(n => n.type === 'TEXT'); t.fills = boundPaint(t.fills, textVar); };
const place = (n, parent, x, y) => { parent.appendChild(n); n.x = x; n.y = y; };
const newCells = [];
// A1: Error / Verified for sm, md, lg
const colX = { sm: 16, md: 112, lg: 224, xs: 336 }, rowY = { Placeholder: 16, Filled: 144, Focused: 276, Disabled: 400, Error: 504, Verified: 624 };
for (const z of ['sm', 'md', 'lg']) for (const [state, sv, tv] of [['Error', vars.borderError, vars.textError], ['Verified', vars.borderSuccess, vars.textSuccess]]) {
  const c = cell('Filled', z).clone(); place(c, base, colX[z], rowY[state]); c.name = 'State=' + state + ', Size=' + z; recolour(c, sv, tv); newCells.push(c);
}
// A2: xs for all 6 states (from sm)
for (const state of ['Placeholder', 'Focused', 'Filled', 'Disabled', 'Error', 'Verified']) {
  const c = cell(state, 'sm').clone(); place(c, base, colX.xs, rowY[state]); c.name = 'State=' + state + ', Size=xs';
  c.resize(48, c.height); c.minHeight = 48; c.layoutSizingVertical = 'HUG';
  for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) c.setBoundVariable(k, vars.radius2xl);
  newCells.push(c);
}
base.resizeWithoutConstraints(400, 736);
// B1: State axis on the existing fields
for (const v of field.children.slice()) v.name = v.name + ', State=Default';
// B2: six-digit variants
const showResend = field.addComponentProperty('Show resend', 'BOOLEAN', true);
const STATES = ['Default', 'Focused', 'Filled', 'Error', 'Verified', 'Disabled'];
const helperStatus = { Default: 'Informative default', Focused: 'Informative default', Filled: 'Informative default', Error: 'Error', Verified: 'Success', Disabled: 'Informative default' };
const helperText = { Default: '{Support text}', Focused: '{Support text}', Filled: '{Support text}', Error: '{Error}', Verified: '{Success}', Disabled: '{Support text}' };
const newFields = [];
for (let i = 0; i < STATES.length; i++) {
  const S = STATES[i];
  const f = fieldSm.clone(); place(f, field, 16 + i * 360, 190); f.name = 'Size=xs, Digits=6, State=' + S;
  const title = f.findOne(n => n.type === 'INSTANCE' && n.name === '_Input title');
  title.componentPropertyReferences = Object.assign({}, title.componentPropertyReferences || {}, { visible: titleKey });
  const row = f.findOne(n => n.type === 'FRAME' && n.name === 'Input');
  while (row.children.length < 6) row.appendChild(row.children[0].clone());
  row.children.forEach((c, k) => {
    const st = S === 'Default' ? 'Placeholder' : S === 'Focused' ? (k === 0 ? 'Focused' : 'Placeholder') : S;
    c.swapComponent(cell(st, 'xs') || newCells.find(n => n.name === 'State=' + st + ', Size=xs'));
    if (['Filled', 'Error', 'Verified'].includes(S)) c.findOne(n => n.type === 'TEXT').characters = DIGITS[k];
  });
  const helper = f.findOne(n => n.type === 'INSTANCE' && n.name === 'Helper text');
  const hKey = Object.keys(helper.componentProperties).find(k => k.startsWith('Text#'));
  helper.setProperties({ Status: helperStatus[S], [hKey]: helperText[S] });
  helper.isExposedInstance = true;
  // resend row
  const r = figma.createFrame(); r.name = 'Resend'; r.layoutMode = 'HORIZONTAL'; r.counterAxisAlignItems = 'CENTER'; r.fills = [];
  r.layoutSizingHorizontal = 'HUG'; r.layoutSizingVertical = 'HUG'; r.itemSpacing = 4; r.setBoundVariable('itemSpacing', vars.spacingXs);
  const t = figma.createText(); t.name = 'Prompt'; await t.setTextStyleIdAsync(TEXT_SM_REGULAR); t.characters = "Didn't get a code?";
  t.fills = boundPaint([{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }], vars.textTertiary); r.appendChild(t);
  const b = btnDefault.createInstance(); b.name = 'Resend button'; r.appendChild(b);
  if (S === 'Disabled') b.setProperties({ State: 'Disabled', [labelKey]: 'Resend in 0:30' }); else b.setProperties({ [labelKey]: 'Resend' });
  f.appendChild(r); b.isExposedInstance = true;
  r.componentPropertyReferences = { visible: showResend };
  newFields.push(f);
}
let maxX = 0, maxY = 0; for (const c of field.children) { maxX = Math.max(maxX, c.x + c.width); maxY = Math.max(maxY, c.y + c.height); }
field.resizeWithoutConstraints(Math.ceil(maxX + 16), Math.ceil(maxY + 16));
// ---------- guard ----------
for (let i = 0; i < existing.length; i++) if (await snap(existing[i]) !== before[i]) throw new Error('GUARD: existing variant changed: ' + existing[i].name);
if (base.children.length !== 24 || field.children.length !== 9) throw new Error('GUARD: counts ' + base.children.length + '/' + field.children.length);
const ax = field.componentPropertyDefinitions;
if (!ax.State || ax.State.variantOptions.length !== 6 || !ax.Digits.variantOptions.includes('6') || !ax.Size.variantOptions.includes('xs')) throw new Error('GUARD: field axes ' + JSON.stringify(ax));
const bx = base.componentPropertyDefinitions;
if (bx.State.variantOptions.length !== 6 || !bx.Size.variantOptions.includes('xs')) throw new Error('GUARD: base axes');
for (const f of newFields) { const row = f.findOne(n => n.type === 'FRAME' && n.name === 'Input'); if (row.children.length !== 6 || Math.round(row.width) !== 328) throw new Error('GUARD: row ' + f.name + ' ' + row.width); }
return { check: 'otp-write', fileKey: figma.fileKey, writtenAt: new Date().toISOString(),
  base: { variants: base.children.length, axes: { State: bx.State.variantOptions, Size: bx.Size.variantOptions }, newCells: newCells.map(c => [c.id, c.name, c.width, c.height]) },
  field: { variants: field.children.length, axes: Object.fromEntries(Object.entries(ax).map(([k, d]) => [k, d.type === 'VARIANT' ? d.variantOptions : d.type])), newFields: newFields.map(f => [f.id, f.name, Math.round(f.width), Math.round(f.height)]),
    renamed: field.children.filter(v => /Digits=4/.test(v.name)).map(v => v.name) }, existingChecked: existing.length };
