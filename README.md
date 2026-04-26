# BARFLYDATE_v25_20260426_2255

Complete full ZIP build. No patches.

## New in v25 — Barfly Social Splash Screen
Built from BARFLYDATE v24.

### Splash screen
- Root `/` now opens with a branded **Barfly Social** splash screen first.
- Splash uses the dragonfly logo image:
  - `client/public/barfly-social-splash.png`
- Splash shows:
  - Barfly Social logo
  - Meet • Mingle • Play
  - Loading nearby sessions...
- Auto-transitions to `/forecast`.
- `/forecast` still opens the forecast directly if someone goes there.

### App icon assets
Added:
- `client/public/barfly-dragonfly-64.png`
- `client/public/barfly-dragonfly-60.png`
- `client/public/barfly-dragonfly-192.png`

### Preserved from v24
- Venue meeting zones
- Player instruction card
- RSVP-only public flow
- Capacity tools
- Host RSVP controls
- Test RSVP/check-in tools
- Venue drink specials

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.

# BARFLYDATE_v24_20260426_2120

Complete full ZIP build. No patches.

## New in v24 — Meeting Zones + Player Clarity
Built from BARFLYDATE v23.

### Meeting zones by venue
Host can now set meeting movement for each session:
- Single Meeting Point
- Multiple Zones
- No Location Assignment

Examples:
- Host Stand
- Bar Area
- Patio
- Stage Side
- Back Room
- Table 1
- Table 2

### Player clarity
During each active round, the player now sees a clear instruction card:
- Who to meet
- Where to meet
- Topic/app for the round
- Time left
- What happens next

### Host visibility
- Host dashboard shows meeting mode and zones.
- Pre-start checklist confirms meeting zones.
- Current Pairings shows each pairing's meeting zone.

### Kept from v23
- Max RSVPs and Max Check-ins
- Capacity labels Open / Almost Full / Full
- Host RSVP search / move / cancel
- Generate Test RSVPs / Test Check-ins / Clear Test RSVPs
- RSVP-only public flow
- Venue drink specials

# BARFLYDATE_v23_20260426_2027

Complete full ZIP build. No patches.

## New in v23 — Host RSVP Control + Capacity Tools
Built from BARFLYDATE v22.

### Capacity tools
- Host sets **Max RSVPs** and **Max Check-ins** when creating a session.
- Defaults:
  - 30-minute game: 20
  - 60-minute game: 40
  - 90-minute game: 60
- Forecast shows capacity counts and labels: Open, Almost Full, Full.
- RSVP is blocked when RSVP capacity is full.
- Check-in is blocked when check-in capacity is full.

### Host RSVP control
- Host RSVP panel now includes:
  - Search RSVPs
  - Copy RSVP ID
  - Move RSVP to another open session
  - Cancel RSVP
  - RSVP status labels
  - Capacity summary

### Live testing tools
- Generate Test RSVPs
- Generate Test Check-ins
- Clear Test RSVPs and test players

### Host run-of-show checklist
- Added a host checklist on the host dashboard for live event operation.

### Preserved from v22
- RSVP-only public flow
- Forecast / RSVP / Check In / My RSVP public nav
- Venue drink specials
- My RSVP management screen
- Hidden `/join` route for host/emergency use only

# BARFLYDATE_v22_20260426_1955

Complete full ZIP build. No patches.

## New in v22 — RSVP-Only Public Flow
Built from BARFLYDATE v21.

### Public flow cleanup
- Removed **Private Event Join** from public screens.
- Removed **Private** from bottom navigation.
- Public bottom nav is now:
  - Forecast
  - RSVP
  - Check In
  - My RSVP
- `/join` still exists as a hidden host/emergency route, but the public flow no longer points to it.

### My RSVP
New route:

`/my-rsvp`

Players can:
- View their RSVP
- Copy RSVP ID
- Change RSVP before lock
- Cancel RSVP before lock
- Go to Check In
- See venue drink special

### RSVP rules preserved
- One active RSVP per person/event night.
- Same browser/device cannot create multiple active RSVPs.
- Same contact handle cannot create multiple active RSVPs.
- If a player RSVPs again before sessions start, the existing RSVP is moved instead of creating a duplicate.
- RSVP locks once checked in or once the original session starts.

### Venue specials preserved
- Drink special fields remain in host create game.
- Forecast/RSVP/My RSVP show the special.
- Checked-in player screen shows the special as unlocked/redeemable.

# BARFLYDATE_v21_20260426_1859

Complete full ZIP build. No patches.

