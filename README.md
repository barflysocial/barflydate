# BARFLYDATE_v90_20260430_1748

Complete full ZIP build. No patches.

## v90 — RSVP Bottom Nav Selected-Day Fix
Built from v89.

### Fixed RSVP bottom nav visibility
The bottom RSVP action nav now shows only when the **selected day** on `/events` has a true Meet & Mingle RSVP event.

A true RSVP event must have:

`meetMingleEnabled === true`

and

`meetMingleGameId`

### Hidden when not relevant
The bottom RSVP nav is hidden when the selected day has:

- no events
- only regular live events
- only paid events
- only online-only events
- no true Meet & Mingle RSVP session

### Correct RSVP button order
When the bottom RSVP nav does show, the order is now:

1. My RSVP
2. Change RSVP
3. Check In
4. Cancel

### Preserved from v89
- Stronger logo fill on `/events` and `/demo`
- Shared public event button rules
- `/` splash → one-sentence Home Screen tip → `/events`
- `/events` loading crash fix
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
