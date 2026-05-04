# BARFLYDATE_v116_20260504_0322

Complete full ZIP build. No patches.

## v116 — Karaoke Opens External Link + Calendar Fallback
Built from v115.

### Karaoke behavior changed
Karaoke no longer opens inside an iframe.

If a Karaoke URL is saved:
- `/home → Karaoke` opens the external Karaoke link directly.

If no Karaoke URL is saved:
- `/home → Karaoke` opens `/karaoke`
- `/karaoke` shows: `Check the calendar for upcoming karaoke events.`

The fallback page includes:
- View Events Calendar
- Back to Home

### Old route handled
`/game/karaoke` now redirects to `/karaoke`.

### Preserved
- Other game iframe pages still work: `/game/bingo`, `/game/trivia`, `/game/mystery`, `/game/vote`
- `/events` Home button
- `/social-wall` Home button at the top
- host-controlled Home icon popup
- Jobs icon hide/show by URL
- Social Wall OUTPUT / INPUT iframe fields
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
