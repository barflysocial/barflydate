/* BARFLYDATE v9 safety build: removed duplicate Results function declaration */
import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";

const BUSINESS_BOOKING_LINK = "https://barfly.social/book";
const BUSINESS_PHONE = "ADD PHONE NUMBER";
const BUSINESS_EMAIL = "ADD EMAIL";
const BUSINESS_WEBSITE = "barfly.social";
const BUSINESS_GAMES_SITE = "games.barfly.social";

const weeklyDayOptions = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
];

const calendarEventTypes = [
  { value: "barfly_social", label: "Barfly Social" },
  { value: "bingo", label: "Bingo" },
  { value: "trivia", label: "Trivia" },
  { value: "karaoke", label: "Karaoke" },
  { value: "mystery", label: "Mystery / Escape Room" },
  { value: "music_bingo", label: "Music Bingo" },
  { value: "special", label: "Special Event" }
];

function formatEventTime(time) {
  if (!time) return "";
  const [h, m] = String(time).split(":").map(Number);
  if (!Number.isFinite(h)) return time;
  const hour = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${hour}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}


function eventDeviceId() {
  let id = localStorage.getItem("barflyEventDeviceId");
  if (!id) {
    id = `event_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("barflyEventDeviceId", id);
  }
  return id;
}

function eventUrl(event) {
  if (!event) return `${window.location.origin}/events`;
  return `${window.location.origin}${event.publicPath || `/events/${event.slug || event.id}`}`;
}

function eventQrUrl(event) {
  return `${window.location.origin}${event.qrPath || `/qr/event/${event.slug || event.id}`}`;
}


function eventPrimaryAction(event) {
  const isBarflySocial = event?.eventType === "barfly_social";
  return {
    label: event?.buttonText || (isBarflySocial ? "View Forecast / RSVP" : "More Info"),
    link: event?.buttonLink || (isBarflySocial ? "/forecast" : (event?.publicPath || `/events/${event?.slug || event?.id}`))
  };
}

function openEventPrimaryAction(event) {
  const action = eventPrimaryAction(event);
  window.location.href = action.link;
}

function calendarLinksForEvent(event) {
  const date = (event?.dateLabel || new Date().toISOString().slice(0,10)).replaceAll("-", "");
  const start = `${date}T${String(event?.startTime || "19:00").replace(":", "")}00`;
  const end = `${date}T${String(event?.endTime || "22:00").replace(":", "")}00`;
  const text = encodeURIComponent(event?.title || "Barfly Event");
  const details = encodeURIComponent(`${event?.description || ""}\n\n${event?.prizeSpecial || ""}\n\n${eventUrl(event)}`);
  const location = encodeURIComponent([event?.venueName, event?.venueLocation].filter(Boolean).join(" - "));
  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`,
    ics: `data:text/calendar;charset=utf8,${encodeURIComponent(`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event?.title || "Barfly Event"}
DTSTART:${start}
DTEND:${end}
LOCATION:${[event?.venueName, event?.venueLocation].filter(Boolean).join(" - ")}
DESCRIPTION:${event?.description || ""} ${event?.prizeSpecial || ""}
END:VEVENT
END:VCALENDAR`)}`
  };
}

function shareEvent(event) {
  const url = eventUrl(event);
  const text = `${event.title} at ${event.venueName}`;
  if (navigator.share) {
    navigator.share({ title: event.title, text, url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(url);
    alert("Event link copied.");
  }
}

function eventTypeCalendarLabel(value) {
  return calendarEventTypes.find(type => type.value === value)?.label || "Event";
}



function getRsvpDeviceId() {
  let id = localStorage.getItem("barflydateDeviceId");
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("barflydateDeviceId", id);
  }
  return id;
}

function DrinkSpecialCard({ special, redeem = false }) {
  if (!special?.hasSpecial) return null;
  return <div className="card drinkSpecialCard">
    <div className="brandMark">{redeem ? "PLAYER SPECIAL UNLOCKED" : "FEATURED VENUE SPECIAL"}</div>
    <h2>{special.title}</h2>
    {special.details && <p>{special.details}</p>}
    {special.redeemWindow && <p className="muted">{special.redeemWindow}</p>}
    {special.restrictions && <p className="microcopy">{special.restrictions}</p>}
    {redeem && <p className="sparkLine">Show this player screen to the venue team during the session.</p>}
  </div>;
}

const APP_VERSION = "BARFLYDATE v32";

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

const publicNavItems = [
  { key: "events", label: "Events", icon: "📅", href: "/events" },
  { key: "forecast", label: "Forecast", icon: "✨", href: "/forecast" },
  { key: "rsvp", label: "RSVP", icon: "📝", href: "/rsvp" },
  { key: "checkin", label: "Check In", icon: "🎟️", href: "/checkin" },
  { key: "my-rsvp", label: "My RSVP", icon: "💌", href: "/my-rsvp" }
];

const eventTypeOptions = [
  { value: "social_mixer", label: "Social Mixer", details: "Meet new people without dating pressure." },
  { value: "friends_activity", label: "Friends & Activity Partners", details: "Find people for games, activities, and social plans." },
  { value: "singles_night", label: "Singles Night", details: "A social dating event for casual and serious sparks." },
  { value: "mystery_match", label: "Mystery Match Night", details: "Premium mystery-date style rounds and reveal." },
  { value: "private_party", label: "Private Party", details: "Closed group social mixer." }
];

function eventTypeLabel(value) {
  return eventTypeOptions.find(option => option.value === value)?.label || "Mystery Match Night";
}

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

function defaultCapacityForMode(value) {
  if (value === "quick_30") return 20;
  if (value === "social_60") return 40;
  return 60;
}

function capacityText(capacity) {
  if (!capacity) return "Capacity not set";
  return `${capacity.rsvpCount || 0}/${capacity.maxRsvps || 0} RSVPs • ${capacity.checkedInCount || 0}/${capacity.maxCheckins || 0} checked in`;
}

function meetingModeLabel(value) {
  if (value === "none") return "No Location Assignment";
  if (value === "multiple") return "Multiple Zones";
  return "Single Meeting Point";
}

function meetingZonesText(setup) {
  if (!setup || setup.mode === "none") return "No location assignment";
  return (setup.zones || []).join(", ") || "Ask host";
}


function rsvpStatusText(rsvp) {
  if (!rsvp) return "Unknown";
  if (rsvp.status === "cancelled") return "Cancelled";
  if (rsvp.checkedIn) return "Checked In";
  if (rsvp.locked) return "Locked";
  return "RSVP Open";
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


function PublicNav({ active = "forecast" }) {
  return <div className="publicNav">
    {publicNavItems.map(item => <button
      key={item.key}
      type="button"
      className={active === item.key ? "navItem active" : "navItem"}
      onClick={() => window.location.href = item.href}
    >
      <span className="navIcon">{item.icon}</span>
      <span>{item.label}</span>
    </button>)}
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
      body: JSON.stringify({ ...form, deviceId: getRsvpDeviceId() })
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
    <div className="row"><Button className="secondary" onClick={() => window.location.href = "/forecast"}>View Forecast</Button><Button className="secondary" onClick={() => window.location.href = "/rsvp"}>RSVP</Button><Button className="secondary" onClick={() => window.location.href = "/checkin"}>Check In</Button></div>

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

      <label>What Are You Here For?</label>
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




function SplashScreen() {
  const SPLASH_MIN_MS = 8000;
  const SPLASH_FADE_MS = 650;
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let done = false;
    const started = Date.now();

    fetch(`${API}/forecast`)
      .then(res => res.json())
      .catch(() => null)
      .finally(() => {
        const elapsed = Date.now() - started;
        const wait = Math.max(0, SPLASH_MIN_MS - elapsed);
        setTimeout(() => {
          if (!done) setReady(true);
        }, wait);
      });

    return () => { done = true; };
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      window.location.href = "/events";
    }, SPLASH_FADE_MS);
    return () => clearTimeout(t);
  }, [ready]);

  return <div className={ready ? "splashScreen splashExit" : "splashScreen"}>
    <div className="splashGlow"></div>
    <img className="splashLogo" src="/barfly-social-splash.png" alt="Barfly Social" />
    <div className="splashText">
      <div className="brandMark">BARFLY SOCIAL</div>
      <h1>Meet • Mingle • Play</h1>
      <p>{ready ? "Opening events..." : "Loading this week’s events..."}</p>
    </div>
    <div className="splashLoader"><span></span><span></span><span></span></div>
  </div>;
}




function makeQrUrl(kind) {
  const origin = window.location.origin;
  const routes = {
    forecast: "/forecast",
    "business-demo": "/business-demo",
    checkin: "/checkin",
    host: "/host",
    events: "/events"
  };
  return `${origin}${routes[kind] || "/forecast"}`;
}

function qrApiUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=640x640&data=${encodeURIComponent(url)}`;
}

function QrDisplay() {
  const { parts } = useRoute();
  const kind = parts[1] || "forecast";
  const eventSlug = parts[2] || "";
  const url = kind === "event" && eventSlug ? `${window.location.origin}/events/${eventSlug}` : makeQrUrl(kind);
  const labels = {
    forecast: { title: "Scan to RSVP", subtitle: "Open tonight’s Barfly Social forecast." },
    "business-demo": { title: "Scan for Venue Demo", subtitle: "Show a venue how Barfly Social works." },
    checkin: { title: "Scan to Check In", subtitle: "For guests already at the venue." },
    host: { title: "Host Login QR", subtitle: "For host/admin use only." },
    events: { title: "Scan for Events", subtitle: "See upcoming Barfly Entertainment events." },
    event: { title: "Scan for This Event", subtitle: "Open the event page, RSVP interest, and add it to your calendar." }
  };
  const label = labels[kind] || labels.forecast;

  return <div className="screen publicScreen neonPublic qrPage">
    <div className="brandMark">BARFLY SOCIAL</div>
    <h1>{label.title}</h1>
    <p className="tagline">{label.subtitle}</p>
    <div className="card qrCard">
      <img src={qrApiUrl(url)} alt={`QR code for ${url}`} />
      <p className="qrUrl">{url}</p>
    </div>
    <div className="ctaRow">
      <Button onClick={() => window.location.href = url}>Open Link</Button>
      <Button className="secondary" onClick={() => window.print()}>Print QR</Button>
    </div>
  </div>;
}



function EventsCalendar() {
  const [data, setData] = React.useState(null);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    fetch(`${API}/events`).then(res => res.json()).then(setData).catch(() => setData({ events: [] }));
  }, []);

  const events = data?.events || [];
  const visibleEvents = filter === "all" ? events : events.filter(event => event.eventType === filter);
  const grouped = visibleEvents.reduce((acc, event) => {
    const key = `${event.dayLabel} • ${event.dateLabel}`;
    acc[key] = acc[key] || [];
    acc[key].push(event);
    return acc;
  }, {});

  return <div className="screen publicScreen neonPublic eventsPage">
    <div className="publicHero">
      <div className="brandMark">BARFLY EVENTS</div>
      <h1>What’s Happening with Barfly</h1>
      <p className="tagline">Bingo, trivia, karaoke, social mixers, mystery nights, and special events.</p>
      <div className="ctaRow">
        <Button onClick={() => window.location.href = "/forecast"}>Barfly Social Forecast</Button>
        <Button className="secondary" onClick={() => window.location.href = "/qr/events"}>Show Events QR</Button>
      </div>
    </div>

    <div className="eventFilterRow">
      <button className={filter === "all" ? "chip on" : "chip"} onClick={() => setFilter("all")}>All Events</button>
      {calendarEventTypes.map(type => <button key={type.value} className={filter === type.value ? "chip on" : "chip"} onClick={() => setFilter(type.value)}>{type.label}</button>)}
    </div>

    {!data && <div className="card neonCard"><p>Loading events...</p></div>}
    {data && visibleEvents.length === 0 && <div className="card neonCard"><p className="muted">No events listed yet.</p></div>}

    {Object.entries(grouped).map(([day, dayEvents]) => <div key={day} className="eventDayBlock">
      <h2>{day}</h2>
      <div className="eventCardGrid">
        {dayEvents.map(event => <div className={event.featured ? "card neonCard eventCard featuredEvent" : "card neonCard eventCard"} key={event.id}>
          <div className="compact">
            <span className="statusPill">{event.eventTypeLabel || eventTypeCalendarLabel(event.eventType)}</span>
            {event.featured && <span className="statusPill storageOk">Featured</span>}
          </div>
          <h3>{event.title}</h3>
          <p className="sparkLine">{formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
          <p><b>{event.venueName}</b></p>
          {event.venueLocation && <p className="muted">{event.venueLocation}</p>}
          {event.description && <p>{event.description}</p>}
          {event.prizeSpecial && <p className="microcopy">{event.prizeSpecial}</p>}
          <div className="eventStats">
            <span>{event.responseCounts?.interested || 0} interested</span>
            <span>{event.responseCounts?.going || 0} going</span>
          </div>
          <div className="ctaRow">
            <Button onClick={() => openEventPrimaryAction(event)}>{eventPrimaryAction(event).label}</Button>
            <Button className="secondary" onClick={() => window.location.href = event.publicPath || `/events/${event.slug || event.id}`}>Event Page</Button>
            <Button className="secondary" onClick={() => shareEvent(event)}>Share</Button>
            <Button className="secondary" onClick={() => window.location.href = event.qrPath || `/qr/event/${event.slug || event.id}`}>QR</Button>
          </div>
        </div>)}
      </div>
    </div>)}

    <PublicNav active="events" />
  </div>;
}



function EventDetail() {
  const { parts } = useRoute();
  const slug = parts[1];
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState("");

  async function load() {
    const res = await fetch(`${API}/events/${slug}`);
    const json = await res.json().catch(() => ({ error: "Could not load event." }));
    if (!res.ok || json.error) {
      setError(json.error || "Event not found.");
      return;
    }
    setData(json);
  }

  React.useEffect(() => { load(); }, [slug]);

  async function respond(response) {
    const res = await fetch(`${API}/events/${slug}/respond`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ response, deviceId: eventDeviceId() })
    });
    const json = await res.json().catch(() => ({ error: "Could not save response." }));
    if (!res.ok || json.error) return alert(json.error || "Could not save response.");
    setData({ event: json.event });
    setSaved(response === "going" ? "Marked as going" : "Marked as interested");
    setTimeout(() => setSaved(""), 1400);
  }

  if (error) return <div className="screen publicScreen neonPublic"><div className="alert">{error}</div><Button onClick={() => window.location.href="/events"}>Back to Events</Button></div>;
  if (!data) return <div className="screen publicScreen neonPublic"><p>Loading event...</p></div>;

  const event = data.event;
  const links = calendarLinksForEvent(event);

  return <div className="screen publicScreen neonPublic eventDetailPage">
    <div className="brandMark">BARFLY EVENT</div>
    <h1>{event.title}</h1>
    <p className="tagline">{event.eventTypeLabel || eventTypeCalendarLabel(event.eventType)} • {event.dayLabel} • {formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>

    <div className="card neonCard">
      <h2>{event.venueName}</h2>
      {event.venueLocation && <p className="muted">{event.venueLocation}</p>}
      {event.description && <p>{event.description}</p>}
      {event.prizeSpecial && <p className="sparkLine">{event.prizeSpecial}</p>}
      <div className="eventStats">
        <span>{event.responseCounts?.interested || 0} interested</span>
        <span>{event.responseCounts?.going || 0} going</span>
      </div>
      <div className="ctaRow">
        <Button onClick={() => openEventPrimaryAction(event)}>{eventPrimaryAction(event).label}</Button>
        <Button className="secondary" onClick={() => respond("going")}>I’m Going</Button>
        <Button className="secondary" onClick={() => respond("interested")}>I’m Interested</Button>
        <Button className="secondary" onClick={() => window.location.href = links.google}>Add to Google Calendar</Button>
        <Button className="secondary" onClick={() => window.location.href = links.ics}>Download .ics</Button>
        <Button className="secondary" onClick={() => shareEvent(event)}>Share</Button>
        <Button className="secondary" onClick={() => window.location.href = event.qrPath}>QR Code</Button>
      </div>
      {saved && <div className="toast">{saved}</div>}
    </div>

    <div className="card qrMiniCard">
      <h2>Share this event</h2>
      <img src={qrApiUrl(eventUrl(event))} alt="Event QR" />
      <p className="qrUrl">{eventUrl(event)}</p>
    </div>

    <PublicNav active="events" />
  </div>;
}

function TonightPage() {
  const [data, setData] = React.useState(null);
  React.useEffect(() => { fetch(`${API}/events`).then(res => res.json()).then(setData).catch(() => setData({ events: [] })); }, []);
  const events = data?.events || [];
  const today = new Date().toISOString().slice(0, 10);
  const tonight = events.filter(event => event.dateLabel === today || event.featured).slice(0, 6);

  return <div className="screen publicScreen neonPublic eventsPage">
    <div className="publicHero">
      <div className="brandMark">TONIGHT WITH BARFLY</div>
      <h1>Tonight & Featured Events</h1>
      <p className="tagline">Quick links for Instagram stories and last-minute promotion.</p>
      <div className="ctaRow"><Button onClick={() => window.location.href="/events"}>Full Calendar</Button><Button className="secondary" onClick={() => window.location.href="/qr/events"}>Events QR</Button></div>
    </div>
    {!data && <div className="card neonCard"><p>Loading events...</p></div>}
    {data && tonight.length === 0 && <div className="card neonCard"><p>No events listed for tonight yet.</p></div>}
    <div className="eventCardGrid">
      {tonight.map(event => <div className="card neonCard eventCard featuredEvent" key={event.id}>
        <span className="statusPill">{event.eventTypeLabel}</span>
        <h3>{event.title}</h3>
        <p className="sparkLine">{formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
        <p><b>{event.venueName}</b></p>
        <p className="muted">{event.prizeSpecial}</p>
        <div className="ctaRow"><Button onClick={() => openEventPrimaryAction(event)}>{eventPrimaryAction(event).label}</Button><Button className="secondary" onClick={() => window.location.href = event.publicPath}>Event Page</Button><Button className="secondary" onClick={() => shareEvent(event)}>Share</Button></div>
      </div>)}
    </div>
    <PublicNav active="events" />
  </div>;
}

function VenuePage() {
  const { parts } = useRoute();
  const venueSlug = parts[1] || "";
  const [data, setData] = React.useState(null);
  React.useEffect(() => { fetch(`${API}/events`).then(res => res.json()).then(setData).catch(() => setData({ events: [] })); }, []);
  const events = (data?.events || []).filter(event => slugifyText(event.venueName) === venueSlug);
  const venueName = events[0]?.venueName || "Venue";

  return <div className="screen publicScreen neonPublic eventsPage">
    <div className="publicHero">
      <div className="brandMark">BARFLY VENUE</div>
      <h1>{venueName}</h1>
      <p className="tagline">Upcoming Barfly Entertainment events at this venue.</p>
      <Button className="secondary" onClick={() => window.location.href="/events"}>All Events</Button>
    </div>
    <div className="eventCardGrid">
      {events.map(event => <div className="card neonCard eventCard" key={event.id}>
        <span className="statusPill">{event.eventTypeLabel}</span>
        <h3>{event.title}</h3>
        <p className="sparkLine">{event.dayLabel} • {formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
        <p className="muted">{event.prizeSpecial}</p>
        <div className="ctaRow"><Button onClick={() => openEventPrimaryAction(event)}>{eventPrimaryAction(event).label}</Button><Button className="secondary" onClick={() => window.location.href = event.publicPath}>Event Page</Button></div>
      </div>)}
    </div>
    <PublicNav active="events" />
  </div>;
}

function slugifyText(value) {
  return String(value || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}


function BusinessDemo() {
  const demoScreens = [
    { title: "Crowd Forecast", icon: "📍", text: "Guests see which venue/session has the right energy before they leave home." },
    { title: "RSVP Flow", icon: "📝", text: "Guests reserve one spot, choose intention, and get counted in the venue forecast." },
    { title: "Venue Check-In", icon: "🎟️", text: "Only people who arrive and enter the session code become active players." },
    { title: "Host Control", icon: "🕹️", text: "The venue/host sees capacity, RSVPs, check-ins, safety alerts, and live event status." },
    { title: "Player Rounds", icon: "✨", text: "Players are guided to who they meet, where to meet, what topic to start with, and how much time is left." },
    { title: "Drink Special Unlock", icon: "🍹", text: "Specials are promoted publicly and unlocked only after check-in during the session." }
  ];

  const benefits = [
    "Drive traffic on slower nights",
    "Promote food and drink specials",
    "Increase time spent inside the venue",
    "Create a social experience without a complicated host script",
    "Support 30, 60, or 90 minute sessions",
    "Works for social mixers, singles nights, private parties, and activity groups",
    "Provides RSVP, check-in, no-show, and event recap insights"
  ];

  return <div className="screen publicScreen neonPublic businessDemo">
    <div className="businessHero">
      <div className="brandMark">BARFLY SOCIAL</div>
      <h1>Bring a Social Game Night to Your Venue</h1>
      <p className="tagline">Meet • Mingle • Play</p>
      <p className="heroCopy">Barfly Social is a live venue-based social game that helps guests RSVP, check in, meet new people, redeem specials, and stay engaged during your event.</p>
      <div className="ctaRow">
        <Button onClick={() => window.location.href = BUSINESS_BOOKING_LINK}>Book a Demo</Button>
        <Button className="secondary" onClick={() => window.location.href = "/events"}>View Events Calendar</Button>
        <Button className="secondary" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>See How It Works</Button>
        <Button className="secondary" onClick={() => document.getElementById("sales-walkthrough")?.scrollIntoView({ behavior: "smooth" })}>Start Demo Walkthrough</Button>
      </div>
    </div>

    <div id="how-it-works" className="card neonCard">
      <div className="brandMark">HOW IT WORKS</div>
      <div className="stepsGrid">
        <div><span>1</span><h3>Guests RSVP Online</h3><p>Guests choose the venue/session and let the system forecast the crowd.</p></div>
        <div><span>2</span><h3>They Check In at the Venue</h3><p>Only checked-in guests become active players, keeping attendance accurate.</p></div>
        <div><span>3</span><h3>The Game Runs Automatically</h3><p>The host starts it once, then rounds, timers, prompts, and voting run automatically.</p></div>
        <div><span>4</span><h3>Players Meet, Mingle, and Play</h3><p>Players see who to meet, where to go, the topic, and time left each round.</p></div>
      </div>
    </div>

    <div className="card neonCard">
      <div className="brandMark">WHY VENUES WANT IT</div>
      <h2>More reasons for people to show up and stay</h2>
      <div className="benefitGrid">
        {benefits.map(item => <div className="benefitChip" key={item}>✓ {item}</div>)}
      </div>
    </div>

    <div className="card drinkSpecialCard">
      <div className="brandMark">VENUE SPECIAL EXAMPLE</div>
      <h2>$1 Off Featured Cocktails During Barfly Social</h2>
      <p>Promote the special publicly, but unlock the redeemable version only after the guest checks in at your venue.</p>
      <p className="microcopy">Example restrictions: during session only • checked-in players only • 21+ • venue rules apply.</p>
    </div>

    <div className="demoScreenGrid">
      {demoScreens.map(screen => <div className="card neonCard demoScreenCard" key={screen.title}>
        <div className="demoIcon">{screen.icon}</div>
        <h3>{screen.title}</h3>
        <p>{screen.text}</p>
      </div>)}
    </div>

    <div className="card neonCard">
      <div className="brandMark">EVENT TYPES</div>
      <div className="eventTypeGrid">
        <div><h3>Social Mixer</h3><p>For people who want a fun way to meet new friends.</p></div>
        <div><h3>Friends & Activity Partners</h3><p>For groups, games, hobbies, and activity-based events.</p></div>
        <div><h3>Singles Night</h3><p>For dating-focused events with stronger compatibility routing.</p></div>
        <div><h3>Mystery Match Night</h3><p>The premium reveal-based version of the experience.</p></div>
        <div><h3>Private Party</h3><p>Closed social events, team nights, or custom mixers.</p></div>
      </div>
    </div>

    <div className="card neonCard">
      <div className="brandMark">WHAT THE VENUE SEES</div>
      <div className="mockDashboard">
        <div><span>Checked In</span><b>24 / 40</b></div>
        <div><span>RSVPs</span><b>31 / 40</b></div>
        <div><span>Open Reports</span><b>0</b></div>
        <div><span>No-Shows</span><b>4</b></div>
      </div>
      <p className="muted">The host screen keeps the event simple: capacity, check-ins, reports, current phase, timer, pairings, meeting zones, and no-show control.</p>
    </div>

    
    <div id="sales-walkthrough" className="card neonCard salesWalkthrough">
      <div className="brandMark">SALES WALKTHROUGH</div>
      <h2>5-Minute Venue Demo Script</h2>
      <div className="walkthroughSteps">
        <div><span>1</span><b>What it is</b><p>A live social game that gives people a reason to show up, interact, and stay.</p></div>
        <div><span>2</span><b>How guests RSVP</b><p>Guests choose a venue/session and forecast demand before arriving.</p></div>
        <div><span>3</span><b>How check-in works</b><p>Only people at the venue with the code become active players.</p></div>
        <div><span>4</span><b>How players meet</b><p>Players see who to meet, where to meet, the topic, and the timer.</p></div>
        <div><span>5</span><b>Why the venue wins</b><p>Drink specials, longer stays, slower-night traffic, and a post-event report.</p></div>
      </div>
      <div className="ctaRow">
        <Button onClick={() => window.location.href = "/qr/business-demo"}>Show Business QR</Button>
        <Button className="secondary" onClick={() => window.location.href = "/qr/forecast"}>Show RSVP QR</Button>
      </div>
    </div>

    <div id="business-contact" className="card contactCard">
      <div className="brandMark">BOOK BARFLY SOCIAL</div>
      <h1>Bring Barfly Social to Your Venue</h1>
      <p className="tagline">Contact Barfly Entertainment to schedule a demo or discuss a venue night.</p>
      <div className="contactGrid">
        <div><span>Contact</span><b>Desmon LeJeune</b></div>
        <div><span>Phone</span><b>{BUSINESS_PHONE}</b></div>
        <div><span>Email</span><b>{BUSINESS_EMAIL}</b></div>
        <div><span>Website</span><b>{BUSINESS_WEBSITE}</b></div>
        <div><span>Games</span><b>{BUSINESS_GAMES_SITE}</b></div>
        <div><span>Booking</span><b>{BUSINESS_BOOKING_LINK}</b></div>
      </div>
      <p className="microcopy">Add your preferred public email and phone number here before using this as a sales page.</p>
      <div className="ctaRow">
        <Button onClick={() => window.location.href = BUSINESS_BOOKING_LINK}>Book a Demo</Button>
        <Button className="secondary" onClick={() => window.location.href = "/forecast"}>View Customer Forecast</Button>
        <Button className="secondary" onClick={() => window.location.href = "/host"}>Host Login</Button>
      </div>
    </div>
  </div>;
}


function Forecast() {
  const [data, setData] = React.useState(null);
  React.useEffect(() => { fetch(`${API}/forecast`).then(res => res.json()).then(setData).catch(() => setData({ sessions: [] })); }, []);
  return <div className="screen publicScreen neonPublic">
    <div className="publicHero">
      <div className="brandMark">BARFLYDATE</div>
      <h1>Barfly Social Forecast</h1>
      <p className="tagline">For Barfly Social experiences, find the room that matches your intention before you go. Forecasts are privacy-friendly and show demand, not names.</p>
      <div className="ctaRow"><Button onClick={() => window.location.href = "/rsvp"}>RSVP Now</Button><Button className="secondary" onClick={() => window.location.href = "/events"}>This Week’s Events</Button><Button className="secondary" onClick={() => window.location.href = "/checkin"}>Venue Check-In</Button></div>
    </div>
    {!data && <div className="card neonCard"><p>Loading forecast...</p></div>}
    {data && (!data.sessions || data.sessions.length === 0) && <div className="card neonCard"><p className="muted">No upcoming sessions yet.</p></div>}
    {(data?.sessions || []).map(session => <div className="card neonCard" key={session.id}>
      <div className="compact"><div><h2>{session.venueName}</h2>{session.venueLocation && <p className="muted">{session.venueLocation}</p>}<p className="sparkLine">{session.eventTypeInfo?.label || eventTypeLabel(session.eventType)}</p><p className="microcopy">{session.modeLabel} • {session.locked ? "Session started — RSVP locked" : "RSVP open"}</p></div><span className={session.locked ? "statusPill storageWarn" : "statusPill storageOk"}>{session.locked ? "locked" : "open"}</span></div>
      <div className="demandGrid">{lookingForOptions.map(option => <div className="demandChip" key={option.value}><span>{option.label}</span><b>{session.forecast?.[option.value]?.level || "Building"}</b></div>)}</div>
      <div className="twoColMeta"><div><div className="metaLabel">RSVP Capacity</div><div className="metaValue">{session.capacity?.rsvpCount || 0}/{session.capacity?.maxRsvps || 0}</div></div><div><div className="metaLabel">Check-In Capacity</div><div className="metaValue">{session.capacity?.checkedInCount || 0}/{session.capacity?.maxCheckins || 0}</div></div></div>
      <p className={session.capacity?.rsvpFull ? "dangerText" : session.capacity?.rsvpAlmostFull ? "sparkLine" : "microcopy"}>{session.capacity?.rsvpLabel || "Open"}</p>
      <DrinkSpecialCard special={session.drinkSpecial} />
      <h3>Session Apps</h3><AppJourney mode={session.gameMode} />
      <div className="ctaRow">{!session.locked && !session.capacity?.rsvpFull && <Button onClick={() => window.location.href = `/rsvp?gameId=${session.id}`}>RSVP for This Session</Button>}{session.capacity?.rsvpFull && <Button className="disabledBtn">Session Full</Button>}</div>
    </div>)}
    <PublicNav active="forecast" />
  </div>;
}



function RSVP() {
  const params = new URLSearchParams(window.location.search);
  const [forecast, setForecast] = React.useState(null);
  const [step, setStep] = React.useState(1);
  const [acceptedAgreement, setAcceptedAgreement] = React.useState(false);
  const [savedRsvp, setSavedRsvp] = React.useState(null);
  const [movedMessage, setMovedMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    gameId: params.get("gameId") || "",
    nickname: randomAliasName(),
    persona: personas[0],
    realName: "",
    contactHandle: "",
    gender: "man",
    interestedIn: "women",
    lookingFor: "serious_dating",
    preferredMinAge: 25,
    preferredMaxAge: 45,
    interests: ["Food & Drink", "Entertainment"],
    customQ1: "",
    customQ2: ""
  });

  React.useEffect(() => {
    fetch(`${API}/forecast`).then(res => res.json()).then(data => {
      setForecast(data);
      if (!params.get("gameId") && data.sessions?.[0]?.id) {
        setForm(current => ({ ...current, gameId: data.sessions[0].id }));
      }
    }).catch(() => setForecast({ sessions: [] }));
  }, []);

  const selectedSession = (forecast?.sessions || []).find(session => session.id === form.gameId);

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function toggleInterest(item) {
    setForm(current => ({
      ...current,
      interests: current.interests.includes(item)
        ? current.interests.filter(entry => entry !== item)
        : [...current.interests, item]
    }));
  }

  async function submitRsvp() {
    setError("");
    if (!acceptedAgreement) {
      setError("Please accept the RSVP agreement before continuing.");
      return;
    }

    const res = await fetch(`${API}/rsvps`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ ...form, deviceId: getRsvpDeviceId() })
    });

    const data = await res.json().catch(() => ({ error: "Server returned an unreadable response." }));
    if (!res.ok || data.error) {
      setError(data.error || "Could not save RSVP.");
      return;
    }

    localStorage.setItem("barflydateRsvpId", data.rsvp.id);
    setMovedMessage(data.moved ? (data.message || "Your existing RSVP was moved to this session.") : "");
    setSavedRsvp(data.rsvp);
  }

  if (savedRsvp) return <div className="screen publicScreen neonPublic">
    <div className="publicHero">
      <div className="brandMark">BARFLYDATE RSVP</div>
      <h1>Your Spot Is Saved</h1>
      <p className="tagline">You’re booked for {savedRsvp.venueName}.</p>
      {movedMessage && <div className="alert">{movedMessage}</div>}
    </div>

    <div className="card neonCard">
      <p><b>Venue:</b> {savedRsvp.venueName}</p>
      {savedRsvp.venueLocation && <p><b>Location:</b> {savedRsvp.venueLocation}</p>}
      <p><b>What Are You Here For?:</b> {savedRsvp.lookingForLabel || lookingForLabel(savedRsvp.lookingFor)}</p>
      <p><b>Age Range:</b> {savedRsvp.preferredMinAge}–{savedRsvp.preferredMaxAge}</p>
      <p><b>RSVP ID:</b> {savedRsvp.id}</p>
      <p className="muted">Save this screen. You’ll check in at the venue with the session code.</p>
      <DrinkSpecialCard special={savedRsvp.drinkSpecial} />
      <div className="ctaRow">
        <Button onClick={() => window.location.href = "/my-rsvp"}>Manage My RSVP</Button>
        <Button className="secondary" onClick={() => window.location.href = "/checkin"}>Check In at Venue</Button>
      </div>
    </div>

    <PublicNav active="rsvp" />
  </div>;

  return <div className="screen publicScreen neonPublic">
    <div className="publicHero">
      <div className="brandMark">BARFLYDATE RSVP</div>
      <h1>Save Your Spot</h1>
      <p className="tagline">Five quick steps. Choose your session now, then check in at the venue with the live code.</p>
      <div className="stepTracker">{[1,2,3,4,5].map(number => <span key={number} className={number === step ? "stepDot active" : "stepDot"}>{number}</span>)}</div>
      <p className="microcopy">Step {step} of 5</p>
    </div>

    {error && <div className="alert">{error}</div>}

    <div className="card neonCard">
      {step === 1 && <>
        <h2>1. Choose Your Room</h2>
        <label>Choose Your Room</label>
        <select value={form.gameId} onChange={e => update("gameId", e.target.value)}>
          <option value="">Choose a session...</option>
          {(forecast?.sessions || []).filter(session => !session.locked && !session.capacity?.rsvpFull).map(session => <option key={session.id} value={session.id}>{session.venueName} — {session.modeLabel}</option>)}
        </select>
        {selectedSession && <div className="miniPanel">
          <b>{selectedSession.venueName}</b>
          {selectedSession.venueLocation && <p className="muted">{selectedSession.venueLocation}</p>}
          <p className="microcopy">RSVP for one session. You can move it before sessions start.</p>
        </div>}
        {selectedSession && <DrinkSpecialCard special={selectedSession.drinkSpecial} />}
        <label>Mystery Alias</label>
        <div className="inlineInput">
          <input value={form.nickname} onChange={e => update("nickname", e.target.value)} />
          <button type="button" className="miniBtn" onClick={() => update("nickname", randomAliasName())}>Shuffle</button>
        </div>
      </>}

      {step === 2 && <>
        <h2>2. Pick Your Vibe</h2>
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
        <label>What Are You Here For?</label>
        <select value={form.lookingFor} onChange={e => update("lookingFor", e.target.value)}>
          {lookingForOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <div className="twoCol">
          <div><label>Preferred Age Min</label><input type="number" min="18" max="99" value={form.preferredMinAge} onChange={e => update("preferredMinAge", e.target.value)} /></div>
          <div><label>Preferred Age Max</label><input type="number" min="18" max="99" value={form.preferredMaxAge} onChange={e => update("preferredMaxAge", e.target.value)} /></div>
        </div>
      </>}

      {step === 3 && <>
        <h2>3. Choose Your Sparks</h2>
        <p className="microcopy">Choose the topics that matter most to you.</p>
        <div className="chips">{categories.map(category => <button type="button" key={category} className={form.interests.includes(category) ? "chip on" : "chip"} onClick={() => toggleInterest(category)}>{emojiFor(category)} {category}</button>)}</div>
      </>}

      {step === 4 && <>
        <h2>4. Add Conversation Starters</h2>
        <label>Your Custom Question #1</label>
        <input placeholder="What kind of energy are you hoping to meet tonight?" value={form.customQ1} onChange={e => update("customQ1", e.target.value)} />
        <label>Your Custom Question #2</label>
        <input placeholder="What makes someone easy to talk to?" value={form.customQ2} onChange={e => update("customQ2", e.target.value)} />
        <label>Real Name <span className="muted">optional, mutual only</span></label>
        <input placeholder="Optional" value={form.realName} onChange={e => update("realName", e.target.value)} />
        <label>Contact Handle <span className="muted">recommended for duplicate RSVP protection</span></label>
        <input placeholder="Phone, Instagram, or email" value={form.contactHandle} onChange={e => update("contactHandle", e.target.value)} />
      </>}

      {step === 5 && <>
        <h2>5. Save Your Spot</h2>
        <div className="miniPanel">
          <p><b>Venue:</b> {selectedSession?.venueName || "Choose a session"}</p>
          {selectedSession?.venueLocation && <p><b>Location:</b> {selectedSession.venueLocation}</p>}
          <p><b>Intent:</b> {lookingForLabel(form.lookingFor)}</p>
          <p><b>Age Range:</b> {form.preferredMinAge}–{form.preferredMaxAge}</p>
          <p><b>Sparks:</b> {form.interests.join(", ")}</p>
        </div>
        <div className="agreementCard">
          <p className="prompt">• One active RSVP per person for the event.</p>
          <p className="prompt">• You can move your RSVP before your original session starts and before the new session starts.</p>
          <p className="prompt">• Once checked in or once the original session starts, this RSVP is locked.</p>
          <p className="prompt">• You still need the session code at the venue to check in.</p>
          <label className="checkRow">
            <input type="checkbox" checked={acceptedAgreement} onChange={e => setAcceptedAgreement(e.target.checked)} />
            <span>I understand and agree.</span>
          </label>
        </div>
      </>}

      <div className="ctaRow">
        {step > 1 && <Button className="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
        {step < 5 && <Button onClick={() => setStep(step + 1)}>Continue</Button>}
        {step === 5 && <Button className={!acceptedAgreement ? "disabledBtn" : ""} onClick={submitRsvp}>Save My Spot</Button>}
      </div>
    </div>

    <PublicNav active="rsvp" />
  </div>;
}


function CheckIn() {
  const [rsvpId, setRsvpId] = React.useState(localStorage.getItem("barflydateRsvpId") || "");
  const [gameCode, setGameCode] = React.useState("");
  const [error, setError] = React.useState("");

  async function checkIn() {
    setError("");
    const res = await fetch(`${API}/checkin`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ rsvpId, gameCode })
    });

    const data = await res.json().catch(() => ({ error: "Server returned an unreadable response." }));
    if (!res.ok || data.error) {
      setError(data.error || "Could not check in.");
      return;
    }

    window.location.href = `/player/${data.id}`;
  }

  return <div className="screen premiumEntry">
    <div className="brandMark">VENUE CHECK-IN</div>
    <h1>Enter Session Code</h1>
    <p className="tagline">RSVPs become active players only after check-in at the venue.</p>

    {error && <div className="alert">{error}</div>}

    <div className="card glowCard">
      <label>RSVP ID</label>
      <input value={rsvpId} onChange={e => setRsvpId(e.target.value)} placeholder="Saved automatically after RSVP" />
      <p className="microcopy">If this is blank, RSVP first or ask the host.</p>

      <label>Session Code</label>
      <input value={gameCode} onChange={e => setGameCode(e.target.value.toUpperCase())} placeholder="Code from host at venue" />

      <Button onClick={checkIn}>Check In</Button>
    </div>

    <div className="row">
      <Button className="secondary" onClick={() => window.location.href = "/rsvp"}>RSVP First</Button>
      <Button className="secondary" onClick={() => window.location.href = "/forecast"}>View Forecast</Button>
      
    </div>
  </div>;
}



function MyRSVP() {
  const [rsvpId, setRsvpId] = React.useState(localStorage.getItem("barflydateRsvpId") || "");
  const [rsvp, setRsvp] = React.useState(null);
  const [forecast, setForecast] = React.useState(null);
  const [selectedGameId, setSelectedGameId] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  async function loadRsvp(id = rsvpId) {
    setError("");
    setMessage("");
    if (!id) {
      setRsvp(null);
      return;
    }

    const [rsvpRes, forecastRes] = await Promise.all([
      fetch(`${API}/rsvps/${id}`),
      fetch(`${API}/forecast`)
    ]);

    const rsvpData = await rsvpRes.json().catch(() => ({ error: "Could not read RSVP." }));
    const forecastData = await forecastRes.json().catch(() => ({ sessions: [] }));

    setForecast(forecastData);

    if (!rsvpRes.ok || rsvpData.error) {
      setRsvp(null);
      setError(rsvpData.error || "RSVP not found.");
      return;
    }

    setRsvp(rsvpData.rsvp);
    setSelectedGameId(rsvpData.rsvp.gameId);
    localStorage.setItem("barflydateRsvpId", rsvpData.rsvp.id);
  }

  React.useEffect(() => {
    if (rsvpId) loadRsvp(rsvpId);
    else fetch(`${API}/forecast`).then(res => res.json()).then(setForecast).catch(() => setForecast({ sessions: [] }));
  }, []);

  async function copyRsvpId() {
    if (!rsvp?.id) return;
    try {
      await navigator.clipboard.writeText(rsvp.id);
      alert("RSVP ID copied.");
    } catch (err) {
      prompt("Copy this RSVP ID:", rsvp.id);
    }
  }

  async function moveRsvp() {
    if (!rsvp || !selectedGameId || selectedGameId === rsvp.gameId) return;
    if (!confirm("Move your RSVP to the selected session? This is only allowed before sessions start.")) return;

    const res = await fetch(`${API}/rsvps/${rsvp.id}/change-session`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ gameId: selectedGameId, deviceId: getRsvpDeviceId() })
    });

    const data = await res.json().catch(() => ({ error: "Server returned an unreadable response." }));
    if (!res.ok || data.error) {
      setError(data.error || "Could not move RSVP.");
      return;
    }

    setRsvp(data.rsvp);
    setSelectedGameId(data.rsvp.gameId);
    setMessage("Your RSVP was moved.");
  }

  async function cancelRsvp() {
    if (!rsvp) return;
    if (!confirm("Cancel this RSVP?")) return;

    const res = await fetch(`${API}/rsvps/${rsvp.id}/cancel`, { method: "POST" });
    const data = await res.json().catch(() => ({ error: "Server returned an unreadable response." }));

    if (!res.ok || data.error) {
      setError(data.error || "Could not cancel RSVP.");
      return;
    }

    localStorage.removeItem("barflydateRsvpId");
    setRsvp(data.rsvp);
    setMessage("RSVP cancelled.");
  }

  const openSessions = (forecast?.sessions || []).filter(session => !session.locked && (!session.capacity?.rsvpFull || session.id === rsvp?.gameId));
  const canModify = rsvp && !rsvp.locked && !rsvp.checkedIn && rsvp.status !== "cancelled";

  return <div className="screen publicScreen neonPublic">
    <div className="publicHero">
      <div className="brandMark">MY RSVP</div>
      <h1>Manage Your Spot</h1>
      <p className="tagline">View your RSVP, copy your RSVP ID, move before lock, or check in at the venue.</p>
    </div>

    {error && <div className="alert">{error}</div>}
    {message && <div className="alert successAlert">{message}</div>}

    <div className="card neonCard">
      <label>RSVP ID</label>
      <input value={rsvpId} onChange={e => setRsvpId(e.target.value)} placeholder="Paste RSVP ID" />
      <div className="ctaRow">
        <Button onClick={() => loadRsvp(rsvpId)}>Load RSVP</Button>
        <Button className="secondary" onClick={() => window.location.href = "/rsvp"}>Create RSVP</Button>
      </div>
    </div>

    {rsvp && <div className="card neonCard">
      <div className="compact">
        <div>
          <h2>{rsvp.nickname}</h2>
          <p className="muted">{rsvp.venueName}</p>
          {rsvp.venueLocation && <p className="muted">{rsvp.venueLocation}</p>}
        </div>
        <span className={rsvp.status === "cancelled" ? "statusPill storageWarn" : rsvp.checkedIn ? "statusPill storageOk" : "statusPill"}>{rsvp.checkedIn ? "checked in" : rsvp.status}</span>
      </div>

      <p><b>What Are You Here For?:</b> {rsvp.lookingForLabel || lookingForLabel(rsvp.lookingFor)}</p>
      <p><b>Age Range:</b> {rsvp.preferredMinAge || 25}–{rsvp.preferredMaxAge || 45}</p>
      <p><b>RSVP ID:</b> {rsvp.id}</p>

      <DrinkSpecialCard special={rsvp.drinkSpecial} />

      {canModify && <>
        <h3>Change Session</h3>
        <p className="microcopy">You can move this RSVP only before your original session starts and before the new session starts.</p>
        <select value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)}>
          {openSessions.map(session => <option key={session.id} value={session.id}>{session.venueName} — {session.modeLabel} — {session.capacity?.rsvpLabel || "Open"}</option>)}
        </select>
      </>}

      {!canModify && <p className="microcopy">This RSVP is locked because it is checked in, cancelled, or the session has started.</p>}

      <div className="ctaRow">
        <Button onClick={() => window.location.href = "/checkin"}>Check In</Button>
        <Button className="secondary" onClick={copyRsvpId}>Copy RSVP ID</Button>
        {canModify && selectedGameId !== rsvp.gameId && <Button className="secondary" onClick={moveRsvp}>Move RSVP</Button>}
        {canModify && <Button className="danger" onClick={cancelRsvp}>Cancel RSVP</Button>}
      </div>
    </div>}

    <PublicNav active="my-rsvp" />
  </div>;
}



function HostEventsPanel() {
  const blank = {
    title: "Workday Blackout Bingo",
    eventType: "bingo",
    venueName: "Venue Name",
    venueLocation: "City, LA",
    dayOfWeek: 1,
    startTime: "12:00",
    endTime: "13:00",
    recurringWeekly: true,
    description: "Weekly Barfly Entertainment event.",
    prizeSpecial: "Free to play. Play for prizes.",
    buttonText: "More Info",
    buttonLink: "/events",
    featured: false,
    hidden: false
  };

  const [events, setEvents] = React.useState([]);
  const [form, setForm] = React.useState(blank);
  const [editingId, setEditingId] = React.useState("");

  async function loadEvents() {
    const res = await hostFetch(`${API}/host/events`);
    const data = await res.json().catch(() => ({ events: [] }));
    setEvents(data.events || []);
  }

  React.useEffect(() => { loadEvents(); }, []);

  function editEvent(event) {
    setEditingId(event.id);
    setForm({
      title: event.title || "",
      eventType: event.eventType || "special",
      venueName: event.venueName || "",
      venueLocation: event.venueLocation || "",
      dayOfWeek: event.dayOfWeek ?? 1,
      startTime: event.startTime || "19:00",
      endTime: event.endTime || "22:00",
      recurringWeekly: event.recurringWeekly !== false,
      date: event.date || "",
      description: event.description || "",
      prizeSpecial: event.prizeSpecial || "",
      buttonText: event.buttonText || "More Info",
      buttonLink: event.buttonLink || "/events",
      featured: !!event.featured,
      hidden: !!event.hidden
    });
  }

  async function saveEvent() {
    const url = editingId ? `${API}/host/events/${editingId}` : `${API}/host/events`;
    const res = await hostFetch(url, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(form)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      alert(data.error || "Could not save event.");
      return;
    }
    setEditingId("");
    setForm(blank);
    setEvents(data.events || []);
  }

  async function duplicateEvent(id) {
    const res = await hostFetch(`${API}/host/events/${id}/duplicate`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not duplicate event.");
    setEvents(data.events || []);
  }

  async function deleteEvent(id) {
    if (!confirm("Delete this event from the calendar?")) return;
    const res = await hostFetch(`${API}/host/events/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not delete event.");
    setEvents(data.events || []);
  }

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  return <div className="card glowCard hostEventsPanel">
    <div className="brandMark">BARFLY EVENTS CALENDAR</div>
    <h2>{editingId ? "Edit Weekly Event" : "Add Weekly Event"}</h2>
    <div className="twoCol">
      <div><label>Event Title</label><input value={form.title} onChange={e => update("title", e.target.value)} /></div>
      <div><label>Event Type</label><select value={form.eventType} onChange={e => update("eventType", e.target.value)}>{calendarEventTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>
      <div><label>Venue</label><input value={form.venueName} onChange={e => update("venueName", e.target.value)} /></div>
      <div><label>Location</label><input value={form.venueLocation} onChange={e => update("venueLocation", e.target.value)} /></div>
      <div><label>Day of Week</label><select value={form.dayOfWeek} onChange={e => update("dayOfWeek", Number(e.target.value))}>{weeklyDayOptions.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}</select></div>
      <div><label>Start Time</label><input type="time" value={form.startTime} onChange={e => update("startTime", e.target.value)} /></div>
      <div><label>End Time</label><input type="time" value={form.endTime} onChange={e => update("endTime", e.target.value)} /></div>
      <div><label>Primary Button Name</label><input value={form.buttonText} onChange={e => update("buttonText", e.target.value)} placeholder="Play Bingo, Play Trivia, RSVP, More Info" /></div>
    </div>
    <label>Description</label>
    <textarea value={form.description} onChange={e => update("description", e.target.value)} />
    <label>Prize / Special</label>
    <input value={form.prizeSpecial} onChange={e => update("prizeSpecial", e.target.value)} />
    <label>Primary Button Link</label>
    <input value={form.buttonLink} onChange={e => update("buttonLink", e.target.value)} placeholder="/forecast or https://games.barfly.social/elpasobingo" />
    <p className="microcopy">This is the main public button for online games. Example: Button Name “Play Bingo” + Button Link “https://games.barfly.social/elpasobingo”.</p>

    <div className="row">
      <label className="checkRow"><input type="checkbox" checked={form.featured} onChange={e => update("featured", e.target.checked)} /><span>Featured</span></label>
      <label className="checkRow"><input type="checkbox" checked={form.hidden} onChange={e => update("hidden", e.target.checked)} /><span>Hidden</span></label>
    </div>

    <div className="ctaRow">
      <Button onClick={saveEvent}>{editingId ? "Update Event" : "Add Event"}</Button>
      {editingId && <Button className="secondary" onClick={() => { setEditingId(""); setForm(blank); }}>Cancel Edit</Button>}
      <Button className="secondary" onClick={() => window.location.href = "/events"}>View Public Calendar</Button>
      <Button className="secondary" onClick={() => window.location.href = "/qr/events"}>Events QR</Button>
    </div>

    <h3>Current Calendar Events</h3>
    {events.length === 0 && <p className="muted">No calendar events yet.</p>}
    {events.map(event => <div className="rsvpRow" key={event.id}>
      <div>
        <b>{event.title}</b>
        <p className="muted">{event.eventTypeLabel || eventTypeCalendarLabel(event.eventType)} • {event.dayLabel} {formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
        <p className="microcopy">{event.venueName} {event.hidden ? "• hidden" : ""} {event.featured ? "• featured" : ""}</p>
        <p className="microcopy">Primary button: {event.buttonText || "More Info"} → {event.buttonLink || event.publicPath}</p>
        <p className="microcopy">Page: {event.publicPath}</p>
      </div>
      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => window.location.href = event.publicPath}>View</Button>
        <Button className="secondary" onClick={() => editEvent(event)}>Edit</Button>
        <Button className="secondary" onClick={() => duplicateEvent(event.id)}>Duplicate</Button>
        <Button className="danger" onClick={() => deleteEvent(event.id)}>Delete</Button>
      </div>
    </div>)}
  </div>;
}


