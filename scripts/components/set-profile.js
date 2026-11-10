// READ-ONLY use_figma script — compact readiness profile of component sets (used for the 2026-11-10 auth-priority triage).
// Set SETS. Per set: variant axes and options, component properties, root size range, and over the variants' own layers
// (nested instances counted, not entered): paint bindings by collection (semantic / primitive / remote / unbound visible),
// hardcoded gap/padding, fonts and text styles, nested component sources (local set name or remote), text samples.
// No setters, no create/remove/append, no binding changes.
const SETS = ['__SET_IDS__'];
if (figma.fileKey !== 'PpnTy1pkB2FTZFq6i6seSy') throw new Error('REFUSED: duplicate only');
figma.skipInvisibleInstanceChildren = false;
const vC = new Map(), cC = new Map();
const vinfo = async id => { if (!vC.has(id)) { const v = await figma.variables.getVariableByIdAsync(id); let col = null; if (v && !v.remote) { if (!cC.has(v.variableCollectionId)) cC.set(v.variableCollectionId, await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId)); col = cC.get(v.variableCollectionId).name; } vC.set(id, v ? { name: v.name, col: v.remote ? 'remote' : col } : null); } return vC.get(id); };
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const out = [];
for (const sid of SETS) {
  const set = await figma.getNodeByIdAsync(sid);
  if (!set) { out.push({ sid, error: 'missing' }); continue; }
  const variants = set.type === 'COMPONENT_SET' ? set.children.filter(c => c.type === 'COMPONENT') : [set];
  const axes = {}; for (const v of variants) for (const [k, x] of Object.entries(v.variantProperties || {})) { axes[k] = axes[k] || {}; inc(axes[k], x); }
  const props = set.type === 'COMPONENT_SET' || set.type === 'COMPONENT' ? Object.entries(set.componentPropertyDefinitions || {}).filter(([, d]) => d.type !== 'VARIANT').map(([k, d]) => k.split('#')[0] + ':' + d.type) : [];
  const paints = {}, colVars = {}, spacing = {}, fonts = {}, styles = {}, nested = {}, texts = new Set();
  let ws = [], hs = [];
  for (const v of variants) {
    ws.push(Math.round(v.width)); hs.push(Math.round(v.height));
    const visit = async (n, root) => {
      if (n.type === 'INSTANCE' && !root) { const m = await n.getMainComponentAsync(); const s = m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m; inc(nested, !m ? 'null' : (m.remote ? 'remote:' : 'local:') + s.name); return; }
      for (const p of ['fills', 'strokes']) if (Array.isArray(n[p])) for (const f of n[p]) {
        if (f.visible === false) continue;
        const b = f.boundVariables && f.boundVariables.color;
        if (b) { const vi = await vinfo(b.id); const cls = !vi ? 'unresolved' : vi.col === '_Primitives' ? 'primitive' : vi.col === 'remote' ? 'remote' : 'semantic'; inc(paints, cls); inc(colVars, cls + ' ' + (vi ? vi.name : b.id)); }
        else if (f.type === 'SOLID' || f.type.startsWith('GRADIENT')) inc(paints, 'unbound-' + f.type.toLowerCase());
      }
      if ('layoutMode' in n && n.layoutMode !== 'NONE') for (const k of ['itemSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
        if (k === 'itemSpacing' && n.primaryAxisAlignItems === 'SPACE_BETWEEN') continue;
        const b = n.boundVariables && n.boundVariables[k]; inc(spacing, b ? 'bound' : n[k] > 0 ? 'hardcoded ' + n[k] : 'zero');
      }
      if (n.type === 'TEXT') { const f = n.fontName; if (f && f.family) inc(fonts, f.family + ' ' + f.style + ' ' + n.fontSize); const st = n.textStyleId ? await figma.getStyleByIdAsync(n.textStyleId) : null; inc(styles, st ? st.name : 'no style'); if (texts.size < 12) texts.add(n.characters.slice(0, 40)); }
      if ('children' in n) for (const c of n.children) await visit(c, false);
    };
    await visit(v, true);
  }
  const top = o => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 14));
  out.push({ id: sid, name: set.name, page: (() => { let p = set; while (p && p.type !== 'PAGE') p = p.parent; return p && p.name.trim(); })(), variants: variants.length, axes, props,
    size: { w: [Math.min(...ws), Math.max(...ws)], h: [Math.min(...hs), Math.max(...hs)] }, paints, colVars: top(colVars), spacing: top(spacing), fonts: top(fonts), styles: top(styles), nested: top(nested), texts: [...texts],
    description: (set.description || '').slice(0, 160) });
}
return { check: 'set-profile', readAt: new Date().toISOString(), sets: out };
