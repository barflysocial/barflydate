# BARFLYDATE_v87_20260430_1640

Complete full ZIP build. No patches.

## v87 — Root Splash + Events Page Stability
Built from v86.

### Fixed `/`
The root route now stays simple and stable:

`/ → Splash page with locked Barfly logo → one-sentence Home Screen tip → /events`

The splash still uses the locked Barfly splash artwork:

`/barfly-social-splash.png`

### Fixed splash redirect
Changed the post-splash redirect from:

`/radar`

to:

`/events`

### Simplified Home Screen popup
Removed the old multi-step tutorial flow from the splash page.

The new popup is one sentence:

`Add Barfly Social to your Home Screen from your browser’s share or menu button for faster access.`

The only button is:

`OK`

### Fixed `/events` loading crash
`/events` was crashing because `EventsCalendar` used:

`<EventsPromoPopup settings={settings} />`

without defining `settings`.

Added:

`const settings = usePublicSettings();`

inside `EventsCalendar`.

### Preserved from v86
- Brand Locked Event Builder baseline
- Online Game badge logic fix
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
