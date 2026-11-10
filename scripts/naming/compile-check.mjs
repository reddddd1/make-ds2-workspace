// Local Tailwind compile check for the token naming proposal (read-only; writes only to the output folder).
// Usage: node scripts/naming/compile-check.mjs <dir containing node_modules/tailwindcss> <out dir>
// Uses the tailwindcss `compile()` API directly (no CLI, no app config, no token-repo files).
// Values below are copied from the registry (design-tokens/tokens/**, read 2026-11-09); they are fixtures, not a build.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [, , envDir, outDir] = process.argv;
if (!envDir || !outDir) { console.error('usage: compile-check.mjs <envDir> <outDir>'); process.exit(2); }
const require = createRequire(path.join(path.resolve(envDir), 'package.json'));
const twPkgDir = path.dirname(require.resolve('tailwindcss/package.json'));
const twPkg = JSON.parse(fs.readFileSync(path.join(twPkgDir, 'package.json'), 'utf8'));
const twMod = await import(require.resolve('tailwindcss'));
const compile = twMod.compile ?? twMod.default?.compile;
fs.mkdirSync(outDir, { recursive: true });

async function build(name, css, candidates) {
  const c = await compile(css, {
    base: twPkgDir,
    loadStylesheet: async (id, base) => {
      const file = id === 'tailwindcss' ? path.join(twPkgDir, 'index.css') : path.join(twPkgDir, id.replace(/^tailwindcss\//, ''));
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, 'utf8') };
    },
  });
  const out = c.build(candidates);
  fs.writeFileSync(path.join(outDir, name + '.css'), out);
  return out;
}
// Extract the declarations of one utility rule from compiled CSS (rule text only, no layers).
function rule(css, cls) {
  const esc = '.' + cls.replace(/[:.]/g, m => '\\' + m);
  let i = css.indexOf(esc + ' {'); if (i < 0) i = css.indexOf(esc + ':hover {'); if (i < 0) return null;
  let depth = 0, j = css.indexOf('{', i);
  for (let k = j; k < css.length; k++) { if (css[k] === '{') depth++; if (css[k] === '}' && --depth === 0) return css.slice(j + 1, k).replace(/\s+/g, ' ').trim(); }
  return null;
}
function varValue(css, name) { const m = css.match(new RegExp('\\s' + name.replace(/[-]/g, '\\-') + ':\\s*([^;]+);')); return m ? m[1].trim() : null; }

const THEME = '@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/utilities.css" layer(utilities);\n';
const results = [];
const check = (scenario, cls, css, expect, note) => {
  const r = rule(css, cls);
  const ok = expect === null ? r === null : (r !== null && expect.every(e => r.includes(e)));
  results.push({ scenario, class: cls, expect: expect === null ? 'no rule generated' : expect, got: r, pass: ok, note });
};

// ---------------- S1: pilot batch, defaults-safe shape (option A: roles in @theme, primitives in :root) ----------------
const S1 = THEME + `
:root {
  --make-color-brand-400: #9090f6; --make-color-brand-500: #7373f5; --make-color-brand-600: #5656f3; --make-color-brand-700: #2323f0;
  --make-color-error-400: #fe6286; --make-color-error-600: #ca0050;
  --make-color-gray-450: #8a8e97; --make-color-gray-dark-600: #61656c;
}
@theme {
  --background-color-brand-primary: var(--make-color-brand-600);
  --background-color-brand-primary-hover: var(--make-color-brand-700);
  --text-color-brand-primary: var(--make-color-brand-600);
  --text-color-error-primary: var(--make-color-error-600);
  --border-color-primary: var(--make-color-gray-450);
  --ring-color-primary: var(--make-color-brand-500);
}
.dark {
  --text-color-brand-primary: var(--make-color-brand-400);
  --text-color-error-primary: var(--make-color-error-400);
  --border-color-primary: var(--make-color-gray-dark-600);
}
`;
const s1c = ['bg-brand-primary', 'bg-brand-primary-hover', 'text-brand-primary', 'text-error-primary', 'border-primary', 'ring-primary',
  'p-3', 'gap-3', 'text-base', 'font-semibold', 'bg-gray-100', 'rounded-lg', 'font-sans', 'bg-brand-600', 'bg-bg-brand-primary'];
