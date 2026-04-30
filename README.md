# BARFLYDATE_v91_20260430_1828

Complete full ZIP build. No patches.

## v91 — Social Wall Page + Camera Button on Events
Built from v90.

### New page
Added:

`/social-wall`

The Social Wall page includes two responsive iframe panels:

1. `https://games.barfly.social/BARFLYSOCIAL`
2. `https://games.barfly.social/`

The frames appear side-by-side on desktop and stack vertically on phones.

### Event camera button
Added a camera-style button next to Share on event cards/details:

`📸 Social Wall`

This opens:

`/social-wall`

and passes the event title as a query parameter.

### Note
The first URL was converted from `http://games.barfly.social/BARFLYSOCIAL` to:

`https://games.barfly.social/BARFLYSOCIAL`

to avoid browser mixed-content blocking when the app is served over HTTPS.

### Preserved from v90
- RSVP bottom nav only shows when selected day has a true Meet & Mingle RSVP event
- RSVP nav button order: My RSVP, Change RSVP, Check In, Cancel
- Stronger logo fill on `/events` and `/demo`
- Shared public event button rules
- `/` splash → one-sentence Home Screen tip → `/events`
- Brand Locked Event Builder baseline
- Online Game badge logic fix
- Unified Create Event flow
- Multiple event types
- Blank create form behavior
- Mixer Goal for Meet & Mingle
- No Hero Graphic option
- Co-Host Dashboard and QR
- Delete confirmations and success messages

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
