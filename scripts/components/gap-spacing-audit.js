// READ-ONLY use_figma script — Auto Layout gap and padding token coverage for the login components.
// For every auto-layout frame on a variant's own layers (not inside nested instances, which belong to their own component):
//   gap     = itemSpacing (+ counterAxisSpacing when wrapping); SPACE_BETWEEN gaps are "auto" (not a token candidate)
//   padding = paddingTop / Right / Bottom / Left
// Each field is classified: semantic (bound to `3. Spacing` or another multi-purpose semantic collection), primitive
// (bound to `_Primitives`), remote (another library), hardcoded (unbound, > 0), zero (unbound 0), auto (SPACE_BETWEEN).
// No setters, no create/remove/append, no binding changes.
const SETS = ['3287:427074', '17517:11024', '1130:81134', '4057:415205', '4055:413620', '4057:414352'];
if (figma.fileKey !== 'PpnTy1pkB2FTZFq6i6seSy') throw new Error('REFUSED: duplicate only');
figma.skipInvisibleInstanceChildren = false;
const vC = new Map(), cC = new Map();
const variable = async id => { if (!vC.has(id)) vC.set(id, await figma.variables.getVariableByIdAsync(id)); return vC.get(id); };
const collection = async id => { if (!cC.has(id)) cC.set(id, await figma.variables.getVariableCollectionByIdAsync(id)); return cC.get(id); };
const out = [];
for (const sid of SETS) {
  const set = await figma.getNodeByIdAsync(sid);
  const agg = { gap: {}, padding: {} };          // kind -> class -> count
  const vals = { gap: {}, padding: {} };         // kind -> "class|name|value" -> count
  const ex = {};                                 // "kind|class|value" -> example paths
  let frames = 0;
  for (const v of set.children.filter(c => c.type === 'COMPONENT')) {
    const visit = async (n, path) => {
      if (n.type === 'INSTANCE' && n !== v) return;
      if ('layoutMode' in n && n.layoutMode !== 'NONE') {
        frames++;
        const fields = [['gap', 'itemSpacing']];
        if (n.layoutWrap === 'WRAP') fields.push(['gap', 'counterAxisSpacing']);
        for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) fields.push(['padding', k]);
        for (const [kind, f] of fields) {
          const value = n[f]; const b = n.boundVariables && n.boundVariables[f];
          let cls, name = '';
          if (f === 'itemSpacing' && n.primaryAxisAlignItems === 'SPACE_BETWEEN') cls = 'auto';
          else if (b) {
            const vv = await variable(b.id);
            if (!vv) cls = 'unresolved';
            else if (vv.remote) { cls = 'remote'; name = vv.name; }
            else { const c = await collection(vv.variableCollectionId); cls = c && c.name === '_Primitives' ? 'primitive' : 'semantic'; name = (c ? c.name + ' › ' : '') + vv.name; }
          } else cls = value > 0 ? 'hardcoded' : 'zero';
          agg[kind][cls] = (agg[kind][cls] || 0) + 1;
          const key = cls + '|' + name + '|' + Math.round(value * 100) / 100;
          vals[kind][key] = (vals[kind][key] || 0) + 1;
          if (cls === 'hardcoded' || cls === 'primitive' || cls === 'remote') { const ek = kind + '|' + key; const e = ex[ek] = ex[ek] || []; if (e.length < 3) e.push(v.name.replace(/[A-Za-z ]+=/g, '') + ' › ' + path + ' .' + f); }
        }
      }
      if ('children' in n) for (const c of n.children) await visit(c, path + '/' + c.name);
    };
    await visit(v, 'ROOT');
  }
  out.push({ set: set.name, variants: set.children.length, autoLayoutFrames: frames, agg, vals, examples: ex });
}
return { readAt: new Date().toISOString(), sets: out };
