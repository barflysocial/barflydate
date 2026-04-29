# BARFLYDATE_v77_20260429_2318

Complete full ZIP build. No patches.

## New in v77 — Confirmations, Hero Preview, Poster Removal
Built from v76.

### Save confirmation messages
Added visible confirmation banners in `/host` for:
- Venue saved / updated / deleted
- Event saved / updated
- Event saved and Meet & Mingle session linked
- Hero template saved / updated / deleted
- Event template saved / updated / deleted
- Settings saved

### Hero graphic preview window
Add/Edit Event now includes a **Hero Graphic Preview** window in the Quick Event Builder.

The preview uses:
1. Event Hero Image URL
2. Suggested matching venue hero
3. Event image URL
4. Fallback hero label

The preview is 4:5 to match the event card hero area.

### Poster feature removed from workflow
Removed access to the Poster feature:
- Removed Poster route from public routing
- Removed Poster buttons from event detail and host event rows
- Removed Poster Builder from Marketing
- Removed Poster Builder from Command Center
- Removed Poster Template / Overlay Layout fields from Add/Edit Event

Hero graphics now replace posters as the app event visual system.

### Booking Requests by Date calendar hidden
Removed the Booking Requests by Date calendar from `/host`.
The booking/request list remains available.

### Venue Hero Template Manager
Kept clear row actions:
- Edit
- Delete Hero

Delete now shows a success confirmation after completion.

### Preserved from v76
- Save event bug fix
- Radar linked event details
- Quick Event Builder
- Optional Meet & Mingle session creation/update
- Venue Hero Template system
- Share menu

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
