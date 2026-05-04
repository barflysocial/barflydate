# BARFLYDATE_v118_20260504_1433

Complete full ZIP build. No patches.

## v118 — Hero Photos Auto-Fit Inside Hero Containers

### Fixed
Hero photos now auto-fit inside hero containers.

### Behavior
- Images fill the hero box cleanly.
- Images stay centered.
- Images do not stretch.
- Images do not overflow outside the container.
- Event hero photos use `object-fit: cover` and `background-size: cover`.
- Logo-style images can use the `heroContainImage` utility class if cropping is not wanted.

### Applies to
- event card hero images
- premium event hero containers
- event detail hero areas
- hero preview areas
- saved hero/template preview areas
- poster/graphic hero containers

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
