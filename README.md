# BARFLYDATE_v119_20260504_1506

Complete full ZIP build. No patches.

## v119 — Mobile Portrait Hero Image Fix
Built from v118.

### Fixed
Mobile portrait event hero images were still zooming/cropping inside tall hero containers.

### Changed
For phone portrait event cards:

- Hero container now uses a 16:9 ratio.
- Hero background uses `background-size: contain`.
- Hero images use `object-fit: contain`.
- Hero images stay centered.
- Hero images do not stretch.
- Hero images do not overflow the card.
- Tall mobile portrait hero boxes are prevented.

### Why
v118 used `cover`, which fills the box but crops the image. v119 switches mobile portrait event card heroes to `contain`, which fits the full image inside the hero container.

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
