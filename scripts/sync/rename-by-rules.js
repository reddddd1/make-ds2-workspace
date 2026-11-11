// rename-by-rules.js — use_figma: rename COLOR variables by the approved deterministic rules (build-color-rename-map.mjs),
// computed in-plugin, then gated on an FNV hash of the full "id\told\tnew" row list produced offline from the reviewed map.
// If the in-file plan differs from the reviewed map by a single character, nothing is written.
const CONFIG = { fileKey: "PpnTy1pkB2FTZFq6i6seSy", batch: "N1", direction: "forward", expectRows: 391, expectHash: "HASH" };
if (figma.fileKey !== CONFIG.fileKey) throw new Error("wrong file " + figma.fileKey);
const REG = { "6139:331930": "color/text/primary-on-brand" };   // R0 registry override (only one differs from the rule)
const slug = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/\s+/g, "-");
const FAMILY = { "Gray (light mode)": "gray", "Gray (dark mode)": "gray-dark", "Gray (dark mode alpha)": "gray-dark-alpha" };
const fam = (f) => FAMILY[f] ?? slug(f);
const leafNorm = (s) => s.replace(/\s*\(\d+\)$/, "").replace(/on-brand(primary|secondary|tertiary)/, "on-brand-$1")
  .replace(/[_\s]+/g, "-").toLowerCase().replace(/skeumorphic/g, "skeuomorphic");
const ROLE = { "Colors/Text": ["text", "text-"], "Colors/Background": ["bg", "bg-"], "Colors/Border": ["border", "border-"],
  "Colors/Foreground": ["fg", "fg-"], "Colors/Effects/Focus rings": ["focus-ring", "focus-ring-"], "Colors/Effects/Shadows": ["shadow", "shadow-"] };
const P = "VariableCollectionId:5248:377685", M = "VariableCollectionId:5256:372339";
const rule = (v) => {   // returns [layer, newName] or null
  const name = v.name, parts = name.split("/"), leaf = parts.at(-1), group = parts.slice(0, -1).join("/");
  if (name.startsWith("color/")) return null;
  if (v.variableCollectionId === P && parts[0] === "Colors" && parts.length === 3)
    return ["primitive", parts[1] === "Base" ? `color/${slug(leaf)}` : `color/${fam(parts[1])}/${slug(leaf)}`];
  if (v.variableCollectionId === M && ROLE[group]) { const [role, prefix] = ROLE[group];
    return ["semantic", `color/${role}/${leafNorm(leaf.startsWith(prefix) ? leaf.slice(prefix.length) : leaf)}`]; }
  if (v.variableCollectionId === M && parts[0] === "Component colors") {
    if (parts[1] === "Utility" && parts.length === 4) { const f = fam(parts[2]), m = leaf.match(new RegExp(`^utility-${f}-(\\d+)(_alt)?$`));
      return ["component", m ? `color/utility/${f}/${m[1]}${m[2] ? "-alt" : ""}` : `color/utility/${f}/${leafNorm(leaf)}`]; }
    if (parts[1] === "Alpha" && parts.length === 3) return ["component", `color/alpha/${leafNorm(leaf.replace(/^alpha-/, ""))}`];
    if (parts[1] === "Components") return ["component", `color/component/${leafNorm(leaf)}`];
  }
  return ["unparsed", null];
};
const fnv = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(16); };
const all = await figma.variables.getLocalVariablesAsync();
const inBatch = (layer) => (CONFIG.batch === "N1" ? layer === "primitive" || layer === "semantic" : layer === "component");
const rows = [];
const unparsed = [];
if (CONFIG.direction === "forward") {
  for (const v of all) { if (v.resolvedType !== "COLOR") continue; const r = rule(v); if (!r) continue;
    if (r[0] === "unparsed") { unparsed.push(v.name); continue; }
    const id = v.id.replace(/^VariableID:/, ""); if (inBatch(r[0])) rows.push([id, v.name, REG[id] ?? r[1], v]); }
}
rows.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
const hash = fnv(rows.map((r) => r.slice(0, 3).join("\t")).join("\n"));
if (unparsed.length || rows.length !== CONFIG.expectRows || hash !== CONFIG.expectHash)
  return { ok: false, written: 0, reason: "plan does not match the reviewed map", rows: rows.length, hash, unparsed: unparsed.slice(0, 10) };
const taken = new Set(all.map((v) => v.variableCollectionId + "|" + v.name));
const clash = rows.filter((r) => taken.has(r[3].variableCollectionId + "|" + r[2]));
if (clash.length) return { ok: false, written: 0, reason: "target names taken", clash: clash.slice(0, 10).map((r) => r[2]) };
const done = [];
try { for (const [, from, to, v] of rows) { v.name = to; done.push([v, from]); } }
catch (e) { for (const [v, from] of done.reverse()) v.name = from; return { ok: false, reverted: done.length, error: String(e) }; }
const after = await figma.variables.getLocalVariablesAsync();
const now = new Map(after.map((v) => [v.id, v.name]));
const wrong = rows.filter((r) => now.get(r[3].id) !== r[2]).length;
const dup = after.length - new Set(after.map((v) => v.variableCollectionId + "|" + v.name)).size;
return { ok: wrong === 0 && dup === 0, batch: CONFIG.batch, written: done.length, readBackMismatches: wrong, duplicateNames: dup, variables: after.length, hash };
