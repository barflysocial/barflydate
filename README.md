# BARFLYDATE_v83_20260430_1314

Complete full ZIP build. No patches.

## New in v83 — Delete Confirmations + Success Messages
Built from v82.

### Standardized delete behavior
All visible delete/remove actions now follow the same pattern:

1. Click delete/remove/cancel/no-show
2. Confirmation prompt appears
3. Action runs only after confirmation
4. Success confirmation appears after completion

### Updated delete/remove actions
Standardized:

- Delete Venue
- Delete Hero Template
- Delete Event
- Delete Event Type
- Delete Session
- Delete saved Quick Setup / Event Template
- Cancel RSVP
- Mark No-Show
- Mark all open RSVPs as No-Show
- Remove Player from host dashboard
- Remove Player from co-host dashboard
- Co-host RSVP Cancel / No-Show
- Co-host End Session confirmation

### Event deletion with linked Meet & Mingle
If an event has a linked Meet & Mingle session, the delete confirmation now says:

`Delete this event and unlink its Meet & Mingle session?`

After deletion, the linked session is unlinked from the deleted event instead of leaving stale event references.

### Event action buttons fixed
The event list now includes working functions for:

- Duplicate
- Next Week
- Delete Event

Each shows a success confirmation after completion.

### Preserved from v82
- Unified Create Event flow
- Multiple event types
- Blank create form behavior
- Save venue / save hero / save quick setup options
- Mixer Goal for Meet & Mingle
- Hidden booking requests from `/host`
- No Hero Graphic option
- Co-Host Dashboard and QR
- Hero Template Gallery
- Hero Fit Cover / Contain
- Canva URL warnings
- Save confirmation banners

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
