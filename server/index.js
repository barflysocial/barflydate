const express = require("express");
const cors = require("cors");
const path = require("path");
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { createPairings, pairKey, groupKey } = require("./matching");
const { weightedCategoryForGroup, promptsFor, sharedInterests, appOrderForGameMode, categories } = require("./prompts");

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

const EVENT_TYPES = {
  social_mixer: { key: "social_mixer", label: "Social Mixer", description: "Meet new people without dating pressure." },
  friends_activity: { key: "friends_activity", label: "Friends & Activity Partners", description: "Find people for games, activities, and social plans." },
  singles_night: { key: "singles_night", label: "Singles Night", description: "A social dating event for casual and serious sparks." },
  mystery_match: { key: "mystery_match", label: "Mystery Match Night", description: "Premium mystery-date style rounds and reveal." },
  private_party: { key: "private_party", label: "Private Party", description: "Closed group social mixer." }
};

function getEventType(game) {
  return EVENT_TYPES[game?.eventType] ? game.eventType : "mystery_match";
}

function getEventTypeInfo(game) {
  return EVENT_TYPES[getEventType(game)];
}

const FLOW = GAME_MODES[DEFAULT_GAME_MODE];

const voteCategories = [
  { key: "favorite_conversation", label: "Favorite Conversation", award: "Favorite Conversation Award" },
  { key: "funniest_moment", label: "Funniest Moment", award: "Funniest Moment Award" },
  { key: "best_energy", label: "Best Energy", award: "Best Energy Award" },
  { key: "tell_me_more", label: "Tell Me More", award: "Tell Me More Award" },
  { key: "most_mysterious", label: "Most Mysterious", award: "Most Mysterious Award" }
];

const lookingForOptions = [
  { value: "friends_only", label: "Friends Only" },
  { value: "activity_partners", label: "Activity Partners" },
  { value: "casual_dating", label: "Casual Dating" },
  { value: "serious_dating", label: "Serious Dating" },
  { value: "marriage", label: "Marriage" }
];

const intentCompatibility = {
  friends_only: ["friends_only", "activity_partners"],
  activity_partners: ["friends_only", "activity_partners", "casual_dating"],
  casual_dating: ["casual_dating", "activity_partners"],
  serious_dating: ["serious_dating", "marriage"],
  marriage: ["marriage", "serious_dating"]
};

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

  if (requested && !autoAliasDefaults.has(requested.toLowerCase()) && !existing.has(requested.toLowerCase()) && !aliasTakenAcrossActiveSessions(requested)) {
    return requested;
  }

  const available = aliasNames.filter(name => !existing.has(name.toLowerCase()) && !aliasTakenAcrossActiveSessions(name));
  if (available.length) {
    return available[Math.floor(Math.random() * available.length)];
  }

  const base = requested && !autoAliasDefaults.has(requested.toLowerCase()) ? requested : "Mystery Guest";
  let counter = 2;
  let candidate = `${base} ${counter}`;
  while (existing.has(candidate.toLowerCase()) || aliasTakenAcrossActiveSessions(candidate)) {
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
  reports: [],
  rsvps: [],
  events: [],
  eventResponses: [],
  bookingRequests: [],
  analytics: [],
  venues: [],
  eventTemplates: [],
  heroTemplates: [],
  settings: {}
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
    seedDefaultEvents();
    seedDefaultTemplates();
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
      rsvps: [],
      events: [],
      eventResponses: [],
      bookingRequests: [],
      analytics: [],
      venues: [],
      eventTemplates: [],
      heroTemplates: [],
      settings: {},
      ...existing.rows[0].data
    };
    console.log("BARFLYDATE storage: loaded state from PostgreSQL.");
  } else {
    await persistState();
    console.log("BARFLYDATE storage: initialized PostgreSQL state.");
  }

  seedDefaultEvents();
  seedDefaultTemplates();
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




function defaultSettings() {
  return {
    businessPhone: "ADD PHONE NUMBER",
    businessEmail: "ADD EMAIL",
    bookingLink: "/book",
    website: "barfly.social",
    websiteUrl: "https://barfly.social",
    gamesSite: "games.barfly.social",
    gamesUrl: "https://games.barfly.social",
    instagramHandle: "@barflyentertainment",
    instagramUrl: "https://instagram.com/barflyentertainment",
    homepageDestination: "radar",
    eventPromoActive: false,
    eventPromoTitle: "Featured Sponsor",
    eventPromoSponsor: "Barfly Social",
    eventPromoText: "Check out what is happening tonight.",
    eventPromoImageUrl: "",
    eventPromoButtonText: "View Event",
    eventPromoButtonLink: "/events",
    eventPromoStartDate: "",
    eventPromoEndDate: "",
    defaultDisclaimer: "Event details, prizes, and times are subject to venue rules and availability.",
    defaultPrizeRules: "Free to play. Play for prizes. See venue for details."
  };
}

function publicSettings() {
  return { ...defaultSettings(), ...(db.settings || {}) };
}

function normalizeSettings(body = {}) {
  const current = publicSettings();
  return {
    businessPhone: String(body.businessPhone ?? current.businessPhone ?? "").trim(),
    businessEmail: String(body.businessEmail ?? current.businessEmail ?? "").trim(),
    bookingLink: String(body.bookingLink ?? current.bookingLink ?? "").trim(),
    website: String(body.website ?? current.website ?? "").trim(),
    websiteUrl: String(body.websiteUrl ?? current.websiteUrl ?? "").trim(),
    gamesSite: String(body.gamesSite ?? current.gamesSite ?? "").trim(),
    gamesUrl: String(body.gamesUrl ?? current.gamesUrl ?? "").trim(),
    instagramHandle: String(body.instagramHandle ?? current.instagramHandle ?? "").trim(),
    instagramUrl: String(body.instagramUrl ?? current.instagramUrl ?? "").trim(),
    homepageDestination: String(body.homepageDestination ?? current.homepageDestination ?? "radar").trim(),
    eventPromoActive: Boolean(body.eventPromoActive ?? current.eventPromoActive ?? false),
    eventPromoTitle: String(body.eventPromoTitle ?? current.eventPromoTitle ?? "").trim(),
    eventPromoSponsor: String(body.eventPromoSponsor ?? current.eventPromoSponsor ?? "").trim(),
    eventPromoText: String(body.eventPromoText ?? current.eventPromoText ?? "").trim(),
    eventPromoImageUrl: String(body.eventPromoImageUrl ?? current.eventPromoImageUrl ?? "").trim(),
    eventPromoButtonText: String(body.eventPromoButtonText ?? current.eventPromoButtonText ?? "").trim(),
    eventPromoButtonLink: String(body.eventPromoButtonLink ?? current.eventPromoButtonLink ?? "").trim(),
    eventPromoStartDate: String(body.eventPromoStartDate ?? current.eventPromoStartDate ?? "").trim(),
    eventPromoEndDate: String(body.eventPromoEndDate ?? current.eventPromoEndDate ?? "").trim(),
    defaultDisclaimer: String(body.defaultDisclaimer ?? current.defaultDisclaimer ?? "").trim(),
    defaultPrizeRules: String(body.defaultPrizeRules ?? current.defaultPrizeRules ?? "").trim()
  };
}



function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function trackAnalytics(type, eventId = null, metadata = {}) {
  const entry = {
    id: nanoid(),
    type: String(type || "unknown"),
    eventId: eventId || null,
    metadata: metadata || {},
    createdAt: new Date().toISOString()
  };
  db.analytics = [entry, ...(db.analytics || [])].slice(0, 10000);
  return entry;
}

function publicAnalyticsSummary() {
  const analytics = db.analytics || [];
  const eventsById = Object.fromEntries((db.events || []).map(event => [event.id, event]));
  const totals = {};
  analytics.forEach(entry => {
    totals[entry.type] = (totals[entry.type] || 0) + 1;
  });

  const byEvent = {};
  analytics.forEach(entry => {
    if (!entry.eventId) return;
    const key = entry.eventId;
    byEvent[key] = byEvent[key] || {
      eventId: key,
      title: eventsById[key]?.title || "Unknown event",
      venueName: eventsById[key]?.venueName || "",
      page_view: 0,
      qr_scan: 0,
      primary_click: 0,
      poster_view: 0,
      caption_copy: 0,
      interested: 0,
      going: 0
    };
    if (byEvent[key][entry.type] !== undefined) byEvent[key][entry.type] += 1;
  });

  (db.eventResponses || []).forEach(response => {
    byEvent[response.eventId] = byEvent[response.eventId] || {
      eventId: response.eventId,
      title: eventsById[response.eventId]?.title || "Unknown event",
      venueName: eventsById[response.eventId]?.venueName || "",
      page_view: 0,
      qr_scan: 0,
      primary_click: 0,
      poster_view: 0,
      caption_copy: 0,
      interested: 0,
      going: 0
    };
    if (response.response === "interested") byEvent[response.eventId].interested += 1;
    if (response.response === "going") byEvent[response.eventId].going += 1;
  });

  return {
    totals,
    byEvent: Object.values(byEvent).sort((a, b) => (b.page_view + b.primary_click + b.qr_scan) - (a.page_view + a.primary_click + a.qr_scan)),
    recent: analytics.slice(0, 50)
  };
}

function datePlusDays(dateString, days) {
  const d = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}


