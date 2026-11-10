#!/usr/bin/env node
// Compare two make.figma-snapshot/2 files (before/after a Tokens Studio export) and classify every difference.
// Usage: node compare-snapshots.mjs BEFORE.json AFTER.json [--scope adapters/tokens-studio/figma-binding.pilot.json] [--json]
// Exit codes: 0 = no differences or only REPRESENTATION inside scope · 1 = blocking differences · 2 = usage error
//
// Classes (per variable / mode, per style, per binding count):
//   IDENTICAL       byte-identical encoding
//   REPRESENTATION  colour: same 8-bit hex (#rrggbbaa), only sub-8-bit float precision differs (|Δ| < 0.5/255 per channel)
//   VALUE           literal value changed (different hex, number, string, boolean) or literal<->alias swap
//   ALIAS           alias target changed
//   NAME / META     variable renamed / scopes, hiddenFromPublishing, codeSyntax, description, collection or type changed
//   ADDED / REMOVED variable, collection, mode or style appeared / disappeared
//   STYLE           paint/text/effect style changed beyond REPRESENTATION (hex, binding, font, …)
//   BINDING         number of node bindings to a variable changed
// Anything other than IDENTICAL/REPRESENTATION is BLOCKING. REPRESENTATION outside --scope is also BLOCKING
// (an export must not touch variables it does not own).
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const files = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--scope');
if (files.length !== 2) { console.error('usage: compare-snapshots.mjs BEFORE.json AFTER.json [--scope binding.json] [--json]'); process.exit(2); }
const [A, B] = files.map((f) => JSON.parse(readFileSync(f, 'utf8')));
const scopeFile = args.includes('--scope') ? JSON.parse(readFileSync(args[args.indexOf('--scope') + 1], 'utf8')) : null;
const scope = scopeFile ? new Set(Object.values(scopeFile.tokens).map((t) => t.variableId.replace(/^VariableID:/, ''))) : null;
if (A.fileKey !== B.fileKey) { console.error(`fileKey mismatch ${A.fileKey} vs ${B.fileKey}`); process.exit(2); }

const findings = [];
const add = (cls, kind, id, detail) => findings.push({ cls, kind, id, detail, inScope: scope ? scope.has(id) : null });
const hexOf = (s) => (typeof s === 'string' && s.startsWith('#') ? s.split('~')[0] : null);
const cmpValue = (a, b) => {
  if (a === b) return 'IDENTICAL';
  const ha = hexOf(a), hb = hexOf(b);
  if (ha && hb) return ha === hb ? 'REPRESENTATION' : 'VALUE';
  if (String(a).startsWith('@') && String(b).startsWith('@')) return 'ALIAS';
  return 'VALUE';
};

// collections & modes
const colKey = (c) => c.name;
const ac = new Map(A.collections.map((c) => [colKey(c), c])), bc = new Map(B.collections.map((c) => [colKey(c), c]));
for (const [n, c] of ac) if (!bc.has(n)) add('REMOVED', 'collection', n, c.id);
for (const [n, c] of bc) if (!ac.has(n)) add('ADDED', 'collection', n, c.id);
for (const [n, c] of ac) if (bc.has(n) && JSON.stringify(c.modes) !== JSON.stringify(bc.get(n).modes)) add('META', 'collection-modes', n, `${c.modes} -> ${bc.get(n).modes}`);

