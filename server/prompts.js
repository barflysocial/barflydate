const promptLibrary = {
  Hobbies: {
    tier: "light",
    prompts: [
      "What’s something you could talk about for hours without getting bored?",
      "If you had a free day with no responsibilities, what are you doing?",
      "What’s a hobby you’ve always wanted to try but haven’t yet?"
    ]
  },
  Travel: {
    tier: "light",
    prompts: [
      "Beach, mountains, or city — what’s your vibe?",
      "What’s the best trip you’ve ever taken?",
      "If I gave you a free flight tonight, where are you going?"
    ]
  },
  "Food & Drink": {
    tier: "light",
    prompts: [
      "What’s your go-to drink on a night out?",
      "Late night food: tacos, wings, or pizza?",
      "What’s one food you absolutely refuse to eat?"
    ]
  },
  Entertainment: {
    tier: "light",
    prompts: [
      "What’s a movie or show you can rewatch anytime?",
      "Music: hype, chill, or throwbacks?",
      "If we’re in the car together, what are you playing first?"
    ]
  },
  "Life Goals": {
    tier: "deep",
    prompts: [
      "What’s something big you’re working toward right now?",
      "Would you rather build a career you love or one that pays big?",
      "Where do you see yourself in 5 years — real answer?"
    ]
  },
  Values: {
    tier: "deep",
    prompts: [
      "What’s one trait you really respect in people?",
      "Are you more of a ‘follow your heart’ or ‘think it through’ person?",
      "What’s something you stand on no matter what?"
    ]
  },
  Adventure: {
    tier: "middle",
    prompts: [
      "What’s the most spontaneous thing you’ve ever done?",
      "Would you try skydiving if someone paid for it?",
      "Are you more ‘plan it’ or ‘just go for it’?"
    ]
  },
  Lifestyle: {
    tier: "middle",
    prompts: [
      "Are you an early bird or night owl?",
      "What does your perfect weekend look like?",
      "Do you like going out more or staying in?"
    ]
  },
  Quirks: {
    tier: "middle",
    prompts: [
      "What’s a weird habit you have?",
      "What’s something random people would never guess about you?",
      "What’s your most controversial opinion? Keep it fun."
    ]
  }
};

const categories = Object.keys(promptLibrary);

const appOrders = {
  quick_30: ["Food & Drink", "Entertainment", "Lifestyle", "Quirks"],
  social_60: ["Food & Drink", "Entertainment", "Hobbies", "Lifestyle", "Adventure", "Values"],
  full_90: ["Food & Drink", "Entertainment", "Hobbies", "Travel", "Adventure", "Lifestyle", "Quirks", "Values", "Life Goals"]
};

function appOrderForGameMode(gameMode = "full_90") {
  return appOrders[gameMode] || appOrders.full_90;
}

function plannedCategoryForRound(round, gameMode = "full_90") {
  const order = appOrderForGameMode(gameMode);
  const index = Math.max(0, Math.min(order.length - 1, Number(round || 1) - 1));
  return order[index] || order[0] || "Food & Drink";
}


function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sharedInterests(players) {
  if (!players || players.length < 2) return [];
  const counts = {};
  players.forEach(player => {
    const unique = new Set(player.interests || []);
    unique.forEach(item => counts[item] = (counts[item] || 0) + 1);
  });
  return Object.entries(counts)
    .filter(([_, count]) => count >= 2)
    .map(([item]) => item)
    .filter(item => categories.includes(item));
}

function tierForRound(round) {
  if (round <= 3) return "light";
  if (round <= 6) return "middle";
  return "deep";
}

function weightedCategoryForGroup(players, round, gameMode = "full_90") {
  // BARFLYDATE v11: planned app journey by session length.
  // This keeps the night paced intentionally:
  // quick = light/fun, social = balanced, full = full discovery arc.
  return plannedCategoryForRound(round, gameMode);
}

function promptsFor(category) {
  return promptLibrary[category]?.prompts || promptLibrary.Quirks.prompts;
}

module.exports = {
  promptLibrary,
  categories,
  appOrders,
  appOrderForGameMode,
  plannedCategoryForRound,
  sharedInterests,
  weightedCategoryForGroup,
  promptsFor,
  tierForRound
};
