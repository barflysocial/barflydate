# BARFLYDATE_v80_20260430_0346

Complete full ZIP build. No patches.

## New in v80 — Event Types, Multi-Day Events, Co-Host QR, Mobile Hero Fixes
Built from v79.

### Event Templates hidden
Event Templates are hidden from `/host`.

Removed from the visible workflow:
- Event Template Manager
- Use Template dropdown in Add/Edit Event

Quick Event Builder presets now remain the main way to start an event.

### Manage Event Types
Added **Event Type Manager** under:

`/host → Events & Calendar`

You can add or delete custom event types such as:
- Latino Bingo
- Battle Karaoke
- Music Trivia
- Professional Networking
- Barfly Putting Simulator

Custom event types appear in Quick Event Builder and auto-fill the event display name, base event category, and suggested hero variant.

### Multiple event days
Add/Edit Event now supports multiple recurring days.

Use checkboxes for:
- Sunday
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday

Example: select Monday–Friday once for a daily weekday event.

### Venue Hero Template starts blank
Create Venue Hero Template no longer pre-fills Brickyard South or Karaoke.

The form now starts neutral:
- Venue: blank
- Hero Variant: blank
- Hero Image URL: blank
- Hero Fit: Cover
- Active: Yes
- Notes: blank

### Mobile hero template fixes
Saved hero template rows now stack better on phones:
- preview image full width
- long URLs wrap instead of overflowing
- Edit / Delete Hero buttons full width
- Hero Template Gallery becomes one column on small screens

### Co-Host QR Code
Added `/qr/cohost`.

QR tools now include:
- Co-Host QR

The QR opens `/cohost`.

### Preserved from v79
- Co-Host Dashboard
- Guided Host Flows
- Host Open / Close section labels
- Full-width public logo/header
- Demo QR button
- Hero Template Gallery
- Hero Fit: Cover / Contain
- Canva URL warnings
- Save confirmation banners

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
