# BARFLYDATE_v59_20260428_1558

Complete full ZIP build. No patches.

## New in v59 — Splash Animation + Calendar Cleanup + Meet & Mingle Icon
Built from v58.

### Restored animated splash
The splash page now reconnects the animation classes:

- moving neon background
- centered logo glow
- three animated loading dots
- smooth fade-out

The flow remains:

`Animated Splash → Save to Home Screen prompt → Events`

or, after dismissal:

`Animated Splash → Events`

### Meet & Mingle icon updated
The Meet & Mingle icon now uses a custom 3-person icon:

- pink head
- blue head
- purple head

This replaces the plain people emoji.

### Calendar route cleanup
`/calendar` now redirects to `/events` instead of acting like a separate duplicate page.

### Spelling cleanup
Corrected calendar spelling cleanup so the app uses:

`Calendar`

and not old typo versions like Calender or Calnder.

### Preserved from v58
- Meet & Mingle naming
- clean `/events` page
- Today / Week / Month event calendar views
- paid event controls
- booking payment workflow
- QR support

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
