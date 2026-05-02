# BARFLYDATE_v100_20260502_1313

Complete full ZIP build. No patches.

## v100 — App Home Screen + Games Dashboard + Barfly TV
Built from v99.

### New flow
`/` now opens the splash screen and then sends users to:

`/home`

### New `/home`
Added an app-style home screen with full-width logo and icon grid:

- Events
- Social Wall
- Games
- Barfly TV
- My RSVP
- Check In

### New `/games`
Added a Game Dashboard page. Bingo, Trivia, Mystery, and Vote now live on `/games` instead of the bottom of every public page.

The iframe URLs still come from:

`/host → Settings → GLOBAL GAME IFRAME BUTTONS`

### New `/barfly-tv`
Added a Barfly TV page and host setting:

`Barfly TV iframe / video URL`

If no URL is saved, the page shows a coming soon message.

### Removed bottom clutter
Removed from public pages:

- global Bingo/Trivia/Mystery/Vote bottom bar
- bottom RSVP bar on `/events`

RSVP management now stays on:

`/my-rsvp`

### Public page navigation
Public subpages now include a Back to Home button.

### Preserved from v99
- full-width public logos
- Hero Variant removed
- Venue Logo URL hidden
- Hero Image URL remains
- No Hero Graphic remains
- saved hero preview gallery remains
- event-specific buttons remain
- Social Wall remains

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
