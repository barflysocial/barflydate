# BARFLYDATE_v98_20260501_1326

Complete full ZIP build. No patches.

## v98 — Full-Width Logo on Public Pages
Built from v97.

### Changed
All public-facing pages that use the Barfly public header now use the same full-width top logo treatment.

This includes:

- `/events`
- `/events/:slug`
- `/demo`
- `/social-wall`
- `/tonight`
- `/this-week`
- `/venue/:slug`
- `/qr`
- `/forecast` / `/radar`
- `/rsvp`
- `/checkin`
- `/my-rsvp`
- `/book`
- `/join`

### Logo behavior
The public logo/header now:

- fills the full container width
- uses a responsive full-width header height
- removes extra padding
- hides the small tagline under the logo
- uses strong image fill behavior so the logo does not sit small at the top

### Preserved from v97
- Hero Variant removed from Create/Edit Event
- Venue Logo URL hidden from Create/Edit Event
- Hero Image URL remains
- saved hero preview gallery remains
- No Hero Graphic remains
- global bottom game iframe bar remains
- RSVP visibility rules remain unchanged

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
