// READ-ONLY use_figma collector for the P1-09 token-sync dry-run (docs/token-sync-spec.md §7).
// Set COLLECTIONS (collection names), RUN, optional PREFIX (only variables whose name starts with it) and
// SLIM (true: ID, name and type only — for out-of-scope variables that are only counted). Returns every variable in those collections with its ID, name,
// resolvedType, scopes count and per-mode value: colours as 8-bit hex (#rrggbb or #rrggbbaa), numbers and
// strings as-is, aliases as {alias: <target variable ID>, name: <target name>, collection: <target collection>}.
// Mutation review: only variables getters (getLocalVariableCollectionsAsync, getVariableByIdAsync,
// getVariableCollectionByIdAsync) and property reads. No writes of any kind.
const COLLECTIONS = ['__COLLECTION__'], RUN = '__RUN__', PREFIX = '', SLIM = false, LIMIT = 48000;
const h2 = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
const hex = (c) => '#' + h2(c.r) + h2(c.g) + h2(c.b) + (c.a !== undefined && c.a < 1 ? h2(c.a) : '');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const colName = new Map(cols.map(c => [c.id, c.name]));
const out = [];
for (const c of cols.filter(c => COLLECTIONS.includes(c.name))) {
  const vars = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (PREFIX && !v.name.startsWith(PREFIX)) continue;
    if (SLIM) { vars.push({ id: v.id, name: v.name, type: v.resolvedType }); continue; }
    const values = {};
    for (const m of c.modes) {
      const x = v.valuesByMode[m.modeId];
      if (x && x.type === 'VARIABLE_ALIAS') {
        const t = await figma.variables.getVariableByIdAsync(x.id);
        values[m.name] = { alias: x.id, name: t ? t.name : null, collection: t ? colName.get(t.variableCollectionId) || 'remote' : null };
      } else values[m.name] = v.resolvedType === 'COLOR' ? hex(x) : x;
    }
    vars.push({ id: v.id, name: v.name, type: v.resolvedType, scopes: v.scopes.length, remote: v.remote, values });
  }
  out.push({ id: c.id, name: c.name, modes: c.modes.map(m => m.name), count: vars.length, variables: vars });
}
const r = { check: 'variables', run: RUN, prefix: PREFIX, slim: SLIM, fileKey: figma.fileKey, readAt: new Date().toISOString(), collections: out };
const size = JSON.stringify(r).length;
return size > LIMIT ? { oversize: size, counts: out.map(c => [c.name, c.count]) } : r;
