const express = require("express");
const cors = require("cors");
const path = require("path");
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { createPairings, pairKey, groupKey } = require("./matching");
const { weightedCategoryForGroup, promptsFor, sharedInterests, appOrderForGameMode } = require("./prompts");

const app = express();
const PORT = process.env.PORT || 4000;
const HOST_PIN = process.env.HOST_PIN || "2468";
const USE_POSTGRES = Boolean(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

const GAME_MODES = {
  quick_30: {
    key: "quick_30",
    label: "30-Minute Quick Mixer",
    shortLabel: "30 min",
    introSeconds: 120,
    talkSeconds: 300,
    rateSeconds: 45,
    breakSeconds: 0,
    votingSeconds: 300,
    totalRounds: 4,
    breakAfterRound: null,
    inactiveAfterSeconds: 7 * 60
  },
  social_60: {
    key: "social_60",
    label: "60-Minute Social Game",
    shortLabel: "60 min",
    introSeconds: 180,
    talkSeconds: 420,
    rateSeconds: 60,
    breakSeconds: 0,
    votingSeconds: 540,
    totalRounds: 6,
    breakAfterRound: null,
    inactiveAfterSeconds: 7 * 60
  },
  full_90: {
    key: "full_90",
    label: "90-Minute Full Experience",
    shortLabel: "90 min",
    introSeconds: 180,
    talkSeconds: 480,
    rateSeconds: 60,
    breakSeconds: 180,
    votingSeconds: 180,
    totalRounds: 9,
    breakAfterRound: 5,
    inactiveAfterSeconds: 7 * 60
  }
};

const DEFAULT_GAME_MODE = "full_90";
const FLOW = GAME_MODES[DEFAULT_GAME_MODE];

const voteCategories = [
  { key: "favorite_conversation", label: "Favorite Conversation", award: "Favorite Conversation Award" },
  { key: "funniest_moment", label: "Funniest Moment", award: "Funniest Moment Award" },
  { key: "best_energy", label: "Best Energy", award: "Best Energy Award" },
  { key: "tell_me_more", label: "Tell Me More", award: "Tell Me More Award" },
  { key: "most_mysterious", label: "Most Mysterious", award: "Most Mysterious Award" }
];

const aliasNames = [
  "The Hidden Romantic",
  "The Velvet Spark",
  "The Midnight Charmer",
  "The Secret Admirer",
  "The Smooth Talker",
  "The Wild Card",
  "The Soft Launch",
  "The Last Call Legend",
  "The Golden Hour",
  "The Moonlit Muse",
  "The Cocktail Confession",
  "The Slow Burn",
  "The Electric Smile",
  "The Plot Twist",
  "The Rose Gold Rebel",
  "The After Hours Angel",
  "The Charming Clue",
  "The Mystery Muse",
  "The Deep Talker",
  "The Weekend Flame",
  "The Quiet Storm",
  "The Social Butterfly",
  "The Lucky Encounter",
  "The Magnetic Stranger",
  "The Night Owl",
  "The Southern Spark",
  "The Bourbon Whisper",
  "The Champagne Secret",
  "The Neon Heart",
  "The Sweet Alibi",
  "The Velvet Alibi",
  "The Starlit Stranger",
  "The Flirty Detective",
  "The Hidden Gem",
  "The Easy Chemistry",
  "The Curious Heart"
];

const autoAliasDefaults = new Set([
  "the hidden romantic",
  "the secret admirer",
  "mystery date",
  "mystery match"
]);

function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function generateUniqueAlias(game, requestedAlias) {
  const existing = new Set(getGamePlayers(game).map(p => cleanName(p.nickname).toLowerCase()));
  const requested = cleanName(requestedAlias);

  // Custom aliases are allowed, but they still must be unique.
  if (requested && !autoAliasDefaults.has(requested.toLowerCase()) && !existing.has(requested.toLowerCase())) {
    return requested;
  }

  const available = aliasNames.filter(name => !existing.has(name.toLowerCase()));
  if (available.length) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // If the event has more players than aliases, create a clean numbered version.
  const base = requested && !autoAliasDefaults.has(requested.toLowerCase()) ? requested : "Mystery Guest";
  let counter = 2;
  let candidate = `${base} ${counter}`;
  while (existing.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${base} ${counter}`;
  }
  return candidate;
}


let db = {
  games: {},
  players: {},
  pairings: {},
  reactions: [],
  decisions: [],
  momentVotes: [],
  reports: []
};

let pgPool = null;
let persistTimer = null;
let persistenceReady = false;

function isHost(req) {
  return String(req.headers["x-host-pin"] || req.query.hostPin || "") === HOST_PIN;
}

function requireHost(req, res, next) {
  if (!isHost(req)) {
    return res.status(401).json({ error: "Host PIN required" });
  }
  next();
}

async function initPersistence() {
  if (!USE_POSTGRES) {
    console.log("BARFLYDATE storage: in-memory only. Add DATABASE_URL for PostgreSQL persistence.");
    persistenceReady = true;
    return;
  }

  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
  });

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS barflydate_state (
      key TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await pgPool.query("SELECT data FROM barflydate_state WHERE key = $1", ["main"]);
  if (existing.rows[0]?.data) {
    db = {
      games: {},
      players: {},
      pairings: {},
      reactions: [],
      decisions: [],
      momentVotes: [],
      reports: [],
      ...existing.rows[0].data
    };
    console.log("BARFLYDATE storage: loaded state from PostgreSQL.");
  } else {
    await persistState();
    console.log("BARFLYDATE storage: initialized PostgreSQL state.");
  }

  persistenceReady = true;
}

async function persistState() {
  if (!USE_POSTGRES || !pgPool) return;
  await pgPool.query(
    `INSERT INTO barflydate_state (key, data, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key)
     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    ["main", JSON.stringify(db)]
  );
}

function schedulePersist() {
  if (!USE_POSTGRES || !persistenceReady) return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistState().catch(err => console.error("PostgreSQL persistence error:", err));
  }, 150);
}

