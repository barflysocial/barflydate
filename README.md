# BARFLYDATE_v110_20260503_1524

Complete full ZIP build. No patches.

## v110 — Remove `/games`, Move Game Icons to Home, Add Focused Game Iframe Pages
Built from v109.

### Removed `/games`
The separate `/games` launcher page has been removed from public navigation.

If someone opens `/games`, it redirects to `/home`.

### `/home`
Moved the game icons directly onto the Home screen:

- Bingo
- Trivia
- Mystery
- Vote

The game icons only show when their URLs are saved under:

`/host → Games / Iframes`

Home screen icons now include:

- Events
- Social Wall
- Barfly TV
- My RSVP
- Contact
- Bingo
- Trivia
- Mystery
- Vote

### New game iframe pages
Each game icon opens a focused iframe page:

- `/game/bingo`
- `/game/trivia`
- `/game/mystery`
- `/game/vote`

Each page matches the `/social-wall` and `/barfly-tv` behavior:

- no logo header
- no page title
- no subheading
- auto-fit iframe
- Back to Home button at the bottom

### Home button color update
All Home icon buttons now use the same action-button color scheme for a consistent look.

### Preserved from v109/v106
- `/social-wall` auto-fit iframe behavior
- `/barfly-tv` auto-fit iframe behavior
- host no auto-reset fix
- clean Games / Iframes URL form
- 6-icon `/host` admin home
- Barfly TV schedule and empty message
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
