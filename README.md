# BARFLYDATE_v114_20260503_1945

Complete full ZIP build. No patches.

## v114 — Events Home Button + Host-Controlled Home Icon Popup
Built from v113.

### `/events`
Added a Home button to the Events page.

### `/social-wall`
Moved the Home button to the top on `/social-wall` only so it does not block the bottom iframe view.

### Host-controlled popup on Home icon clicks
Added a new host setting section:

`/host → App Settings → APP ICON CLICK POPUP`

Host can now control a popup that appears when any icon on `/home` is clicked.

Settings added:
- Popup Active
- Popup Title
- Popup Image URL
- Popup Message
- Button Text

Behavior:
- If active, the popup appears every time a guest taps any Home dashboard icon.
- Continue sends the guest to the icon they originally clicked.
- Cancel closes the popup and keeps them on `/home`.

### Preserved from v113
- Option 1 Social Wall service support
- Social Wall OUTPUT / INPUT iframe URL fields
- Karaoke URL and Jobs URL
- conditional Karaoke and Jobs icons on `/home`
- Instagram icon on `/home`
- focused game iframe pages
- host no auto-reset fix
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