app.use((req, res, next) => {
  res.on("finish", () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && res.statusCode < 400) {
      schedulePersist();
    }
  });
  next();
});


function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function buildTimeline(flow = FLOW) {
  const phases = [];
  let t = 0;

  phases.push({ type: "intro", round: 0, label: "Opening / Instructions", startOffset: t, endOffset: t + flow.introSeconds });
  t += flow.introSeconds;

  for (let r = 1; r <= flow.totalRounds; r++) {
    phases.push({ type: "talk", round: r, label: `Round ${r}: Talk`, startOffset: t, endOffset: t + flow.talkSeconds });
    t += flow.talkSeconds;

    phases.push({ type: "rate", round: r, label: `Round ${r}: Private Signals`, startOffset: t, endOffset: t + flow.rateSeconds });
    t += flow.rateSeconds;

    if (r === flow.breakAfterRound) {
      phases.push({ type: "break", round: r, label: "Midnight Reset Break", startOffset: t, endOffset: t + flow.breakSeconds });
      t += flow.breakSeconds;
    }
  }

  phases.push({ type: "voting", round: flow.totalRounds + 1, label: `Round ${flow.totalRounds + 1}: Moment Voting`, startOffset: t, endOffset: t + flow.votingSeconds });
  t += flow.votingSeconds;

  return { phases, totalSeconds: t };
}

const TIMELINE = buildTimeline();
const VOTING_OFFSET = TIMELINE.phases.find(p => p.type === "voting").startOffset;

function phaseAtElapsed(elapsed, timeline = TIMELINE) {
  return timeline.phases.find(p => elapsed >= p.startOffset && elapsed < p.endOffset) || null;
}

function getGameMode(game) {
  return GAME_MODES[game?.gameMode] ? game.gameMode : DEFAULT_GAME_MODE;
}

function getGameFlow(game) {
  return GAME_MODES[getGameMode(game)];
}

function getGameTimeline(game) {
  return buildTimeline(getGameFlow(game));
}

function getVotingOffset(game) {
  return getGameTimeline(game).phases.find(p => p.type === "voting").startOffset;
}

function getGamePlayers(game) {
  return game.playerIds.map(id => db.players[id]).filter(Boolean);
}

function intentLabel(value) {
  const labels = {
    friends_only: "Friends Only",
    activity_partners: "Activity Partners",
    casual_dating: "Casual Dating",
    serious_dating: "Serious Dating",
    marriage: "Marriage",
    date: "Casual Dating",
    friend: "Friends Only",
    social: "Activity Partners"
  };
  return labels[value] || value || "Not selected";
}

function countLookingFor(game) {
  const counts = {
    friends_only: 0,
    activity_partners: 0,
    casual_dating: 0,
    serious_dating: 0,
    marriage: 0
  };

  getGamePlayers(game)
    .filter(player => !player.removedAt)
    .forEach(player => {
      const key = player.lookingFor || "activity_partners";
      const normalized = key === "date" ? "casual_dating" : key === "friend" ? "friends_only" : key === "social" ? "activity_partners" : key;
      counts[normalized] = (counts[normalized] || 0) + 1;
    });

  return counts;
}

function publicReport(report) {
  const reporter = db.players[report.fromPlayerId];
  const reported = db.players[report.toPlayerId];
  return {
    ...report,
    reporterAlias: reporter?.nickname || report.reporterAlias || "Unknown",
    reportedAlias: reported?.nickname || report.reportedAlias || "Unknown",
    reporterLookingFor: reporter ? intentLabel(reporter.lookingFor) : "",
    reportedLookingFor: reported ? intentLabel(reported.lookingFor) : "",
    reportedRemoved: !!reported?.removedAt
  };
}


function activePlayersForRound(game, round) {
  const now = Date.now();
  return getGamePlayers(game).filter(player => {
    if (player.isActive === false) return false;
    if ((player.eligibleRound || 1) > round) return false;
    if (!player.lastSeenAt) return true;
    const ageSeconds = (now - new Date(player.lastSeenAt).getTime()) / 1000;
    return ageSeconds <= getGameFlow(game).inactiveAfterSeconds;
  });
}

