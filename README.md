# BARFLYDATE_v93_20260501_0320

Complete full ZIP build. No patches.

## v93 — Per-Event Game Iframes + Bottom Game Icon Bar
Built from v92.

### Social Wall iframe scrolling
Updated `/social-wall` iframes with:

- `scrolling="no"`
- hidden iframe overflow styles
- hidden scrollbar styling

This hides visible vertical iframe scrollbars from the Barfly page. If the embedded site still scrolls internally, that embedded page also needs its own `overflow:hidden` styling.

### Per-event iframe settings
The event builder now has fields for event-specific iframe URLs:

- Social Wall iframe URL
- Bingo iframe URL
- Trivia iframe URL
- Mystery iframe URL
- Vote iframe URL

Blank fields hide that icon.

### Event buttons
Event cards and event detail pages now support:

- 📸 Social Wall button next to Share when a Social Wall iframe URL is set
- Bottom game icon bar for:
  - 🎱 Bingo
  - ❓ Trivia
  - 🕵️ Mystery
  - 🗳️ Vote

Each configured button opens an iframe panel inside the Barfly app.

### RSVP bottom nav rule preserved
The RSVP action nav is still separate and still only shows when the selected day has a true Meet & Mingle RSVP event:

- My RSVP
- Change RSVP
- Check In
- Cancel

The new game icon bar does not affect that RSVP rule.

### Preserved from v92
- `/social-wall`
- RSVP bottom nav selected-day logic
- RSVP button order
- Logo fill on `/events` and `/demo`
- Shared public event button rules
- Brand Locked Event Builder baseline
- Unified Create Event flow
- Multiple event types
- No Hero Graphic option
- Co-Host Dashboard and QR
- Delete confirmations and success messages

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
