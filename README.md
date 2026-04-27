# BARFLYDATE_v47_20260427_2237

Complete full ZIP build. No patches.

## New in v47 — Splash Centering Fix
Built from v46.

### Splash logo fully centered
The splash logo/card now uses strict centered sizing:
- centered in the viewport
- max width limit
- no right-side cutoff
- `object-fit: contain`
- `object-position: center`
- 16:9 logo card ratio

### Save-to-home-screen card centered
The Quick Tip card now aligns directly under the centered logo.

### Button layout fixed
The Quick Tip buttons:
- stay centered on wider screens
- wrap safely if needed
- stack vertically on smaller screens

### Horizontal clipping prevention
Added stronger width and overflow rules to prevent desktop/mobile side clipping.

### Preserved from v46
- splash logo path fixed
- splash always routes to `/events`
- Save to Home Screen prompt
- Host Event Calendar
- Host Booking Calendar
- Public events calendar
- Book Demo booking type
- Event page and poster page fixes
- Venue Partner Manager
- Event Templates
- Analytics Dashboard

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
