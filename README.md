# BARFLYDATE_v49_20260428_0137

Complete full ZIP build. No patches.

## New in v49 — Host Fix + Event Type Controls + Join Updates
Built from v48.

### Fixed `/host` blank purple screen
The host login page no longer references an undefined safety report variable. `/host` should now render the PIN login screen instead of a blank purple page.

### Typed event type display
The host event editor now has:
- Event Category dropdown for app logic/filtering
- Display Event Type text field for custom public wording

Examples:
- Category: Trivia / Display Event Type: 80’s Arcade Trivia
- Category: Bingo / Display Event Type: Workday Blackout Bingo
- Category: Special Event / Display Event Type: Sports Bingo

If Display Event Type is blank, public pages fall back to the category label.

### Digital Mystery and Digital Escape Room separated
Event categories now include:
- Digital Mystery
- Digital Escape Room

They are no longer combined as Mystery / Escape Room.

### `/join` branding and wording
The `/join` page now says:
- BARFLY SOCIAL

The onboarding label now says:
- Gender Identity

Gender identity options are:
- Man
- Woman
- Non-binary
- Prefer not to say

### Sparks/interests expanded
Added:
- Karaoke
- Dancing
- Sports
- Bingo
- Trivia
- Murder Mystery
- Escape Rooms
- Reading
- Working Out
- Pets

### Preserved from v48
- demo page cleanup
- splash centering fix
- splash always routes to `/events`
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
