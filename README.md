# BARFLYDATE_v31_20260427_1240

Complete full ZIP build. No patches.

## New in v31 — Events First Public Flow
Built from v30.

### Public flow changed
The app now opens like this:

`/` → 8-second Barfly Social splash screen → `/events`

### Splash screen timing
- Splash minimum time increased to **8 seconds**
- Splash routes to `/events`
- Splash copy now says it is loading this week’s events

### Events-first navigation
Bottom public navigation is now ordered:
1. Events
2. Forecast
3. RSVP
4. Check In
5. My RSVP

### Forecast is still available
`/forecast` still works directly and is now labeled as:

**Barfly Social Forecast**

### Event cards
Barfly Social event cards now use:

**View Forecast / RSVP**

Other event cards still use their event page, play-now, or more-info flow.

### Preserved from v30
- Individual event pages
- Event QR pages
- Add to calendar
- I'm Interested / I'm Going
- Featured `/tonight` page
- Venue pages
- Host calendar manager
- Business demo
- QR pages
- Business report
- RSVP-only Barfly Social flow
- Capacity tools
- Meeting zones
- Drink specials

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.