const s1 = await build('S1-pilot-option-a', S1, s1c);
check('S1', 'bg-brand-primary', s1, ['background-color: var(--background-color-brand-primary)'], 'role → plain class');
check('S1', 'bg-brand-primary-hover', s1, ['background-color: var(--background-color-brand-primary-hover)']);
check('S1', 'text-brand-primary', s1, ['color: var(--text-color-brand-primary)']);
check('S1', 'text-error-primary', s1, ['color: var(--text-color-error-primary)']);
check('S1', 'border-primary', s1, ['border-color: var(--border-color-primary)']);
check('S1', 'ring-primary', s1, ['--tw-ring-color: var(--ring-color-primary)']);
check('S1', 'p-3', s1, ['padding: calc(var(--spacing) * 3)'], 'Tailwind default multiplier 0.25rem × 3 = 12px at 16px root = registry spacing.3; nothing emitted');
check('S1', 'gap-3', s1, ['gap: calc(var(--spacing) * 3)']);
check('S1', 'text-base', s1, ['font-size: var(--text-base)', 'line-height: var(--tw-leading, var(--text-base--line-height))'], 'Tailwind default 1rem / 1.5 = registry 16px / 1.5; nothing emitted');
check('S1', 'font-semibold', s1, ['font-weight: var(--font-weight-semibold)'], 'Tailwind default 600 = registry 600; nothing emitted');
check('S1', 'bg-gray-100', s1, ['background-color: var(--color-gray-100)'], 'stays Tailwind default (not overridden)');
check('S1', 'rounded-lg', s1, ['border-radius: var(--radius-lg)'], 'stays Tailwind default 0.5rem');
check('S1', 'font-sans', s1, ['font-family: var(--font-sans)'], 'stays Tailwind default stack');
check('S1', 'bg-brand-600', s1, null, 'option A exposes no palette utilities');
check('S1', 'bg-bg-brand-primary', s1, null, 'no doubled prefix');
const defaultsS1 = { 'color-gray-100': varValue(s1, '--color-gray-100'), 'radius-lg': varValue(s1, '--radius-lg'), 'text-base': varValue(s1, '--text-base'), 'text-base--line-height': varValue(s1, '--text-base--line-height'), 'font-weight-semibold': varValue(s1, '--font-weight-semibold'), 'spacing': varValue(s1, '--spacing') };

// ---------------- S2: composite typography as type-* utilities ----------------
const COMPOSITES = { // registry typography.text.<size>.<weight>
  'base-normal': ['base', 'normal'], 'base-medium': ['base', 'medium'], 'base-semibold': ['base', 'semibold'],
  'sm-normal': ['sm', 'normal'], 'sm-medium': ['sm', 'medium'], 'xs-normal': ['xs', 'normal'], 'xs-medium': ['xs', 'medium'], 'xs-semibold': ['xs', 'semibold'] };
const S2 = THEME + `:root { --make-font-family-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }\n` +
  Object.entries(COMPOSITES).map(([k, [s, w]]) => `@utility type-${k} {\n  font-family: var(--make-font-family-sans);\n  font-size: var(--text-${s});\n  line-height: var(--text-${s}--line-height);\n  font-weight: var(--font-weight-${w});\n  letter-spacing: 0px;\n}`).join('\n') + '\n';
const s2c = [...Object.keys(COMPOSITES).map(k => 'type-' + k), 'md:type-sm-medium', 'hover:type-base-semibold', 'type-base', 'type-lg-medium', 'text-base', 'text-text-base-medium'];
const s2 = await build('S2-type-utilities', S2, s2c);
for (const [k, [s, w]] of Object.entries(COMPOSITES)) check('S2', 'type-' + k, s2, [`font-size: var(--text-${s})`, `font-weight: var(--font-weight-${w})`, 'font-family: var(--make-font-family-sans)']);
check('S2', 'md:type-sm-medium', s2, ['font-size: var(--text-sm)'], 'variants work on custom utilities');
check('S2', 'hover:type-base-semibold', s2, ['font-weight: var(--font-weight-semibold)']);
check('S2', 'type-base', s2, null, 'no core Tailwind utility uses the type-* prefix');
check('S2', 'type-lg-medium', s2, null, 'only registry composites exist');
check('S2', 'text-base', s2, ['font-size: var(--text-base)'], 'font-size utility unaffected');
check('S2', 'text-text-base-medium', s2, null, 'awkward name not generated');

