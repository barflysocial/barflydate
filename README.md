# BARFLYDATE_v56_20260428_1430

Complete full ZIP build. No patches.

## New in v56 — Cleaner Events Calendar Views
Built from v55.

### Three calendar view buttons
The public `/events` calendar now has:

- Today
- Week
- Month

### Today is default
When the Events page opens, it defaults to **Today**.

Today view shows:
- today's date
- today's events only
- “No events listed for today” if there are none

### Week view
The **Week** button shows the current week only.

Users tap a day to reveal events for that date.

### Month view
The **Month** button shows the current month calendar.

Users tap a date to reveal events for that date.

### Less clutter
Removed the public “Show All Events” behavior from the `/events` calendar.

Events stay hidden until a date is selected in Week or Month view.

### Preserved from v55
- Paid Event / Ticketed Event toggle
- Ticket Price and Payment Link
- Public Buy Ticket behavior
- Booking payment/deposit workflow
- image field helper notes
- Play hidden from bottom navigation
- Reset Analytics button
- QR function fix
- `/play` cleanup
- `/events` public card cleanup
- Barfly Radar naming and `/radar` route
- Host Event Calendar
- Host Booking Calendar
- Public events calendar
- Book Demo booking type

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