## New in v21 — RSVP Lock + Venue Specials
Built from BARFLYDATE v20.

### RSVP duplicate-location fix
- One active RSVP per person/event night.
- Browser/device identity is stored locally as `barflydateDeviceId`.
- Same browser/device cannot create multiple active RSVPs.
- Same contact handle cannot create multiple active RSVPs.
- If a player RSVPs again before sessions start, the existing RSVP is moved instead of creating a duplicate.
- RSVP can only move if the original session has not started, the new session has not started, and the player has not checked in.
- Once checked in or once the original session starts, the RSVP is locked.

### Venue drink special upgrade
- Host can add:
  - Drink Special Title
  - Drink Special Details
  - Redeem Window
  - Restrictions
- Forecast and RSVP show the venue special as a promotional reason to attend.
- Checked-in player screens show the special as unlocked/redeemable.
- Host dashboard and game dashboard show the venue special.

### Kept from v20
- Forecast-first homepage
- Venue location
- Age range preference
- 5-step RSVP intake
- Bottom public nav
- Neon nightlife style
- Private event Join route

# BARFLYDATE_v20_20260426_1822

Complete full ZIP build. No patches.

## New in v20
- Homepage opens to Forecast first
- Added venue location
- Added age range preference
- RSVP now uses a 5-step cleaner intake
- Bottom nav icons on public screens
- Public screens use the neon nightlife / option three visual direction
- Join is repositioned as a smaller private event option

# BARFLYDATE_v19_20260426_0403

Complete full ZIP build. No patch files.

## New in v19 — RSVP + Intent Forecast
v19 includes everything from v18 plus the new RSVP/forecast system.

### New public routes
- `/forecast` — public intent forecast by session/bar.
- `/rsvp` — online RSVP flow.
- `/checkin` — venue check-in with RSVP ID + session code.

### RSVP rules
- RSVP requires choosing a location/session.
- Alias is unique across all active/upcoming sessions.
- RSVP can only move before the original session starts.
- RSVP can only move into a session that has not started.
- Once original session starts, RSVP is locked.
- RSVP alone does not put someone into the live game.
- Live game only uses checked-in players.
- Check-in requires the live session code at the venue.

### Host upgrades
- Host dashboard shows RSVP count and checked-in count.
- Individual game dashboard has an RSVP / Check-In Panel.
- Forecast uses privacy-friendly levels like Building, Average, High, and Very High.

### Kept from v18
- Player agreement
- Host pre-start checklist
- Database/storage status
- Test Safety Alert
- Safety Panel
- Report button
- Host remove player
- Open Player View
- Demo/Test Game
- 30/60/90 sessions
- Planned app journeys
- Host PIN
- PostgreSQL support
- Event export

# BARFLYDATE_v18_20260426_0315

Complete full ZIP build. No patch files.

## New in v18 — Live Event Polish
- Player agreement screen before joining.
- Host pre-start checklist before starting a session.
- Database/storage status visible on host screens.
- Cleaner locked-session expectation on the join screen.
- Host-only **Test Safety Alert** button.
- Mobile spacing cleanup for join, player, report, voting, and reveal screens.
- Visible app version: **BARFLYDATE v18**.
- Keeps v17 safety notification fix, v16 player view buttons, v15 demo fixes, PostgreSQL support, Host PIN, 30/60/90 sessions, and planned app journeys.

## Test before live event
1. Deploy v18 to the Render **Web Service**.
2. Open `/host`.
3. Confirm storage status says PostgreSQL connected.
4. Create Test Game.
5. Open Player View.
6. Start session using the pre-start checklist.
7. Click Test Safety Alert and confirm the red Safety Alert appears.
8. Run through voting/results/reset.

# BARFLYDATE_v17_20260426_0231

Complete full ZIP build. No patch files.

## Critical safety notification fix in v17
- Fixed Host Dashboard safety notifications.
- v16 was calling `/api/games/:gameId/reports` without the Host PIN header.
- Because the reports endpoint is host-protected, that request failed and the host dashboard did not show the safety notification.
- v17 uses `hostFetch()` for safety reports so the Host PIN is included.
- Added loud red **SAFETY ALERT** box at the top of the game dashboard when open reports exist.
- Added safety report counts directly into the game payload.
- Player report submission now shows a confirmation alert.

## Test flow
1. Deploy v17.
2. Create test game.
3. Open two demo player views.
4. Start the game.
5. From one player view, click **Report a Problem** and submit.
6. Return to host dashboard.
7. You should see the red **SAFETY ALERT** and the report inside **Safety Panel**.

