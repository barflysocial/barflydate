# BARFLYDATE_v76_20260429_1829

Complete full ZIP build. No patches.

## New in v76 — Save Event Fix + Radar Linked Event Details
Built from v75.

### Fixed event save bug
Fixed the server-side venue hero lookup bug that could cause:

`Could not save event`

The server was calling `slugifyText`, which only existed on the client side. It now uses the server-safe `slugifyEvent` helper.

### `/radar` / Meet & Mingle improvement
Linked events now pass more information into the Meet & Mingle session feed:

- linked event title
- venue name
- event day
- event start/end time
- public event page link

The Radar/Meet & Mingle card now shows the event title first and includes a **View Event** button when the session is linked to a public event.

### Preserved from v75
- Quick Event Builder
- Presets
- Advanced Event Details
- Optional Meet & Mingle session creation/update
- Venue Hero Template system
- Events page RSVP action nav

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
