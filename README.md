# BARFLYDATE_v113_20260503_1844

Complete full ZIP build. No patches.

## v113 — Option 1 Instagram Social Wall + Karaoke and Jobs Icons
Built from v112.

### Option 1: Instagram Social Wall Service
The app is set up for Option 1:

Use a social wall service that pulls Instagram posts by hashtag/account, then paste that service display URL into:

`/host → Games / Iframes → Social Wall OUTPUT iframe URL`

The existing Social Wall behavior remains:

- OUTPUT iframe shows only when an Output URL is filled.
- INPUT iframe shows only when an Input URL is filled.
- Blank fields hide that iframe.

### New `/host → Games / Iframes` fields
Added:

- Karaoke URL
- Jobs URL

### `/home`
Added conditional dashboard icons:

- Karaoke
- Jobs

Behavior:

- If Karaoke URL is filled → Karaoke icon appears on `/home`
- If Karaoke URL is blank → Karaoke icon is hidden
- If Jobs URL is filled → Jobs icon appears on `/home`
- If Jobs URL is blank → Jobs icon is hidden

### Preserved from v112
- Instagram icon on `/home`
- Social Wall OUTPUT / INPUT iframe URL fields
- `/social-wall` pulls iframe URLs from host settings
- game icons on `/home`
- focused game iframe pages
- consistent Home button colors
- host no auto-reset fix
- clean Games / Iframes form
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
