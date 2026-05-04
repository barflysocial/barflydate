# BARFLYDATE_v115_20260504_0137

Complete full ZIP build. No patches.

## v115 — Karaoke Opens in the Same Iframe Style as Other Games
Built from v114.

### `/home`
Updated the Karaoke icon.

Before:
- Karaoke opened the saved URL directly.

Now:
- Karaoke opens `/game/karaoke`
- `/game/karaoke` displays the saved Karaoke URL inside the same auto-fit iframe layout used by Bingo, Trivia, Mystery, and Vote.
- The Back to Home button stays at the bottom.

### Hide rule preserved
The Karaoke icon only appears on `/home` when a Karaoke URL is saved in:

`/host → Games / Iframes → Karaoke URL`

If Karaoke URL is blank, the Karaoke icon stays hidden.

### Preserved from v114
- `/events` Home button
- `/social-wall` Home button at the top
- host-controlled Home icon popup
- Option 1 Social Wall service support
- Social Wall OUTPUT / INPUT iframe URL fields
- Jobs icon hide/show by URL
- Instagram icon on `/home`
- host no auto-reset fix
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
