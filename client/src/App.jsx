/* BARFLYDATE v9 safety build: removed duplicate Results function declaration */
import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";
const APP_VERSION = "BARFLYDATE v18";

function getHostPin() {
  return localStorage.getItem("barflydateHostPin") || "";
}

function hostHeaders(json = false) {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    "x-host-pin": getHostPin()
  };
}

async function hostFetch(url, options = {}) {
  const headers = { ...(options.headers || {}), ...hostHeaders(Boolean(options.body)) };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("barflydateHostPin");
    window.location.href = "/host";
    throw new Error("Host PIN required");
  }
  return res;
}


const categories = ["Hobbies","Travel","Food & Drink","Entertainment","Life Goals","Values","Adventure","Lifestyle","Quirks"];

const lookingForOptions = [
  { value: "friends_only", label: "Friends Only" },
  { value: "activity_partners", label: "Activity Partners" },
  { value: "casual_dating", label: "Casual Dating" },
  { value: "serious_dating", label: "Serious Dating" },
  { value: "marriage", label: "Marriage" }
];

const gameModeOptions = [
  { value: "quick_30", label: "30-Minute Quick Mixer", details: "4 rounds • fast pace • small groups" },
  { value: "social_60", label: "60-Minute Social Game", details: "6 rounds • balanced pace • medium crowds" },
  { value: "full_90", label: "90-Minute Full Experience", details: "9 rounds + final voting • premium event" }
];


const appOrders = {
  quick_30: ["Food & Drink", "Entertainment", "Lifestyle", "Quirks"],
  social_60: ["Food & Drink", "Entertainment", "Hobbies", "Lifestyle", "Adventure", "Values"],
  full_90: ["Food & Drink", "Entertainment", "Hobbies", "Travel", "Adventure", "Lifestyle", "Quirks", "Values", "Life Goals"]
};

function appOrderForMode(value) {
  return appOrders[value] || appOrders.full_90;
}

function AppJourney({ mode, activeRound = 0 }) {
  const order = appOrderForMode(mode);
  return <div className="journeyGrid">
    {order.map((appName, index) => <div key={`${appName}-${index}`} className={activeRound === index + 1 ? "journeyChip active" : "journeyChip"}>
      <span>{index + 1}</span>
      <b>{emojiFor(appName)} {appName}</b>
    </div>)}
  </div>;
}



function StorageStatus({ health }) {
  if (!health) return <span className="statusPill">Storage checking...</span>;
  const connected = health.storage === "postgresql" && health.persistenceReady;
  return <span className={connected ? "statusPill storageOk" : "statusPill storageWarn"}>
    Storage: {connected ? "PostgreSQL connected" : "Temporary memory only"}
  </span>;
}


function gameModeLabel(value) {
  const match = gameModeOptions.find(option => option.value === value);
  return match?.label || "90-Minute Full Experience";
}

const reportReasons = [
  { value: "rude", label: "Rude or disrespectful" },
  { value: "inappropriate", label: "Inappropriate comments" },
  { value: "would_not_stop", label: "Would not stop after I said no" },
  { value: "unsafe", label: "Unsafe behavior" },
  { value: "other", label: "Other" }
];

function lookingForLabel(value) {
  const match = lookingForOptions.find(option => option.value === value);
  if (match) return match.label;
  if (value === "date") return "Casual Dating";
  if (value === "friend") return "Friends Only";
  if (value === "social") return "Activity Partners";
  return value || "Not selected";
}

function privacyCount(count) {
  if (!count) return "0";
  if (count > 0 && count < 3) return "fewer than 3";
  return String(count);
}

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

function randomAliasName() {
  return aliasNames[Math.floor(Math.random() * aliasNames.length)];
}

const personas = [
  "Slow burn, observant, witty",
  "High energy, playful, curious",
  "Deep talk, soft heart, sharp mind",
  "Adventurous, spontaneous, bold",
  "Warm, grounded, easy to talk to"
];

function useRoute() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return { parts };
}

function Button({ children, className = "", ...props }) {
  return <button className={`btn ${className}`} {...props}>{children}</button>;
}

function HostLogin() {
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState("");

  async function login() {
    setError("");
    const res = await fetch(`${API}/host/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setError(data.error || "Invalid host PIN");
      return;
    }
    localStorage.setItem("barflydateHostPin", pin);
    window.location.reload();
  }

  return <div className="screen premiumEntry">
    <div className="brandMark">HOST ACCESS</div>
    <h1>Enter Host PIN</h1>
    <p className="tagline">The host suite is private. Players only use join, vote, recap, and reveal screens.</p>
    {error && <div className="alert">{error}</div>}

    {reports.some(report => report.status !== "reviewed") && <div className="safetyNotification">
      <div className="brandMark">SAFETY ALERT</div>
      <h2>{reports.filter(report => report.status !== "reviewed").length} Open Safety Report{reports.filter(report => report.status !== "reviewed").length === 1 ? "" : "s"}</h2>
      <p>Scroll to the Safety Panel to review the report and remove the player if needed.</p>
    </div>}
    <div className="card glowCard">
      <label>Host PIN</label>
      <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Enter PIN" />
      <Button onClick={login}>Unlock Host Suite</Button>
    </div>
  </div>;
}


function Countdown({ endsAt, status }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!endsAt || status === "paused") return <span>Paused</span>;
  const seconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000));
  const min = Math.floor(seconds / 60);
  const sec = String(seconds % 60).padStart(2, "0");
  return <span>{min}:{sec}</span>;
}

function ProgressBar({ endsAt, totalSeconds = 60, status }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!endsAt || status === "paused") return <div className="progress"><span style={{width: "0%"}} /></div>;
  const remaining = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000));
  const pct = Math.max(0, Math.min(100, ((totalSeconds - remaining) / totalSeconds) * 100));
  return <div className="progress"><span style={{width: `${pct}%`}} /></div>;
}

function phaseSeconds(game) {
  if (!game) return 60;
  if (game.phaseType === "intro") return game.flow?.introSeconds || 180;
  if (game.phaseType === "talk") return game.flow?.talkSeconds || 480;
  if (game.phaseType === "rate") return game.flow?.rateSeconds || 60;
  if (game.phaseType === "break") return game.flow?.breakSeconds || 180;
  if (game.phaseType === "voting") return game.flow?.votingSeconds || 180;
  return 60;
}

function emojiFor(x) {
  return {Hobbies:"🎯",Travel:"✈️","Food & Drink":"🍸",Entertainment:"🎬","Life Goals":"🚀",Values:"❤️",Adventure:"⚡",Lifestyle:"🏡",Quirks:"🎭"}[x] || "📱";
}


function OtherSessionsPanel() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API}/session-counts`).then(r => r.json()).then(setData).catch(() => setData({ sessions: [] }));
  }, []);

  if (!data?.sessions?.length) return <div className="card">
    <h2>Other Sessions Tonight</h2>
    <p className="muted">No other active sessions yet.</p>
  </div>;

  return <div className="card">
    <h2>Other Sessions Tonight</h2>
    <p className="muted">Privacy-friendly counts only. Small groups show as “fewer than 3.”</p>
    {data.sessions.map(session => <div className="sessionDemand" key={session.id}>
      <div className="compact">
        <div>
          <b>{session.venueName}</b>
          <p className="muted">{session.modeLabel} • {session.phaseLabel}</p>
        </div>
        {session.gameCode && <span className="statusPill">Code {session.gameCode}</span>}
      </div>
      <div className="demandGrid">
        {lookingForOptions.map(option => <div className="demandChip" key={option.value}>
          <span>{option.label}</span>
          <b>{session.counts?.[option.value]?.display || "0"}</b>
        </div>)}
      </div>
    </div>)}
  </div>;
}


