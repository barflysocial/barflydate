# BARFLYDATE_v107_20260503_1318

Complete full ZIP build. No patches.

## v107 — Universal 610 × 1080 Iframe Size
Built from v106.

### Changed
All app iframe displays now target a 610 × 1080 vertical mobile frame.

Applied to:
- `/games` iframe popups
- `/barfly-tv` iframe
- `/social-wall` iframes
- any app iframe modal opened from game buttons

### Behavior
Desktop/tablet:
- iframe frame targets `610px × 1080px`

Phone:
- iframe scales to fit screen width
- keeps the 610:1080 vertical ratio as much as possible
- avoids horizontal overflow

### Preserved from v106
- `/host` no longer auto-refreshes every 4 seconds
- stable host section panels
- clean Games / Iframes URL form
- 6-icon `/host` admin home
- `/home` Contact icon
- `/barfly-tv` schedule and empty message
- `/social-wall` cleanup
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
