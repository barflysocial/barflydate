# BARFLYDATE_v103_20260502_1548

Complete full ZIP build. No patches.

## v103 — Demo Bottom Buttons + RSVP Page Cleanup + Bottom Back Buttons
Built from v102.

### `/demo`
Changed bottom actions to:

1. Phone
2. Email
3. Instagram
4. Share / Demo QR
5. Enter App

Removed the Back to Home button from the top of `/demo`.

### `/home`
Removed the Check In icon from the home launcher.

### `/my-rsvp`
Removed the Create RSVP button.

`/my-rsvp` is now the central RSVP management page with quick actions:

- Check In
- Change RSVP
- Cancel RSVP
- Copy RSVP ID

Check In opens an inline section on the same page.

### Back to Home
Moved Back to Home buttons to the bottom location across public pages and made them full width.

### Preserved from v102
- `/home` launcher
- `/games` dashboard
- `/barfly-tv`
- full-width public logos
- simplified `/demo`
- QR demo share block
- Hero Variant removed
- Venue Logo URL hidden

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
