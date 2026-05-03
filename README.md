# BARFLYDATE_v111_20260503_1553

Complete full ZIP build. No patches.

## v111 — Host-Controlled Social Wall Iframes
Built from v110.

### `/host → Games / Iframes`
Added two new Social Wall URL fields:

- Social Wall OUTPUT iframe URL
- Social Wall INPUT iframe URL

### `/social-wall`
Removed the hardcoded iframe URLs.

The Social Wall page now pulls from host settings:

- OUTPUT shows as the top iframe when the Output URL is filled.
- INPUT shows as the bottom iframe when the Input URL is filled.
- If either field is blank, that iframe is hidden.
- If both are blank, the page shows a simple message telling the host to add URLs.

### Labels
The iframe cards are labeled:

- OUTPUT
- INPUT

### Preserved from v110
- `/games` removed from public navigation
- game icons moved to `/home`
- `/game/bingo`, `/game/trivia`, `/game/mystery`, `/game/vote`
- auto-fit iframe behavior for focused iframe pages
- consistent home icon button colors
- host no auto-reset fix
- clean Games / Iframes form
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
