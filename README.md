# BARFLYDATE_v99_20260501_1429

Complete full ZIP build. No patches.

## v99 — City Filter + Streamlined Advanced Event Details
Built from v98.

### `/events`
Replaced the free-text search with a **Search by City** dropdown.

Default city:

- Baton Rouge

The city list is controlled from host settings.

### `/host → Settings`
Added:

- Event Cities

You can enter cities one per line or comma-separated, for example:

`Baton Rouge, Denham Springs, Prairieville, Gonzales, Zachary`

These cities appear in the `/events` city dropdown.

### Advanced Event Details
Streamlined the section into clear groups:

1. Calendar Schedule
2. Hero Graphic
3. Public Event Info
4. Post Information
5. Ticketing
6. Sponsor / Prize Rules
7. Meet & Mingle Advanced

### Calendar Date
Added a visible date picker:

- Specific Event Date

Use it for one-time events. Recurring weekly events still use selected days of week.

### Post Information
Added internal post/caption fields:

- Instagram Caption
- Short Promo Text
- Hashtags
- Post Notes

### Hero Template Manager
Added a manual venue name option in Create Hero Template:

- Saved Venue dropdown
- Manual Venue Name field

### Preserved from v98
- Full-width public page logo
- Hero Variant removed from Create/Edit Event
- Venue Logo URL hidden
- Hero Image URL remains
- No Hero Graphic remains
- global bottom game iframe bar
- RSVP visibility rules

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
