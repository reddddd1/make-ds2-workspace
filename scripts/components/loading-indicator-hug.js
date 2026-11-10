// WRITE use_figma script — Task C (Loading spinner). Approved by Mike 2026-11-10 ("Next task" = C after the agreed order).
// DUPLICATE ONLY. `Loading indicator` (8 variants) root width FIXED 512 → HUG (content 66 wide), so the component no longer
// forces a 512px desktop frame on mobile screens. Each variant is moved right by half the width it loses, so the spinner stays
// exactly where it was on the canvas (pixel-identical set). No instances exist (checked in-call). No colour/token change.
if (figma.fileKey !== 'PpnTy1pkB2FTZFq6i6seSy') throw new Error('REFUSED: duplicate only');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync('1192:610');
if (!set || set.name !== 'Loading indicator' || set.children.length !== 8) throw new Error('precondition: set');
if (set.children.some(v => v.layoutSizingHorizontal !== 'FIXED' || Math.round(v.width) !== 512 || v.layoutMode !== 'HORIZONTAL' || v.primaryAxisAlignItems !== 'CENTER' || (v.fills || []).some(f => f.visible !== false))) throw new Error('precondition: variant shape');
const ids = new Set(set.children.map(c => c.id)); let n = 0;
for (const p of figma.root.children) { await p.loadAsync(); for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) n++; } }
if (n !== 0) throw new Error('precondition: ' + n + ' instances');
const snap = v => JSON.stringify(v.findAll(() => true).map(x => [x.name, x.visible, x.width, x.height, x.type === 'TEXT' ? x.characters : '']));
const before = set.children.map(v => ({ v, abs: v.children[0].absoluteTransform.map(r => r.slice()), s: snap(v), h: v.height }));
for (const { v } of before) { const w0 = v.width; v.layoutSizingHorizontal = 'HUG'; v.x = v.x + (w0 - v.width) / 2; }
for (const b of before) {
  if (b.v.layoutSizingHorizontal !== 'HUG' || snap(b.v) !== b.s || b.v.height !== b.h) throw new Error('GUARD: content changed in ' + b.v.name);
  const a = b.v.children[0].absoluteTransform; if (Math.abs(a[0][2] - b.abs[0][2]) > 0.01 || Math.abs(a[1][2] - b.abs[1][2]) > 0.01) throw new Error('GUARD: content moved in ' + b.v.name);
}
return { check: 'loading-indicator-hug', variants: set.children.map(v => [v.name, Math.round(v.width), Math.round(v.height), Math.round(v.x)]) };
