# BARFLYDATE_v104_20260502_1744

Complete full ZIP build. No patches.

## v104 — Host Icon Dashboard + Public Cleanup
Built from v103.

### `/host`
Rebuilt the host dashboard into a cleaner icon-based admin home.

The host screen now has 6 main icons:

1. Events
2. Venues
3. Hero Graphics
4. App Settings
5. Games / Iframes
6. Reports

Each icon opens one focused panel with a Back to Host button. Panels keep their save/cancel controls where settings are changed.

### Games / Iframes panel
Added a focused Games / Iframes settings panel with Save and Cancel controls for:

- Bingo iframe URL
- Trivia iframe URL
- Mystery iframe URL
- Vote iframe URL
- Barfly TV iframe / video URL
- Barfly TV Empty Schedule Message

### `/barfly-tv`
Added schedule behavior:

- If Barfly TV events are scheduled, the page shows a Barfly TV schedule.
- If no Barfly TV events are found, it shows the host-editable empty schedule message.

### `/home`
Added a Contact icon that opens the saved business email.

### `/social-wall`
Removed the bottom icon/nav clutter and kept Back to Home at the bottom.

### Preserved from v103
- `/home` launcher
- `/games` dashboard
- `/barfly-tv`
- `/my-rsvp` RSVP quick actions
- `/demo` bottom buttons
- full-width public logos
- Hero Variant removed
- Venue Logo URL hidden

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
