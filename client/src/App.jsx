/* BARFLYDATE v9 safety build: removed duplicate Results function declaration */
import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";

const BUSINESS_BOOKING_LINK = "/book";
const BUSINESS_PHONE = "ADD PHONE NUMBER";
const BUSINESS_EMAIL = "ADD EMAIL";
const BUSINESS_WEBSITE = "barfly.social";
const BUSINESS_WEBSITE_URL = "https://barfly.social";
const BUSINESS_GAMES_SITE = "games.barfly.social";
const BUSINESS_GAMES_URL = "https://games.barfly.social";
const BUSINESS_INSTAGRAM_URL = "https://instagram.com/barflyentertainment";

function usePublicSettings() {
  const [settings, setSettings] = React.useState({
    businessPhone: BUSINESS_PHONE,
    businessEmail: BUSINESS_EMAIL,
    bookingLink: BUSINESS_BOOKING_LINK,
    website: BUSINESS_WEBSITE,
    websiteUrl: BUSINESS_WEBSITE_URL,
    gamesSite: BUSINESS_GAMES_SITE,
    gamesUrl: BUSINESS_GAMES_URL,
    instagramHandle: "@barflyentertainment",
    instagramUrl: BUSINESS_INSTAGRAM_URL,
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
    appIconPopupActive: false,
    appIconPopupTitle: "",
    appIconPopupText: "",
    appIconPopupImageUrl: "",
    appIconPopupButtonText: "",
    defaultDisclaimer: "Event details, prizes, and times are subject to venue rules and availability.",
    defaultPrizeRules: "Free to play. Play for prizes. See venue for details."
  });

  React.useEffect(() => {
    fetch(`${API}/settings`)
      .then(res => res.json())
      .then(data => setSettings(current => ({ ...current, ...(data.settings || {}) })))
      .catch(() => {});
  }, []);

  return settings;
}


function normalizeExternalUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("/") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("@")) return `https://instagram.com/${raw.slice(1)}`;
  return `https://${raw}`;
}

function openBusinessLink(value) {
  const url = normalizeExternalUrl(value);
  if (!url) return;
  window.location.href = url;
}

function phoneLink(value) {
  const cleaned = String(value || "").replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

function emailLink(value) {
  const email = String(value || "").trim();
  return email ? `mailto:${email}` : "";
}

function BusinessContactButtons({ settings, compact = false }) {
  const booking = settings?.bookingLink || BUSINESS_BOOKING_LINK;
  const website = settings?.websiteUrl || settings?.website || BUSINESS_WEBSITE_URL;
  const games = settings?.gamesUrl || settings?.gamesSite || BUSINESS_GAMES_URL;
  const instagram = settings?.instagramUrl || settings?.instagramHandle || BUSINESS_INSTAGRAM_URL;
  const phone = phoneLink(settings?.businessPhone || BUSINESS_PHONE);
  const email = emailLink(settings?.businessEmail || BUSINESS_EMAIL);

  return <div className={compact ? "businessButtonGrid compactButtons" : "businessButtonGrid"}>
    <Button onClick={() => openBusinessLink(booking)}>Request an Event</Button>
    <Button className="secondary" onClick={() => openBusinessLink(website)}>Website</Button>
    <Button className="secondary" onClick={() => openBusinessLink(games)}>Games</Button>
    <Button className="secondary" onClick={() => openBusinessLink(instagram)}>Instagram</Button>
    {phone && <Button className="secondary" onClick={() => window.location.href = phone}>Call</Button>}
    {email && <Button className="secondary" onClick={() => window.location.href = email}>Email</Button>}
  </div>;
}


function eventInstagramCaption(event, settings = {}) {
  const action = eventPrimaryAction(event);
  const lines = [
    `${event.title} at ${event.venueName} 🎉`,
    `${event.dayLabel} • ${formatEventTime(event.startTime)}–${formatEventTime(event.endTime)}`,
    event.venueLocation ? `📍 ${event.venueLocation}` : "",
    event.prizeSpecial ? `🏆 ${event.prizeSpecial}` : "",
    event.sponsorName ? `Sponsored by ${event.sponsorName}` : "",
    "",
    `${action.label}:`,
    action.link?.startsWith("http") ? action.link : `${window.location.origin}${action.link || event.publicPath || "/events"}`,
    "",
    settings.instagramHandle || "@barflyentertainment",
    "#BarflySocial #BarflyEntertainment #BatonRougeEvents"
  ].filter(line => line !== "");
  return lines.join("\\n");
}

async function copyEventCaption(event, settings = {}) {
  trackEventMetric("caption_copy", event);
  const caption = eventInstagramCaption(event, settings);
  try {
    await navigator.clipboard.writeText(caption);
    alert("Instagram caption copied.");
  } catch (err) {
    prompt("Copy this caption:", caption);
  }
}



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
  { value: "mystery", label: "Digital Mystery" },
  { value: "escape_room", label: "Digital Escape Room" },
  { value: "music_bingo", label: "Music Bingo" },
  { value: "special", label: "Special Event" }
];

const venueHeroVenues = [
  "Brickyard South",
  "TOPGOLF",
  "Urban Daiquiris",
  "El Paso Restaurant",
  "La Caretta",
  "Pelican to Mars"
];

const heroVariants = [
  { value: "themed-trivia", label: "Themed Trivia", family: "Trivia" },
  { value: "general-trivia", label: "General Trivia", family: "Trivia" },
  { value: "music-trivia", label: "Music Trivia", family: "Trivia" },
  { value: "mystery-trivia", label: "Mystery Trivia", family: "Trivia" },
  { value: "digital-escape-room", label: "Digital Escape Room", family: "Specialty" },
  { value: "bingo", label: "Bingo", family: "Bingo" },
  { value: "quiz-bingo", label: "Quiz Bingo", family: "Bingo" },
  { value: "music-bingo", label: "Music Bingo", family: "Bingo" },
  { value: "karaoke", label: "Karaoke", family: "Karaoke" },
  { value: "battle-karaoke", label: "Battle Karaoke", family: "Karaoke" },
  { value: "meet-and-mingle", label: "Meet and Mingle", family: "Social" },
  { value: "latino-bingo", label: "Latino Bingo", family: "Latino" },
  { value: "latino-karaoke", label: "Latino Karaoke", family: "Latino" },
  { value: "latino-trivia", label: "Latino Trivia", family: "Latino" },
  { value: "professional-networking", label: "Professional Networking", family: "Social" },
  { value: "workday-blackout-bingo", label: "Workday Blackout Bingo", family: "Bingo" },
  { value: "barfly-putting-simulator", label: "Barfly Putting Simulator", family: "Golf" }
];

const eventSetupPresets = [
  {
    key: "workday-blackout-bingo",
    label: "Workday Blackout Bingo",
    icon: "☀️",
    title: "Workday Blackout Bingo",
    eventType: "bingo",
    customEventType: "Workday Blackout Bingo",
    heroVariant: "workday-blackout-bingo",
    posterTemplateSlug: "bingo-night",
    posterOverlayLayout: "bottom_info_panel",
    buttonText: "RSVP",
    description: "A quick midday Barfly Social bingo event. Free to play. Play for prizes.",
    prizeSpecial: "Free to play. Play for prizes.",
    startTime: "12:00",
    endTime: "13:00",
    meetMingleEnabled: true,
    meetMingleGameMode: "quick_30",
    onlineOnly: false
  },
  {
    key: "karaoke",
    label: "Karaoke Night",
    icon: "🎤",
    title: "Karaoke Night",
    eventType: "karaoke",
    customEventType: "Karaoke",
    heroVariant: "karaoke",
    posterTemplateSlug: "karaoke-night",
    posterOverlayLayout: "center_stack",
    buttonText: "Song Request",
    description: "Hosted karaoke night with Barfly Social.",
    prizeSpecial: "Free to sing. Venue rules apply.",
    startTime: "21:00",
    endTime: "01:00",
    meetMingleEnabled: true,
    meetMingleGameMode: "social_60",
    onlineOnly: false
  },
  {
    key: "general-trivia",
    label: "General Trivia",
    icon: "🧠",
    title: "General Trivia Night",
    eventType: "trivia",
    customEventType: "General Trivia",
    heroVariant: "general-trivia",
    posterTemplateSlug: "trivia-night",
    posterOverlayLayout: "bottom_info_panel",
    buttonText: "RSVP",
    description: "Live trivia hosted by Barfly Social. Free to play. Play for prizes.",
    prizeSpecial: "Free to play. Play for prizes.",
    startTime: "19:00",
    endTime: "22:00",
    meetMingleEnabled: true,
    meetMingleGameMode: "social_60",
    onlineOnly: false
  },
  {
    key: "music-bingo",
    label: "Music Bingo",
    icon: "🎶",
    title: "Music Bingo",
    eventType: "music_bingo",
    customEventType: "Music Bingo",
    heroVariant: "music-bingo",
    posterTemplateSlug: "bingo-night",
    posterOverlayLayout: "bottom_info_panel",
    buttonText: "RSVP",
    description: "Music bingo hosted by Barfly Social. Listen, match, and win.",
    prizeSpecial: "Free to play. Play for prizes.",
    startTime: "19:00",
    endTime: "22:00",
    meetMingleEnabled: true,
    meetMingleGameMode: "social_60",
    onlineOnly: false
  },
  {
    key: "mystery-trivia",
    label: "Mystery Trivia",
    icon: "🕵️",
    title: "Mystery Trivia",
    eventType: "mystery",
    customEventType: "Mystery Trivia",
    heroVariant: "mystery-trivia",
    posterTemplateSlug: "mystery-night",
    posterOverlayLayout: "center_stack",
    buttonText: "Join",
    description: "A story-driven trivia night where clues help teams solve the case.",
    prizeSpecial: "Free to play. Play for prizes.",
    startTime: "19:00",
    endTime: "22:00",
    meetMingleEnabled: true,
    meetMingleGameMode: "social_60",
    onlineOnly: false
  },
  {
    key: "digital-escape-room",
    label: "Digital Escape Room",
    icon: "🔐",
    title: "Digital Escape Room",
    eventType: "escape_room",
    customEventType: "Digital Escape Room",
    heroVariant: "digital-escape-room",
    posterTemplateSlug: "mystery-night",
    posterOverlayLayout: "center_stack",
    buttonText: "Start Game",
    description: "A timed digital escape room experience powered by Barfly Social.",
    prizeSpecial: "Play solo or with a team.",
    startTime: "19:00",
    endTime: "22:00",
    meetMingleEnabled: false,
    meetMingleGameMode: "quick_30",
    onlineOnly: true
  },
  {
    key: "putting-simulator",
    label: "Putting Simulator",
    icon: "⛳",
    title: "Barfly Putting Simulator",
    eventType: "special",
    customEventType: "Barfly Putting Simulator",
    heroVariant: "barfly-putting-simulator",
    posterTemplateSlug: "game-night",
    posterOverlayLayout: "bottom_info_panel",
    buttonText: "RSVP",
    description: "A social golf-style Barfly game built for friendly competition.",
    prizeSpecial: "Free to play. Play for prizes.",
    startTime: "18:00",
    endTime: "21:00",
    meetMingleEnabled: true,
    meetMingleGameMode: "social_60",
    onlineOnly: false
  },
  {
    key: "professional-networking",
    label: "Professional Networking",
    icon: "🤝",
    title: "Professional Networking Mixer",
    eventType: "barfly_social",
    customEventType: "Professional Networking",
    heroVariant: "professional-networking",
    posterTemplateSlug: "meet-and-mingle",
    posterOverlayLayout: "center_stack",
    buttonText: "RSVP",
    description: "A professional mixer with guided introductions and conversation prompts.",
    prizeSpecial: "Meet new people. Make real connections.",
    startTime: "18:00",
    endTime: "20:00",
    meetMingleEnabled: true,
    meetMingleGameMode: "social_60",
    onlineOnly: false
  }
];


function slugifyLoose(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCalendarEventType(label) {
  const text = String(label || "").toLowerCase();
  if (text.includes("karaoke")) return "karaoke";
  if (text.includes("bingo")) return text.includes("music") ? "music_bingo" : "bingo";
  if (text.includes("trivia")) return "trivia";
  if (text.includes("escape")) return "escape_room";
  if (text.includes("mystery")) return "mystery";
  if (text.includes("network") || text.includes("mingle") || text.includes("mixer")) return "barfly_social";
  return "special";
}

function heroVariantForCustomType(label) {
  const slug = slugifyLoose(label);
  const exact = heroVariants.find(variant => variant.value === slug);
  if (exact) return exact.value;
  const lower = String(label || "").toLowerCase();
  if (lower.includes("music") && lower.includes("bingo")) return "music-bingo";
  if (lower.includes("quiz") && lower.includes("bingo")) return "quiz-bingo";
  if (lower.includes("bingo")) return "bingo";
  if (lower.includes("battle") && lower.includes("karaoke")) return "battle-karaoke";
  if (lower.includes("karaoke")) return "karaoke";
  if (lower.includes("music") && lower.includes("trivia")) return "music-trivia";
  if (lower.includes("mystery") && lower.includes("trivia")) return "mystery-trivia";
  if (lower.includes("trivia")) return "general-trivia";
  if (lower.includes("escape")) return "digital-escape-room";
  if (lower.includes("network")) return "professional-networking";
  if (lower.includes("workday")) return "workday-blackout-bingo";
  if (lower.includes("putting")) return "barfly-putting-simulator";
  if (lower.includes("mingle")) return "meet-and-mingle";
  return "general-trivia";
}

function daysLabel(days) {
  const list = Array.isArray(days) && days.length ? days.map(Number).sort((a,b) => a-b) : [];
  if (list.join(",") === "1,2,3,4,5") return "Monday–Friday";
  if (list.length === 7) return "Every day";
  return list.map(day => weeklyDayOptions.find(option => option.value === day)?.label).filter(Boolean).join(", ") || "No days selected";
}


function heroVariantLabel(value) {
  return heroVariants.find(variant => variant.value === value)?.label || value || "Hero Variant";
}

function defaultHeroVariantForEvent(eventType, title = "") {
  const text = `${eventType || ""} ${title || ""}`.toLowerCase();
  if (text.includes("battle") && text.includes("karaoke")) return "battle-karaoke";
  if (text.includes("latino") && text.includes("karaoke")) return "latino-karaoke";
  if (text.includes("latino") && text.includes("bingo")) return "latino-bingo";
  if (text.includes("latino") && text.includes("trivia")) return "latino-trivia";
  if (text.includes("music") && text.includes("bingo")) return "music-bingo";
  if (text.includes("quiz") && text.includes("bingo")) return "quiz-bingo";
  if (text.includes("music") && text.includes("trivia")) return "music-trivia";
  if (text.includes("mystery") && text.includes("trivia")) return "mystery-trivia";
  if (text.includes("theme") || text.includes("themed")) return "themed-trivia";
  if (text.includes("escape")) return "digital-escape-room";
  if (text.includes("workday") && text.includes("blackout") && text.includes("bingo")) return "workday-blackout-bingo";
  if (text.includes("putting") || text.includes("golf simulator") || text.includes("topgolf")) return "barfly-putting-simulator";
  if (text.includes("network")) return "professional-networking";
  if (text.includes("mingle") || text.includes("barfly_social")) return "meet-and-mingle";
  if (text.includes("karaoke")) return "karaoke";
  if (text.includes("bingo")) return "bingo";
  if (text.includes("trivia")) return "general-trivia";
  return "general-trivia";
}

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


function trackEventMetric(type, event = null, extra = {}) {
  fetch(`${API}/analytics`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      type,
      eventId: event?.id || null,
      slug: event?.slug || null,
      path: window.location.pathname,
      deviceId: eventDeviceId(),
      ...extra
    })
  }).catch(() => {});
}


function eventUrl(event) {
  if (!event) return `${window.location.origin}/events`;
  return `${window.location.origin}${event.publicPath || `/events/${event.slug || event.id}`}`;
}

function eventQrUrl(event) {
  return `${window.location.origin}${event.qrPath || `/qr/event/${event.slug || event.id}`}`;
}



function isOnlineGameEvent(event) {
  return Boolean(event?.onlineOnly);
}

function isBarflySocialEvent(event) {
  return event?.eventType === "barfly_social";
}

function eventUnavailable(event) {
  return ["cancelled", "postponed", "sold_out"].includes(event?.eventStatus);
}

function eventStatusLabel(status) {
  const labels = {
    scheduled: "Scheduled",
    tonight: "Tonight",
    cancelled: "Cancelled",
    postponed: "Postponed",
    sold_out: "Sold Out"
  };
  return labels[status] || "Scheduled";
}

function eventHasMeetMingle(event) {
  return event?.meetMingleEnabled === true && Boolean(event?.meetMingleGameId);
}

function eventActionBadge(event) {
  if (eventUnavailable(event)) return eventStatusLabel(event.eventStatus);
  if (eventHasMeetMingle(event) || isBarflySocialEvent(event)) return "BARFLY SOCIAL";
  if (isOnlineGameEvent(event)) return "ONLINE GAME";
  if (event?.eventScope === "private") return "PRIVATE EVENT";
  return "LIVE EVENT";
}

function eventPrimaryAction(event) {
  if (eventUnavailable(event)) {
    return { label: eventStatusLabel(event.eventStatus), type: "disabled", link: "" };
  }
  if (event?.paidEvent) {
    return {
      label: "Buy Ticket",
      type: "link",
      link: event?.paymentLink || event?.buttonLink || event?.publicPath || `/events/${event?.slug || event?.id}`
    };
  }
  if (isOnlineGameEvent(event)) {
    return {
      label: "Play Now",
      type: "link",
      link: event?.buttonLink || event?.publicPath || `/events/${event?.slug || event?.id}`
    };
  }
  if (eventHasMeetMingle(event)) {
    return {
      label: "RSVP",
      type: "link",
      link: `/rsvp?gameId=${event.meetMingleGameId}`
    };
  }
  return {
    label: "I’m Going",
    type: "respond",
    response: "going",
    link: event?.publicPath || `/events/${event?.slug || event?.id}`
  };
}

function runEventPrimaryAction(event, respondFn = null) {
  if (eventUnavailable(event)) return;
  const action = eventPrimaryAction(event);
  trackEventMetric("primary_click", event, { label: action.label, link: action.link || "", type: action.type });
  if (action.type === "respond" && respondFn) {
    respondFn(action.response || "going");
    return;
  }
  if (action.link) setTimeout(() => { window.location.href = action.link; }, 80);
}

function openEventPrimaryAction(event) {
  runEventPrimaryAction(event);
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

async function copyEventLink(event) {
  const url = eventUrl(event);
  trackEventMetric("link_copy", event);
  try {
    await navigator.clipboard.writeText(url);
    alert("Event link copied.");
  } catch (err) {
    prompt("Copy this event link:", url);
  }
}

function EventShareButton({ event, label = "Share" }) {
  const [open, setOpen] = React.useState(false);
  if (!event) return null;
  const qrLink = event.qrPath || `/qr/event/${event.slug || event.id}`;

  function nativeShare() {
    setOpen(false);
    shareEvent(event);
  }

  function openQr() {
    setOpen(false);
    window.location.href = qrLink;
  }

  async function copyLink() {
    setOpen(false);
    await copyEventLink(event);
  }

  return <div className="shareMenuWrap">
    <Button className="secondary" onClick={() => setOpen(value => !value)}>{label}</Button>
    {open && <div className="shareMenuCard">
      <div className="brandMark">SHARE THIS EVENT</div>
      <button type="button" onClick={copyLink}>Copy Event Link</button>
      <button type="button" onClick={openQr}>Show QR Code</button>
      <button type="button" onClick={nativeShare}>Share From Phone</button>
      <button type="button" onClick={() => setOpen(false)}>Cancel</button>
    </div>}
  </div>;
}

function globalIframeTools(settings = {}) {
  const tools = [
    { key: "bingo", label: "Bingo", icon: "🎱", url: settings.globalBingoIframeUrl, title: "Barfly Bingo" },
    { key: "trivia", label: "Trivia", icon: "❓", url: settings.globalTriviaIframeUrl, title: "Barfly Trivia" },
    { key: "mystery", label: "Mystery", icon: "🕵️", url: settings.globalMysteryIframeUrl, title: "Barfly Mystery" },
    { key: "vote", label: "Vote", icon: "🗳️", url: settings.globalVoteIframeUrl, title: "Barfly Vote" }
  ];
  return tools
    .map(tool => ({ ...tool, url: normalizeExternalUrl(tool.url) }))
    .filter(tool => tool.url);
}

function EventIframeModal({ tool, onClose }) {
  if (!tool) return null;
  return <div className="eventIframeBackdrop" role="dialog" aria-modal="true">
    <div className="eventIframePanel">
      <div className="eventIframeHeader">
        <div>
          <div className="brandMark">{tool.icon} {tool.label}</div>
          <h2>{tool.title}</h2>
        </div>
        <button type="button" className="eventIframeClose" onClick={onClose} aria-label="Close iframe">×</button>
      </div>
      <iframe
        className="barflyMobileIframe"
        src={tool.url}
        title={tool.title}
        loading="lazy"
        scrolling="no"
        allow="camera; microphone; clipboard-write; fullscreen"
      />
    </div>
  </div>;
}

function GlobalGameIconBar({ settings: providedSettings = null }) {
  const fallbackSettings = usePublicSettings();
  const settings = providedSettings || fallbackSettings;
  const [activeTool, setActiveTool] = React.useState(null);
  const tools = globalIframeTools(settings);
  if (!tools.length) return null;
  return <>
    <div className="eventGameIconBar globalGameIconBar">
      {tools.map(tool => <button type="button" key={tool.key} onClick={() => setActiveTool(tool)} aria-label={tool.label}>
        <span>{tool.icon}</span>
        <b>{tool.label}</b>
      </button>)}
    </div>
    <EventIframeModal tool={activeTool} onClose={() => setActiveTool(null)} />
  </>;
}

function PublicBottomActionStack() {
  return null;
}

function SocialWallButton({ event }) {
  const eventParam = event ? `?event=${encodeURIComponent(event.title || event.slug || event.id || "")}` : "";
  return <Button className="secondary socialWallEventButton" onClick={() => window.location.href = `/social-wall${eventParam}`}>
    <span aria-hidden="true">📸</span>
    <span>Social Wall</span>
  </Button>;
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

const APP_VERSION = "BARFLYDATE v118";

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



function getCohostPin() {
  return localStorage.getItem("barflydateCohostPin") || "";
}

function cohostHeaders(json = false) {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    "x-cohost-pin": getCohostPin()
  };
}

async function cohostFetch(url, options = {}) {
  const headers = { ...(options.headers || {}), ...cohostHeaders(Boolean(options.body)) };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("barflydateCohostPin");
    window.location.href = "/cohost";
    throw new Error("Co-host PIN required");
  }
  return res;
}


const categories = ["Hobbies","Travel","Food & Drink","Entertainment","Life Goals","Values","Adventure","Lifestyle","Quirks","Karaoke","Dancing","Sports","Bingo","Trivia","Murder Mystery","Escape Rooms","Reading","Working Out","Pets","Volunteering","Running"];

const lookingForOptions = [
  { value: "friends_only", label: "Friends Only" },
  { value: "activity_partners", label: "Activity Partners" },
  { value: "casual_dating", label: "Casual Dating" },
  { value: "serious_dating", label: "Serious Dating" },
  { value: "marriage", label: "Marriage" }
];

const publicNavItems = [
  { key: "events", label: "This Week’s Events", icon: "📅", href: "/events" },
  { key: "rsvp", label: "RSVP Now", icon: "📝", href: "/rsvp" },
  { key: "my-rsvp", label: "My RSVP", icon: "💌", href: "/my-rsvp" },
  { key: "checkin", label: "Venue Check-In", icon: "🎟️", href: "/checkin" }
];

const posterTemplates = [
  {
    name: "Game Night",
    slug: "game-night",
    category: "game",
    pickerLabel: "🎮 Game Night",
    overlayLayout: "bottom_info_panel",
    backgroundImageUrl: "/templates/game-night.png",
    active: true,
    icons: ["🎱", "❓", "🎤", "🎮", "✨"],
    badges: ["Game Night", "Multiple Games", "Hosted by Barfly Social"]
  },
  {
    name: "Bingo Night",
    slug: "bingo-night",
    category: "game",
    pickerLabel: "🎱 Bingo",
    overlayLayout: "bottom_info_panel",
    backgroundImageUrl: "/templates/bingo-night.png",
    active: true,
    icons: ["🎱", "🎟️", "⭐", "✨"],
    badges: ["Free to Play", "Play for Prizes", "Blackout Bingo"]
  },
  {
    name: "Trivia Night",
    slug: "trivia-night",
    category: "game",
    pickerLabel: "❓ Trivia",
    overlayLayout: "bottom_info_panel",
    backgroundImageUrl: "/templates/trivia-night.png",
    active: true,
    icons: ["❓", "💡", "🧠", "⭐"],
    badges: ["Free to Play", "Team Trivia", "Win Prizes"]
  },
  {
    name: "Bingo + Trivia Night",
    slug: "bingo-trivia-night",
    category: "game",
    pickerLabel: "🎱❓ Bingo + Trivia",
    overlayLayout: "bottom_info_panel",
    backgroundImageUrl: "/templates/game-night.png",
    active: true,
    icons: ["🎱", "❓", "💡", "⭐"],
    badges: ["Free to Play", "Bingo + Trivia", "Play for Prizes"]
  },
  {
    name: "Karaoke Night",
    slug: "karaoke-night",
    category: "music",
    pickerLabel: "🎤 Karaoke",
    overlayLayout: "center_stack",
    backgroundImageUrl: "/templates/karaoke-night.png",
    active: true,
    icons: ["🎤", "🎵", "🔊", "🎶"],
    badges: ["Sing Tonight", "Hosted Karaoke", "Free to Sing"]
  },
  {
    name: "Meet & Mingle",
    slug: "meet-and-mingle",
    category: "social",
    pickerLabel: "🫂 Meet & Mingle",
    overlayLayout: "center_stack",
    backgroundImageUrl: "/templates/meet-and-mingle.png",
    active: true,
    icons: ["🫂", "💬", "✨", "💜"],
    badges: ["RSVP Open", "Meet New People", "Social Experience"]
  }
];

