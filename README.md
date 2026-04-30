# BARFLYDATE_v86_20260430_1544

Complete full ZIP build. No patches.

## v86 — Online Game Badge Logic Fix
Built from v85.

### Fixed
Events no longer show **ONLINE GAME** just because the event type is:

- Bingo
- Trivia
- Music Bingo
- Mystery
- Escape Room

Events also no longer show **ONLINE GAME** just because the button link contains a game URL.

### New rule
The **ONLINE GAME** badge only appears when:

`Online Only = true`

### Result
Live venue events with digital support now display correctly as:

- LIVE EVENT
- BARFLY SOCIAL
- PRIVATE EVENT
- TICKETED EVENT behavior when applicable

This prevents in-person Bingo, Trivia, Karaoke, and combo events from being mislabeled as online.

### Preserved from v85
- Brand Locked Event Builder baseline
- Cleaned `/events/:slug` event detail buttons
- Unified Create Event flow
- Multiple event types
- Blank create form behavior
- Save venue / save hero / save quick setup options
- Mixer Goal for Meet & Mingle
- No Hero Graphic option
- Co-Host Dashboard and QR
- Hero Template Gallery
- Hero Fit Cover / Contain
- Canva URL warnings
- Delete confirmations and success messages

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