// variables
const av = new Map(A.variables.map((v) => [v.id, v])), bv = new Map(B.variables.map((v) => [v.id, v]));
for (const [id, v] of av) if (!bv.has(id)) add('REMOVED', 'variable', id, v.name);
for (const [id, v] of bv) if (!av.has(id)) add('ADDED', 'variable', id, `${v.name} (${v.col})`);
const names = new Map(); for (const v of B.variables) names.set(v.name + '|' + v.col, (names.get(v.name + '|' + v.col) || 0) + 1);
for (const [k, n] of names) if (n > 1) add('ADDED', 'duplicate-name', k, `${n} variables share this name`);
for (const [id, a] of av) {
  const b = bv.get(id); if (!b) continue;
  if (a.name !== b.name) add('NAME', 'variable', id, `${a.name} -> ${b.name}`);
  for (const f of ['col', 'type', 'scopes', 'hidden', 'codeSyntax', 'desc', 'key']) if (JSON.stringify(a[f]) !== JSON.stringify(b[f])) add('META', `variable.${f}`, id, `${a.name}: ${JSON.stringify(a[f])} -> ${JSON.stringify(b[f])}`);
  const modes = new Set([...Object.keys(a.values), ...Object.keys(b.values)]);
  for (const m of modes) {
    const cls = cmpValue(a.values[m], b.values[m]);
    if (cls !== 'IDENTICAL') add(cls, `value[${m}]`, id, `${b.name}: ${a.values[m]} -> ${b.values[m]}`);
  }
}

// styles (keyed by name; style IDs are file-specific)
const styleSets = [['paintStyles', (s) => s.paints], ['textStyles', (s) => JSON.stringify([s.font, s.size, s.lineHeight, s.letterSpacing, s.bound])], ['effectStyles', (s) => s.effects]];
for (const [k, body] of styleSets) {
  if (!A[k] || !B[k]) continue;
  const sa = new Map(A[k].map((s) => [s.name, s])), sb = new Map(B[k].map((s) => [s.name, s]));
  for (const n of sa.keys()) if (!sb.has(n)) add('REMOVED', k, n, '');
  for (const n of sb.keys()) if (!sa.has(n)) add('ADDED', k, n, '');
  for (const [n, s] of sa) {
    if (!sb.has(n)) continue;
    const x = body(s), y = body(sb.get(n));
    if (x === y) continue;
    const strip = (t) => t.replace(/~[0-9.,e-]+/g, '');   // drop sub-8-bit raw floats, keep hex + bindings
    add(strip(x) === strip(y) ? 'REPRESENTATION' : 'STYLE', k, n, `${x} -> ${y}`);
  }
}
// style representation findings are attributed to the bound variable for scope checks
for (const f of findings) if (f.kind === 'paintStyles' && f.cls === 'REPRESENTATION' && scope) {
  const m = f.detail.match(/\|color:([0-9:]+)/); f.inScope = m ? scope.has(m[1]) : false;
}

// bindings
if (A.bindings && B.bindings) {
  const ids = new Set([...Object.keys(A.bindings.counts), ...Object.keys(B.bindings.counts)]);
  for (const id of ids) if ((A.bindings.counts[id] || '') !== (B.bindings.counts[id] || '')) add('BINDING', 'node-bindings', id, `${A.bindings.counts[id] || '-'} -> ${B.bindings.counts[id] || '-'}`);
  if (A.bindings.nodes !== B.bindings.nodes) add('BINDING', 'node-count', 'file', `${A.bindings.nodes} -> ${B.bindings.nodes} nodes scanned`);
}

const blocking = findings.filter((f) => !(f.cls === 'IDENTICAL' || (f.cls === 'REPRESENTATION' && f.inScope !== false)));
const summary = {
  before: A.takenFrom, after: B.takenFrom, fileKey: A.fileKey,
  counts: { variables: `${A.variables.length} -> ${B.variables.length}`, ...Object.fromEntries(Object.entries(findings.reduce((o, f) => ((o[f.cls] = (o[f.cls] || 0) + 1), o), {}))) },
  verdict: blocking.length ? 'BLOCKING' : findings.length ? 'REPRESENTATION-ONLY' : 'IDENTICAL',
};
if (args.includes('--json')) console.log(JSON.stringify({ summary, findings }, null, 1));
else {
  console.log(`${summary.verdict}  ${A.fileKey}  ${summary.before} -> ${summary.after}`);
  console.log('counts', JSON.stringify(summary.counts));
  for (const f of findings) console.log(`${blocking.includes(f) ? '✖' : '·'} ${f.cls.padEnd(14)} ${f.kind.padEnd(18)} ${f.id}  ${f.detail}${f.inScope === false ? '  [OUT OF SCOPE]' : ''}`);
}
process.exit(blocking.length ? 1 : 0);
