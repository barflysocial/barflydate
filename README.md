# BARFLYDATE_v48_20260428_0019

Complete full ZIP build. No patches.

## New in v48 — Demo Page Cleanup
Built from v47.

### Removed confusing demo-page buttons
Removed from `/demo` and `/business-demo`:

- Show Business QR
- Show RSVP QR
- View Customer Forecast
- Host Login

QR tools and host login remain available from the host/admin areas where they belong.

### Removed repeated written contact info
Removed the written-out contact grid from the demo page:

- Contact name
- Phone
- Email

The demo page now relies on the clickable contact/action buttons instead.

### Demo page now focuses on public sales actions
The demo contact area now keeps clean public actions such as:

- Book an Event
- Website
- Games
- Instagram
- Call
- Email
- Request Event Booking
- View Events Calendar

### Preserved from v47
- splash centering fix
- splash logo fit fix
- splash always routes to `/events`
- Save to Home Screen prompt
- Host Event Calendar
- Host Booking Calendar
- Public events calendar
- Book Demo booking type
- Event page and poster page fixes
- Venue Partner Manager
- Event Templates
- Analytics Dashboard

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