function posterTemplateFor(event) {
  const fromEvent = posterTemplates.find(template => template.slug === event?.posterTemplateSlug);
  if (fromEvent) return fromEvent;
  const type = event?.eventType;
  const title = String(event?.title || "").toLowerCase();
  if (title.includes("bingo") && title.includes("trivia")) return posterTemplates.find(t => t.slug === "bingo-trivia-night");
  if (type === "bingo" || title.includes("bingo")) return posterTemplates.find(t => t.slug === "bingo-night");
  if (type === "trivia" || title.includes("trivia")) return posterTemplates.find(t => t.slug === "trivia-night");
  if (type === "karaoke" || title.includes("karaoke")) return posterTemplates.find(t => t.slug === "karaoke-night");
  if (type === "barfly_social") return posterTemplates.find(t => t.slug === "meet-and-mingle");
  return posterTemplates.find(t => t.slug === "game-night");
}

function eventCardActionLabel(event) {
  return eventPrimaryAction(event).label;
}

function eventCardCity(event) {
  const location = String(event?.venueLocation || "").trim();
  if (!location) return "";
  const parts = location.split(",").map(part => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts.slice(-2).join(", ");
  return location;
}

function templateHeroStyle(template) {
  return template?.backgroundImageUrl
    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.04), rgba(0,0,0,.18)), url(${template.backgroundImageUrl})` }
    : undefined;
}

function eventHeroStyle(event, template) {
  if (event?.showHeroGraphic === false) return undefined;
  const hero = event?.heroImageUrl || event?.eventImageUrl || template?.backgroundImageUrl || "";
  const fit = event?.heroFit === "contain" ? "contain" : "cover";
  return hero
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.04), rgba(0,0,0,.18)), url(${hero})`,
        backgroundSize: fit,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: fit === "contain" ? "#08040f" : undefined
      }
    : undefined;
}

const eventTypeOptions = [
  { value: "social_mixer", label: "Social Mixer", details: "Meet new people without dating pressure." },
  { value: "friends_activity", label: "Friends & Activity Partners", details: "Find people for games, activities, and social plans." },
  { value: "singles_night", label: "Singles Night", details: "A social dating event for casual and serious sparks." },
  { value: "mystery_match", label: "Mystery Match Night", details: "Premium mystery-date style rounds and reveal." },
  { value: "private_party", label: "Private Party", details: "Closed group social mixer." }
];

function heroUrlWarning(url) {
  const text = String(url || "").trim().toLowerCase();
  if (!text) return "";
  if (text.includes("canva.com/design") || text.includes("canva.com")) return "Canva design links usually will not display here. Export the image as PNG and use a packaged app path like /heroes/venue/event.png.";
  if (text.startsWith("http") && !/\.(png|jpe?g|webp|svg)(\?|#|$)/i.test(text)) return "This may not be a direct image URL. Use a link ending in .png, .jpg, .webp, or .svg.";
  return "";
}

function eventTypeLabel(value) {
  return eventTypeOptions.find(option => option.value === value)?.label || "Mystery Match Night";
}

const gameModeOptions = [
  { value: "quick_30", label: "30-Minute Quick Mixer", details: "4 rounds • fast pace • small groups" },
  { value: "social_60", label: "60-Minute Social Game", details: "6 rounds • balanced pace • medium crowds" },
  { value: "full_90", label: "90-Minute Full Experience", details: "9 rounds + final voting • premium event" }
];

const mixerGoalOptions = [
  { value: "", label: "Choose mixer goal", details: "Select a goal to auto-load the best round apps." },
  { value: "social", label: "Social Mixer", details: "Friends, activity partners, and general bar crowd connection." },
  { value: "professional", label: "Professional Networking", details: "Business-friendly prompts for networking and follow-up." },
  { value: "dating", label: "Dating", details: "Attraction, lifestyle, values, and compatibility." },
  { value: "marriage", label: "Marriage / Serious Relationship", details: "Deeper values, family, finance, communication, and future vision." },
  { value: "custom", label: "Custom", details: "Use advanced/custom round apps later." }
];

const appOrders = {
  quick_30: ["Food & Drink", "Karaoke", "Bingo", "Trivia"],
  social_60: ["Karaoke", "Dancing", "Sports", "Bingo", "Trivia", "Pets"],
  full_90: ["Food & Drink", "Karaoke", "Dancing", "Sports", "Bingo", "Trivia", "Murder Mystery", "Escape Rooms", "Reading", "Working Out", "Pets", "Volunteering", "Running"]
};

const mixerGoalAppOrders = {
  social: {
    quick_30: ["Food & Drink", "Karaoke", "Bingo", "Trivia"],
    social_60: ["Food & Drink", "Karaoke", "Bingo", "Trivia", "Sports", "Pets"],
    full_90: ["Food & Drink", "Karaoke", "Bingo", "Trivia", "Sports", "Pets", "Running", "Volunteering", "Escape Rooms"]
  },
  professional: {
    quick_30: ["Career", "Industry", "Business Goals", "Skills"],
    social_60: ["Career", "Industry", "Business Goals", "Skills", "Community", "Leadership"],
    full_90: ["Career", "Industry", "Business Goals", "Skills", "Community", "Leadership", "Projects", "Collaboration", "Follow-Up"]
  },
  dating: {
    quick_30: ["Lifestyle", "Food & Drink", "Entertainment", "Personality"],
    social_60: ["Lifestyle", "Food & Drink", "Entertainment", "Travel", "Values", "Communication"],
    full_90: ["Lifestyle", "Food & Drink", "Entertainment", "Travel", "Values", "Personality", "Communication", "Chemistry", "Future Plans"]
  },
  marriage: {
    quick_30: ["Values", "Communication", "Family", "Life Goals"],
    social_60: ["Values", "Communication", "Family", "Life Goals", "Finances", "Home Life"],
    full_90: ["Values", "Faith / Beliefs", "Family", "Finances", "Life Goals", "Communication", "Conflict Style", "Home Life", "Future Vision"]
  }
};

function appOrderForMode(value, mixerGoal = "") {
  const goal = mixerGoalAppOrders[mixerGoal] || null;
  return goal?.[value] || goal?.full_90 || appOrders[value] || appOrders.full_90;
}

function mixerGoalLabel(value) {
  return mixerGoalOptions.find(option => option.value === value)?.label || "Not selected";
}

function AppJourney({ mode, mixerGoal = "", activeRound = 0 }) {
  const order = appOrderForMode(mode, mixerGoal);
  return <div>
    <div className="journeyGrid">
      {order.map((appName, index) => <div key={`${appName}-${index}`} className={activeRound === index + 1 ? "journeyChip active" : "journeyChip"}>
        <span>{index + 1}</span>
        <b>{emojiFor(appName)} {appName}</b>
      </div>)}
    </div>
    <p className="microcopy journeyNote">Round apps are selected by mixer goal and session length.</p>
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
  return {
    Hobbies:"🎯",
    Travel:"✈️",
    "Food & Drink":"🍸",
    Entertainment:"🎬",
    "Life Goals":"🚀",
    Values:"❤️",
    Adventure:"⚡",
    Lifestyle:"🏡",
    Quirks:"🎭",
    Karaoke:"🎤",
    Dancing:"💃",
    Sports:"🏈",
    Bingo:"🎱",
    Trivia:"🧠",
    "Murder Mystery":"🕵️",
    "Escape Rooms":"🔐",
    Reading:"📚",
    "Working Out":"🏋️",
    Pets:"🐾",
    Volunteering:"🤝",
    Running:"🏃"
  }[x] || "📱";
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



function PublicBrandHeader() {
  return <div className="publicBrandHeader">
    <button type="button" className="publicBrandLogoButton" onClick={() => window.location.href = "/events"} aria-label="Barfly Social events">
      <img src="/barfly-social-splash.png" alt="Barfly Social" />
    </button>
    <p>Meet. Mingle. Play.</p>
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
      <span className="navIcon">{item.icon === "mingleTriad" ? <span className="mingleTriadIcon" aria-hidden="true"><i /><i /><i /></span> : item.icon}</span>
      <span>{item.label}</span>
    </button>)}
  </div>;
}


function EventsPageActionNav() {
  const go = href => { window.location.href = href; };
  return <div className="publicNav eventsActionNav">
    <button type="button" className="navItem" onClick={() => go("/my-rsvp")}>
      <span className="navIcon">💌</span>
      <span>My RSVP</span>
    </button>
    <button type="button" className="navItem" onClick={() => go("/my-rsvp")}>
      <span className="navIcon">🔄</span>
      <span>Change RSVP</span>
    </button>
    <button type="button" className="navItem" onClick={() => go("/checkin")}>
      <span className="navIcon">🎟️</span>
      <span>Check In</span>
    </button>
    <button type="button" className="navItem dangerNav" onClick={() => go("/my-rsvp")}>
      <span className="navIcon">✕</span>
      <span>Cancel</span>
    </button>
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
    <div className="brandMark">BARFLY SOCIAL</div>
    <h1>Enter the Night</h1>
    <p className="tagline">Tonight isn’t random. Every match is intentional.</p>
    <div className="row"><Button className="secondary" onClick={() => window.location.href = "/forecast"}>View Meet & Mingle</Button><Button className="secondary" onClick={() => window.location.href = "/rsvp"}>RSVP</Button><Button className="secondary" onClick={() => window.location.href = "/checkin"}>Venue Check-In</Button></div>

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
      <label>Gender Identity</label>
      <select value={form.gender} onChange={e => update("gender", e.target.value)}>
        <option value="man">Man</option>
        <option value="woman">Woman</option>
        <option value="non_binary">Non-binary</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
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
  const [showHomeTip, setShowHomeTip] = React.useState(false);

  function continueToHome() {
    setReady(true);
  }

  React.useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    fetch(`${API}/events`)
      .then(res => res.json())
      .catch(() => null)
      .finally(() => {
        const remaining = Math.max(0, SPLASH_MIN_MS - (Date.now() - started));
        setTimeout(() => {
          if (!cancelled) setShowHomeTip(true);
        }, remaining);
      });

    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => { window.location.href = "/home"; }, SPLASH_FADE_MS);
    return () => clearTimeout(t);
  }, [ready]);

  return <div className={`screen splashScreen ${ready ? "fadeOut" : ""}`}>
    <div className="splashBg" />
    <div className="splashCenter">
      <div className="logoWrap">
        <div className="logoGlow" />
        <img src="/barfly-social-splash.png" alt="Barfly Social" className="splashLogo" />
      </div>
      <div className="loadingDots"><span /><span /><span /></div>

      {showHomeTip && <div className="homeTipCard minimalHomeTip">
        <div className="brandMark">QUICK TIP</div>
        <p className="muted">Add Barfly Social to your Home Screen from your browser’s share or menu button for faster access.</p>
        <div className="ctaRow">
          <Button onClick={continueToHome}>OK</Button>
        </div>
      </div>}
    </div>
  </div>;
}


function makeQrUrl(kind = "radar") {
  const routes = {
    events: "/events",
    calendar: "/events",
    book: "/book",
    booking: "/book",
    radar: "/radar",
    forecast: "/radar",
    rsvp: "/rsvp",
    checkin: "/checkin",
    "my-rsvp": "/my-rsvp",
    "business-demo": "/demo",
    demo: "/demo",
    host: "/host",
    cohost: "/cohost",
    play: "/play"
  };
  const path = routes[kind] || "/events";
  return `${window.location.origin}${path}`;
}

function qrApiUrl(url, size = 520) {
  const safeUrl = String(url || `${window.location.origin}/events`);
  const safeSize = Math.max(180, Math.min(900, Number(size) || 520));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${safeSize}x${safeSize}&data=${encodeURIComponent(safeUrl)}`;
}


function QrDisplay() {
  const { parts } = useRoute();
  const kind = parts[1] || "radar";
  const eventSlug = parts[2] || "";
  const url = kind === "event" && eventSlug ? `${window.location.origin}/events/${eventSlug}` : makeQrUrl(kind);
  const labels = {
    forecast: { title: "Scan for Meet & Mingle", subtitle: "See where your kind of crowd is gathering and connect with the right vibe." },
    radar: { title: "Scan for Meet & Mingle", subtitle: "See where your kind of crowd is gathering and connect with the right vibe." },
    "business-demo": { title: "Scan for Venue Demo", subtitle: "Show a venue how Barfly Social works." },
    demo: { title: "Scan for Venue Demo", subtitle: "Show a venue how Barfly Social works." },
    checkin: { title: "Scan for Venue Check-In", subtitle: "For guests already at the venue." },
    host: { title: "Host Login QR", subtitle: "For host/admin use only." },
    cohost: { title: "Scan for Co-Host Dashboard", subtitle: "Give helpers access to the live social mixer only." },
    events: { title: "Scan for This Week’s Events", subtitle: "See upcoming Barfly Social events." },
    book: { title: "Scan to Request an Event", subtitle: "Request a Barfly Social event." },
    booking: { title: "Scan to Request an Event", subtitle: "Request a Barfly Social event." },
    event: { title: "Scan for This Event", subtitle: "Open the event page, RSVP interest, and add it to your calendar." }
  };
  const label = labels[kind] || labels.forecast;

  React.useEffect(() => {
    trackEventMetric(kind === "event" ? "qr_scan" : "qr_view", eventSlug ? { slug: eventSlug } : null, { kind });
  }, [kind, eventSlug]);

  return <div className="screen publicScreen neonPublic qrPage">
    <PublicBrandHeader />
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




function shouldShowEventPromo(settings) {
  if (!settings?.eventPromoActive) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (settings.eventPromoStartDate && today < settings.eventPromoStartDate) return false;
  if (settings.eventPromoEndDate && today > settings.eventPromoEndDate) return false;
  return true;
}

function EventsPromoPopup({ settings }) {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `barflyEventPromoDismissed:${today}`;
  const [visible, setVisible] = React.useState(() => {
    if (!shouldShowEventPromo(settings)) return false;
    return localStorage.getItem(storageKey) !== "1";
  });

  React.useEffect(() => {
    if (!shouldShowEventPromo(settings)) {
      setVisible(false);
      return;
    }
    setVisible(localStorage.getItem(storageKey) !== "1");
  }, [settings?.eventPromoActive, settings?.eventPromoTitle, settings?.eventPromoEndDate]);

  function dismiss() {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const buttonText = settings.eventPromoButtonText || "View Event";
  const buttonLink = settings.eventPromoButtonLink || "/events";
  return <div className="promoPopupBackdrop" role="dialog" aria-modal="true">
    <div className="promoPopupCard">
      <button className="promoCloseButton" onClick={dismiss} aria-label="Close promo">×</button>
      <div className="brandMark">{settings.eventPromoTitle || "Featured Sponsor"}</div>
      {settings.eventPromoImageUrl && <img className="promoPopupImage" src={settings.eventPromoImageUrl} alt={settings.eventPromoSponsor || settings.eventPromoTitle || "Promo"} />}
      <h2>{settings.eventPromoSponsor || "Barfly Social"}</h2>
      {settings.eventPromoText && <p>{settings.eventPromoText}</p>}
      <div className="ctaRow promoPopupActions">
        <Button onClick={() => { dismiss(); window.location.href = normalizeExternalUrl(buttonLink); }}>{buttonText}</Button>
        <Button className="secondary" onClick={dismiss}>Dismiss</Button>
      </div>
    </div>
  </div>;
}


function EventsCalendar() {
  const settings = usePublicSettings();
  const [data, setData] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const today = new Date();
  const todayKey = dateKey(today);
  const [viewMode, setViewMode] = React.useState("week");
  const [selectedDate, setSelectedDate] = React.useState(todayKey);
  const [hasPickedDate, setHasPickedDate] = React.useState(true);
  const [calendarMonth, setCalendarMonth] = React.useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  React.useEffect(() => {
    fetch(`${API}/events`).then(res => res.json()).then(setData).catch(() => setData({ events: [] }));
  }, []);

  async function respondEvent(event, response = "going") {
    const slug = event.slug || event.id;
    const res = await fetch(`${API}/events/${slug}/respond`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ response, deviceId: eventDeviceId() })
    });
    const json = await res.json().catch(() => ({ error: "Could not save response." }));
    if (!res.ok || json.error) return alert(json.error || "Could not save response.");
    const updatedEvent = json.event;
    setData(current => ({
      ...(current || {}),
      events: (current?.events || []).map(item => item.id === updatedEvent.id ? updatedEvent : item)
    }));
  }


  function monthLabel(date) {
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }

  function buildMonthDays(monthDate) {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }

  function buildWeekDays(baseDate) {
    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }

  function selectedDateTextFromKey(key) {
    return new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function setCalendarView(mode) {
    const now = new Date();
    setViewMode(mode);
    if (mode === "today") {
      setSelectedDate(dateKey(now));
      setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setHasPickedDate(true);
    } else if (mode === "week") {
      setSelectedDate(dateKey(now));
      setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setHasPickedDate(true);
    } else {
      setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setHasPickedDate(false);
    }
  }

  function selectCalendarDate(day) {
    setSelectedDate(dateKey(day));
    setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    setHasPickedDate(true);
  }

  const events = data?.events || [];
  const search = searchTerm.trim().toLowerCase();
  const searchedEvents = !search ? events : events.filter(event => [
    event.title,
    event.venueName,
    event.venueLocation,
    event.eventTypeLabel,
    event.description,
    event.prizeSpecial,
    event.sponsorName
  ].filter(Boolean).join(" ").toLowerCase().includes(search));
  const visibleEvents = filter === "all" ? searchedEvents : searchedEvents.filter(event => event.eventType === filter);
  const eventDates = new Set(visibleEvents.map(event => event.dateLabel).filter(Boolean));

  const weekDays = buildWeekDays(new Date());
  const monthDays = buildMonthDays(calendarMonth);
  const selectedEvents = hasPickedDate ? visibleEvents.filter(event => event.dateLabel === selectedDate) : [];
  const hasSelectedDateRsvpEvent = hasPickedDate && selectedEvents.some(event => eventHasMeetMingle(event) && !eventUnavailable(event));
  const selectedDateText = selectedDateTextFromKey(selectedDate);

  const grouped = selectedEvents.reduce((acc, event) => {
    const key = `${event.dayLabel} • ${event.dateLabel}`;
    acc[key] = acc[key] || [];
    acc[key].push(event);
    return acc;
  }, {});

  function DateButton({ day, compact = false }) {
    const key = dateKey(day);
    const inMonth = day.getMonth() === calendarMonth.getMonth();
    const hasEvents = eventDates.has(key);
    const selected = hasPickedDate && key === selectedDate;
    return <button className={[
      "calendarDate",
      compact ? "weekDate" : "",
      inMonth || viewMode !== "month" ? "" : "fadedDate",
      selected ? "selectedDate" : "",
      hasEvents ? "hasEvents" : ""
    ].filter(Boolean).join(" ")} onClick={() => selectCalendarDate(day)}>
      <span>{day.getDate()}</span>
      {hasEvents && <i />}
    </button>;
  }

  return <div className="screen publicScreen neonPublic eventsPage">
    <PublicBrandHeader />
    <EventsPromoPopup settings={settings} />
    <div className="card neonCard eventCalendarCard">
      <div className="brandMark">THIS WEEK’S EVENTS</div>

      <div className="calendarViewTabs">
        <Button className={viewMode === "week" ? "" : "secondary"} onClick={() => setCalendarView("week")}>Week</Button>
        <Button className={viewMode === "month" ? "" : "secondary"} onClick={() => setCalendarView("month")}>Month</Button>
      </div>

      <label>Search This Week’s Events</label>
      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by venue, event, city, sponsor, or game type" />

      <div className="eventFilterDropdown">
        <label>Event Type</label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Events</option>
          {calendarEventTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </div>

      {viewMode === "week" && <div className="calendarModePanel">
        <div className="calendarHeader simpleCalendarHeader">
          <h2>This Week’s Events</h2>
          <p className="muted">Tap a day to view that day’s events.</p>
        </div>
        <div className="calendarGrid weekdayGrid">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => <div key={day} className="weekdayCell">{day}</div>)}
        </div>
        <div className="calendarGrid dateGrid weekOnlyGrid">
          {weekDays.map(day => <DateButton key={dateKey(day)} day={day} compact />)}
        </div>
      </div>}

      {viewMode === "month" && <div className="calendarModePanel">
        <div className="calendarHeader">
          <Button className="secondary" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>‹</Button>
          <div>
            <h2>{monthLabel(calendarMonth)}</h2>
          </div>
          <Button className="secondary" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>›</Button>
        </div>

        <div className="calendarGrid weekdayGrid">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => <div key={day} className="weekdayCell">{day}</div>)}
        </div>
        <div className="calendarGrid dateGrid">
          {monthDays.map(day => <DateButton key={dateKey(day)} day={day} />)}
        </div>
      </div>}
    </div>

    {!data && <div className="card neonCard"><p>Loading events...</p></div>}
    {data && visibleEvents.length === 0 && <div className="card neonCard"><p className="muted">No events listed yet.</p></div>}
    {data && visibleEvents.length > 0 && !hasPickedDate && <div className="card neonCard emptyDayCard">
      <h2>Pick a date to view events.</h2>
      <p className="muted">Events stay hidden until you tap a day, keeping the calendar clean.</p>
    </div>}
    {data && hasPickedDate && visibleEvents.length > 0 && selectedEvents.length === 0 && <div className="card neonCard emptyDayCard">
      <h2>{selectedDate === todayKey ? "No events listed for today." : "No events listed for this day."}</h2>
      <p className="muted">Choose another date on the calendar.</p>
    </div>}

    {data && hasPickedDate && selectedEvents.length > 0 && <div className="selectedDateHeader">
      <div className="brandMark">SELECTED DATE</div>
      <h2>{selectedDateText}</h2>
    </div>}

    {Object.entries(grouped).map(([day, dayEvents]) => <details key={day} className="eventDayBlock collapsibleDay" open={true}>
      <summary>
        <span>{day}</span>
        <b>{dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}</b>
      </summary>
      <div className="eventCardGrid">
        {dayEvents.map(event => {
          const template = posterTemplateFor(event);
          const typeLabel = event.eventTypeLabel || eventTypeCalendarLabel(event.eventType);
          const cityText = eventCardCity(event);
          return <div className={`${event.featured ? "card neonCard eventCard premiumEventCard featuredEvent" : "card neonCard eventCard premiumEventCard"} ${event.showHeroGraphic === false ? "noHeroEventCard" : ""}`} key={event.occurrenceKey || event.id}>
            <div className="premiumBadgeRow">
              <span className={eventUnavailable(event) ? "statusPill storageWarn" : "statusPill"}>{eventActionBadge(event)}</span>
              <span className="statusPill">{typeLabel}</span>
              {event.featured && <span className="statusPill storageOk">Featured</span>}
            </div>

            {event.showHeroGraphic !== false && <div className={`eventTemplateHero template-${template?.slug || "game-night"}`} style={eventHeroStyle(event, template)} aria-label={`${typeLabel} event art`}>
              {!(event.heroImageUrl || event.eventImageUrl || template?.backgroundImageUrl) && <div className="eventTemplateFallback">{typeLabel}</div>}
            </div>}

            {eventUnavailable(event) && <div className="eventStatusBanner">{eventStatusLabel(event.eventStatus)}</div>}

            <div className="premiumEventInfo">
              <h3>{event.title}</h3>
              <p className="sparkLine">{formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
              <p className="venueLine"><b>{event.venueName}</b></p>
              {cityText && <p className="muted">{cityText}</p>}
              {event.description && <p>{event.description}</p>}
              {event.prizeSpecial && <p className="microcopy">{event.prizeSpecial}</p>}
              {event.paidEvent && <p className="ticketLine">🎟️ {event.ticketPrice || "Ticketed event"}</p>}
              {event.sponsorName && <p className="microcopy">Sponsor: {event.sponsorName}</p>}
              {(event.prizeName || event.prizeValue) && <p className="microcopy">Prize: {[event.prizeName, event.prizeValue].filter(Boolean).join(" • ")}</p>}

              {!isOnlineGameEvent(event) && <div className="eventStats premiumEventStats">
                <span>{event.responseCounts?.interested || 0} interested</span>
                <span>{event.responseCounts?.going || 0} going</span>
              </div>}

              <div className="ctaRow premiumActionRow">
                <Button disabled={eventUnavailable(event)} onClick={() => runEventPrimaryAction(event, response => respondEvent(event, response))}>{eventPrimaryAction(event).label}</Button>
                <EventShareButton event={event} />
                <SocialWallButton event={event} />
              </div>
            </div>
          </div>;
        })}
      </div>
    </details>)}

    <BackToHomeButton />
  </div>;
}



function EventDetail() {
  const settings = usePublicSettings();
  const { parts } = useRoute();
  const slug = parts[1];
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState("");

  const event = data?.event || null;
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

  React.useEffect(() => {
    if (event?.id) trackEventMetric("page_view", event);
  }, [event?.id]);

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
  if (!event) return <div className="screen publicScreen neonPublic"><p>Loading event...</p></div>;

  return <div className="screen publicScreen neonPublic eventDetailPage">
    <PublicBrandHeader />
    <div className="brandMark">BARFLY EVENT</div>
    <h1>{event.title}</h1>
    <p className="tagline">{event.eventTypeLabel || eventTypeCalendarLabel(event.eventType)} • {event.dayLabel} • {formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
    <div className="eventBadgeRow">
      <span className={eventUnavailable(event) ? "statusPill storageWarn" : "statusPill"}>{eventActionBadge(event)}</span>
      {event.onlineOnly && <span className="statusPill storageOk">Online Only</span>}
    </div>
    {eventUnavailable(event) && <div className="eventStatusBanner large">{eventStatusLabel(event.eventStatus)}</div>}

    <div className="card neonCard">
      {event.showHeroGraphic !== false && (event.heroImageUrl || event.eventImageUrl) && <img className="eventDetailImage" src={event.heroImageUrl || event.eventImageUrl} alt={event.title} />}
      <h2>{event.venueName}</h2>
      {event.venueLocation && <p className="muted">{event.venueLocation}</p>}
      {event.description && <p>{event.description}</p>}
      {event.prizeSpecial && <p className="sparkLine">{event.prizeSpecial}</p>}
        {event.paidEvent && <p className="ticketLine">🎟️ {event.ticketPrice || "Ticketed event"}</p>}
      {event.sponsorName && <p><b>Sponsored by:</b> {event.sponsorName}</p>}
      {(event.prizeName || event.prizeValue) && <p><b>Prize:</b> {[event.prizeName, event.prizeValue].filter(Boolean).join(" • ")}</p>}
      {event.redemptionRules && <p className="microcopy">Rules: {event.redemptionRules}</p>}
      {event.expirationDate && <p className="microcopy">Expires: {event.expirationDate}</p>}
      {!isOnlineGameEvent(event) && <div className="eventStats">
        <span>{event.responseCounts?.interested || 0} interested</span>
        <span>{event.responseCounts?.going || 0} going</span>
      </div>}
      <div className="ctaRow">
        <Button disabled={eventUnavailable(event)} onClick={() => runEventPrimaryAction(event, respond)}>{eventPrimaryAction(event).label}</Button>
        <EventShareButton event={event} />
        <SocialWallButton event={event} />
      </div>
      {saved && <div className="successBanner">✅ {saved}</div>}
    </div>

    <div className="card qrMiniCard">
      <h2>Share this event</h2>
      <img src={qrApiUrl(eventUrl(event))} alt="Event QR" />
      <p className="qrUrl">{eventUrl(event)}</p>
    </div>

    <BackToHomeButton />
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
    <PublicBrandHeader />
    <div className="publicHero">
      <div className="brandMark">TONIGHT WITH BARFLY</div>
      <h1>Tonight & Featured Events</h1>
      <p className="tagline">Quick links for Instagram stories and last-minute promotion.</p>
      <div className="ctaRow"><Button onClick={() => window.location.href="/events"}>Full Calendar</Button><Button className="secondary" onClick={() => window.location.href="/qr/events"}>Events QR</Button></div>
    </div>
    {!data && <div className="card neonCard"><p>Loading events...</p></div>}
    {data && tonight.length === 0 && <div className="card neonCard"><p>No events listed for tonight yet.</p></div>}
    <div className="eventCardGrid">
      {tonight.map(event => <div className="card neonCard eventCard featuredEvent" key={event.occurrenceKey || event.id}>
        <span className="statusPill">{event.eventTypeLabel}</span>
        <h3>{event.title}</h3>
        <p className="sparkLine">{formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
        <p><b>{event.venueName}</b></p>
        <p className="muted">{event.prizeSpecial}</p>
        <div className="ctaRow"><Button onClick={() => openEventPrimaryAction(event)}>{eventPrimaryAction(event).label}</Button><Button className="secondary" onClick={() => window.location.href = event.publicPath}>Event Page</Button><EventShareButton event={event} /><SocialWallButton event={event} /></div>
      </div>)}
    </div>
    <BackToHomeButton />
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
    <PublicBrandHeader />
    <div className="publicHero">
      <div className="brandMark">BARFLY VENUE</div>
      <h1>{venueName}</h1>
      <p className="tagline">Upcoming Barfly Entertainment events at this venue.</p>
      <Button className="secondary" onClick={() => window.location.href="/events"}>All Events</Button>
    </div>
    <div className="eventCardGrid">
      {events.map(event => <div className="card neonCard eventCard" key={event.occurrenceKey || event.id}>
        <span className="statusPill">{event.eventTypeLabel}</span>
        <h3>{event.title}</h3>
        <p className="sparkLine">{event.dayLabel} • {formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
        <p className="muted">{event.prizeSpecial}</p>
        <div className="ctaRow"><Button onClick={() => openEventPrimaryAction(event)}>{eventPrimaryAction(event).label}</Button><Button className="secondary" onClick={() => window.location.href = event.publicPath}>Event Page</Button></div>
      </div>)}
    </div>
    <BackToHomeButton />
    <PublicNav active="events" />
  </div>;
}

function slugifyText(value) {
  return String(value || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}



function PlayOnlinePage() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API}/events`).then(res => res.json()).then(setData).catch(() => setData({ events: [] }));
  }, []);

  const events = (data?.events || []).filter(event => {
    const link = event.buttonLink || "";
    return link && (link.startsWith("http") || ["bingo", "trivia", "music_bingo", "mystery", "escape_room"].includes(event.eventType));
  });

  return <div className="screen publicScreen neonPublic eventsPage">
    <PublicBrandHeader />
    <div className="publicHero">
      <div className="brandMark">PLAY ONLINE</div>
      <h1>Play Barfly Games</h1>
      <p className="tagline">Quick links to bingo, trivia, mystery games, and online play pages.</p>
      <div className="ctaRow"><Button onClick={() => window.location.href="/events"}>All Events</Button><Button className="secondary" onClick={() => window.location.href="/qr/events"}>Events QR</Button></div>
    </div>
    {!data && <div className="card neonCard"><p>Loading online games...</p></div>}
    {data && events.length === 0 && <div className="card neonCard"><p>No online games listed yet.</p></div>}
    <div className="eventCardGrid">
      {events.map(event => <div className="card neonCard eventCard" key={event.occurrenceKey || event.id}>
        {event.eventImageUrl && <img className="eventThumb" src={event.eventImageUrl} alt={event.title} />}
        <div className="compact"><span className={eventUnavailable(event) ? "statusPill storageWarn" : "statusPill"}>{eventActionBadge(event)}</span><span className="statusPill">{event.eventTypeLabel || eventTypeCalendarLabel(event.eventType)}</span></div>
        {eventUnavailable(event) && <div className="eventStatusBanner">{eventStatusLabel(event.eventStatus)}</div>}
        <h3>{event.title}</h3>
        <p className="sparkLine">{event.venueName}</p>
        {event.prizeSpecial && <p className="microcopy">{event.prizeSpecial}</p>}
        {event.paidEvent && <p className="ticketLine">🎟️ {event.ticketPrice || "Ticketed event"}</p>}
        <div className="ctaRow">
          <Button disabled={eventUnavailable(event)} onClick={() => openEventPrimaryAction(event)}>{eventPrimaryAction(event).label}</Button>
          <EventShareButton event={event} />
        </div>
      </div>)}
    </div>
    <PublicNav active="play" />
  </div>;
}

