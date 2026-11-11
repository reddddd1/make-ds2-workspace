#!/usr/bin/env node
// make-rename-payloads.mjs MAP.json OUTDIR — writes ready-to-run use_figma scripts per batch and direction.
// Batch N1 = primitives + semantic (incl. the 43 registry-bound variables; ship with the adapter change)
// Batch N2 = component colours (cosmetic rename only; semantic migration stays deferred)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const [mapFile, outDir] = process.argv.slice(2);
const map = JSON.parse(readFileSync(mapFile, 'utf8'));
const tpl = readFileSync(new URL('rename-colors.template.js', import.meta.url), 'utf8');
const batches = { N1: map.renames.filter((r) => r.layer !== 'component'), N2: map.renames.filter((r) => r.layer === 'component') };
mkdirSync(outDir, { recursive: true });
for (const [b, rows] of Object.entries(batches)) {
  writeFileSync(`${outDir}/map-${b}.json`, JSON.stringify({ ...map, renames: rows }, null, 1));
  for (const dir of ['forward', 'rollback']) {
    const code = tpl.replace('__FILEKEY__', map.fileKey).replace('__BATCH__', b).replace('__DIRECTION__', dir)
      .replace('__ROWS__', JSON.stringify(rows.map((r) => [r.id, r.old, r.new])));
    if (code.length > 50000) throw new Error(`${b} ${dir}: ${code.length} chars > use_figma 50000 limit`);
    writeFileSync(`${outDir}/rename-${b}-${dir}.js`, code);
    console.log(`${b} ${dir}: ${rows.length} rows, ${code.length} chars`);
  }
}