function HostManager() {
  if (!getHostPin()) return <HostLogin />;
  const [games, setGames] = React.useState([]);
  const [venueName, setVenueName] = React.useState("BARFLY DATE Night");
  const [venueLocation, setVenueLocation] = React.useState("Baton Rouge, LA");
  const [drinkSpecialTitle, setDrinkSpecialTitle] = React.useState("");
  const [drinkSpecialDetails, setDrinkSpecialDetails] = React.useState("");
  const [drinkSpecialWindow, setDrinkSpecialWindow] = React.useState("During BARFLYDATE session only");
  const [drinkSpecialRestrictions, setDrinkSpecialRestrictions] = React.useState("21+, venue rules apply");
  const [eventType, setEventType] = React.useState("mystery_match");
  const [meetingPointMode, setMeetingPointMode] = React.useState("single");
  const [meetingZones, setMeetingZones] = React.useState("Host Stand");
  const [gameMode, setGameMode] = React.useState("full_90");
  const [maxRsvps, setMaxRsvps] = React.useState(defaultCapacityForMode("full_90"));
  const [maxCheckins, setMaxCheckins] = React.useState(defaultCapacityForMode("full_90"));
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
      body: JSON.stringify({ venueName, venueLocation, eventType, drinkSpecialTitle, drinkSpecialDetails, drinkSpecialWindow, drinkSpecialRestrictions, meetingPointMode, meetingZones, gameMode, maxRsvps, maxCheckins })
    });
    const data = await res.json();
    window.location.href = `/host/${data.id}`;
  }

  async function duplicateLastSession() {
    if (!games.length) {
      alert("No previous session to duplicate.");
      return;
    }

    const last = games[0];
    const res = await fetch(`${API}/games`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({
        venueName: last.venueName,
        venueLocation: last.venueLocation || "",
        eventType: last.eventType || "mystery_match",
        drinkSpecialTitle: last.drinkSpecial?.title || "",
        drinkSpecialDetails: last.drinkSpecial?.details || "",
        drinkSpecialWindow: last.drinkSpecial?.redeemWindow || "During BARFLYDATE session only",
        drinkSpecialRestrictions: last.drinkSpecial?.restrictions || "21+, venue rules apply",
        meetingPointMode: last.meetingSetup?.mode || "single",
        meetingZones: (last.meetingSetup?.zones || ["Host Stand"]).join("\\n"),
        gameMode: last.gameMode || "full_90",
        maxRsvps: last.capacity?.maxRsvps || defaultCapacityForMode(last.gameMode || "full_90"),
        maxCheckins: last.capacity?.maxCheckins || defaultCapacityForMode(last.gameMode || "full_90")
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      alert(data.error || "Could not duplicate session.");
      return;
    }
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


    <div className="card checklistCard">
      <div className="brandMark">HOST RUN OF SHOW</div>
      <p className="checkOk">1. Create sessions and set capacity.</p>
      <p className="checkOk">2. Add venue drink specials and meeting zones.</p>
      <p className="checkOk">3. Watch RSVPs and forecast demand.</p>
      <p className="checkOk">4. Open check-in at the venue.</p>
      <p className="checkOk">5. Confirm checked-in players before starting.</p>
      <p className="checkOk">6. Start game, monitor safety, then reveal results.</p>
    </div>

    <HostEventsPanel />

    {totalOpenReports > 0 && <div className="alert">
      Safety attention needed: {totalOpenReports} open report{totalOpenReports === 1 ? "" : "s"} across active sessions.
    </div>}

    <div className="card glowCard">
      <h2>Create New Game</h2>
      <label>Event Name</label>
      <input value={venueName} onChange={e => setVenueName(e.target.value)} />
      <label>Venue Location</label>
      <input value={venueLocation} onChange={e => setVenueLocation(e.target.value)} placeholder="e.g. Baton Rouge, LA" />

      <label>Event Type</label>
      <select value={eventType} onChange={e => setEventType(e.target.value)}>
        {eventTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <p className="microcopy">{eventTypeOptions.find(option => option.value === eventType)?.details}</p>

      <label>Meeting Point Mode</label>
      <select value={meetingPointMode} onChange={e => setMeetingPointMode(e.target.value)}>
        <option value="single">Single Meeting Point</option>
        <option value="multiple">Multiple Zones</option>
        <option value="none">No Location Assignment</option>
      </select>
      {meetingPointMode !== "none" && <>
        <label>{meetingPointMode === "single" ? "Meeting Point" : "Meeting Zones"}</label>
        <textarea value={meetingZones} onChange={e => setMeetingZones(e.target.value)} placeholder={meetingPointMode === "single" ? "Host Stand" : "Host Stand\nBar Area\nPatio\nStage Side"} />
        <p className="microcopy">Enter one zone per line. These are specific to this venue layout.</p>
      </>}

      <label>Drink Special Title</label>
      <input value={drinkSpecialTitle} onChange={e => setDrinkSpecialTitle(e.target.value)} placeholder="$1 off featured drink" />
      <label>Drink Special Details</label>
      <input value={drinkSpecialDetails} onChange={e => setDrinkSpecialDetails(e.target.value)} placeholder="Available while playing BARFLYDATE" />
      <label>Redeem Window</label>
      <input value={drinkSpecialWindow} onChange={e => setDrinkSpecialWindow(e.target.value)} placeholder="During BARFLYDATE session only" />
      <label>Restrictions</label>
      <input value={drinkSpecialRestrictions} onChange={e => setDrinkSpecialRestrictions(e.target.value)} placeholder="21+, venue rules apply" />

      <label>Session Length</label>
      <select value={gameMode} onChange={e => { const mode = e.target.value; setGameMode(mode); setMaxRsvps(defaultCapacityForMode(mode)); setMaxCheckins(defaultCapacityForMode(mode)); }}>
        {gameModeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <p className="microcopy">{gameModeOptions.find(option => option.value === gameMode)?.details}</p>
      <div className="twoCol">
        <div><label>Max RSVPs</label><input type="number" min="2" max="250" value={maxRsvps} onChange={e => setMaxRsvps(Number(e.target.value))} /></div>
        <div><label>Max Check-ins</label><input type="number" min="2" max="250" value={maxCheckins} onChange={e => setMaxCheckins(Number(e.target.value))} /></div>
      </div>
      <h3>App Journey</h3>
      <AppJourney mode={gameMode} />

      <div className="ctaRow"><Button onClick={createGame}>Create Game Code</Button><Button className="secondary" onClick={duplicateLastSession}>Duplicate Last Session</Button></div>
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
          {game.venueLocation && <p className="muted">{game.venueLocation}</p>}
          <p className="muted">Code: <b>{game.gameCode}</b> • {capacityText(game.capacity)}</p>
          <p className="muted">{game.eventTypeInfo?.label || eventTypeLabel(game.eventType)} • {game.modeLabel || gameModeLabel(game.gameMode)} • {game.phaseLabel} • Round {game.currentRound}</p>
          <p className="microcopy">Meeting: {meetingModeLabel(game.meetingSetup?.mode)} • {meetingZonesText(game.meetingSetup)}</p>
          <p className="microcopy">Apps: {(game.appOrder || appOrderForMode(game.gameMode)).join(" → ")}</p>
          <p className={game.openSafetyReportCount ? "dangerText" : "muted"}>Safety Reports: {game.openSafetyReportCount || 0} open / {game.safetyReportCount || 0} total</p>
          {game.drinkSpecial?.hasSpecial && <p className="sparkLine">Special: {game.drinkSpecial.publicText}</p>}
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
  const [rsvps, setRsvps] = React.useState([]);
  const [rsvpForecast, setRsvpForecast] = React.useState(null);
  const [allSessions, setAllSessions] = React.useState([]);
  const [rsvpSearch, setRsvpSearch] = React.useState("");
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

      const rsvpRes = await hostFetch(`${API}/games/${gameId}/rsvps`);
      const rsvpData = await rsvpRes.json().catch(() => ({ rsvps: [], forecast: null }));

      const forecastRes = await fetch(`${API}/forecast`);
      const forecastData = await forecastRes.json().catch(() => ({ sessions: [] }));

      if (!reportRes.ok || reportData.error) {
        setError(reportData.error || "Could not load safety reports.");
        setGame(data);
        setReports([]);
        return;
      }

      if (!rsvpRes.ok || rsvpData.error) {
        setError(rsvpData.error || "Could not load RSVPs.");
        setGame(data);
        setRsvps([]);
        setRsvpForecast(null);
        return;
      }

      setGame(data);
      setReports(reportData.reports || []);
      setRsvps(rsvpData.rsvps || []);
      setRsvpForecast(rsvpData.forecast || null);
      setAllSessions(forecastData.sessions || []);
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

    const checkedInPlayers = (game.players || []).filter(player => !player.removedAt);
    const men = checkedInPlayers.filter(player => player.gender === "man").length;
    const women = checkedInPlayers.filter(player => player.gender === "woman").length;
    if (men && women && Math.max(men, women) / Math.max(1, Math.min(men, women)) >= 2) {
      warnings.push(`Lopsided check-in mix: ${men} men / ${women} women.`);
    }

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

  async function copyRsvpId(id) {
    try {
      await navigator.clipboard.writeText(id);
      alert("RSVP ID copied.");
    } catch (err) {
      prompt("Copy this RSVP ID:", id);
    }
  }

  async function hostCancelRsvp(rsvp) {
    if (!confirm(`Cancel RSVP for ${rsvp.nickname}?`)) return;
    const res = await hostFetch(`${API}/host/rsvps/${rsvp.id}/cancel`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not cancel RSVP.");
    refresh();
  }

  async function hostMarkNoShow(rsvp) {
    if (!confirm(`Mark ${rsvp.nickname} as no-show?`)) return;
    const res = await hostFetch(`${API}/host/rsvps/${rsvp.id}/mark-no-show`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not mark no-show.");
    refresh();
  }

  async function markOpenRsvpsNoShow() {
    if (!confirm("Mark all open, not checked-in RSVPs as no-show?")) return;
    const res = await hostFetch(`${API}/games/${gameId}/mark-open-rsvps-no-show`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not mark no-shows.");
    alert(`Marked ${data.marked || 0} RSVP(s) as no-show.`);
    refresh();
  }


  async function hostMoveRsvp(rsvp) {
    const choices = allSessions
      .filter(session => session.id !== rsvp.gameId && !session.locked && !session.capacity?.rsvpFull)
      .map((session, index) => `${index + 1}. ${session.venueName} (${session.modeLabel})`);

    if (!choices.length) return alert("No open sessions available to move into.");

    const answer = prompt(`Move ${rsvp.nickname} to which session?\n\n${choices.join("\n")}\n\nType the number:`);
    const index = Number(answer) - 1;
    const target = allSessions.filter(session => session.id !== rsvp.gameId && !session.locked && !session.capacity?.rsvpFull)[index];
    if (!target) return;

    const res = await hostFetch(`${API}/host/rsvps/${rsvp.id}/change-session`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ gameId: target.id })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not move RSVP.");
    alert(`Moved ${rsvp.nickname} to ${target.venueName}.`);
    refresh();
  }

  async function generateTestRsvps() {
    const count = Number(prompt("How many test RSVPs?", "10") || 0);
    if (!count) return;
    const res = await hostFetch(`${API}/games/${gameId}/test-rsvps`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ count })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not generate test RSVPs.");
    alert(`Generated ${data.created || 0} test RSVPs.`);
    refresh();
  }

  async function generateTestCheckins() {
    const count = Number(prompt("How many RSVPs should be checked in?", "10") || 0);
    if (!count) return;
    const res = await hostFetch(`${API}/games/${gameId}/test-checkins`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ count })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not generate test check-ins.");
    alert(`Checked in ${data.checkedIn || 0} test RSVPs.`);
    refresh();
  }

  async function clearTestRsvps() {
    if (!confirm("Clear test RSVPs and test players for this session?")) return;
    const res = await hostFetch(`${API}/games/${gameId}/clear-test-rsvps`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not clear test RSVPs.");
    alert(`Cleared ${data.clearedRsvps || 0} test RSVPs and ${data.clearedPlayers || 0} test players.`);
    refresh();
  }

  if (!game) return <div className="screen"><div className="brandMark">{APP_VERSION}</div><h1>Loading dashboard...</h1><p className="muted">If this hangs, confirm this is deployed as a Render Web Service and the Host PIN is correct.</p></div>;

  return <div className="screen">
    <Button className="secondary" onClick={() => window.location.href = "/host"}>All Games</Button>
    <div className="brandMark">BARFLY DATE</div>
    <h1>{game.venueName}</h1>
    <p className="sparkLine">{game.eventTypeInfo?.label || eventTypeLabel(game.eventType)}</p>
    {game.venueLocation && <p className="muted">{game.venueLocation}</p>}
    <div className="versionRow">
      <span className="statusPill">{APP_VERSION}</span>
      <StorageStatus health={health} />
    </div>
    {error && <div className="alert">{error}</div>}

    <div className="card bigcode glowCard">
      <div className="muted">Game Code</div>
      <b>{game.gameCode}</b>
      <p className="muted">Player join: {window.location.origin}/join</p>
      {game.venueLocation && <p className="muted">Venue: {game.venueLocation}</p>}
      <p className="sparkLine">{game.modeLabel || gameModeLabel(game.gameMode)}</p>
      <p className="microcopy">Meeting: {meetingModeLabel(game.meetingSetup?.mode)} • {meetingZonesText(game.meetingSetup)}</p>
      <DrinkSpecialCard special={game.drinkSpecial} />
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
    <DrinkSpecialCard special={game.drinkSpecial} redeem={true} />
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
      <p className={game.capacity?.checkinFull ? "checkWarn" : "checkOk"}>✓ Capacity: {capacityText(game.capacity)}</p>
      <p className="checkOk">✓ Meeting zones: {meetingZonesText(game.meetingSetup)}</p>
    </div>}

    <div className="row">
      {game.status === "lobby" && <Button onClick={startGameWithChecklist}>Start {game.modeLabel || gameModeLabel(game.gameMode)}</Button>}
      {game.status !== "lobby" && game.status !== "paused" && game.status !== "complete" && <Button className="warning" onClick={() => action("pause")}>Pause</Button>}
      {game.status === "paused" && <Button onClick={() => action("resume")}>Resume</Button>}
      {game.status !== "lobby" && game.status !== "complete" && <Button className="secondary" onClick={() => action("skip-phase", "Skip to the next phase?")}>Skip Phase</Button>}
      {game.status !== "lobby" && game.status !== "complete" && <Button className="warning" onClick={() => action("end-game", "End game early and send players to voting?")}>End Game</Button>}
      <Button className="danger" onClick={() => action("reset", "Reset/Clear this game? This removes players, rounds, votes, reports, and results.")}>Reset / Clear</Button>
      <Button className="secondary" onClick={createTestSafetyReport}>Test Safety Alert</Button>
      <Button className="secondary" onClick={() => window.location.href = `/host/${game.id}/event`}>Event Mode</Button>
      <Button className="secondary" onClick={() => window.location.href = `/host/${game.id}/report`}>Business Report</Button>
    </div>


    <h2>RSVP / Check-In Panel</h2>
    <div className="card">
      <div className="compact">
        <div>
          <h3>{rsvps.length} RSVPs • {rsvps.filter(rsvp => rsvp.checkedIn).length} checked in</h3>
          <p className="muted">{capacityText(game.capacity)}</p>
          <p className="muted">RSVPs forecast demand. Only checked-in players enter the live game.</p>
        </div>
        <Button className="secondary" onClick={() => window.location.href = "/forecast"}>View Public Forecast</Button>
      </div>

      <div className="row">
        <Button className="secondary" onClick={generateTestRsvps}>Generate Test RSVPs</Button>
        <Button className="secondary" onClick={generateTestCheckins}>Generate Test Check-ins</Button>
        <Button className="danger" onClick={clearTestRsvps}>Clear Test RSVPs</Button>
        <Button className="warning" onClick={markOpenRsvpsNoShow}>Mark Open RSVPs No-Show</Button>
      </div>

      <label>Search RSVPs</label>
      <input value={rsvpSearch} onChange={e => setRsvpSearch(e.target.value)} placeholder="Search alias, intent, or status" />

      {rsvpForecast && <div className="demandGrid">
        {lookingForOptions.map(option => <div className="demandChip" key={option.value}>
          <span>{option.label}</span>
          <b>{rsvpForecast.forecast?.[option.value]?.level || "Building"}</b>
        </div>)}
      </div>}

      {rsvps.length === 0 && <p className="muted">No RSVPs yet.</p>}
      {rsvps
        .filter(rsvp => {
          const term = rsvpSearch.trim().toLowerCase();
          if (!term) return true;
          return [rsvp.nickname, lookingForLabel(rsvp.lookingFor), rsvp.status, rsvp.venueName].some(value => String(value || "").toLowerCase().includes(term));
        })
        .map(rsvp => <div className="rsvpRow" key={rsvp.id}>
        <div>
          <b>{rsvp.nickname}</b>
          <p className="muted">{lookingForLabel(rsvp.lookingFor)} • Ages {rsvp.preferredMinAge || 25}-{rsvp.preferredMaxAge || 45} • {rsvpStatusText(rsvp)}</p>
          <p className="microcopy">RSVP ID: {rsvp.id}</p>
          {rsvp.isTest && <p className="sparkLine">Test RSVP</p>}
        </div>
        <div className="hostPlayerActions playerViewActions">
          <span className={rsvp.checkedIn ? "statusPill storageOk" : rsvp.locked ? "statusPill storageWarn" : "statusPill"}>{rsvpStatusText(rsvp)}</span>
          <Button className="secondary" onClick={() => copyRsvpId(rsvp.id)}>Copy ID</Button>
          {!rsvp.checkedIn && !rsvp.locked && rsvp.status !== "cancelled" && <Button className="secondary" onClick={() => hostMoveRsvp(rsvp)}>Move</Button>}
          {!rsvp.checkedIn && rsvp.status !== "cancelled" && rsvp.status !== "no_show" && <Button className="warning" onClick={() => hostMarkNoShow(rsvp)}>No-Show</Button>}
          {!rsvp.checkedIn && rsvp.status !== "cancelled" && <Button className="danger" onClick={() => hostCancelRsvp(rsvp)}>Cancel</Button>}
        </div>
      </div>)}
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
        <p className="microcopy">{pairing.matchReason || "Best available route"} • Score {pairing.score}</p>
        <p className="sparkLine">Location: {pairing.meetingZone || "Ask host"}</p>
        <p className="sparkLine">Meeting Zone: {pairing.meetingZone || "Ask host"}</p>
        {pairing.sharedInterests?.length > 0 && <p className="muted">Shared: {pairing.sharedInterests.join(", ")}</p>}
      </div>;
    })}

    <div className="row">
      <Button onClick={() => window.location.href = `/results/${game.id}`}>View Results</Button>
      <Button className="secondary" onClick={refresh}>Refresh</Button>
    </div>
  </div>;
}



function BusinessReport() {
  if (!getHostPin()) return <HostLogin />;
  const { parts } = useRoute();
  const gameId = parts[1];
  const [report, setReport] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    hostFetch(`${API}/games/${gameId}/business-report`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setReport(data);
      })
      .catch(() => setError("Could not load business report."));
  }, [gameId]);

  if (error) return <div className="screen"><div className="alert">{error}</div><Button onClick={() => window.location.href = `/host/${gameId}`}>Back to Host</Button></div>;
  if (!report) return <div className="screen"><h1>Loading business report...</h1></div>;

  const summary = report.summary || {};
  const game = report.game || {};

  return <div className="screen businessReport">
    <div className="row"><Button className="secondary" onClick={() => window.location.href = `/host/${gameId}`}>Back to Host</Button><Button onClick={() => window.print()}>Print / Save PDF</Button></div>
    <div className="brandMark">POST-EVENT BUSINESS REPORT</div>
    <h1>{game.venueName}</h1>
    <p className="tagline">{game.eventTypeInfo?.label || eventTypeLabel(game.eventType)} • {game.modeLabel}</p>
    {game.venueLocation && <p className="muted">{game.venueLocation}</p>}

    <div className="mockDashboard">
      <div><span>RSVPs</span><b>{summary.totalRsvps || 0}</b></div>
      <div><span>Checked In</span><b>{summary.checkedIn || 0}</b></div>
      <div><span>No-Shows</span><b>{summary.noShows || 0}</b></div>
      <div><span>Mutual Sparks</span><b>{summary.mutualSparksCreated || 0}</b></div>
      <div><span>Pairings</span><b>{summary.pairingsCreated || 0}</b></div>
      <div><span>Safety Reports</span><b>{summary.safetyReports || 0}</b></div>
      <div><span>Rounds</span><b>{summary.roundsCompleted || 0}</b></div>
      <div><span>Capacity Used</span><b>{game.capacity?.checkedInCount || 0}/{game.capacity?.maxCheckins || 0}</b></div>
    </div>

    <div className="card drinkSpecialCard">
      <div className="brandMark">SPECIAL PROMOTED</div>
      <h2>{game.drinkSpecial?.title || "No special listed"}</h2>
      {game.drinkSpecial?.details && <p>{game.drinkSpecial.details}</p>}
      {game.drinkSpecial?.redeemWindow && <p className="muted">{game.drinkSpecial.redeemWindow}</p>}
    </div>

    <div className="card">
      <h2>Intent Breakdown</h2>
      <div className="demandGrid">
        {Object.values(report.intentBreakdown || {}).map(item => <div className="demandChip" key={item.label}>
          <span>{item.label}</span>
          <b>{item.checkedIn} checked in</b>
          <small>{item.rsvps} RSVPs</small>
        </div>)}
      </div>
    </div>

    <div className="card">
      <h2>Operational Notes</h2>
      <p className="prompt">Venue: {game.venueName}</p>
      <p className="prompt">Meeting zones: {meetingZonesText(game.meetingSetup)}</p>
      <p className="prompt">Exported: {new Date(report.exportedAt).toLocaleString()}</p>
    </div>
  </div>;
}