function publicGame(game) {
  if (!game) return null;
  updateGameClock(game);
  return {
    ...game,
    flow: getGameFlow(game),
    gameMode: getGameMode(game),
    modeLabel: getGameFlow(game).label,
    votingRound: getGameFlow(game).totalRounds + 1,
    totalGameSeconds: getGameTimeline(game).totalSeconds,
    voteCategories,
    intentCounts: countLookingFor(game),
    players: getGamePlayers(game),
    pairings: (game.currentPairingIds || []).map(id => db.pairings[id]).filter(Boolean)
  };
}

function getGameByCode(code) {
  return Object.values(db.games).find(g => g.gameCode === String(code || "").toUpperCase());
}

function clearGameData(game) {
  const playerIds = new Set(game.playerIds);
  const pairingIds = new Set(Object.values(db.pairings).filter(p => p.gameId === game.id).map(p => p.id));

  for (const id of playerIds) delete db.players[id];
  for (const id of pairingIds) delete db.pairings[id];

  db.reactions = db.reactions.filter(r => !pairingIds.has(r.pairingId));
  db.decisions = db.decisions.filter(d => d.gameId !== game.id);
  db.momentVotes = db.momentVotes.filter(v => v.gameId !== game.id);
  db.reports = db.reports.filter(r => r.gameId !== game.id);

  game.status = "lobby";
  game.phaseType = "lobby";
  game.phaseLabel = "Lobby";
  game.currentRound = 0;
  game.startedAt = null;
  game.phaseEndsAt = null;
  game.gameEndsAt = null;
  game.pausedAt = null;
  game.pauseLabel = null;
  game.playerIds = [];
  game.previousPairs = [];
  game.currentPairingIds = [];
  game.sittingOutIds = [];
  game.roundsCreated = [];
  game.resetVersion = (game.resetVersion || 0) + 1;
}

function ensureRoundPairings(game, round) {
  if (!round || round < 1 || round > getGameFlow(game).totalRounds) return;
  if ((game.roundsCreated || []).includes(round)) {
    game.currentPairingIds = Object.values(db.pairings)
      .filter(p => p.gameId === game.id && p.round === round)
      .map(p => p.id);
    return;
  }

  const players = activePlayersForRound(game, round);
  const previousKeys = new Set(game.previousPairs || []);
  const { groups, sittingOut } = createPairings(players, previousKeys);

  const pairings = groups.map(group => {
    const playerIds = group.players.map(p => p.id);
    const category = weightedCategoryForGroup(group.players, round, getGameMode(game));
    const shared = sharedInterests(group.players);
    const id = nanoid();

    // Track every pair inside a trio as already introduced.
    for (let i = 0; i < group.players.length; i++) {
      for (let j = i + 1; j < group.players.length; j++) {
        game.previousPairs.push(pairKey(group.players[i], group.players[j]));
      }
    }

    const pairing = {
      id,
      gameId: game.id,
      round,
      type: group.type,
      playerIds,
      category,
      sharedInterests: shared,
      categoryReason: shared.includes(category) ? "Planned app + shared spark" : "Planned app journey",
      prompts: promptsFor(category),
      score: group.score,
      createdAt: new Date().toISOString()
    };

    db.pairings[id] = pairing;
    return pairing;
  });

  game.currentPairingIds = pairings.map(p => p.id);
  game.sittingOutIds = sittingOut.map(p => p.id);
  game.roundsCreated = [...(game.roundsCreated || []), round];
}

function updateGameClock(game) {
  if (!game || game.status === "lobby" || game.status === "complete") return;
  if (game.status === "paused") return;
  if (!game.startedAt) return;

  const elapsed = Math.floor((Date.now() - new Date(game.startedAt).getTime()) / 1000);
  const timeline = getGameTimeline(game);
  const phase = phaseAtElapsed(elapsed, timeline);

  if (!phase) {
    game.status = "complete";
    game.phaseType = "complete";
    game.phaseLabel = "Game Complete";
    game.currentRound = 10;
    game.phaseEndsAt = new Date().toISOString();
    game.currentPairingIds = [];
    return;
  }

  game.phaseType = phase.type;
  game.phaseLabel = phase.label;
  game.currentRound = phase.round;
  game.phaseEndsAt = iso(new Date(game.startedAt).getTime() + phase.endOffset * 1000);
  game.gameEndsAt = iso(new Date(game.startedAt).getTime() + timeline.totalSeconds * 1000);

  if (phase.type === "intro") {
    game.status = "intro";
    game.currentPairingIds = [];
  }

  if (phase.type === "talk") {
    game.status = "round_active";
    ensureRoundPairings(game, phase.round);
  }

  if (phase.type === "rate") {
    game.status = "rating";
    ensureRoundPairings(game, phase.round);
  }

  if (phase.type === "break") {
    game.status = "break";
    game.currentPairingIds = [];
  }

  if (phase.type === "voting") {
    game.status = "voting";
    game.currentPairingIds = [];
  }
}

function getPairingForPlayer(game, playerId) {
  updateGameClock(game);
  return Object.values(db.pairings).find(p =>
    p.gameId === game.id &&
    p.round === game.currentRound &&
    (p.playerIds || []).includes(playerId)
  );
}