// ---------------- S3: radius by value (proposal R1) ----------------
const RADIUS = { 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 16: 16, 20: 20, 24: 24, 32: 32 };
const S3 = THEME + '@theme {\n' + Object.entries(RADIUS).map(([k, v]) => `  --radius-${k}: ${v}px;`).join('\n') + '\n}\n';
const s3c = [...Object.keys(RADIUS).map(k => 'rounded-' + k), 'rounded-t-10', 'rounded-lg', 'rounded-sm', 'rounded-none', 'rounded-full', 'rounded-5', 'p-6'];
const s3 = await build('S3-radius-by-value', S3, s3c);
for (const k of Object.keys(RADIUS)) check('S3', 'rounded-' + k, s3, [`border-radius: var(--radius-${k})`]);
check('S3', 'rounded-t-10', s3, ['border-top-left-radius: var(--radius-10)'], 'side variants derive automatically');
check('S3', 'rounded-lg', s3, ['border-radius: var(--radius-lg)'], 'Tailwind default untouched');
check('S3', 'rounded-sm', s3, ['border-radius: var(--radius-sm)'], 'Tailwind default untouched');
check('S3', 'rounded-none', s3, ['border-radius: 0'], 'built-in static');
check('S3', 'rounded-full', s3, ['border-radius: calc(infinity * 1px)'], 'built-in static');
check('S3', 'rounded-5', s3, null, 'no bare-value radius in Tailwind: only registered values exist');
check('S3', 'p-6', s3, ['padding: calc(var(--spacing) * 6)'], 'spacing unaffected (p-6 = 24px; rounded-6 = 6px: documented)');
const s3noTheme = await build('S3b-radius-no-theme', THEME, ['rounded-6', 'rounded-10']);
check('S3b', 'rounded-6', s3noTheme, null, 'proves rounded-<n> does not exist without a registered key');

// ---------------- S4: hazard demo — a palette key in @theme overrides the default globally ----------------
const s4 = await build('S4-override-hazard', THEME + '@theme { --color-gray-100: #f5f5f5; }\n', ['bg-gray-100']);
const grayDefault = defaultsS1['color-gray-100'], grayOverride = varValue(s4, '--color-gray-100');
results.push({ scenario: 'S4', class: 'bg-gray-100', expect: 'value changes from the default (hazard)', got: `${grayDefault} → ${grayOverride}`, pass: grayDefault !== grayOverride, note: 'any app screen using bg-gray-100 would change: why C4 is blocked' });

// ---------------- S5: D-G1 spacing steps 2.5 (10px) and 3.5 (14px) — multiplier utilities, nothing emitted ----------------
// Registry spacing tokens are never emitted as theme keys (convention §4: one `--spacing` multiplier), so adding
// spacing.2_5 / spacing.3_5 cannot alter any utility. Proof: the same build with/without the registry change is identical
// (there is no spacing output at all), and the new steps resolve through the default multiplier.
const S5c = ['p-2.5', 'px-3.5', 'py-2.5', 'gap-2.5', 'gap-3.5', 'p-2', 'p-3', 'p-0.5', 'p-1.5', 'px-4', 'gap-1'];
const s5 = await build('S5-spacing-2_5-3_5', THEME, S5c);
for (const [cls, prop, n] of [['p-2.5', 'padding', '2.5'], ['px-3.5', 'padding-inline', '3.5'], ['py-2.5', 'padding-block', '2.5'], ['gap-2.5', 'gap', '2.5'], ['gap-3.5', 'gap', '3.5']])
  check('S5', cls, s5, [`${prop}: calc(var(--spacing) * ${n})`], `${n} × 0.25rem = ${Number(n) * 4}px at 16px root`);
for (const [cls, prop, n] of [['p-2', 'padding', '2'], ['p-3', 'padding', '3'], ['p-0.5', 'padding', '0.5'], ['p-1.5', 'padding', '1.5'], ['px-4', 'padding-inline', '4'], ['gap-1', 'gap', '1']])
  check('S5', cls, s5, [n === '1' ? `${prop}: var(--spacing);` : `${prop}: calc(var(--spacing) * ${n})`], 'existing step unchanged');
check('S5', 'p-2.5', s5.includes('--spacing-2') ? '' : s5, ['padding'], 'no per-step --spacing-* variable is emitted');

// ---------------- Tailwind default theme variables (authoritative list for the collision check) ----------------
const themeCss = fs.readFileSync(path.join(twPkgDir, 'theme.css'), 'utf8');
const vars = {};
for (const m of themeCss.matchAll(/^\s*(--[a-z0-9-]+(?:--[a-z0-9-]+)?|--[a-z0-9-]+-\*):\s*([^;]*);/gim)) vars[m[1]] = m[2].replace(/\s+/g, ' ').trim();
fs.writeFileSync(path.join(outDir, 'tailwind-theme-vars.json'), JSON.stringify({ tailwindcss: twPkg.version, source: 'tailwindcss/theme.css', count: Object.keys(vars).length, vars: Object.fromEntries(Object.entries(vars).sort()) }, null, 1) + '\n');

const summary = { node: process.version, nodeLts: process.release.lts || null, tailwindcss: twPkg.version, total: results.length, passed: results.filter(r => r.pass).length, defaultsObserved: defaultsS1 };
fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify({ summary, results }, null, 1) + '\n');
console.log(JSON.stringify(summary));
for (const r of results) if (!r.pass) console.log('FAIL', r.scenario, r.class, JSON.stringify(r.got));
process.exit(summary.passed === summary.total ? 0 : 1);
