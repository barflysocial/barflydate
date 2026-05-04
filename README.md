# BARFLYDATE_v117_20260504_0504

Complete full ZIP build. No patches.

## v117 — Hero Photos Auto-Fit Inside Hero Containers
Built from v116.

### Fixed
Hero photos now auto-fit inside their hero containers.

### Behavior
Event hero photos now:
- fill the hero container
- stay centered
- do not stretch
- do not overflow outside the container
- crop cleanly when the source image shape does not match the hero box

### CSS behavior
Event/hero images use:
- `object-fit: cover`
- `object-position: center`
- `background-size: cover`
- `background-position: center`

### Preserved from v116
- Karaoke opens external link when URL exists
- `/karaoke` fallback message when no Karaoke URL exists
- other game iframe pages still work
- `/events` Home button
- `/social-wall` Home button at the top
- host-controlled Home icon popup
- Jobs icon hide/show by URL
- Social Wall OUTPUT / INPUT iframe fields
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
