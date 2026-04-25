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
