# BARFLYDATE_v55_20260428_1409

Complete full ZIP build. No patches.

## New in v55 — Paid Events + Booking Deposits
Built from v54.

### Paid event controls
The host event editor now includes a Monetization section:

- Paid Event / Ticketed Event toggle
- Ticket Price
- Payment / Ticket Link

For paid events, the public primary button becomes **Buy Ticket** unless you type a custom Primary Button Name.

### Public paid event display
Public event cards and event pages can now show the ticket price.

Examples:
- $10
- $15/team
- Free with purchase

### Booking payment workflow
Host booking requests now include payment/invoice fields:

- Estimated Price
- Deposit Required
- Deposit Paid
- Balance Due
- Invoice Status
- Payment Link
- Payment Notes

Invoice status options:
- Not Sent
- Sent
- Deposit Paid
- Paid
- Waived

### Booking budget field
The public booking form now includes optional:

- Budget Range

### Booking payment endpoint
Added:

`POST /api/host/bookings/:bookingId/payment`

### Booking CSV export updated
Booking CSV export now includes the new payment/deposit/invoice fields.

### Preserved from v54
- image field helper notes
- Play hidden from bottom navigation
- Reset Analytics button
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
