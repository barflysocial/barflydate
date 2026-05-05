# BARFLYDATE_v121_20260505_0038

Complete full ZIP build. No patches.

## v121 — Event Play Button Under Hero
Built from v120.

### `/events`
Added a public **Play** button under the event hero image.

Behavior:
- If an event has a custom Primary Button Link / `buttonLink`, the Play button appears under the hero.
- If no custom event link is saved, the Play button is hidden.
- If the event is cancelled, postponed, or sold out, the Play button is hidden.
- Clicking Play opens the event's saved link.

### `/events/:slug`
Added the same Play button under the event detail hero image.

### Important rule
Default event links such as `/events` or the event’s own public page do not create a Play button. This prevents every event from showing a fake Play button.

### Preserved
- v120 Karaoke external link behavior
- Mystery / Escape Room / Jobs fallback pages
- v119 mobile portrait hero image fix
- `/events` Home button
- `/social-wall` Home button at the top
- host-controlled Home icon popup
- Social Wall OUTPUT / INPUT iframe fields

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
