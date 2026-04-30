# BARFLYDATE_v78_20260430_0012

Complete full ZIP build. No patches.

## New in v78 — Hero Template Gallery + Hero Fit
Built from v77.

### Hero Template Gallery
Add/Edit Event now includes a **Hero Template Gallery** inside the Quick Event Builder.

Saved hero templates appear as preview cards with:
- hero image preview
- venue name
- hero variant
- fit mode

Clicking a hero preview automatically fills:
- Venue
- Hero Variant
- Hero Image URL
- Hero Fit

### Hero Fit
Added Hero Fit support:

- **Cover / Fill Box** — best for 4:5 hero graphics
- **Contain / Show Full Image** — best when logos or text are being cropped

Hero Fit is available in:
- Venue Hero Template Manager
- Add/Edit Event advanced hero settings
- Hero Graphic Preview
- Public event hero display

### Canva link warning
Hero Image URL fields now warn when a Canva link or non-direct image URL is used.

The app needs a direct image file path or URL, such as:
- `/heroes/urban-daiquiris/workday-blackout-bingo.png`
- `https://example.com/image.png`

Canva design links are web pages and usually will not display as hero graphics.

### Preserved from v77
- Save confirmation banners
- Hero Graphic Preview
- Poster feature removed from workflow
- Booking Requests by Date calendar hidden
- Venue Hero Template Manager with Delete Hero
- Optional Meet & Mingle session creation/update

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
