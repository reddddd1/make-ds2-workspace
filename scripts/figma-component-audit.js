const page = await figma.getNodeByIdAsync('__PAGE__');
await figma.setCurrentPageAsync(page);
const sets = page.findAllWithCriteria({types:['COMPONENT_SET']});
const lone = page.findAllWithCriteria({types:['COMPONENT']}).filter(c=>c.parent && c.parent.type!=='COMPONENT_SET');
function walk(n, acc){
  acc.nodes++;
  if (n.type==='INSTANCE' && acc.depth>0){ acc.inst++; return; }
  if ('fills' in n && Array.isArray(n.fills)) for (const f of n.fills){ if (f.type==='SOLID' && f.visible!==false){ if (f.boundVariables && f.boundVariables.color) acc.bound++; else if (!n.fillStyleId) acc.raw++; } }
  if ('strokes' in n && Array.isArray(n.strokes)) for (const f of n.strokes){ if (f.type==='SOLID' && f.visible!==false){ if (f.boundVariables && f.boundVariables.color) acc.bound++; else if (!n.strokeStyleId) acc.rawS++; } }
  if (n.type==='TEXT' && !n.textStyleId) acc.rawText++;
  if (/slot/i.test(n.name)) acc.slot++;
  if ('children' in n){ acc.depth++; for (const c of n.children) walk(c, acc); acc.depth--; }
}
function audit(owner, variants){
  let props=[];
  try { props = Object.entries(owner.componentPropertyDefinitions).map(([k,v])=>k.split('#')[0]+':'+v.type.slice(0,4)+(v.type==='VARIANT'?'('+v.variantOptions.slice(0,8).join('|')+')':'')); } catch(e){ props=['ERR']; }
  const acc={nodes:0,inst:0,raw:0,rawS:0,bound:0,rawText:0,slot:0,depth:0};
  let noAL=0;
  for (const v of variants){ walk(v, acc); if (v.layoutMode==='NONE') noAL++; }
  return {n:owner.name,id:owner.id,v:variants.length,p:props.slice(0,14),pN:props.length,inst:acc.inst,bound:acc.bound,rawFill:acc.raw,rawStroke:acc.rawS,rawText:acc.rawText,slotNamed:acc.slot,noAutoLayout:noAL,desc:!!owner.description};
}
const out = sets.map(s=>audit(s, s.children.filter(c=>c.type==='COMPONENT')));
const loneOut = lone.slice(0,40).map(c=>audit(c,[c]));
const r = {page:page.name.trim(), sets:out, lone:loneOut, loneTotal:lone.length};
const s = JSON.stringify(r);
if (s.length>45000){ r.sets = out.map(o=>({n:o.n,v:o.v,pN:o.pN,inst:o.inst,bound:o.bound,rawFill:o.rawFill,rawStroke:o.rawStroke,rawText:o.rawText,slotNamed:o.slotNamed})); r.lone = loneOut.map(o=>({n:o.n,pN:o.pN,rawFill:o.rawFill})); }
return r;
