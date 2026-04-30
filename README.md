# BARFLYDATE_v82_20260430_0622

Complete full ZIP build. No patches.

## New in v82 — Unified Event Builder + Multiple Event Types
Built from v81.

### One Create Event flow
Add/Edit Event now works as one guided flow:
1. Choose event type(s)
2. Choose or enter venue information
3. Set date and time
4. Choose hero / no hero
5. Add event details
6. Meet & Mingle options
7. Preview and save

The event builder now includes optional save checkboxes:
- Save this venue for future events
- Save this hero for this venue and event type
- Save this setup as a Quick Setup

This reduces the need to jump between separate Venue, Hero, and Event Template tools.

### Multiple event types
Events can now have multiple type tags, such as:
- Trivia • Bingo • Karaoke
- Music Bingo • Karaoke
- Meet & Mingle • Professional Networking
- Latino Trivia • Latino Karaoke

The first selected type acts as the primary logic type, while all selected tags can display on the event.

### Blank create forms
Create Event now starts blank:
- no prefilled title
- no prefilled venue
- no prefilled event type
- no prefilled hero type
- no prefilled description/prize/button text
- Meet & Mingle starts off until selected

Presets remain available, but only fill fields when selected.

### Mixer Goal / Round Apps
Meet & Mingle now uses a **Mixer Goal** instead of manually choosing every round app:
- Social Mixer
- Professional Networking
- Dating
- Marriage / Serious Relationship
- Custom

The app journey is auto-loaded based on Mixer Goal + session length.

### Host cleanup
- Event booking requests are hidden from `/host`
- Review Requests guided action is removed
- App Journey is hidden from the host dashboard
- Standalone social mixer form starts blank with empty dropdowns

### Preserved from v81
- No Hero Graphic option
- packaged Workday Blackout Bingo hero at `/heroes/barfly-social/workday-blackout-bingo.png`
- Event Type Manager
- multiple event days
- Co-Host Dashboard and QR
- Hero Template Gallery
- Hero Fit Cover / Contain
- Canva URL warnings
- save confirmation banners

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
