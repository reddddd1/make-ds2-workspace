// READ-ONLY use_figma script — functional readiness audit of component sets (no writes of any kind).
// Per set: property definitions, and per own layer (not inside nested instances) the functional checks below,
// aggregated with up to 3 examples each. Checks:
//   unboundPaint     visible SOLID/GRADIENT fill or stroke with no bound colour variable and no paint style
//   primitiveColour  colour bound to a single-mode collection variable (e.g. _Primitives) → will not switch in Dark mode
//   remoteVar        bound variable from another library (ignores this file's Light/Dark modes, cf. S-2)
//   unboundRadius    corner radius > 0 without a bound radius variable
//   unboundSpacing   auto-layout padding/gap > 0 without a bound variable
//   textNoStyle      text without a text style and without a bound font size
//   noAutoLayout     frame/component with ≥ 2 children and no auto layout
//   absoluteChild    child positioned absolutely inside auto layout
//   hiddenNoProp     hidden layer not controlled by a BOOLEAN property (dead layer or missing property)
//   iconNotSwappable nested instance from the MAKER Icon library that is neither exposed nor bound to an INSTANCE_SWAP property
//   rootSizing       variant root horizontal sizing (FIXED / HUG / FILL) — informational for responsiveness
const SET_IDS = ['3287:427074', '17517:11024', '4057:415205', '4055:413620', '4057:414352', '1130:81134'];
const ICON_SET_KEY = 'b8295cee7375c7b7216cb412047f771ce86fbf9d'; // MAKER Icon library "Icon wrapper"
if (figma.fileKey !== 'PpnTy1pkB2FTZFq6i6seSy') throw new Error('REFUSED: duplicate only');
figma.skipInvisibleInstanceChildren = false;
const vCache = new Map(), cCache = new Map();
const variable = async id => { if (!vCache.has(id)) vCache.set(id, await figma.variables.getVariableByIdAsync(id)); return vCache.get(id); };
const collection = async id => { if (!cCache.has(id)) cCache.set(id, await figma.variables.getVariableCollectionByIdAsync(id)); return cCache.get(id); };
const out = [];
for (const sid of SET_IDS) {
  const set = await figma.getNodeByIdAsync(sid);
  const defs = set.componentPropertyDefinitions;
  const props = Object.entries(defs).map(([k, d]) => [k.split('#')[0], d.type, d.type === 'VARIANT' ? d.variantOptions.length : (d.type === 'INSTANCE_SWAP' ? 'preferred:' + (d.preferredValues || []).length : String(d.defaultValue).slice(0, 20))]);
  const issues = {}; const add = (k, ex) => { const e = issues[k] = issues[k] || { n: 0, ex: [] }; e.n++; if (e.ex.length < 3 && !e.ex.includes(ex)) e.ex.push(ex); };
  const sizing = {}; let icons = 0, iconsOk = 0, variants = 0;
  for (const v of set.children.filter(c => c.type === 'COMPONENT')) {
    variants++;
    sizing[v.layoutSizingHorizontal + '/' + v.layoutSizingVertical] = (sizing[v.layoutSizingHorizontal + '/' + v.layoutSizingVertical] || 0) + 1;
    const vshort = v.name.replace(/Size=|Hierarchy=|State=|Type=|Destructive=|Icon only=|Color=|Breakpoint=/g, '');
    const visit = async (n, path, inInst) => {
      const where = vshort + ' › ' + path;
      const bv = n.boundVariables || {};
      // bound variable checks
      for (const [f, val] of Object.entries(bv)) for (const a of [].concat(val)) {
        if (!a || !a.id) continue; const vv = await variable(a.id); if (!vv) continue;
        if (vv.remote) add('remoteVar', where + ' ' + f + ' ' + vv.name);
        else if (vv.resolvedType === 'COLOR') { const c = await collection(vv.variableCollectionId); if (c && c.modes.length === 1) add('primitiveColour', where + ' ' + f + ' ' + vv.name); }
      }
      if (n.type === 'INSTANCE' && n !== v) {
        const mc = await n.getMainComponentAsync(); const ms = mc && mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : null;
        if (ms && ms.key === ICON_SET_KEY) { icons++; if (n.isExposedInstance || (n.componentPropertyReferences && n.componentPropertyReferences.mainComponent)) iconsOk++; else add('iconNotSwappable', where); }
        if (n.visible === false && !(n.componentPropertyReferences && n.componentPropertyReferences.visible)) add('hiddenNoProp', where);
        return; // do not descend into nested instances (their own main component is audited separately)
      }
      if (n.visible === false && !(n.componentPropertyReferences && n.componentPropertyReferences.visible)) add('hiddenNoProp', where);
      for (const prop of ['fills', 'strokes']) if (prop in n && Array.isArray(n[prop])) n[prop].forEach((p, i) => {
        if (p.visible === false || !['SOLID', 'GRADIENT_LINEAR', 'GRADIENT_RADIAL'].includes(p.type)) return;
        const styled = prop === 'fills' ? n.fillStyleId : n.strokeStyleId;
        if (!(p.boundVariables && p.boundVariables.color) && !styled && !(n.type === 'TEXT' && n.fillStyleId)) add('unboundPaint', where + ' ' + prop + ' ' + (p.color ? '#' + [p.color.r, p.color.g, p.color.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('') : p.type));
      });
      if ('cornerRadius' in n && typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !bv.topLeftRadius && n.type !== 'TEXT') add('unboundRadius', where + ' r=' + n.cornerRadius);
      if ('layoutMode' in n && n.layoutMode !== 'NONE') {
        for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']) if (n[k] > 0 && !bv[k] && !(k === 'itemSpacing' && n.primaryAxisAlignItems === 'SPACE_BETWEEN')) { add('unboundSpacing', where + ' ' + k + '=' + n[k]); break; }
        for (const c of n.children) if (c.layoutPositioning === 'ABSOLUTE') add('absoluteChild', where + ' › ' + c.name);
      } else if ('children' in n && n.children.filter(c => c.visible !== false).length >= 2 && ['FRAME', 'COMPONENT'].includes(n.type)) add('noAutoLayout', where);
      if (n.type === 'TEXT' && !n.textStyleId && !bv.fontSize) add('textNoStyle', where + ' "' + n.characters.slice(0, 20) + '"');
      if ('children' in n) for (let i = 0; i < n.children.length; i++) await visit(n.children[i], path + '/' + n.children[i].name, inInst);
    };
    await visit(v, v.name.split(',')[0], false);
  }
  out.push({ set: set.name, id: sid, variants, props, rootSizing: sizing, icons: [icons, iconsOk], issues });
}
return { readAt: new Date().toISOString(), sets: out };