function Join() {
  const [form, setForm] = React.useState({
    gameCode: "",
    nickname: randomAliasName(),
    persona: personas[0],
    realName: "",
    contactHandle: "",
    gender: "man",
    interestedIn: "women",
    lookingFor: "serious_dating",
    interests: ["Food & Drink", "Entertainment"],
    customQ1: "",
    customQ2: ""
  });
  const [error, setError] = React.useState("");
  const [acceptedAgreement, setAcceptedAgreement] = React.useState(false);
  const [sessions, setSessions] = React.useState([]);

  React.useEffect(() => {
    fetch(`${API}/games`).then(res => res.json()).then(setSessions).catch(() => setSessions([]));
  }, []);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const toggleInterest = item => setForm(f => ({
    ...f,
    interests: f.interests.includes(item) ? f.interests.filter(x => x !== item) : [...f.interests, item]
  }));

  async function join() {
    setError("");
    if (!acceptedAgreement) {
      setError("Please accept the player agreement before joining.");
      return;
    }

    const res = await fetch(`${API}/join`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setError(data.error || "Could not join game.");
      return;
    }
    window.location.href = `/player/${data.id}`;
  }

  return <div className="screen premiumEntry">
    <div className="brandMark">BARFLY DATE</div>
    <h1>Enter the Night</h1>
    <p className="tagline">Tonight isn’t random. Every match is intentional.</p>

    {error && <div className="alert">{error}</div>}

    <div className="card glowCard">
      <label>Game Code</label>
      <input placeholder="Enter code from host" value={form.gameCode} onChange={e => update("gameCode", e.target.value.toUpperCase())} />

      <label>Alias</label>
      <div className="inlineInput">
        <input value={form.nickname} onChange={e => update("nickname", e.target.value)} />
        <button type="button" className="miniBtn" onClick={() => update("nickname", randomAliasName())}>Shuffle</button>
      </div>
      <p className="microcopy">Aliases are checked by the server so everyone gets a different mystery name.</p>

      <label>Vibe</label>
      <select value={form.persona} onChange={e => update("persona", e.target.value)}>
        {personas.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <label>Real Name <span className="muted">optional, only revealed on mutual spark</span></label>
      <input placeholder="Optional" value={form.realName} onChange={e => update("realName", e.target.value)} />

      <label>Contact Handle <span className="muted">optional, only revealed on mutual spark</span></label>
      <input placeholder="Phone, Instagram, or email" value={form.contactHandle} onChange={e => update("contactHandle", e.target.value)} />
    </div>

    <div className="card">
      <label>Gender</label>
      <select value={form.gender} onChange={e => update("gender", e.target.value)}>
        <option value="man">Man</option>
        <option value="woman">Woman</option>
        <option value="custom">Custom / Prefer not to say</option>
      </select>

      <label>Interested In</label>
      <select value={form.interestedIn} onChange={e => update("interestedIn", e.target.value)}>
        <option value="women">Women</option>
        <option value="men">Men</option>
        <option value="everyone">Everyone</option>
      </select>

      <label>Looking For</label>
      <select value={form.lookingFor} onChange={e => update("lookingFor", e.target.value)}>
        {lookingForOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <p className="microcopy">Sessions lock when the host starts. If you arrive late, ask for the next game code.</p>
    </div>

    <div className="card">
      <label>Choose Your Sparks</label>
      <div className="chips">{categories.map(c => <button type="button" key={c} className={form.interests.includes(c) ? "chip on" : "chip"} onClick={() => toggleInterest(c)}>{emojiFor(c)} {c}</button>)}</div>

      <label>Your Custom Question #1</label>
      <input placeholder="What makes someone easy to talk to?" value={form.customQ1} onChange={e => update("customQ1", e.target.value)} />

      <label>Your Custom Question #2</label>
      <input placeholder="What is your ideal Saturday?" value={form.customQ2} onChange={e => update("customQ2", e.target.value)} />
    </div>

    {sessions.length > 0 && <div className="card">
      <h2>Other Sessions Tonight</h2>
      <p className="muted">Counts only. Names stay private.</p>
      {sessions.map(session => <div className="sessionDemand" key={session.id}>
        <div>
          <b>{session.venueName}</b>
          <p className="muted">Code {session.gameCode} • {session.status}</p>
        </div>
        <div className="intentChips">
          {lookingForOptions.map(option => <span key={option.value} className="miniPill">{option.label}: {privacyCount(session.intentCounts?.[option.value] || 0)}</span>)}
        </div>
      </div>)}
    </div>}

    <div className="card agreementCard">
      <h2>Player Agreement</h2>
      <p className="muted">By joining, you agree to keep the experience respectful and safe.</p>
      <p className="prompt">• Be respectful. Harassment, pressure, or unsafe behavior is not allowed.</p>
      <p className="prompt">• The host may remove players from the session if needed.</p>
      <p className="prompt">• Participation is voluntary and matches are not guaranteed.</p>
      <p className="prompt">• If a session has started, ask the host for the next game code.</p>
      <label className="checkRow">
        <input type="checkbox" checked={acceptedAgreement} onChange={e => setAcceptedAgreement(e.target.checked)} />
        <span>I understand and agree.</span>
      </label>
    </div>

    <OtherSessionsPanel />

    <Button className={!acceptedAgreement ? "disabledBtn" : ""} onClick={join}>Begin Your Match</Button>
  </div>;
}

function HostManager() {
  if (!getHostPin()) return <HostLogin />;
  const [games, setGames] = React.useState([]);
  const [venueName, setVenueName] = React.useState("BARFLY DATE Night");
  const [gameMode, setGameMode] = React.useState("full_90");
  const [demoCount, setDemoCount] = React.useState(12);
  const [health, setHealth] = React.useState(null);

  async function loadGames() {
    const res = await hostFetch(`${API}/games`);
    setGames(await res.json());
  }

  React.useEffect(() => {
    loadGames();
    fetch(`${API}/health`).then(res => res.json()).then(setHealth).catch(() => setHealth(null));
    const t = setInterval(loadGames, 4000);
    return () => clearInterval(t);
  }, []);

  async function createGame() {
    const res = await fetch(`${API}/games`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ venueName, gameMode })
    });
    const data = await res.json();
    window.location.href = `/host/${data.id}`;
  }

  async function createDemoGame() {
    try {
      const res = await hostFetch(`${API}/demo-game`, {
        method: "POST",
        headers: hostHeaders(true),
        body: JSON.stringify({
          venueName: "BARFLYDATE Demo Game",
          gameMode,
          count: demoCount
        })
      });

      const data = await res.json().catch(() => ({ error: "Server returned an unreadable response." }));

      if (!res.ok || data.error) {
        alert(data.error || "Could not create demo game.");
        return;
      }

      if (!data.players || data.players.length === 0) {
        alert("Demo game was created, but no demo players were added. The server did not return demo players.");
        return;
      }

      alert(`Created test game with ${data.players.length} demo players.`);
      window.location.href = `/host/${data.id}`;
    } catch (err) {
      alert("Could not create demo game. Check Render logs and make sure v14 is deployed.");
    }
  }


  async function deleteGame(id) {
    if (!confirm("Delete this game completely?")) return;
    await hostFetch(`${API}/games/${id}`, { method: "DELETE" });
    loadGames();
  }

  const totalOpenReports = games.reduce((sum, game) => sum + (game.openSafetyReportCount || 0), 0);

  return <div className="screen">
    <div className="row"><Button className="secondary" onClick={() => { localStorage.removeItem("barflydateHostPin"); window.location.reload(); }}>Lock Host Suite</Button></div>
    <div className="brandMark">HOST SUITE</div>
    <h1>Game Manager</h1>
    <p className="tagline">Create and manage multiple BARFLY DATE game codes. Host access is PIN-protected.</p>
    <div className="versionRow">
      <span className="statusPill">{APP_VERSION}</span>
      <StorageStatus health={health} />
    </div>

    {totalOpenReports > 0 && <div className="alert">
      Safety attention needed: {totalOpenReports} open report{totalOpenReports === 1 ? "" : "s"} across active sessions.
    </div>}

    <div className="card glowCard">
      <h2>Create New Game</h2>
      <label>Event Name</label>
      <input value={venueName} onChange={e => setVenueName(e.target.value)} />

      <label>Session Length</label>
      <select value={gameMode} onChange={e => setGameMode(e.target.value)}>
        {gameModeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <p className="microcopy">{gameModeOptions.find(option => option.value === gameMode)?.details}</p>
      <h3>App Journey</h3>
      <AppJourney mode={gameMode} />

      <Button onClick={createGame}>Create Game Code</Button>
    </div>

    <div className="card glowCard testGameCard">
      <div className="brandMark">TEST MODE</div>
      <h2>Create Test Game</h2>
      <p className="muted">This instantly creates a game code and fills it with demo players so you can test rounds, voting, safety, results, and export.</p>

      <label>Demo Players</label>
      <select value={demoCount} onChange={e => setDemoCount(Number(e.target.value))}>
        <option value={8}>8 demo players</option>
        <option value={12}>12 demo players</option>
        <option value={18}>18 demo players</option>
        <option value={24}>24 demo players</option>
        <option value={36}>36 demo players</option>
      </select>

      <p className="microcopy">Uses the selected session length above: {gameModeLabel(gameMode)}</p>
      <Button onClick={createDemoGame}>Create Test Game</Button>
    </div>

    <h2>Active Games</h2>
    {games.length === 0 && <p className="muted">No games created yet.</p>}
    {games.map(game => <div className="card" key={game.id}>
      <div className="compact">
        <div>
          <h3>{game.venueName}</h3>
          <p className="muted">Code: <b>{game.gameCode}</b> • {game.playerCount} players</p>
          <p className="muted">{game.modeLabel || gameModeLabel(game.gameMode)} • {game.phaseLabel} • Round {game.currentRound}</p>
          <p className="microcopy">Apps: {(game.appOrder || appOrderForMode(game.gameMode)).join(" → ")}</p>
          <p className={game.openSafetyReportCount ? "dangerText" : "muted"}>Safety Reports: {game.openSafetyReportCount || 0} open / {game.safetyReportCount || 0} total</p>
        </div>
        <span className="statusPill">{game.status}</span>
      </div>

      <div className="intentChips">
        {lookingForOptions.map(option => <span key={option.value} className="miniPill">{option.label}: {privacyCount(game.intentCounts?.[option.value] || 0)}</span>)}
      </div>

      <div className="row">
        <Button onClick={() => window.location.href = `/host/${game.id}`}>Open Dashboard</Button>
        <Button className="danger" onClick={() => deleteGame(game.id)}>Delete</Button>
      </div>
    </div>)}
  </div>;
}

