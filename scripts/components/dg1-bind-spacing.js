// WRITE use_figma script — D-G1 (Option A) step 2: bind the 203 hardcoded login-component spacing values. Approved by
// Mike 2026-11-10 ("MAKE DS2 — D-G1 Approved: Spacing Coverage. I approve Option A for D-G1.").
// DUPLICATE ONLY. Value-preserving: each field is bound to a variable that resolves to its current value.
// Targets = the unbound, > 0 gap/padding fields found by scripts/components/gap-spacing-audit.js (same traversal: own
// layers of each variant, nested instances excluded, SPACE_BETWEEN gaps skipped):
//   10 → `spacing-2_5` · 14 → `spacing-3_5` · 6 → `spacing-sm`
// Expected (precondition, exact): Button padding 10 ×120, padding 14 ×36; Input field gap 10 ×41, gap 6 ×5;
// _Modal header gap 10 ×1; no other hardcoded value in these sets. Writes: setBoundVariable only.
// Guard (else throw → rollback): every bound field reads back the same number and the intended variable; every variant's
// width/height and every own-layer frame's gap/padding numbers unchanged; every instance of these sets in the file keeps
// its width/height.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', ORIGINAL = 'xJoAz66aekAToyhBmfGNt0';
const SETS = { '3287:427074': 'Buttons/Button', '17517:11024': 'Input field', '4055:413620': '_Modal header' };
const VAR = { 10: 'VariableID:23540:3', 14: 'VariableID:23540:5', 6: 'VariableID:6425:327765' };
const VNAME = { 10: 'spacing-2_5', 14: 'spacing-3_5', 6: 'spacing-sm' };
const EXPECT = { 'Buttons/Button|padding|10': 120, 'Buttons/Button|padding|14': 36, 'Input field|gap|10': 41, 'Input field|gap|6': 5, '_Modal header|gap|10': 1 };
if (figma.fileKey === ORIGINAL || figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
// ---- preconditions ----
const vars = {};
for (const px of Object.keys(VAR)) {
  const v = await figma.variables.getVariableByIdAsync(VAR[px]);
  if (!v || v.name !== VNAME[px] || v.resolvedType !== 'FLOAT') throw new Error('precondition: variable ' + VAR[px]);
  const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
  if (col.name !== '3. Spacing') throw new Error('precondition: collection of ' + v.name);
  let x = v.valuesByMode[col.modes[0].modeId];
  for (let d = 0; x && x.type === 'VARIABLE_ALIAS' && d < 5; d++) { const t = await figma.variables.getVariableByIdAsync(x.id); x = t.valuesByMode[Object.keys(t.valuesByMode)[0]]; }
  if (x !== Number(px)) throw new Error('precondition: ' + v.name + ' resolves to ' + x);
  vars[px] = v;
}
const targets = [], counts = {}, frames = [], variants = [];
for (const sid of Object.keys(SETS)) {
  const set = await figma.getNodeByIdAsync(sid);
  if (!set || set.type !== 'COMPONENT_SET' || set.name !== SETS[sid]) throw new Error('precondition: set ' + sid);
  for (const v of set.children.filter(c => c.type === 'COMPONENT')) {
    variants.push(v);
    const visit = n => {
      if (n.type === 'INSTANCE' && n !== v) return;
      if ('layoutMode' in n && n.layoutMode !== 'NONE') {
        frames.push(n);
        const fields = [['gap', 'itemSpacing']];
        if (n.layoutWrap === 'WRAP') fields.push(['gap', 'counterAxisSpacing']);
        for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) fields.push(['padding', k]);
        for (const [kind, f] of fields) {
          if (f === 'itemSpacing' && n.primaryAxisAlignItems === 'SPACE_BETWEEN') continue;
          const b = n.boundVariables && n.boundVariables[f];
          if (b || !(n[f] > 0)) continue;
          const key = SETS[sid] + '|' + kind + '|' + Math.round(n[f] * 100) / 100;
          counts[key] = (counts[key] || 0) + 1;
          targets.push([n, f, n[f]]);
        }
      }
      if ('children' in n) for (const c of n.children) visit(c);
    };
    visit(v);
  }
}
if (JSON.stringify(Object.entries(counts).sort()) !== JSON.stringify(Object.entries(EXPECT).sort())) throw new Error('precondition: hardcoded counts ' + JSON.stringify(counts));
const snapMain = () => JSON.stringify([variants.map(v => [v.width, v.height]), frames.map(n => [n.itemSpacing, n.counterAxisSpacing, n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft, n.width, n.height])]);
const ids = new Set(variants.map(v => v.id)); const insts = [];
for (const p of figma.root.children) { await p.loadAsync(); for (const i of p.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) insts.push(i); } }
const snapInst = () => JSON.stringify(insts.map(i => [Math.round(i.width * 100), Math.round(i.height * 100)]));
const bm = snapMain(), bi = snapInst();
// ---- writes ----
for (const [n, f, val] of targets) n.setBoundVariable(f, vars[String(Math.round(val))]);
// ---- guard ----
for (const [n, f, val] of targets) {
  const b = n.boundVariables && n.boundVariables[f];
  if (!b || b.id !== VAR[String(Math.round(val))] || n[f] !== val) throw new Error('GUARD: ' + n.id + '.' + f + ' reads ' + n[f] + ' / ' + (b && b.id));
}
if (snapMain() !== bm) throw new Error('GUARD: main component layout numbers changed, rolled back');
if (snapInst() !== bi) throw new Error('GUARD: an instance size changed, rolled back');
return { check: 'dg1-bind', fileKey: figma.fileKey, writtenAt: new Date().toISOString(), bound: targets.length, counts,
  byVariable: Object.fromEntries(Object.keys(VAR).map(px => [VNAME[px], targets.filter(t => Math.round(t[2]) === Number(px)).length])),
  variantsChecked: variants.length, framesChecked: frames.length, instancesChecked: insts.length };
