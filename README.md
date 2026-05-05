# BARFLYDATE_v123_20260505_0522

Complete full ZIP build. No patches.

## v123 — Meet & Mingle Game Category Card + Host Game Link
Built from v122.

### `/home`
Added a new **Meet & Mingle** game category card.

Description:
`Guided social mixer with RSVP, check-in, timed rounds, prompts, and connection matching`

Actions:
- Play
- Events

### Host setting
Added:

`/host → Games / Iframes → Meet & Mingle Game URL`

Behavior:
- If Meet & Mingle Game URL is saved, `/home → Meet & Mingle → Play` opens `/game/meet-mingle` inside the same focused iframe style as other game pages.
- If the URL is blank, `/home → Meet & Mingle → Play` opens `/meet-mingle`.
- `/meet-mingle` explains what Meet & Mingle is.
- Events opens `/events?category=meet-mingle`.

### Event category filter
Added `/events?category=meet-mingle` support.

### Preserved
- v122 descriptive game category cards
- Golf Simulator URL and card
- v121 event Play button under hero
- v120 fallback pages
- v119 mobile portrait hero fix

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
