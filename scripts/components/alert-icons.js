// WRITE use_figma script — Alert icons per colour (P2-06 part 1). Approved by Mike 2026-11-09 ("Yea").
// DUPLICATE only. In each of the 4 Alert variants, on the nested `Featured icon` (MAKER Icon library):
//   - Color=Error variant: Featured icon Color Brand -> Critical (fixes the known defect)
//   - glyph (Featured icon › Icon wrapper › Icon swap): Default=info, Brand=circle-alert,
//     Error=octagon-alert, Success=circle-check — components imported by key from the MAKER Icon library.
// Writes: importComponentByKeyAsync (4 library icons), setProperties on 1 Featured icon (Color) and on 4 nested
// Icon wrappers (Icon swap). These are overrides inside the Alert main components; the Icon library is not edited.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', SET_ID = '1130:81134';
const GLYPH = { Default: ['info', 'ed8a6ca4c198381e4e42396ebd1710c46b2c97fb'], Brand: ['circle-alert', '64aaca83ebd51b3573e3abd88fd1d3b281314d32'],
  Error: ['octagon-alert', '83748c3c5af3e22e8e47b65ca96cc9c6264633fc'], Success: ['circle-check', '33e4053600f44dd40418e08da6f64721b0908678'] };
const FI_COLOR = { Default: 'Gray', Brand: 'Brand', Error: 'Critical', Success: 'Success' };
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || set.name !== 'Alert' || set.children.length !== 4) throw new Error('precondition: Alert set');
const targets = [];
for (const v of set.children) {
  const color = /Color=(\w+)/.exec(v.name)[1];
  if (!GLYPH[color]) throw new Error('precondition: unknown color ' + color);
  const fi = v.findAll(n => n.type === 'INSTANCE' && n.name === 'Featured icon' && !n.id.includes(';'));
  if (fi.length !== 1) throw new Error('precondition: Featured icon count ' + v.name);
  const fiMain = await fi[0].getMainComponentAsync();
  if (!fiMain || !fiMain.remote || fiMain.parent.key !== '845127259cdd2b2d856077e89081f23457a10305') throw new Error('precondition: Featured icon source');
  targets.push([v, color, fi[0]]);
}
const comps = {};
for (const [name, key] of Object.values(GLYPH)) { const c = await figma.importComponentByKeyAsync(key); if (!c || c.name !== name) throw new Error('import ' + name + ' got ' + (c && c.name)); comps[name] = c; }
const results = [];
for (const [v, color, fi] of targets) {
  const before = { fiColor: fi.componentProperties.Color.value };
  if (fi.componentProperties.Color.value !== FI_COLOR[color]) fi.setProperties({ Color: FI_COLOR[color] });
  const iw = fi.findOne(n => n.type === 'INSTANCE' && n.name === 'Icon wrapper');
  if (!iw) throw new Error('no Icon wrapper in ' + v.name);
  const key = Object.keys(iw.componentProperties).find(k => k.split('#')[0] === 'Icon' && iw.componentProperties[k].type === 'INSTANCE_SWAP');
  if (!key) throw new Error('no Icon swap property in ' + v.name);
  const glyph = comps[GLYPH[color][0]];
  iw.setProperties({ [key]: glyph.id });
  const g = iw.findOne(n => n.type === 'INSTANCE');
  const gm = g ? await g.getMainComponentAsync() : null;
  results.push({ variant: v.name, before, fiColor: fi.componentProperties.Color.value, glyph: gm ? gm.name : null, ok: fi.componentProperties.Color.value === FI_COLOR[color] && gm && gm.name === GLYPH[color][0] });
}
return { fileKey: figma.fileKey, writtenAt: new Date().toISOString(), allOk: results.every(r => r.ok), results };
