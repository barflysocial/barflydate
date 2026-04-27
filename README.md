# BARFLYDATE_v30_20260427_0546

Complete full ZIP build. No patches.

## New in v30 — Event Sharing + Promo Tools
Built from v29.

### Individual event pages
New route:
- `/events/:slug`

Each event page includes:
- title, venue, date/time
- prize/special
- event QR
- share button
- interest / going buttons
- add to Google Calendar
- download `.ics`

### Event sharing tools
- Share button on event cards
- Event QR pages: `/qr/event/:slug`
- Event public paths shown in host calendar manager

### Featured event landing page
New routes:
- `/tonight`
- `/this-week`

Designed for Instagram story links and quick promotion.

### Venue pages
New route:
- `/venue/:venue-slug`

Shows all listed Barfly events for a venue.

### Interest / going counts
Events now track:
- interested
- going

### Preserved from v29
- Public events calendar
- Host calendar manager
- Weekly recurring events
- QR display pages
- Business launch tools
- Business report
- Splash page
- RSVP-only flow
- Capacity tools
- Meeting zones
- Drink specials

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.

