// WRITE use_figma script — Task D4. Approved by Mike 2026-11-10 (chose "Lighter surface (Recommended)"). DUPLICATE ONLY.
// The Modal panel frame fill: `Colors/Background/bg-primary` → `Colors/Background/bg-primary_alt` (existing semantic variable:
// Light #ffffff = unchanged, Dark #13161b). No token or variable is created or changed; nothing else is touched.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', PANEL_ID = '4057:421981', MODAL_ID = '4057:415205';
const BG_PRIMARY = 'VariableID:5269:371407', BG_PRIMARY_ALT = 'VariableID:5503:400270';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: duplicate only');
figma.skipInvisibleInstanceChildren = false;
const modal = await figma.getNodeByIdAsync(MODAL_ID), panel = await figma.getNodeByIdAsync(PANEL_ID);
if (!modal || modal.name !== 'Modal' || !panel || panel.name !== 'Modal' || panel.parent.parent !== modal) throw new Error('precondition: panel');
if (panel.fills.length !== 1 || panel.fills[0].boundVariables.color.id !== BG_PRIMARY) throw new Error('precondition: panel fill');
const vAlt = await figma.variables.getVariableByIdAsync(BG_PRIMARY_ALT);
if (!vAlt || vAlt.name !== 'Colors/Background/bg-primary_alt') throw new Error('precondition: variable');
const snap = () => JSON.stringify(modal.findAll(n => n !== panel).map(n => [n.name, n.visible, Math.round(n.width * 100), Math.round(n.height * 100),
  Array.isArray(n.fills) ? n.fills.map(f => (f.boundVariables && f.boundVariables.color && f.boundVariables.color.id) || f.type).join(',') : '']));
const before = snap(), geo = JSON.stringify([panel.width, panel.height, panel.topLeftRadius, panel.topRightRadius, panel.strokes.length]);
panel.fills = panel.fills.map(p => figma.variables.setBoundVariableForPaint(p, 'color', vAlt));
if (panel.fills[0].boundVariables.color.id !== BG_PRIMARY_ALT) throw new Error('GUARD: fill');
if (JSON.stringify([panel.width, panel.height, panel.topLeftRadius, panel.topRightRadius, panel.strokes.length]) !== geo) throw new Error('GUARD: geometry');
if (snap() !== before) throw new Error('GUARD: something else changed');
return { check: 'modal-d4-surface', writtenAt: new Date().toISOString(), panel: panel.id, fill: vAlt.name };
