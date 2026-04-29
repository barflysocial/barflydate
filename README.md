# BARFLYDATE_v75_20260429_1806

Complete full ZIP build. No patches.

## New in v75 — User-Friendly Add Event Builder
Built from v74.

### Guided Quick Event Builder
`/host → Events & Calendar → Add/Edit Event` now starts with a cleaner guided setup:

1. Choose event type preset
2. Choose saved venue
3. Set date and time
4. Confirm hero and Meet & Mingle
5. Save Event / Save Event + Session

### Presets added
- Workday Blackout Bingo
- Karaoke Night
- General Trivia
- Music Bingo
- Mystery Trivia
- Digital Escape Room
- Barfly Putting Simulator
- Professional Networking

Selecting a preset auto-fills:
- Event title
- Event type
- Display name
- Hero variant
- Poster template
- Description
- Prize/special
- Button text
- Meet & Mingle default
- Session length

### Saved Venue improvements
The Saved Venue dropdown now auto-fills:
- venue name
- location
- venue logo
- default prize rules
- default play link
- default notes

It also attempts to find the matching venue hero automatically.

### Advanced Event Details collapsed
The old full event form is still available under:

`Advanced Event Details`

This keeps all advanced tools available without overwhelming the host.

### Plain-language labels
Updated advanced labels:
- Event Category → Event Type
- Display Event Type → Display Name
- Location → Address / City
- Prize / Special → Prize or Special
- Primary Button Name → Button Text
- Primary Button Link → Button Link

### Preserved from v74
- Optional Meet & Mingle session on events
- Auto-linked Meet & Mingle session creation/update
- Command Center hides Booking Calendar and Booking List
- Month calendar helper text removed
- Venue Hero Template system
- Share menu
- Request-only booking language

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