function buildAwards(game) {
  return voteCategories.map(category => {
    const counts = {};
    db.momentVotes
      .filter(v => v.gameId === game.id && v.categoryKey === category.key)
      .forEach(v => counts[v.toPlayerId] = (counts[v.toPlayerId] || 0) + 1);

    const winnerId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      title: category.award,
      categoryKey: category.key,
      winnerId: winnerId || null,
      winner: winnerId ? db.players[winnerId]?.nickname : "No votes yet",
      votes: winnerId ? counts[winnerId] : 0
    };
  });
}

function getSharedHistory(gameId, aId, bId) {
  const shared = new Set();
  const metRounds = [];

  Object.values(db.pairings)
    .filter(p => p.gameId === gameId && (p.playerIds || []).includes(aId) && (p.playerIds || []).includes(bId))
    .forEach(pairing => {
      metRounds.push(pairing.round);
      (pairing.sharedInterests || []).forEach(x => shared.add(x));
    });

  return { sharedInterests: [...shared], metRounds };
}

function reactionScoreBetween(aId, bId) {
  return db.reactions
    .filter(r => (r.fromPlayerId === aId && r.toPlayerId === bId) || (r.fromPlayerId === bId && r.toPlayerId === aId))
    .reduce((sum, r) => sum + (r.reactionType === "fire" ? 3 : r.reactionType === "vibe" ? 2 : 1), 0);
}

function connectionStrength(aDecision, bDecision) {
  const bothYes = aDecision?.decision === "yes" && bDecision?.decision === "yes";
  const bothOutside = [aDecision?.outsideChoice, bDecision?.outsideChoice].every(x => ["definitely", "open"].includes(x));
  if (bothYes && bothOutside) return "Strong Spark";
  return "Possible Spark";
}

function buildPlayerConnections(player, game) {
  const mine = db.decisions.filter(d =>
    d.gameId === game.id &&
    d.fromPlayerId === player.id &&
    ["yes", "maybe"].includes(d.decision) &&
    ["definitely", "open"].includes(d.outsideChoice)
  );

  const connections = [];

  for (const a of mine) {
    const b = db.decisions.find(d =>
      d.gameId === game.id &&
      d.fromPlayerId === a.toPlayerId &&
      d.toPlayerId === a.fromPlayerId &&
      ["yes", "maybe"].includes(d.decision) &&
      ["definitely", "open"].includes(d.outsideChoice)
    );

    if (!b) continue;

    const partner = db.players[a.toPlayerId];
    if (!partner) continue;

    const history = getSharedHistory(game.id, player.id, partner.id);
    const score = reactionScoreBetween(player.id, partner.id);
    const reasons = [];

    if (history.sharedInterests.length) {
      reasons.push(`${history.sharedInterests.length} shared spark${history.sharedInterests.length === 1 ? "" : "s"}: ${history.sharedInterests.join(", ")}`);
    }

    if (score > 0) {
      reasons.push(`${score} reaction point${score === 1 ? "" : "s"} between you`);
    }

    reasons.push(`You both chose ${connectionStrength(a, b).toLowerCase()}`);

    connections.push({
      partner: {
        id: partner.id,
        nickname: partner.nickname,
        realName: partner.realName || "",
        contactHandle: partner.contactHandle || "",
        persona: partner.persona || ""
      },
      strength: connectionStrength(a, b),
      metRounds: history.metRounds,
      reasons
    });
  }

  return connections;
}

function buildPlayerRecap(player, game) {
  const allPairings = Object.values(db.pairings)
    .filter(p => p.gameId === game.id && (p.playerIds || []).includes(player.id));

  const completedRounds = [...new Set(allPairings.map(p => p.round))].sort((a, b) => a - b);

  const reactionsGiven = db.reactions.filter(r => r.fromPlayerId === player.id);
  const reactionsReceived = db.reactions.filter(r => r.toPlayerId === player.id);
  const votesCast = db.momentVotes.filter(v => v.gameId === game.id && v.fromPlayerId === player.id);
  const votesReceived = db.momentVotes.filter(v => v.gameId === game.id && v.toPlayerId === player.id);
  const awardsWon = buildAwards(game).filter(a => a.winnerId === player.id);
  const connections = buildPlayerConnections(player, game);

  return {
    player,
    game: publicGame(game),
    roundsCompleted: completedRounds.length,
    completedRounds,
    reactionsGiven: reactionsGiven.length,
    reactionsReceived: reactionsReceived.length,
    votesCast: votesCast.length,
    votesReceived: votesReceived.length,
    awardsWon,
    connections
  };
}

app.get("/api/health", (req, res) => res.json({
  ok: true,
  version: "v12",
  storage: USE_POSTGRES ? "postgresql" : "memory",
  persistenceReady
}));

app.post("/api/host/login", (req, res) => {
  if (String(req.body?.pin || "") !== HOST_PIN) {
    return res.status(401).json({ error: "Invalid host PIN" });
  }
  res.json({ success: true });
});

