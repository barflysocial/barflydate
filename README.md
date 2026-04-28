# BARFLYDATE_v60_20260428_1822

Complete full ZIP build. No patches.

## New in v60 — Poster Template Library + Dynamic Instagram Poster Renderer
Built from v59.

### Built-in Tier 1 poster templates
Added reusable in-app poster templates:

- Game Night
- Bingo Night
- Trivia Night
- Bingo + Trivia Night
- Karaoke Night
- Meet & Mingle

### Host event editor template picker
The host event editor now includes:

- Poster Template
- Overlay Layout

Template options include:

- 🎮 Game Night
- 🎱 Bingo
- ❓ Trivia
- 🎱❓ Bingo + Trivia
- 🎤 Karaoke
- 🫂 Meet & Mingle

### Dynamic overlay system
The poster background stays generic and reusable. Event-specific details are generated as overlays:

- event title
- venue
- address/location
- time
- prize/special
- sponsor
- hosted by Barfly Social
- QR code

### Instagram poster renderer
`/poster/:slug` is now an Instagram-style poster renderer with two size modes:

- 1080×1080
- 1080×1350

### Preserved from v59
- animated splash
- custom Meet & Mingle icon
- `/calendar` redirect to `/events`
- clean calendar spelling
- paid event controls
- booking payment workflow
- QR support

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