function HostGame() {
  if (!getHostPin()) return <HostLogin />;
  const { parts } = useRoute();
  const gameId = parts[1];
  const [game, setGame] = React.useState(null);
  const [reports, setReports] = React.useState([]);
  const [health, setHealth] = React.useState(null);
  const [error, setError] = React.useState("");

  async function refresh() {
    try {
      const res = await hostFetch(`${API}/games/${gameId}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Refresh failed");
        return;
      }

      const reportRes = await hostFetch(`${API}/games/${gameId}/reports`);
      const reportData = await reportRes.json().catch(() => ({ reports: [] }));

      if (!reportRes.ok || reportData.error) {
        setError(reportData.error || "Could not load safety reports.");
        setGame(data);
        setReports([]);
        return;
      }

      setGame(data);
      setReports(reportData.reports || []);
      setError("");
    } catch (err) {
      setError("Refresh failed. Make sure the server is running.");
    }
  }

  React.useEffect(() => {
    refresh();
    fetch(`${API}/health`).then(res => res.json()).then(setHealth).catch(() => setHealth(null));
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [gameId]);

  async function action(path, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    const res = await hostFetch(`${API}/games/${gameId}/${path}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok || data.error) {
      alert(data.error || "Action failed");
      return;
    }
    setGame(data);
    refresh();
  }


  function startGameWithChecklist() {
    const storageReady = health?.storage === "postgresql" && health?.persistenceReady;
    const playerCount = game.players?.length || 0;
    const warnings = [];

    if (playerCount < 2) warnings.push("At least 2 players are recommended.");
    if (!storageReady) warnings.push("Storage is temporary memory only.");
    if (reports.some(report => report.status !== "reviewed")) warnings.push("There are open safety reports.");

    const checklist = [
      `Players loaded: ${playerCount}`,
      `Session length: ${game.modeLabel || gameModeLabel(game.gameMode)}`,
      `Safety/report system: ready`,
      `Database: ${storageReady ? "PostgreSQL connected" : "temporary memory only"}`,
      `Late join lock: active after start`
    ].join("\\n");

    const warningText = warnings.length ? "\\n\\nWarnings:\\n- " + warnings.join("\\n- ") : "";
    if (!confirm(`Host Pre-Start Checklist\\n\\n${checklist}${warningText}\\n\\nStart this session now?`)) return;

    action("start-game");
  }


  async function generateDemoPlayers() {
    const count = Number(prompt("How many demo players? Try 12, 18, or 24.", "12") || 0);
    if (!count) return;

    try {
      const res = await hostFetch(`${API}/games/${gameId}/demo-players`, {
        method: "POST",
        headers: hostHeaders(true),
        body: JSON.stringify({ count })
      });
      const data = await res.json().catch(() => ({ error: "Server returned an unreadable response." }));
      if (!res.ok || data.error) return alert(data.error || "Could not create demo players.");
      alert(`Added ${data.players?.length || 0} total players to this game.`);
      setGame(data);
    } catch (err) {
      alert("Could not create demo players. Check Render logs and make sure v14 is deployed.");
    }
  }

  async function exportEvent() {
    const res = await hostFetch(`${API}/games/${gameId}/export`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return alert(data.error || "Could not export event.");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BARFLYDATE_${game.gameCode}_export.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function openPlayerView(playerId) {
    window.open(`/player/${playerId}`, "_blank");
  }

  async function copyPlayerLink(playerId) {
    const link = `${window.location.origin}/player/${playerId}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Player view link copied.");
    } catch (err) {
      prompt("Copy this player view link:", link);
    }
  }


  async function removePlayer(playerId, alias) {
    if (!confirm(`Remove ${alias} from this session?`)) return;
    const res = await fetch(`${API}/games/${gameId}/remove-player`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ playerId })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      alert(data.error || "Could not remove player.");
      return;
    }
    setGame(data);
    refresh();
  }

  async function reviewReport(reportId) {
    await hostFetch(`${API}/reports/${reportId}/review`, { method: "POST" });
    refresh();
  }

  async function createTestSafetyReport() {
    if (!confirm("Create a fake safety report to test the host Safety Alert?")) return;
    const res = await hostFetch(`${API}/games/${gameId}/test-report`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      alert(data.error || "Could not create test safety report.");
      return;
    }
    alert("Test safety report created.");
    refresh();
  }

  if (!game) return <div className="screen"><div className="brandMark">{APP_VERSION}</div><h1>Loading dashboard...</h1><p className="muted">If this hangs, confirm this is deployed as a Render Web Service and the Host PIN is correct.</p></div>;

  return <div className="screen">
    <Button className="secondary" onClick={() => window.location.href = "/host"}>All Games</Button>
    <div className="brandMark">BARFLY DATE</div>
    <h1>{game.venueName}</h1>
    <div className="versionRow">
      <span className="statusPill">{APP_VERSION}</span>
      <StorageStatus health={health} />
    </div>
    {error && <div className="alert">{error}</div>}

    <div className="card bigcode glowCard">
      <div className="muted">Game Code</div>
      <b>{game.gameCode}</b>
      <p className="muted">Player join: {window.location.origin}/join</p>
      <p className="sparkLine">{game.modeLabel || gameModeLabel(game.gameMode)}</p>
    </div>

    <div className="card">
      <div className="compact">
        <div>
          <h2>{game.phaseLabel}</h2>
          <p className="muted">Status: {game.status} • Round {game.currentRound} of {game.votingRound || 10}</p>
        </div>
        <div className="timer"><Countdown endsAt={game.phaseEndsAt} status={game.status} /></div>
      </div>
      <ProgressBar endsAt={game.phaseEndsAt} totalSeconds={phaseSeconds(game)} status={game.status} />
      <h3>App Journey</h3>
      <AppJourney mode={game.gameMode} activeRound={game.currentRound} />
      <p className="muted">Game ends: {game.gameEndsAt ? new Date(game.gameEndsAt).toLocaleTimeString() : "Not started"}</p>
      <p className="microcopy">Joining locks once the host starts the session.</p>
    </div>

    {game.status === "lobby" && <div className="card checklistCard">
      <div className="brandMark">PRE-START CHECKLIST</div>
      <p className={(game.players?.length || 0) >= 2 ? "checkOk" : "checkWarn"}>✓ Players loaded: {game.players?.length || 0}</p>
      <p className="checkOk">✓ Session length: {game.modeLabel || gameModeLabel(game.gameMode)}</p>
      <p className="checkOk">✓ Safety/report system ready</p>
      <p className={health?.storage === "postgresql" && health?.persistenceReady ? "checkOk" : "checkWarn"}>✓ Database: {health?.storage === "postgresql" && health?.persistenceReady ? "PostgreSQL connected" : "temporary memory only"}</p>
      <p className="checkOk">✓ Late join lock active after start</p>
    </div>}

    <div className="row">
      {game.status === "lobby" && <Button onClick={startGameWithChecklist}>Start {game.modeLabel || gameModeLabel(game.gameMode)}</Button>}
      {game.status !== "lobby" && game.status !== "paused" && game.status !== "complete" && <Button className="warning" onClick={() => action("pause")}>Pause</Button>}
      {game.status === "paused" && <Button onClick={() => action("resume")}>Resume</Button>}
      {game.status !== "lobby" && game.status !== "complete" && <Button className="secondary" onClick={() => action("skip-phase", "Skip to the next phase?")}>Skip Phase</Button>}
      {game.status !== "lobby" && game.status !== "complete" && <Button className="warning" onClick={() => action("end-game", "End game early and send players to voting?")}>End Game</Button>}
      <Button className="danger" onClick={() => action("reset", "Reset/Clear this game? This removes players, rounds, votes, reports, and results.")}>Reset / Clear</Button>
      <Button className="secondary" onClick={createTestSafetyReport}>Test Safety Alert</Button>
    </div>

    <h2>Safety Panel {reports.length > 0 ? `(${reports.filter(report => report.status !== "reviewed").length} open / ${reports.length} total)` : ""}</h2>
    {reports.length === 0 && <div className="card"><p className="muted">No safety reports for this session.</p></div>}
    {reports.map(report => <div className={report.status === "reviewed" ? "card reportReviewed" : "card safetyReport"} key={report.id}>
      <div className="compact">
        <div>
          <b>{report.reporterAlias} reported {report.reportedAlias}</b>
          <p className="muted">Round {report.round} • {report.phaseLabel} • {new Date(report.createdAt).toLocaleTimeString()}</p>
          <p><b>Reason:</b> {reportReasons.find(reason => reason.value === report.reason)?.label || report.reason}</p>
          {report.note && <p className="prompt">{report.note}</p>}
          <p className="muted">Status: {report.status}</p>
        </div>
        <span className="statusPill">{report.status}</span>
      </div>
      <div className="row">
        <Button className="danger" onClick={() => removePlayer(report.toPlayerId, report.reportedAlias)}>Remove Reported Player</Button>
        {report.status !== "reviewed" && <Button className="secondary" onClick={() => reviewReport(report.id)}>Mark Reviewed</Button>}
      </div>
    </div>)}

    {(game.players?.length || 0) === 0 && <div className="card alertCard"><h2>No players loaded</h2><p className="muted">For testing, click “Add Demo Players to This Game.” If this keeps happening, make sure v15 is deployed as a Web Service, not a Static Site.</p><Button onClick={generateDemoPlayers}>Add Demo Players Now</Button></div>}

    <h2>Players ({game.players?.length || 0})</h2>
    {(game.players?.length || 0) > 0 && <div className="card miniHelpCard"><p className="microcopy">Use <b>Open Player View</b> to see the game exactly like that demo/player sees it.</p><Button className="secondary" onClick={() => openPlayerView(game.players[0].id)}>Open First Player View</Button></div>}
    {(game.players || []).map(player => <div className={player.removedAt ? "card reportReviewed" : "card"} key={player.id}>
      <div className="compact">
        <div>
          <b>{player.nickname}</b>
          <p className="muted">Eligible Round {player.eligibleRound} • {lookingForLabel(player.lookingFor)} • {player.points} pts</p>
          {player.isDemo && <p className="sparkLine">Demo player</p>}
          {player.removedAt && <p className="dangerText">Removed at {new Date(player.removedAt).toLocaleTimeString()}</p>}
        </div>
        <span className="statusPill">{player.removedAt ? "removed" : player.isActive ? "active" : "inactive"}</span>
      </div>

      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => openPlayerView(player.id)}>Open Player View</Button>
        <Button className="secondary" onClick={() => copyPlayerLink(player.id)}>Copy Link</Button>
        {!player.removedAt && <Button className="danger" onClick={() => removePlayer(player.id, player.nickname)}>Remove</Button>}
      </div>
    </div>)}

    <h2>Current Pairings</h2>
    {(game.pairings || []).length === 0 && <p className="muted">No pairings in this phase.</p>}
    {(game.pairings || []).map(pairing => {
      const names = pairing.playerIds.map(id => game.players.find(p => p.id === id)?.nickname).filter(Boolean).join(" + ");
      return <div className="card" key={pairing.id}>
        <div className="compact"><b>{names}</b><span>{pairing.type}</span></div>
        <p className="muted">{pairing.categoryReason}: Round {game.currentRound} app is {pairing.category}</p>
        {pairing.sharedInterests?.length > 0 && <p className="muted">Shared: {pairing.sharedInterests.join(", ")}</p>}
      </div>;
    })}

    <div className="row">
      <Button onClick={() => window.location.href = `/results/${game.id}`}>View Results</Button>
      <Button className="secondary" onClick={refresh}>Refresh</Button>
    </div>
  </div>;
}

function Player() {
  const { parts } = useRoute();
  const playerId = parts[1];
  const [state, setState] = React.useState(null);
  const [error, setError] = React.useState("");
  const [targetId, setTargetId] = React.useState("");
  const [decision, setDecision] = React.useState("yes");
  const [outsideChoice, setOutsideChoice] = React.useState("open");
  const [saved, setSaved] = React.useState("");
  const [showReport, setShowReport] = React.useState(false);
  const [reportTargetId, setReportTargetId] = React.useState("");
  const [reportReason, setReportReason] = React.useState("rude");
  const [reportNote, setReportNote] = React.useState("");

  async function load() {
    const res = await fetch(`${API}/player/${playerId}/state`);
    const data = await res.json();
    if (!res.ok || data.error) {
      setError(data.error || "Could not load player state.");
      return;
    }
    setState(data);
    if (data.partners?.length) {
      setTargetId(current => current || data.partners[0].id);
      setReportTargetId(current => current || data.partners[0].id);
    }
  }

  React.useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, []);

  if (error) return <div className="screen"><h1>Game Update</h1><p>{error}</p><Button onClick={() => window.location.href = "/join"}>Rejoin Game</Button></div>;
  if (!state) return <div className="screen">Loading...</div>;

  if (state.removed) {
    return <div className="screen">
      <div className="brandMark">SESSION UPDATE</div>
      <h1>You’ve Been Removed</h1>
      <p className="tagline">{state.message || "You have been removed from this session. Please see the host if you believe this was a mistake."}</p>
      <Button className="secondary" onClick={() => window.location.href = "/join"}>Back to Join Screen</Button>
    </div>;
  }

  const { player, game, pairing, partners } = state;
  const partnerNames = partners?.map(p => p.nickname).join(" + ") || "your next spark";
  const activeReportTargetId = reportTargetId || targetId || partners?.[0]?.id || "";

  async function react(type) {
    if (!pairing || !targetId) return;
    await fetch(`${API}/reactions`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ pairingId: pairing.id, fromPlayerId: player.id, toPlayerId: targetId, reactionType: type })
    });
    setSaved("Locked in");
    setTimeout(() => setSaved(""), 1400);
  }

  async function saveDecision() {
    if (!targetId) return;
    await fetch(`${API}/decision`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ fromPlayerId: player.id, toPlayerId: targetId, decision, outsideChoice })
    });
    setSaved("Private signal saved");
    setTimeout(() => setSaved(""), 1400);
  }

  async function submitReport() {
    if (!activeReportTargetId) return;
    const res = await fetch(`${API}/reports`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        fromPlayerId: player.id,
        toPlayerId: activeReportTargetId,
        reason: reportReason,
        note: reportNote
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      alert(data.error || "Could not send report.");
      return;
    }

    alert("Report sent to host. Thank you.");
    setSaved("Report sent to host");
    setShowReport(false);
    setReportNote("");
    setTimeout(() => setSaved(""), 1800);
  }

  const reportPanel = partners?.length > 0 && <div className="reportPanel">
    {!showReport && <Button className="secondary" onClick={() => setShowReport(true)}>Report a Problem</Button>}
    {showReport && <div className="card safetyReport">
      <h2>Report a Problem</h2>
      <p className="muted">This goes privately to the host.</p>

      {partners.length > 1 && <>
        <label>Who are you reporting?</label>
        <select value={activeReportTargetId} onChange={e => setReportTargetId(e.target.value)}>
          {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.nickname}</option>)}
        </select>
      </>}

      {partners.length === 1 && <p className="sparkLine">Reporting: {partners[0].nickname}</p>}

      <label>Reason</label>
      <select value={reportReason} onChange={e => setReportReason(e.target.value)}>
        {reportReasons.map(reason => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
      </select>

      <label>Optional Note</label>
      <textarea placeholder="Add a brief note for the host..." value={reportNote} onChange={e => setReportNote(e.target.value)} />

      <div className="row">
        <Button className="danger" onClick={submitReport}>Submit Report</Button>
        <Button className="secondary" onClick={() => setShowReport(false)}>Cancel</Button>
      </div>
    </div>}
  </div>;

  return <div className="phone">
    <div className="topbar">
      <span>{player.nickname}</span>
      <span>Round {game.currentRound}/{game.votingRound || 10}</span>
      <span><Countdown endsAt={game.phaseEndsAt} status={game.status} /></span>
    </div>
    <ProgressBar endsAt={game.phaseEndsAt} totalSeconds={phaseSeconds(game)} status={game.status} />

    {game.status === "lobby" && <IntroCard title="You’re In" text="Waiting for the host to begin the night." />}
    {game.status === "intro" && <RulesCard />}
    {game.status === "paused" && <IntroCard title="Paused" text="The host paused the game. Stay close — the night resumes soon." />}
    {game.status === "break" && <IntroCard title="Midnight Reset" text="Grab a drink, breathe, and get ready for the next spark." />}
    {game.status === "voting" && <VotingPrompt playerId={player.id} gameId={game.id} />}
    {game.status === "complete" && <CompletePrompt playerId={player.id} gameId={game.id} />}

    {game.status === "round_active" && pairing && <>
      <div className="card glowCard">
        <div className="muted">Tonight you’re paired with</div>
        <h1>{partnerNames}</h1>
        <p className="muted">{pairing.categoryReason}: Round {game.currentRound} app is {pairing.category}</p>
        {pairing.sharedInterests?.length > 0 && <p className="sparkLine">Shared spark: {pairing.sharedInterests.join(", ")}</p>}
      </div>

      <div className="grid">{categories.map(c => <div key={c} className="appicon">
        {c === pairing.category && <span className="badge">1</span>}
        <div className="emoji">{emojiFor(c)}</div><small>{c}</small>
      </div>)}</div>

      <div className="card">
        <h2>{pairing.category}</h2>
        <p className="muted">Start here, then let the conversation move naturally.</p>
        {pairing.prompts.map((prompt, index) => <p className="prompt" key={prompt}>{index + 1}. {prompt}</p>)}
        <h2>Custom Questions</h2>
        <p className="prompt">🧠 Yours: {player.customQ1}</p>
        <p className="prompt">🧠 Yours: {player.customQ2}</p>
        {partners.map(partner => <React.Fragment key={partner.id}>
          <p className="prompt">🎭 {partner.nickname}: {partner.customQ1}</p>
          <p className="prompt">🎭 {partner.nickname}: {partner.customQ2}</p>
        </React.Fragment>)}
      </div>
      {reportPanel}
    </>}

    {game.status === "rating" && pairing && <div className="card glowCard">
      <h1>Private Signal</h1>
      <p className="muted">How did that feel? Positive signals only.</p>

      {partners.length > 1 && <><label>Who are you rating?</label><select value={targetId} onChange={e => setTargetId(e.target.value)}>{partners.map(p => <option key={p.id} value={p.id}>{p.nickname}</option>)}</select></>}
      {partners.length === 1 && <p className="sparkLine">Rating: {partners[0].nickname}</p>}

      <div className="reactions">
        <Button onClick={() => react("vibe")}>👍 Easy Chemistry</Button>
        <Button onClick={() => react("fire")}>🔥 Strong Spark</Button>
        <Button onClick={() => react("energy")}>😂 Great Energy</Button>
        <Button onClick={() => react("more")}>👀 Tell Me More</Button>
      </div>

      <h3>Would you talk to them again?</h3>
      <select value={decision} onChange={e => setDecision(e.target.value)}>
        <option value="yes">Yes</option>
        <option value="maybe">Maybe</option>
        <option value="skip">Skip</option>
      </select>

      <h3>Would you want to see this person outside this game?</h3>
      <select value={outsideChoice} onChange={e => setOutsideChoice(e.target.value)}>
        <option value="definitely">Definitely</option>
        <option value="open">Open to it</option>
        <option value="not_really">Not really</option>
      </select>

      <Button onClick={saveDecision}>Lock My Signal</Button>
      {reportPanel}
      {saved && <div className="toast">{saved}</div>}
    </div>}

    {game.status !== "round_active" && game.status !== "rating" && game.status !== "voting" && game.status !== "complete" && !pairing && game.status !== "intro" && game.status !== "break" && game.status !== "paused" && <IntroCard title="Waiting" text="You’ll be placed into the next available round." />}
    {saved && game.status !== "rating" && <div className="toast">{saved}</div>}
  </div>;
}

function IntroCard({ title, text }) {
  return <div className="card glowCard"><h1>{title}</h1><p className="muted">{text}</p></div>;
}

function RulesCard() {
  return <div className="card glowCard">
    <h1>The Rules</h1>
    <p className="prompt">1. Find your match when the round starts.</p>
    <p className="prompt">2. Talk in person — the app is only your guide.</p>
    <p className="prompt">3. Use prompts if you need them.</p>
    <p className="prompt">4. Rate privately when time is up.</p>
    <p className="prompt">5. Keep it respectful. Keep it fun.</p>
    <p className="prompt">6. Each session follows a planned app journey from fun to deeper discovery.</p>
    <p className="prompt">7. Once the host starts, the session is locked for the night.</p>
  </div>;
}

function VotingPrompt({ playerId, gameId }) {
  return <div className="card glowCard">
    <div className="brandMark">FINAL VOTING ROUND</div>
    <h1>Tonight’s Reveal Is Ready</h1>
    <p className="muted">Vote on the best moments first. Then unlock your personal recap, mutual sparks, awards, and “why you matched.”</p>
    <Button onClick={() => window.location.href = `/vote/${playerId}`}>Vote on Best Moments</Button>
    <Button className="secondary" onClick={() => window.location.href = `/recap/${playerId}`}>My Night Recap</Button>
    <Button className="secondary" onClick={() => window.location.href = `/results/${gameId}`}>View Awards</Button>
  </div>;
}

function CompletePrompt({ playerId, gameId }) {
  return <div className="card glowCard">
    <div className="brandMark">THE NIGHT IS REVEALED</div>
    <h1>Your Post-Game Reveal</h1>
    <p className="muted">Your night does not end here. Cast your moment votes, then view your personal recap and mutual sparks.</p>
    <Button onClick={() => window.location.href = `/vote/${playerId}`}>Vote on Best Moments</Button>
    <Button className="secondary" onClick={() => window.location.href = `/recap/${playerId}`}>My Night Recap</Button>
    <Button className="secondary" onClick={() => window.location.href = `/connections/${playerId}`}>Reveal My Sparks</Button>
  </div>;
}

function Vote() {
  const { parts } = useRoute();
  const playerId = parts[1];
  const [data, setData] = React.useState(null);
  const [votes, setVotes] = React.useState({});
  const [saved, setSaved] = React.useState("");

  React.useEffect(() => {
    fetch(`${API}/player/${playerId}/moment-votes`).then(r => r.json()).then(json => {
      setData(json);
      const existing = {};
      (json.myVotes || []).forEach(v => existing[v.categoryKey] = v.toPlayerId);
      setVotes(existing);
    });
  }, []);

  async function saveVote(categoryKey, toPlayerId) {
    setVotes(v => ({ ...v, [categoryKey]: toPlayerId }));
    await fetch(`${API}/moment-votes`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ fromPlayerId: playerId, toPlayerId, categoryKey }) });
    setSaved("Vote saved");
    setTimeout(() => setSaved(""), 1200);
  }

  if (!data) return <div className="screen">Loading voting...</div>;

  const completedVotes = Object.values(votes).filter(Boolean).length;
  const totalVotes = data.voteCategories.length;
  const voteComplete = completedVotes >= totalVotes;

  return <div className="screen">
    <div className="brandMark">FINAL VOTING ROUND</div>
    <h1>Vote on Best Moments</h1>
    <p className="tagline">Vote on moments, not couples. These votes create Tonight’s Moment Awards.</p>

    <div className="card compact">
      <div>
        <h2>{completedVotes} of {totalVotes} votes locked</h2>
        <p className="muted">{voteComplete ? "Your reveal is ready." : "Finish your votes to unlock the cleanest recap."}</p>
      </div>
      <span className="statusPill">{voteComplete ? "ready" : "voting"}</span>
    </div>

    {data.voteCategories.map(cat => <div className="card" key={cat.key}>
      <h2>{cat.label}</h2>
      <select value={votes[cat.key] || ""} onChange={e => saveVote(cat.key, e.target.value)}>
        <option value="">Choose a player...</option>
        {data.players.map(player => <option key={player.id} value={player.id}>{player.nickname}</option>)}
      </select>
    </div>)}

    {saved && <div className="toast">{saved}</div>}

    <div className="row">
      <Button onClick={() => window.location.href = `/recap/${playerId}`}>{voteComplete ? "View My Night Recap" : "Skip to Recap"}</Button>
      <Button className="secondary" onClick={() => window.location.href = `/connections/${playerId}`}>Reveal My Sparks</Button>
      <Button className="secondary" onClick={() => window.location.href = `/results/${data.game.id}`}>See Awards</Button>
    </div>
  </div>;
}

function Connections() {
  const { parts } = useRoute();
  const playerId = parts[1];
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API}/player/${playerId}/connections`).then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="screen">Loading connections...</div>;

  return <div className="screen">
    <div className="brandMark">PRIVATE REVEAL</div>
    <h1>Your Mutual Sparks</h1>
    <p className="tagline">Only mutual connections appear here. Contact info only appears when both people created a mutual spark.</p>

    {data.connections.length === 0 && <div className="card">
      <h2>No mutual sparks yet</h2>
      <p className="muted">This can happen if players have not finished private signals. You can still view your recap and the awards.</p>
    </div>}

    {data.connections.map((conn, i) => <div className="card glowCard" key={i}>
      <div className="brandMark">{conn.strength}</div>
      <h1>{conn.partner.nickname}</h1>
      {conn.partner.persona && <p className="sparkLine">{conn.partner.persona}</p>}

      <div className="revealBox">
        <h3>Connection Unlock</h3>
        {conn.partner.realName && <p><b>Name:</b> {conn.partner.realName}</p>}
        {conn.partner.contactHandle && <p><b>Contact:</b> {conn.partner.contactHandle}</p>}
        {!conn.partner.realName && !conn.partner.contactHandle && <p className="muted">They kept their reveal private for now.</p>}
      </div>

      <h3>Why you matched</h3>
      {conn.reasons.map(reason => <p className="prompt" key={reason}>• {reason}</p>)}
    </div>)}

    <div className="row">
      <Button onClick={() => window.location.href = `/recap/${playerId}`}>My Night Recap</Button>
      <Button className="secondary" onClick={() => window.location.href = `/results/${data.game.id}`}>View Awards</Button>
      <Button className="secondary" onClick={() => window.location.href = "/join"}>Join Another Game</Button>
    </div>
  </div>;
}

function Recap() {
  const { parts } = useRoute();
  const playerId = parts[1];
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API}/player/${playerId}/recap`).then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="screen">Loading recap...</div>;

  return <div className="screen">
    <div className="brandMark">YOUR NIGHT RECAP</div>
    <h1>{data.player.nickname}</h1>
    {data.player.persona && <p className="tagline">{data.player.persona}</p>}

    <div className="recapGrid">
      <div className="recapMetric"><b>{data.roundsCompleted}</b><span>Rounds</span></div>
      <div className="recapMetric"><b>{data.reactionsReceived}</b><span>Signals Received</span></div>
      <div className="recapMetric"><b>{data.votesReceived}</b><span>Moment Votes</span></div>
      <div className="recapMetric"><b>{data.connections.length}</b><span>Mutual Sparks</span></div>
    </div>

    <div className="card">
      <h2>Awards You Won</h2>
      {data.awardsWon.length === 0 && <p className="muted">No awards this time — but your sparks may still be waiting.</p>}
      {data.awardsWon.map(award => <p className="prompt" key={award.categoryKey}>🏆 {award.title} • {award.votes} vote{award.votes === 1 ? "" : "s"}</p>)}
    </div>

    <div className="card glowCard">
      <h2>Your Mutual Sparks</h2>
      {data.connections.length === 0 && <p className="muted">No mutual sparks yet. Check back if more players are still finishing ratings.</p>}
      {data.connections.map((conn, i) => <div className="prompt" key={i}>
        <b>{conn.partner.nickname}</b> — {conn.strength}
        <br />
        <span className="muted">{conn.reasons[0] || "Mutual private signals matched."}</span>
      </div>)}
    </div>

    <div className="row">
      <Button onClick={() => window.location.href = `/connections/${playerId}`}>Reveal My Sparks</Button>
      <Button className="secondary" onClick={() => window.location.href = `/vote/${playerId}`}>Edit Moment Votes</Button>
      <Button className="secondary" onClick={() => window.location.href = `/results/${data.game.id}`}>View Awards</Button>
      <Button className="secondary" onClick={() => window.location.href = "/join"}>Join Another Game</Button>
    </div>
  </div>;
}

function Results() {
  const { parts } = useRoute();
  const gameId = parts[1];
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API}/games/${gameId}/results`).then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="screen">Loading results...</div>;

  return <div className="screen resultsScreen">
    <div className="brandMark">TONIGHT’S REVEAL</div>
    <h1>Moment Awards</h1>
    {data.awards.map(award => <div className="card awardCard" key={award.categoryKey}>
      <div>
        <h2>{award.title}</h2>
        <p className="muted">{award.votes} vote{award.votes === 1 ? "" : "s"}</p>
      </div>
      <h3>{award.winner}</h3>
    </div>)}

    <h1>Mutual Sparks</h1>
    {data.mutualMatches.length === 0 && <p className="muted">No mutual sparks have been revealed yet.</p>}
    {data.mutualMatches.map(match => <div className="card glowCard" key={match.key}>
      <h2>{match.strength}</h2>
      <p>{match.playerA.nickname} + {match.playerB.nickname}</p>
    </div>)}

    <h1>Energy Board</h1>
    {data.players.map((player, index) => <div className="card compact" key={player.id}>
      <b>#{index + 1} {player.nickname}</b>
      <span>{player.points} pts</span>
    </div>)}

    <div className="card hostReturnPanel">
      <div className="brandMark">HOST NAVIGATION</div>
      <h2>Back to Control</h2>
      <p className="muted">Use these after Tonight’s Reveal to run another game, reset, or return to the dashboard.</p>
      <div className="row">
        <Button onClick={() => window.location.href = `/host/${gameId}`}>Back to Game Dashboard</Button>
        <Button className="secondary" onClick={() => window.location.href = "/host"}>All Games</Button>
        <Button className="secondary" onClick={() => window.location.href = "/join"}>Player Join Screen</Button>
      </div>
    </div>
  </div>;
}

function App() {
  const { parts } = useRoute();
  if (parts[0] === "host" && parts[1]) return <HostGame />;
  if (parts[0] === "host") return <HostManager />;
  if (parts[0] === "player") return <Player />;
  if (parts[0] === "vote") return <Vote />;
  if (parts[0] === "connections") return <Connections />;
  if (parts[0] === "recap") return <Recap />;
  if (parts[0] === "results") return <Results />;
  return <Join />;
}

createRoot(document.getElementById("root")).render(<App />);