app.get("/api/session-counts", (req, res) => {
  const sessions = Object.values(db.games)
    .map(publicGame)
    .filter(game => game.status !== "complete")
    .map(game => {
      const counts = {};
      lookingForOptions.forEach(option => counts[option.value] = 0);
      (game.players || []).forEach(player => {
        if (counts[player.lookingFor] !== undefined) counts[player.lookingFor] += 1;
      });

      return {
        id: game.id,
        venueName: game.venueName,
        gameCode: game.status === "lobby" ? game.gameCode : null,
        status: game.status,
        phaseLabel: game.phaseLabel,
        modeLabel: game.modeLabel,
        playerCount: game.players.length,
        counts: Object.fromEntries(Object.entries(counts).map(([key, count]) => [key, {
          count,
          display: count === 0 ? "0" : count < 3 ? "fewer than 3" : String(count)
        }]))
      };
    });

  res.json({ sessions });
});

app.get("/api/game-modes", (req, res) => res.json(Object.values(GAME_MODES)));

app.get("/api/games", requireHost, (req, res) => {
  const games = Object.values(db.games).map(publicGame).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(games.map(g => ({
    id: g.id,
    gameCode: g.gameCode,
    venueName: g.venueName,
    status: g.status,
    phaseLabel: g.phaseLabel,
    currentRound: g.currentRound,
    playerCount: g.players.length,
    safetyReportCount: db.reports.filter(r => r.gameId === g.id).length,
    openSafetyReportCount: db.reports.filter(r => r.gameId === g.id && r.status !== "reviewed").length,
    intentCounts: countLookingFor(g),
    createdAt: g.createdAt,
    resetVersion: g.resetVersion || 0
  })));
});

app.post("/api/games", requireHost, (req, res) => {
  const id = nanoid();
  db.games[id] = {
    id,
    gameCode: makeCode(),
    venueName: req.body.venueName || "BARFLY DATE",
    gameMode: GAME_MODES[req.body.gameMode] ? req.body.gameMode : DEFAULT_GAME_MODE,
    status: "lobby",
    phaseType: "lobby",
    phaseLabel: "Lobby",
    currentRound: 0,
    startedAt: null,
    phaseEndsAt: null,
    gameEndsAt: null,
    playerIds: [],
    previousPairs: [],
    currentPairingIds: [],
    sittingOutIds: [],
    roundsCreated: [],
    resetVersion: 0,
    createdAt: new Date().toISOString()
  };
  res.json(publicGame(db.games[id]));
});

app.get("/api/games/code/:code", (req, res) => {
  const game = getGameByCode(req.params.code);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(publicGame(game));
});

app.get("/api/games/:gameId", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(publicGame(game));
});

app.post("/api/games/:gameId/start-game", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (game.status !== "lobby") return res.status(400).json({ error: "Reset this game before starting again." });

  game.startedAt = new Date().toISOString();
  game.status = "intro";
  game.phaseType = "intro";
  game.phaseLabel = "Opening / Instructions";
  game.currentRound = 0;
  game.previousPairs = [];
  game.currentPairingIds = [];
  game.sittingOutIds = [];
  game.roundsCreated = [];

  res.json(publicGame(game));
});

app.post("/api/games/:gameId/pause", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);
  if (["lobby", "complete"].includes(game.status)) return res.status(400).json({ error: "Game is not running." });
  game.pausedAt = new Date().toISOString();
  game.pauseLabel = game.phaseLabel;
  game.statusBeforePause = game.status;
  game.status = "paused";
  res.json(publicGame(game));
});

app.post("/api/games/:gameId/resume", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (game.status !== "paused" || !game.pausedAt) return res.status(400).json({ error: "Game is not paused." });

  const pauseMs = Date.now() - new Date(game.pausedAt).getTime();
  game.startedAt = iso(new Date(game.startedAt).getTime() + pauseMs);
  game.pausedAt = null;
  game.pauseLabel = null;
  game.status = game.statusBeforePause || "intro";
  game.statusBeforePause = null;
  updateGameClock(game);
  res.json(publicGame(game));
});

app.post("/api/games/:gameId/skip-phase", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (!game.startedAt || game.status === "complete") return res.status(400).json({ error: "No active phase to skip." });
  if (game.status === "paused") return res.status(400).json({ error: "Resume before skipping." });

  const elapsed = Math.floor((Date.now() - new Date(game.startedAt).getTime()) / 1000);
  const timeline = getGameTimeline(game);
  const next = timeline.phases.find(p => p.startOffset > elapsed);
  if (!next) {
    game.status = "complete";
  } else {
    game.startedAt = iso(Date.now() - next.startOffset * 1000);
  }
  updateGameClock(game);
  res.json(publicGame(game));
});

app.post("/api/games/:gameId/end-game", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  game.startedAt = iso(Date.now() - getVotingOffset(game) * 1000);
  updateGameClock(game);
  res.json(publicGame(game));
});

app.post("/api/games/:gameId/reset", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  clearGameData(game);
  res.json(publicGame(game));
});

app.delete("/api/games/:gameId", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  clearGameData(game);
  delete db.games[req.params.gameId];
  res.json({ success: true });
});


const demoFirstNames = ["Avery","Jordan","Riley","Morgan","Taylor","Casey","Skyler","Cameron","Quinn","Parker","Hayden","Reese","Rowan","Logan","Emerson","Drew","Sydney","Blake","Harper","Dakota","Kendall","Bailey","Finley","Mason"];
const demoGenders = ["man", "woman", "custom"];
const demoInterested = ["women", "men", "everyone"];
const demoLooking = ["friends_only", "activity_partners", "casual_dating", "serious_dating", "marriage"];

