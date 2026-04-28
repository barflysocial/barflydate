# BARFLYDATE_v53_20260428_0608

Complete full ZIP build. No patches.

## New in v53 — Hide Play Nav + Reset Analytics
Built from v52.

### Play hidden from bottom navigation
The **Play** item has been removed from the bottom navigation.

The `/play` page still exists and can still be used as a direct marketing link:

`/play`

Bottom nav now focuses on:
- Events
- Radar
- RSVP
- Check In
- My RSVP

### Reset Analytics button
The Host Analytics section now has:

**Reset Analytics**

This clears only analytics records, including:
- page views
- QR scans
- primary button clicks
- poster views
- caption copies
- booking analytics counts

### Reset does not delete business data
Reset Analytics does **not** delete:
- events
- bookings
- venues
- templates
- games
- RSVPs
- settings

### New host endpoint
Added:

`POST /api/host/analytics/reset`

### Preserved from v52
- QR function fix
- `/play` cleanup
- `/events` public card cleanup
- Barfly Radar naming and `/radar` route
- `/host` blank purple screen fix
- typed Display Event Type field
- Digital Mystery and Digital Escape Room split
- `/join` BARFLY SOCIAL heading
- Gender Identity update
- expanded Sparks/interests
- demo page cleanup
- splash always routes to `/events`
- Host Event Calendar
- Host Booking Calendar
- Public events calendar
- Book Demo booking type

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