function PosterGenerator() {
  const { parts } = useRoute();
  const slug = parts[1];
  const [data, setData] = React.useState(null);
  const [posterSize, setPosterSize] = React.useState("square");
  const settings = usePublicSettings();
  const event = data?.event || null;
  const template = posterTemplateFor(event);
  const overlayLayout = event?.posterOverlayLayout || template?.overlayLayout || "bottom_info_panel";
  const eventDateText = event ? `${event.dayLabel} • ${formatEventTime(event.startTime)}–${formatEventTime(event.endTime)}` : "";
  const badgeText = event?.paidEvent ? (event.ticketPrice || "Ticketed Event") : (event.prizeSpecial?.toLowerCase().includes("free") ? "Free to Play" : template?.badges?.[0] || "Hosted Event");

  React.useEffect(() => {
    fetch(`${API}/events/${slug}`).then(res => res.json()).then(setData).catch(() => setData({ error: "Event not found" }));
  }, [slug]);

  React.useEffect(() => {
    if (event?.id) trackEventMetric("poster_view", event);
  }, [event?.id]);

  if (!data) return <div className="screen publicScreen neonPublic"><p>Loading poster...</p></div>;
  if (data.error || !event) return <div className="screen publicScreen neonPublic"><div className="alert">{data.error || "Event not found"}</div><Button onClick={() => window.location.href="/events"}>Back to Events</Button></div>;

  const detailLines = [
    event.venueName,
    event.venueLocation,
    eventDateText
  ].filter(Boolean);

  return <div className="screen publicScreen neonPublic posterPage">
    <div className="row posterActions">
      <Button className={posterSize === "square" ? "" : "secondary"} onClick={() => setPosterSize("square")}>1080×1080</Button>
      <Button className={posterSize === "portrait" ? "" : "secondary"} onClick={() => setPosterSize("portrait")}>1080×1350</Button>
      <Button onClick={() => window.print()}>Print / Save</Button>
      <Button className="secondary" onClick={() => window.location.href = event.publicPath}>Event Page</Button>
      <Button className="secondary" onClick={() => copyEventCaption(event, settings)}>Copy Caption</Button>
    </div>

    <div className={`igPosterCanvas ${posterSize} template-${template?.slug || "game-night"} layout-${overlayLayout}`}>
      <div className="igPosterBg" style={template?.backgroundImageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.52)), url(${template.backgroundImageUrl})` } : undefined}>
        <div className="igPosterLogo">BARFLY SOCIAL</div>
        <div className="igPosterIconCloud">
          {(template?.icons || ["🎮","✨","🎱","❓"]).map((icon, index) => <span key={`${icon}-${index}`}>{icon}</span>)}
        </div>
      </div>

      <div className="igPosterOverlay">
        <div className="igBadgeRow">
          <span>{badgeText}</span>
          {event.sponsorName && <span>Sponsored by {event.sponsorName}</span>}
        </div>
        <h1>{event.title}</h1>
        <div className="igPosterDetails">
          {detailLines.map(line => <p key={line}>{line}</p>)}
        </div>
        {(event.prizeSpecial || event.prizeName || event.prizeValue) && <div className="igPosterSpecial">
          {event.prizeSpecial && <p>{event.prizeSpecial}</p>}
          {(event.prizeName || event.prizeValue) && <p>{[event.prizeName, event.prizeValue].filter(Boolean).join(" • ")}</p>}
        </div>}
        <div className="igPosterFooter">
          <div>
            <b>Hosted by Barfly Social</b>
            <span>{event.paidEvent ? "Buy tickets online" : "Free to play • Play for prizes"}</span>
          </div>
          <img src={qrApiUrl(eventUrl(event), 260)} alt="Event QR" />
        </div>
      </div>
    </div>

    <p className="microcopy posterTemplateNote">Template: {template?.name || "Game Night"} • Event information is generated as an overlay, not baked into the background.</p>
  </div>;
}



function BookingPage() {
  const settings = usePublicSettings();
  const [form, setForm] = React.useState({
    name: "",
    eventScope: "public",
    requestedDate: "",
    requestedTime: "",
    duration: "2 hours",
    contactPhone: "",
    contactEmail: "",
    budgetRange: "",
    notes: ""
  });
  const [saved, setSaved] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  function applyVenue(venueId) {
    const venue = venues.find(item => item.id === venueId);
    setForm(current => {
      if (!venue) return { ...current, venueId };
      return {
        ...current,
        venueId,
        venueName: venue.name || current.venueName,
        venueLocation: [venue.address, venue.city].filter(Boolean).join(", ") || current.venueLocation,
        venueLogoUrl: venue.logoUrl || current.venueLogoUrl,
        redemptionRules: venue.defaultPrizeRules || current.redemptionRules,
        buttonLink: venue.defaultPlayLink || current.buttonLink,
        description: current.description || venue.defaultEventNotes || ""
      };
    });
  }

  function applyTemplate(templateId) {
    const template = templates.find(item => item.id === templateId);
    setForm(current => {
      if (!template) return { ...current, templateId };
      return {
        ...current,
        templateId,
        posterTemplateSlug: current.posterTemplateSlug || posterTemplateFor(template)?.slug || "game-night",
        posterOverlayLayout: current.posterOverlayLayout || posterTemplateFor(template)?.overlayLayout || "bottom_info_panel",
        heroVariant: current.heroVariant || defaultHeroVariantForEvent(template.eventType, template.title || template.customEventType),
        title: template.title || current.title,
        eventType: template.eventType || current.eventType,
        customEventType: template.customEventType || current.customEventType || "",
        description: template.description || current.description,
        prizeSpecial: template.prizeSpecial || current.prizeSpecial,
        buttonText: template.buttonText || current.buttonText,
        buttonLink: template.buttonLink || current.buttonLink,
        onlineOnly: !!template.onlineOnly,
        eventStatus: template.eventStatus || current.eventStatus,
        redemptionRules: template.redemptionRules || current.redemptionRules,
        eventImageUrl: template.eventImageUrl || current.eventImageUrl
      };
    });
  }

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function submitBooking() {
    setError("");
    setSaved("");

    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        ...form,
        meetMingleMaxRsvps: Number(form.meetMingleMaxRsvps) || 60,
        meetMingleMaxCheckins: Number(form.meetMingleMaxCheckins) || 60
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      setError(data.error || "Could not send request.");
      return;
    }

    setSaved("Request received. We’ll follow up soon to confirm details.");
    setSubmitted(true);
    setForm({
      name: "",
      eventScope: "public",
      requestedDate: "",
      requestedTime: "",
      duration: "2 hours",
      contactPhone: "",
      contactEmail: "",
      budgetRange: "",
      notes: ""
    });
  }

  return <div className="screen publicScreen neonPublic bookingPage">
    <PublicBrandHeader />
    <div className="publicHero compactHero">
      <div className="brandMark">REQUEST BARFLY ENTERTAINMENT</div>
      <h1>Request an Event</h1>
      <p className="tagline">Tell us what kind of event you want, and we’ll follow up to confirm availability, pricing, and details.</p>
    </div>


    {submitted && <div className="card neonCard bookingThanksCard">
      <div className="brandMark">THANK YOU</div>
      <h2>Request received.</h2>
      <p>We’ll follow up soon to confirm details.</p>
      <div className="ctaRow singleAction">
        <Button onClick={() => window.location.href = "/events"}>Back to Events</Button>
      </div>
    </div>}

    {!submitted && <div className="card neonCard bookingCard">
      <label>Name</label>
      <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name or business name" />

      <label>Type of Event</label>
      <select value={form.eventScope} onChange={e => update("eventScope", e.target.value)}>
        <option value="public">Public Event</option>
        <option value="private">Private Event</option>
        <option value="demo">Demo / Consultation Request</option>
      </select>

      <div className="twoCol">
        <div>
          <label>Date</label>
          <input type="date" value={form.requestedDate} onChange={e => update("requestedDate", e.target.value)} />
        </div>
        <div>
          <label>Time</label>
          <input type="time" value={form.requestedTime} onChange={e => update("requestedTime", e.target.value)} />
        </div>
      </div>

      <label>Duration</label>
      <select value={form.duration} onChange={e => update("duration", e.target.value)}>
        <option>1 hour</option>
        <option>1.5 hours</option>
        <option>2 hours</option>
        <option>3 hours</option>
        <option>4 hours</option>
        <option>Custom</option>
      </select>

      <div className="twoCol">
        <div>
          <label>Contact Number</label>
          <input value={form.contactPhone} onChange={e => update("contactPhone", e.target.value)} placeholder="Phone number" />
        </div>
        <div>
          <label>Contact Email</label>
          <input type="email" value={form.contactEmail} onChange={e => update("contactEmail", e.target.value)} placeholder="Email address" />
        </div>
      </div>

      <label>Budget Range <span className="muted">optional</span></label>
      <input value={form.budgetRange} onChange={e => update("budgetRange", e.target.value)} placeholder="$250–$500, under $1,000, not sure yet" />

      <label>Notes</label>
      <textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Venue, estimated crowd size, event idea, or anything else we should know." />

      {error && <div className="alert">{error}</div>}
      {saved && <div className="successBanner">✅ {saved}</div>}

      <div className="ctaRow">
        <Button onClick={submitBooking}>Send Request</Button>
        <Button className="secondary" onClick={() => window.location.href = "/events"}>View Events Calendar</Button>
      </div>

    </div>}

    <BackToHomeButton />
    <PublicNav active="events" />
  </div>;
}




function HostSection({ id, title, subtitle, children }) {
  const [open, setOpen] = React.useState(false);
  return <details id={id} className="hostSection" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>
      <div>
        <span className="brandMark">{title}</span>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <b>{open ? "Close" : "Open"}</b>
    </summary>
    <div className="hostSectionBody">{children}</div>
  </details>;
}

function HostQuickActions() {
  function openSection(sectionId, targetId) {
    const section = document.getElementById(sectionId);
    if (section && section.tagName.toLowerCase() === "details") {
      section.open = true;
    }
    setTimeout(() => {
      const target = document.getElementById(targetId || sectionId);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  return <div className="card glowCard hostQuickActions guidedHostFlows" id="host-quick-actions">
    <div className="brandMark">GUIDED HOST FLOWS</div>
    <h2>What do you want to do?</h2>
    <p className="microcopy">Choose an action. The dashboard opens the correct section and shows the next steps.</p>
    <div className="guidedActionGrid">
      <button type="button" onClick={() => openSection("host-section-events", "host-events")}><b>➕ Create Event</b><span>One guided flow for event type, venue, hero, Meet & Mingle, preview, and save.</span></button>
      <button type="button" onClick={() => openSection("host-section-events", "host-event-types")}><b>🏷️ Manage Event Types</b><span>Add custom event types for the builder.</span></button>
      <button type="button" onClick={() => openSection("host-section-gameplay", "create-social-session")}><b>✨ Quick Social Mixer</b><span>Create a standalone Meet & Mingle session.</span></button>
      <button type="button" onClick={() => openSection("host-section-marketing", "host-qr-tools")}><b>▣ Generate QR Code</b><span>Events, demo, Meet & Mingle, check-in, co-host, or request page.</span></button>
      <button type="button" onClick={() => openSection("host-section-settings", "host-settings-panel")}><b>⚙️ Update Settings</b><span>Contact info, public links, promo popup, disclaimers.</span></button>
      <button type="button" onClick={() => window.location.href = "/cohost"}><b>👥 Co-Host Dashboard</b><span>Run the live social mixer without full admin tools.</span></button>
    </div>
  </div>;
}

function HostVenueManager() {
  const blank = {
    name: "",
    address: "",
    city: "",
    logoUrl: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    defaultPrizeRules: "",
    defaultPlayLink: "",
    defaultEventNotes: ""
  };
  const [venues, setVenues] = React.useState([]);
  const [form, setForm] = React.useState(blank);
  const [editingId, setEditingId] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  async function loadVenues() {
    const res = await hostFetch(`${API}/host/venues`);
    const data = await res.json().catch(() => ({ venues: [] }));
    setVenues(data.venues || []);
  }

  React.useEffect(() => { loadVenues(); }, []);

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function editVenue(venue) {
    setEditingId(venue.id);
    setForm({ ...blank, ...venue });
  }

  async function saveVenue() {
    const wasEditing = Boolean(editingId);
    const url = editingId ? `${API}/host/venues/${editingId}` : `${API}/host/venues`;
    const res = await hostFetch(url, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(form)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not save venue.");
    setEditingId("");
    setForm(blank);
    setVenues(data.venues || []);
    setSaveMessage(wasEditing ? "Venue updated successfully." : "Venue saved successfully.");
    setTimeout(() => setSaveMessage(""), 2200);
  }

  async function deleteVenue(venue) {
    if (!confirm(`Delete this venue?\n\n${venue.name || "Unnamed venue"}`)) return;
    const res = await hostFetch(`${API}/host/venues/${venue.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not delete venue.");
    setVenues(data.venues || []);
    setSaveMessage("Venue deleted successfully.");
    setTimeout(() => setSaveMessage(""), 2200);
  }

  return <div className="card glowCard hostVenueManager" id="host-venues">
    <div className="brandMark">VENUE PARTNER MANAGER</div>
    <h2>{editingId ? "Edit Venue" : "Add Venue Partner"}</h2>
    {saveMessage && <div className="successBanner">✅ {saveMessage}</div>}
    <div className="twoCol">
      <div><label>Venue Name</label><input value={form.name} onChange={e => update("name", e.target.value)} placeholder="El Paso Denham Springs" /></div>
      <div><label>City</label><input value={form.city} onChange={e => update("city", e.target.value)} placeholder="Denham Springs, LA" /></div>
      <div><label>Address</label><input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Street address" /></div>
      <div><label>Logo URL</label><input value={form.logoUrl} onChange={e => update("logoUrl", e.target.value)} placeholder="https://..." /><p className="microcopy imageHelp">Use this venue logo when events are hosted at this location.</p></div>
      <div><label>Contact Person</label><input value={form.contactPerson} onChange={e => update("contactPerson", e.target.value)} /></div>
      <div><label>Contact Phone</label><input value={form.contactPhone} onChange={e => update("contactPhone", e.target.value)} /></div>
      <div><label>Contact Email</label><input value={form.contactEmail} onChange={e => update("contactEmail", e.target.value)} /></div>
      <div><label>Default Play Link</label><input value={form.defaultPlayLink} onChange={e => update("defaultPlayLink", e.target.value)} placeholder="https://games.barfly.social/..." /></div>
    </div>
    <label>Default Prize Rules</label>
    <input value={form.defaultPrizeRules} onChange={e => update("defaultPrizeRules", e.target.value)} placeholder="Free to play. Play for prizes." />
    <label>Default Event Notes</label>
    <textarea value={form.defaultEventNotes} onChange={e => update("defaultEventNotes", e.target.value)} />
    <div className="ctaRow">
      <Button onClick={saveVenue}>{editingId ? "Update Venue" : "Save Venue"}</Button>
      {editingId && <Button className="secondary" onClick={() => { setEditingId(""); setForm(blank); }}>Cancel Edit</Button>}
    </div>

    <h3>Saved Venues</h3>
    {venues.length === 0 && <p className="muted">No venue partners saved yet.</p>}
    {venues.map(venue => <div className="rsvpRow" key={venue.id}>
      <div>
        <b>{venue.name}</b>
        <p className="muted">{[venue.address, venue.city].filter(Boolean).join(" • ")}</p>
        <p className="microcopy">Contact: {venue.contactPerson || "—"} • {venue.contactPhone || "—"} • {venue.contactEmail || "—"}</p>
      </div>
      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => editVenue(venue)}>Edit</Button>
        <Button className="danger" onClick={() => deleteVenue(venue)}>Delete</Button>
      </div>
    </div>)}
  </div>;
}

