# BARFLYDATE_v89_20260430_1720

Complete full ZIP build. No patches.

## v89 — Stronger Logo Fill on `/events` and `/demo`
Built from v88.

### Changed
The top Barfly logo/header on these pages now fills the container more aggressively:

- `/events`
- `/demo`

### CSS behavior
The public brand header now:

- uses full container width
- removes extra padding
- hides the small tagline under the logo on `/events` and `/demo`
- gives the logo/header a fixed responsive height
- uses `object-fit: cover`
- slightly scales the logo image so it fills the container instead of sitting small inside it

### Preserved from v88
- Shared public event button rules
- Bottom RSVP nav only when a Meet & Mingle RSVP event is scheduled today
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
