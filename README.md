# BARFLYDATE_v109_20260503_1414

Complete full ZIP build. No patches.

## v109 — Games Icons Only + Auto-Fit Social Wall / Barfly TV Iframes
Built from v108.

### `/games`
Changed `/games` to icons only.

Removed:
- inline iframe container
- game iframe display on `/games`
- iframe modal behavior from the Games page

Now `/games` shows only:
- Bingo
- Trivia
- Mystery
- Vote
- Back to Home at the bottom

Each icon opens its saved URL directly.

### `/social-wall`
Kept iframes, but changed them to auto-fit the screen.

Removed:
- top logo
- page header
- subheader text
- bottom icon/nav clutter

Kept:
- iframe content
- Back to Home at the bottom

### `/barfly-tv`
Kept the iframe, but changed it to auto-fit the screen.

Removed:
- top logo
- page header
- subheader text

Kept:
- Barfly TV iframe when a URL exists
- schedule / empty message logic
- Back to Home at the bottom

### Iframe behavior
For `/social-wall` and `/barfly-tv`:
- iframe width is 100%
- iframe height uses available screen height
- no fixed oversized 610px frame
- better phone fit

### Preserved from v108/v106
- host no auto-reset fix
- clean Games / Iframes URL form
- 6-icon `/host` admin home
- `/home` Contact icon
- Barfly TV schedule and empty message
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
