// READ-ONLY use_figma body for P1-05: spacing, radius, stroke-width, effect and text bindings
// on each component's own layers (nested instances are not descended; the variant root counts).
// Set PAGES to page IDs. Set FULL to a list of component-set names whose raw findings should be
// returned in full (with node paths); other sets return 2 sample paths per (class, value).
// Mutation review: only getNodeByIdAsync, loadAsync, findAllWithCriteria,
// variables.getVariableByIdAsync, getStyleByIdAsync and property reads. No writes of any kind.
const PAGES = ['__PAGE__'], FULL = [], LIMIT = 48000;
const varCache = new Map(), collCache = new Map();
async function varName(id) {
  if (varCache.has(id)) return varCache.get(id);
  const v = await figma.variables.getVariableByIdAsync(id);
  let name = 'unresolved:' + id;
  if (v) {
    let c = collCache.get(v.variableCollectionId);
    if (c === undefined) { const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); c = col ? col.name : '?'; collCache.set(v.variableCollectionId, c); }
    name = c + '/' + v.name + (v.remote ? ' (remote)' : '');
  }
  varCache.set(id, name);
  return name;
}
const aliasId = (b) => Array.isArray(b) ? (b[0] && b[0].id) : (b && b.id);
const CLASSES = ['padding', 'gap', 'radius', 'strokeWidth', 'effect', 'text'];
function newAcc() { const a = {}; for (const c of CLASSES) a[c] = { bound: 0, styled: 0, raw: 0, zero: 0, rawValues: {}, boundVars: {}, paths: [] }; return a; }
async function hit(acc, cls, state, value, path, full, varId) {
  const s = acc[cls];
  if (state === 'bound') { s.bound++; const n = await varName(varId); s.boundVars[n] = (s.boundVars[n] || 0) + 1; return; }
  if (state === 'styled') { s.styled++; return; }
  if (state === 'zero') { s.zero++; return; }
  s.raw++; const key = String(value); s.rawValues[key] = (s.rawValues[key] || 0) + 1;
  if (full || s.paths.filter(p => p[1] === key).length < 2) s.paths.push([path, key]);
}
async function scanNode(n, acc, path, full) {
  const bv = n.boundVariables || {};
  // Padding and gap (auto-layout frames only)
  if ('layoutMode' in n && n.layoutMode && n.layoutMode !== 'NONE') {
    for (const side of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
      const val = n[side];
      if (bv[side]) await hit(acc, 'padding', 'bound', val, path, full, aliasId(bv[side]));
      else await hit(acc, 'padding', val === 0 ? 'zero' : 'raw', side + '=' + val, path + ' [' + side + ']', full);
    }
    if (n.primaryAxisAlignItems !== 'SPACE_BETWEEN' && 'children' in n && n.children.filter(c => c.visible !== false).length > 1) {
      const val = n.itemSpacing;
      if (bv.itemSpacing) await hit(acc, 'gap', 'bound', val, path, full, aliasId(bv.itemSpacing));
      else await hit(acc, 'gap', val === 0 ? 'zero' : 'raw', val, path, full);
    }
    if (n.layoutWrap === 'WRAP') {
      const val = n.counterAxisSpacing;
      if (bv.counterAxisSpacing) await hit(acc, 'gap', 'bound', val, path, full, aliasId(bv.counterAxisSpacing));
      else await hit(acc, 'gap', val === 0 ? 'zero' : 'raw', 'counter=' + val, path, full);
    }
  }
  // Corner radius
  if ('cornerRadius' in n && n.type !== 'TEXT') {
    const corners = n.cornerRadius === figma.mixed
      ? [['topLeftRadius', n.topLeftRadius], ['topRightRadius', n.topRightRadius], ['bottomLeftRadius', n.bottomLeftRadius], ['bottomRightRadius', n.bottomRightRadius]]
      : [['topLeftRadius', n.cornerRadius]];
    for (const [k, val] of corners) {
      if (bv[k]) await hit(acc, 'radius', 'bound', val, path, full, aliasId(bv[k]));
      else await hit(acc, 'radius', val === 0 ? 'zero' : 'raw', val, path, full);
    }
  }
  // Stroke width (only where a visible stroke exists)
  if ('strokes' in n && Array.isArray(n.strokes) && n.strokes.some(s => s.visible !== false)) {
    if (n.strokeWeight === figma.mixed) {
      for (const k of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']) {
        const val = n[k];
        if (bv[k]) await hit(acc, 'strokeWidth', 'bound', val, path, full, aliasId(bv[k]));
        else await hit(acc, 'strokeWidth', val === 0 ? 'zero' : 'raw', val, path, full);
      }
    } else {
      const val = n.strokeWeight;
      const id = aliasId(bv.strokeWeight) || aliasId(bv.strokeTopWeight);
      if (id) await hit(acc, 'strokeWidth', 'bound', val, path, full, id);
      else await hit(acc, 'strokeWidth', val === 0 ? 'zero' : 'raw', val, path, full);
    }
  }
  // Effects
  if ('effects' in n && Array.isArray(n.effects) && n.effects.some(e => e.visible !== false)) {
    if (n.effectStyleId) await hit(acc, 'effect', 'styled');
    else {
      const e = n.effects.find(e => e.visible !== false);
      const ebv = e.boundVariables || {};
      const id = aliasId(ebv.radius) || aliasId(ebv.color) || aliasId(ebv.offsetY);
      if (id) await hit(acc, 'effect', 'bound', null, path, full, id);
      else await hit(acc, 'effect', 'raw', e.type + (e.radius !== undefined ? ' r' + e.radius : ''), path, full);
    }
  }
  // Text
  if (n.type === 'TEXT') {
    if (n.textStyleId && n.textStyleId !== figma.mixed) await hit(acc, 'text', 'styled');
    else {
      const id = aliasId(bv.fontSize) || aliasId(bv.fontFamily) || aliasId(bv.lineHeight);
      const fn = n.fontName === figma.mixed ? 'mixed' : n.fontName.family + ' ' + n.fontName.style;
      const fs = n.fontSize === figma.mixed ? 'mixed' : n.fontSize;
      if (id) await hit(acc, 'text', 'bound', null, path, full, id);
      else await hit(acc, 'text', 'raw', (n.textStyleId === figma.mixed ? 'mixed-style ' : '') + fn + ' ' + fs, path, full);
    }
  }
}
async function walk(n, acc, depth, path, full) {
  if (n.type === 'INSTANCE' && depth > 0) return;
  await scanNode(n, acc, path, full);
  if ('children' in n) for (const c of n.children) await walk(c, acc, depth + 1, path + ' > ' + c.name, full);
}
const pagesOut = [];
for (const pid of PAGES) {
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  const lone = page.findAllWithCriteria({ types: ['COMPONENT'] }).filter(c => !c.parent || c.parent.type !== 'COMPONENT_SET');
  const items = [];
  for (const o of [...sets, ...lone]) {
    const full = FULL.includes(o.name);
    const variants = o.type === 'COMPONENT_SET' ? o.children.filter(c => c.type === 'COMPONENT') : [o];
    const acc = newAcc();
    for (const v of variants) await walk(v, acc, 0, v.name, full);
    for (const c of CLASSES) if (!acc[c].paths.length) delete acc[c].paths;
    items.push({ name: o.name, id: o.id, full, classes: acc });
  }
  pagesOut.push({ page: page.name.trim(), pageId: page.id, items });
}
const r = { fileKey: figma.fileKey, readAt: new Date().toISOString(), scan: 'P1-05', pages: pagesOut };
const size = JSON.stringify(r).length;
if (size > LIMIT) return { oversize: size, perItem: pagesOut.flatMap(p => p.items.map(i => [p.page, i.name, JSON.stringify(i).length])) };
return r;