# BARFLYDATE_v16_20260426_0217

Complete full ZIP build. No patch files.

## New in v16
- Added **Open Player View** buttons beside every player/demo player on the host dashboard.
- Added **Copy Link** beside every player/demo player.
- Added **Open First Player View** helper button above the player list.
- This lets the host immediately view the game from a demo/player perspective without exporting JSON.
- Keeps v15 demo player fixes, v12 PostgreSQL/Host PIN, safety panel, reports, remove player, 30/60/90 sessions, and planned app journeys.

## How to view the demo player perspective
1. Go to `/host`.
2. Enter Host PIN.
3. Click **Create Test Game**.
4. Open the game dashboard.
5. Scroll to **Players**.
6. Click **Open Player View** beside any demo player.

# BARFLYDATE_v15_20260426_0201

Complete full ZIP build. No patch files.

## Critical fix in v15
- Demo players now generate through a single bulletproof helper function.
- Demo generation no longer depends on imported category variables.
- Test Game creation now alerts how many demo players were created.
- Game dashboard now shows an obvious "No players loaded" callout.
- You can now add demo players even if the game was accidentally started with 0 players.
- Added `/api/demo-debug` host endpoint for checking demo state.
- Keeps all v14/v13/v12 features.

## Test flow
1. Deploy this full v15 ZIP to the **Render Web Service**.
2. Go to `/host`.
3. Enter Host PIN.
4. Click **Create Test Game**.
5. You should see an alert saying the test game was created with demo players.
6. The dashboard should show **Players (12)**.

# BARFLYDATE_v14_20260426_0138

Complete full ZIP build. No patch files.

## Critical fix in v14
- Fixed demo/test player creation.
- v13 demo endpoints used the `categories` list but the server did not import it from `prompts.js`.
- That caused demo player generation to fail at runtime.
- v14 imports `categories` correctly.
- Added better frontend error handling if demo creation fails.

## Test flow
1. Deploy this full v14 ZIP.
2. Go to `/host`.
3. Enter your Host PIN.
4. Click **Create Test Game**.
5. Choose 12 demo players.
6. The new game dashboard should show **Players (12)**.

# BARFLYDATE_v13_20260426_0112

Complete full ZIP build. No patch files.

## New in v13
- Demo/Test Game is now obvious on the main Host Manager screen.
- Added a big **Create Test Game** card directly on `/host`.
- Host can choose demo player count and session length before creating the test game.
- Test game auto-creates the game code and fills it with demo players.
- Existing per-game **Add Demo Players to This Game** button remains available before starting a session.
- Keeps v12 PostgreSQL support, Host PIN, event export, session counts, safety panel, and 30/60/90 session presets.

## Where to find test mode
Go to `/host`, enter the host PIN, then look for the **TEST MODE / Create Test Game** card.

# BARFLYDATE_v12_20260426_0029

Complete full ZIP build. No patch files.

## New in v12
- PostgreSQL persistence support using `DATABASE_URL`.
  - If `DATABASE_URL` is present, the BARFLYDATE state saves to PostgreSQL.
  - If not present, the app falls back to in-memory mode for local testing.
- Host PIN protection.
  - Default PIN is `2468`.
  - Set `HOST_PIN` in Render for production.
- Host suite privacy.
  - `/host` and `/host/:gameId` require Host PIN in the frontend.
  - Host API routes require the `x-host-pin` header.
- Event export.
  - Host can export event JSON with players, rounds, reports, votes, reactions, awards, and summary.
- Demo/test player generator.
  - Host can add demo players before starting the session for fast testing.
- Public Other Sessions panel.
  - Players can see privacy-friendly counts by looking-for category across sessions.
- Keeps v11 planned app journeys and 30/60/90 sessions.

## Render environment variables
Set these in Render:
- `HOST_PIN` — choose your private host PIN.
- `DATABASE_URL` — Render PostgreSQL connection string.

# BARFLYDATE_v11_20260426_0024

Complete full ZIP build. No patch files.

## New in v11
- Added session-specific planned app journeys:
  - 30-Minute Quick Mixer: Food & Drink → Entertainment → Lifestyle → Quirks
  - 60-Minute Social Game: Food & Drink → Entertainment → Hobbies → Lifestyle → Adventure → Values
  - 90-Minute Full Experience: Food & Drink → Entertainment → Hobbies → Travel → Adventure → Lifestyle → Quirks → Values → Life Goals
