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
