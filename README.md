# BARFLYDATE_v61_20260428_2054

Complete full ZIP build. No patches.

## New in v61 — Poster Builder V1
Built from v60.

### Added Host Poster Builder
A new **Poster Builder** section has been added to `/host`.

Host flow:
1. Choose Template
2. Enter Event Info
3. Preview Poster
4. Save Draft / Duplicate Draft / Export

### Poster Builder templates
Uses the v60 Tier 1 templates:

- Game Night
- Bingo Night
- Trivia Night
- Bingo + Trivia Night
- Karaoke Night
- Meet & Mingle

### Poster Builder fields
V1 includes:

- Template
- Size
- Overlay Layout
- Event Title
- Subtitle
- Venue Name
- Address
- Date
- Time
- Main CTA
- Secondary CTA
- Drink Special
- Sponsor Line
- Hosted By
- Website / Link
- QR placeholder toggle

### Poster Builder actions
Added:

- Save Draft
- Duplicate Draft
- Use Short Version
- Use Full Version
- Copy Caption
- Export / Print

### Export sizes
Preview supports:

- Square Post — 1080×1080
- Instagram Post — 1080×1350
- Story — 1080×1920

### Preserved from v60
- Dynamic `/poster/:slug` renderer
- Event poster template picker
- Overlay layouts
- Tier 1 poster template library
- Animated splash
- Meet & Mingle icon
- Paid event controls
- Booking payment workflow

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
