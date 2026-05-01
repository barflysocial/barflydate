# BARFLYDATE_v94_20260501_0400

Complete full ZIP build. No patches.

## v94 — Global Standalone Game Iframe Buttons
Built from v93.

### Corrected from v93
The Bingo / Trivia / Mystery / Vote iframe links are no longer event-specific.

Removed from Create Event:
- Social Wall iframe URL
- Bingo iframe URL
- Trivia iframe URL
- Mystery iframe URL
- Vote iframe URL

Removed from per-event save storage:
- event-specific iframe URL fields

### New global app-wide settings
Added under `/host → Settings`:

`GLOBAL GAME IFRAME BUTTONS`

Fields:
- Bingo iframe URL
- Trivia iframe URL
- Mystery iframe URL
- Vote iframe URL

These are standalone app-wide buttons. Blank URLs hide that button.

### Bottom app game bar
The bottom game button bar is now global:

- 🎱 Bingo
- ❓ Trivia
- 🕵️ Mystery
- 🗳️ Vote

Each opens its configured iframe inside Barfly.

### RSVP rule preserved
The RSVP bottom nav is still separate and still only shows when the selected day has a true Meet & Mingle RSVP event:

- My RSVP
- Change RSVP
- Check In
- Cancel

### Social Wall
The 📸 Social Wall button next to Share remains, but it now opens the app-wide `/social-wall` page. It is not tied to event-specific iframe settings.

### Iframe scrolling
Iframe panels use:

- `scrolling="no"`
- hidden overflow styling
- hidden scrollbar styling

If the embedded site itself still scrolls internally, the embedded site also needs its own `overflow:hidden` styling.

### Preserved from v93/v92
- `/social-wall`
- RSVP selected-day logic
- logo fill on `/events` and `/demo`
- shared public event button rules
- Brand Locked Event Builder baseline
- unified Create Event flow
- multiple event types
- No Hero Graphic option
- Co-Host Dashboard and QR
- delete confirmations and success messages

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
