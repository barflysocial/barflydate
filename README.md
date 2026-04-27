# BARFLYDATE_v45_20260427_2215

Complete full ZIP build. No patches.

## New in v45 — Splash Always Goes to Events
Built from v44.

### Splash destination locked
The splash screen now always sends users to:

`/events`

Flow:

- First visit: `Splash → Save to Home Screen prompt → Events`
- Later visits after dismissal: `Splash → Events`

### Homepage destination setting removed from Host Settings
The Host Settings dropdown for **Homepage After Splash** has been removed from the interface so the splash page cannot accidentally route users to Booking, Play Online, Demo, or Forecast.

### Preserved from v44
- Host Event Calendar
- Host Booking Calendar
- Booking status color markers
- Tappable public events calendar
- Book Demo booking type
- Event page blank screen fix
- Poster page blank screen fix
- Venue Partner Manager
- Event Templates
- Save to Home Screen Guide
- Analytics Dashboard

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
