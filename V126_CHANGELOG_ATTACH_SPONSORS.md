# Barfly Social v126 Changes

Base used: `BARFLYDATE_v125_20260505_4ICON_HOME_SOCIAL_URLS_RENDER_READY.zip`

## Added

- New host dashboard section: **Sponsors**.
- Sponsor profiles with name, logo URL, website URL, Instagram URL, offer/prize title, offer details, redemption rules, expiration date, category, and active toggle.
- Event builder section: **Attach Sponsors**.
- Events can attach multiple saved sponsors using checkboxes.
- Public event calendar cards, event detail pages, tonight page, venue pages, and online game cards show a sponsor block only when an event has attached sponsors.
- Sponsor buttons link to the sponsor website first, then Instagram if no website is entered.
- Deleting a sponsor removes it from attached events.
- Existing one-off Sponsor Name / Sponsor Logo URL fields still work as a fallback for older events.

## Checks

- Client production build completed successfully.
- Server syntax check completed successfully.
- Local API smoke test loaded public events with sponsor data.
