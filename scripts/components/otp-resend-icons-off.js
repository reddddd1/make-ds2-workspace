// WRITE use_figma script — Task A follow-up: hide the left/right icon slots of the 6 "Resend button" instances in the new
// `Verification code input field` Digits=6 variants (they showed the Button's placeholder icons). Approved scope: Task A ("Yes, start OTP").
// DUPLICATE ONLY. Writes: setProperties({Show L icon: false, Show R icon: false}) on exactly those 6 instances.
// Guard: the 3 four-digit variants and every non-Resend layer of the 6 new variants are unchanged.
const DUPLICATE = 'PpnTy1pkB2FTZFq6i6seSy';
if (figma.fileKey !== DUPLICATE) throw new Error('REFUSED: duplicate only');
figma.skipInvisibleInstanceChildren = false;
const field = await figma.getNodeByIdAsync('1106:66757');
const six = field.children.filter(v => /Digits=6/.test(v.name));
if (six.length !== 6 || field.children.length !== 9) throw new Error('precondition: variants');
const btns = six.map(v => v.findOne(n => n.type === 'INSTANCE' && n.name === 'Resend button'));
if (btns.some(b => !b)) throw new Error('precondition: resend button missing');
const keyL = Object.keys(btns[0].componentProperties).find(k => k.startsWith('Show L icon#'));
const keyR = Object.keys(btns[0].componentProperties).find(k => k.startsWith('Show R icon#'));
if (!keyL || !keyR) throw new Error('precondition: icon properties');
const snap = () => JSON.stringify(field.children.map(v => v.findAll(n => { let p = n; while (p && p !== v) { if (p.name === 'Resend') return false; p = p.parent; } return true; })
  .map(n => [n.name, n.visible, Math.round(n.width * 100), Math.round(n.height * 100), n.type === 'TEXT' ? n.characters : ''])));
const before = snap();
for (const b of btns) b.setProperties({ [keyL]: false, [keyR]: false });
const after = btns.map(b => [b.componentProperties[keyL].value, b.componentProperties[keyR].value, Math.round(b.width)]);
if (after.some(a => a[0] !== false || a[1] !== false)) throw new Error('GUARD: icons still on');
if (snap() !== before) throw new Error('GUARD: a non-Resend layer changed, rolled back');
return { check: 'otp-icons-off', after };
