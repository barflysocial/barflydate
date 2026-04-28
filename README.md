# BARFLYDATE_v62_20260428_2142

Complete full ZIP build. No patches.

## New in v62 — Real Poster Template Backgrounds + Preview Fix
Built from v61.

### Real poster template background support
Poster Builder now supports real saved background artwork per template.

Each template now includes:
- Template Name
- Template Slug
- Background Image URL
- Overlay Layout
- Active / Inactive
- Category
- Icon fallback set

### Template Background Manager
Inside `/host` → Poster Builder, the selected template now has a Template Background section where you can:
- edit the template display name
- view the template slug
- paste a public Background Image URL
- mark the template active/inactive

### Background-only workflow
The background image should include:
- Barfly Social logo at the top
- dark neon theme
- theme artwork/icons

The background image should not include:
- venue
- address
- date
- time
- prize
- QR code
- event-specific info

Those are handled by the dynamic system overlay.

### Preview clipping fixed
The Poster Builder preview now uses:
- responsive preview frame
- scaled poster preview
- full poster visibility
- scroll only if needed inside the preview frame

Export sizes remain:
- 1080×1080
- 1080×1350
- 1080×1920

### Preserved from v61
- Poster Builder V1
- Save Draft
- Duplicate Draft
- Short / Full Version
- Copy Caption
- Dynamic `/poster/:slug` renderer
- Tier 1 template library

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
