# BARFLYDATE_v126_20260505

Render-ready Barfly Social app build based on v125.

## v126 — Attach Sponsors to Events

This version adds a sponsor profile system and lets hosts attach saved sponsors to public events.

### New host workflow

1. Open Host Dashboard.
2. Go to **Sponsors**.
3. Add sponsor name, logo URL, website URL, Instagram URL, offer/prize, redemption rules, expiration date, category, and active status.
4. Go to **Events**.
5. Open the event builder.
6. Use **Attach Sponsors** to check one or more saved sponsors.
7. Save the event.

### Public behavior

- Sponsor blocks only show when an event has attached sponsors.
- If no sponsors are attached, the sponsor block is hidden.
- Sponsor cards can show logo, sponsor name, offer, offer details, rules, expiration, and sponsor link.
- Sponsor button opens website first, or Instagram if no website is provided.
- Older one-off Sponsor Name / Sponsor Logo URL fields still work as a fallback.

### Previous v125 behavior kept

- YouTube Short URL field.
- TikTok URL field.
- Instagram Reel / Post URL field.
- Promo buttons only show when those URLs are filled in.
- Advertise With Us under About Us.

## Deploy notes

Use the same Render setup as the previous version.

Environment variables:

- `HOST_PIN` = your private host PIN
- `DATABASE_URL` = your Render PostgreSQL connection string

## Checks completed

- Client production build succeeded.
- Server syntax check succeeded.
- Local API smoke test succeeded.
