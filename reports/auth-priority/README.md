# Authentication extras: priority triage (read-only, 2026-11-10)

> Duplicate `PpnTy1pkB2FTZFq6i6seSy`, read-only: no writes, no token changes, nothing published.
>
> - **Script:** `scripts/components/set-profile.js`.
> - **Evidence:** the JSON files in this folder.
> - **Next step:** each task below needs approval before any write. P2-08 is still on hold; P2-07 is still deferred.

## Summary

| # | Area | What exists | Gap for the auth flow | Effort | Decision needed |
|---|---|---|---|---|---|
| 1 | **OTP / PIN** | `Verification code input field` (3 sizes, **4 digits only**). `_Mega input field base`: Placeholder, Focused, Filled, Disabled; semantic colours; Space Grotesk 30/36 | No 6-digit variant. **No Error, no Verified (success) state.** No resend row. **Six cells don't fit:** the smallest cell is 64px + 8px gaps = 424px, wider than the 358px content area of a 390px screen | **L** | Cell size for 6 digits; error/verified styling; resend pattern; Space Grotesk (T3, deferred in proposal 0005) |
| 2 | **Loading spinner** | `Loading indicator`: Line simple and Line spinner × sm, md, lg, xl, optional "Loading..." text; **semantic colours** (`fg-brand-primary`, `bg-tertiary`), so it follows Light/Dark. `Buttons/Button loading icon` (sm, md) is used inside Button Loading | Root is a fixed **512px** wide frame (a desktop leftover). The Button loading icon uses the **deferred component-colour tier** (`button-primary-icon`, `alpha-black-50`), so its Dark appearance isn't checked | **S** | Accept the component-colour binding for the button spinner (171 deferred) or map it to semantic roles |
| 3 | **Bottom sheet (session timeout)** | **Modal is already a mobile bottom sheet:** a 390 × 844 viewport, overlay, panel anchored at the bottom with 32px top radii (bound), `_Modal header` (icon, title, text, close), a `Drawer content` swap slot, `_Modal actions` (vertical or horizontal fill, Home Indicator) | It supports the session-timeout layout: icon, "Session expiring", text or countdown in the slot, then "Stay signed in" / "Sign out". There is **no grabber**, and a countdown needs slot content (text) | **S** (verify with an instance) | Grabber needed? Countdown as text in the slot is fine? |
| 4 | **Input field validation** | Destructive (error) variants for Placeholder and Filled on every type; Helper text statuses Error, Success, Alert, Informative; `Show helper`, `Show optional`; Password eye icon | **No Focused + error state.** **Password in error hides the eye icon**, so the user can't reveal the password while correcting it. **No "password shown" (eye-off) state.** **No required marker**: there's `Optional`, but the OTP's `_Input title` has a `Required` tag the Input field doesn't use | **M** | Required style (asterisk vs `Required` tag); which error states to add |
| 5 | **Splash and brand** | `Logo` (MAKE wordmark) and `Logomark`, each sm–xl × `Dark mode` Yes/No | Logo colours are **remote** variables (`fg-black` / `fg-white` from another library, the same class of issue as S-2). Logomark has **24 unbound solid fills**. No splash component; no registry tokens for logo or splash background | **M** | Splash background (`bg-brand-primary` vs black/gray-950, open O-8); logo colour roles; is a `Dark mode` variant right, or should colours follow the mode? |
| 6 | **Link, selection row, footer** | Button `Link brand` (a hierarchy of the Button set). `Radio group item` (Icon simple, Avatar, Payment icon × sm/md × 4 states × Mobile/Desktop). `Radio group`. `Divider` | **Orphaned components:** "Link gray" Buttons (inside `_Modal actions` and `Radio group item`) and the "Radio button" / "Checkbox" row types (inside `Radio group`) are instances of main components that **sit on no page** (no parent). They're invisible to designers and can't be maintained. **No Link gray hierarchy** in Button. **No footer** component (terms / "Don't have an account? Sign up") | **M–L** | Rebuild Link gray and the plain Radio / Checkbox rows inside their sets (structural; needs a regression plan); footer content |

## Recommended order

I'd keep your order but **move 4 up to second**. Its defects sit in the component the login screens use most (Input field, 18 instances), and the work is small and follows the C2 pattern.

| Order | Task | Why now |
|---|---|---|
| **A** | **OTP / PIN** (1): 6-digit variant with Default, Focused, Filled, Error, Verified, Disabled; a resend row from existing parts (Helper text + Link brand) | Biggest functional gap; needs your design decisions first |
| **B** | **Input validation** (4): Focused + error; keep the eye icon in error; eye-off state; required marker | Highest-use component; small |
| **C** | **Spinner** (2): Hug width; Dark check of the button spinner | Small |
| **D** | **Bottom sheet** (3): read-only proof with an instance in the scratch file, Light + Dark; grabber only if you want one | Probably no component change |
| **E** | **Link / row / footer** (6): fix the orphans, add Link gray, add a minimal auth footer | Structural, so it gets its own regression plan |
| **F** | **Splash / brand** (5): logo colour roles, splash background token | Needs brand decisions (O-8) and token approval |

## Decisions I need before writing anything (task A)

1. **Cell size for 6 digits:**
   - **48px** cells with 8px gaps (= 328px, fits a 358px content area) **(recommended)**;
   - or 52px cells (= 352px).
2. **States:** Default, Focused, Filled, **Error** (border + Helper text Error), **Verified** (success border + Helper text Success), Disabled. Are those enough?
3. **Resend:** "Didn't get a code? **Resend**" plus a "Resend in 0:30" countdown, built from Helper text and Button Link brand. No new component.
4. **Digits font:** keep Space Grotesk (needs bundling on mobile) or switch to Inter?

## Subscription status

Tokens Studio Free (not used) · unblocked · no paid features · no upgrade.
