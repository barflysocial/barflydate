# BARFLYDATE_v64_20260428_2316

Complete full ZIP build. No patches.

## New in v64 — Events Week Default + Collapsed Host Sections
Built from v63.

### Public `/events` calendar
The Events page now uses only:

- Week
- Month

Removed:

- Today button

Default view is now:

- Week

Week opens with today selected so users immediately see today’s events if any are scheduled.

### Host dashboard cleanup
The `/host` page now uses collapsed sections to reduce scrolling.

All sections are collapsed by default.

Sections added:
- Gameplay
- Events & Calendar
- Marketing
- Business
- Settings

### Grouping
Gameplay includes:
- Host run of show
- Create Social Session
- Test Mode
- Active Games

Events & Calendar includes:
- Event Calendar
- Booking Calendar
- Booking List
- Add/Edit Events

Marketing includes:
- Poster Builder
- Event Templates
- QR tools

Business includes:
- Venue Partner Manager
- Analytics
- Export Backup

Settings includes:
- Host/Public settings

### Preserved from v63
- Poster Builder preview under form
- Bundled template backgrounds
- Dynamic poster overlay system
- Paid events and booking payment workflow

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