function HostEventMode() {
  if (!getHostPin()) return <HostLogin />;
  const { parts } = useRoute();
  const gameId = parts[1];
  const [game, setGame] = React.useState(null);
  const [reports, setReports] = React.useState([]);
  const [rsvps, setRsvps] = React.useState([]);
  const [error, setError] = React.useState("");

  async function load() {
    try {
      const gameRes = await hostFetch(`${API}/games/${gameId}`);
      const gameData = await gameRes.json();
      const reportRes = await hostFetch(`${API}/games/${gameId}/reports`);
      const reportData = await reportRes.json().catch(() => ({ reports: [] }));
      const rsvpRes = await hostFetch(`${API}/games/${gameId}/rsvps`);
      const rsvpData = await rsvpRes.json().catch(() => ({ rsvps: [] }));
      if (!gameRes.ok || gameData.error) {
        setError(gameData.error || "Could not load event mode.");
        return;
      }
      setGame(gameData);
      setReports(reportData.reports || []);
      setRsvps(rsvpData.rsvps || []);
      setError("");
    } catch (err) {
      setError("Could not load event mode.");
    }
  }

  React.useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [gameId]);

  async function action(path, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    const res = await hostFetch(`${API}/games/${gameId}/${path}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Action failed");
    setGame(data);
    load();
  }

  async function markNoShows() {
    if (!confirm("Mark all open RSVPs that did not check in as no-show?")) return;
    const res = await hostFetch(`${API}/games/${gameId}/mark-open-rsvps-no-show`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not mark no-shows.");
    alert(`Marked ${data.marked || 0} no-show RSVP(s).`);
    load();
  }

  if (error) return <div className="screen"><div className="alert">{error}</div><Button onClick={() => window.location.href="/host"}>Back to Host</Button></div>;
  if (!game) return <div className="screen"><h1>Loading Event Mode...</h1></div>;

  const checkedIn = (game.players || []).filter(player => !player.removedAt).length;
  const openReports = reports.filter(report => report.status !== "reviewed").length;
  const openRsvps = rsvps.filter(rsvp => rsvp.status === "rsvp_open" && !rsvp.checkedIn).length;

  return <div className="screen eventModeScreen">
    <div className="row"><Button className="secondary" onClick={() => window.location.href = `/host/${game.id}`}>Full Dashboard</Button></div>
    <div className="brandMark">LIVE EVENT MODE</div>
    <h1>{game.venueName}</h1>
    <p className="tagline">{game.eventTypeInfo?.label || eventTypeLabel(game.eventType)} • {game.modeLabel || gameModeLabel(game.gameMode)}</p>

    <div className="eventGrid">
      <div className="card eventMetric"><span>Checked In</span><b>{checkedIn}/{game.capacity?.maxCheckins || "—"}</b></div>
      <div className="card eventMetric"><span>RSVPs</span><b>{rsvps.length}/{game.capacity?.maxRsvps || "—"}</b></div>
      <div className="card eventMetric"><span>Open Reports</span><b className={openReports ? "dangerText" : ""}>{openReports}</b></div>
      <div className="card eventMetric"><span>No-Show Ready</span><b>{openRsvps}</b></div>
    </div>

    <div className="card glowCard">
      <h2>{game.phaseLabel}</h2>
      <p className="muted">Status: {game.status} • Round {game.currentRound} of {game.votingRound || 10}</p>
      <div className="timer"><Countdown endsAt={game.phaseEndsAt} status={game.status} /></div>
      <ProgressBar endsAt={game.phaseEndsAt} totalSeconds={phaseSeconds(game)} status={game.status} />
      <p className="sparkLine">Meeting zones: {meetingZonesText(game.meetingSetup)}</p>
    </div>

    <div className="row">
      {game.status === "lobby" && <Button onClick={() => action("start-game", "Start the live event?")}>Start Game</Button>}
      {game.status !== "lobby" && game.status !== "paused" && game.status !== "complete" && <Button className="warning" onClick={() => action("pause")}>Pause</Button>}
      {game.status === "paused" && <Button onClick={() => action("resume")}>Resume</Button>}
      {game.status !== "lobby" && game.status !== "complete" && <Button className="secondary" onClick={() => action("skip-phase", "Skip to next phase?")}>Skip Phase</Button>}
      <Button className="warning" onClick={markNoShows}>Mark No-Shows</Button>
    </div>

    <h2>Current Pairings</h2>
    {(game.pairings || []).length === 0 && <p className="muted">No pairings in this phase.</p>}
    {(game.pairings || []).map(pairing => {
      const names = pairing.playerIds.map(id => game.players.find(p => p.id === id)?.nickname).filter(Boolean).join(" + ");
      return <div className="card" key={pairing.id}>
        <div className="compact"><b>{names}</b><span className="statusPill">{pairing.meetingZone || "Ask host"}</span></div>
        <p className="muted">{pairing.category} • {pairing.matchReason || "Best available route"}</p>
      </div>;
    })}
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

  const { player, game, pairing, partners, nextPairing, nextPartners } = state;
  const partnerNames = partners?.map(p => p.nickname).join(" + ") || "your next spark";
  const nextPartnerNames = nextPartners?.map(p => p.nickname).join(" + ") || "your next spark";
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
    {game.status === "break" && <div className="card instructionCard">
      <div className="brandMark">NEXT MOVE</div>
      <h1>{nextPairing ? `Next: ${nextPartnerNames}` : "Stay Nearby"}</h1>
      {nextPairing && <p className="sparkLine">Meet at: {nextPairing.meetingZone || "Ask host"}</p>}
      {nextPairing && <p><b>Next Topic:</b> {nextPairing.category}</p>}
      <p><b>Starts in:</b> <Countdown endsAt={game.phaseEndsAt} status={game.status} /></p>
      <p className="microcopy">{nextPairing ? "Head toward the meeting zone when the next round starts." : "Your next match will appear when the next round begins."}</p>
    </div>}
    {game.status === "voting" && <VotingPrompt playerId={player.id} gameId={game.id} />}
    {game.status === "complete" && <CompletePrompt playerId={player.id} gameId={game.id} />}

    {game.status === "round_active" && pairing && <>
      <div className="card instructionCard">
        <div className="brandMark">WHAT TO DO NOW</div>
        <h1>Find {partnerNames}</h1>
        <p className="sparkLine">Meet at: {pairing.meetingZone || "Ask host"}</p>
        <p><b>Topic:</b> {pairing.category}</p>
        <p><b>Time left:</b> <Countdown endsAt={game.phaseEndsAt} status={game.status} /></p>
        <p className="microcopy">After this conversation, you will rate privately. Your answers are not shown to the other player.</p>
      </div>

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
      <p className="microcopy">Last location: {pairing.meetingZone || "Ask host"}</p>

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
  if (!parts[0]) return <SplashScreen />;
  if (parts[0] === "events" && parts[1]) return <EventDetail />;
  if (parts[0] === "events" || parts[0] === "calendar") return <EventsCalendar />;
  if (parts[0] === "tonight" || parts[0] === "this-week") return <TonightPage />;
  if (parts[0] === "venue" && parts[1]) return <VenuePage />;
  if (parts[0] === "business-demo" || parts[0] === "demo") return <BusinessDemo />;
  if (parts[0] === "qr") return <QrDisplay />;
  if (parts[0] === "forecast") return <Forecast />;
  if (parts[0] === "rsvp") return <RSVP />;
  if (parts[0] === "checkin") return <CheckIn />;
  if (parts[0] === "my-rsvp") return <MyRSVP />;
  if (parts[0] === "join") return <Join />;
  if (parts[0] === "host" && parts[1] && parts[2] === "report") return <BusinessReport />;
  if (parts[0] === "host" && parts[1] && parts[2] === "event") return <HostEventMode />;
  if (parts[0] === "host" && parts[1]) return <HostGame />;
  if (parts[0] === "host") return <HostManager />;
  if (parts[0] === "player") return <Player />;
  if (parts[0] === "vote") return <Vote />;
  if (parts[0] === "connections") return <Connections />;
  if (parts[0] === "recap") return <Recap />;
  if (parts[0] === "results") return <Results />;
  return <Forecast />;
}

createRoot(document.getElementById("root")).render(<App />);
