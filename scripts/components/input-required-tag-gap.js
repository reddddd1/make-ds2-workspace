// WRITE use_figma script — Task B follow-up: bind the 15 copied "Required tag" gaps (10px, single child, no visual effect) to
// `spacing-2_5` so Input field keeps 0 hardcoded spacing (G1). Value-preserving; DUPLICATE ONLY; guard on value and size.
if (figma.fileKey !== 'PpnTy1pkB2FTZFq6i6seSy') throw new Error('REFUSED: duplicate only');
const set = await figma.getNodeByIdAsync('17517:11024');
const v25 = await figma.variables.getVariableByIdAsync('VariableID:23540:3');
if (!v25 || v25.name !== 'spacing-2_5') throw new Error('precondition: spacing-2_5');
const tags = set.findAll(n => n.type === 'FRAME' && n.name === 'Required tag');
if (tags.length !== 15 || tags.some(t => t.itemSpacing !== 10 || (t.boundVariables && t.boundVariables.itemSpacing))) throw new Error('precondition: 15 unbound 10px tags');
const before = tags.map(t => [t.width, t.height]);
for (const t of tags) t.setBoundVariable('itemSpacing', v25);
if (tags.some((t, i) => t.itemSpacing !== 10 || t.boundVariables.itemSpacing.id !== v25.id || t.width !== before[i][0] || t.height !== before[i][1])) throw new Error('GUARD');
return { check: 'inputB-tag-gap', bound: tags.length };
