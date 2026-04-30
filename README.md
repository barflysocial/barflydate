# BARFLYDATE_v79_20260430_0256

Complete full ZIP build. No patches.

## New in v79 — Guided Host Flows + Co-Host Dashboard
Built from v78.

### Guided Host Flows
The `/host` Command Center is now a guided action launcher:

- Create Event
- Add Venue
- Create Hero Graphic
- Quick Social Mixer
- Generate QR Code
- Review Requests
- Update Settings
- Co-Host Dashboard

Each action opens the correct collapsed section and guides the host to the next tool.

### Host section Open / Close labels
The collapsible `/host` sections now change the control text:
- Closed = Open
- Expanded = Close

### Co-Host Dashboard
Added a new `/cohost` page for running only the live social mixer.

Co-host can:
- Enter a separate Co-Host PIN
- Choose an active session
- View session code, status, phase, RSVPs, checked-in count, players
- Check guests in from RSVP list
- Mark no-show
- Cancel RSVP before check-in
- View meeting zones and drink special
- Start / pause / resume / advance / end the session
- View safety reports
- Remove checked-in players

Co-host does **not** see business settings, event creation, hero templates, analytics, backup, booking calendar, or full host admin tools.

Default server env:
- `HOST_PIN=2468`
- `COHOST_PIN=1357`

### `/demo`
Bottom buttons now show:
- Contact
- View Events Calendar
- QR Code

QR Code opens `/qr/demo`.

### Full-width public logo/header
The top public logo/header now uses the full app width and scales the logo larger while keeping it proportional.

### Preserved from v78
- Hero Template Gallery
- Hero Fit: Cover / Contain
- Canva URL warning
- Save confirmation banners
- Poster removed from workflow
- Booking Requests by Date calendar hidden
- Venue Hero Template Manager with Delete Hero
- Optional Meet & Mingle session linking

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
