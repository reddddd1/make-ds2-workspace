# Auth screens: batch 1 (01 · Login), built 2026-11-10

- **Reference:** `23610:6862` ("Reference", page Screens). 19 frames, Light only. Mike: build Light only; Dark is checked by switching modes.
- **Output:** section `Screens` `23610:7` in the DS duplicate `PpnTy1pkB2FTZFq6i6seSy`. 6 rows, 19 frames of 375×812, each with a label.
- **Decisions (Mike):**
  - CTAs use DS **Primary** (blue); the reference's black buttons come from another library.
  - The 2FA option rows are composed from DS parts: tokens, text styles, the library icon and a Radio / Checkbox instance. No new component.
  - The timeout modal sits over the built Login screen, not over the transfer review screen.
  - No iOS chrome.
- **Verification (read-back):**
  - 19 screens; 101 top-level instances.
    - 97 are local WIP DS components: Button 46, Input 16, Logo 17, Radio / Checkbox 6, OTP 6, Alert 2, Logomark 2, Loading 1, Modal 1.
    - 4 are Icon library icons (mail-01, tablet-01), the DS's own icon dependency.
  - 0 detached. 175/175 authored paints are variable-bound. Every text uses a DS text style. 0 visible iOS chrome.
- **Overrides used (no detach):**
  - hid the input's trailing info icon on non-error Default fields
  - hid the Modal slot and the Cancel button
  - logo hidden (space kept) on the error-alert and loading screens
  - link icon colour bound to the link text colour
- **Differences from the reference (DS-driven):**
  - input labels sit above the field (DS Input style)
  - 6-digit OTP uses the DS `xs` size (48 px cells)
  - "Paste code" uses Link gray, not an outlined pill
  - Display headings use the DS Display font
  - Alert uses the DS Alert, not the "Floating" size

## Input style update (2026-11-10)

- All 16 Input field instances switched to `Type=Leading icon` (label inside the box, as in `17588:2114`). Leading icon hidden; trailing icon is eye-off on password fields and hidden on email fields. Inputs are 52 px tall (76 px with helper text).
- **Component defect (not fixed, needs approval):** in the `Leading icon` variants the label and value text layers are not wired to the `Label` and `Text` component properties, so the screens carry them as text overrides. Wiring them in the component would make the properties work.
- The `Destructive=True` Filled variant has no trailing icon slot, so the password field in 01.02.01 shows no eye-off.
- Re-verified: 19 frames, 101 top-level instances (97 local DS, 4 Icon library), 52/52 authored paints bound, all text uses DS styles.
