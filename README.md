# BARFLYDATE_v46_20260427_2227

Complete full ZIP build. No patches.

## New in v46 — Splash Logo Fix
Built from v45.

### Fixed broken splash logo
The splash screen logo path has been corrected from:

`/brand/barfly-social-dragonfly.png`

to:

`/barfly-social-splash.png`

### Fixed save-to-home-screen prompt layout
The post-splash save-to-home-screen prompt has been adjusted so it stays centered and does not clip off the side of the screen.

Layout improvements:
- max-width for prompt card
- centered margins
- mobile-safe padding
- horizontal overflow prevention
- stacked buttons on small screens

### Preserved from v45
- Splash always routes to `/events`
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
