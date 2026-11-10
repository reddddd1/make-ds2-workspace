// WRITE use_figma script — Component task 1: Buttons/Button `Hierarchy=Primary_alt` states. Approved by Mike 2026-11-09 ("Go").
// DUPLICATE ONLY. No registry/token change (the 2 registry tokens are a separate approval).
// Writes (all preconditions are checked before the first write; the call is atomic):
//  1. Root fill of all 35 Primary_alt variants (20 text + 15 icon-only): primitive `Colors/Green lime/500` → semantic role
//       Default / Focused / Loading → `Colors/Background/bg-brand-secondary`        (lime 500 in Light and Dark: no visual change)
//       Hover / Pressed            → `Colors/Background/bg-brand-secondary_hover`  (lime 400: visible hover/pressed feedback)
//     Paint type, opacity and blend are kept; only the bound variable changes.
//  2. 7 new variants `Hierarchy=Primary_alt, State=Disabled` = clones of the 7 `Hierarchy=Primary, State=Disabled` variants
//     (same sizes / icon-only), placed in a new 72 px band at the bottom of the set, x = source x.
//     clone → appendChild(set) → rename → position → restore componentPropertyReferences (P2-03 finding).
//  3. Layout only: set height +72; the 3 component sets below it in the `Buttons` section move down 72; section height +72.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '3287:427074', SHIFT = 72, BAND_Y = 1778, BAND = 48;
const LIME500 = 'VariableID:17489:6181', BG_SEC = 'VariableID:5363:390066', BG_SEC_HOVER = 'VariableID:17490:23029';
const BELOW = ['17503:16162', '21539:9592', '21543:896'];
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || set.type !== 'COMPONENT_SET' || set.name !== 'Buttons/Button' || set.layoutMode !== 'NONE') throw new Error('precondition: set');
if (set.children.length !== 143 || Math.round(set.height) !== 1790) throw new Error('precondition: set changed (' + set.children.length + ' variants, h ' + set.height + ')');
const vSec = await figma.variables.getVariableByIdAsync(BG_SEC), vSecH = await figma.variables.getVariableByIdAsync(BG_SEC_HOVER);
if (!vSec || vSec.name !== 'Colors/Background/bg-brand-secondary' || !vSecH || vSecH.name !== 'Colors/Background/bg-brand-secondary_hover') throw new Error('precondition: semantic variables');
const alts = set.children.filter(v => /Hierarchy=Primary_alt,/.test(v.name));
if (alts.length !== 35) throw new Error('precondition: ' + alts.length + ' Primary_alt variants');
for (const v of alts) {
  if (v.fills.length !== 1 || v.fills[0].type !== 'SOLID' || !(v.fills[0].boundVariables && v.fills[0].boundVariables.color && v.fills[0].boundVariables.color.id === LIME500)) throw new Error('precondition: fill of ' + v.name);
  if (/State=Disabled/.test(v.name)) throw new Error('precondition: Primary_alt Disabled already exists');
}
const sources = set.children.filter(v => /Hierarchy=Primary, State=Disabled,/.test(v.name));
if (sources.length !== 7) throw new Error('precondition: ' + sources.length + ' Primary Disabled sources');
const maxBottom = Math.max(...set.children.map(v => v.y + v.height));
if (maxBottom > BAND_Y - 20) throw new Error('precondition: band area not free (bottom ' + maxBottom + ')');
const sec = set.parent;
if (!sec || sec.type !== 'SECTION' || sec.name !== 'Buttons') throw new Error('precondition: section');
const below = sec.children.filter(c => c !== set && c.y >= set.y + set.height);
if (below.map(c => c.id).sort().join(',') !== [...BELOW].sort().join(',')) throw new Error('precondition: nodes below the set: ' + below.map(c => c.id).join(','));
// ---- writes ----
sec.resizeWithoutConstraints(sec.width, sec.height + SHIFT);
for (const c of below) c.y = c.y + SHIFT;
set.resizeWithoutConstraints(set.width, set.height + SHIFT);
const rebound = [];
for (const v of alts) {
  const target = /State=(Hover|Pressed)/.test(v.name) ? vSecH : vSec;
  v.fills = [figma.variables.setBoundVariableForPaint(v.fills[0], 'color', target)];
  rebound.push([v.id, v.name.split(', ')[0] + ' ' + v.name.split(', ')[2] + ' ' + v.name.split(', ')[3], target.name]);
}
const added = [];
const walk = (n, acc, d) => { acc.push(n); if (n.type === 'INSTANCE' && d > 0) return; if ('children' in n) n.children.forEach(k => walk(k, acc, d + 1)); };
for (const s of sources) {
  const c = s.clone();
  set.appendChild(c);
  c.name = s.name.replace('Hierarchy=Primary,', 'Hierarchy=Primary_alt,');
  c.x = s.x; c.y = BAND_Y + Math.round((BAND - s.height) / 2);
  const A = [], B = []; walk(c, A, 0); walk(s, B, 0);
  if (A.length !== B.length) throw new Error('clone structure differs ' + c.name);
  let restored = 0;
  for (let i = 0; i < A.length; i++) { const want = B[i].componentPropertyReferences || {}; if (JSON.stringify(want) !== JSON.stringify(A[i].componentPropertyReferences || {})) { A[i].componentPropertyReferences = Object.assign({}, want); restored++; } }
  added.push({ source: s.id, id: c.id, name: c.name, parentOk: c.parent === set, restoredRefs: restored, xy: [c.x, c.y] });
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), variants: set.children.length, setSize: [set.width, set.height], section: [sec.width, sec.height],
  moved: below.map(c => [c.id, c.y]), rebound: rebound.length, reboundDetail: rebound, added };
