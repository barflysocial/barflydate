# BARFLYDATE_v95_20260501_0424

Complete full ZIP build. No patches.

## v95 — Fixed Global Bottom Game Bar
Built from v94.

### Fixed
In v94 the global Bingo / Trivia / Mystery / Vote iframe buttons were added, but they were only mounted inside limited page content and could sit below the visible screen.

v95 makes them a true fixed bottom app bar.

### New behavior
The global game iframe buttons now appear fixed at the bottom of public app pages when a URL is saved under:

`/host → Settings → GLOBAL GAME IFRAME BUTTONS`

Buttons:
- 🎱 Bingo
- ❓ Trivia
- 🕵️ Mystery
- 🗳️ Vote

Blank URLs still hide that button.

### Public pages with the global game bar
The fixed global game bar is mounted on public pages such as:

- `/events`
- `/events/:slug`
- `/demo`
- `/social-wall`
- `/rsvp`
- `/checkin`
- `/my-rsvp`
- `/forecast`
- `/book`
- `/join`
- `/qr`

It is not mounted on host/cohost/player/admin gameplay pages.

### RSVP bar remains separate
The RSVP action bar still only shows on `/events` when the selected day has a true Meet & Mingle RSVP event:

- My RSVP
- Change RSVP
- Check In
- Cancel

When both bars are visible, RSVP appears above the global game bar.

### Preserved from v94
- Global game iframe settings under Host Settings
- Removed event-specific iframe fields from Create Event
- Social Wall page
- logo fill on `/events` and `/demo`
- shared public event button rules
- Brand Locked Event Builder baseline
- unified Create Event flow
- delete confirmations and success messages

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
