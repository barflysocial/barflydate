# BARFLYDATE_v105_20260502_2103

Complete full ZIP build. No patches.

## v105 — Fix Games / Iframes URL Editing
Built from corrected v104.

### Fixed
The Games / Iframes settings panel was rebuilt as a clean standalone form so iframe URL fields can be typed or pasted normally.

### Changes
- Removed the live game-button preview from directly under the iframe URL fields.
- Removed duplicate iframe fields from App Settings to avoid confusion.
- Games / Iframes now has one clear place to edit iframe URLs:
  `/host → Games / Iframes`
- Save and Cancel are section-specific:
  - Save Games / Iframes
  - Cancel
- URL cleanup on save:
  - `games.barfly.social/bingo` becomes `https://games.barfly.social/bingo`
  - `http://...` is converted to `https://...`

### Also preserved/fixed
- Kept v104 host 6-icon admin home.
- Kept Barfly TV empty schedule message.
- Kept `/home` Contact icon.
- Kept `/social-wall` cleanup.
- Kept corrected `totalOpenReports` declaration count inside HostManager.

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
