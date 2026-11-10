// WRITE use_figma script — Task D fixes D1–D3. Approved by Mike 2026-11-10 ("Yes, D1–D3"). DUPLICATE ONLY.
// No token or variable change; the Modal architecture and its `Drawer content` swap slot are unchanged (P2-07 deferred).
// One atomic call; preconditions first; in-call guard (throw → rollback).
//  D1. `_Modal header`: TEXT properties `Title` / `Description` (defaults = current text) bound to the two texts.
//      The header instance inside `Modal` is exposed, so they show in the Modal's properties panel.
//  D2. `_Modal actions` (3 variants): the 6 main Buttons are exposed and their placeholder L/R icons are off
//      (`Show L icon` / `Show R icon` = false). The actions instance inside `Modal` is exposed.
//  D3. New local component `_Modal body text` (TEXT property `Text`, Text sm/Regular, `text-tertiary`, 358 wide,
//      fill-width text, no padding) next to the Modal set; added to the `Drawer content` preferred values (the existing
//      preferred entry is kept; the default value stays the same).
// Guard: every consumer instance of the three sets keeps its texts and sizes; `Modal` keeps its texts and sizes.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', ORIGINAL = 'xJoAz66aekAToyhBmfGNt0';
const HDR_ID = '4055:413620', ACT_ID = '4057:414352', MODAL_ID = '4057:415205', SECTION_ID = '21338:10969';
const TITLE_ID = '4055:413658', DESC_ID = '4055:413659', MODAL_HDR_INST = '4057:421982', MODAL_ACT_INST = '4057:421983';
const BTN_IDS = ['4057:414640', '4057:414641', '4057:414908', '4057:414909', '4057:414921', '4057:414922'];
const SHOW_L = 'Show L icon#21269:56', SHOW_R = 'Show R icon#21269:175', SWAP = 'Drawer content#21214:0';
const TEXT_TERTIARY = 'VariableID:5263:372566', STYLE_SM = 'S:bb569d8495b285f374e5912fc8e1a6e0f3a254d9,';
if (figma.fileKey === ORIGINAL || figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
// ---------- preconditions ----------
const hdr = await figma.getNodeByIdAsync(HDR_ID), act = await figma.getNodeByIdAsync(ACT_ID), modal = await figma.getNodeByIdAsync(MODAL_ID);
if (!hdr || hdr.name !== '_Modal header' || hdr.children.length !== 1) throw new Error('precondition: header set');
if (!act || act.name !== '_Modal actions' || act.children.length !== 3) throw new Error('precondition: actions set');
if (!modal || modal.name !== 'Modal' || modal.children.length !== 1) throw new Error('precondition: modal set');
if (Object.keys(hdr.componentPropertyDefinitions).some(k => /^(Title|Description)#/.test(k))) throw new Error('precondition: header props exist');
const title = await figma.getNodeByIdAsync(TITLE_ID), desc = await figma.getNodeByIdAsync(DESC_ID);
if (!title || title.characters !== '{Title}' || !desc || desc.characters !== '{Text content - Lorem ipsum dolor sit amet}') throw new Error('precondition: header texts');
if ([title, desc].some(t => t.componentPropertyReferences && t.componentPropertyReferences.characters)) throw new Error('precondition: texts already bound');
const btns = await Promise.all(BTN_IDS.map(id => figma.getNodeByIdAsync(id)));
if (btns.some(b => !b || b.type !== 'INSTANCE' || b.name !== 'Buttons/Button' || !act.children.some(v => v.findOne(x => x.id === b.id)))) throw new Error('precondition: buttons');
if (btns.some(b => b.componentProperties[SHOW_L].value !== true || b.componentProperties[SHOW_R].value !== true)) throw new Error('precondition: button icons');
const mHdr = await figma.getNodeByIdAsync(MODAL_HDR_INST), mAct = await figma.getNodeByIdAsync(MODAL_ACT_INST);
if (!mHdr || !mAct) throw new Error('precondition: modal sub-instances');
if (!modal.children[0].findOne(x => x.id === mHdr.id) || !modal.children[0].findOne(x => x.id === mAct.id)) throw new Error('precondition: modal sub-instances not in Modal');
if (mHdr.isExposedInstance || mAct.isExposedInstance) throw new Error('precondition: already exposed');
const section = await figma.getNodeByIdAsync(SECTION_ID); if (!section || section.name !== 'Modals') throw new Error('precondition: section');
if (section.findOne(n => n.type === 'COMPONENT' && n.name === '_Modal body text')) throw new Error('precondition: body component exists');
const vTert = await figma.variables.getVariableByIdAsync(TEXT_TERTIARY); if (!vTert || !/text-tertiary/.test(vTert.name)) throw new Error('precondition: text-tertiary');
const smStyle = await figma.getStyleByIdAsync(STYLE_SM); if (!smStyle || smStyle.name !== 'Text sm/Regular') throw new Error('precondition: style');
const swapDef = modal.componentPropertyDefinitions[SWAP]; if (!swapDef || swapDef.type !== 'INSTANCE_SWAP') throw new Error('precondition: swap');
const swapDefault = swapDef.defaultValue, preferredBefore = swapDef.preferredValues || [];
// consumers (whole file) of the three sets
const ids = new Set([...hdr.children, ...act.children, ...modal.children].map(v => v.id)); const cons = [];
for (const p of figma.root.children) { await p.loadAsync(); for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) cons.push(i); } }
if (cons.length !== 9) throw new Error('precondition: ' + cons.length + ' consumer instances');
const snapTexts = n => JSON.stringify([Math.round(n.width * 100), Math.round(n.height * 100), n.findAll(t => t.type === 'TEXT').map(t => [t.characters, t.visible])]);
const consBefore = cons.map(snapTexts), modalBefore = snapTexts(modal.children[0]);
// fonts
const fonts = new Set(); for (const t of [title, desc]) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.add(JSON.stringify(f));
for (const f of fonts) await figma.loadFontAsync(JSON.parse(f));
// ---------- writes ----------
// D1
const kTitle = hdr.addComponentProperty('Title', 'TEXT', title.characters);
const kDesc = hdr.addComponentProperty('Description', 'TEXT', desc.characters);
title.componentPropertyReferences = Object.assign({}, title.componentPropertyReferences || {}, { characters: kTitle });
desc.componentPropertyReferences = Object.assign({}, desc.componentPropertyReferences || {}, { characters: kDesc });
mHdr.isExposedInstance = true;
// D2
for (const b of btns) { b.setProperties({ [SHOW_L]: false, [SHOW_R]: false }); b.isExposedInstance = true; }
mAct.isExposedInstance = true;
// D3
const body = figma.createComponent(); section.appendChild(body);
body.name = '_Modal body text';
body.description = 'Body text for the Modal `Drawer content` slot (swap it in instead of the Slot placeholder). Edit via the Text property.';
body.layoutMode = 'VERTICAL'; body.primaryAxisSizingMode = 'AUTO'; body.counterAxisSizingMode = 'FIXED'; body.fills = [];
body.resize(358, 20); body.x = modal.x; body.y = Math.ceil(modal.y + modal.height + 40);
const txt = figma.createText(); body.appendChild(txt);
await txt.setTextStyleIdAsync(STYLE_SM);
txt.characters = '{Body text}'; txt.name = 'Text';
txt.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', vTert)];
txt.layoutSizingHorizontal = 'FILL'; txt.textAutoResize = 'HEIGHT';
const kText = body.addComponentProperty('Text', 'TEXT', '{Body text}');
txt.componentPropertyReferences = { characters: kText };
modal.editComponentProperty(SWAP, { preferredValues: [...preferredBefore, { type: 'COMPONENT', key: body.key }] });
// ---------- guard ----------
cons.forEach((c, i) => { if (snapTexts(c) !== consBefore[i]) throw new Error('GUARD: consumer changed: ' + c.id + ' ' + snapTexts(c) + ' vs ' + consBefore[i]); });
if (snapTexts(modal.children[0]) !== modalBefore) throw new Error('GUARD: Modal changed');
const d2 = modal.componentPropertyDefinitions[SWAP];
if (d2.defaultValue !== swapDefault || d2.preferredValues.length !== preferredBefore.length + 1) throw new Error('GUARD: swap definition');
if (btns.some(b => b.componentProperties[SHOW_L].value || b.componentProperties[SHOW_R].value || !b.isExposedInstance)) throw new Error('GUARD: buttons');
if (Math.round(body.width) !== 358 || txt.fills[0].boundVariables.color.id !== TEXT_TERTIARY || txt.textStyleId !== STYLE_SM) throw new Error('GUARD: body component');
return { check: 'modal-d1-d3-write', fileKey: figma.fileKey, writtenAt: new Date().toISOString(),
  headerProps: Object.keys(hdr.componentPropertyDefinitions), actionsExposed: btns.map(b => b.id),
  bodyComponent: [body.id, body.key, body.width, body.height], preferred: d2.preferredValues, consumersChecked: cons.length };