- App categories are no longer random for each round.
- Host dashboard now shows the app journey.
- Player round screen now describes the current planned app for that round.
- Keeps v10 timed sessions, no late joins, safety panel, report button, and remove player controls.

# BARFLYDATE_v10_20260426_0008

Complete full ZIP build. No patch files.

## New in v10
- Added timed session presets:
  - 30-Minute Quick Mixer
  - 60-Minute Social Game
  - 90-Minute Full Experience
- Host chooses session length when creating a game code.
- Game timeline now adjusts automatically by session length.
- Round count, voting round, intro time, talk time, rating time, break time, and voting time are mode-based.
- No late joins: once host starts the session, new players are blocked from that game code and told to ask for the next game code.
- Host and player screens now show dynamic round totals instead of hard-coded 10.
- Final voting round label is dynamic.

# BARFLYDATE_v9_20260425_2337

Complete full ZIP build. No patch files.

## New in v9
- Player Report Button during conversation and rating phases.
- Report reason options plus optional note.
- Host Safety Panel per game/session.
- Global safety count summary on the main Host Manager.
- Host Remove Player button on each player card and on each safety report.
- Removed player sees a removed-from-session screen.
- No automatic no-rematch behavior after a report.
- No banned-token / blocked rejoin list added.
- Joining is locked after the host starts the session.
- Updated “Looking For” options:
  - Friends Only
  - Activity Partners
  - Casual Dating
  - Serious Dating
  - Marriage
- Host and Join screens show session demand counts by “Looking For” category with privacy-friendly counts.

# BARFLYDATE_v8_20260425_2210

Complete full ZIP build. No patch files.

## Build fix in this version
- Fixed Render build error caused by duplicate `function Results()function Results()` declaration in `client/src/App.jsx`.
- This version is the complete project folder for GitHub + Render redeploy.

# BARFLYDATE_v7_20260425_2200

Complete full ZIP build. No patch files.

## New in v7
- Player post-game flow added.
- Players now see a guided post-game reveal after the game ends.
- Moment voting now clearly unlocks recap/reveal flow.
- Added **My Night Recap** screen for each player.
- Recap includes rounds completed, reactions received, votes received, awards won, and mutual sparks.
- Added improved private connection reveal cards.
- Added “Join Another Game” buttons on player post-game screens.
- Results screen now includes host navigation back to dashboard, all games, and join screen.
- Server now includes `/api/player/:playerId/recap`.

# BARFLYDATE_v6_20260425_2048

Complete full ZIP build. No patch files.

## Debug fix in this version
- Alias names are now unique per game code.
- Server validates and assigns a different mystery alias if a duplicate/default alias is submitted.
- Join screen now starts with a randomized alias.
- Added a Shuffle button for premium alias selection.
- Custom aliases are still allowed, but duplicates are automatically resolved.

# BARFLYDATE_v5_20260425_2026

BARFLY DATE — Mystery Match Night

This is a complete full ZIP build. No patch files.

## Major v5 features

- Premium hybrid UI: dark luxury + nightlife energy
- 90-minute automated game engine
- 9 conversation rounds + 10th voting round
- Host starts once; game runs automatically
- 3-minute intro/instructions
- 8-minute talk phase per round
- 1-minute private rating phase per round
- 3-minute break after Round 5
- 3-minute final moment voting round
- Weighted app category selection based on shared interests
- Multi-game host manager with multiple game codes
- Host emergency controls: pause, resume, skip phase, end game, reset/clear
- Late-join handling: late players enter on next round
- Inactive/drop handling: inactive players are skipped during future pairings
- Odd player handling: creates 3-person mini groups instead of awkward sit-outs
- Positive-only ratings
- Private Yes / Maybe / Skip decisions
- Extra question: “Would you want to see this person outside this game?”
- Moment voting tied to awards
- Private connection reveal screen with “why you matched”

## Local testing

From the root folder:

```bash
npm install
npm run install-all
npm run dev
```

Open:

```text
http://localhost:5173/host
```

## Render setup

Build command:

```bash
npm install && npm run render-build
```

Start command:

```bash
npm start
```

## Routes

- `/host` — multi-game host manager
- `/host/:gameId` — individual automated game dashboard
- `/join` — player join screen
- `/player/:playerId` — player game screen
- `/vote/:playerId` — final moment voting
- `/connections/:playerId` — private match/contact reveal
- `/results/:gameId` — awards/results

## Important MVP note

This build uses in-memory storage. Data resets when the server restarts. For bigger events or production, upgrade to PostgreSQL.
