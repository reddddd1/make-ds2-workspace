// Local pixel comparison of two PNGs (read-only). Usage: node pixel-diff.cjs <modulesDir> <before.png> <after.png> [diff.png]
// Prints JSON: size match, exactly-equal pixel count, pixelmatch differing pixels (threshold 0, anti-aliasing included).
const [, , mod, a, b, out] = process.argv;
const path = require('path'); const fs = require('fs');
const { PNG } = require(path.join(mod, 'node_modules/pngjs'));
const pixelmatch = require(path.join(mod, 'node_modules/pixelmatch'));
const A = PNG.sync.read(fs.readFileSync(a)), B = PNG.sync.read(fs.readFileSync(b));
if (A.width !== B.width || A.height !== B.height) { console.log(JSON.stringify({ sizeMatch: false, a: [A.width, A.height], b: [B.width, B.height] })); process.exit(1); }
let exact = 0; for (let i = 0; i < A.data.length; i += 4) if (A.data[i] === B.data[i] && A.data[i + 1] === B.data[i + 1] && A.data[i + 2] === B.data[i + 2] && A.data[i + 3] === B.data[i + 3]) exact++;
const D = new PNG({ width: A.width, height: A.height });
const diff = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0, includeAA: true });
if (out) fs.writeFileSync(out, PNG.sync.write(D));
console.log(JSON.stringify({ sizeMatch: true, size: [A.width, A.height], pixels: A.width * A.height, identicalPixels: exact, differingPixels: diff, identical: diff === 0 }));
