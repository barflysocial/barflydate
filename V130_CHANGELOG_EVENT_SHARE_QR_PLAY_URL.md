# v130 — Event share QR matches Play URL

Changes made from v129:

- Event Share menu now prefers the event Play/Button Link as the share target when a Play link exists.
- Show QR Code from the event share menu now opens a QR page for the same URL as the Play button.
- Copy Event Link now copies the Play URL when a Play URL exists.
- Native Share from the event share menu now shares the Play URL when a Play URL exists.
- Event detail QR and poster QR now also prefer the Play URL when available.
- Added `/qr/link?url=...` support so QR pages can show custom action URLs instead of only app route URLs.

Fallback behavior:
- If an event has no Play/Button Link, share and QR behavior falls back to the normal event page URL.
