// WRITE use_figma script — remove ONLY the temporary Dark-mode regression frame created by dark-mode-frame.js.
// DUPLICATE ONLY. Refuses unless the node is exactly that frame (ID, name prefix, page name, 4 row frames, 19 instances,
// all instances linked to local main components). The scratch page itself is kept (Mike, 2026-11-09: remove only the frame).
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy', FRAME_ID = '23518:3', PAGE_NAME = '🧪 Regression scratch (temporary)';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: target ' + figma.fileKey + ' is not the duplicate');
const f = await figma.getNodeByIdAsync(FRAME_ID);
if (!f || f.type !== 'FRAME' || !f.name.startsWith('TEMP — Dark-mode regression test') || !f.parent || f.parent.name !== PAGE_NAME) throw new Error('REFUSED: not the temporary frame');
const rows = f.children.filter(c => c.type === 'FRAME'), insts = rows.flatMap(r => r.children.filter(c => c.type === 'INSTANCE'));
if (f.children.length !== 4 || rows.length !== 4 || insts.length !== 19) throw new Error('REFUSED: unexpected content ' + f.children.length + '/' + insts.length);
for (const i of insts) { const m = await i.getMainComponentAsync(); if (!m || m.remote) throw new Error('REFUSED: unexpected instance ' + i.id); }
const page = f.parent, pageId = page.id, before = page.children.length;
f.remove();
return { removed: FRAME_ID, page: [pageId, page.name], pageChildrenBefore: before, pageChildrenAfter: page.children.length, removedAt: new Date().toISOString() };
