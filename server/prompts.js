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
  },
  Volunteering: {
    tier: "middle",
    prompts: [
      "What cause would you actually show up for?",
      "Have you ever volunteered for something that stuck with you?",
      "What community issue do you wish more people cared about?"
    ]
  },
  Running: {
    tier: "light",
    prompts: [
      "Are you more of a casual walker, jogger, or race-day runner?",
      "What would make a fun 5K worth signing up for?",
      "Do you like solo workouts or group fitness energy?"
    ]
  }
};


Object.assign(promptLibrary, {
  Career: { tier: "middle", prompts: ["What kind of work gives you energy?", "What career move are you thinking about next?", "What professional skill are you proud of?"] },
  Industry: { tier: "middle", prompts: ["What industry trend are you watching?", "What do people misunderstand about your work?", "What kind of people do you most like working with?"] },
  "Business Goals": { tier: "deep", prompts: ["What business goal are you building toward?", "What would make this year professionally successful?", "What kind of opportunity are you hoping to find?"] },
  Skills: { tier: "middle", prompts: ["What skill do people usually come to you for?", "What skill are you currently improving?", "What do you wish more people knew how to do?"] },
  Community: { tier: "middle", prompts: ["What local community issue matters to you?", "How do you like to get involved locally?", "What would make this city better for professionals?"] },
  Leadership: { tier: "deep", prompts: ["What makes someone a good leader?", "How do you like to be managed or supported?", "What leadership lesson have you learned the hard way?"] },
  Projects: { tier: "middle", prompts: ["What project are you excited about right now?", "What kind of collaboration would help you?", "What project would you start if time and money were solved?"] },
  Collaboration: { tier: "middle", prompts: ["What makes someone easy to collaborate with?", "Are you more idea person, planner, or finisher?", "What kind of partner makes your work better?"] },
  Events: { tier: "light", prompts: ["What brought you to this event?", "What kind of event would you love to attend next?", "What is a great follow-up after tonight?"] },
  "Follow-Up": { tier: "light", prompts: ["Who would you want to follow up with after this?", "What is an easy way for someone to stay in touch?", "Coffee meeting, phone call, or email follow-up?"] },
  Personality: { tier: "middle", prompts: ["How would your friends describe your personality?", "What type of energy do you bring into a room?", "Are you more spontaneous or steady?"] },
  Chemistry: { tier: "middle", prompts: ["What makes conversation feel natural to you?", "What kind of humor do you connect with?", "What makes you want a second conversation?"] },
  Communication: { tier: "deep", prompts: ["What communication style works best for you?", "How do you usually handle misunderstandings?", "What makes you feel heard?"] },
  "Future Plans": { tier: "deep", prompts: ["What are you looking forward to in the next year?", "What future plan are you serious about?", "What does a good life look like to you?"] },
  Dealbreakers: { tier: "deep", prompts: ["What is a small thing that tells you a lot about someone?", "What value do you not compromise on?", "What mismatch is hard for you to overlook?"] },
  "Faith / Beliefs": { tier: "deep", prompts: ["What belief or value guides your decisions?", "How important is shared belief or worldview to you?", "What tradition or principle matters to you?"] },
  Family: { tier: "deep", prompts: ["What role does family play in your life?", "What family tradition do you appreciate?", "What does support look like to you?"] },
  Finances: { tier: "deep", prompts: ["How do you think about saving versus enjoying life?", "What financial habit matters in a partner?", "What does being responsible with money mean to you?"] },
  "Conflict Style": { tier: "deep", prompts: ["How do you handle conflict when emotions are high?", "Do you need space or conversation after disagreement?", "What helps repair tension?"] },
  "Home Life": { tier: "deep", prompts: ["What does a peaceful home feel like?", "Are you more neat, relaxed, or somewhere in between?", "What home routine matters to you?"] },
  Parenting: { tier: "deep", prompts: ["What values should kids learn early?", "What does good parenting mean to you?", "How do you think families should handle hard conversations?"] },
  "Future Vision": { tier: "deep", prompts: ["What future are you trying to build?", "Where do you hope life is headed in five years?", "What does commitment look like long term?"] }
});


const categories = Object.keys(promptLibrary);

const appOrders = {
  quick_30: ["Food & Drink", "Entertainment", "Lifestyle", "Quirks"],
  social_60: ["Food & Drink", "Entertainment", "Hobbies", "Lifestyle", "Adventure", "Values"],
  full_90: ["Food & Drink", "Entertainment", "Hobbies", "Travel", "Adventure", "Lifestyle", "Quirks", "Values", "Life Goals"]
};

const mixerGoalOrders = {
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

function appOrderForGameMode(gameMode = "full_90", mixerGoal = "") {
  const goal = mixerGoalOrders[mixerGoal] || null;
  return goal?.[gameMode] || goal?.full_90 || appOrders[gameMode] || appOrders.full_90;
}

function plannedCategoryForRound(round, gameMode = "full_90", mixerGoal = "") {
  const order = appOrderForGameMode(gameMode, mixerGoal);
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

function weightedCategoryForGroup(players, round, gameMode = "full_90", mixerGoal = "") {
  return plannedCategoryForRound(round, gameMode, mixerGoal);
}

function promptsFor(category) {
  return promptLibrary[category]?.prompts || promptLibrary.Quirks.prompts;
}

module.exports = {
  promptLibrary,
  categories,
  appOrders,
  mixerGoalOrders,
  appOrderForGameMode,
  plannedCategoryForRound,
  sharedInterests,
  weightedCategoryForGroup,
  promptsFor,
  tierForRound
};
