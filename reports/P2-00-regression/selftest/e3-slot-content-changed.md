# Regression check: slots — FAIL

- File `PpnTy1pkB2FTZFq6i6seSy` · baseline `baseline` (2026-11-09T17:41:17.037Z) vs current `current` (2026-11-09T17:43:53.811Z)
- Spec: none (nothing may change)
- Checks: 7 · failed: 1

| Result | Check | Detail |
|---|---|---|
| ❌ | [      ↳ Modals · 17546:4435] native slot content preserved (E3) | [('Body', 'aaaaaaaa', 1)] → [('Body', 'bbbbbbbb', 1)] |
| ✅ | instance count unchanged | 1 → 1 (getInstancesAsync) |
| ✅ | [      ↳ Modals · 17546:4435] linked | Type=Default slotted |
| ✅ | [      ↳ Modals · 17546:4435] property values unchanged | {"Drawer content": "swap:Slot/c774dee721bcfe3fb25ec39b9043727a7a6cf0a6"} |
| ✅ | [      ↳ Modals · 17546:4435] slot content preserved | Slot (INSTANCE), 1 nodes |
| ✅ | [      ↳ Modals · 17546:4435] slot 'Body' limitViolations empty | [] |
| ✅ | [      ↳ Modals · 17546:4435] limitViolations empty | n/a (API not present) |
