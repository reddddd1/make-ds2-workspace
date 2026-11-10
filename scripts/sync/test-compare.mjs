// Usage: node test-compare.mjs BASELINE.json SCOPE.json
// Self-test for compare-snapshots.mjs using synthetic mutations of the real baseline.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const base = JSON.parse(readFileSync(process.argv[2] || 'baseline-2026-11-10.json', 'utf8'));
const run = (mut) => { const s = structuredClone(base); mut(s); writeFileSync('/tmp/after.json', JSON.stringify(s));
  try { return [0, execFileSync('node', [new URL('compare-snapshots.mjs', import.meta.url).pathname, process.argv[2] || 'baseline-2026-11-10.json', '/tmp/after.json', '--scope', process.argv[3] || 'scope.pilot.json', '--json']).toString()]; }
  catch (e) { return [e.status, e.stdout.toString()]; } };
const v = (s, id) => s.variables.find((x) => x.id === id);
const cases = [
  ['identical', () => {}, 0, 'IDENTICAL'],
  ['rep in scope (Success/700 back to original float)', (s) => { v(s, '5248:377754').values.Style = '#067647ff~0.0218823254,0.464392185,0.280013025,1'; }, 0, 'REPRESENTATION-ONLY'],
  ['rep out of scope (Success/600 re-encoded)', (s) => { v(s, '5248:377753').values.Style = '#079455ff'; }, 1, 'BLOCKING'],
  ['value change', (s) => { v(s, '5248:377715').values.Style = '#5757f3ff'; }, 1, 'BLOCKING'],
  ['alias change', (s) => { v(s, '6137:268549').values['Dark mode'] = '@5248:377714'; }, 1, 'BLOCKING'],
  ['rename', (s) => { v(s, '5270:371446').name = 'color/text/success-primary'; }, 1, 'BLOCKING'],
  ['scope meta', (s) => { v(s, '5248:377686').scopes = 'ALL_FILLS'; }, 1, 'BLOCKING'],
  ['added duplicate', (s) => { s.variables.push({ ...v(s, '5270:371446'), id: '99999:1' }); }, 1, 'BLOCKING'],
  ['removed', (s) => { s.variables = s.variables.filter((x) => x.id !== '23468:2'); }, 1, 'BLOCKING'],
  ['binding drop', (s) => { s.bindings.counts['5270:371419'] = 'f244'; }, 1, 'BLOCKING'],
  ['style rep (Warning/700 cache refresh)', (s) => { const p = s.paintStyles.find((x) => x.name === 'Warning/700'); p.paints = '#b54708ff|color:5248:377740'; }, 0, 'REPRESENTATION-ONLY'],
  ['style hex change', (s) => { const p = s.paintStyles.find((x) => x.name === 'Brand/600'); p.paints = '#5757f3ff|color:5248:377715'; }, 1, 'BLOCKING'],
];
let fail = 0;
for (const [name, mut, code, verdict] of cases) {
  const [c, out] = run(mut); const got = JSON.parse(out).summary.verdict;
  const ok = c === code && got === verdict; if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: exit ${c}, ${got}`);
}
process.exit(fail ? 1 : 0);