function HostTemplateManager() {
  const blank = {
    name: "",
    eventType: "special",
    customEventType: "",
    title: "",
    description: "",
    prizeSpecial: "",
    buttonText: "More Info",
    buttonLink: "/events",
    onlineOnly: false,
    eventStatus: "scheduled",
    redemptionRules: "",
    eventImageUrl: ""
  };
  const [templates, setTemplates] = React.useState([]);
  const [heroTemplates, setHeroTemplates] = React.useState([]);
  const [form, setForm] = React.useState(blank);
  const [editingId, setEditingId] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  async function loadTemplates() {
    const res = await hostFetch(`${API}/host/event-templates`);
    const data = await res.json().catch(() => ({ templates: [] }));
    setTemplates(data.templates || []);
  }

  React.useEffect(() => { loadTemplates(); }, []);

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function editTemplate(template) {
    setEditingId(template.id);
    setForm({ ...blank, ...template });
  }

  async function saveTemplate() {
    const wasEditing = Boolean(editingId);
    const url = editingId ? `${API}/host/event-templates/${editingId}` : `${API}/host/event-templates`;
    const res = await hostFetch(url, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(form)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not save template.");
    setEditingId("");
    setForm(blank);
    setTemplates(data.templates || []);
    setSaveMessage(wasEditing ? "Event template updated successfully." : "Event template saved successfully.");
    setTimeout(() => setSaveMessage(""), 2200);
  }

  async function deleteTemplate(template) {
    if (!confirm(`Delete this saved quick setup?\n\n${template.name || "Unnamed setup"}`)) return;
    const res = await hostFetch(`${API}/host/event-templates/${template.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not delete template.");
    setTemplates(data.templates || []);
    setSaveMessage("Event template deleted successfully.");
    setTimeout(() => setSaveMessage(""), 2200);
  }

  return <div className="card glowCard hostTemplateManager" id="host-templates">
    <div className="brandMark">EVENT TEMPLATES</div>
    <h2>{editingId ? "Edit Template" : "Create Event Template"}</h2>
    {saveMessage && <div className="successBanner">✅ {saveMessage}</div>}
    <div className="twoCol">
      <div><label>Template Name</label><input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Trivia Night" /></div>
      <div><label>Event Type</label><select value={form.eventType} onChange={e => update("eventType", e.target.value)}>{calendarEventTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>
      <div><label>Display Name</label><input value={form.customEventType} onChange={e => update("customEventType", e.target.value)} placeholder="Digital Mystery, 80’s Trivia, etc." /></div>
      <div><label>Default Title</label><input value={form.title} onChange={e => update("title", e.target.value)} /></div>
      <div><label>Button Text</label><input value={form.buttonText} onChange={e => update("buttonText", e.target.value)} /></div>
      <div><label>Button Link</label><input value={form.buttonLink} onChange={e => update("buttonLink", e.target.value)} /></div>
      <div><label>Event Image URL</label><input value={form.eventImageUrl} onChange={e => update("eventImageUrl", e.target.value)} /><p className="microcopy imageHelp">Default flyer/hero image used when this template is selected.</p></div>
    </div>
    <label>Description</label>
    <textarea value={form.description} onChange={e => update("description", e.target.value)} />
    <label>Prize or Special</label>
    <input value={form.prizeSpecial} onChange={e => update("prizeSpecial", e.target.value)} />
    <label>Redemption Rules</label>
    <input value={form.redemptionRules} onChange={e => update("redemptionRules", e.target.value)} />
    <label className="checkRow"><input type="checkbox" checked={form.onlineOnly} onChange={e => update("onlineOnly", e.target.checked)} /><span>Online Only</span></label>
    <div className="ctaRow">
      <Button onClick={saveTemplate}>{editingId ? "Update Template" : "Save Template"}</Button>
      {editingId && <Button className="secondary" onClick={() => { setEditingId(""); setForm(blank); }}>Cancel Edit</Button>}
    </div>

    <h3>Saved Templates</h3>
    {templates.length === 0 && <p className="muted">No templates saved yet.</p>}
    {templates.map(template => <div className="rsvpRow" key={template.id}>
      <div>
        <b>{template.name}</b>
        <p className="muted">{template.customEventType || eventTypeCalendarLabel(template.eventType)} • {template.buttonText} → {template.buttonLink}</p>
        <p className="microcopy">{template.description}</p>
      </div>
      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => editTemplate(template)}>Edit</Button>
        <Button className="danger" onClick={() => deleteTemplate(template)}>Delete</Button>
      </div>
    </div>)}
  </div>;
}



function hostCalendarDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function hostCalendarMonthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function hostBuildCalendarDays(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function hostReadableDate(dateKey) {
  if (!dateKey) return "";
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function bookingStatusClass(status) {
  if (status === "booked" || status === "confirmed") return "storageOk";
  if (status === "declined") return "storageWarn";
  if (status === "contacted") return "storageInfo";
  return "storageNew";
}

function HostEventCalendar() {
  const [events, setEvents] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  async function loadEvents() {
    const res = await hostFetch(`${API}/host/events`);
    const data = await res.json().catch(() => ({ events: [] }));
    setEvents(data.events || []);
  }

  React.useEffect(() => {
    loadEvents();
    const t = setInterval(loadEvents, 10000);
    return () => clearInterval(t);
  }, []);

  function selectDate(day) {
    const key = hostCalendarDateKey(day);
    setSelectedDate(key);
    setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
  }

  function selectToday() {
    const now = new Date();
    setSelectedDate(hostCalendarDateKey(now));
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  const datesWithEvents = new Set(events.map(event => event.dateLabel).filter(Boolean));
  const selectedEvents = events.filter(event => event.dateLabel === selectedDate);
  const days = hostBuildCalendarDays(month);

  return <div className="card glowCard hostCalendarPanel" id="host-event-calendar">
    <div className="brandMark">HOST EVENT CALENDAR</div>
    <h2>Scheduled Events by Date</h2>
    <p className="muted">Tap a date to see events scheduled for that day.</p>

    <div className="hostCalendarHeader">
      <Button className="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</Button>
      <h3>{hostCalendarMonthLabel(month)}</h3>
      <Button className="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</Button>
    </div>

    <div className="calendarGrid weekdayGrid">
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => <div key={day} className="weekdayCell">{day}</div>)}
    </div>
    <div className="calendarGrid dateGrid hostDateGrid">
      {days.map(day => {
        const key = hostCalendarDateKey(day);
        const inMonth = day.getMonth() === month.getMonth();
        const hasEvents = datesWithEvents.has(key);
        const selected = key === selectedDate;
        return <button key={key} className={[
          "calendarDate",
          inMonth ? "" : "fadedDate",
          selected ? "selectedDate" : "",
          hasEvents ? "hasEvents" : ""
        ].filter(Boolean).join(" ")} onClick={() => selectDate(day)}>
          <span>{day.getDate()}</span>
          {hasEvents && <i />}
        </button>;
      })}
    </div>

    <div className="ctaRow calendarControls">
      <Button className="secondary" onClick={selectToday}>Today</Button>
      <Button className="secondary" onClick={() => document.getElementById("host-events")?.scrollIntoView({ behavior: "smooth" })}>Add / Edit Events</Button>
    </div>

    <div className="selectedDateHeader">
      <div className="brandMark">SELECTED DATE</div>
      <h3>{hostReadableDate(selectedDate)}</h3>
    </div>

    {selectedEvents.length === 0 && <div className="emptyDayCard"><p className="muted">No events scheduled for this date.</p></div>}
    {selectedEvents.map(event => <div className="rsvpRow hostCalendarRow" key={event.occurrenceKey || event.id}>
      <div>
        <div className="compact">
          <b>{event.title}</b>
          <span className={eventUnavailable(event) ? "statusPill storageWarn" : "statusPill"}>{eventStatusLabel(event.eventStatus)}</span>
          <span className="statusPill">{event.eventTypeLabel || eventTypeCalendarLabel(event.eventType)}</span>
        </div>
        <p className="muted">{formatEventTime(event.startTime)}–{formatEventTime(event.endTime)} • {event.venueName}</p>
        {event.venueLocation && <p className="microcopy">{event.venueLocation}</p>}
        <p className="microcopy">Primary: {event.buttonText || "More Info"} → {event.buttonLink || event.publicPath}</p>
      </div>
      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => window.location.href = event.publicPath}>Event Page</Button>
        <Button className="secondary" onClick={() => window.location.href = event.qrPath || `/qr/event/${event.slug || event.id}`}>QR</Button>
        <Button className="secondary" onClick={() => document.getElementById("host-events")?.scrollIntoView({ behavior: "smooth" })}>Edit</Button>
      </div>
    </div>)}
  </div>;
}

function HostBookingCalendar() {
  const [bookings, setBookings] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  async function loadBookings() {
    const res = await hostFetch(`${API}/host/bookings`);
    const data = await res.json().catch(() => ({ bookings: [] }));
    setBookings(data.bookings || []);
  }

  React.useEffect(() => {
    loadBookings();
    const t = setInterval(loadBookings, 10000);
    return () => clearInterval(t);
  }, []);

  async function updateBookingStatus(booking, status) {
    const res = await hostFetch(`${API}/host/bookings/${booking.id}/status`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not update booking.");
    loadBookings();
  }

  function selectDate(day) {
    const key = hostCalendarDateKey(day);
    setSelectedDate(key);
    setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
  }

  function selectToday() {
    const now = new Date();
    setSelectedDate(hostCalendarDateKey(now));
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  const datesWithBookings = new Set(bookings.map(booking => booking.requestedDate).filter(Boolean));
  const selectedBookings = bookings.filter(booking => booking.requestedDate === selectedDate);
  const days = hostBuildCalendarDays(month);

  return <div className="card glowCard hostCalendarPanel" id="host-booking-calendar">
    <div className="brandMark">HOST BOOKING CALENDAR</div>
    <h2>Booking Requests by Date</h2>
    <p className="muted">Tap a date to see requested bookings and demos for that day.</p>

    <div className="bookingLegend">
      <span><i className="legendNew" /> New</span>
      <span><i className="legendContacted" /> Contacted</span>
      <span><i className="legendBooked" /> Booked</span>
      <span><i className="legendDeclined" /> Declined</span>
    </div>

    <div className="hostCalendarHeader">
      <Button className="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</Button>
      <h3>{hostCalendarMonthLabel(month)}</h3>
      <Button className="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</Button>
    </div>

    <div className="calendarGrid weekdayGrid">
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => <div key={day} className="weekdayCell">{day}</div>)}
    </div>
    <div className="calendarGrid dateGrid hostDateGrid">
      {days.map(day => {
        const key = hostCalendarDateKey(day);
        const inMonth = day.getMonth() === month.getMonth();
        const dayBookings = bookings.filter(booking => booking.requestedDate === key);
        const hasBookings = datesWithBookings.has(key);
        const selected = key === selectedDate;
        const hasBooked = dayBookings.some(booking => booking.status === "booked");
        const hasDeclined = dayBookings.some(booking => booking.status === "declined");
        const hasContacted = dayBookings.some(booking => booking.status === "contacted");
        return <button key={key} className={[
          "calendarDate",
          "bookingDate",
          inMonth ? "" : "fadedDate",
          selected ? "selectedDate" : "",
          hasBookings ? "hasEvents" : "",
          hasBooked ? "bookingBooked" : hasDeclined ? "bookingDeclined" : hasContacted ? "bookingContacted" : hasBookings ? "bookingNew" : ""
        ].filter(Boolean).join(" ")} onClick={() => selectDate(day)}>
          <span>{day.getDate()}</span>
          {hasBookings && <i />}
        </button>;
      })}
    </div>

    <div className="ctaRow calendarControls">
      <Button className="secondary" onClick={selectToday}>Today</Button>
      <Button className="secondary" onClick={() => document.getElementById("host-bookings")?.scrollIntoView({ behavior: "smooth" })}>Booking List</Button>
      <Button className="secondary" onClick={() => window.location.href = "/book"}>Public Booking Page</Button>
    </div>

    <div className="selectedDateHeader">
      <div className="brandMark">SELECTED DATE</div>
      <h3>{hostReadableDate(selectedDate)}</h3>
    </div>

    {selectedBookings.length === 0 && <div className="emptyDayCard"><p className="muted">No booking requests for this date.</p></div>}
    {selectedBookings.map(booking => <div className="rsvpRow hostCalendarRow" key={booking.id}>
      <div>
        <div className="compact">
          <b>{booking.name}</b>
          <span className={`statusPill ${bookingStatusClass(booking.status)}`}>{booking.status}</span>
          <span className="statusPill">{booking.eventScope === "private" ? "Private Event" : booking.eventScope === "demo" ? "Book Demo" : "Public Event"}</span>
        </div>
        <p className="muted">{booking.requestedTime} • {booking.duration}</p>
        <p className="microcopy">Phone: {booking.contactPhone || "—"} • Email: {booking.contactEmail || "—"}</p>
        {booking.notes && <p className="microcopy">Notes: {booking.notes}</p>}
      </div>
      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => updateBookingStatus(booking, "contacted")}>Contacted</Button>
        <Button className="secondary" onClick={() => updateBookingStatus(booking, "booked")}>Booked</Button>
        <Button className="warning" onClick={() => updateBookingStatus(booking, "declined")}>Declined</Button>
      </div>
    </div>)}
  </div>;
}


function HostAnalyticsDashboard() {
  const [analytics, setAnalytics] = React.useState(null);

  async function loadAnalytics() {
    const res = await hostFetch(`${API}/host/analytics`);
    const data = await res.json().catch(() => ({ totals: {}, byEvent: [] }));
    setAnalytics(data);
  }

  async function resetAnalytics() {
    const ok = confirm("Reset analytics? This will erase page views, QR scans, button clicks, poster views, caption copies, and booking analytics counts. Events and booking requests will stay.");
    if (!ok) return;

    const res = await hostFetch(`${API}/host/analytics/reset`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not reset analytics.");
    setAnalytics(data.analytics || { totals: {}, byEvent: [] });
    alert(`Analytics reset. Cleared ${data.clearedCount || 0} analytics record${(data.clearedCount || 0) === 1 ? "" : "s"}.`);
  }

  React.useEffect(() => {
    loadAnalytics();
    const t = setInterval(loadAnalytics, 10000);
    return () => clearInterval(t);
  }, []);

  const totals = analytics?.totals || {};
  const byEvent = analytics?.byEvent || [];

  return <div className="card glowCard analyticsDashboard" id="host-analytics">
    <div className="brandMark">EVENT ANALYTICS</div>
    <h2>Marketing Activity</h2>
    <div className="ctaRow analyticsActions">
      <Button className="danger" onClick={resetAnalytics}>Reset Analytics</Button>
    </div>
    <div className="mockDashboard">
      <div><span>Page Views</span><b>{totals.page_view || 0}</b></div>
      <div><span>QR Scans</span><b>{totals.qr_scan || 0}</b></div>
      <div><span>Button Clicks</span><b>{totals.primary_click || 0}</b></div>
      <div><span>Poster Views</span><b>{totals.poster_view || 0}</b></div>
      <div><span>Caption Copies</span><b>{totals.caption_copy || 0}</b></div>
      <div><span>Bookings</span><b>{totals.booking_request || 0}</b></div>
    </div>

    <h3>Top Event Activity</h3>
    {byEvent.length === 0 && <p className="muted">No event activity yet.</p>}
    {byEvent.slice(0, 8).map(event => <div className="rsvpRow" key={event.eventId}>
      <div>
        <b>{event.title}</b>
        <p className="muted">{event.venueName || "No venue listed"}</p>
        <p className="microcopy">Views {event.page_view} • Clicks {event.primary_click} • QR {event.qr_scan} • Posters {event.poster_view} • Captions {event.caption_copy} • Interested {event.interested} • Going {event.going}</p>
      </div>
    </div>)}
  </div>;
}


function HostBookingsPanel() {
  const [bookings, setBookings] = React.useState([]);

  async function loadBookings() {
    const res = await hostFetch(`${API}/host/bookings`);
    const data = await res.json().catch(() => ({ bookings: [] }));
    setBookings(data.bookings || []);
  }

  React.useEffect(() => {
    loadBookings();
    const t = setInterval(loadBookings, 8000);
    return () => clearInterval(t);
  }, []);

  async function updateBookingStatus(booking, status) {
    const res = await hostFetch(`${API}/host/bookings/${booking.id}/status`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not update booking.");
    loadBookings();
  }

  async function updateBookingPayment(booking, patch) {
    const updated = { ...booking, ...patch };
    const res = await hostFetch(`${API}/host/bookings/${booking.id}/payment`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(updated)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not update booking payment.");
    setBookings(current => current.map(item => item.id === booking.id ? (data.booking || updated) : item));
  }

  async function deleteBooking(booking) {
    if (!confirm(`Delete booking request from ${booking.name}?`)) return;
    const res = await hostFetch(`${API}/host/bookings/${booking.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not delete booking.");
    alert("Booking request deleted successfully.");
    loadBookings();
  }

  async function exportBookings() {
    const res = await hostFetch(`${API}/host/bookings/export`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barfly-booking-requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const statusClass = status => status === "booked" ? "storageOk" : status === "declined" ? "storageWarn" : "";

  return <div className="card glowCard hostBookingsPanel" id="host-bookings">
    <div className="brandMark">BOOKING REQUESTS</div>
    <h2>Event Booking Requests</h2>
    <p className="muted">Requests submitted from `/book` appear here.</p>
    <div className="ctaRow"><Button className="secondary" onClick={exportBookings}>Export Booking CSV</Button></div>
    {bookings.length === 0 && <p className="muted">No booking requests yet.</p>}
    {bookings.map(booking => <div className="rsvpRow bookingRequestRow" key={booking.id}>
      <div>
        <div className="compact"><b>{booking.name}</b><span className={`statusPill ${statusClass(booking.status)}`}>{booking.status}</span></div>
        <p className="muted">{booking.eventScope === "private" ? "Private Event" : booking.eventScope === "demo" ? "Book Demo" : "Public Event"} • {booking.requestedDate} at {booking.requestedTime} • {booking.duration}</p>
        <p className="microcopy">Phone: {booking.contactPhone || "—"} • Email: {booking.contactEmail || "—"}</p>
        {booking.notes && <p className="microcopy">Notes: {booking.notes}</p>}
        {booking.budgetRange && <p className="microcopy">Budget Range: {booking.budgetRange}</p>}
        <div className="bookingPaymentBox">
          <div className="brandMark">PAYMENT / INVOICE</div>
          <div className="twoCol">
            <div><label>Estimated Price</label><input value={booking.estimatedPrice || ""} onChange={e => updateBookingPayment(booking, { estimatedPrice: e.target.value })} placeholder="$300" /></div>
            <div><label>Deposit Required</label><input value={booking.depositRequired || ""} onChange={e => updateBookingPayment(booking, { depositRequired: e.target.value })} placeholder="$100" /></div>
            <div><label>Deposit Paid</label><input value={booking.depositPaid || ""} onChange={e => updateBookingPayment(booking, { depositPaid: e.target.value })} placeholder="$0 / $100" /></div>
            <div><label>Balance Due</label><input value={booking.balanceDue || ""} onChange={e => updateBookingPayment(booking, { balanceDue: e.target.value })} placeholder="$200" /></div>
            <div><label>Invoice Status</label><select value={booking.invoiceStatus || "not_sent"} onChange={e => updateBookingPayment(booking, { invoiceStatus: e.target.value })}>
              <option value="not_sent">Not Sent</option>
              <option value="sent">Sent</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select></div>
            <div><label>Payment Link</label><input value={booking.paymentLink || ""} onChange={e => updateBookingPayment(booking, { paymentLink: e.target.value })} placeholder="Invoice or payment link" /></div>
          </div>
          <label>Payment Notes</label>
          <input value={booking.paymentNotes || ""} onChange={e => updateBookingPayment(booking, { paymentNotes: e.target.value })} placeholder="Deposit due date, invoice notes, special terms" />
        </div>
        <p className="microcopy">Submitted: {new Date(booking.createdAt).toLocaleString()}</p>
      </div>
      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => updateBookingStatus(booking, "contacted")}>Contacted</Button>
        <Button className="secondary" onClick={() => updateBookingStatus(booking, "booked")}>Booked</Button>
        <Button className="warning" onClick={() => updateBookingStatus(booking, "declined")}>Declined</Button>
        <Button className="danger" onClick={() => deleteBooking(booking)}>Delete</Button>
      </div>
    </div>)}
  </div>;
}




function BackToHomeButton({ label = "Back to Home" }) {
  return <div className="backHomeRow bottomBackHomeRow">
    <Button className="secondary backHomeButton fullWidthBackHomeButton" onClick={() => window.location.href = "/home"}>← {label}</Button>
  </div>;
}

function HomePage() {
  const settings = usePublicSettings();
  const contactHref = emailLink(settings?.businessEmail || BUSINESS_EMAIL);
  const instagramHref = normalizeExternalUrl(settings?.instagramUrl || settings?.instagramHandle || BUSINESS_INSTAGRAM_URL);
  const karaokeHref = normalizeExternalUrl(settings?.karaokeUrl || "");
  const jobsHref = normalizeExternalUrl(settings?.jobsUrl || "");
  const gameTools = globalIframeTools(settings);
  const [pendingTile, setPendingTile] = React.useState(null);
  const tiles = [
    { label: "Events", icon: "📅", href: "/events", text: "See what is happening." },
    { label: "Social Wall", icon: "📸", href: "/social-wall", text: "Photos and social feed." },
    { label: "Barfly TV", icon: "📺", href: "/barfly-tv", text: "Video and live content." },
    { label: "My RSVP", icon: "💌", href: "/my-rsvp", text: "View, change, check in, cancel." },
    { label: "Contact", icon: "✉️", href: contactHref, text: "Email Barfly Social." },
    { label: "Instagram", icon: "📱", href: instagramHref, text: "Open Instagram." },
    { label: "Karaoke", icon: "🎤", href: karaokeHref ? "/game/karaoke" : "", text: "Open Karaoke." },
    { label: "Jobs", icon: "💼", href: jobsHref, text: "Open Jobs." },
    ...gameTools.map(tool => ({
      label: tool.label,
      icon: tool.icon,
      href: `/game/${tool.key}`,
      text: `Open ${tool.label}`
    }))
  ].filter(tile => tile.href);

  function openTile(tile) {
    if (!tile?.href) return;
    if (settings?.appIconPopupActive) {
      setPendingTile(tile);
      return;
    }
    window.location.href = tile.href;
  }

  function continuePendingTile() {
    if (!pendingTile?.href) return setPendingTile(null);
    window.location.href = pendingTile.href;
  }

  return <div className="screen publicScreen neonPublic homeLauncherPage">
    <PublicBrandHeader />
    <div className="homeLauncherHero">
      <div className="brandMark">BARFLY SOCIAL</div>
      <h1>Meet. Mingle. Play.</h1>
      <p className="tagline">Choose where you want to go.</p>
    </div>

    <div className="appIconGrid">
      {tiles.map(tile => <button type="button" key={tile.label} className="appIconTile homeActionTile" onClick={() => openTile(tile)}>
        <span className="appIconEmoji">{tile.icon}</span>
        <b>{tile.label}</b>
        <small>{tile.text}</small>
      </button>)}
    </div>

    {pendingTile && <div className="appIconPopupBackdrop" role="dialog" aria-modal="true">
      <div className="appIconPopupCard">
        {settings?.appIconPopupImageUrl && <img src={settings.appIconPopupImageUrl} alt="" />}
        <div className="brandMark">BARFLY SOCIAL</div>
        <h2>{settings?.appIconPopupTitle || pendingTile.label}</h2>
        {settings?.appIconPopupText && <p>{settings.appIconPopupText}</p>}
        <div className="ctaRow">
          <Button onClick={continuePendingTile}>{settings?.appIconPopupButtonText || "Continue"}</Button>
          <Button className="secondary" onClick={() => setPendingTile(null)}>Cancel</Button>
        </div>
      </div>
    </div>}
  </div>;
}


function GameIframePage() {
  const { parts } = useRoute();
  const gameKey = parts[1] || "";
  const settings = usePublicSettings();
  const karaokeTool = {
    key: "karaoke",
    label: "Karaoke",
    icon: "🎤",
    url: normalizeExternalUrl(settings?.karaokeUrl || ""),
    title: "Barfly Karaoke"
  };
  const tools = [
    ...globalIframeTools(settings),
    ...(karaokeTool.url ? [karaokeTool] : [])
  ];
  const tool = tools.find(item => item.key === gameKey);

  return <div className="screen publicScreen neonPublic gameIframePage focusedIframePage">
    {tool ? <div className="autoFitIframeCard gameAutoFitIframeCard">
      <iframe
        className="autoFitIframe"
        src={tool.url}
        title={tool.title || tool.label}
        loading="lazy"
        scrolling="no"
        allow="camera; microphone; clipboard-write; fullscreen"
      />
    </div> : <div className="card neonCard emptyGamesPanel">
      <h2>Game link not available.</h2>
      <p className="muted">Add this game URL in /host → Games / Iframes, then return to Home.</p>
    </div>}

    <BackToHomeButton />
  </div>;
}


function BarflyTVPage() {
  const settings = usePublicSettings();
  const tvUrl = normalizeExternalUrl(settings?.barflyTvIframeUrl || "");
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API}/events`).then(res => res.json()).then(setData).catch(() => setData({ events: [] }));
  }, []);

  const tvEvents = (data?.events || []).filter(event => {
    const text = [
      event.title,
      event.eventTypeLabel,
      event.customEventType,
      event.description,
      event.venueName
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes("barfly tv") || text.includes("barflytv") || text.includes("tv event") || text.includes("live stream");
  }).slice(0, 8);

  return <div className="screen publicScreen neonPublic barflyTvPage focusedIframePage">
    {tvUrl && <div className="autoFitIframeCard tvFrameCard">
      <iframe className="autoFitIframe" src={tvUrl} title="Barfly TV" loading="lazy" scrolling="no" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" />
    </div>}

    <div className="card neonCard barflyTvScheduleCard compactTvScheduleCard">
      {tvEvents.length > 0 ? <>
        <div className="tvScheduleList">
          {tvEvents.map(event => <div className="rsvpRow" key={event.occurrenceKey || event.id}>
            <div>
              <b>{event.title}</b>
              <p className="muted">{event.dayLabel} • {formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
              {event.venueName && <p className="microcopy">{event.venueName}</p>}
            </div>
            <Button className="secondary" onClick={() => window.location.href = event.publicPath}>View</Button>
          </div>)}
        </div>
      </> : !tvUrl && <div className="emptyDayCard">
        <p className="muted">{settings?.barflyTvEmptyMessage || "Barfly TV schedule coming soon. Check back for featured events, live streams, and entertainment drops."}</p>
      </div>}
    </div>

    <BackToHomeButton />
  </div>;
}


function SocialWall() {
  const settings = usePublicSettings();
  const frames = [
    {
      title: "Social Wall Output",
      label: "OUTPUT",
      url: normalizeExternalUrl(settings?.socialWallOutputIframeUrl || "")
    },
    {
      title: "Social Wall Input",
      label: "INPUT",
      url: normalizeExternalUrl(settings?.socialWallInputIframeUrl || "")
    }
  ].filter(frame => frame.url);

  return <div className="screen publicScreen neonPublic socialWallPage focusedIframePage socialWallHomeTopPage">
    <BackToHomeButton />
    {frames.length > 0 ? <div className="autoFitIframeGrid socialWallAutoFitGrid">
      {frames.map(frame => <div className="autoFitIframeCard socialWallFrameCard labeledIframeCard" key={frame.label}>
        <div className="iframeLabelPill">{frame.label}</div>
        <iframe className="autoFitIframe" src={frame.url} title={frame.title} loading="lazy" scrolling="no" allow="camera; microphone; clipboard-write; fullscreen" />
      </div>)}
    </div> : <div className="card neonCard emptyGamesPanel">
      <h2>Social Wall links are not set.</h2>
      <p className="muted">Add the OUTPUT and/or INPUT iframe URLs in /host → Games / Iframes.</p>
    </div>}
  </div>;
}


function BusinessDemo() {
  const settings = usePublicSettings();
  const benefits = [
    "Drive traffic on slower nights",
    "Give guests a reason to stay longer",
    "Promote food, drinks, sponsors, and specials",
    "Run events, games, mixers, social walls, and voting from one app",
    "Create shareable moments that bring people back",
    "Support public events, private parties, and business activations"
  ];

  const eventTypes = [
    "Social Mixer",
    "Friends & Activity Partners",
    "Singles Night",
    "Mystery Match Night",
    "Private Party",
    "Professional Development",
    "Networking"
  ];

  const demoPhone = phoneLink(settings?.businessPhone || BUSINESS_PHONE);
  const demoEmail = emailLink(settings?.businessEmail || BUSINESS_EMAIL);
  const demoInstagram = normalizeExternalUrl(settings?.instagramUrl || settings?.instagramHandle || BUSINESS_INSTAGRAM_URL);
  const demoQrLink = `${window.location.origin}/demo`;

  return <div className="screen publicScreen neonPublic businessDemo simplifiedDemoPage">
    <PublicBrandHeader />

    <div className="businessHero simplifiedDemoHero">
      <div className="brandMark">BUSINESS DEMO</div>
      <h1>Turn any night into social entertainment.</h1>
      <p className="heroCopy">Barfly Social helps venues promote events, launch games, run social mixers, collect RSVPs, and keep guests engaged from one clean app.</p>
    </div>

    <div id="how-it-works" className="card neonCard simplifiedDemoSection">
      <div className="brandMark">HOW IT WORKS</div>
      <div className="simpleStepsGrid">
        <div><span>1</span><h3>Create the event</h3></div>
        <div><span>2</span><h3>Guests join from their phone</h3></div>
        <div><span>3</span><h3>Games and social tools open in the app</h3></div>
        <div><span>4</span><h3>The venue gets a better night</h3></div>
      </div>
    </div>

    <div className="card neonCard simplifiedDemoSection">
      <div className="brandMark">BUSINESS BENEFITS</div>
      <h2>Why businesses use Barfly Social</h2>
      <div className="benefitGrid">
        {benefits.map(item => <div className="benefitChip" key={item}>✓ {item}</div>)}
      </div>
    </div>

    <div className="card neonCard simplifiedDemoSection">
      <div className="brandMark">EVENT TYPES</div>
      <div className="eventTypeGrid compactEventTypes">
        {eventTypes.map(type => <div key={type}><h3>{type}</h3></div>)}
      </div>
    </div>

    <div id="business-contact" className="card contactCard demoBottomActions simplifiedContactCard">
      <div className="brandMark">NEXT STEP</div>
      <h1>Ready to Meet, Mingle, and Play?</h1>

      <div className="demoQrContactBox">
        <div>
          <div className="brandMark">SHARE DEMO</div>
          <h2>Scan to open this demo page</h2>
          <p className="muted">{demoQrLink}</p>
        </div>
        <img src={qrApiUrl(demoQrLink)} alt="Demo page QR code" />
      </div>

      <div className="demoBottomButtonGrid">
        {demoPhone && <Button className="secondary" onClick={() => window.location.href = demoPhone}>Phone</Button>}
        {demoEmail && <Button className="secondary" onClick={() => window.location.href = demoEmail}>Email</Button>}
        {demoInstagram && <Button className="secondary" onClick={() => window.location.href = demoInstagram}>Instagram</Button>}
        <Button className="secondary" onClick={() => shareEvent({ title: "Barfly Social Demo", publicPath: "/demo" })}>Share / Demo QR</Button>
        <Button onClick={() => window.location.href = "/home"}>Enter App</Button>
      </div>
    </div>
  </div>;
}


function Forecast() {
  const [data, setData] = React.useState(null);
  React.useEffect(() => { fetch(`${API}/forecast`).then(res => res.json()).then(setData).catch(() => setData({ sessions: [] })); }, []);
  return <div className="screen publicScreen neonPublic">
    <PublicBrandHeader />
    <div className="publicHero">
      <div className="brandMark">MEET & MINGLE</div>
      <div className="mingleHeroIcon"><span className="mingleTriadIcon large" aria-hidden="true"><i /><i /><i /></span></div>
      <h1>Meet & Mingle</h1>
      <p className="tagline">Start with Meet & Mingle, then RSVP, check in at the venue, and play together.</p>
      <div className="ctaRow"><Button onClick={() => window.location.href = "/rsvp"}>RSVP Now</Button><Button className="secondary" onClick={() => window.location.href = "/events"}>This Week’s Events</Button><Button className="secondary" onClick={() => window.location.href = "/checkin"}>Venue Check-In</Button></div>
    </div>
    {!data && <div className="card neonCard"><p>Loading Meet & Mingle...</p></div>}
    {data && (!data.sessions || data.sessions.length === 0) && <div className="card neonCard"><p className="muted">No upcoming sessions yet.</p></div>}
    {(data?.sessions || []).map(session => <div className="card neonCard" key={session.id}>
      <div className="compact"><div><h2>{session.linkedEventTitle || session.venueName}</h2>{session.linkedEventTitle && <p className="sparkLine">{session.venueName}</p>}{session.venueLocation && <p className="muted">{session.venueLocation}</p>}{session.linkedEventDayLabel && <p className="microcopy">{session.linkedEventDayLabel} • {formatEventTime(session.linkedEventStartTime)}–{formatEventTime(session.linkedEventEndTime)}</p>}<p className="sparkLine">{session.eventTypeInfo?.label || eventTypeLabel(session.eventType)}</p><p className="microcopy">{session.modeLabel} • {session.locked ? "Session started — RSVP locked" : "RSVP open"}</p></div><span className={session.locked ? "statusPill storageWarn" : "statusPill storageOk"}>{session.locked ? "locked" : "open"}</span></div>
      <div className="demandGrid">{lookingForOptions.map(option => <div className="demandChip" key={option.value}><span>{option.label}</span><b>{session.forecast?.[option.value]?.level || "Building"}</b></div>)}</div>
      <div className="twoColMeta"><div><div className="metaLabel">RSVP Capacity</div><div className="metaValue">{session.capacity?.rsvpCount || 0}/{session.capacity?.maxRsvps || 0}</div></div><div><div className="metaLabel">Check-In Capacity</div><div className="metaValue">{session.capacity?.checkedInCount || 0}/{session.capacity?.maxCheckins || 0}</div></div></div>
      <p className={session.capacity?.rsvpFull ? "dangerText" : session.capacity?.rsvpAlmostFull ? "sparkLine" : "microcopy"}>{session.capacity?.rsvpLabel || "Open"}</p>
      <DrinkSpecialCard special={session.drinkSpecial} />
      <h3>Session Apps</h3><AppJourney mode={session.gameMode} mixerGoal={session.mixerGoal} />
      <div className="ctaRow">{!session.locked && !session.capacity?.rsvpFull && <Button onClick={() => window.location.href = `/rsvp?gameId=${session.id}`}>RSVP for This Session</Button>}{session.linkedEventPublicPath && <Button className="secondary" onClick={() => window.location.href = session.linkedEventPublicPath}>View Event</Button>}{session.capacity?.rsvpFull && <Button className="disabledBtn">Session Full</Button>}</div>
    </div>)}
    <BackToHomeButton />
    <PublicNav active="" />
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
    <PublicBrandHeader />
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

    <BackToHomeButton />
    <PublicNav active="rsvp" />
  </div>;

  return <div className="screen publicScreen neonPublic">
    <PublicBrandHeader />
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
    <PublicBrandHeader />
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

      <Button onClick={checkIn}>Venue Check-In</Button>
    </div>

    <BackToHomeButton />
    <PublicNav active="checkin" />
  </div>;
}



function MyRSVP() {
  const [rsvpId, setRsvpId] = React.useState(localStorage.getItem("barflydateRsvpId") || "");
  const [rsvp, setRsvp] = React.useState(null);
  const [forecast, setForecast] = React.useState(null);
  const [selectedGameId, setSelectedGameId] = React.useState("");
  const [gameCode, setGameCode] = React.useState("");
  const [checkinOpen, setCheckinOpen] = React.useState(false);
  const [changeOpen, setChangeOpen] = React.useState(false);
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

  async function checkInFromRsvp() {
    if (!rsvp?.id) return;
    setError("");
    setMessage("");
    const res = await fetch(`${API}/checkin`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ rsvpId: rsvp.id, gameCode })
    });
    const data = await res.json().catch(() => ({ error: "Server returned an unreadable response." }));
    if (!res.ok || data.error) {
      setError(data.error || "Could not check in.");
      return;
    }
    window.location.href = `/player/${data.id}`;
  }

  const openSessions = (forecast?.sessions || []).filter(session => !session.locked && (!session.capacity?.rsvpFull || session.id === rsvp?.gameId));
  const canModify = rsvp && !rsvp.locked && !rsvp.checkedIn && rsvp.status !== "cancelled";

  return <div className="screen publicScreen neonPublic">
    <PublicBrandHeader />
    <div className="publicHero">
      <div className="brandMark">MY RSVP</div>
      <h1>Manage Your Spot</h1>
      <p className="tagline">View, change, check in, or cancel your RSVP from one place.</p>
    </div>

    {error && <div className="alert">{error}</div>}
    {message && <div className="alert successAlert">{message}</div>}

    <div className="card neonCard">
      <label>RSVP ID</label>
      <input value={rsvpId} onChange={e => setRsvpId(e.target.value)} placeholder="Paste RSVP ID" />
      <div className="ctaRow">
        <Button onClick={() => loadRsvp(rsvpId)}>Load RSVP</Button>
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

      {canModify && changeOpen && <>
        <h3>Change RSVP</h3>
        <p className="microcopy">You can move this RSVP only before your original session starts and before the new session starts.</p>
        <select value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)}>
          {openSessions.map(session => <option key={session.id} value={session.id}>{session.venueName} — {session.modeLabel} — {session.capacity?.rsvpLabel || "Open"}</option>)}
        </select>
      </>}

      {!canModify && <p className="microcopy">This RSVP is locked because it is checked in, cancelled, or the session has started.</p>}

      {checkinOpen && <div className="inlineActionPanel">
        <h3>Check In</h3>
        <p className="microcopy">Enter the session code from the venue host.</p>
        <label>Session Code</label>
        <input value={gameCode} onChange={e => setGameCode(e.target.value.toUpperCase())} placeholder="Code from host" />
        <Button onClick={checkInFromRsvp}>Check In Now</Button>
      </div>}

      <div className="myRsvpQuickActions">
        <Button className="secondary" onClick={() => setCheckinOpen(value => !value)}>Check In</Button>
        {canModify && <Button className="secondary" onClick={() => {
          setChangeOpen(value => !value);
          setCheckinOpen(false);
        }}>Change RSVP</Button>}
        {canModify && changeOpen && selectedGameId !== rsvp.gameId && <Button className="secondary" onClick={moveRsvp}>Save Change</Button>}
        {canModify && <Button className="danger" onClick={cancelRsvp}>Cancel RSVP</Button>}
        <Button className="secondary" onClick={copyRsvpId}>Copy RSVP ID</Button>
      </div>
    </div>}

    <BackToHomeButton />
    <PublicNav active="my-rsvp" />
  </div>;
}





function HostGameIframeSettingsPanel() {
  const blank = {
    globalBingoIframeUrl: "",
    globalTriviaIframeUrl: "",
    globalMysteryIframeUrl: "",
    globalVoteIframeUrl: "",
    socialWallOutputIframeUrl: "",
    socialWallInputIframeUrl: "",
    karaokeUrl: "",
    jobsUrl: "",
    barflyTvIframeUrl: "",
    barflyTvEmptyMessage: ""
  };
  const [form, setForm] = React.useState(blank);
  const [allSettings, setAllSettings] = React.useState({});
  const [lastSaved, setLastSaved] = React.useState(blank);
  const [saved, setSaved] = React.useState("");

  function normalizeIframeUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (text.startsWith("/")) return text;
    if (/^http:\/\//i.test(text)) return text.replace(/^http:\/\//i, "https://");
    if (/^https:\/\//i.test(text)) return text;
    return `https://${text}`;
  }

  function pickGameSettings(settings = {}) {
    return {
      globalBingoIframeUrl: settings.globalBingoIframeUrl || "",
      globalTriviaIframeUrl: settings.globalTriviaIframeUrl || "",
      globalMysteryIframeUrl: settings.globalMysteryIframeUrl || "",
      globalVoteIframeUrl: settings.globalVoteIframeUrl || "",
      socialWallOutputIframeUrl: settings.socialWallOutputIframeUrl || "",
      socialWallInputIframeUrl: settings.socialWallInputIframeUrl || "",
      karaokeUrl: settings.karaokeUrl || "",
      jobsUrl: settings.jobsUrl || "",
      barflyTvIframeUrl: settings.barflyTvIframeUrl || "",
      barflyTvEmptyMessage: settings.barflyTvEmptyMessage || ""
    };
  }

  async function loadSettings() {
    const res = await hostFetch(`${API}/host/settings`);
    const data = await res.json().catch(() => ({ settings: {} }));
    const fullSettings = data.settings || {};
    const next = { ...blank, ...pickGameSettings(fullSettings) };
    setAllSettings(fullSettings);
    setForm(next);
    setLastSaved(next);
  }

  React.useEffect(() => { loadSettings(); }, []);

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function saveGameSettings() {
    const cleaned = {
      ...form,
      globalBingoIframeUrl: normalizeIframeUrl(form.globalBingoIframeUrl),
      globalTriviaIframeUrl: normalizeIframeUrl(form.globalTriviaIframeUrl),
      globalMysteryIframeUrl: normalizeIframeUrl(form.globalMysteryIframeUrl),
      globalVoteIframeUrl: normalizeIframeUrl(form.globalVoteIframeUrl),
      socialWallOutputIframeUrl: normalizeIframeUrl(form.socialWallOutputIframeUrl),
      socialWallInputIframeUrl: normalizeIframeUrl(form.socialWallInputIframeUrl),
      karaokeUrl: normalizeIframeUrl(form.karaokeUrl),
      jobsUrl: normalizeIframeUrl(form.jobsUrl),
      barflyTvIframeUrl: normalizeIframeUrl(form.barflyTvIframeUrl)
    };

    const payload = { ...allSettings, ...cleaned };
    const res = await hostFetch(`${API}/host/settings`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not save game iframe settings.");

    const savedSettings = data.settings || payload;
    const next = { ...blank, ...pickGameSettings(savedSettings) };
    setAllSettings(savedSettings);
    setForm(next);
    setLastSaved(next);
    setSaved("Game iframe settings saved successfully.");
    setTimeout(() => setSaved(""), 1800);
  }

  function cancelChanges() {
    setForm(lastSaved);
    setSaved("Changes cancelled.");
    setTimeout(() => setSaved(""), 1200);
  }

  return <div className="card glowCard hostGameIframeSettings cleanIframeSettings" id="host-game-iframes">
    <div className="brandMark">GAMES / IFRAMES</div>
    <h2>Game Dashboard Links</h2>
    <p className="microcopy">Paste full game links here. The app will add https:// automatically if you leave it off. Blank URLs hide game buttons.</p>
    {saved && <div className="successBanner">✅ {saved}</div>}

    <div className="twoCol iframeUrlGrid">
      <div><label>Bingo iframe URL</label><input value={form.globalBingoIframeUrl} onChange={e => update("globalBingoIframeUrl", e.target.value)} placeholder="https://games.barfly.social/bingo" autoComplete="off" /></div>
      <div><label>Trivia iframe URL</label><input value={form.globalTriviaIframeUrl} onChange={e => update("globalTriviaIframeUrl", e.target.value)} placeholder="https://games.barfly.social/trivia" autoComplete="off" /></div>
      <div><label>Mystery iframe URL</label><input value={form.globalMysteryIframeUrl} onChange={e => update("globalMysteryIframeUrl", e.target.value)} placeholder="https://games.barfly.social/mystery" autoComplete="off" /></div>
      <div><label>Vote iframe URL</label><input value={form.globalVoteIframeUrl} onChange={e => update("globalVoteIframeUrl", e.target.value)} placeholder="https://games.barfly.social/vote" autoComplete="off" /></div>
      <div className="fullWidth sectionDividerField"><label>Social Wall OUTPUT iframe URL</label><input value={form.socialWallOutputIframeUrl} onChange={e => update("socialWallOutputIframeUrl", e.target.value)} placeholder="https://games.barfly.social/BARFLYSOCIAL" autoComplete="off" /><p className="microcopy">Top iframe on /social-wall. Leave blank to hide it.</p></div>
      <div className="fullWidth"><label>Social Wall INPUT iframe URL</label><input value={form.socialWallInputIframeUrl} onChange={e => update("socialWallInputIframeUrl", e.target.value)} placeholder="https://games.barfly.social/" autoComplete="off" /><p className="microcopy">Bottom iframe on /social-wall. Leave blank to hide it.</p></div>
      <div className="fullWidth socialWallOptionNote"><label>Option 1 Instagram Social Wall Service URL</label><p className="microcopy">Use a social wall service that pulls Instagram posts by hashtag/account, then paste that service display URL into Social Wall OUTPUT above.</p></div>
      <div><label>Karaoke URL</label><input value={form.karaokeUrl} onChange={e => update("karaokeUrl", e.target.value)} placeholder="https://..." autoComplete="off" /><p className="microcopy">Shows Karaoke icon on /home only when filled.</p></div>
      <div><label>Jobs URL</label><input value={form.jobsUrl} onChange={e => update("jobsUrl", e.target.value)} placeholder="https://..." autoComplete="off" /><p className="microcopy">Shows Jobs icon on /home only when filled.</p></div>
      <div className="fullWidth"><label>Barfly TV iframe / video URL</label><input value={form.barflyTvIframeUrl} onChange={e => update("barflyTvIframeUrl", e.target.value)} placeholder="https://..." autoComplete="off" /></div>
      <div className="fullWidth"><label>Barfly TV Empty Schedule Message</label><textarea value={form.barflyTvEmptyMessage} onChange={e => update("barflyTvEmptyMessage", e.target.value)} placeholder="Barfly TV schedule coming soon..." /></div>
    </div>

    <div className="ctaRow cleanIframeActions">
      <Button onClick={saveGameSettings}>Save Games / Iframes</Button>
      <Button className="secondary" onClick={cancelChanges}>Cancel</Button>
      <Button className="secondary" onClick={() => window.location.href = "/home"}>View App Home</Button>
      <Button className="secondary" onClick={() => window.location.href = "/barfly-tv"}>View Barfly TV</Button>
    </div>
  </div>;
}


function HostSettingsPanel() {
  const [settings, setSettings] = React.useState({
    businessPhone: "",
    businessEmail: "",
    bookingLink: "",
    website: "",
    websiteUrl: "",
    gamesSite: "",
    gamesUrl: "",
    instagramHandle: "",
    instagramUrl: "",
    homepageDestination: "events",
    eventPromoActive: false,
    eventPromoTitle: "Featured Sponsor",
    eventPromoSponsor: "",
    eventPromoText: "",
    eventPromoImageUrl: "",
    eventPromoButtonText: "View Event",
    eventPromoButtonLink: "/events",
    eventPromoStartDate: "",
    eventPromoEndDate: "",
    appIconPopupActive: false,
    appIconPopupTitle: "",
    appIconPopupText: "",
    appIconPopupImageUrl: "",
    appIconPopupButtonText: "",
    globalBingoIframeUrl: "",
    globalTriviaIframeUrl: "",
    globalMysteryIframeUrl: "",
    globalVoteIframeUrl: "",
    socialWallOutputIframeUrl: "",
    socialWallInputIframeUrl: "",
    karaokeUrl: "",
    jobsUrl: "",
    barflyTvIframeUrl: "",
    barflyTvEmptyMessage: "Barfly TV schedule coming soon. Check back for featured events, live streams, and entertainment drops.",
    defaultDisclaimer: "",
    defaultPrizeRules: ""
  });
  const [saved, setSaved] = React.useState("");
  const [lastSaved, setLastSaved] = React.useState(null);

  async function loadSettings() {
    const res = await hostFetch(`${API}/host/settings`);
    const data = await res.json().catch(() => ({ settings: {} }));
    const next = { ...settings, ...(data.settings || {}) };
    setSettings(next);
    setLastSaved(next);
  }

  React.useEffect(() => { loadSettings(); }, []);

  function update(key, value) {
    setSettings(current => ({ ...current, [key]: value }));
  }

  async function saveSettings() {
    const res = await hostFetch(`${API}/host/settings`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(settings)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not save settings.");
    const next = data.settings || settings;
    setSettings(next);
    setLastSaved(next);
    setSaved("Settings saved successfully.");
    setTimeout(() => setSaved(""), 1400);
  }

  return <div className="card glowCard hostSettingsPanel" id="host-settings-panel">
    <div className="brandMark">BUSINESS SETTINGS</div>
    <h2>Marketing + Contact Settings</h2>
    <div className="twoCol">
      <div><label>Business Phone</label><input value={settings.businessPhone} onChange={e => update("businessPhone", e.target.value)} /></div>
      <div><label>Business Email</label><input value={settings.businessEmail} onChange={e => update("businessEmail", e.target.value)} /></div>
      <div><label>Booking Link</label><input value={settings.bookingLink} onChange={e => update("bookingLink", e.target.value)} placeholder="/book" /></div>
      <div><label>Website Label</label><input value={settings.website} onChange={e => update("website", e.target.value)} placeholder="barfly.social" /></div>
      <div><label>Website URL</label><input value={settings.websiteUrl} onChange={e => update("websiteUrl", e.target.value)} placeholder="https://barfly.social" /></div>
      <div><label>Games Site Label</label><input value={settings.gamesSite} onChange={e => update("gamesSite", e.target.value)} placeholder="games.barfly.social" /></div>
      <div><label>Games URL</label><input value={settings.gamesUrl} onChange={e => update("gamesUrl", e.target.value)} placeholder="https://games.barfly.social" /></div>
      <div><label>Instagram Handle</label><input value={settings.instagramHandle} onChange={e => update("instagramHandle", e.target.value)} placeholder="@barflyentertainment" /></div>
      <div><label>Instagram URL</label><input value={settings.instagramUrl} onChange={e => update("instagramUrl", e.target.value)} placeholder="https://instagram.com/barflyentertainment" /></div>
    </div>

    <div className="promoSettingsBox">
      <div className="brandMark">EVENT PAGE PROMO POPUP</div>
      <h3>Sponsor / Ad Popup</h3>
      <label className="checkRow"><input type="checkbox" checked={!!settings.eventPromoActive} onChange={e => update("eventPromoActive", e.target.checked)} /><span>Popup Active</span></label>
      <div className="twoCol">
        <div><label>Ad Title</label><input value={settings.eventPromoTitle || ""} onChange={e => update("eventPromoTitle", e.target.value)} placeholder="Featured Sponsor" /></div>
        <div><label>Sponsor Name</label><input value={settings.eventPromoSponsor || ""} onChange={e => update("eventPromoSponsor", e.target.value)} placeholder="GolfSuites Baton Rouge" /></div>
        <div><label>Button Text</label><input value={settings.eventPromoButtonText || ""} onChange={e => update("eventPromoButtonText", e.target.value)} placeholder="View Event" /></div>
        <div><label>Button Link</label><input value={settings.eventPromoButtonLink || ""} onChange={e => update("eventPromoButtonLink", e.target.value)} placeholder="/events" /></div>
        <div><label>Start Date</label><input type="date" value={settings.eventPromoStartDate || ""} onChange={e => update("eventPromoStartDate", e.target.value)} /></div>
        <div><label>End Date</label><input type="date" value={settings.eventPromoEndDate || ""} onChange={e => update("eventPromoEndDate", e.target.value)} /></div>
      </div>
      <label>Promo Image URL</label>
      <input value={settings.eventPromoImageUrl || ""} onChange={e => update("eventPromoImageUrl", e.target.value)} placeholder="https://..." />
      <label>Promo Text</label>
      <textarea value={settings.eventPromoText || ""} onChange={e => update("eventPromoText", e.target.value)} placeholder="Free to play • Play for prizes" />
      <p className="microcopy">This popup appears on /events once per day per device when active and within the optional date range.</p>
    </div>

    <div className="promoSettingsBox appIconPopupSettingsBox">
      <div className="brandMark">APP ICON CLICK POPUP</div>
      <h3>Dashboard Icon Popup</h3>
      <label className="checkRow"><input type="checkbox" checked={!!settings.appIconPopupActive} onChange={e => update("appIconPopupActive", e.target.checked)} /><span>Show popup when any Home icon is clicked</span></label>
      <div className="twoCol">
        <div><label>Popup Title</label><input value={settings.appIconPopupTitle || ""} onChange={e => update("appIconPopupTitle", e.target.value)} placeholder="Tonight at Barfly Social" /></div>
        <div><label>Button Text</label><input value={settings.appIconPopupButtonText || ""} onChange={e => update("appIconPopupButtonText", e.target.value)} placeholder="Continue" /></div>
        <div className="fullWidth"><label>Popup Image URL</label><input value={settings.appIconPopupImageUrl || ""} onChange={e => update("appIconPopupImageUrl", e.target.value)} placeholder="https://..." /></div>
      </div>
      <label>Popup Message</label>
      <textarea value={settings.appIconPopupText || ""} onChange={e => update("appIconPopupText", e.target.value)} placeholder="Add sponsor message, event reminder, special, or announcement." />
      <p className="microcopy">When active, this popup appears every time a guest taps any icon on /home. Continue sends them to the icon they clicked.</p>
    </div>

    <label>Default Event Disclaimer</label>
    <textarea value={settings.defaultDisclaimer} onChange={e => update("defaultDisclaimer", e.target.value)} />
    <label>Default Prize Rules</label>
    <textarea value={settings.defaultPrizeRules} onChange={e => update("defaultPrizeRules", e.target.value)} />
    <h3>Public Contact Buttons Preview</h3>
    <BusinessContactButtons settings={settings} compact />
    <div className="ctaRow">
      <Button onClick={saveSettings}>Save Settings</Button>
      <Button className="secondary" onClick={() => lastSaved && setSettings(lastSaved)}>Cancel</Button>
      <Button className="secondary" onClick={() => window.location.href="/business-demo"}>View Business Demo</Button>
      <Button className="secondary" onClick={() => window.location.href = `${API}/host/backup?hostPin=${encodeURIComponent(getHostPin())}`}>Export Full Backup</Button>
    </div>
    {saved && <div className="successBanner">✅ {saved}</div>}
  </div>;
}




function HostHeroTemplateManager() {
  const blank = {
    venueName: "",
    heroVariant: "",
    heroImageUrl: "",
    heroFit: "cover",
    active: true,
    notes: ""
  };

  const [heroTemplates, setHeroTemplates] = React.useState([]);
  const [form, setForm] = React.useState(blank);
  const [editingId, setEditingId] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  async function loadHeroTemplates() {
    const res = await hostFetch(`${API}/host/hero-templates`);
    const data = await res.json().catch(() => ({ heroTemplates: [] }));
    setHeroTemplates(data.heroTemplates || []);
  }

  React.useEffect(() => { loadHeroTemplates(); }, []);

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function editHeroTemplate(template) {
    setEditingId(template.id);
    setForm({ ...blank, ...template });
  }

  async function saveHeroTemplate() {
    const wasEditing = Boolean(editingId);
    const variant = heroVariants.find(item => item.value === form.heroVariant);
    const payload = { ...form, heroVariantLabel: variant?.label || form.heroVariant };
    const url = editingId ? `${API}/host/hero-templates/${editingId}` : `${API}/host/hero-templates`;
    const res = await hostFetch(url, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not save hero template.");
    setEditingId("");
    setForm(blank);
    setHeroTemplates(data.heroTemplates || []);
    setSaveMessage(wasEditing ? "Hero template updated successfully." : "Hero template saved successfully.");
    setTimeout(() => setSaveMessage(""), 2200);
  }

  async function deleteHeroTemplate(template) {
    if (!confirm(`Delete this hero template?\n\n${template.venueName || "Venue"} • ${heroVariantLabel(template.heroVariant)}`)) return;
    const res = await hostFetch(`${API}/host/hero-templates/${template.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not delete hero template.");
    setHeroTemplates(data.heroTemplates || []);
    setSaveMessage("Hero template deleted successfully.");
    setTimeout(() => setSaveMessage(""), 2200);
  }

  return <div className="card glowCard heroTemplateManager" id="host-hero-templates">
    <div className="brandMark">VENUE HERO TEMPLATE MANAGER</div>
    <h2>{editingId ? "Edit Hero Template" : "Create Venue Hero Template"}</h2>
    {saveMessage && <div className="successBanner">✅ {saveMessage}</div>}
    <p className="muted">Create hero art by venue and event variant. Events can automatically use the matching venue + hero variant image.</p>

    <div className="twoCol">
      <div><label>Venue</label><select value={form.venueName} onChange={e => update("venueName", e.target.value)}>
        <option value="">Choose venue</option>
        {venueHeroVenues.map(venue => <option key={venue} value={venue}>{venue}</option>)}
      </select></div>
      <div><label>Hero Variant</label><select value={form.heroVariant} onChange={e => update("heroVariant", e.target.value)}>
        <option value="">Choose hero type</option>
        {heroVariants.map(variant => <option key={variant.value} value={variant.value}>{variant.label}</option>)}
      </select></div>
    </div>

    <label>Hero Image URL</label>
    <input value={form.heroImageUrl} onChange={e => update("heroImageUrl", e.target.value)} placeholder="/heroes/brickyard-south/karaoke.png or https://..." />
    <label>Notes</label>
    <input value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Business logo hero, karaoke accents, etc." />
    <label className="checkRow"><input type="checkbox" checked={!!form.active} onChange={e => update("active", e.target.checked)} /><span>Active</span></label>

    {form.heroImageUrl && <div className="heroTemplatePreview" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.25)), url(${form.heroImageUrl})` }}>
      <span>{form.venueName}</span>
      <b>{heroVariantLabel(form.heroVariant)}</b>
    </div>}

    <div className="ctaRow">
      <Button onClick={saveHeroTemplate}>{editingId ? "Update Hero Template" : "Save Hero Template"}</Button>
      {editingId && <Button className="secondary" onClick={() => { setEditingId(""); setForm(blank); }}>Cancel Edit</Button>}
    </div>

    <h3>Saved Venue Heroes</h3>
    {heroTemplates.length === 0 && <p className="muted">No venue hero templates saved yet.</p>}
    <div className="heroTemplateList">
      {heroTemplates.map(template => <div className="rsvpRow heroTemplateRow" key={template.id}>
        <div>
          <b>{template.venueName} — {heroVariantLabel(template.heroVariant)}</b>
          <p className="muted">{template.active === false ? "Inactive" : "Active"} • Fit: {template.heroFit === "contain" ? "Contain" : "Cover"} • {template.heroImageUrl || "No image URL yet"}</p>
          {template.notes && <p className="microcopy">{template.notes}</p>}
        </div>
        {template.heroImageUrl && <img src={template.heroImageUrl} alt={`${template.venueName} ${template.heroVariant}`} />}
        <div className="row">
          <Button className="secondary" onClick={() => editHeroTemplate(template)}>Edit</Button>
          <Button className="danger" onClick={() => deleteHeroTemplate(template)}>Delete Hero</Button>
        </div>
      </div>)}
    </div>
  </div>;
}



function PosterBuilder() {
  const initial = {
    templateSlug: "bingo-trivia-night",
    overlayLayout: "bottom_info_panel",
    posterSize: "portrait",
    eventTitle: "Bingo + Trivia Night",
    subtitle: "Free to play • Play for prizes",
    venueName: "GolfSuites",
    venueAddress: "8181 Siegen Ln.",
    eventDate: "Tuesday",
    startTime: "6p",
    endTime: "9p",
    mainCta: "Free to Play",
    secondaryCta: "Play for Prizes",
    drinkSpecial: "",
    sponsorLine: "",
    hostedBy: "Hosted by Barfly Social",
    website: "app.barfly.social",
    showQr: true
  };

  const [form, setForm] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("barflyPosterDraftV1") || "null");
      return saved || initial;
    } catch {
      return initial;
    }
  });

  const [templateSettings, setTemplateSettings] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("barflyPosterTemplateSettingsV1") || "{}");
    } catch {
      return {};
    }
  });

  function mergeTemplate(template) {
    const settings = templateSettings[template.slug] || {};
    return { ...template, ...settings };
  }

  const activePosterTemplates = posterTemplates.map(mergeTemplate).filter(template => template.active !== false);
  const template = activePosterTemplates.find(item => item.slug === form.templateSlug) || activePosterTemplates[0] || mergeTemplate(posterTemplates[0]);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  function updateTemplateSetting(key, value) {
    setTemplateSettings(current => {
      const next = {
        ...current,
        [template.slug]: {
          ...(current[template.slug] || {}),
          [key]: value
        }
      };
      localStorage.setItem("barflyPosterTemplateSettingsV1", JSON.stringify(next));
      return next;
    });
  }

  const detailLines = [
    form.venueName,
    form.venueAddress,
    [form.eventDate, [form.startTime, form.endTime].filter(Boolean).join("–")].filter(Boolean).join(" • ")
  ].filter(Boolean);
  const ctaLines = [form.mainCta, form.secondaryCta, form.drinkSpecial, form.sponsorLine].filter(Boolean);

  function saveDraft() {
    localStorage.setItem("barflyPosterDraftV1", JSON.stringify(form));
    alert("Poster draft saved.");
  }

  function duplicateDraft() {
    const next = { ...form, eventDate: "", startTime: "", endTime: "" };
    setForm(next);
    localStorage.setItem("barflyPosterDraftV1", JSON.stringify(next));
    alert("Draft duplicated. Update the date and time.");
  }

  function useShortVersion() {
    setForm(current => ({
      ...current,
      subtitle: "",
      drinkSpecial: "",
      sponsorLine: "",
      website: "app.barfly.social",
      showQr: false
    }));
  }

  function useFullVersion() {
    setForm(current => ({
      ...current,
      subtitle: current.subtitle || "Free to play • Play for prizes",
      website: current.website || "app.barfly.social",
      showQr: true
    }));
  }

  function copyPosterCaption() {
    const caption = [
      form.eventTitle,
      form.venueName && `📍 ${form.venueName}${form.venueAddress ? ` — ${form.venueAddress}` : ""}`,
      (form.eventDate || form.startTime || form.endTime) && `🗓️ ${[form.eventDate, [form.startTime, form.endTime].filter(Boolean).join("–")].filter(Boolean).join(" • ")}`,
      form.mainCta,
      form.secondaryCta,
      form.website
    ].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(caption);
    alert("Poster caption copied.");
  }

  return <div className="card glowCard posterBuilder" id="host-poster-builder">
    <div className="brandMark">POSTER BUILDER</div>
    <h2>Template → Event Info → Preview → Export</h2>
    <p className="muted">Build reusable Instagram promos. The theme background can now use real saved artwork while event details are overlaid by the system.</p>

    <div className="posterBuilderGrid">
      <div className="posterBuilderForm">
        <div className="brandMark">1. CHOOSE TEMPLATE</div>
        <div className="twoCol">
          <div><label>Template</label><select value={form.templateSlug} onChange={e => {
            const selected = activePosterTemplates.find(item => item.slug === e.target.value) || posterTemplates.find(item => item.slug === e.target.value);
            setForm(current => ({ ...current, templateSlug: e.target.value, overlayLayout: selected?.overlayLayout || current.overlayLayout }));
          }}>
            {activePosterTemplates.map(template => <option key={template.slug} value={template.slug}>{template.pickerLabel}</option>)}
          </select></div>
          <div><label>Size</label><select value={form.posterSize} onChange={e => update("posterSize", e.target.value)}>
            <option value="square">Square Post — 1080×1080</option>
            <option value="portrait">Instagram Post — 1080×1350</option>
            <option value="story">Story — 1080×1920</option>
          </select></div>
        </div>

        <div className="templateBackgroundManager">
          <div className="brandMark">TEMPLATE BACKGROUND</div>
          <div className="twoCol">
            <div><label>Template Name</label><input value={template.name} onChange={e => updateTemplateSetting("name", e.target.value)} /></div>
            <div><label>Template Slug</label><input value={template.slug} disabled /></div>
          </div>
          <label>Background Image URL</label>
          <input value={template.backgroundImageUrl || ""} onChange={e => updateTemplateSetting("backgroundImageUrl", e.target.value)} placeholder="Paste public background image URL here" />
          <label className="checkRow"><input type="checkbox" checked={template.active !== false} onChange={e => updateTemplateSetting("active", e.target.checked)} /><span>Template Active</span></label>
          <p className="microcopy">Use a clean background image with the Barfly Social logo and theme artwork only. Do not include venue, date, time, or event info in the background.</p>
        </div>

        <label>Overlay Layout</label>
        <select value={form.overlayLayout} onChange={e => update("overlayLayout", e.target.value)}>
          <option value="bottom_info_panel">Bottom Info Panel</option>
          <option value="center_stack">Center Stack</option>
          <option value="split_panel">Split Panel</option>
        </select>

        <div className="brandMark">2. EVENT INFO</div>
        <label>Event Title</label><input value={form.eventTitle} onChange={e => update("eventTitle", e.target.value)} />
        <label>Subtitle</label><input value={form.subtitle} onChange={e => update("subtitle", e.target.value)} placeholder="Free to play • Play for prizes" />
        <div className="twoCol">
          <div><label>Venue Name</label><input value={form.venueName} onChange={e => update("venueName", e.target.value)} /></div>
          <div><label>Address</label><input value={form.venueAddress} onChange={e => update("venueAddress", e.target.value)} /></div>
          <div><label>Date</label><input value={form.eventDate} onChange={e => update("eventDate", e.target.value)} placeholder="Tuesday, May 12" /></div>
          <div><label>Time</label><input value={[form.startTime, form.endTime].filter(Boolean).join("–")} onChange={e => {
            const parts = e.target.value.split("–");
            update("startTime", parts[0] || "");
            update("endTime", parts[1] || "");
          }} placeholder="6p–9p" /></div>
        </div>

        <div className="brandMark">3. PROMO LINES</div>
        <div className="twoCol">
          <div><label>Main CTA</label><input value={form.mainCta} onChange={e => update("mainCta", e.target.value)} /></div>
          <div><label>Secondary CTA</label><input value={form.secondaryCta} onChange={e => update("secondaryCta", e.target.value)} /></div>
        </div>
        <label>Drink Special</label><input value={form.drinkSpecial} onChange={e => update("drinkSpecial", e.target.value)} placeholder="Optional" />
        <label>Sponsor Line</label><input value={form.sponsorLine} onChange={e => update("sponsorLine", e.target.value)} placeholder="Optional" />
        <label>Hosted By</label><input value={form.hostedBy} onChange={e => update("hostedBy", e.target.value)} />
        <label>Website / Link</label><input value={form.website} onChange={e => update("website", e.target.value)} />
        <label className="checkRow"><input type="checkbox" checked={form.showQr} onChange={e => update("showQr", e.target.checked)} /><span>Show QR placeholder</span></label>

        <div className="ctaRow">
          <Button onClick={saveDraft}>Save Draft</Button>
          <Button className="secondary" onClick={duplicateDraft}>Duplicate Draft</Button>
          <Button className="secondary" onClick={useShortVersion}>Use Short Version</Button>
          <Button className="secondary" onClick={useFullVersion}>Use Full Version</Button>
          <Button className="secondary" onClick={copyPosterCaption}>Copy Caption</Button>
          <Button onClick={() => window.print()}>Export / Print</Button>
        </div>
      </div>

      <div className="posterBuilderPreview">
        <div className="posterPreviewFrame">
          <div className={`igPosterCanvas builderPreview ${form.posterSize} template-${template.slug} layout-${form.overlayLayout}`}>
            <div className="igPosterBg" style={template.backgroundImageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.14), rgba(0,0,0,.56)), url(${template.backgroundImageUrl})` } : undefined}>
              <div className="igPosterLogo">BARFLY SOCIAL</div>
              {!template.backgroundImageUrl && <div className="igPosterIconCloud">
                {(template.icons || ["🎮","✨"]).map((icon, index) => <span key={`${icon}-${index}`}>{icon}</span>)}
              </div>}
            </div>
            <div className="igPosterOverlay">
              <div className="igBadgeRow">
                <span>{template.name}</span>
                {form.mainCta && <span>{form.mainCta}</span>}
              </div>
              <h1>{form.eventTitle}</h1>
              {form.subtitle && <p className="igPosterSubtitle">{form.subtitle}</p>}
              <div className="igPosterDetails">
                {detailLines.map(line => <p key={line}>{line}</p>)}
              </div>
              {ctaLines.length > 0 && <div className="igPosterSpecial">{ctaLines.map(line => <p key={line}>{line}</p>)}</div>}
              <div className="igPosterFooter">
                <div>
                  <b>{form.hostedBy}</b>
                  <span>{form.website}</span>
                </div>
                {form.showQr && <div className="qrPlaceholder">QR</div>}
              </div>
            </div>
          </div>
        </div>
        <p className="microcopy">Scaled preview shows the full poster. Export sizes stay 1080×1080, 1080×1350, and 1080×1920.</p>
      </div>
    </div>
  </div>;
}





function HostEventTypeManager() {
  const [customEventTypes, setCustomEventTypes] = React.useState([]);
  const [newType, setNewType] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  async function loadTypes() {
    const res = await hostFetch(`${API}/host/custom-event-types`);
    const data = await res.json().catch(() => ({ customEventTypes: [] }));
    setCustomEventTypes(data.customEventTypes || []);
  }

  React.useEffect(() => { loadTypes(); }, []);

  async function saveTypes(nextTypes, message = "Event types saved successfully.") {
    const cleaned = Array.from(new Set((nextTypes || []).map(item => String(item || "").trim()).filter(Boolean)));
    const res = await hostFetch(`${API}/host/custom-event-types`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ customEventTypes: cleaned })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not save event types.");
    setCustomEventTypes(data.customEventTypes || cleaned);
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(""), 2200);
  }

  function addType() {
    const label = newType.trim();
    if (!label) return;
    if (customEventTypes.some(item => item.toLowerCase() === label.toLowerCase())) {
      setNewType("");
      return;
    }
    setNewType("");
    saveTypes([...customEventTypes, label], "Event type added successfully.");
  }

  function deleteType(label) {
    if (!confirm(`Delete this event type?\n\n${label}`)) return;
    saveTypes(customEventTypes.filter(item => item !== label), "Event type deleted successfully.");
  }

  return <div className="card glowCard eventTypeManager" id="host-event-types">
    <div className="brandMark">EVENT TYPE MANAGER</div>
    <h2>Manage Event Types</h2>
    {saveMessage && <div className="successBanner">✅ {saveMessage}</div>}
    <p className="muted">Add custom event names that appear in the Quick Event Builder, like Latino Bingo or Battle Karaoke.</p>
    <div className="twoCol">
      <div><label>New Event Type</label><input value={newType} onChange={e => setNewType(e.target.value)} placeholder="Latino Trivia, Battle Karaoke, etc." /></div>
      <div className="alignEnd"><Button onClick={addType}>Save Event Type</Button></div>
    </div>
    <div className="pillList eventTypePillList">
      {customEventTypes.map(label => <span className="miniPill editablePill" key={label}>{label}<button type="button" onClick={() => deleteType(label)}>×</button></span>)}
    </div>
  </div>;
}


function HostEventsPanel() {
  const blank = {
    venueId: "",
    templateId: "",
    posterTemplateSlug: "",
    posterOverlayLayout: "",
    heroVariant: "",
    heroImageUrl: "",
    heroFit: "cover",
    showHeroGraphic: true,
    eventTypeTags: [],
    mixerGoal: "",
    saveVenueWithEvent: false,
    saveHeroWithEvent: false,
    meetMingleEnabled: false,
    meetMingleGameId: "",
    meetMingleGameMode: "",
    meetMingleMaxRsvps: "",
    meetMingleMaxCheckins: "",
    meetMinglePointMode: "",
    meetMingleZones: "",
    meetMingleDrinkSpecialTitle: "",
    meetMingleDrinkSpecialDetails: "",
    meetMingleDrinkSpecialWindow: "",
    meetMingleDrinkSpecialRestrictions: "",
    title: "",
    eventType: "",
    customEventType: "",
    venueName: "",
    venueLocation: "",
    dayOfWeek: "",
    daysOfWeek: [],
    startTime: "",
    endTime: "",
    recurringWeekly: false,
    onlineOnly: false,
    eventStatus: "",
    description: "",
    prizeSpecial: "",
    sponsorName: "",
    sponsorLogoUrl: "",
    venueLogoUrl: "",
    eventImageUrl: "",
    prizeName: "",
    prizeValue: "",
    redemptionRules: "",
    expirationDate: "",
    paidEvent: false,
    ticketPrice: "",
    paymentLink: "",
    buttonText: "",
    buttonLink: "",
    featured: false,
    hidden: false
  };

  const [events, setEvents] = React.useState([]);
  const [venues, setVenues] = React.useState([]);
  const [customEventTypes, setCustomEventTypes] = React.useState([]);
  const [heroTemplates, setHeroTemplates] = React.useState([]);
  const [form, setForm] = React.useState(blank);
  const [editingId, setEditingId] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  async function loadEvents() {
    const res = await hostFetch(`${API}/host/events`);
    const data = await res.json().catch(() => ({ events: [] }));
    setEvents(data.events || []);
  }

  async function loadVenueAndTemplateOptions() {
    const [venueRes, heroRes, typeRes] = await Promise.all([
      hostFetch(`${API}/host/venues`),
      hostFetch(`${API}/host/hero-templates`),
      hostFetch(`${API}/host/custom-event-types`)
    ]);
    const venueData = await venueRes.json().catch(() => ({ venues: [] }));
    const heroData = await heroRes.json().catch(() => ({ heroTemplates: [] }));
    const typeData = await typeRes.json().catch(() => ({ customEventTypes: [] }));
    setVenues(venueData.venues || []);
    setHeroTemplates(heroData.heroTemplates || []);
    setCustomEventTypes(typeData.customEventTypes || []);
  }

  React.useEffect(() => {
    loadEvents();
    loadVenueAndTemplateOptions();
  }, []);

  function editEvent(event) {
    setEditingId(event.id);
    setForm({
      venueId: event.venueId || "",
      templateId: event.templateId || "",
      posterTemplateSlug: event.posterTemplateSlug || "",
      posterOverlayLayout: event.posterOverlayLayout || "",
      heroVariant: event.heroVariant || defaultHeroVariantForEvent(event.eventType, event.title),
      heroImageUrl: event.heroImageUrl || "",
      heroFit: event.heroFit || "cover",
      showHeroGraphic: event.showHeroGraphic !== false,
      eventTypeTags: Array.isArray(event.eventTypeTags) ? event.eventTypeTags : [],
      mixerGoal: event.mixerGoal || "",
      saveVenueWithEvent: false,
      saveHeroWithEvent: false,
      meetMingleEnabled: event.meetMingleEnabled === true,
      meetMingleGameId: event.meetMingleGameId || "",
      meetMingleGameMode: event.meetMingleGameMode || "full_90",
      meetMingleMaxRsvps: event.meetMingleMaxRsvps || 60,
      meetMingleMaxCheckins: event.meetMingleMaxCheckins || 60,
      meetMinglePointMode: event.meetMinglePointMode || "single",
      meetMingleZones: event.meetMingleZones || "Host Stand",
      meetMingleDrinkSpecialTitle: event.meetMingleDrinkSpecialTitle || "",
      meetMingleDrinkSpecialDetails: event.meetMingleDrinkSpecialDetails || "",
      meetMingleDrinkSpecialWindow: event.meetMingleDrinkSpecialWindow || "During BARFLYDATE session only",
      meetMingleDrinkSpecialRestrictions: event.meetMingleDrinkSpecialRestrictions || "21+, venue rules apply",
      title: event.title || "",
      eventType: event.eventType || "special",
      customEventType: event.customEventType || "",
      venueName: event.venueName || "",
      venueLocation: event.venueLocation || "",
      dayOfWeek: event.dayOfWeek ?? 1,
      daysOfWeek: Array.isArray(event.daysOfWeek) && event.daysOfWeek.length ? event.daysOfWeek : [event.dayOfWeek ?? 1],
      startTime: event.startTime || "19:00",
      endTime: event.endTime || "22:00",
      recurringWeekly: event.recurringWeekly !== false,
      onlineOnly: !!event.onlineOnly,
      eventStatus: event.eventStatus || "scheduled",
      date: event.date || "",
      description: event.description || "",
      prizeSpecial: event.prizeSpecial || "",
      sponsorName: event.sponsorName || "",
      sponsorLogoUrl: event.sponsorLogoUrl || "",
      venueLogoUrl: event.venueLogoUrl || "",
      eventImageUrl: event.eventImageUrl || "",
      prizeName: event.prizeName || "",
      prizeValue: event.prizeValue || "",
      redemptionRules: event.redemptionRules || "",
      expirationDate: event.expirationDate || "",
      paidEvent: !!event.paidEvent,
      ticketPrice: event.ticketPrice || "",
      paymentLink: event.paymentLink || "",
      buttonText: event.buttonText || "More Info",
      buttonLink: event.buttonLink || "/events",
      featured: !!event.featured,
      hidden: !!event.hidden
    });
  }

  async function saveEvent() {
    const wasEditing = Boolean(editingId);
    const safeDays = form.daysOfWeek && form.daysOfWeek.length ? form.daysOfWeek : [];
    const payload = {
      ...form,
      dayOfWeek: safeDays[0] ?? form.dayOfWeek,
      daysOfWeek: safeDays,
      eventType: form.eventType || inferCalendarEventType(form.eventTypeTags?.[0] || form.customEventType || ""),
      eventTypeTags: Array.isArray(form.eventTypeTags) ? form.eventTypeTags : [],
      meetMingleMaxRsvps: Number(form.meetMingleMaxRsvps) || defaultCapacityForMode(form.meetMingleGameMode),
      meetMingleMaxCheckins: Number(form.meetMingleMaxCheckins) || defaultCapacityForMode(form.meetMingleGameMode)
    };

    const completed = [];

    if (form.saveVenueWithEvent && form.venueName.trim()) {
      const venueRes = await hostFetch(`${API}/host/venues`, {
        method: "POST",
        headers: hostHeaders(true),
        body: JSON.stringify({
          name: form.venueName,
          address: form.venueLocation,
          city: "",
          logoUrl: form.venueLogoUrl,
          defaultPrizeRules: form.redemptionRules,
          defaultPlayLink: form.buttonLink,
          defaultEventNotes: form.description
        })
      });
      const venueData = await venueRes.json().catch(() => ({}));
      if (!venueRes.ok || venueData.error) return alert(venueData.error || "Could not save venue.");
      completed.push("venue");
    }

    if (form.saveHeroWithEvent && form.showHeroGraphic !== false && form.venueName.trim() && form.heroVariant && form.heroImageUrl.trim()) {
      const variant = heroVariants.find(item => item.value === form.heroVariant);
      const heroRes = await hostFetch(`${API}/host/hero-templates`, {
        method: "POST",
        headers: hostHeaders(true),
        body: JSON.stringify({
          venueName: form.venueName,
          heroVariant: form.heroVariant,
          heroVariantLabel: variant?.label || form.heroVariant,
          heroImageUrl: form.heroImageUrl,
          heroFit: form.heroFit || "cover",
          active: true,
          notes: `Saved from event builder: ${form.title || form.customEventType || "Untitled event"}`
        })
      });
      const heroData = await heroRes.json().catch(() => ({}));
      if (!heroRes.ok || heroData.error) return alert(heroData.error || "Could not save hero template.");
      completed.push("hero");
    }

    const url = editingId ? `${API}/host/events/${editingId}` : `${API}/host/events`;
    const res = await hostFetch(url, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      alert(data.error || "Could not save event. Check required fields and try again.");
      return;
    }

    const message = data.meetMingleSession
      ? (wasEditing ? "Event updated and Meet & Mingle session linked successfully." : "Event saved and Meet & Mingle session linked successfully.")
      : (wasEditing ? "Event updated successfully." : "Event saved successfully.");
    const extra = completed.length ? ` Also saved: ${completed.join(", ")}.` : "";
    setEditingId("");
    setForm(blank);
    setEvents(data.events || []);
    await loadVenueAndTemplateOptions();
    setSaveMessage(message + extra);
    setTimeout(() => setSaveMessage(""), 3200);
  }

  async function duplicateEvent(eventId) {
    const res = await hostFetch(`${API}/host/events/${eventId}/duplicate`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not duplicate event.");
    setEvents(data.events || []);
    setSaveMessage("Event duplicated successfully.");
    setTimeout(() => setSaveMessage(""), 2400);
  }

  async function duplicateEventNextWeek(eventId) {
    const res = await hostFetch(`${API}/host/events/${eventId}/duplicate-next-week`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not duplicate event for next week.");
    setEvents(data.events || []);
    setSaveMessage("Event duplicated for next week successfully.");
    setTimeout(() => setSaveMessage(""), 2400);
  }

  async function deleteEvent(event) {
    const confirmText = event?.meetMingleGameId
      ? `Delete this event and unlink its Meet & Mingle session?\n\n${event.title || "Untitled event"}`
      : `Delete this event?\n\n${event?.title || "Untitled event"}`;
    if (!confirm(confirmText)) return;

    const res = await hostFetch(`${API}/host/events/${event.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not delete event.");
    setEvents(data.events || []);
    setSaveMessage(data.unlinkedMeetMingleSession ? "Event deleted and Meet & Mingle session unlinked successfully." : "Event deleted successfully.");
    setTimeout(() => setSaveMessage(""), 2600);
  }


  function matchingHeroTemplate(venueName, heroVariant) {
    const venueKey = slugifyText(venueName || "");
    return heroTemplates.find(template =>
      template.active !== false &&
      slugifyText(template.venueName || "") === venueKey &&
      template.heroVariant === heroVariant &&
      template.heroImageUrl
    ) || null;
  }

  function matchingHeroUrl(venueName, heroVariant) {
    return matchingHeroTemplate(venueName, heroVariant)?.heroImageUrl || "";
  }

  function useHeroTemplate(template) {
    if (!template) return;
    const matchedVenue = venues.find(venue => slugifyText(venue.name || "") === slugifyText(template.venueName || ""));
    setForm(current => ({
      ...current,
      venueId: matchedVenue?.id || current.venueId,
      venueName: template.venueName || current.venueName,
      venueLocation: matchedVenue ? [matchedVenue.address, matchedVenue.city].filter(Boolean).join(", ") : current.venueLocation,
      venueLogoUrl: matchedVenue?.logoUrl || current.venueLogoUrl,
      heroVariant: template.heroVariant || current.heroVariant,
      heroImageUrl: template.heroImageUrl || current.heroImageUrl,
      heroFit: template.heroFit || "cover",
      showHeroGraphic: true
    }));
  }

  function applyVenue(venueId) {
    const venue = venues.find(item => item.id === venueId);
    setForm(current => {
      if (!venue) return { ...current, venueId };
      const next = {
        ...current,
        venueId,
        venueName: venue.name || current.venueName,
        venueLocation: [venue.address, venue.city].filter(Boolean).join(", ") || current.venueLocation,
        venueLogoUrl: venue.logoUrl || current.venueLogoUrl,
        redemptionRules: venue.defaultPrizeRules || current.redemptionRules,
        meetMingleDrinkSpecialRestrictions: venue.defaultPrizeRules || current.meetMingleDrinkSpecialRestrictions,
        buttonLink: venue.defaultPlayLink || current.buttonLink,
        description: current.description || venue.defaultEventNotes || ""
      };
      const heroTemplate = matchingHeroTemplate(next.venueName, next.heroVariant);
      return heroTemplate ? { ...next, heroImageUrl: heroTemplate.heroImageUrl, heroFit: heroTemplate.heroFit || "cover" } : next;
    });
  }

  function applyCustomEventType(label) {
    if (!label) return;
    const eventType = inferCalendarEventType(label);
    const heroVariant = heroVariantForCustomType(label);
    const title = label;
    setForm(current => {
      const next = {
        ...current,
        title,
        customEventType: label,
        eventType,
        heroVariant,
        buttonText: eventType === "karaoke" ? "Song Request" : "RSVP",
        meetMingleEnabled: eventType !== "escape_room",
        meetMingleGameMode: current.meetMingleGameMode || "social_60"
      };
      const heroTemplate = matchingHeroTemplate(next.venueName, next.heroVariant);
      return heroTemplate ? { ...next, heroImageUrl: heroTemplate.heroImageUrl, heroFit: heroTemplate.heroFit || "cover" } : next;
    });
  }


  function applyPreset(preset) {
    const defaultCapacity = defaultCapacityForMode(preset.meetMingleGameMode || "full_90");
    setForm(current => {
      const next = {
        ...current,
        title: preset.title,
        eventType: preset.eventType,
        customEventType: preset.customEventType,
        heroVariant: preset.heroVariant,
        posterTemplateSlug: preset.posterTemplateSlug,
        posterOverlayLayout: preset.posterOverlayLayout,
        description: preset.description,
        prizeSpecial: preset.prizeSpecial,
        startTime: preset.startTime,
        endTime: preset.endTime,
        buttonText: preset.buttonText,
        onlineOnly: !!preset.onlineOnly,
        meetMingleEnabled: preset.meetMingleEnabled !== false,
        meetMingleGameMode: preset.meetMingleGameMode || "full_90",
        meetMingleMaxRsvps: current.meetMingleMaxRsvps || defaultCapacity,
        meetMingleMaxCheckins: current.meetMingleMaxCheckins || defaultCapacity,
        buttonLink: preset.onlineOnly ? current.buttonLink : (preset.meetMingleEnabled === false ? current.buttonLink : "/events")
      };
      const heroTemplate = matchingHeroTemplate(next.venueName, next.heroVariant);
      return heroTemplate ? { ...next, heroImageUrl: heroTemplate.heroImageUrl, heroFit: heroTemplate.heroFit || "cover" } : next;
    });
  }

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function toggleEventDay(day) {
    setForm(current => {
      const currentDays = Array.isArray(current.daysOfWeek) ? current.daysOfWeek : [];
      const exists = currentDays.includes(day);
      const nextDays = exists ? currentDays.filter(item => item !== day) : [...currentDays, day];
      const safeDays = nextDays.sort((a,b) => a-b);
      return { ...current, daysOfWeek: safeDays, dayOfWeek: safeDays[0] ?? "" };
    });
  }

  function toggleEventTypeTag(label) {
    setForm(current => {
      const currentTags = Array.isArray(current.eventTypeTags) ? current.eventTypeTags : [];
      const exists = currentTags.includes(label);
      const nextTags = exists ? currentTags.filter(item => item !== label) : [...currentTags, label];
      const primary = nextTags[0] || "";
      const autoDisplay = nextTags.join(" • ");
      const eventType = primary ? inferCalendarEventType(primary) : "";
      const heroVariant = primary ? heroVariantForCustomType(primary) : current.heroVariant;
      const shouldReplaceDisplay = !current.customEventType || current.customEventType === currentTags.join(" • ");
      const next = {
        ...current,
        eventTypeTags: nextTags,
        eventType,
        heroVariant,
        customEventType: shouldReplaceDisplay ? autoDisplay : current.customEventType,
        title: current.title || autoDisplay
      };
      const heroTemplate = matchingHeroTemplate(next.venueName, next.heroVariant);
      return heroTemplate ? { ...next, heroImageUrl: heroTemplate.heroImageUrl, heroFit: heroTemplate.heroFit || "cover", showHeroGraphic: true } : next;
    });
  }

  const suggestedHeroTemplate = matchingHeroTemplate(form.venueName, form.heroVariant);
  const suggestedHeroUrl = suggestedHeroTemplate?.heroImageUrl || "";
  const heroPreviewUrl = form.showHeroGraphic === false ? "" : (form.heroImageUrl || suggestedHeroUrl || form.eventImageUrl || "");
  const heroFit = form.heroFit === "contain" ? "contain" : "cover";
  const activeHeroTemplates = heroTemplates.filter(template => template.active !== false && template.heroImageUrl);

  function useSuggestedHero() {
    if (!suggestedHeroTemplate) {
      alert("No matching venue hero saved for this venue + event type yet.");
      return;
    }
    useHeroTemplate(suggestedHeroTemplate);
  }

  function useNoHeroGraphic() {
    setForm(current => ({
      ...current,
      showHeroGraphic: false,
      heroImageUrl: "",
      heroFit: "cover"
    }));
  }

  function quickSaveLabel() {
    if (editingId) return form.meetMingleEnabled ? "Update Event + Session" : "Update Event";
    return form.meetMingleEnabled ? "Save Event + Session" : "Save Event";
  }

  function applyMatchingHero() {
    useSuggestedHero();
  }

  return <div className="card glowCard hostEventsPanel" id="host-events">
    <div className="brandMark">BARFLY EVENTS CALENDAR</div>
    <h2>{editingId ? "Edit Weekly Event" : "Add Weekly Event"}</h2>
    {saveMessage && <div className="successBanner">✅ {saveMessage}</div>}

    <div className="card quickEventBuilder">
      <div className="brandMark">QUICK EVENT BUILDER</div>
      <h3>Guided Setup</h3>
      <p className="muted">Choose a preset, pick a venue, confirm the time, and save. Advanced fields are still available below.</p>

      <div className="wizardStep">
        <span>1</span>
        <div>
          <h4>Choose event type(s)</h4>
          <div className="multiTypeGrid">
            {customEventTypes.map(label => <button type="button" key={label} className={(form.eventTypeTags || []).includes(label) ? "typeChip selected" : "typeChip"} onClick={() => toggleEventTypeTag(label)}>{label}</button>)}
          </div>
          <label>Display Name</label>
          <input value={form.customEventType} onChange={e => update("customEventType", e.target.value)} placeholder="Trivia • Bingo • Karaoke, Latino Night, etc." />
          <p className="microcopy">Choose one or multiple types. The first selected type becomes the primary type for logic and hero suggestions.</p>

          <details className="miniDetails">
            <summary>Use Preset</summary>
            <div className="presetGrid">
              {eventSetupPresets.map(preset => <button type="button" key={preset.key} className={form.heroVariant === preset.heroVariant && form.customEventType === preset.customEventType ? "presetCard active" : "presetCard"} onClick={() => applyPreset(preset)}>
                <b>{preset.icon} {preset.label}</b>
                <small>{preset.meetMingleEnabled === false ? "Standard event" : "Meet & Mingle ready"}</small>
              </button>)}
            </div>
          </details>
          <p className="microcopy">Need another option? Use Manage Event Types in this section.</p>
        </div>
      </div>

      <div className="wizardStep">
        <span>2</span>
        <div>
          <h4>Choose venue</h4>
          <div className="twoCol">
            <div><label>Saved Venue</label><select value={form.venueId} onChange={e => applyVenue(e.target.value)}>
              <option value="">Choose saved venue or enter new below</option>
              {venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
            </select></div>
            <div><label>Venue Name</label><input value={form.venueName} onChange={e => update("venueName", e.target.value)} placeholder="Venue name" /></div>
            <div><label>Address / City</label><input value={form.venueLocation} onChange={e => update("venueLocation", e.target.value)} placeholder="Address, City" /></div>
            <div className="fullWidth"><label className="checkRow"><input type="checkbox" checked={!!form.saveVenueWithEvent} onChange={e => update("saveVenueWithEvent", e.target.checked)} /><span>Save this venue for future events</span></label></div>
          </div>
        </div>
      </div>

      <div className="wizardStep">
        <span>3</span>
        <div>
          <h4>Set date and time</h4>
          <div className="twoCol">
            <div className="fullWidth"><label>Event Days</label><div className="dayCheckGrid">{weeklyDayOptions.map(day => <label key={day.value} className="checkRow dayCheck"><input type="checkbox" checked={(form.daysOfWeek || []).includes(day.value)} onChange={() => toggleEventDay(day.value)} /><span>{day.label}</span></label>)}</div><p className="microcopy">For Monday–Friday events, select Monday through Friday once and save one event.</p></div>
            <div><label>One-time Date <span className="muted">optional</span></label><input type="date" value={form.date || ""} onChange={e => update("date", e.target.value)} /></div>
            <div><label>Start Time</label><input type="time" value={form.startTime} onChange={e => update("startTime", e.target.value)} /></div>
            <div><label>End Time</label><input type="time" value={form.endTime} onChange={e => update("endTime", e.target.value)} /></div>
          </div>
          <label className="checkRow"><input type="checkbox" checked={!!form.recurringWeekly} onChange={e => update("recurringWeekly", e.target.checked)} /><span>Repeat weekly</span></label>
        </div>
      </div>

      <div className="wizardStep">
        <span>4</span>
        <div>
          <h4>Confirm hero and Meet & Mingle</h4>
          <div className="twoCol">
            <div className="fullWidth"><label className="checkRow"><input type="checkbox" checked={form.showHeroGraphic !== false} onChange={e => update("showHeroGraphic", e.target.checked)} /><span>Use hero graphic for this event</span></label><p className="microcopy">Turn this off for a clean text-only event card with no blank image box.</p></div>
            <div><label>Hero Fit</label><select value={form.heroFit || "cover"} onChange={e => update("heroFit", e.target.value)}><option value="cover">Cover / Fill Box</option><option value="contain">Contain / Show Full Image</option></select></div>
          </div>
          <label className="checkRow"><input type="checkbox" checked={!!form.saveHeroWithEvent} onChange={e => update("saveHeroWithEvent", e.target.checked)} /><span>Save this hero for this venue and event type</span></label>

          <div className="heroTemplateGallery">
            <div className="brandMark">HERO TEMPLATE GALLERY</div>
            <h4>Choose a saved hero preview</h4>
            {activeHeroTemplates.length === 0 && <p className="muted">No saved hero templates with image URLs yet.</p>}
            <div className="heroGalleryGrid">
              <button type="button" className={form.showHeroGraphic === false ? "heroGalleryCard noHeroGalleryCard selected" : "heroGalleryCard noHeroGalleryCard"} onClick={useNoHeroGraphic}>
                <div className="heroGalleryThumb noHeroThumb"><span>No Image</span></div>
                <b>No Hero Graphic</b>
                <span>Use clean text-only event card</span>
                <small>No image box</small>
              </button>
              {activeHeroTemplates.map(template => <button type="button" key={template.id} className={form.showHeroGraphic !== false && form.heroImageUrl === template.heroImageUrl ? "heroGalleryCard selected" : "heroGalleryCard"} onClick={() => useHeroTemplate(template)}>
                <div className="heroGalleryThumb" style={{ backgroundImage: `url(${template.heroImageUrl})`, backgroundSize: template.heroFit === "contain" ? "contain" : "cover" }} />
                <b>{template.venueName}</b>
                <span>Saved hero preview</span>
                <small>{template.heroFit === "contain" ? "Contain" : "Cover"}</small>
              </button>)}
            </div>
          </div>

          <div className="heroGraphicPreviewWindow">
            <div className="brandMark">HERO GRAPHIC PREVIEW</div>
            {form.showHeroGraphic === false ? <div className="heroGraphicPreview noHeroPreview">
              <div>
                <span className="brandMark">NO HERO GRAPHIC</span>
                <b>{form.title || "Event Title"}</b>
                <p>{form.venueName || "Venue"} • {form.customEventType || form.title || "Event"}</p>
              </div>
            </div> : <div className={heroPreviewUrl ? "heroGraphicPreview hasImage" : "heroGraphicPreview"} style={heroPreviewUrl ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.34)), url(${heroPreviewUrl})`, backgroundSize: heroFit, backgroundRepeat: "no-repeat", backgroundPosition: "center" } : undefined}>
              {!heroPreviewUrl && <div className="eventTemplateFallback">Hero Graphic</div>}
              <div className="heroGraphicPreviewOverlay">
                <span>{form.venueName || "Venue"}</span>
                <b>{form.title || "Event Title"}</b>
                <small>{heroVariantLabel(form.heroVariant)}</small>
              </div>
            </div>}
            <p className="microcopy">{form.showHeroGraphic === false ? "No hero image will be shown. The event card will use a clean text-only layout." : `This is the 4:5 hero area used on the event card. Use 1080×1350 or 2160×2700 hero graphics. Current fit: ${heroFit === "contain" ? "Contain / show full image" : "Cover / fill box"}.`}</p>
            {heroUrlWarning(form.heroImageUrl) && <p className="warningText">{heroUrlWarning(form.heroImageUrl)}</p>}
          </div>
        </div>
      </div>

      <div className="wizardStep">
        <span>5</span>
        <div>
          <h4>Event details</h4>
          <div className="twoCol">
            <div><label>Event Title</label><input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Event title" /></div>
            <div><label>Primary Button Text</label><input value={form.buttonText} onChange={e => update("buttonText", e.target.value)} placeholder="RSVP, Play, Song Request" /></div>
            <div className="fullWidth"><label>Description</label><textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Short public description" /></div>
            <div><label>Prize / Special</label><input value={form.prizeSpecial} onChange={e => update("prizeSpecial", e.target.value)} placeholder="Free to play. Play for prizes." /></div>
            <div><label>Button Link</label><input value={form.buttonLink} onChange={e => update("buttonLink", e.target.value)} placeholder="/events or https://..." /></div>
          </div>
        </div>
      </div>

      <div className="wizardStep">
        <span>6</span>
        <div>
          <h4>Meet & Mingle options</h4>
          <label className="checkRow"><input type="checkbox" checked={!!form.meetMingleEnabled} onChange={e => update("meetMingleEnabled", e.target.checked)} /><span>Add Meet & Mingle RSVP/check-in to this event</span></label>
          {form.meetMingleEnabled && <div className="twoCol">
            <div><label>Meet & Mingle Goal</label><select value={form.mixerGoal} onChange={e => update("mixerGoal", e.target.value)}>
              {mixerGoalOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select><p className="microcopy">{mixerGoalOptions.find(option => option.value === form.mixerGoal)?.details}</p></div>
            <div><label>Session Length</label><select value={form.meetMingleGameMode} onChange={e => {
              const mode = e.target.value;
              const defaultCapacity = defaultCapacityForMode(mode);
              setForm(current => ({ ...current, meetMingleGameMode: mode, meetMingleMaxRsvps: current.meetMingleMaxRsvps || defaultCapacity, meetMingleMaxCheckins: current.meetMingleMaxCheckins || defaultCapacity }));
            }}>
              <option value="">Choose session length</option>
              {gameModeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select></div>
            <div><label>Max RSVPs</label><input type="number" value={form.meetMingleMaxRsvps} onChange={e => update("meetMingleMaxRsvps", e.target.value)} /></div>
            <div><label>Max Check-ins</label><input type="number" value={form.meetMingleMaxCheckins} onChange={e => update("meetMingleMaxCheckins", e.target.value)} /></div>
          </div>}
          {form.meetMingleEnabled && form.mixerGoal && <p className="microcopy">Round apps auto-load for: {mixerGoalLabel(form.mixerGoal)}. You do not need to manually pick each round.</p>}
        </div>
      </div>

      <div className="quickPreviewCard">
        <div>
          <span className="brandMark">PREVIEW</span>
          <h3>{form.title}</h3>
          <p>{form.venueName} • {daysLabel(form.daysOfWeek)} • {formatEventTime(form.startTime)}–{formatEventTime(form.endTime)}</p>
          <p className="microcopy">{form.meetMingleEnabled ? "Meet & Mingle session will be created/updated." : "Standard event listing only."}</p>
        </div>
        <div>
          <Button onClick={saveEvent}>{quickSaveLabel()}</Button>
        </div>
      </div>
    </div>

    <details className="advancedEventDetails">
      <summary><b>Advanced Event Details</b><span>Open for logos, buttons, payments, sponsors, manual hero URLs, and advanced Meet & Mingle settings.</span></summary>
      <div className="twoCol">
      <div><label>Saved Venue</label><select value={form.venueId} onChange={e => applyVenue(e.target.value)}>
        <option value="">No saved venue</option>
        {venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
      </select></div>
      <div><label>Hero Image URL</label><input value={form.heroImageUrl} disabled={form.showHeroGraphic === false} onChange={e => update("heroImageUrl", e.target.value)} placeholder="Paste hero image URL or choose a saved preview" />{form.showHeroGraphic === false && <p className="microcopy">No Hero Graphic is selected.</p>}{heroUrlWarning(form.heroImageUrl) && <p className="warningText">{heroUrlWarning(form.heroImageUrl)}</p>}</div>
      <div><label>Hero Fit</label><select value={form.heroFit || "cover"} onChange={e => update("heroFit", e.target.value)}><option value="cover">Cover / Fill Box</option><option value="contain">Contain / Show Full Image</option></select></div>
      <div><label>Event Title</label><input value={form.title} onChange={e => update("title", e.target.value)} /></div>
      <div><label>Primary Event Category</label><select value={form.eventType} onChange={e => update("eventType", e.target.value)}><option value="">Choose primary category</option>{calendarEventTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>
      <div><label>Display Event Type</label><input value={form.customEventType} onChange={e => update("customEventType", e.target.value)} placeholder="80’s Arcade Trivia, Workday Blackout Bingo, Digital Mystery" /></div>
      <div><label>Venue</label><input value={form.venueName} onChange={e => update("venueName", e.target.value)} /></div>
      <div><label>Address / City</label><input value={form.venueLocation} onChange={e => update("venueLocation", e.target.value)} /></div>
      <div className="fullWidth"><label>Event Days</label><div className="dayCheckGrid">{weeklyDayOptions.map(day => <label key={day.value} className="checkRow dayCheck"><input type="checkbox" checked={(form.daysOfWeek || []).includes(day.value)} onChange={() => toggleEventDay(day.value)} /><span>{day.label}</span></label>)}</div></div>
      <div><label>Start Time</label><input type="time" value={form.startTime} onChange={e => update("startTime", e.target.value)} /></div>
      <div><label>End Time</label><input type="time" value={form.endTime} onChange={e => update("endTime", e.target.value)} /></div>
      <div><label>Event Status</label><select value={form.eventStatus} onChange={e => update("eventStatus", e.target.value)}>
        <option value="scheduled">Scheduled</option>
        <option value="tonight">Tonight</option>
        <option value="cancelled">Cancelled</option>
        <option value="postponed">Postponed</option>
        <option value="sold_out">Sold Out</option>
      </select></div>
      <div><label>Primary Button Name</label><input value={form.buttonText} onChange={e => update("buttonText", e.target.value)} placeholder="Play Bingo, Play Trivia, RSVP, More Info" /></div>
    </div>
    <label>Description</label>
    <textarea value={form.description} onChange={e => update("description", e.target.value)} />
    <label>Prize / Special</label>
    <input value={form.prizeSpecial} onChange={e => update("prizeSpecial", e.target.value)} />
    <div className="twoCol">
      <div><label>Sponsor Name</label><input value={form.sponsorName} onChange={e => update("sponsorName", e.target.value)} placeholder="Topgolf, El Paso, Urban Daiquiris" /></div>
      <div><label>Sponsor Logo URL</label><input value={form.sponsorLogoUrl} onChange={e => update("sponsorLogoUrl", e.target.value)} placeholder="https://..." /><p className="microcopy imageHelp">Sponsor Logo = who is sponsoring or providing the prize.</p></div>
      <div><label>Event Image URL</label><input value={form.eventImageUrl} onChange={e => update("eventImageUrl", e.target.value)} placeholder="https://..." /><p className="microcopy imageHelp">Event Image = the flyer, hero image, or main graphic for this event.</p></div>
      <div><label>Prize Name</label><input value={form.prizeName} onChange={e => update("prizeName", e.target.value)} placeholder="$15 off gameplay" /></div>
      <div><label>Prize Value</label><input value={form.prizeValue} onChange={e => update("prizeValue", e.target.value)} placeholder="$15, free entrée, etc." /></div>
      <div><label>Expiration Date</label><input value={form.expirationDate} onChange={e => update("expirationDate", e.target.value)} placeholder="4/30/2026" /></div>
      <div><label>Redemption Rules</label><input value={form.redemptionRules} onChange={e => update("redemptionRules", e.target.value)} placeholder="Dine-in only, 21+, before 11 PM" /></div>
    </div>
    <div className="imageFieldGuide">
      <div><b>Sponsor Logo</b><span>Prize sponsor / presenting business</span></div>
      <div><b>Venue Logo</b><span>Location hosting the event</span></div>
      <div><b>Event Image</b><span>Main flyer or promotional graphic</span></div>
    </div>
    <p className="microcopy">Recommended images: public PNG, JPG, WEBP, or SVG URLs. Transparent PNG works best. Square logos: 500×500. Horizontal logos: 1000×500.</p>

    <div className="card miniSettingsCard monetizationBox">
      <div className="brandMark">MONETIZATION</div>
      <label className="checkRow"><input type="checkbox" checked={form.paidEvent} onChange={e => update("paidEvent", e.target.checked)} /><span>Paid Event / Ticketed Event</span></label>
      <div className="twoCol">
        <div><label>Ticket Price</label><input value={form.ticketPrice} onChange={e => update("ticketPrice", e.target.value)} placeholder="$10, $15/team, free with purchase" /></div>
        <div><label>Payment / Ticket Link</label><input value={form.paymentLink} onChange={e => update("paymentLink", e.target.value)} placeholder="Square, Stripe, PayPal, Venmo, Eventbrite link" /></div>
      </div>
      <p className="microcopy">For paid events, the main public button becomes “Buy Ticket” unless you type a custom Primary Button Name.</p>
    </div>

    <label>Primary Button Link</label>
    <input value={form.buttonLink} onChange={e => update("buttonLink", e.target.value)} placeholder="/radar or https://games.barfly.social/elpasobingo" />
    <p className="microcopy">This is the main public button for online games. Example: Button Name “Play Bingo” + Button Link “https://games.barfly.social/elpasobingo”.</p>

    <div className="primaryActionPreview">Public button preview: <b>{form.meetMingleEnabled ? "RSVP" : (form.buttonText || (form.eventType === "barfly_social" ? "View Meet & Mingle / RSVP" : form.eventType === "escape_room" ? "Start Escape Room" : form.eventType === "mystery" ? "Start Mystery" : form.onlineOnly ? "Play Now" : "More Info"))}</b></div>

    <div className="card miniSettingsCard meetMingleEventBox">
      <div className="brandMark">MEET & MINGLE SESSION</div>
      <label className="checkRow"><input type="checkbox" checked={!!form.meetMingleEnabled} onChange={e => update("meetMingleEnabled", e.target.checked)} /><span>Enable Meet & Mingle for this event</span></label>
      <p className="microcopy">When enabled, saving this event also creates or updates a linked Meet & Mingle session for RSVP, Sparks, My RSVP, and venue check-in.</p>
      {form.meetMingleEnabled && <>
        {form.meetMingleGameId && <p className="microcopy">Linked session ID: {form.meetMingleGameId}</p>}
        <div className="twoCol">
          <div><label>Session Length</label><select value={form.meetMingleGameMode} onChange={e => {
            const mode = e.target.value;
            const defaultCapacity = defaultCapacityForMode(mode);
            setForm(current => ({ ...current, meetMingleGameMode: mode, meetMingleMaxRsvps: current.meetMingleMaxRsvps || defaultCapacity, meetMingleMaxCheckins: current.meetMingleMaxCheckins || defaultCapacity }));
          }}>
            {gameModeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select></div>
          <div><label>Meeting Point Mode</label><select value={form.meetMinglePointMode} onChange={e => update("meetMinglePointMode", e.target.value)}>
            <option value="single">Single Meeting Point</option>
            <option value="multiple">Multiple Zones</option>
            <option value="none">No Location Assignment</option>
          </select></div>
          <div><label>Max RSVPs</label><input type="number" min="2" max="250" value={form.meetMingleMaxRsvps} onChange={e => update("meetMingleMaxRsvps", Number(e.target.value))} /></div>
          <div><label>Max Check-ins</label><input type="number" min="2" max="250" value={form.meetMingleMaxCheckins} onChange={e => update("meetMingleMaxCheckins", Number(e.target.value))} /></div>
        </div>
        {form.meetMinglePointMode !== "none" && <>
          <label>{form.meetMinglePointMode === "single" ? "Meeting Point" : "Meeting Zones"}</label>
          <textarea value={form.meetMingleZones} onChange={e => update("meetMingleZones", e.target.value)} placeholder={form.meetMinglePointMode === "single" ? "Host Stand" : "Host Stand\nBar Area\nPatio\nStage Side"} />
          <p className="microcopy">Enter one zone per line. These are used for live introductions and check-in.</p>
        </>}
        <div className="twoCol">
          <div><label>Drink Special Title</label><input value={form.meetMingleDrinkSpecialTitle} onChange={e => update("meetMingleDrinkSpecialTitle", e.target.value)} placeholder="$1 off featured drink" /></div>
          <div><label>Drink Special Details</label><input value={form.meetMingleDrinkSpecialDetails} onChange={e => update("meetMingleDrinkSpecialDetails", e.target.value)} placeholder="Optional player-facing detail" /></div>
          <div><label>Redeem Window</label><input value={form.meetMingleDrinkSpecialWindow} onChange={e => update("meetMingleDrinkSpecialWindow", e.target.value)} placeholder="During Barfly Social session only" /></div>
          <div><label>Restrictions</label><input value={form.meetMingleDrinkSpecialRestrictions} onChange={e => update("meetMingleDrinkSpecialRestrictions", e.target.value)} placeholder="21+, venue rules apply" /></div>
        </div>
      </>}
    </div>

    <div className="row">
      <label className="checkRow"><input type="checkbox" checked={form.onlineOnly} onChange={e => update("onlineOnly", e.target.checked)} /><span>Online Only</span></label>
      <label className="checkRow"><input type="checkbox" checked={form.featured} onChange={e => update("featured", e.target.checked)} /><span>Featured</span></label>
      <label className="checkRow"><input type="checkbox" checked={form.hidden} onChange={e => update("hidden", e.target.checked)} /><span>Hidden</span></label>
    </div>

    <div className="ctaRow">
      <Button onClick={saveEvent}>{editingId ? "Update Event" : "Add Event"}</Button>
      {editingId && <Button className="secondary" onClick={() => { setEditingId(""); setForm(blank); }}>Cancel Edit</Button>}
      <Button className="secondary" onClick={() => window.location.href = "/events"}>View Public Calendar</Button>
      <Button className="secondary" onClick={() => window.location.href = "/qr/events"}>Events QR</Button>
    </div>

    </details>

    <h3>Current Calendar Events</h3>
    {events.length === 0 && <p className="muted">No calendar events yet.</p>}
    {events.map(event => <div className="rsvpRow" key={event.occurrenceKey || event.id}>
      <div>
        <b>{event.title}</b>
        <p className="muted">{event.eventTypeLabel || eventTypeCalendarLabel(event.eventType)} • {event.dayLabel} {formatEventTime(event.startTime)}–{formatEventTime(event.endTime)}</p>
        <p className="microcopy">{event.venueName} • {eventActionBadge(event)} • {eventStatusLabel(event.eventStatus)} {event.hidden ? "• hidden" : ""} {event.featured ? "• featured" : ""}</p>
        <p className="microcopy">Primary button: {event.buttonText || (event.paidEvent ? "Buy Ticket" : "More Info")} → {event.paidEvent ? (event.paymentLink || event.buttonLink || event.publicPath) : (event.buttonLink || event.publicPath)}</p>
        {event.paidEvent && <p className="microcopy paymentLine">Paid Event: {event.ticketPrice || "Price not listed"} {event.paymentLink ? "• payment link added" : "• no payment link yet"}</p>}
        <p className="microcopy">Meet & Mingle: {event.meetMingleEnabled === false ? "off" : (event.meetMingleGameId ? `linked session ${event.meetMingleGameId}` : "enabled")}</p>
        <p className="microcopy">Page: {event.publicPath}</p>
      </div>
      <div className="hostPlayerActions playerViewActions">
        <Button className="secondary" onClick={() => window.location.href = event.publicPath}>View</Button>
        <Button className="secondary" onClick={() => copyEventCaption(event, {})}>Copy Caption</Button>
        <Button className="secondary" onClick={() => editEvent(event)}>Edit</Button>
        <Button className="secondary" onClick={() => duplicateEvent(event.id)}>Duplicate</Button>
        <Button className="secondary" onClick={() => duplicateEventNextWeek(event.id)}>Next Week</Button>
        <Button className="danger" onClick={() => deleteEvent(event)}>Delete Event</Button>
      </div>
    </div>)}
  </div>;
}



function HostPanelShell({ title, children, actionMessage = "", onBack }) {
  return <div className="screen hostManagerCompact hostIconSectionScreen">
    <div className="row hostTopActions">
      <Button className="secondary" onClick={onBack}>← Back to Host</Button>
      <Button className="secondary" onClick={() => { localStorage.removeItem("barflydateHostPin"); window.location.reload(); }}>Lock Host Suite</Button>
    </div>
    <div className="brandMark">HOST SUITE</div>
    <h1>{title}</h1>
    <p className="tagline">Make changes inside this section, then use the section Save and Cancel buttons.</p>
    {actionMessage && <div className="successBanner">✅ {actionMessage}</div>}
    {children}
  </div>;
}

function HostManager() {
  if (!getHostPin()) return <HostLogin />;
  const [games, setGames] = React.useState([]);
  const [venueName, setVenueName] = React.useState("");
  const [venueLocation, setVenueLocation] = React.useState("");
  const [drinkSpecialTitle, setDrinkSpecialTitle] = React.useState("");
  const [drinkSpecialDetails, setDrinkSpecialDetails] = React.useState("");
  const [drinkSpecialWindow, setDrinkSpecialWindow] = React.useState("");
  const [drinkSpecialRestrictions, setDrinkSpecialRestrictions] = React.useState("");
  const [eventType, setEventType] = React.useState("");
  const [mixerGoal, setMixerGoal] = React.useState("");
  const [meetingPointMode, setMeetingPointMode] = React.useState("");
  const [meetingZones, setMeetingZones] = React.useState("");
  const [gameMode, setGameMode] = React.useState("");
  const [maxRsvps, setMaxRsvps] = React.useState("");
  const [maxCheckins, setMaxCheckins] = React.useState("");
  const [demoCount, setDemoCount] = React.useState(12);
  const [health, setHealth] = React.useState(null);
  const [actionMessage, setActionMessage] = React.useState("");
  const [selectedHostSection, setSelectedHostSection] = React.useState("");

  async function loadGames() {
    const res = await hostFetch(`${API}/games`);
    setGames(await res.json());
  }

  React.useEffect(() => {
    loadGames();
    fetch(`${API}/health`).then(res => res.json()).then(setHealth).catch(() => setHealth(null));
  }, []);

  async function createGame() {
    const res = await fetch(`${API}/games`, {
      method: "POST",
      headers: hostHeaders(true),
      body: JSON.stringify({ venueName, venueLocation, eventType, mixerGoal, drinkSpecialTitle, drinkSpecialDetails, drinkSpecialWindow, drinkSpecialRestrictions, meetingPointMode, meetingZones, gameMode, maxRsvps, maxCheckins })
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
        eventType: last.eventType || "",
        mixerGoal: last.mixerGoal || "",
        drinkSpecialTitle: last.drinkSpecial?.title || "",
        drinkSpecialDetails: last.drinkSpecial?.details || "",
        drinkSpecialWindow: last.drinkSpecial?.redeemWindow || "During BARFLYDATE session only",
        drinkSpecialRestrictions: last.drinkSpecial?.restrictions || "21+, venue rules apply",
        meetingPointMode: last.meetingSetup?.mode || "single",
        meetingZones: (last.meetingSetup?.zones || []).join("\\n"),
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


  async function deleteGame(game) {
    if (!confirm(`Delete this session?\n\n${game?.venueName || "Selected session"} ${game?.gameCode ? `• Code ${game.gameCode}` : ""}`)) return;
    const res = await hostFetch(`${API}/games/${game.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not delete session.");
    await loadGames();
    setActionMessage("Session deleted successfully.");
    setTimeout(() => setActionMessage(""), 2400);
  }

  const totalOpenReports = games.reduce((sum, game) => sum + (game.openSafetyReportCount || 0), 0);

  const hostTiles = [
    { key: "events", icon: "📅", title: "Events", text: "Create and manage public events." },
    { key: "venues", icon: "📍", title: "Venues", text: "Saved venue partner information." },
    { key: "heroes", icon: "🖼️", title: "Hero Graphics", text: "Hero templates and QR tools." },
    { key: "settings", icon: "⚙️", title: "App Settings", text: "Contact info, links, and promo text." },
    { key: "games", icon: "🎮", title: "Games / Iframes", text: "Game links, Barfly TV, and mixer sessions." },
    { key: "reports", icon: "📊", title: "Reports", text: "Bookings, analytics, and backups." }
  ];


  if (selectedHostSection === "events") return <HostPanelShell title="Events" actionMessage={actionMessage} onBack={() => setSelectedHostSection("")}>
    <HostEventCalendar />
    <HostEventTypeManager />
    <HostEventsPanel />
  </HostPanelShell>;

  if (selectedHostSection === "venues") return <HostPanelShell title="Venues" actionMessage={actionMessage} onBack={() => setSelectedHostSection("")}>
    <HostVenueManager />
  </HostPanelShell>;

  if (selectedHostSection === "heroes") return <HostPanelShell title="Hero Graphics" actionMessage={actionMessage} onBack={() => setSelectedHostSection("")}>
    <HostHeroTemplateManager />
    <div className="card glowCard" id="host-qr-tools">
      <div className="brandMark">QR TOOLS</div>
      <h2>Generate Public QR Codes</h2>
      <div className="ctaRow">
        <Button className="secondary" onClick={() => window.location.href = "/qr/events"}>Events QR</Button>
        <Button className="secondary" onClick={() => window.location.href = "/qr/book"}>Booking QR</Button>
        <Button className="secondary" onClick={() => window.location.href = "/qr/demo"}>Demo QR</Button>
        <Button className="secondary" onClick={() => window.location.href = "/qr/cohost"}>Co-Host QR</Button>
      </div>
    </div>
  </HostPanelShell>;

  if (selectedHostSection === "settings") return <HostPanelShell title="App Settings" actionMessage={actionMessage} onBack={() => setSelectedHostSection("")}>
    <HostSettingsPanel />
  </HostPanelShell>;

  if (selectedHostSection === "games") return <HostPanelShell title="Games / Iframes" actionMessage={actionMessage} onBack={() => setSelectedHostSection("")}>
    <HostGameIframeSettingsPanel />

    <div className="card glowCard" id="create-social-session">
      <div className="brandMark">MEET & MINGLE</div>
      <h2>Quick Create Social Mixer Session</h2>
      <label>Event Name</label>
      <input value={venueName} onChange={e => setVenueName(e.target.value)} />
      <label>Venue Location</label>
      <input value={venueLocation} onChange={e => setVenueLocation(e.target.value)} placeholder="e.g. Baton Rouge, LA" />

      <label>Event Type</label>
      <select value={eventType} onChange={e => setEventType(e.target.value)}>
        <option value="">Choose event type</option>
        {eventTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <label>Mixer Goal</label>
      <select value={mixerGoal} onChange={e => setMixerGoal(e.target.value)}>
        {mixerGoalOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <label>Meeting Point Mode</label>
      <select value={meetingPointMode} onChange={e => setMeetingPointMode(e.target.value)}>
        <option value="">Choose meeting point mode</option>
        <option value="single">Single Meeting Point</option>
        <option value="multiple">Multiple Zones</option>
        <option value="none">No Location Assignment</option>
      </select>
      {meetingPointMode !== "none" && <>
        <label>{meetingPointMode === "single" ? "Meeting Point" : "Meeting Zones"}</label>
        <textarea value={meetingZones} onChange={e => setMeetingZones(e.target.value)} placeholder={meetingPointMode === "single" ? "Host Stand" : "Host Stand\nBar Area\nPatio\nStage Side"} />
      </>}

      <label>Session Length</label>
      <select value={gameMode} onChange={e => { const mode = e.target.value; setGameMode(mode); setMaxRsvps(defaultCapacityForMode(mode)); setMaxCheckins(defaultCapacityForMode(mode)); }}>
        {gameModeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <div className="twoCol">
        <div><label>Max RSVPs</label><input type="number" min="2" max="250" value={maxRsvps} onChange={e => setMaxRsvps(Number(e.target.value))} /></div>
        <div><label>Max Check-ins</label><input type="number" min="2" max="250" value={maxCheckins} onChange={e => setMaxCheckins(Number(e.target.value))} /></div>
      </div>
      <div className="ctaRow">
        <Button onClick={createGame}>Create Meet & Mingle Session</Button>
        <Button className="secondary" onClick={duplicateLastSession}>Duplicate Last Session</Button>
      </div>
    </div>

    <div className="card glowCard testGameCard">
      <div className="brandMark">TEST MODE</div>
      <h2>Create Test Game</h2>
      <label>Demo Players</label>
      <select value={demoCount} onChange={e => setDemoCount(Number(e.target.value))}>
        <option value={8}>8 demo players</option>
        <option value={12}>12 demo players</option>
        <option value={18}>18 demo players</option>
        <option value={24}>24 demo players</option>
        <option value={36}>36 demo players</option>
      </select>
      <Button onClick={createDemoGame}>Create Test Game</Button>
    </div>

    <div className="card glowCard">
      <div className="brandMark">ACTIVE GAMES</div>
      <div className="compact">
        <h2>Active Games</h2>
        <Button className="secondary" onClick={loadGames}>Refresh Games</Button>
      </div>
      {games.length === 0 && <p className="muted">No games created yet.</p>}
      {games.map(game => <div className="rsvpRow" key={game.id}>
        <div>
          <b>{game.venueName}</b>
          <p className="muted">Code: <b>{game.gameCode}</b> • {capacityText(game.capacity)}</p>
          <p className="microcopy">{game.eventTypeInfo?.label || eventTypeLabel(game.eventType)} • {game.modeLabel || gameModeLabel(game.gameMode)} • {game.phaseLabel}</p>
          <p className={game.openSafetyReportCount ? "dangerText" : "muted"}>Safety Reports: {game.openSafetyReportCount || 0} open / {game.safetyReportCount || 0} total</p>
        </div>
        <div className="hostPlayerActions playerViewActions">
          <Button onClick={() => window.location.href = `/host/${game.id}`}>Open Dashboard</Button>
          <Button className="danger" onClick={() => deleteGame(game)}>Delete</Button>
        </div>
      </div>)}
    </div>
  </HostPanelShell>;

  if (selectedHostSection === "reports") return <HostPanelShell title="Reports" actionMessage={actionMessage} onBack={() => setSelectedHostSection("")}>
    <HostBookingCalendar />
    <HostAnalyticsDashboard />
    <div className="card glowCard" id="host-backup-tools">
      <div className="brandMark">BACKUP</div>
      <h2>Export Backup</h2>
      <p className="muted">Download a backup of current Barfly Social data.</p>
      <Button className="secondary" onClick={() => window.location.href = `${API}/host/backup?hostPin=${encodeURIComponent(getHostPin())}`}>Export Backup</Button>
    </div>
  </HostPanelShell>;

  return <div className="screen hostManagerCompact hostIconHome">
    <div className="row hostTopActions">
      <Button className="secondary" onClick={() => { localStorage.removeItem("barflydateHostPin"); window.location.reload(); }}>Lock Host Suite</Button>
    </div>
    <div className="brandMark">HOST SUITE</div>
    <h1>Admin Home</h1>
    <p className="tagline">Choose a section. Each section opens in a focused panel with its own save/cancel controls where changes are made.</p>
    <div className="versionRow">
      <span className="statusPill">{APP_VERSION}</span>
      <StorageStatus health={health} />
    </div>

    {totalOpenReports > 0 && <div className="alert">
      Safety attention needed: {totalOpenReports} open report{totalOpenReports === 1 ? "" : "s"} across active sessions.
    </div>}

    <div className="hostIconGrid">
      {hostTiles.map(tile => <button type="button" key={tile.key} className="hostIconTile" onClick={() => setSelectedHostSection(tile.key)}>
        <span>{tile.icon}</span>
        <b>{tile.title}</b>
        <small>{tile.text}</small>
      </button>)}
    </div>

    <div className="card glowCard hostShortcutCard">
      <div className="brandMark">QUICK LINKS</div>
      <div className="ctaRow">
        <Button className="secondary" onClick={() => window.location.href = "/home"}>Public App Home</Button>
        <Button className="secondary" onClick={() => window.location.href = "/demo"}>Business Demo</Button>
        <Button className="secondary" onClick={() => window.location.href = "/cohost"}>Co-Host Dashboard</Button>
      </div>
    </div>
  </div>;
}
function CoHostLogin() {
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState("");

  async function login() {
    setError("");
    const res = await fetch(`${API}/cohost/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ pin })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      setError(data.error || "Invalid co-host PIN.");
      return;
    }
    localStorage.setItem("barflydateCohostPin", pin);
    window.location.reload();
  }

  return <div className="screen hostLogin cohostLogin">
    <div className="brandMark">CO-HOST ACCESS</div>
    <h1>Social Mixer Dashboard</h1>
    <p className="tagline">Run Meet & Mingle sessions without full host admin tools.</p>
    {error && <div className="alert">{error}</div>}
    <div className="card glowCard">
      <label>Co-Host PIN</label>
      <input value={pin} onChange={e => setPin(e.target.value)} placeholder="Enter co-host PIN" />
      <Button onClick={login}>Open Co-Host Dashboard</Button>
      <p className="microcopy">Default co-host PIN is set on the server with COHOST_PIN.</p>
    </div>
  </div>;
}

function CoHostDashboard() {
  if (!getCohostPin()) return <CoHostLogin />;

  const [sessions, setSessions] = React.useState([]);
  const [selectedGameId, setSelectedGameId] = React.useState("");
  const [game, setGame] = React.useState(null);
  const [rsvps, setRsvps] = React.useState([]);
  const [reports, setReports] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  async function loadSessions() {
    const res = await cohostFetch(`${API}/cohost/sessions`);
    const data = await res.json().catch(() => ({ sessions: [] }));
    if (!res.ok || data.error) {
      setError(data.error || "Could not load sessions.");
      return;
    }
    setSessions(data.sessions || []);
    setSelectedGameId(current => current || data.sessions?.[0]?.id || "");
  }

  async function loadSelected(id = selectedGameId) {
    if (!id) return;
    const [gameRes, rsvpRes, reportRes] = await Promise.all([
      cohostFetch(`${API}/cohost/games/${id}`),
      cohostFetch(`${API}/cohost/games/${id}/rsvps`),
      cohostFetch(`${API}/cohost/games/${id}/reports`)
    ]);

    const gameData = await gameRes.json().catch(() => ({}));
    const rsvpData = await rsvpRes.json().catch(() => ({ rsvps: [] }));
    const reportData = await reportRes.json().catch(() => ({ reports: [] }));

    if (!gameRes.ok || gameData.error) {
      setError(gameData.error || "Could not load selected session.");
      return;
    }

    setGame(gameData);
    setRsvps(rsvpData.rsvps || []);
    setReports(reportData.reports || []);
    setError("");
  }

  React.useEffect(() => { loadSessions().catch(() => setError("Could not load co-host dashboard.")); }, []);
  React.useEffect(() => {
    if (!selectedGameId) return;
    loadSelected(selectedGameId);
    const t = setInterval(() => loadSelected(selectedGameId), 2500);
    return () => clearInterval(t);
  }, [selectedGameId]);

  async function runAction(path, successText, body = null, confirmText = "") {
    if (confirmText && !confirm(confirmText)) return;
    setMessage("");
    setError("");
    const res = await cohostFetch(`${API}${path}`, {
      method: "POST",
      ...(body ? { headers: cohostHeaders(true), body: JSON.stringify(body) } : {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      setError(data.error || "Action failed.");
      return;
    }
    setMessage(successText);
    setTimeout(() => setMessage(""), 2200);
    await loadSessions();
    await loadSelected(selectedGameId);
  }

  function filteredRsvps() {
    const q = search.trim().toLowerCase();
    if (!q) return rsvps;
    return rsvps.filter(rsvp => [
      rsvp.nickname,
      rsvp.realName,
      rsvp.contactHandle,
      rsvp.lookingForLabel,
      (rsvp.interests || []).join(" ")
    ].some(value => String(value || "").toLowerCase().includes(q)));
  }

  const checkedIn = rsvps.filter(r => r.checkedIn).length;
  const currentSessionName = game?.linkedEventTitle || game?.venueName || "Selected Session";

  return <div className="screen hostManagerCompact cohostDashboard">
    <div className="row">
      <Button className="secondary" onClick={() => { localStorage.removeItem("barflydateCohostPin"); window.location.reload(); }}>Lock Co-Host</Button>
      <Button className="secondary" onClick={() => window.location.href = "/host"}>Full Host Login</Button>
    </div>

    <div className="brandMark">CO-HOST DASHBOARD</div>
    <h1>Run Social Mixer</h1>
    <p className="tagline">Live tools only: choose session, manage check-ins, monitor safety, and run the mixer.</p>
    <div className="versionRow"><span className="statusPill">{APP_VERSION}</span><span className="statusPill storageOk">Co-host mode</span></div>

    {error && <div className="alert">{error}</div>}
    {message && <div className="successBanner">✅ {message}</div>}

    <div className="card glowCard cohostStep">
      <div className="brandMark">STEP 1</div>
      <h2>Choose Active Session</h2>
      <select value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)}>
        <option value="">Select a session</option>
        {sessions.map(session => <option key={session.id} value={session.id}>
          {(session.linkedEventTitle || session.venueName)} — {session.venueName} — {session.status}
        </option>)}
      </select>
    </div>

    {game && <div className="card glowCard cohostStep">
      <div className="brandMark">STEP 2</div>
      <h2>{currentSessionName}</h2>
      <p className="muted">{game.venueName} {game.venueLocation ? `• ${game.venueLocation}` : ""}</p>
      <div className="statsGrid">
        <div><span>Session Code</span><b>{game.gameCode || "Hidden"}</b></div>
        <div><span>Status</span><b>{game.status}</b></div>
        <div><span>Phase</span><b>{game.phaseLabel || "Lobby"}</b></div>
        <div><span>RSVPs</span><b>{rsvps.length}</b></div>
        <div><span>Checked In</span><b>{checkedIn}</b></div>
        <div><span>Players</span><b>{game.players?.length || 0}</b></div>
      </div>
      <p className="microcopy">Meeting zones: {meetingZonesText(game.meetingSetup)}</p>
      <DrinkSpecialCard special={game.drinkSpecial} />
      <div className="ctaRow">
        {game.status === "lobby" && <Button onClick={() => runAction(`/cohost/games/${game.id}/start-game`, "Session started.")}>Start Session</Button>}
        {!["lobby","paused","complete"].includes(game.status) && <Button className="secondary" onClick={() => runAction(`/cohost/games/${game.id}/pause`, "Session paused.")}>Pause</Button>}
        {game.status === "paused" && <Button onClick={() => runAction(`/cohost/games/${game.id}/resume`, "Session resumed.")}>Resume</Button>}
        {!["lobby","paused","complete"].includes(game.status) && <Button className="secondary" onClick={() => runAction(`/cohost/games/${game.id}/skip-phase`, "Advanced to next phase.")}>Next Round / Phase</Button>}
        {game.status !== "complete" && <Button className="danger" onClick={() => runAction(`/cohost/games/${game.id}/end-game`, "Session moved to reveal/end.", null, "End this session and move it to reveal/end?")}>End Session</Button>}
      </div>
    </div>}

    {game && <div className="card glowCard cohostStep">
      <div className="brandMark">STEP 3</div>
      <h2>RSVP + Check-In List</h2>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alias, real name, contact, intention, sparks" />
      {filteredRsvps().length === 0 && <p className="muted">No guests match this search.</p>}
      {filteredRsvps().map(rsvp => <div className="rsvpRow" key={rsvp.id}>
        <div>
          <b>{rsvp.nickname}</b>
          <p className="muted">{rsvp.realName || "No real name"} • {rsvp.lookingForLabel} • {rsvp.checkedIn ? "Checked in" : rsvp.status}</p>
          <p className="microcopy">{(rsvp.interests || []).join(" • ") || "No sparks listed"}</p>
        </div>
        <div className="hostPlayerActions playerViewActions">
          {!rsvp.checkedIn && <Button className="secondary" onClick={() => runAction(`/cohost/games/${game.id}/checkin-rsvp`, `${rsvp.nickname} checked in.`, { rsvpId: rsvp.id })}>Check In</Button>}
          {!rsvp.checkedIn && <Button className="secondary" onClick={() => runAction(`/cohost/rsvps/${rsvp.id}/no-show`, "Guest marked no-show successfully.", null, `Mark this guest as no-show?\n\n${rsvp.nickname || "Selected guest"}`)}>No-Show</Button>}
          {!rsvp.checkedIn && <Button className="danger" onClick={() => runAction(`/cohost/rsvps/${rsvp.id}/cancel`, "RSVP cancelled successfully.", null, `Cancel this RSVP?\n\n${rsvp.nickname || "Selected guest"}`)}>Cancel</Button>}
        </div>
      </div>)}
    </div>}

    {game && <div className="card glowCard cohostStep">
      <div className="brandMark">STEP 4</div>
      <h2>Checked-In Players + Safety</h2>
      {(game.players || []).filter(player => !player.removedAt).length === 0 && <p className="muted">No checked-in players yet.</p>}
      {(game.players || []).filter(player => !player.removedAt).map(player => <div className="rsvpRow" key={player.id}>
        <div>
          <b>{player.nickname}</b>
          <p className="muted">{lookingForLabel(player.lookingFor)} • {player.isActive === false ? "inactive" : "active"}</p>
          <p className="microcopy">{(player.interests || []).join(" • ")}</p>
        </div>
        <div className="hostPlayerActions playerViewActions">
          <Button className="danger" onClick={() => runAction(`/cohost/games/${game.id}/remove-player`, "Player removed successfully.", { playerId: player.id }, `Remove this player from the session?\n\n${player.nickname || "Selected player"}`)}>Remove Player</Button>
        </div>
      </div>)}

      <h3>Safety Reports</h3>
      {reports.length === 0 && <p className="muted">No safety reports.</p>}
      {reports.map(report => <div className="alert" key={report.id}>
        <b>{report.reporterAlias} reported {report.reportedAlias}</b>
        <p>{report.reason} {report.note ? `• ${report.note}` : ""}</p>
      </div>)}
    </div>}
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
  const [actionMessage, setActionMessage] = React.useState("");

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
    if (!confirm(`Remove this player from the session?\n\n${alias || "Selected player"}`)) return;
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
    setActionMessage("Player removed successfully.");
    setTimeout(() => setActionMessage(""), 2400);
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
    if (!confirm(`Cancel this RSVP?\n\n${rsvp.nickname || "Selected guest"}`)) return;
    const res = await hostFetch(`${API}/host/rsvps/${rsvp.id}/cancel`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not cancel RSVP.");
    setActionMessage("RSVP cancelled successfully.");
    setTimeout(() => setActionMessage(""), 2400);
    refresh();
  }

  async function hostMarkNoShow(rsvp) {
    if (!confirm(`Mark this guest as no-show?\n\n${rsvp.nickname || "Selected guest"}`)) return;
    const res = await hostFetch(`${API}/host/rsvps/${rsvp.id}/mark-no-show`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return alert(data.error || "Could not mark no-show.");
    setActionMessage("Guest marked no-show successfully.");
    setTimeout(() => setActionMessage(""), 2400);
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
      <p className="microcopy">Mixer Goal: {mixerGoalLabel(game.mixerGoal)} • Round apps are hidden from host view.</p>
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
        <Button className="secondary" onClick={() => window.location.href = "/forecast"}>View Meet & Mingle</Button>
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
      {saved && <div className="successBanner">✅ {saved}</div>}
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

    {saved && <div className="successBanner">✅ {saved}</div>}

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
  if (parts[0] === "home") return <HomePage />;
  if (parts[0] === "game" && parts[1]) return <GameIframePage />;
  if (parts[0] === "games") {
    window.location.replace("/home");
    return null;
  }
  if (parts[0] === "barfly-tv") return <BarflyTVPage />;
  if (parts[0] === "play") return <PlayOnlinePage />;
  if (parts[0] === "calendar") {
    window.location.replace("/events");
    return null;
  }
  if (parts[0] === "events" && parts[1]) return <EventDetail />;
  if (parts[0] === "events") return <EventsCalendar />;
  if (parts[0] === "tonight" || parts[0] === "this-week") return <TonightPage />;
  if (parts[0] === "venue" && parts[1]) return <VenuePage />;
  if (parts[0] === "book" || parts[0] === "booking") return <BookingPage />;
  if (parts[0] === "social-wall") return <SocialWall />;
  if (parts[0] === "business-demo" || parts[0] === "demo") return <BusinessDemo />;
  if (parts[0] === "qr") return <QrDisplay />;
  if (parts[0] === "forecast" || parts[0] === "radar") return <Forecast />;
  if (parts[0] === "rsvp") return <RSVP />;
  if (parts[0] === "checkin") return <CheckIn />;
  if (parts[0] === "my-rsvp") return <MyRSVP />;
  if (parts[0] === "join") return <Join />;

  if (parts[0] === "cohost") return <CoHostDashboard />;
  if (parts[0] === "host" && parts[1] && parts[2] === "report") return <BusinessReport />;
  if (parts[0] === "host" && parts[1] && parts[2] === "event") return <HostEventMode />;
  if (parts[0] === "host" && parts[1]) return <HostGame />;
  if (parts[0] === "host") return <HostManager />;
  if (parts[0] === "player") return <Player />;
  if (parts[0] === "vote") return <Vote />;
  if (parts[0] === "connections") return <Connections />;
  if (parts[0] === "recap") return <Recap />;
  if (parts[0] === "results") return <Results />;
  return <HomePage />;
}

createRoot(document.getElementById("root")).render(<App />);