function demoPick(items, index = 0) {
  return items[index % items.length];
}

function buildPlayerConnectionsForGame(game) {
  const matches = [];
  for (const player of getGamePlayers(game)) {
    for (const connection of buildPlayerConnections(player, game)) {
      const key = [player.id, connection.partner.id].sort().join("-");
      if (!matches.some(match => match.key === key)) {
        matches.push({ key, playerA: player.nickname, playerB: connection.partner.nickname, strength: connection.strength });
      }
    }
  }
  return matches;
}

app.post("/api/games/:gameId/demo-players", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  if (game.status !== "lobby") {
    return res.status(400).json({ error: "Demo players can only be added before the host starts the session." });
  }

  const count = Math.max(2, Math.min(Number(req.body?.count || 12), 60));
  for (let i = 0; i < count; i++) {
    const id = nanoid();
    const interests = [
      categories[(i + 2) % categories.length],
      categories[(i + 5) % categories.length],
      categories[(i + 7) % categories.length]
    ];

    const player = {
      id,
      gameId: game.id,
      joinedResetVersion: game.resetVersion || 0,
      eligibleRound: 1,
      nickname: generateUniqueAlias(game, aliasNames[i % aliasNames.length]),
      persona: "Demo guest for testing the full event flow",
      realName: `${demoPick(demoFirstNames, i)} Demo`,
      contactHandle: `demo${i + 1}@barflydate.test`,
      gender: demoPick(demoGenders, i),
      interestedIn: demoPick(demoInterested, i + 1),
      lookingFor: demoPick(demoLooking, i),
      interests,
      customQ1: "What is one green flag you notice quickly?",
      customQ2: "What makes a conversation feel easy?",
      isActive: true,
      points: 0,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isDemo: true
    };

    db.players[id] = player;
    game.playerIds.push(id);
  }

  res.json(publicGame(game));
});

