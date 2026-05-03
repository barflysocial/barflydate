# BARFLYDATE_v108_20260503_1340

Complete full ZIP build. No patches.

## v108 — Focused `/games` Page + True 610 × 1080 Iframe Containers
Built from v107.

### `/games`
Removed from the Games page:
- top full-width logo
- Game Dashboard label
- Barfly Games header
- subheader text
- extra card/header padding around the iframe

The Games page now shows only:
- game buttons for saved URLs
- one inline 610 × 1080 iframe container
- full-width Back to Home button at the bottom

### Iframe container correction
The iframe container/panel is now also set to 610 × 1080, not only the iframe inside it.

Applied to:
- `/games` inline iframe
- game iframe modal containers
- `/barfly-tv` iframe container
- `/social-wall` iframe containers

The iframe itself remains 610 × 1080 with internal scrolling disabled.

### Phone behavior
On narrow screens, the full 610 × 1080 frame scales as one unit so the iframe content does not get squeezed into an internally scrolling iframe.

### Preserved from v107
- all iframe URLs still come from `/host → Games / Iframes`
- `/host` no auto-reset fix from v106
- clean Games / Iframes URL form
- 6-icon `/host` admin home
- Barfly TV schedule and empty message
- Social Wall cleanup
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
