#!/usr/bin/env node
// build-color-rename-map.mjs — deterministic old → new mapping for Figma COLOR variable names (naming only).
// Usage: node build-color-rename-map.mjs COLOR-NAMES.json BINDING-NAMES.json OUT.json
//   COLOR-NAMES.json   make.color-names/1 read-back: rows [id, collection(P|M), name]
//   BINDING-NAMES.json { registryPath: [figmaName, variableId] } from adapters/tokens-studio/figma-binding.pilot.json
// Rules (ADR-0004 normalisation, Figma "/" = registry "."):
//   R1 primitives   Colors/<Family>/<step>         → color/<family-slug>/<step>; Colors/Base/<x> → color/<x>
//   R2 semantic     Colors/<Role>/<prefix>-<leaf>  → color/<role>/<leaf> (Text→text, Background→bg, Border→border,
//                   Foreground→fg, Effects/Focus rings→focus-ring, Effects/Shadows→shadow)
//   R3 component    Component colors/Utility/<F>/utility-<f>-<step>[_alt] → color/utility/<f>/<step>[-alt]
//                   Component colors/Alpha/alpha-<x>                     → color/alpha/<x>
//                   Component colors/Components/…/<leaf>                 → color/component/<leaf>
//   leaf normalisation: drop " (900)", on-brandprimary → on-brand-primary, "_" and " " → "-", lowercase
//   S1 approved spelling fix (Mike, 2026-11-11): skeumorphic → skeuomorphic (2 shadow variables)
//   R0 registry wins: a variable bound to a registry token gets exactly that token path (canonical keys unchanged)
// Exits 1 on any collision, unparseable name or registry mismatch.
import { readFileSync, writeFileSync } from 'node:fs';

const [namesFile, bindFile, outFile] = process.argv.slice(2);
const names = JSON.parse(readFileSync(namesFile, 'utf8'));
const bind = JSON.parse(readFileSync(bindFile, 'utf8'));
const registryById = Object.fromEntries(Object.entries(bind).filter(([p]) => p.startsWith('color.'))
  .map(([p, [, id]]) => [id.replace(/^VariableID:/, ''), p]));

const slug = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '-');
const FAMILY = { 'Gray (light mode)': 'gray', 'Gray (dark mode)': 'gray-dark', 'Gray (dark mode alpha)': 'gray-dark-alpha' };
const fam = (f) => FAMILY[f] ?? slug(f);
const leafNorm = (s) => s.replace(/\s*\(\d+\)$/, '').replace(/on-brand(primary|secondary|tertiary)/, 'on-brand-$1')
  .replace(/[_\s]+/g, '-').toLowerCase()
  .replace(/skeumorphic/g, 'skeuomorphic');   // S1
const ROLE = { 'Colors/Text': ['text', 'text-'], 'Colors/Background': ['bg', 'bg-'], 'Colors/Border': ['border', 'border-'],
  'Colors/Foreground': ['fg', 'fg-'], 'Colors/Effects/Focus rings': ['focus-ring', 'focus-ring-'], 'Colors/Effects/Shadows': ['shadow', 'shadow-'] };

const problems = [], rows = [];
for (const [id, col, name] of names.rows) {
  const parts = name.split('/'), leaf = parts.at(-1), group = parts.slice(0, -1).join('/');
  let next = null, rule = null, layer = null;
  if (name.startsWith('color/')) { next = name; rule = 'already'; layer = col === 'P' ? 'primitive' : 'semantic'; }
  else if (col === 'P' && parts[0] === 'Colors' && parts.length === 3) {
    layer = 'primitive'; rule = 'R1';
    next = parts[1] === 'Base' ? `color/${slug(leaf)}` : `color/${fam(parts[1])}/${slug(leaf)}`;
  } else if (col === 'M' && ROLE[group]) {
    layer = 'semantic'; rule = 'R2'; const [role, prefix] = ROLE[group];
    if (!leaf.startsWith(prefix)) problems.push(['PREFIX', id, name]);
    next = `color/${role}/${leafNorm(leaf.slice(leaf.startsWith(prefix) ? prefix.length : 0))}`;
  } else if (col === 'M' && parts[0] === 'Component colors') {
    layer = 'component'; rule = 'R3';
    if (parts[1] === 'Utility' && parts.length === 4) {
      const f = fam(parts[2]), m = leaf.match(new RegExp(`^utility-${f}-(\\d+)(_alt)?$`));
      if (!m) problems.push(['PREFIX', id, name]);
      next = m ? `color/utility/${f}/${m[1]}${m[2] ? '-alt' : ''}` : `color/utility/${f}/${leafNorm(leaf)}`;
    } else if (parts[1] === 'Alpha' && parts.length === 3) {
      if (!leaf.startsWith('alpha-')) problems.push(['PREFIX', id, name]);
      next = `color/alpha/${leafNorm(leaf.replace(/^alpha-/, ''))}`;
    } else if (parts[1] === 'Components') next = `color/component/${leafNorm(leaf)}`;
  }
  if (!next) { problems.push(['UNPARSED', id, name]); continue; }
  const reg = registryById[id];
  if (reg) {
    const regName = reg.split('.').join('/');
    if (regName !== next) { problems.push(['REGISTRY-OVERRIDE', id, `${name}: rule gives ${next}, registry key ${reg}`]); next = regName; rule += '+R0'; }
  }
  rows.push({ id, collection: col === 'P' ? '_Primitives' : '1. Color modes', layer, rule, old: name, new: next, registry: reg ?? null });
}
// collisions: new names must be unique per collection, and must not equal another variable's current name
const seen = new Map();
for (const r of rows) {
  const k = r.collection + '|' + r.new;
  if (seen.has(k)) problems.push(['COLLISION', r.id, `${r.old} and ${seen.get(k).old} → ${r.new}`]); else seen.set(k, r);
}
const current = new Map(rows.map((r) => [r.collection + '|' + r.old, r]));
for (const r of rows) { const o = current.get(r.collection + '|' + r.new); if (o && o.id !== r.id) problems.push(['OCCUPIED', r.id, `${r.new} is currently ${o.id}`]); }

const renames = rows.filter((r) => r.old !== r.new);
const count = (f) => renames.filter(f).length;
const summary = {
  colorVariables: rows.length, alreadyNew: rows.length - renames.length, toRename: renames.length,
  byLayer: { primitive: count((r) => r.layer === 'primitive'), semantic: count((r) => r.layer === 'semantic'), component: count((r) => r.layer === 'component') },
  registryBound: count((r) => r.registry),
  blocking: problems.filter((p) => ['COLLISION', 'OCCUPIED', 'UNPARSED'].includes(p[0])).length,
};
writeFileSync(outFile, JSON.stringify({ schema: 'make.color-rename-map/1', fileKey: 'PpnTy1pkB2FTZFq6i6seSy', source: names.takenAt, summary, problems, renames }, null, 1));
console.log(JSON.stringify(summary)); for (const p of problems) console.log(p.join('  '));
process.exit(summary.blocking ? 1 : 0);
