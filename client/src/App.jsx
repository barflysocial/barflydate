/* BARFLYDATE v8 build-fix: removed duplicate Results function declaration */
import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";
const categories = ["Hobbies","Travel","Food & Drink","Entertainment","Life Goals","Values","Adventure","Lifestyle","Quirks"];
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

function Join() {
  const [form, setForm] = React.useState({
    gameCode: "",
    nickname: randomAliasName(),
    persona: personas[0],
    realName: "",
    contactHandle: "",
    gender: "man",
    interestedIn: "women",
    lookingFor: "date",
    interests: ["Food & Drink", "Entertainment"],
    customQ1: "",
    customQ2: ""
  });
  const [error, setError] = React.useState("");

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const toggleInterest = item => setForm(f => ({
    ...f,
    interests: f.interests.includes(item) ? f.interests.filter(x => x !== item) : [...f.interests, item]
  }));

  async function join() {
    setError("");
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
        <option value="date">Date</option>
        <option value="friend">Friend</option>
        <option value="social">Social</option>
      </select>
    </div>

    <div className="card">
      <label>Choose Your Sparks</label>
      <div className="chips">{categories.map(c => <button type="button" key={c} className={form.interests.includes(c) ? "chip on" : "chip"} onClick={() => toggleInterest(c)}>{emojiFor(c)} {c}</button>)}</div>

      <label>Your Custom Question #1</label>
      <input placeholder="What makes someone easy to talk to?" value={form.customQ1} onChange={e => update("customQ1", e.target.value)} />

      <label>Your Custom Question #2</label>
      <input placeholder="What is your ideal Saturday?" value={form.customQ2} onChange={e => update("customQ2", e.target.value)} />
    </div>

    <Button onClick={join}>Begin Your Match</Button>
  </div>;
}

function HostManager() {
  const [games, setGames] = React.useState([]);
  const [venueName, setVenueName] = React.useState("BARFLY DATE Night");

  async function loadGames() {
    const res = await fetch(`${API}/games`);
    setGames(await res.json());
  }

  React.useEffect(() => {
    loadGames();
    const t = setInterval(loadGames, 4000);
    return () => clearInterval(t);
  }, []);

  async function createGame() {
    const res = await fetch(`${API}/games`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ venueName })
    });
    const data = await res.json();
    window.location.href = `/host/${data.id}`;
  }

  async function deleteGame(id) {
    if (!confirm("Delete this game completely?")) return;
    await fetch(`${API}/games/${id}`, { method: "DELETE" });
    loadGames();
  }

  return <div className="screen">
    <div className="brandMark">HOST SUITE</div>
    <h1>Game Manager</h1>
    <p className="tagline">Create and manage multiple BARFLY DATE game codes.</p>

    <div className="card glowCard">
      <h2>Create New Game</h2>
      <label>Event Name</label>
      <input value={venueName} onChange={e => setVenueName(e.target.value)} />
      <Button onClick={createGame}>Create Game Code</Button>
    </div>

    <h2>Active Games</h2>
    {games.length === 0 && <p className="muted">No games created yet.</p>}
    {games.map(game => <div className="card" key={game.id}>
      <div className="compact">
        <div>
          <h3>{game.venueName}</h3>
          <p className="muted">Code: <b>{game.gameCode}</b> • {game.playerCount} players</p>
          <p className="muted">{game.phaseLabel} • Round {game.currentRound}</p>
        </div>
        <span className="statusPill">{game.status}</span>
      </div>
      <div className="row">
        <Button onClick={() => window.location.href = `/host/${game.id}`}>Open Dashboard</Button>
        <Button className="danger" onClick={() => deleteGame(game.id)}>Delete</Button>
      </div>
    </div>)}
  </div>;
}

