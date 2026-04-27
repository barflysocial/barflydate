# BARFLYDATE_v32_20260427_1316

Complete full ZIP build. No patches.

## New in v32 — Online Game Button Control
Built from v31.

### Primary button control for online games
Calendar events now use the host-entered:

- **Primary Button Name**
- **Primary Button Link**

as the main public action button.

Examples:
- Button Name: `Play Bingo`
- Button Link: `https://games.barfly.social/elpasobingo`

- Button Name: `Play Trivia`
- Button Link: `https://games.barfly.social/pelicantomars`

- Button Name: `View Forecast / RSVP`
- Button Link: `/forecast`

### Where the primary button appears
The custom button now appears on:
- `/events`
- `/events/:slug`
- `/tonight`
- `/this-week`
- `/venue/:venue-slug`

### Host editor improvements
The event editor now labels the fields as:
- **Primary Button Name**
- **Primary Button Link**

The host event list also previews the button name and link.

### Preserved from v31
- Events-first public flow
- 8-second splash screen
- Events calendar
- Individual event pages
- Event QR pages
- Add to calendar
- I'm Interested / I'm Going
- Featured `/tonight` page
- Venue pages
- Business demo
- Business report
- RSVP-only Barfly Social flow
- Capacity tools
- Meeting zones
- Drink specials

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.

