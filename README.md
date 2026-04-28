# BARFLYDATE_v57_20260428_1508

Complete full ZIP build. No patches.

## New in v57 — Cleaner `/events` page
Built from v56.

### Removed top buttons from `/events`
The public `/events` page no longer shows:

- Play Online
- Barfly Radar
- Show Events QR

### Why
This keeps `/events` focused on the calendar only:

- Today
- Week
- Month
- tap a date
- view that day’s events

### Radar stays on Barfly Social flow
Barfly Radar should appear only where it fits the Barfly Social experience, such as:

- Barfly Social event pages
- RSVP flow
- social/mixer-specific pages

### Preserved from v56
- Today / Week / Month calendar views
- Today shown by default
- events hidden until a date is picked in Week/Month
- paid event controls
- booking payment workflow
- image field helper notes
- Play hidden from bottom navigation
- Reset Analytics button
- QR function fix

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
