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

function scorePair(a, b, previousPairs) {
  let score = 0;
  if (mutualPreference(a, b)) score += 60;
  if (a.lookingFor === b.lookingFor) score += 20;
  score += sharedInterests(a, b).length * 9;
  if (previousPairs.has(pairKey(a, b))) score -= 140;
  return score;
}

function createPairings(players, previousPairKeys) {
  const active = players.filter(p => p.isActive !== false);
  const previousPairs = new Set(previousPairKeys || []);
  const candidates = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const score = scorePair(a, b, previousPairs);
      if (score > -90) candidates.push({ players: [a, b], score });
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

  // Avoid awkward sit-outs. If one person is left and there is at least one pair,
  // turn the lowest-scoring pair into a three-person mini group.
  if (leftovers.length === 1 && groups.length > 0) {
    const group = groups[groups.length - 1];
    group.players.push(leftovers[0]);
    group.type = "trio";
    used.add(leftovers[0].id);
  }

  // If exactly 3 active players, create a trio.
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
  createPairings
};
