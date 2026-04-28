# BARFLYDATE_v50_20260428_0449

Complete full ZIP build. No patches.

## New in v50 — Public Events Cleanup + Barfly Radar
Built from v49.

### Public `/events` button cleanup
Removed these buttons from public event cards on `/events`:

- Event Page
- Copy Caption
- Poster

Public event cards now keep the simple guest-facing actions:

- Primary action
- Share
- QR

The promotion tools still remain available in host/admin areas and poster routes.

### Featured event cleanup
The featured event banner on `/events` no longer shows:

- Event Page
- Copy Caption

It now keeps:

- Primary action
- Share
- QR

### Forecast renamed to Barfly Radar
User-facing Forecast wording has been renamed to:

**Barfly Radar**

The bottom navigation now shows:

**📡 Radar**

### Radar route added
Added `/radar` as an alias for the existing forecast functionality.

Backward compatibility:
- `/forecast` still works
- `/radar` now works

### Preserved from v49
- `/host` blank purple screen fix
- typed Display Event Type field
- Digital Mystery and Digital Escape Room split
- `/join` BARFLY SOCIAL heading
- Gender Identity update
- expanded Sparks/interests
- demo page cleanup
- splash always routes to `/events`
- Host Event Calendar
- Host Booking Calendar
- Public events calendar
- Book Demo booking type

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