app.get("/api/games/:gameId/export", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  const publicPlayers = getGamePlayers(game);
  const lookingForBreakdown = {};
  lookingForOptions.forEach(option => lookingForBreakdown[option.value] = {
    label: option.label,
    count: publicPlayers.filter(player => player.lookingFor === option.value).length
  });

  const gamePairings = Object.values(db.pairings).filter(pairing => pairing.gameId === game.id);
  const gameReports = db.reports.filter(report => report.gameId === game.id).map(publicReport);
  const gameVotes = db.momentVotes.filter(vote => vote.gameId === game.id);
  const gameDecisions = db.decisions.filter(decision => decision.gameId === game.id);
  const gameReactions = db.reactions.filter(reaction => gamePairings.some(pairing => pairing.id === reaction.pairingId));

  const exportData = {
    exportedAt: new Date().toISOString(),
    game: {
      id: game.id,
      gameCode: game.gameCode,
      venueName: game.venueName,
      status: game.status,
      phaseLabel: game.phaseLabel,
      gameMode: game.gameMode,
      modeLabel: getGameFlow(game).label,
      currentRound: game.currentRound,
      createdAt: game.createdAt,
      startedAt: game.startedAt,
      gameEndsAt: game.gameEndsAt
    },
    summary: {
      playerCount: publicPlayers.length,
      activePlayers: publicPlayers.filter(player => player.isActive).length,
      removedPlayers: publicPlayers.filter(player => player.removedAt).length,
      reportCount: gameReports.length,
      reactionCount: gameReactions.length,
      decisionCount: gameDecisions.length,
      momentVoteCount: gameVotes.length,
      mutualMatchCount: buildPlayerConnectionsForGame(game).length
    },
    lookingForBreakdown,
    appOrder: appOrderForGameMode(getGameMode(game)),
    awards: buildAwards(game),
    reports: gameReports,
    players: publicPlayers.map(player => ({
      id: player.id,
      nickname: player.nickname,
      persona: player.persona,
      lookingFor: player.lookingFor,
      gender: player.gender,
      interestedIn: player.interestedIn,
      interests: player.interests,
      isActive: player.isActive,
      removedAt: player.removedAt || null,
      isDemo: Boolean(player.isDemo),
      points: player.points
    })),
    pairings: gamePairings,
    reactions: gameReactions,
    decisions: gameDecisions,
    momentVotes: gameVotes
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="BARFLYDATE_${game.gameCode}_export.json"`);
  res.json(exportData);
});


app.post("/api/join", (req, res) => {
  const game = getGameByCode(req.body.gameCode);
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  if (game.status !== "lobby") {
    return res.status(400).json({ error: "This session has already started. Please ask the host for the next game code." });
  }

  const id = nanoid();
  const eligibleRound = game.status === "lobby" || game.status === "intro"
    ? 1
    : Math.min((game.currentRound || 0) + 1, getGameFlow(game).totalRounds + 1);

  const player = {
    id,
    gameId: game.id,
    joinedResetVersion: game.resetVersion || 0,
    eligibleRound,
    nickname: generateUniqueAlias(game, req.body.nickname),
    persona: req.body.persona || "Private spark, sharp instincts",
    realName: req.body.realName || "",
    contactHandle: req.body.contactHandle || "",
    gender: req.body.gender || "custom",
    interestedIn: req.body.interestedIn || "everyone",
    lookingFor: req.body.lookingFor || "activity_partners",
    interests: req.body.interests || [],
    customQ1: req.body.customQ1 || "What is something that instantly makes you smile?",
    customQ2: req.body.customQ2 || "What makes someone easy to talk to?",
    isActive: true,
    points: 0,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  db.players[id] = player;
  game.playerIds.push(id);
  res.json(player);
});


app.get("/api/games/:gameId/reports", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  const reports = db.reports
    .filter(report => report.gameId === game.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(publicReport);

  res.json({
    gameId: game.id,
    gameCode: game.gameCode,
    reportCount: reports.length,
    reports
  });
});

app.post("/api/reports", (req, res) => {
  const { fromPlayerId, toPlayerId, reason, note } = req.body;
  const reporter = db.players[fromPlayerId];
  const reported = db.players[toPlayerId];

  if (!reporter || !reported) return res.status(404).json({ error: "Player not found" });
  if (reporter.gameId !== reported.gameId) return res.status(400).json({ error: "Players are not in the same session" });

  const game = db.games[reporter.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  updateGameClock(game);
  const pairing = getPairingForPlayer(game, reporter.id);

  const validReasons = ["rude", "inappropriate", "would_not_stop", "unsafe", "other"];
  const safeReason = validReasons.includes(reason) ? reason : "other";

  const report = {
    id: nanoid(),
    gameId: game.id,
    gameCode: game.gameCode,
    fromPlayerId: reporter.id,
    toPlayerId: reported.id,
    reporterAlias: reporter.nickname,
    reportedAlias: reported.nickname,
    reason: safeReason,
    note: String(note || "").slice(0, 500),
    round: game.currentRound,
    phaseType: game.phaseType,
    phaseLabel: game.phaseLabel,
    pairingId: pairing?.id || null,
    status: "open",
    createdAt: new Date().toISOString()
  };

  db.reports.push(report);
  res.json({ success: true, report: publicReport(report) });
});

app.post("/api/games/:gameId/remove-player", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  const player = db.players[req.body.playerId];
  if (!player || player.gameId !== game.id) return res.status(404).json({ error: "Player not found in this session" });

  player.isActive = false;
  player.removedAt = new Date().toISOString();

  // Remove the player from any active/current pairing so the rest of the group can refresh cleanly.
  Object.values(db.pairings)
    .filter(pairing => pairing.gameId === game.id && pairing.round === game.currentRound && (pairing.playerIds || []).includes(player.id))
    .forEach(pairing => {
      pairing.playerIds = pairing.playerIds.filter(id => id !== player.id);
      pairing.removedPlayerIds = [...(pairing.removedPlayerIds || []), player.id];
    });

  game.currentPairingIds = (game.currentPairingIds || []).filter(pairingId => {
    const pairing = db.pairings[pairingId];
    return pairing && (pairing.playerIds || []).length >= 2;
  });

  res.json(publicGame(game));
});

app.post("/api/reports/:reportId/review", requireHost, (req, res) => {
  const report = db.reports.find(r => r.id === req.params.reportId);
  if (!report) return res.status(404).json({ error: "Report not found" });
  report.status = "reviewed";
  report.reviewedAt = new Date().toISOString();
  res.json({ success: true, report: publicReport(report) });
});


app.get("/api/player/:playerId/state", (req, res) => {
  const player = db.players[req.params.playerId];
  if (!player) return res.status(404).json({ error: "Player not found or game was reset" });
  const game = db.games[player.gameId];
  if (!game) return res.status(404).json({ error: "Game not found or deleted" });

  if ((game.resetVersion || 0) !== (player.joinedResetVersion || 0)) {
    return res.status(410).json({ error: "Game was reset. Please rejoin with the current game code.", reset: true });
  }

  if (player.removedAt) {
    updateGameClock(game);
    return res.json({
      removed: true,
      message: "You have been removed from this session. Please see the host if you believe this was a mistake.",
      player,
      game: publicGame(game),
      pairing: null,
      partners: [],
      myDecisions: []
    });
  }

  player.lastSeenAt = new Date().toISOString();
  player.isActive = true;
  updateGameClock(game);

  const pairing = getPairingForPlayer(game, player.id);
  const partners = pairing
    ? pairing.playerIds.filter(id => id !== player.id).map(id => db.players[id]).filter(Boolean)
    : [];

  const myDecisions = pairing
    ? partners.map(partner => db.decisions.find(d => d.fromPlayerId === player.id && d.toPlayerId === partner.id && d.round === game.currentRound)).filter(Boolean)
    : [];

  res.json({
    player,
    game: publicGame(game),
    pairing,
    partners,
    myDecisions
  });
});

app.post("/api/reactions", (req, res) => {
  const { pairingId, fromPlayerId, toPlayerId, reactionType } = req.body;
  const valid = ["vibe", "fire", "energy", "more"];
  if (!valid.includes(reactionType)) return res.status(400).json({ error: "Invalid reaction type" });

  // One reaction type per target per round/pairing to reduce spam.
  db.reactions = db.reactions.filter(r => !(r.pairingId === pairingId && r.fromPlayerId === fromPlayerId && r.toPlayerId === toPlayerId && r.reactionType === reactionType));

  const reaction = { id: nanoid(), pairingId, fromPlayerId, toPlayerId, reactionType, createdAt: new Date().toISOString() };
  db.reactions.push(reaction);

  const toPlayer = db.players[toPlayerId];
  if (toPlayer) toPlayer.points += reactionType === "fire" ? 3 : reactionType === "vibe" ? 2 : 1;
  res.json(reaction);
});

app.post("/api/decision", (req, res) => {
  const { fromPlayerId, toPlayerId, decision, outsideChoice } = req.body;
  const fromPlayer = db.players[fromPlayerId];
  if (!fromPlayer) return res.status(404).json({ error: "Player not found" });
  const game = db.games[fromPlayer.gameId];
  updateGameClock(game);

  const validDecision = ["yes", "maybe", "skip"];
  const validOutside = ["definitely", "open", "not_really"];
  if (!validDecision.includes(decision)) return res.status(400).json({ error: "Invalid decision" });
  if (!validOutside.includes(outsideChoice)) return res.status(400).json({ error: "Invalid outside choice" });

  db.decisions = db.decisions.filter(d => !(d.fromPlayerId === fromPlayerId && d.toPlayerId === toPlayerId && d.round === game.currentRound));

  const saved = {
    id: nanoid(),
    gameId: game.id,
    round: game.currentRound,
    fromPlayerId,
    toPlayerId,
    decision,
    outsideChoice,
    createdAt: new Date().toISOString()
  };
  db.decisions.push(saved);
  res.json(saved);
});

app.get("/api/player/:playerId/moment-votes", (req, res) => {
  const player = db.players[req.params.playerId];
  if (!player) return res.status(404).json({ error: "Player not found or game was reset" });
  const game = db.games[player.gameId];
  updateGameClock(game);

  const players = game.playerIds.map(id => db.players[id]).filter(Boolean).filter(p => p.id !== player.id);
  const myVotes = db.momentVotes.filter(v => v.gameId === game.id && v.fromPlayerId === player.id);
  res.json({ player, game: publicGame(game), players, voteCategories, myVotes });
});

app.post("/api/moment-votes", (req, res) => {
  const { fromPlayerId, toPlayerId, categoryKey } = req.body;
  const fromPlayer = db.players[fromPlayerId];
  const toPlayer = db.players[toPlayerId];
  if (!fromPlayer || !toPlayer) return res.status(404).json({ error: "Player not found" });
  const game = db.games[fromPlayer.gameId];

  if (!voteCategories.some(c => c.key === categoryKey)) return res.status(400).json({ error: "Invalid vote category" });
  if (fromPlayerId === toPlayerId) return res.status(400).json({ error: "Players cannot vote for themselves" });

  db.momentVotes = db.momentVotes.filter(v => !(v.gameId === game.id && v.fromPlayerId === fromPlayerId && v.categoryKey === categoryKey));
  const vote = { id: nanoid(), gameId: game.id, fromPlayerId, toPlayerId, categoryKey, createdAt: new Date().toISOString() };
  db.momentVotes.push(vote);
  res.json(vote);
});

app.get("/api/games/:gameId/results", (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  const players = getGamePlayers(game).sort((a, b) => b.points - a.points);
  const mutualMatches = [];

  for (const a of db.decisions.filter(d => d.gameId === game.id && ["yes", "maybe"].includes(d.decision) && ["definitely", "open"].includes(d.outsideChoice))) {
    const b = db.decisions.find(d =>
      d.gameId === game.id &&
      d.fromPlayerId === a.toPlayerId &&
      d.toPlayerId === a.fromPlayerId &&
      ["yes", "maybe"].includes(d.decision) &&
      ["definitely", "open"].includes(d.outsideChoice)
    );
    if (!b) continue;
    const key = [a.fromPlayerId, a.toPlayerId].sort().join("-");
    if (mutualMatches.find(m => m.key === key)) continue;
    mutualMatches.push({
      key,
      playerA: { nickname: db.players[a.fromPlayerId]?.nickname },
      playerB: { nickname: db.players[a.toPlayerId]?.nickname },
      strength: connectionStrength(a, b)
    });
  }

  res.json({ players, awards: buildAwards(game), mutualMatches, momentVotes: db.momentVotes.filter(v => v.gameId === game.id) });
});

app.get("/api/player/:playerId/connections", (req, res) => {
  const player = db.players[req.params.playerId];
  if (!player) return res.status(404).json({ error: "Player not found" });

  const game = db.games[player.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  updateGameClock(game);
  res.json({ player, game: publicGame(game), connections: buildPlayerConnections(player, game) });
});

app.get("/api/player/:playerId/recap", (req, res) => {
  const player = db.players[req.params.playerId];
  if (!player) return res.status(404).json({ error: "Player not found" });

  const game = db.games[player.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  updateGameClock(game);
  res.json(buildPlayerRecap(player, game));
});


const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => res.sendFile(path.join(clientDist, "index.html")));

initPersistence().then(() => {
  app.listen(PORT, () => console.log(`BARFLY DATE v12 running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to initialize persistence:", err);
  process.exit(1);
});
