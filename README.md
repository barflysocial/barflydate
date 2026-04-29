# BARFLYDATE_v72_20260429_1618

Complete full ZIP build. No patches.

## New in v72 — Request-Only Booking + Simplified Demo Actions
Built from v71.

### `/book` request-only wording
Changed booking language to request language only:
- Book an Event → Request an Event
- Request Event Booking → Request an Event
- Send Booking Request → Send Request
- Success message now says: Request received. We’ll follow up soon to confirm details.

The `/book` page now behaves as an inquiry/request form, not a confirmed booking flow.

### `/demo` top buttons removed
Removed the top button row from the demo hero.

Removed:
- Request Event Booking
- View Events Calendar
- See How It Works
- Start Demo Walkthrough

The top now introduces the demo cleanly without action buttons.

### `/demo` bottom actions simplified
The bottom of `/demo` now only has:
- View Events Calendar
- Contact

The Contact button opens:
- Call
- Email

All other bottom buttons were removed.

### Preserved from v71
- Share menu with Copy Link / Show QR / Share From Phone
- Volunteering and Running Sparks
- Workday Blackout Bingo and Barfly Putting Simulator hero variants
- Meet & Mingle splash landing
- Public nav flow
- Venue Hero Template system

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