function HostGame() {
  const { parts } = useRoute();
  const gameId = parts[1];
  const [game, setGame] = React.useState(null);
  const [error, setError] = React.useState("");

  async function refresh() {
    try {
      const res = await fetch(`${API}/games/${gameId}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Refresh failed");
        return;
      }
      setGame(data);
      setError("");
    } catch (err) {
      setError("Refresh failed. Make sure the server is running.");
    }
  }

  React.useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [gameId]);

  async function action(path, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    const res = await fetch(`${API}/games/${gameId}/${path}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok || data.error) {
      alert(data.error || "Action failed");
      return;
    }
    setGame(data);
  }

  if (!game) return <div className="screen">Loading dashboard...</div>;

  return <div className="screen">
    <Button className="secondary" onClick={() => window.location.href = "/host"}>All Games</Button>
    <div className="brandMark">BARFLY DATE</div>
    <h1>{game.venueName}</h1>
    {error && <div className="alert">{error}</div>}

    <div className="card bigcode glowCard">
      <div className="muted">Game Code</div>
      <b>{game.gameCode}</b>
      <p className="muted">Player join: {window.location.origin}/join</p>
    </div>

    <div className="card">
      <div className="compact">
        <div>
          <h2>{game.phaseLabel}</h2>
          <p className="muted">Status: {game.status} • Round {game.currentRound} of 10</p>
        </div>
        <div className="timer"><Countdown endsAt={game.phaseEndsAt} status={game.status} /></div>
      </div>
      <ProgressBar endsAt={game.phaseEndsAt} totalSeconds={phaseSeconds(game)} status={game.status} />
      <p className="muted">Game ends: {game.gameEndsAt ? new Date(game.gameEndsAt).toLocaleTimeString() : "Not started"}</p>
    </div>

    <div className="row">
      {game.status === "lobby" && <Button onClick={() => action("start-game")}>Start 90-Min Game</Button>}
      {game.status !== "lobby" && game.status !== "paused" && game.status !== "complete" && <Button className="warning" onClick={() => action("pause")}>Pause</Button>}
      {game.status === "paused" && <Button onClick={() => action("resume")}>Resume</Button>}
      {game.status !== "lobby" && game.status !== "complete" && <Button className="secondary" onClick={() => action("skip-phase", "Skip to the next phase?")}>Skip Phase</Button>}
      {game.status !== "lobby" && game.status !== "complete" && <Button className="warning" onClick={() => action("end-game", "End game early and send players to voting?")}>End Game</Button>}
      <Button className="danger" onClick={() => action("reset", "Reset/Clear this game? This removes players, rounds, votes, and results.")}>Reset / Clear</Button>
    </div>

    <h2>Players ({game.players?.length || 0})</h2>
    {(game.players || []).map(player => <div className="card compact" key={player.id}>
      <div>
        <b>{player.nickname}</b>
        <p className="muted">Eligible Round {player.eligibleRound} • {player.lookingFor} • {player.points} pts</p>
      </div>
      <span className="statusPill">{player.isActive ? "active" : "inactive"}</span>
    </div>)}

    <h2>Current Pairings</h2>
    {(game.pairings || []).length === 0 && <p className="muted">No pairings in this phase.</p>}
    {(game.pairings || []).map(pairing => {
      const names = pairing.playerIds.map(id => game.players.find(p => p.id === id)?.nickname).filter(Boolean).join(" + ");
      return <div className="card" key={pairing.id}>
        <div className="compact"><b>{names}</b><span>{pairing.type}</span></div>
        <p className="muted">{pairing.categoryReason}: {pairing.category}</p>
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

  async function load() {
    const res = await fetch(`${API}/player/${playerId}/state`);
    const data = await res.json();
    if (!res.ok || data.error) {
      setError(data.error || "Could not load player state.");
      return;
    }
    setState(data);
    if (!targetId && data.partners?.length) setTargetId(data.partners[0].id);
  }

  React.useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, []);

  if (error) return <div className="screen"><h1>Game Update</h1><p>{error}</p><Button onClick={() => window.location.href = "/join"}>Rejoin Game</Button></div>;
  if (!state) return <div className="screen">Loading...</div>;

  const { player, game, pairing, partners } = state;
  const partnerNames = partners?.map(p => p.nickname).join(" + ") || "your next spark";

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

  return <div className="phone">
    <div className="topbar">
      <span>{player.nickname}</span>
      <span>Round {game.currentRound}/10</span>
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
        <p className="muted">{pairing.categoryReason}: {pairing.category}</p>
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
      {saved && <div className="toast">{saved}</div>}
    </div>}

    {game.status !== "round_active" && game.status !== "rating" && game.status !== "voting" && game.status !== "complete" && !pairing && game.status !== "intro" && game.status !== "break" && game.status !== "paused" && <IntroCard title="Waiting" text="You’ll be placed into the next available round." />}
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
  </div>;
}

function VotingPrompt({ playerId, gameId }) {
  return <div className="card glowCard">
    <div className="brandMark">ROUND 10</div>
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
    <div className="brandMark">ROUND 10</div>
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
