function wants(a, b) {
  if (!a || !b) return false;
  if (a.interestedIn === "everyone") return true;
  if (a.interestedIn === "men" && b.gender === "man") return true;
  if (a.interestedIn === "women" && b.gender === "woman") return true;
  return false;
}

function mutualPreference(a, b) {
  return wants(a, b) && wants(b, a);
}

function pairKey(a, b) {
  return [a.id, b.id].sort().join("-");
}

function groupKey(players) {
  return players.map(p => p.id).sort().join("-");
}

function sharedInterests(a, b) {
  return (a.interests || []).filter(x => (b.interests || []).includes(x));
}

function normalizeIntent(value) {
  if (value === "date") return "casual_dating";
  if (value === "friend") return "friends_only";
  if (value === "social") return "activity_partners";
  return value || "activity_partners";
}

function intentCompatibility(aIntent, bIntent) {
  const a = normalizeIntent(aIntent);
  const b = normalizeIntent(bIntent);

  if (a === b) return 30;

  const compatible = {
    friends_only: ["activity_partners"],
    activity_partners: ["friends_only", "casual_dating"],
    casual_dating: ["activity_partners"],
    serious_dating: ["marriage"],
    marriage: ["serious_dating"]
  };

  if ((compatible[a] || []).includes(b)) return 16;
  if ((a === "casual_dating" && b === "marriage") || (a === "marriage" && b === "casual_dating")) return -35;
  if ((a === "friends_only" && ["serious_dating", "marriage"].includes(b)) || (b === "friends_only" && ["serious_dating", "marriage"].includes(a))) return -20;
  return -8;
}

function ageRangeScore(a, b) {
  const aMin = Number(a.preferredMinAge || 18);
  const aMax = Number(a.preferredMaxAge || 99);
  const bMin = Number(b.preferredMinAge || 18);
  const bMax = Number(b.preferredMaxAge || 99);
  const overlap = Math.max(0, Math.min(aMax, bMax) - Math.max(aMin, bMin));
  if (overlap >= 8) return 18;
  if (overlap >= 3) return 10;
  if (overlap > 0) return 5;
  return -14;
}

function reportPenalty(a, b, context = {}) {
  const reports = context.reports || [];
  const reported = reports.some(r =>
    (r.fromPlayerId === a.id && r.toPlayerId === b.id) ||
    (r.fromPlayerId === b.id && r.toPlayerId === a.id)
  );
  return reported ? -250 : 0;
}

function mutualSkipPenalty(a, b, context = {}) {
  const decisions = context.decisions || [];
  const ab = decisions.find(d => d.fromPlayerId === a.id && d.toPlayerId === b.id);
  const ba = decisions.find(d => d.fromPlayerId === b.id && d.toPlayerId === a.id);
  if (ab?.decision === "skip" && ba?.decision === "skip") return -180;
  if (ab?.decision === "skip" || ba?.decision === "skip") return -40;
  return 0;
}

function positiveHistoryScore(a, b, context = {}) {
  const decisions = context.decisions || [];
  const ab = decisions.find(d => d.fromPlayerId === a.id && d.toPlayerId === b.id);
  const ba = decisions.find(d => d.fromPlayerId === b.id && d.toPlayerId === a.id);
  let score = 0;
  if (["yes", "maybe"].includes(ab?.decision)) score += 6;
  if (["yes", "maybe"].includes(ba?.decision)) score += 6;
  if (["definitely", "open"].includes(ab?.outsideChoice)) score += 4;
  if (["definitely", "open"].includes(ba?.outsideChoice)) score += 4;
  return score;
}

function scorePair(a, b, previousPairs, context = {}) {
  let score = 0;
  score += mutualPreference(a, b) ? 70 : -45;
  score += intentCompatibility(a.lookingFor, b.lookingFor);
  score += ageRangeScore(a, b);
  score += sharedInterests(a, b).length * 10;
  score += positiveHistoryScore(a, b, context);
  score += reportPenalty(a, b, context);
  score += mutualSkipPenalty(a, b, context);
  if (previousPairs.has(pairKey(a, b))) score -= 160;
  return score;
}

function createPairings(players, previousPairKeys, context = {}) {
  const active = players.filter(p => p.isActive !== false);
  const previousPairs = new Set(previousPairKeys || []);
  const candidates = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const score = scorePair(a, b, previousPairs, context);
      if (score > -120) candidates.push({ players: [a, b], score });
    }
  }

  candidates.sort((x, y) => y.score - x.score);

  const used = new Set();
  const groups = [];

  for (const c of candidates) {
    const [a, b] = c.players;
    if (!used.has(a.id) && !used.has(b.id)) {
      groups.push({ players: [a, b], score: c.score, type: "pair" });
      used.add(a.id);
      used.add(b.id);
    }
  }

  const leftovers = active.filter(p => !used.has(p.id));

  if (leftovers.length === 1 && groups.length > 0) {
    const group = groups[groups.length - 1];
    group.players.push(leftovers[0]);
    group.type = "trio";
    group.score = Math.round((group.score || 0) * 0.85);
    used.add(leftovers[0].id);
  }

  if (groups.length === 0 && leftovers.length === 3) {
    groups.push({ players: leftovers, score: 0, type: "trio" });
    leftovers.forEach(p => used.add(p.id));
  }

  const sittingOut = active.filter(p => !used.has(p.id));
  return { groups, sittingOut };
}

module.exports = {
  wants,
  mutualPreference,
  pairKey,
  groupKey,
  sharedInterests,
  createPairings,
  intentCompatibility,
  scorePair,
  ageRangeScore
};
