# BARFLYDATE_v106_20260502_2200

Complete full ZIP build. No patches.

## v106 — Stop Host Page Auto-Reset While Editing
Built from v105.

### Fixed
Some host pages appeared to reset every few seconds while typing or pasting iframe URLs.

The cause was `/host` polling active games every 4 seconds while the new icon panels were mounted inside `HostManager`.

### Changes
- Removed the automatic 4-second polling from `/host`.
- Moved `HostPanelShell` out of `HostManager` so host sections do not remount on parent re-renders.
- Added a manual **Refresh Games** button inside the Games / Iframes → Active Games area.
- Settings forms now stay stable while typing, pasting, or editing.

### Live pages still refresh separately
This only stops the admin/settings page from resetting. Live gameplay pages such as host game dashboards, player screens, and co-host dashboards can still update as needed.

### Preserved from v105
- Clean Games / Iframes URL form
- URL cleanup on save
- 6-icon `/host` admin home
- `/home` Contact icon
- `/barfly-tv` schedule and empty message
- `/social-wall` cleanup
- corrected `totalOpenReports` declaration count

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
