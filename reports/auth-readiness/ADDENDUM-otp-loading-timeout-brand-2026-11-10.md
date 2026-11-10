# Auth component readiness (read-only, 2026-11-10, DS duplicate PpnTy1pkB2FTZFq6i6seSy)

| Need | Component (id) | Coverage | Verdict |
|---|---|---|---|
| OTP input | Verification code input field `1106:66757` | 6 digits (size xs): Default, Focused, Filled, Error, Verified, Disabled. 48×48 cells, 328 px wide (fits 390 − 2×16). Label, support text, "Resend" boolean. 205 bound fills, 1 raw, 0 broken. The 4-digit variants are Default only | **Ready** (use 6-digit xs) |
| Loading | Loading indicator `1192:610` (spinner/simple × sm–xl, optional label); Button `State=Loading`; Button loading icon `8993:429278` | All bound, 0 broken | **Ready** |
| Session timeout | Modal `4057:415205` (legacy `Slot` body + header + actions: Confirm/Cancel); `_Modal body text` `23571:17526`; Alert `1130:81134` (Default/Brand/Error/Success) | Works with the existing legacy slot (native Slot conversion deferred). No Warning alert colour and no toast, so use Modal or Alert Default | **Ready** |
| Brand assets | Logo `21465:11`, Logomark `21465:30`: sm/md/lg/xl × light/dark | 8 variants each | **Ready**. The splash background and logo colour role are still Mike's open Task F decision (splash screen only) |
| Screen chrome | Only `Header navigation` (2 variants) is local. No status bar, home indicator or `_Page headline` component in the duplicate | Known gaps C-7 / F1 / F3 | **Only real gap**: decide whether to omit the device chrome or use the iOS-kit status bar (not mode-aware), and build headlines from DS text styles (as in the Figma pilot) |
