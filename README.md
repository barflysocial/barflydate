# BARFLYDATE_v73_20260429_1657

Complete full ZIP build. No patches.

## New in v73 — Demo Button Order + Events Page RSVP Action Nav
Built from v72.

### `/demo`
Bottom action buttons changed to:
1. Contact
2. View Events Calendar

The Contact button now uses the same primary button style/color as View Events Calendar.

### `/events`
The Events page no longer shows the generic public bottom nav options for:
- This Week’s Events
- RSVP Now

Instead, the Events page now shows RSVP-related actions in this order:
1. My RSVP
2. Check In
3. Change RSVP
4. Cancel

### Behavior
- My RSVP → `/my-rsvp`
- Check In → `/checkin`
- Change RSVP → `/my-rsvp`
- Cancel → `/my-rsvp`

Change RSVP and Cancel route to My RSVP because that is where the user can safely manage or cancel an existing RSVP.

### Preserved from v72
- Request-only booking language
- Simplified demo bottom Contact options
- Share menu with Copy Link / Show QR / Share From Phone
- Volunteering and Running Sparks
- Workday Blackout Bingo and Barfly Putting Simulator hero variants
- Meet & Mingle splash landing
- Venue Hero Template system

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
