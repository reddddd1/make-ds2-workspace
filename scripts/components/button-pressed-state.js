// WRITE use_figma script — P2-03: Buttons/Button `State=Pressed` = copy of each Hover variant (all 25).
// Approved by Mike 2026-11-09 ("All 25"). DUPLICATE only.
// Writes:
//  1. 25 clones of the Hover variants inside the set, renamed State=Hover -> State=Pressed (same bindings,
//     structure, effects, Label property reference). Placed in a new block below the existing variants,
//     rows Primary / Primary_alt / Secondary / Link brand, each clone in its Hover sibling's column.
//  2. Layout only: set height +SHIFT; the component sets below it in the `Buttons` section moved down by SHIFT;
//     section height +SHIFT. No content of any other component changes.
// Preconditions checked before the first write.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '3287:427074', EXPECTED = 25;
const BASE_Y = 1490, ROW = 72, BAND = 48, SHIFT = 284;
const ORDER = ['Primary', 'Primary_alt', 'Secondary', 'Link brand'];
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || set.type !== 'COMPONENT_SET' || set.name !== 'Buttons/Button' || set.layoutMode !== 'NONE') throw new Error('precondition: set');
if (set.componentPropertyDefinitions.State.variantOptions.includes('Pressed')) throw new Error('precondition: Pressed already exists');
const hovers = set.children.filter(v => /State=Hover/.test(v.name));
if (hovers.length !== EXPECTED) throw new Error('precondition: ' + hovers.length + ' Hover variants');
const maxBottom = Math.max(...set.children.map(v => v.y + v.height));
if (maxBottom > BASE_Y - 20 || set.height !== 1506) throw new Error('precondition: layout changed (bottom ' + maxBottom + ', h ' + set.height + ')');
const sec = set.parent;
if (!sec || sec.type !== 'SECTION' || sec.name !== 'Buttons') throw new Error('precondition: section');
const below = sec.children.filter(c => c !== set && c.y >= set.y + set.height);
const belowIds = below.map(c => c.id).sort().join(',');
if (belowIds !== ['17503:16162', '21539:9592', '21543:896'].sort().join(',')) throw new Error('precondition: nodes below the set: ' + belowIds);
// ---- writes ----
sec.resizeWithoutConstraints(sec.width, sec.height + SHIFT);
for (const c of below) c.y = c.y + SHIFT;
set.resizeWithoutConstraints(set.width, set.height + SHIFT);
const results = [];
for (const h of hovers) {
  const hier = /Hierarchy=([^,]+)/.exec(h.name)[1];
  const gi = ORDER.indexOf(hier); if (gi < 0) throw new Error('unknown hierarchy ' + hier);
  // FINDING (P2-03 run): clone() of a variant lands on the CURRENT PAGE, not in the set, and the clone loses
  // every componentPropertyReferences (Label, Show L/R icon). So: clone -> appendChild(set) -> restore refs.
  const c = h.clone();
  set.appendChild(c);
  c.name = h.name.replace('State=Hover', 'State=Pressed');
  c.x = h.x; c.y = BASE_Y + gi * ROW + Math.round((BAND - h.height) / 2);
  const walk = (n, acc, d) => { acc.push(n); if (n.type === 'INSTANCE' && d > 0) return; if ('children' in n) n.children.forEach(k => walk(k, acc, d + 1)); };
  const A = [], B = []; walk(c, A, 0); walk(h, B, 0);
  if (A.length !== B.length) throw new Error('clone structure differs ' + c.name);
  for (let i = 0; i < A.length; i++) { const want = B[i].componentPropertyReferences || {}; if (JSON.stringify(want) !== JSON.stringify(A[i].componentPropertyReferences || {})) A[i].componentPropertyReferences = Object.assign({}, want); }
  results.push({ hover: h.id, pressed: c.id, name: c.name, parentOk: c.parent === set });
}
// As executed on 2026-11-09 this ran in three calls (clone; move the 25 clones from Cover into the set;
// restore 48 references) — see reports/P2-03-button-pressed/write-*.json. This file is the corrected single pass.
const defs = set.componentPropertyDefinitions;
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), variants: set.children.length, stateOptions: defs.State.variantOptions, setSize: [set.width, set.height], section: [sec.width, sec.height], moved: below.map(c => [c.id, c.y]), count: results.length, allParentOk: results.every(r => r.parentOk), results };
