# BARFLYDATE_v74_20260429_1737

Complete full ZIP build. No patches.

## New in v74 — Event + Optional Meet & Mingle Session
Built from v73.

### `/events`
Removed the month-view helper text:
- “Tap a date to view events.”

### `/host` Command Center
Hidden these quick-action buttons:
- Booking Calendar
- Booking List

The tools are still available inside the collapsible Events & Calendar section.

### Event editor now includes Meet & Mingle
Add/Edit Event now has:

- Enable Meet & Mingle for this event
- Session length: 30 / 60 / 90
- Max RSVPs
- Max Check-ins
- Meeting point mode
- Meeting zones
- Drink special title/details/window/restrictions

Default is enabled.

### Save behavior
When Meet & Mingle is enabled, saving the event also creates or updates a linked Meet & Mingle session.

The public event card can route to:
- `/rsvp?gameId=<linked session id>`

When Meet & Mingle is disabled, the event behaves like a normal event listing.

### Quick session tool renamed
Renamed:
- Create New Meet & Mingle Session

to:
- Quick Create Meet & Mingle Session

This keeps a fallback for creating a session without creating a public event.

### Preserved from v73
- `/demo` button order
- Events page RSVP action nav
- Request-only booking language
- Share menu
- Venue Hero Template system

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