function normalizeBookingRequest(body = {}, existing = {}) {
  const eventScope = ["private", "public", "demo"].includes(body.eventScope) ? body.eventScope : (existing.eventScope || "public");
  return {
    id: existing.id || nanoid(),
    name: String(body.name ?? existing.name ?? "").trim(),
    eventScope,
    requestedDate: String(body.requestedDate ?? existing.requestedDate ?? "").trim(),
    requestedTime: String(body.requestedTime ?? existing.requestedTime ?? "").trim(),
    duration: String(body.duration ?? existing.duration ?? "").trim(),
    contactPhone: String(body.contactPhone ?? existing.contactPhone ?? "").trim(),
    contactEmail: String(body.contactEmail ?? existing.contactEmail ?? "").trim(),
    budgetRange: String(body.budgetRange ?? existing.budgetRange ?? "").trim(),
    notes: String(body.notes ?? existing.notes ?? "").trim(),
    estimatedPrice: String(body.estimatedPrice ?? existing.estimatedPrice ?? "").trim(),
    depositRequired: String(body.depositRequired ?? existing.depositRequired ?? "").trim(),
    depositPaid: String(body.depositPaid ?? existing.depositPaid ?? "").trim(),
    balanceDue: String(body.balanceDue ?? existing.balanceDue ?? "").trim(),
    paymentLink: String(body.paymentLink ?? existing.paymentLink ?? "").trim(),
    invoiceStatus: String(body.invoiceStatus ?? existing.invoiceStatus ?? "not_sent"),
    paymentNotes: String(body.paymentNotes ?? existing.paymentNotes ?? "").trim(),
    status: String(body.status ?? existing.status ?? "new"),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function publicBookingRequest(booking) {
  return {
    id: booking.id,
    name: booking.name,
    eventScope: booking.eventScope,
    requestedDate: booking.requestedDate,
    requestedTime: booking.requestedTime,
    duration: booking.duration,
    contactPhone: booking.contactPhone,
    contactEmail: booking.contactEmail,
    budgetRange: booking.budgetRange || "",
    notes: booking.notes,
    estimatedPrice: booking.estimatedPrice || "",
    depositRequired: booking.depositRequired || "",
    depositPaid: booking.depositPaid || "",
    balanceDue: booking.balanceDue || "",
    paymentLink: booking.paymentLink || "",
    invoiceStatus: booking.invoiceStatus || "not_sent",
    paymentNotes: booking.paymentNotes || "",
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}


const eventTypeLabels = {
  barfly_social: "Barfly Social",
  bingo: "Bingo",
  trivia: "Trivia",
  karaoke: "Karaoke",
  mystery: "Digital Mystery",
  escape_room: "Digital Escape Room",
  music_bingo: "Music Bingo",
  special: "Special Event"
};

const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];


function slugifyEvent(value) {
  return String(value || "event")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "event";
}

function uniqueEventSlug(baseSlug, excludeId = null) {
  const base = slugifyEvent(baseSlug);
  let slug = base;
  let counter = 2;
  const existing = new Set((db.events || [])
    .filter(event => event.id !== excludeId)
    .map(event => event.slug)
    .filter(Boolean));
  while (existing.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}


function normalizeVenue(body = {}, existing = {}) {
  return {
    id: existing.id || nanoid(),
    name: String(body.name ?? existing.name ?? "").trim(),
    address: String(body.address ?? existing.address ?? "").trim(),
    city: String(body.city ?? existing.city ?? "").trim(),
    logoUrl: String(body.logoUrl ?? existing.logoUrl ?? "").trim(),
    contactPerson: String(body.contactPerson ?? existing.contactPerson ?? "").trim(),
    contactPhone: String(body.contactPhone ?? existing.contactPhone ?? "").trim(),
    contactEmail: String(body.contactEmail ?? existing.contactEmail ?? "").trim(),
    defaultPrizeRules: String(body.defaultPrizeRules ?? existing.defaultPrizeRules ?? "").trim(),
    defaultPlayLink: String(body.defaultPlayLink ?? existing.defaultPlayLink ?? "").trim(),
    defaultEventNotes: String(body.defaultEventNotes ?? existing.defaultEventNotes ?? "").trim(),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function publicVenue(venue) {
  return { ...venue };
}

function normalizeEventTemplate(body = {}, existing = {}) {
  return {
    id: existing.id || nanoid(),
    name: String(body.name ?? existing.name ?? "Event Template").trim() || "Event Template",
    eventType: String(body.eventType ?? existing.eventType ?? "special"),
    title: String(body.title ?? existing.title ?? "").trim(),
    description: String(body.description ?? existing.description ?? "").trim(),
    prizeSpecial: String(body.prizeSpecial ?? existing.prizeSpecial ?? "").trim(),
    buttonText: String(body.buttonText ?? existing.buttonText ?? "More Info").trim() || "More Info",
    buttonLink: String(body.buttonLink ?? existing.buttonLink ?? "/events").trim() || "/events",
    onlineOnly: Boolean(body.onlineOnly ?? existing.onlineOnly ?? false),
    eventStatus: String(body.eventStatus ?? existing.eventStatus ?? "scheduled"),
    customEventType: String(body.customEventType ?? existing.customEventType ?? "").trim(),
    redemptionRules: String(body.redemptionRules ?? existing.redemptionRules ?? "").trim(),
    eventImageUrl: String(body.eventImageUrl ?? existing.eventImageUrl ?? "").trim(),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function publicEventTemplate(template) {
  return { ...template };
}

function normalizeHeroKey(value) {
  return slugifyEvent(value || "").toLowerCase();
}

function normalizeHeroTemplate(body = {}, existing = {}) {
  return {
    id: existing.id || nanoid(),
    venueName: String(body.venueName ?? existing.venueName ?? "").trim(),
    venueKey: normalizeHeroKey(body.venueName ?? existing.venueName ?? ""),
    heroVariant: String(body.heroVariant ?? existing.heroVariant ?? "general-trivia").trim(),
    heroVariantLabel: String(body.heroVariantLabel ?? existing.heroVariantLabel ?? "").trim(),
    heroImageUrl: String(body.heroImageUrl ?? existing.heroImageUrl ?? "").trim(),
    active: Boolean(body.active ?? existing.active ?? true),
    notes: String(body.notes ?? existing.notes ?? "").trim(),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function publicHeroTemplate(template) {
  return { ...template };
}

function heroTemplateForEvent(event) {
  const variant = String(event.heroVariant || "").trim();
  const venueKey = normalizeHeroKey(event.venueName || "");
  if (!variant || !venueKey) return null;
  return (db.heroTemplates || []).find(template =>
    template.active !== false &&
    template.venueKey === venueKey &&
    template.heroVariant === variant &&
    template.heroImageUrl
  ) || null;
}

function seedDefaultTemplates() {
  if ((db.eventTemplates || []).length) return;
  db.eventTemplates = [
    normalizeEventTemplate({
      name: "Workday Blackout Bingo",
      eventType: "bingo",
      title: "Workday Blackout Bingo",
      description: "Fast digital bingo designed for lunch crowds and workday breaks.",
      prizeSpecial: "Free to play. Play for prizes.",
      buttonText: "Play Bingo",
      buttonLink: "https://games.barfly.social/elpasobingo",
      onlineOnly: true
    }),
    normalizeEventTemplate({
      name: "Trivia Night",
      eventType: "trivia",
      title: "Trivia Night",
      description: "Live trivia with Barfly Entertainment.",
      prizeSpecial: "Free to play. Play for prizes.",
      buttonText: "Play Trivia",
      buttonLink: "/play",
      onlineOnly: false
    }),
    normalizeEventTemplate({
      name: "Karaoke Night",
      eventType: "karaoke",
      title: "Karaoke Night",
      description: "Hosted karaoke night with Barfly Entertainment.",
      prizeSpecial: "Sign up early and grab a song.",
      buttonText: "More Info",
      buttonLink: "/events",
      onlineOnly: false
    }),
    normalizeEventTemplate({
      name: "Barfly Social Mixer",
      eventType: "barfly_social",
      title: "Barfly Social Mixer",
      description: "A guided social experience that helps guests meet, mingle, and play.",
      prizeSpecial: "RSVP and check in at the venue.",
      buttonText: "View Forecast / RSVP",
      buttonLink: "/forecast",
      onlineOnly: false
    }),
    normalizeEventTemplate({
      name: "Digital Mystery",
      eventType: "mystery",
      customEventType: "Digital Mystery",
      title: "Digital Mystery",
      description: "A digital mystery game experience for groups, bars, and private events.",
      prizeSpecial: "Solve the case for prizes.",
      buttonText: "Start Mystery",
      buttonLink: "/play",
      onlineOnly: true
    }),
    normalizeEventTemplate({
      name: "Digital Escape Room",
      eventType: "escape_room",
      customEventType: "Digital Escape Room",
      title: "Digital Escape Room",
      description: "A timed digital escape room experience for bars, private events, and teams.",
      prizeSpecial: "Escape before time runs out.",
      buttonText: "Start Escape Room",
      buttonLink: "/play",
      onlineOnly: true
    })
  ];
}


function normalizeWeeklyEvent(body = {}, existing = {}) {
  const recurringWeekly = body.recurringWeekly ?? existing.recurringWeekly ?? true;
  return {
    id: existing.id || nanoid(),
    venueId: String(body.venueId ?? existing.venueId ?? "").trim(),
    templateId: String(body.templateId ?? existing.templateId ?? "").trim(),
    posterTemplateSlug: String(body.posterTemplateSlug ?? existing.posterTemplateSlug ?? "").trim(),
    posterOverlayLayout: String(body.posterOverlayLayout ?? existing.posterOverlayLayout ?? "").trim(),
    heroVariant: String(body.heroVariant ?? existing.heroVariant ?? "").trim(),
    heroImageUrl: String(body.heroImageUrl ?? existing.heroImageUrl ?? "").trim(),
    meetMingleEnabled: Boolean(body.meetMingleEnabled ?? existing.meetMingleEnabled ?? true),
    meetMingleGameId: String(body.meetMingleGameId ?? existing.meetMingleGameId ?? "").trim(),
    meetMingleGameMode: String(body.meetMingleGameMode ?? existing.meetMingleGameMode ?? DEFAULT_GAME_MODE),
    meetMingleMaxRsvps: normalizeCapacity(body.meetMingleMaxRsvps ?? existing.meetMingleMaxRsvps, getDefaultCapacityForMode(String(body.meetMingleGameMode ?? existing.meetMingleGameMode ?? DEFAULT_GAME_MODE))),
    meetMingleMaxCheckins: normalizeCapacity(body.meetMingleMaxCheckins ?? existing.meetMingleMaxCheckins, getDefaultCapacityForMode(String(body.meetMingleGameMode ?? existing.meetMingleGameMode ?? DEFAULT_GAME_MODE))),
    meetMinglePointMode: normalizeMeetingPointMode(body.meetMinglePointMode ?? existing.meetMinglePointMode ?? "single"),
    meetMingleZones: String(body.meetMingleZones ?? existing.meetMingleZones ?? "Host Stand").trim() || "Host Stand",
    meetMingleDrinkSpecialTitle: String(body.meetMingleDrinkSpecialTitle ?? existing.meetMingleDrinkSpecialTitle ?? "").trim(),
    meetMingleDrinkSpecialDetails: String(body.meetMingleDrinkSpecialDetails ?? existing.meetMingleDrinkSpecialDetails ?? "").trim(),
    meetMingleDrinkSpecialWindow: String(body.meetMingleDrinkSpecialWindow ?? existing.meetMingleDrinkSpecialWindow ?? "During BARFLYDATE session only").trim(),
    meetMingleDrinkSpecialRestrictions: String(body.meetMingleDrinkSpecialRestrictions ?? existing.meetMingleDrinkSpecialRestrictions ?? "21+, venue rules apply").trim(),
    slug: uniqueEventSlug(body.slug || body.title || existing.slug || existing.title || "event", existing.id),
    title: String(body.title ?? existing.title ?? "Barfly Event").trim() || "Barfly Event",
    eventType: String(body.eventType ?? existing.eventType ?? "special"),
    customEventType: String(body.customEventType ?? existing.customEventType ?? "").trim(),
    venueName: String(body.venueName ?? existing.venueName ?? "").trim(),
    venueLocation: String(body.venueLocation ?? existing.venueLocation ?? "").trim(),
    dayOfWeek: Math.max(0, Math.min(6, Number(body.dayOfWeek ?? existing.dayOfWeek ?? new Date().getDay()))),
    date: body.date || existing.date || "",
    startTime: String(body.startTime ?? existing.startTime ?? "19:00"),
    endTime: String(body.endTime ?? existing.endTime ?? "22:00"),
    recurringWeekly: Boolean(recurringWeekly),
    onlineOnly: Boolean(body.onlineOnly ?? existing.onlineOnly ?? false),
    eventStatus: String(body.eventStatus ?? existing.eventStatus ?? "scheduled"),
    description: String(body.description ?? existing.description ?? "").trim(),
    prizeSpecial: String(body.prizeSpecial ?? existing.prizeSpecial ?? "").trim(),
    sponsorName: String(body.sponsorName ?? existing.sponsorName ?? "").trim(),
    sponsorLogoUrl: String(body.sponsorLogoUrl ?? existing.sponsorLogoUrl ?? "").trim(),
    venueLogoUrl: String(body.venueLogoUrl ?? existing.venueLogoUrl ?? "").trim(),
    eventImageUrl: String(body.eventImageUrl ?? existing.eventImageUrl ?? "").trim(),
    prizeName: String(body.prizeName ?? existing.prizeName ?? "").trim(),
    prizeValue: String(body.prizeValue ?? existing.prizeValue ?? "").trim(),
    redemptionRules: String(body.redemptionRules ?? existing.redemptionRules ?? "").trim(),
    expirationDate: String(body.expirationDate ?? existing.expirationDate ?? "").trim(),
    paidEvent: Boolean(body.paidEvent ?? existing.paidEvent ?? false),
    ticketPrice: String(body.ticketPrice ?? existing.ticketPrice ?? "").trim(),
    paymentLink: String(body.paymentLink ?? existing.paymentLink ?? "").trim(),
    buttonText: String(body.buttonText ?? existing.buttonText ?? (String(body.eventType ?? existing.eventType ?? "") === "barfly_social" ? "View Forecast / RSVP" : "More Info")).trim() || "More Info",
    buttonLink: String(body.buttonLink ?? existing.buttonLink ?? (String(body.eventType ?? existing.eventType ?? "") === "barfly_social" ? "/forecast" : "/events")).trim() || "/events",
    featured: Boolean(body.featured ?? existing.featured ?? false),
    hidden: Boolean(body.hidden ?? existing.hidden ?? false),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function syncMeetMingleSessionForEvent(event) {
  if (!event.meetMingleEnabled) {
    event.meetMingleGameId = "";
    return null;
  }

  const mode = GAME_MODES[event.meetMingleGameMode] ? event.meetMingleGameMode : DEFAULT_GAME_MODE;
  const existingGame = event.meetMingleGameId ? db.games[event.meetMingleGameId] : null;
  const id = existingGame?.id || nanoid();
  const now = new Date().toISOString();

  db.games[id] = {
    ...(existingGame || {}),
    id,
    gameCode: existingGame?.gameCode || makeCode(),
    linkedEventId: event.id,
    linkedEventSlug: event.slug || "",
    linkedEventTitle: event.title || "",
    venueName: event.venueName || event.title || "Barfly Social Event",
    venueLocation: event.venueLocation || "",
    eventType: "social_mixer",
    meetingPointMode: normalizeMeetingPointMode(event.meetMinglePointMode || "single"),
    meetingZones: parseMeetingZones(event.meetMingleZones || "Host Stand"),
    drinkSpecialTitle: event.meetMingleDrinkSpecialTitle || "",
    drinkSpecialDetails: event.meetMingleDrinkSpecialDetails || event.prizeSpecial || "",
    drinkSpecialWindow: event.meetMingleDrinkSpecialWindow || "During BARFLYDATE session only",
    drinkSpecialRestrictions: event.meetMingleDrinkSpecialRestrictions || event.redemptionRules || "21+, venue rules apply",
    gameMode: mode,
    maxRsvps: normalizeCapacity(event.meetMingleMaxRsvps, getDefaultCapacityForMode(mode)),
    maxCheckins: normalizeCapacity(event.meetMingleMaxCheckins, getDefaultCapacityForMode(mode)),
    status: existingGame?.status || "lobby",
    phaseType: existingGame?.phaseType || "lobby",
    phaseLabel: existingGame?.phaseLabel || "Lobby",
    currentRound: existingGame?.currentRound || 0,
    startedAt: existingGame?.startedAt || null,
    phaseEndsAt: existingGame?.phaseEndsAt || null,
    gameEndsAt: existingGame?.gameEndsAt || null,
    pausedAt: existingGame?.pausedAt || null,
    pauseLabel: existingGame?.pauseLabel || null,
    playerIds: existingGame?.playerIds || [],
    previousPairs: existingGame?.previousPairs || [],
    currentPairingIds: existingGame?.currentPairingIds || [],
    sittingOutIds: existingGame?.sittingOutIds || [],
    roundsCreated: existingGame?.roundsCreated || [],
    resetVersion: existingGame?.resetVersion || 0,
    createdAt: existingGame?.createdAt || now,
    updatedAt: now
  };

  event.meetMingleGameId = id;
  return db.games[id];
}


function nextDateForDay(dayOfWeek) {
  const now = new Date();
  const result = new Date(now);
  result.setHours(0, 0, 0, 0);
  const diff = (Number(dayOfWeek) - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + diff);
  return result;
}

function eventOccurrenceDate(event) {
  if (!event.recurringWeekly && event.date) {
    const d = new Date(`${event.date}T00:00:00`);
    return Number.isNaN(d.getTime()) ? nextDateForDay(event.dayOfWeek) : d;
  }
  return nextDateForDay(event.dayOfWeek);
}

function publicEvent(event) {
  const occurrence = eventOccurrenceDate(event);
  const heroTemplate = heroTemplateForEvent(event);
  const heroImageUrl = event.heroImageUrl || heroTemplate?.heroImageUrl || "";
  return {
    ...event,
    heroImageUrl,
    heroTemplateId: heroTemplate?.id || "",
    eventTypeLabel: event.customEventType || eventTypeLabels[event.eventType] || "Event",
    dayLabel: dayNames[occurrence.getDay()],
    dateLabel: occurrence.toISOString().slice(0, 10),
    sortKey: `${occurrence.toISOString().slice(0, 10)}T${event.startTime || "00:00"}`,
    responseCounts: eventResponseCounts(event.id),
    publicPath: `/events/${event.slug || event.id}`,
    qrPath: `/qr/event/${event.slug || event.id}`
  };
}


function eventResponseCounts(eventId) {
  const responses = (db.eventResponses || []).filter(response => response.eventId === eventId);
  return {
    interested: responses.filter(response => response.response === "interested").length,
    going: responses.filter(response => response.response === "going").length
  };
}

function publicEvents({ includeHidden = false } = {}) {
  return (db.events || [])
    .filter(event => includeHidden || !event.hidden)
    .map(publicEvent)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function seedDefaultEvents() {
  if ((db.events || []).length) return;
  db.events = [
    normalizeWeeklyEvent({
      title: "Workday Blackout Bingo",
      eventType: "bingo",
      venueName: "El Paso Denham Springs",
      venueLocation: "6865 Magnolia Beach Rd, Denham Springs, LA",
      dayOfWeek: 1,
      startTime: "12:00",
      endTime: "13:00",
      description: "Daytime digital bingo with prizes.",
      prizeSpecial: "Play for prizes. Food and drink purchase rules may vary by venue.",
      buttonText: "Play Bingo",
      buttonLink: "https://games.barfly.social/elpasobingo",
      featured: true
    }),
    normalizeWeeklyEvent({
      title: "Trivia, Bingo & Karaoke",
      eventType: "trivia",
      venueName: "Pelican to Mars",
      venueLocation: "Baton Rouge, LA",
      dayOfWeek: 3,
      startTime: "19:00",
      endTime: "22:00",
      description: "A weekly mix of trivia, bingo, and karaoke.",
      prizeSpecial: "Free to play. Play for prizes.",
      buttonText: "View Games",
      buttonLink: "https://games.barfly.social/pelicantomars",
      featured: true
    }),
    normalizeWeeklyEvent({
      title: "Karaoke Night",
      eventType: "karaoke",
      venueName: "Brickyard South",
      venueLocation: "Baton Rouge, LA",
      dayOfWeek: 4,
      startTime: "21:00",
      endTime: "01:00",
      description: "Hosted karaoke night with Barfly Entertainment.",
      prizeSpecial: "Submit songs early.",
      buttonText: "More Info",
      buttonLink: "/events",
      featured: false
    })
  ];
}


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


function isGameStarted(game) {
  return Boolean(game?.startedAt) || (game && game.status !== "lobby");
}

function isActiveOrUpcomingGame(game) {
  return game && !["complete"].includes(game.status);
}


function normalizeAgePreference(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(18, Math.min(99, Math.round(numeric)));
}

function normalizeContactKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/\s+/g, "");
}

function cleanDeviceId(value) {
  return String(value || "").trim().slice(0, 120);
}

function getDrinkSpecial(game) {
  const title = String(game?.drinkSpecialTitle || "").trim();
  const details = String(game?.drinkSpecialDetails || "").trim();
  const redeemWindow = String(game?.drinkSpecialWindow || "").trim();
  const restrictions = String(game?.drinkSpecialRestrictions || "").trim();

  return {
    hasSpecial: Boolean(title || details),
    title: title || "BARFLYDATE Player Special",
    details,
    redeemWindow,
    restrictions,
    publicText: title || details ? [title, details].filter(Boolean).join(" — ") : "",
    redeemText: [title, details, redeemWindow, restrictions].filter(Boolean).join(" • ")
  };
}

function getDefaultCapacityForMode(mode) {
  if (mode === "quick_30") return 20;
  if (mode === "social_60") return 40;
  return 60;
}

function normalizeCapacity(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(2, Math.min(250, Math.round(numeric)));
}

function getCapacity(game) {
  const mode = getGameMode(game);
  const defaultCapacity = getDefaultCapacityForMode(mode);
  const maxRsvps = normalizeCapacity(game?.maxRsvps, defaultCapacity);
  const maxCheckins = normalizeCapacity(game?.maxCheckins, defaultCapacity);
  return { maxRsvps, maxCheckins };
}

function getCapacityStatus(game) {
  const capacity = getCapacity(game);
  const rsvpCount = rsvpsForGame(game.id).length;
  const checkedInCount = rsvpsForGame(game.id).filter(rsvp => rsvp.checkedInAt).length;
  const rsvpPercent = capacity.maxRsvps ? rsvpCount / capacity.maxRsvps : 0;
  const checkinPercent = capacity.maxCheckins ? checkedInCount / capacity.maxCheckins : 0;

  return {
    ...capacity,
    rsvpCount,
    checkedInCount,
    rsvpRemaining: Math.max(0, capacity.maxRsvps - rsvpCount),
    checkinRemaining: Math.max(0, capacity.maxCheckins - checkedInCount),
    rsvpFull: rsvpCount >= capacity.maxRsvps,
    checkinFull: checkedInCount >= capacity.maxCheckins,
    rsvpAlmostFull: rsvpPercent >= 0.8 && rsvpCount < capacity.maxRsvps,
    checkinAlmostFull: checkinPercent >= 0.8 && checkedInCount < capacity.maxCheckins,
    rsvpLabel: rsvpCount >= capacity.maxRsvps ? "Full" : (rsvpPercent >= 0.8 ? "Almost Full" : "Open"),
    checkinLabel: checkedInCount >= capacity.maxCheckins ? "Full" : (checkinPercent >= 0.8 ? "Almost Full" : "Open")
  };
}

function publicCapacity(game) {
  return getCapacityStatus(game);
}

function normalizeMeetingPointMode(value) {
  const allowed = ["none", "single", "multiple"];
  return allowed.includes(value) ? value : "single";
}

function parseMeetingZones(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || "").trim()).filter(Boolean).slice(0, 24);
  }

  return String(value || "")
    .split(/\n|,/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function getMeetingZones(game) {
  const mode = normalizeMeetingPointMode(game?.meetingPointMode);
  const zones = parseMeetingZones(game?.meetingZones);

  if (mode === "none") return [];
  if (zones.length) return zones;
  if (mode === "single") return ["Host Stand"];
  return ["Ask Host"];
}

function getPairingZone(game, round, pairingIndex) {
  const mode = normalizeMeetingPointMode(game?.meetingPointMode);
  if (mode === "none") return "";

  const zones = getMeetingZones(game);
  if (!zones.length) return "Ask Host";
  if (mode === "single") return zones[0];

  return zones[(Number(round || 1) + Number(pairingIndex || 0) - 1) % zones.length];
}

function publicMeetingSetup(game) {
  return {
    mode: normalizeMeetingPointMode(game?.meetingPointMode),
    zones: getMeetingZones(game)
  };
}



function activeRsvpsForTonight() {
  const activeGameIds = new Set(Object.values(db.games)
    .filter(isActiveOrUpcomingGame)
    .map(game => game.id));

  return (db.rsvps || []).filter(rsvp =>
    rsvp.status !== "cancelled" &&
    activeGameIds.has(rsvp.gameId)
  );
}

function findActiveRsvpByIdentity({ deviceId, contactHandle }, excludeRsvpId = null) {
  const cleanedDeviceId = cleanDeviceId(deviceId);
  const contactKey = normalizeContactKey(contactHandle);

  if (!cleanedDeviceId && !contactKey) return null;

  return activeRsvpsForTonight().find(rsvp => {
    if (excludeRsvpId && rsvp.id === excludeRsvpId) return false;
    const sameDevice = cleanedDeviceId && rsvp.deviceId && rsvp.deviceId === cleanedDeviceId;
    const sameContact = contactKey && rsvp.contactKey && rsvp.contactKey === contactKey;
    return sameDevice || sameContact;
  }) || null;
}

function canMoveRsvpToGame(rsvp, newGame) {
  const originalGame = db.games[rsvp.gameId];
  if (!rsvp || !originalGame || !newGame) return { ok: false, error: "RSVP or session not found." };

  updateGameClock(originalGame);
  updateGameClock(newGame);

  if (rsvp.checkedInAt) return { ok: false, error: "You already checked in. Please see the host." };
  if (isGameStarted(originalGame)) return { ok: false, error: "Your original session has already started. Your RSVP is locked for this event." };
  if (isGameStarted(newGame)) return { ok: false, error: "That session has already started. Please choose a future session." };

  if (rsvp.gameId !== newGame.id && getCapacityStatus(newGame).rsvpFull) {
    return { ok: false, error: "That session is full. Please choose another session." };
  }

  return { ok: true };
}

function updateRsvpProfileFromBody(rsvp, body = {}) {
  const requestedAlias = cleanName(body.nickname || rsvp.nickname);
  if (requestedAlias && requestedAlias.toLowerCase() !== cleanName(rsvp.nickname).toLowerCase()) {
    if (aliasTakenAcrossActiveSessions(requestedAlias, rsvp.id)) {
      return { ok: false, error: "That alias is already reserved for an active or upcoming session tonight. Please choose a different alias." };
    }
    rsvp.nickname = requestedAlias;
  }

  rsvp.persona = body.persona || rsvp.persona || "Private spark, sharp instincts";
  rsvp.realName = body.realName ?? rsvp.realName ?? "";
  rsvp.contactHandle = body.contactHandle ?? rsvp.contactHandle ?? "";
  rsvp.contactKey = normalizeContactKey(rsvp.contactHandle);
  rsvp.gender = body.gender || rsvp.gender || "custom";
  rsvp.interestedIn = body.interestedIn || rsvp.interestedIn || "everyone";
  rsvp.lookingFor = normalizeLookingFor(body.lookingFor || rsvp.lookingFor);
  rsvp.preferredMinAge = normalizeAgePreference(body.preferredMinAge ?? rsvp.preferredMinAge, 25);
  rsvp.preferredMaxAge = normalizeAgePreference(body.preferredMaxAge ?? rsvp.preferredMaxAge, 45);
  rsvp.interests = Array.isArray(body.interests) ? body.interests : (rsvp.interests || []);
  rsvp.customQ1 = body.customQ1 || rsvp.customQ1 || "What is one green flag you notice quickly?";
  rsvp.customQ2 = body.customQ2 || rsvp.customQ2 || "What makes a conversation feel easy?";
  rsvp.deviceId = cleanDeviceId(body.deviceId || rsvp.deviceId);
  rsvp.updatedAt = new Date().toISOString();

  return { ok: true };
}


function normalizeLookingFor(value) {
  if (value === "date") return "casual_dating";
  if (value === "friend") return "friends_only";
  if (value === "social") return "activity_partners";
  return lookingForOptions.some(option => option.value === value) ? value : "activity_partners";
}

function privacyDisplay(count) {
  if (!count) return "0";
  if (count < 3) return "fewer than 3";
  return String(count);
}

function forecastLevel(count) {
  if (count <= 0) return "Building";
  if (count < 3) return "Building";
  if (count < 6) return "Average";
  if (count < 10) return "High";
  return "Very High";
}

function publicRsvp(rsvp) {
  const game = db.games[rsvp.gameId];
  return {
    id: rsvp.id,
    gameId: rsvp.gameId,
    venueName: game?.venueName || "Unknown Session",
    venueLocation: game?.venueLocation || "",
    gameCode: game?.status === "lobby" ? game.gameCode : null,
    gameMode: game?.gameMode || DEFAULT_GAME_MODE,
    modeLabel: game ? getGameFlow(game).label : "",
    eventType: game ? getEventType(game) : "mystery_match",
    eventTypeInfo: game ? getEventTypeInfo(game) : EVENT_TYPES.mystery_match,
    sessionStatus: game?.status || "unknown",
    phaseLabel: game?.phaseLabel || "",
    nickname: rsvp.nickname,
    persona: rsvp.persona,
    lookingFor: rsvp.lookingFor,
    lookingForLabel: intentLabel(rsvp.lookingFor),
    preferredMinAge: rsvp.preferredMinAge ?? 25,
    preferredMaxAge: rsvp.preferredMaxAge ?? 45,
    gender: rsvp.gender,
    interestedIn: rsvp.interestedIn,
    interests: rsvp.interests || [],
    status: rsvp.status || "rsvp_open",
    checkedIn: Boolean(rsvp.checkedInAt),
    checkedInAt: rsvp.checkedInAt || null,
    drinkSpecial: getDrinkSpecial(game),
    capacity: publicCapacity(game),
    meetingSetup: publicMeetingSetup(game),
    capacity: game ? publicCapacity(game) : null,
    playerId: rsvp.playerId || null,
    locked: isGameStarted(game),
    createdAt: rsvp.createdAt,
    updatedAt: rsvp.updatedAt || rsvp.createdAt
  };
}

function rsvpsForGame(gameId) {
  return (db.rsvps || []).filter(rsvp => rsvp.gameId === gameId && !["cancelled", "no_show"].includes(rsvp.status));
}

function countRsvpsForGame(game) {
  const counts = {
    friends_only: 0,
    activity_partners: 0,
    casual_dating: 0,
    serious_dating: 0,
    marriage: 0
  };

  rsvpsForGame(game.id).forEach(rsvp => {
    const key = normalizeLookingFor(rsvp.lookingFor);
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

function compatibleRsvpCount(game, intent) {
  const compatible = intentCompatibility[normalizeLookingFor(intent)] || [normalizeLookingFor(intent)];
  const counts = countRsvpsForGame(game);
  return compatible.reduce((sum, key) => sum + (counts[key] || 0), 0);
}

function buildForecastForGame(game) {
  const rsvpCounts = countRsvpsForGame(game);
  const checkedInCount = rsvpsForGame(game.id).filter(rsvp => rsvp.checkedInAt).length;
  const linkedEvent = game.linkedEventId ? (db.events || []).find(event => event.id === game.linkedEventId) : null;
  const linkedPublicEvent = linkedEvent ? publicEvent(linkedEvent) : null;

  const forecast = {};
  lookingForOptions.forEach(option => {
    const compatibleCount = compatibleRsvpCount(game, option.value);
    forecast[option.value] = {
      label: option.label,
      rsvpDisplay: privacyDisplay(rsvpCounts[option.value] || 0),
      compatibleDisplay: privacyDisplay(compatibleCount),
      level: forecastLevel(compatibleCount)
    };
  });

  return {
    id: game.id,
    venueName: game.venueName,
    venueLocation: game.venueLocation || "",
    gameCode: game.status === "lobby" ? game.gameCode : null,
    linkedEventId: game.linkedEventId || "",
    linkedEventSlug: game.linkedEventSlug || linkedEvent?.slug || "",
    linkedEventTitle: game.linkedEventTitle || linkedEvent?.title || "",
    linkedEventDateLabel: linkedPublicEvent?.dateLabel || "",
    linkedEventDayLabel: linkedPublicEvent?.dayLabel || "",
    linkedEventStartTime: linkedEvent?.startTime || "",
    linkedEventEndTime: linkedEvent?.endTime || "",
    linkedEventPublicPath: linkedPublicEvent?.publicPath || "",
    gameMode: getGameMode(game),
    modeLabel: getGameFlow(game).label,
    eventType: getEventType(game),
    eventTypeInfo: getEventTypeInfo(game),
    status: game.status,
    phaseLabel: game.phaseLabel,
    locked: isGameStarted(game),
    rsvpCount: rsvpsForGame(game.id).length,
    checkedInCount,
    playerCount: getGamePlayers(game).length,
    drinkSpecial: getDrinkSpecial(game),
    appOrder: appOrderForGameMode(getGameMode(game)),
    capacity: publicCapacity(game),
    forecast
  };
}

function aliasTakenAcrossActiveSessions(alias, excludeRsvpId = null) {
  const cleaned = cleanName(alias).toLowerCase();
  if (!cleaned) return false;

  const activeGameIds = new Set(Object.values(db.games)
    .filter(isActiveOrUpcomingGame)
    .map(game => game.id));

  const rsvpTaken = (db.rsvps || []).some(rsvp =>
    rsvp.id !== excludeRsvpId &&
    rsvp.status !== "cancelled" &&
    activeGameIds.has(rsvp.gameId) &&
    cleanName(rsvp.nickname).toLowerCase() === cleaned
  );

  const playerTaken = Object.values(db.players).some(player =>
    activeGameIds.has(player.gameId) &&
    !player.removedAt &&
    cleanName(player.nickname).toLowerCase() === cleaned
  );

  return rsvpTaken || playerTaken;
}

function chooseGlobalAlias(game, requestedAlias) {
  let candidate = cleanName(requestedAlias);
  if (candidate && !aliasTakenAcrossActiveSessions(candidate)) return candidate;

  for (const alias of aliasNames) {
    if (!aliasTakenAcrossActiveSessions(alias)) return alias;
  }

  let counter = 2;
  const base = candidate || "Mystery Guest";
  while (aliasTakenAcrossActiveSessions(`${base} ${counter}`)) counter += 1;
  return `${base} ${counter}`;
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
    eventType: getEventType(game),
    eventTypeInfo: getEventTypeInfo(game),
    noShowCount: (db.rsvps || []).filter(r => r.gameId === game.id && r.status === "no_show").length,
    votingRound: getGameFlow(game).totalRounds + 1,
    totalGameSeconds: getGameTimeline(game).totalSeconds,
    voteCategories,
    drinkSpecial: getDrinkSpecial(game),
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
  const pairingContext = {
    reports: db.reports.filter(report => report.gameId === game.id),
    decisions: db.decisions.filter(decision => decision.gameId === game.id)
  };
  const { groups, sittingOut } = createPairings(players, previousKeys, pairingContext);

  const pairings = groups.map((group, pairingIndex) => {
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
      meetingZone: getPairingZone(game, round, pairingIndex),
      meetingInstruction: getPairingZone(game, round, pairingIndex) ? `Meet at ${getPairingZone(game, round, pairingIndex)}` : "Ask host where to meet",
      score: group.score,
      matchReason: group.score >= 95 ? "Strong compatibility route" : group.score >= 65 ? "Good compatibility route" : "Best available route",
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
    if (phase.round && phase.round < getGameFlow(game).totalRounds) {
      ensureRoundPairings(game, phase.round + 1);
    }
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

function getNextPairingForPlayer(game, playerId) {
  const nextRound = (game.currentRound || 0) + 1;
  if (!nextRound || nextRound > getGameFlow(game).totalRounds) return null;
  return Object.values(db.pairings).find(p =>
    p.gameId === game.id &&
    p.round === nextRound &&
    (p.playerIds || []).includes(playerId)
  ) || null;
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




app.post("/api/bookings", (req, res) => {
  const booking = normalizeBookingRequest(req.body || {});

  if (!booking.name) return res.status(400).json({ error: "Name is required." });
  if (!booking.requestedDate) return res.status(400).json({ error: "Date is required." });
  if (!booking.requestedTime) return res.status(400).json({ error: "Time is required." });
  if (!booking.duration) return res.status(400).json({ error: "Duration is required." });
  if (!booking.contactPhone && !booking.contactEmail) {
    return res.status(400).json({ error: "Contact phone or contact email is required." });
  }

  db.bookingRequests = [booking, ...(db.bookingRequests || [])];
  trackAnalytics("booking_request", null, { eventScope: booking.eventScope, requestedDate: booking.requestedDate });
  res.json({ success: true, booking: publicBookingRequest(booking) });
});

app.get("/api/host/bookings", requireHost, (req, res) => {
  const bookings = (db.bookingRequests || [])
    .map(publicBookingRequest)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ bookings });
});

app.post("/api/host/bookings/:bookingId/status", requireHost, (req, res) => {
  const booking = (db.bookingRequests || []).find(item => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ error: "Booking request not found." });

  const status = ["new", "contacted", "booked", "declined"].includes(req.body?.status) ? req.body.status : "contacted";
  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  res.json({ success: true, booking: publicBookingRequest(booking) });
});

app.post("/api/host/bookings/:bookingId/payment", requireHost, (req, res) => {
  const booking = (db.bookingRequests || []).find(item => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ error: "Booking request not found." });

  booking.estimatedPrice = String(req.body?.estimatedPrice ?? booking.estimatedPrice ?? "").trim();
  booking.depositRequired = String(req.body?.depositRequired ?? booking.depositRequired ?? "").trim();
  booking.depositPaid = String(req.body?.depositPaid ?? booking.depositPaid ?? "").trim();
  booking.balanceDue = String(req.body?.balanceDue ?? booking.balanceDue ?? "").trim();
  booking.paymentLink = String(req.body?.paymentLink ?? booking.paymentLink ?? "").trim();
  booking.invoiceStatus = String(req.body?.invoiceStatus ?? booking.invoiceStatus ?? "not_sent");
  booking.paymentNotes = String(req.body?.paymentNotes ?? booking.paymentNotes ?? "").trim();
  booking.updatedAt = new Date().toISOString();

  res.json({ success: true, booking: publicBookingRequest(booking) });
});

app.delete("/api/host/bookings/:bookingId", requireHost, (req, res) => {
  const before = (db.bookingRequests || []).length;
  db.bookingRequests = (db.bookingRequests || []).filter(item => item.id !== req.params.bookingId);
  res.json({ success: true, deleted: before - db.bookingRequests.length });
});



app.post("/api/analytics", (req, res) => {
  const type = String(req.body?.type || "unknown");
  const slug = String(req.body?.slug || "");
  let eventId = req.body?.eventId || null;

  if (!eventId && slug) {
    const event = (db.events || []).find(item => item.slug === slug || item.id === slug);
    eventId = event?.id || null;
  }

  const metadata = {
    path: String(req.body?.path || ""),
    label: String(req.body?.label || ""),
    link: String(req.body?.link || ""),
    kind: String(req.body?.kind || ""),
    deviceId: String(req.body?.deviceId || "").slice(0, 120)
  };

  const entry = trackAnalytics(type, eventId, metadata);
  res.json({ success: true, entry });
});

app.get("/api/host/analytics", requireHost, (req, res) => {
  res.json(publicAnalyticsSummary());
});

app.post("/api/host/analytics/reset", requireHost, (req, res) => {
  const clearedCount = (db.analytics || []).length;
  db.analytics = [];
  res.json({ success: true, clearedCount, analytics: publicAnalyticsSummary() });
});

app.get("/api/host/bookings/export", requireHost, (req, res) => {
  const rows = [
    ["Name","Type","Date","Time","Duration","Phone","Email","Budget Range","Status","Estimated Price","Deposit Required","Deposit Paid","Balance Due","Invoice Status","Payment Link","Payment Notes","Notes","Created At"],
    ...(db.bookingRequests || []).map(b => [
      b.name,
      b.eventScope,
      b.requestedDate,
      b.requestedTime,
      b.duration,
      b.contactPhone,
      b.contactEmail,
      b.budgetRange || "",
      b.status,
      b.estimatedPrice || "",
      b.depositRequired || "",
      b.depositPaid || "",
      b.balanceDue || "",
      b.invoiceStatus || "not_sent",
      b.paymentLink || "",
      b.paymentNotes || "",
      b.notes,
      b.createdAt
    ])
  ];
  const csv = rows.map(row => row.map(csvEscape).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=barfly-booking-requests.csv");
  res.send(csv);
});

app.get("/api/host/backup", requireHost, (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=barfly-social-backup.json");
  res.send(JSON.stringify(db, null, 2));
});


app.get("/api/settings", (req, res) => {
  res.json({ settings: publicSettings() });
});

app.get("/api/host/settings", requireHost, (req, res) => {
  res.json({ settings: publicSettings() });
});

app.post("/api/host/settings", requireHost, (req, res) => {
  db.settings = normalizeSettings(req.body || {});
  res.json({ success: true, settings: publicSettings() });
});


app.get("/api/events", (req, res) => {
  res.json({ events: publicEvents({ includeHidden: false }), eventTypeLabels, dayNames });
});


app.get("/api/events/:slug", (req, res) => {
  const slug = String(req.params.slug || "");
  const event = (db.events || []).find(item => !item.hidden && (item.slug === slug || item.id === slug));
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ event: publicEvent(event) });
});

app.post("/api/events/:slug/respond", (req, res) => {
  const slug = String(req.params.slug || "");
  const event = (db.events || []).find(item => !item.hidden && (item.slug === slug || item.id === slug));
  if (!event) return res.status(404).json({ error: "Event not found" });

  const response = ["interested", "going"].includes(req.body?.response) ? req.body.response : "interested";
  const deviceId = String(req.body?.deviceId || "anonymous").slice(0, 120);
  db.eventResponses = (db.eventResponses || []).filter(item => !(item.eventId === event.id && item.deviceId === deviceId));
  db.eventResponses.push({
    id: nanoid(),
    eventId: event.id,
    deviceId,
    response,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, event: publicEvent(event), response });
});



app.get("/api/host/venues", requireHost, (req, res) => {
  res.json({ venues: (db.venues || []).map(publicVenue).sort((a, b) => a.name.localeCompare(b.name)) });
});

app.post("/api/host/venues", requireHost, (req, res) => {
  const venue = normalizeVenue(req.body || {});
  if (!venue.name) return res.status(400).json({ error: "Venue name is required." });
  db.venues = [...(db.venues || []), venue];
  res.json({ success: true, venue: publicVenue(venue), venues: (db.venues || []).map(publicVenue) });
});

app.post("/api/host/venues/:venueId", requireHost, (req, res) => {
  const existing = (db.venues || []).find(venue => venue.id === req.params.venueId);
  if (!existing) return res.status(404).json({ error: "Venue not found." });
  const updated = normalizeVenue(req.body || {}, existing);
  db.venues = (db.venues || []).map(venue => venue.id === existing.id ? updated : venue);
  res.json({ success: true, venue: publicVenue(updated), venues: (db.venues || []).map(publicVenue) });
});

app.delete("/api/host/venues/:venueId", requireHost, (req, res) => {
  const before = (db.venues || []).length;
  db.venues = (db.venues || []).filter(venue => venue.id !== req.params.venueId);
  res.json({ success: true, deleted: before - db.venues.length, venues: (db.venues || []).map(publicVenue) });
});

app.get("/api/host/event-templates", requireHost, (req, res) => {
  seedDefaultTemplates();
  res.json({ templates: (db.eventTemplates || []).map(publicEventTemplate).sort((a, b) => a.name.localeCompare(b.name)) });
});

app.post("/api/host/event-templates", requireHost, (req, res) => {
  const template = normalizeEventTemplate(req.body || {});
  db.eventTemplates = [...(db.eventTemplates || []), template];
  res.json({ success: true, template: publicEventTemplate(template), templates: (db.eventTemplates || []).map(publicEventTemplate) });
});

app.post("/api/host/event-templates/:templateId", requireHost, (req, res) => {
  const existing = (db.eventTemplates || []).find(template => template.id === req.params.templateId);
  if (!existing) return res.status(404).json({ error: "Template not found." });
  const updated = normalizeEventTemplate(req.body || {}, existing);
  db.eventTemplates = (db.eventTemplates || []).map(template => template.id === existing.id ? updated : template);
  res.json({ success: true, template: publicEventTemplate(updated), templates: (db.eventTemplates || []).map(publicEventTemplate) });
});

app.delete("/api/host/event-templates/:templateId", requireHost, (req, res) => {
  const before = (db.eventTemplates || []).length;
  db.eventTemplates = (db.eventTemplates || []).filter(template => template.id !== req.params.templateId);
  res.json({ success: true, deleted: before - db.eventTemplates.length, templates: (db.eventTemplates || []).map(publicEventTemplate) });
});


app.get("/api/host/hero-templates", requireHost, (req, res) => {
  res.json({ heroTemplates: (db.heroTemplates || []).map(publicHeroTemplate).sort((a, b) => `${a.venueName} ${a.heroVariant}`.localeCompare(`${b.venueName} ${b.heroVariant}`)) });
});

app.post("/api/host/hero-templates", requireHost, (req, res) => {
  const template = normalizeHeroTemplate(req.body || {});
  if (!template.venueName) return res.status(400).json({ error: "Venue name is required." });
  if (!template.heroVariant) return res.status(400).json({ error: "Hero variant is required." });
  db.heroTemplates = [...(db.heroTemplates || []), template];
  res.json({ success: true, heroTemplate: publicHeroTemplate(template), heroTemplates: (db.heroTemplates || []).map(publicHeroTemplate) });
});

app.post("/api/host/hero-templates/:templateId", requireHost, (req, res) => {
  const existing = (db.heroTemplates || []).find(template => template.id === req.params.templateId);
  if (!existing) return res.status(404).json({ error: "Hero template not found." });
  const updated = normalizeHeroTemplate(req.body || {}, existing);
  db.heroTemplates = (db.heroTemplates || []).map(template => template.id === existing.id ? updated : template);
  res.json({ success: true, heroTemplate: publicHeroTemplate(updated), heroTemplates: (db.heroTemplates || []).map(publicHeroTemplate) });
});

app.delete("/api/host/hero-templates/:templateId", requireHost, (req, res) => {
  const before = (db.heroTemplates || []).length;
  db.heroTemplates = (db.heroTemplates || []).filter(template => template.id !== req.params.templateId);
  res.json({ success: true, deleted: before - db.heroTemplates.length, heroTemplates: (db.heroTemplates || []).map(publicHeroTemplate) });
});


app.get("/api/host/events", requireHost, (req, res) => {
  res.json({ events: publicEvents({ includeHidden: true }), eventTypeLabels, dayNames });
});

app.post("/api/host/events", requireHost, (req, res) => {
  const event = normalizeWeeklyEvent(req.body);
  const meetMingleSession = syncMeetMingleSessionForEvent(event);
  db.events = [...(db.events || []), event];
  res.json({ success: true, event: publicEvent(event), meetMingleSession: publicGame(meetMingleSession), events: publicEvents({ includeHidden: true }) });
});

app.post("/api/host/events/:eventId", requireHost, (req, res) => {
  const existing = (db.events || []).find(event => event.id === req.params.eventId);
  if (!existing) return res.status(404).json({ error: "Event not found" });

  const updated = normalizeWeeklyEvent(req.body, existing);
  const meetMingleSession = syncMeetMingleSessionForEvent(updated);
  db.events = (db.events || []).map(event => event.id === existing.id ? updated : event);
  res.json({ success: true, event: publicEvent(updated), meetMingleSession: publicGame(meetMingleSession), events: publicEvents({ includeHidden: true }) });
});

app.post("/api/host/events/:eventId/duplicate", requireHost, (req, res) => {
  const existing = (db.events || []).find(event => event.id === req.params.eventId);
  if (!existing) return res.status(404).json({ error: "Event not found" });

  const copy = normalizeWeeklyEvent({
    ...existing,
    title: `${existing.title} Copy`,
    hidden: false,
    featured: false
  });
  copy.id = nanoid();
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();

  db.events = [...(db.events || []), copy];
  res.json({ success: true, event: publicEvent(copy), events: publicEvents({ includeHidden: true }) });
});


app.post("/api/host/events/:eventId/duplicate-next-week", requireHost, (req, res) => {
  const existing = (db.events || []).find(event => event.id === req.params.eventId);
  if (!existing) return res.status(404).json({ error: "Event not found" });

  const baseDate = publicEvent(existing).dateLabel;
  const copy = normalizeWeeklyEvent({
    ...existing,
    title: existing.title,
    date: datePlusDays(baseDate, 7),
    recurringWeekly: false,
    hidden: false,
    featured: false
  });
  copy.id = nanoid();
  copy.slug = uniqueEventSlug(`${existing.slug || existing.title}-next-week`);
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();

  db.events = [...(db.events || []), copy];
  res.json({ success: true, event: publicEvent(copy), events: publicEvents({ includeHidden: true }) });
});


app.delete("/api/host/events/:eventId", requireHost, (req, res) => {
  const before = (db.events || []).length;
  db.events = (db.events || []).filter(event => event.id !== req.params.eventId);
  res.json({ success: true, deleted: before - db.events.length, events: publicEvents({ includeHidden: true }) });
});


app.get("/api/health", (req, res) => res.json({
  ok: true,
  version: "v76",
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
    .filter(game => isActiveOrUpcomingGame(game))
    .map(game => {
      const forecast = buildForecastForGame(game);
      const checkedInCounts = countLookingFor(game);
      return {
        id: game.id,
        venueName: game.venueName,
        gameCode: game.status === "lobby" ? game.gameCode : null,
      venueLocation: game.venueLocation || "",
        status: game.status,
        phaseLabel: game.phaseLabel,
        modeLabel: getGameFlow(game).label,
        playerCount: getGamePlayers(game).length,
        rsvpCount: rsvpsForGame(game.id).length,
        checkedInCount: rsvpsForGame(game.id).filter(rsvp => rsvp.checkedInAt).length,
    capacity: publicCapacity(game),
        counts: Object.fromEntries(lookingForOptions.map(option => [option.value, {
          count: checkedInCounts[option.value] || 0,
          display: privacyDisplay(checkedInCounts[option.value] || 0)
        }])),
        forecast: forecast.forecast,
        drinkSpecial: getDrinkSpecial(game),
        capacity: publicCapacity(game),
        meetingSetup: publicMeetingSetup(game)
      }
    });

  res.json({ sessions });
});


app.get("/api/forecast", (req, res) => {
  const sessions = Object.values(db.games)
    .filter(game => isActiveOrUpcomingGame(game))
    .map(buildForecastForGame)
    .sort((a, b) => a.venueName.localeCompare(b.venueName));
  res.json({ sessions, lookingForOptions });
});

app.post("/api/rsvps", (req, res) => {
  const game = db.games[req.body.gameId];
  if (!game) return res.status(404).json({ error: "Session not found" });
  updateGameClock(game);

  if (isGameStarted(game)) {
    return res.status(400).json({ error: "That session has already started. Please choose a future session." });
  }

  if (getCapacityStatus(game).rsvpFull) {
    return res.status(400).json({ error: "This session is full. Please choose another session." });
  }

  const deviceId = cleanDeviceId(req.body.deviceId);
  const contactKey = normalizeContactKey(req.body.contactHandle);
  const existingIdentityRsvp = findActiveRsvpByIdentity({ deviceId, contactHandle: req.body.contactHandle });

  if (existingIdentityRsvp) {
    const moveCheck = canMoveRsvpToGame(existingIdentityRsvp, game);
    if (!moveCheck.ok) {
      return res.status(409).json({
        code: "ACTIVE_RSVP_LOCKED",
        error: moveCheck.error,
        existingRsvp: publicRsvp(existingIdentityRsvp)
      });
    }

    const updateCheck = updateRsvpProfileFromBody(existingIdentityRsvp, req.body);
    if (!updateCheck.ok) {
      return res.status(400).json({ error: updateCheck.error, existingRsvp: publicRsvp(existingIdentityRsvp) });
    }

    existingIdentityRsvp.gameId = game.id;
    existingIdentityRsvp.status = "rsvp_open";
    existingIdentityRsvp.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      moved: true,
      message: "Your existing RSVP was moved to this session.",
      rsvp: publicRsvp(existingIdentityRsvp),
      forecast: buildForecastForGame(game)
    });
  }

  const requestedAlias = cleanName(req.body.nickname || "");
  if (!requestedAlias) return res.status(400).json({ error: "Alias is required for RSVP." });

  if (aliasTakenAcrossActiveSessions(requestedAlias)) {
    return res.status(400).json({ error: "That alias is already reserved for an active or upcoming session tonight. Please choose a different alias." });
  }

  const rsvp = {
    id: nanoid(),
    gameId: game.id,
    deviceId,
    contactKey,
    nickname: requestedAlias,
    persona: req.body.persona || "Private spark, sharp instincts",
    realName: req.body.realName || "",
    contactHandle: req.body.contactHandle || "",
    gender: req.body.gender || "custom",
    interestedIn: req.body.interestedIn || "everyone",
    lookingFor: normalizeLookingFor(req.body.lookingFor),
    preferredMinAge: normalizeAgePreference(req.body.preferredMinAge, 25),
    preferredMaxAge: normalizeAgePreference(req.body.preferredMaxAge, 45),
    interests: Array.isArray(req.body.interests) ? req.body.interests : [],
    customQ1: req.body.customQ1 || "What is one green flag you notice quickly?",
    customQ2: req.body.customQ2 || "What makes a conversation feel easy?",
    status: "rsvp_open",
    checkedInAt: null,
    playerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.rsvps.push(rsvp);
  res.json({ success: true, rsvp: publicRsvp(rsvp), forecast: buildForecastForGame(game) });
});

app.get("/api/rsvps/:rsvpId", (req, res) => {
  const rsvp = (db.rsvps || []).find(item => item.id === req.params.rsvpId);
  if (!rsvp) return res.status(404).json({ error: "RSVP not found" });
  res.json({ rsvp: publicRsvp(rsvp) });
});

app.post("/api/rsvps/:rsvpId/change-session", (req, res) => {
  const rsvp = (db.rsvps || []).find(item => item.id === req.params.rsvpId);
  if (!rsvp) return res.status(404).json({ error: "RSVP not found" });

  const newGame = db.games[req.body.gameId];
  if (!newGame) return res.status(404).json({ error: "New session not found" });

  const moveCheck = canMoveRsvpToGame(rsvp, newGame);
  if (!moveCheck.ok) return res.status(400).json({ error: moveCheck.error, rsvp: publicRsvp(rsvp) });

  const updateCheck = updateRsvpProfileFromBody(rsvp, req.body);
  if (!updateCheck.ok) return res.status(400).json({ error: updateCheck.error, rsvp: publicRsvp(rsvp) });

  rsvp.gameId = newGame.id;
  rsvp.status = "rsvp_open";
  rsvp.updatedAt = new Date().toISOString();

  res.json({ success: true, moved: true, rsvp: publicRsvp(rsvp), forecast: buildForecastForGame(newGame) });
});

app.post("/api/rsvps/:rsvpId/cancel", (req, res) => {
  const rsvp = (db.rsvps || []).find(item => item.id === req.params.rsvpId);
  if (!rsvp) return res.status(404).json({ error: "RSVP not found" });

  const game = db.games[rsvp.gameId];
  updateGameClock(game);

  if (isGameStarted(game)) {
    return res.status(400).json({ error: "This session has already started. Your RSVP is locked for this event." });
  }

  if (rsvp.checkedInAt) {
    return res.status(400).json({ error: "You already checked in. Please see the host." });
  }

  rsvp.status = "cancelled";
  rsvp.updatedAt = new Date().toISOString();
  res.json({ success: true, rsvp: publicRsvp(rsvp) });
});

app.post("/api/checkin", (req, res) => {
  const rsvp = (db.rsvps || []).find(item => item.id === req.body.rsvpId);
  if (!rsvp) return res.status(404).json({ error: "RSVP not found. Please RSVP first or ask the host." });

  const game = getGameByCode(req.body.gameCode);
  if (!game) return res.status(404).json({ error: "Game code not found." });
  updateGameClock(game);

  if (game.id !== rsvp.gameId) {
    return res.status(400).json({ error: "This code does not match your RSVP location/session." });
  }

  if (game.status !== "lobby") {
    return res.status(400).json({ error: "This session has already started. Please ask the host for the next game code." });
  }

  if (rsvp.playerId && db.players[rsvp.playerId]) {
    return res.json(db.players[rsvp.playerId]);
  }

  if (getCapacityStatus(game).checkinFull) {
    return res.status(400).json({ error: "This session is full for check-ins. Please ask the host for another session." });
  }

  const existingAlias = getGamePlayers(game).some(player => cleanName(player.nickname).toLowerCase() === cleanName(rsvp.nickname).toLowerCase());
  if (existingAlias) {
    return res.status(400).json({ error: "This alias is already checked in. Please see the host." });
  }

  const id = nanoid();
  const player = {
    id,
    gameId: game.id,
    joinedResetVersion: game.resetVersion || 0,
    eligibleRound: 1,
    nickname: rsvp.nickname,
    persona: rsvp.persona || "Private spark, sharp instincts",
    realName: rsvp.realName || "",
    contactHandle: rsvp.contactHandle || "",
    gender: rsvp.gender || "custom",
    interestedIn: rsvp.interestedIn || "everyone",
    lookingFor: normalizeLookingFor(rsvp.lookingFor),
    preferredMinAge: normalizeAgePreference(rsvp.preferredMinAge, 25),
    preferredMaxAge: normalizeAgePreference(rsvp.preferredMaxAge, 45),
    interests: rsvp.interests || [],
    customQ1: rsvp.customQ1 || "What is something that instantly makes you smile?",
    customQ2: rsvp.customQ2 || "What makes someone easy to talk to?",
    isActive: true,
    points: 0,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    rsvpId: rsvp.id
  };

  db.players[id] = player;
  game.playerIds.push(id);
  rsvp.status = "checked_in";
  rsvp.checkedInAt = new Date().toISOString();
  rsvp.playerId = id;
  rsvp.updatedAt = new Date().toISOString();

  res.json(player);
});


app.get("/api/game-modes", (req, res) => res.json(Object.values(GAME_MODES)));

app.get("/api/games", requireHost, (req, res) => {
  const games = Object.values(db.games).map(publicGame).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(games.map(g => ({
    id: g.id,
    gameCode: g.gameCode,
    venueName: g.venueName,
    eventType: g.eventType,
    eventTypeInfo: getEventTypeInfo(g),
      venueLocation: g.venueLocation || "",
    status: g.status,
    phaseLabel: g.phaseLabel,
    currentRound: g.currentRound,
    playerCount: g.players.length,
    rsvpCount: rsvpsForGame(g.id).length,
    checkedInCount: rsvpsForGame(g.id).filter(rsvp => rsvp.checkedInAt).length,
    safetyReportCount: db.reports.filter(r => r.gameId === g.id).length,
    openSafetyReportCount: db.reports.filter(r => r.gameId === g.id && r.status !== "reviewed").length,
    intentCounts: countLookingFor(g),
    drinkSpecial: getDrinkSpecial(g),
    capacity: publicCapacity(g),
    meetingSetup: publicMeetingSetup(g),
    createdAt: g.createdAt,
    resetVersion: g.resetVersion || 0
  })));
});



app.get("/api/demo-debug", requireHost, (req, res) => {
  res.json({
    ok: true,
    version: "v76",
    demoCategories: DEMO_CATEGORIES,
    games: Object.values(db.games).map(game => ({
      id: game.id,
      code: game.gameCode,
      venueName: game.venueName,
      status: game.status,
      players: game.playerIds.length
    }))
  });
});


app.post("/api/demo-game", requireHost, (req, res) => {
  const mode = GAME_MODES[req.body?.gameMode] ? req.body.gameMode : "quick_30";
  const id = nanoid();

  db.games[id] = {
    id,
    gameCode: makeCode(),
    venueName: req.body?.venueName || "BARFLYDATE Demo Game",
    venueLocation: req.body?.venueLocation || "Demo Venue",
    eventType: "mystery_match",
    meetingPointMode: "multiple",
    meetingZones: ["Host Stand", "Bar Area", "Patio", "Stage Side"],
    drinkSpecialTitle: "Demo Drink Special",
    drinkSpecialDetails: "$1 off featured mocktail/cocktail during play",
    drinkSpecialWindow: "During BARFLYDATE session only",
    drinkSpecialRestrictions: "Venue rules apply",
    gameMode: mode,
    maxRsvps: normalizeCapacity(req.body?.maxRsvps, getDefaultCapacityForMode(mode)),
    maxCheckins: normalizeCapacity(req.body?.maxCheckins, getDefaultCapacityForMode(mode)),
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

  const game = db.games[id];
  const createdPlayers = addDemoPlayersToGame(game, req.body?.count || 12);

  console.log(`Created demo game ${game.gameCode} with ${createdPlayers.length} demo players.`);

  res.json({
    ...publicGame(game),
    demoCreated: createdPlayers.length
  });
});

app.post("/api/games", requireHost, (req, res) => {
  const id = nanoid();
  db.games[id] = {
    id,
    gameCode: makeCode(),
    venueName: req.body.venueName || "BARFLY DATE",
    venueLocation: req.body.venueLocation || "",
    eventType: EVENT_TYPES[req.body.eventType] ? req.body.eventType : "mystery_match",
    meetingPointMode: normalizeMeetingPointMode(req.body.meetingPointMode),
    meetingZones: parseMeetingZones(req.body.meetingZones || "Host Stand"),
    drinkSpecialTitle: req.body.drinkSpecialTitle || "",
    drinkSpecialDetails: req.body.drinkSpecialDetails || "",
    drinkSpecialWindow: req.body.drinkSpecialWindow || "",
    drinkSpecialRestrictions: req.body.drinkSpecialRestrictions || "",
    gameMode: GAME_MODES[req.body.gameMode] ? req.body.gameMode : DEFAULT_GAME_MODE,
    maxRsvps: normalizeCapacity(req.body.maxRsvps, getDefaultCapacityForMode(GAME_MODES[req.body.gameMode] ? req.body.gameMode : DEFAULT_GAME_MODE)),
    maxCheckins: normalizeCapacity(req.body.maxCheckins, getDefaultCapacityForMode(GAME_MODES[req.body.gameMode] ? req.body.gameMode : DEFAULT_GAME_MODE)),
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



const DEMO_CATEGORIES = ["Hobbies","Travel","Food & Drink","Entertainment","Life Goals","Values","Adventure","Lifestyle","Quirks"];

function addDemoPlayersToGame(game, requestedCount = 12) {
  const count = Math.max(2, Math.min(Number(requestedCount || 12), 60));
  const demoFirstNames = ["Avery","Jordan","Riley","Morgan","Taylor","Casey","Skyler","Cameron","Quinn","Parker","Hayden","Reese","Rowan","Logan","Emerson","Drew","Sydney","Blake","Harper","Dakota","Kendall","Bailey","Finley","Mason"];
  const demoGenders = ["man", "woman", "custom"];
  const demoInterested = ["women", "men", "everyone"];
  const demoLooking = ["friends_only", "activity_partners", "casual_dating", "serious_dating", "marriage"];

  const created = [];

  for (let i = 0; i < count; i++) {
    const playerId = nanoid();
    const currentPlayerCount = game.playerIds.length;
    const offset = currentPlayerCount + i;

    const interests = [
      DEMO_CATEGORIES[(offset + 2) % DEMO_CATEGORIES.length],
      DEMO_CATEGORIES[(offset + 5) % DEMO_CATEGORIES.length],
      DEMO_CATEGORIES[(offset + 7) % DEMO_CATEGORIES.length]
    ];

    const player = {
      id: playerId,
      gameId: game.id,
      joinedResetVersion: game.resetVersion || 0,
      eligibleRound: game.status === "lobby" ? 1 : Math.max(1, game.currentRound || 1),
      nickname: generateUniqueAlias(game, aliasNames[offset % aliasNames.length]),
      persona: "Demo guest for testing the full event flow",
      realName: `${demoFirstNames[offset % demoFirstNames.length]} Demo`,
      contactHandle: `demo${offset + 1}@barflydate.test`,
      gender: demoGenders[offset % demoGenders.length],
      interestedIn: demoInterested[(offset + 1) % demoInterested.length],
      lookingFor: demoLooking[offset % demoLooking.length],
      interests,
      customQ1: "What is one green flag you notice quickly?",
      customQ2: "What makes a conversation feel easy?",
      isActive: true,
      points: 0,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isDemo: true
    };

    db.players[playerId] = player;
    game.playerIds.push(playerId);
    created.push(player);
  }

  // If a game had no players and was accidentally started, make it easy to test again.
  if (created.length && (game.currentPairingIds || []).length === 0 && game.status !== "lobby" && game.status !== "complete") {
    game.roundsCreated = [];
  }

  return created;
}


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

  const createdPlayers = addDemoPlayersToGame(game, req.body?.count || 12);

  console.log(`Added ${createdPlayers.length} demo players to game ${game.gameCode}.`);

  res.json({
    ...publicGame(game),
    demoCreated: createdPlayers.length
  });
});


app.get("/api/games/:gameId/business-report", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  const publicPlayers = getGamePlayers(game);
  const gameRsvps = (db.rsvps || []).filter(rsvp => rsvp.gameId === game.id);
  const activeRsvps = gameRsvps.filter(rsvp => !["cancelled", "no_show"].includes(rsvp.status));
  const checkedIn = gameRsvps.filter(rsvp => rsvp.checkedInAt);
  const noShows = gameRsvps.filter(rsvp => rsvp.status === "no_show");
  const cancelled = gameRsvps.filter(rsvp => rsvp.status === "cancelled");
  const gameReports = db.reports.filter(report => report.gameId === game.id);
  const gamePairings = Object.values(db.pairings).filter(pairing => pairing.gameId === game.id);
  const gameDecisions = db.decisions.filter(decision => decision.gameId === game.id);

  const mutualSparkPairs = new Set();
  gameDecisions.forEach(a => {
    if (!["yes", "maybe"].includes(a.decision)) return;
    const b = gameDecisions.find(d =>
      d.fromPlayerId === a.toPlayerId &&
      d.toPlayerId === a.fromPlayerId &&
      ["yes", "maybe"].includes(d.decision)
    );
    if (b) mutualSparkPairs.add([a.fromPlayerId, a.toPlayerId].sort().join("-"));
  });

  const intentBreakdown = {};
  lookingForOptions.forEach(option => {
    intentBreakdown[option.value] = {
      label: option.label,
      rsvps: gameRsvps.filter(rsvp => rsvp.lookingFor === option.value).length,
      checkedIn: checkedIn.filter(rsvp => rsvp.lookingFor === option.value).length
    };
  });

  res.json({
    exportedAt: new Date().toISOString(),
    game: {
      id: game.id,
      gameCode: game.gameCode,
      venueName: game.venueName,
      venueLocation: game.venueLocation || "",
      eventType: game.eventType,
      eventTypeInfo: getEventTypeInfo(game),
      gameMode: game.gameMode,
      modeLabel: getGameFlow(game).label,
      status: game.status,
      phaseLabel: game.phaseLabel,
      currentRound: game.currentRound,
      createdAt: game.createdAt,
      startedAt: game.startedAt,
      gameEndsAt: game.gameEndsAt,
      drinkSpecial: getDrinkSpecial(game),
      capacity: publicCapacity(game),
      meetingSetup: publicMeetingSetup(game)
    },
    summary: {
      totalRsvps: gameRsvps.length,
      activeRsvps: activeRsvps.length,
      checkedIn: checkedIn.length,
      noShows: noShows.length,
      cancelled: cancelled.length,
      players: publicPlayers.length,
      activePlayers: publicPlayers.filter(player => player.isActive && !player.removedAt).length,
      removedPlayers: publicPlayers.filter(player => player.removedAt).length,
      safetyReports: gameReports.length,
      openSafetyReports: gameReports.filter(report => report.status !== "reviewed").length,
      roundsCompleted: Math.max(0, game.currentRound || 0),
      pairingsCreated: gamePairings.length,
      mutualSparksCreated: mutualSparkPairs.size
    },
    intentBreakdown,
    reports: gameReports.map(publicReport)
  });
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
      meetingSetup: publicMeetingSetup(game),
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
      noShowCount: (db.rsvps || []).filter(r => r.gameId === game.id && r.status === "no_show").length,
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




app.get("/api/games/:gameId/rsvps", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  res.json({
    gameId: game.id,
    gameCode: game.gameCode,
    rsvpCount: rsvpsForGame(game.id).length,
    checkedInCount: rsvpsForGame(game.id).filter(rsvp => rsvp.checkedInAt).length,
    rsvps: rsvpsForGame(game.id).map(publicRsvp),
    forecast: buildForecastForGame(game)
  });
});



app.get("/api/host/rsvps", requireHost, (req, res) => {
  const query = String(req.query.query || "").trim().toLowerCase();
  const all = activeRsvpsForTonight()
    .map(publicRsvp)
    .filter(rsvp => {
      if (!query) return true;
      return [
        rsvp.nickname,
        rsvp.venueName,
        rsvp.venueLocation,
        rsvp.lookingForLabel,
        rsvp.status
      ].some(value => String(value || "").toLowerCase().includes(query));
    });

  res.json({ rsvps: all, count: all.length });
});

app.post("/api/host/rsvps/:rsvpId/change-session", requireHost, (req, res) => {
  const rsvp = (db.rsvps || []).find(item => item.id === req.params.rsvpId);
  if (!rsvp) return res.status(404).json({ error: "RSVP not found" });

  const newGame = db.games[req.body.gameId];
  if (!newGame) return res.status(404).json({ error: "New session not found" });

  const moveCheck = canMoveRsvpToGame(rsvp, newGame);
  if (!moveCheck.ok) return res.status(400).json({ error: moveCheck.error, rsvp: publicRsvp(rsvp) });

  rsvp.gameId = newGame.id;
  rsvp.status = "rsvp_open";
  rsvp.updatedAt = new Date().toISOString();

  res.json({ success: true, rsvp: publicRsvp(rsvp), forecast: buildForecastForGame(newGame) });
});

app.post("/api/host/rsvps/:rsvpId/cancel", requireHost, (req, res) => {
  const rsvp = (db.rsvps || []).find(item => item.id === req.params.rsvpId);
  if (!rsvp) return res.status(404).json({ error: "RSVP not found" });

  const game = db.games[rsvp.gameId];
  updateGameClock(game);

  if (rsvp.checkedInAt) return res.status(400).json({ error: "This RSVP is already checked in. Remove the player from the game instead." });

  rsvp.status = "cancelled";
  rsvp.updatedAt = new Date().toISOString();
  res.json({ success: true, rsvp: publicRsvp(rsvp) });
});

app.post("/api/games/:gameId/test-rsvps", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  if (isGameStarted(game)) return res.status(400).json({ error: "Generate test RSVPs before the session starts." });

  const requested = Math.max(1, Math.min(Number(req.body?.count || 10), 100));
  const created = [];
  const demoFirstNames = ["Avery","Jordan","Riley","Morgan","Taylor","Casey","Skyler","Cameron","Quinn","Parker","Hayden","Reese","Rowan","Logan","Emerson","Drew","Sydney","Blake","Harper","Dakota"];
  const demoGenders = ["man", "woman", "custom"];
  const demoInterested = ["women", "men", "everyone"];
  const demoLooking = ["friends_only", "activity_partners", "casual_dating", "serious_dating", "marriage"];

  for (let i = 0; i < requested; i++) {
    if (getCapacityStatus(game).rsvpFull) break;

    const index = rsvpsForGame(game.id).length + i;
    const nickname = chooseGlobalAlias(game, aliasNames[index % aliasNames.length]);
    const rsvp = {
      id: nanoid(),
      gameId: game.id,
      deviceId: `test_device_${game.id}_${Date.now()}_${i}`,
      contactKey: `test${Date.now()}_${i}@barflydate.test`,
      nickname,
      persona: "Test RSVP for host forecasting",
      realName: `${demoFirstNames[index % demoFirstNames.length]} Test`,
      contactHandle: `test${Date.now()}_${i}@barflydate.test`,
      gender: demoGenders[index % demoGenders.length],
      interestedIn: demoInterested[(index + 1) % demoInterested.length],
      lookingFor: demoLooking[index % demoLooking.length],
      preferredMinAge: 25,
      preferredMaxAge: 45,
      interests: [
        DEMO_CATEGORIES[(index + 2) % DEMO_CATEGORIES.length],
        DEMO_CATEGORIES[(index + 5) % DEMO_CATEGORIES.length]
      ],
      customQ1: "What is one green flag you notice quickly?",
      customQ2: "What makes a conversation feel easy?",
      status: "rsvp_open",
      checkedInAt: null,
      playerId: null,
      isTest: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.rsvps.push(rsvp);
    created.push(rsvp);
  }

  res.json({ success: true, created: created.length, rsvps: rsvpsForGame(game.id).map(publicRsvp), forecast: buildForecastForGame(game) });
});

app.post("/api/games/:gameId/test-checkins", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  updateGameClock(game);

  if (game.status !== "lobby") return res.status(400).json({ error: "Generate test check-ins before the game starts." });

  const requested = Math.max(1, Math.min(Number(req.body?.count || 10), 100));
  const openRsvps = rsvpsForGame(game.id).filter(rsvp => !rsvp.checkedInAt && rsvp.status !== "cancelled");
  const checkedIn = [];

  for (const rsvp of openRsvps.slice(0, requested)) {
    if (getCapacityStatus(game).checkinFull) break;
    if (rsvp.playerId && db.players[rsvp.playerId]) continue;

    const id = nanoid();
    const player = {
      id,
      gameId: game.id,
      joinedResetVersion: game.resetVersion || 0,
      eligibleRound: 1,
      nickname: rsvp.nickname,
      persona: rsvp.persona || "Test player",
      realName: rsvp.realName || "",
      contactHandle: rsvp.contactHandle || "",
      gender: rsvp.gender || "custom",
      interestedIn: rsvp.interestedIn || "everyone",
      lookingFor: normalizeLookingFor(rsvp.lookingFor),
      preferredMinAge: normalizeAgePreference(rsvp.preferredMinAge, 25),
      preferredMaxAge: normalizeAgePreference(rsvp.preferredMaxAge, 45),
      interests: rsvp.interests || [],
      customQ1: rsvp.customQ1 || "What is one green flag you notice quickly?",
      customQ2: rsvp.customQ2 || "What makes a conversation feel easy?",
      isActive: true,
      points: 0,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      rsvpId: rsvp.id,
      isTest: true
    };

    db.players[id] = player;
    game.playerIds.push(id);
    rsvp.status = "checked_in";
    rsvp.checkedInAt = new Date().toISOString();
    rsvp.playerId = id;
    rsvp.updatedAt = new Date().toISOString();
    checkedIn.push(rsvp);
  }

  res.json({ success: true, checkedIn: checkedIn.length, game: publicGame(game), rsvps: rsvpsForGame(game.id).map(publicRsvp), forecast: buildForecastForGame(game) });
});

app.post("/api/games/:gameId/clear-test-rsvps", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  const testRsvps = rsvpsForGame(game.id).filter(rsvp => rsvp.isTest);
  const testRsvpIds = new Set(testRsvps.map(rsvp => rsvp.id));
  const testPlayerIds = new Set(Object.values(db.players)
    .filter(player => player.gameId === game.id && (player.isTest || testRsvpIds.has(player.rsvpId)))
    .map(player => player.id));

  testPlayerIds.forEach(id => delete db.players[id]);
  game.playerIds = game.playerIds.filter(id => !testPlayerIds.has(id));
  db.rsvps = db.rsvps.filter(rsvp => !(rsvp.gameId === game.id && rsvp.isTest));

  res.json({ success: true, clearedRsvps: testRsvps.length, clearedPlayers: testPlayerIds.size, game: publicGame(game), rsvps: rsvpsForGame(game.id).map(publicRsvp), forecast: buildForecastForGame(game) });
});



app.post("/api/host/rsvps/:rsvpId/mark-no-show", requireHost, (req, res) => {
  const rsvp = (db.rsvps || []).find(item => item.id === req.params.rsvpId);
  if (!rsvp) return res.status(404).json({ error: "RSVP not found" });
  if (rsvp.checkedInAt) return res.status(400).json({ error: "This RSVP is already checked in." });

  rsvp.status = "no_show";
  rsvp.noShowAt = new Date().toISOString();
  rsvp.updatedAt = new Date().toISOString();

  res.json({ success: true, rsvp: publicRsvp(rsvp) });
});

app.post("/api/games/:gameId/mark-open-rsvps-no-show", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  let marked = 0;
  (db.rsvps || [])
    .filter(rsvp => rsvp.gameId === game.id && rsvp.status === "rsvp_open" && !rsvp.checkedInAt)
    .forEach(rsvp => {
      rsvp.status = "no_show";
      rsvp.noShowAt = new Date().toISOString();
      rsvp.updatedAt = new Date().toISOString();
      marked += 1;
    });

  res.json({ success: true, marked, game: publicGame(game) });
});


app.post("/api/games/:gameId/test-report", requireHost, (req, res) => {
  const game = db.games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  updateGameClock(game);
  const players = getGamePlayers(game).filter(player => !player.removedAt);
  if (players.length < 2) {
    return res.status(400).json({ error: "Need at least 2 players to create a test safety report." });
  }

  const reporter = players[0];
  const reported = players[1];
  const report = {
    id: nanoid(),
    gameId: game.id,
    gameCode: game.gameCode,
    fromPlayerId: reporter.id,
    toPlayerId: reported.id,
    reporterAlias: reporter.nickname,
    reportedAlias: reported.nickname,
    reason: "rude",
    note: "TEST REPORT: This was generated by the host to confirm the Safety Alert works.",
    round: game.currentRound || 0,
    phaseType: game.phaseType || "test",
    phaseLabel: game.phaseLabel || "Test Mode",
    pairingId: null,
    status: "open",
    isTest: true,
    createdAt: new Date().toISOString()
  };

  db.reports.push(report);
  res.json({ success: true, report: publicReport(report), game: publicGame(game) });
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

  const nextPairing = game.status === "break" ? getNextPairingForPlayer(game, player.id) : null;
  const nextPartners = nextPairing
    ? nextPairing.playerIds.filter(id => id !== player.id).map(id => db.players[id]).filter(Boolean)
    : [];

  res.json({
    player,
    game: publicGame(game),
    pairing,
    partners,
    nextPairing,
    nextPartners,
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
  app.listen(PORT, () => console.log(`BARFLY DATE v76 running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to initialize persistence:", err);
  process.exit(1);
});
