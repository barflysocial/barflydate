# BARFLYDATE_v65_20260428_2337

Complete full ZIP build. No patches.

## New in v65 — Premium Themed Event Cards
Built from v64.

### `/events` card redesign
Live event cards now use a premium themed event card layout instead of the older plain card/overlay style.

Each event card now includes:
- top badge row
- themed hero image based on event type
- event title
- time
- venue
- city/state
- description and notes
- interested / going counts
- action buttons

### Event hero image mapping
Cards use the existing poster template artwork:
- Karaoke → `/templates/karaoke-night.png`
- Bingo → `/templates/bingo-night.png`
- Trivia → `/templates/trivia-night.png`
- Mystery → `/templates/mystery-night.png`
- Meet & Mingle → `/templates/meet-and-mingle.png`
- Game Night / fallback → `/templates/game-night.png`

### Smart action labels
Primary card button now adapts:
- Karaoke → Song Request
- Meet & Mingle → RSVP
- Bingo / Trivia → RSVP or Play
- Mystery / Escape Room → Join
- General events → Join In

### Preserved from v64
- Week / Month only events calendar
- Week default with today selected
- Collapsed host sections
- Poster Builder and bundled templates
- Paid events and booking payment workflow

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
