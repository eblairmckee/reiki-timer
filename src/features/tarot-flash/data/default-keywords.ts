import type { CardMeaning, CatalogCard } from "../model/types";

interface KeywordDefault {
  readonly reversed: readonly string[];
  readonly source: string;
  readonly upright: readonly string[];
}

// Labyrinthos's individual card keyword tables, reviewed 2026-11-14.
// Empty entries, duplicate keywords, invisible characters and obvious typos are cleaned.
// Eight of Pentacles uses a concise selection of its published keywords.
// Every orientation has published keywords; no inferred fallbacks were necessary.
export const keywordDefaults: Readonly<Record<string, KeywordDefault>> = {
  "cups-01": {
    reversed: [
      "coldness",
      "emptiness",
      "emotional loss",
      "blocked creativity",
      "feeling unloved",
      "gloominess",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ace-of-cups-meaning-tarot-card-meanings",
    upright: [
      "love",
      "new feelings",
      "emotional awakening",
      "creativity",
      "spirituality",
      "intuition",
    ],
  },
  "cups-02": {
    reversed: [
      "separation",
      "rejection",
      "division",
      "imbalance",
      "tension",
      "bad communication",
      "withdrawal",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/two-of-cups-meaning-tarot-card-meanings",
    upright: [
      "unity",
      "partnership",
      "attraction",
      "connection",
      "close bonds",
      "joining forces",
      "mutual respect",
    ],
  },
  "cups-03": {
    reversed: [
      "gossip",
      "scandal",
      "excess",
      "isolation",
      "loneliness",
      "solitude",
      "imbalanced social life",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/three-of-cups-meaning-tarot-card-meanings",
    upright: [
      "friendship",
      "community",
      "gatherings",
      "celebrations",
      "group events",
      "social events",
    ],
  },
  "cups-04": {
    reversed: [
      "clarity",
      "awareness",
      "acceptance",
      "choosing happiness",
      "depression",
      "negativity",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/four-of-cups-meaning-tarot-card-meanings",
    upright: [
      "apathy",
      "contemplation",
      "feeling disconnected",
      "melancholy",
      "boredom",
      "indifference",
      "discontent",
    ],
  },
  "cups-05": {
    reversed: ["acceptance", "moving on", "finding peace", "contentment", "seeing positives"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/five-of-cups-meaning-tarot-card-meanings",
    upright: [
      "loss",
      "grief",
      "disappointment",
      "sadness",
      "mourning",
      "discontent",
      "feeling let down",
    ],
  },
  "cups-06": {
    reversed: ["stuck in past", "moving forward", "leaving home", "independence"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/six-of-cups-meaning-tarot-card-meanings",
    upright: [
      "nostalgia",
      "memories",
      "familiarity",
      "healing",
      "comfort",
      "sentimentality",
      "pleasure",
    ],
  },
  "cups-07": {
    reversed: [
      "lack of purpose",
      "disarray",
      "confusion",
      "diversion",
      "distractions",
      "clarity",
      "making choices",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/seven-of-cups-meaning-tarot-card-meanings",
    upright: [
      "choices",
      "searching for purpose",
      "illusion",
      "fantasy",
      "daydreaming",
      "wishful thinking",
      "indecision",
    ],
  },
  "cups-08": {
    reversed: [
      "stagnation",
      "monotony",
      "accepting less",
      "avoidance",
      "fear of change",
      "staying in bad situation",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/eight-of-cups-meaning-tarot-card-meanings",
    upright: ["abandonment", "walking away", "letting go", "searching for truth", "leaving behind"],
  },
  "cups-09": {
    reversed: [
      "unhappiness",
      "lack of fulfilment",
      "disappointment",
      "underachievement",
      "arrogance",
      "snobbery",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/nine-of-cups-meaning-tarot-card-meanings",
    upright: [
      "wishes coming true",
      "contentment",
      "satisfaction",
      "success",
      "achievements",
      "recognition",
      "pleasure",
    ],
  },
  "cups-10": {
    reversed: ["unhappy home", "separation", "domestic conflict", "disharmony", "isolation"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ten-of-cups-meaning-tarot-card-meanings",
    upright: [
      "happiness",
      "homecomings",
      "fulfillment",
      "emotional stability",
      "security",
      "domestic harmony",
    ],
  },
  "cups-11": {
    reversed: [
      "emotional vulnerability",
      "immaturity",
      "neglecting inner child",
      "escapism",
      "insecurity",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/page-of-cups-meaning-tarot-card-meanings",
    upright: [
      "idealism",
      "sensitivity",
      "dreamer",
      "naivete",
      "innocence",
      "inner child",
      "head in the clouds",
    ],
  },
  "cups-12": {
    reversed: ["disappointment", "tantrums", "moodiness", "turmoil", "avoiding conflict", "vanity"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/knight-of-cups-meaning-tarot-card-meanings",
    upright: [
      "idealist",
      "charming",
      "artistic",
      "graceful",
      "tactful",
      "diplomatic",
      "mediator",
      "negotiator",
    ],
  },
  "cups-13": {
    reversed: [
      "insecurity",
      "giving too much",
      "overly-sensitive",
      "needy",
      "fragile",
      "dependence",
      "martyrdom",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/queen-of-cups-meaning-tarot-card-meanings",
    upright: [
      "compassion",
      "warmth",
      "kindness",
      "intuition",
      "healer",
      "counsellor",
      "supportive",
    ],
  },
  "cups-14": {
    reversed: [
      "overwhelmed",
      "anxious",
      "cold",
      "repressed",
      "withdrawn",
      "manipulative",
      "selfish",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/king-of-cups-meaning-tarot-card-meanings",
    upright: [
      "wise",
      "diplomatic",
      "balance between head and heart",
      "devoted",
      "advisor",
      "counsellor",
    ],
  },
  "major-00": {
    reversed: [
      "reckless",
      "careless",
      "distracted",
      "naive",
      "foolish",
      "gullible",
      "stale",
      "dull",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-fool-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "beginnings",
      "freedom",
      "innocence",
      "originality",
      "adventure",
      "idealism",
      "spontaneity",
    ],
  },
  "major-01": {
    reversed: ["manipulation", "cunning", "trickery", "wasted talent", "illusion", "deception"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-magician-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "willpower",
      "desire",
      "being resourceful",
      "skill",
      "ability",
      "concentration",
      "manifestation",
    ],
  },
  "major-02": {
    reversed: [
      "repressed intuition",
      "hidden motives",
      "superficiality",
      "confusion",
      "cognitive dissonance",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-high-priestess-meaning-major-arcana-tarot-card-meanings",
    upright: ["unconscious", "intuition", "mystery", "spirituality", "higher power", "inner voice"],
  },
  "major-03": {
    reversed: [
      "insecurity",
      "overbearing",
      "negligence",
      "smothering",
      "lack of growth",
      "lack of progress",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-empress-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "divine feminine",
      "sensuality",
      "fertility",
      "nurturing",
      "creativity",
      "beauty",
      "abundance",
      "nature",
    ],
  },
  "major-04": {
    reversed: ["tyrant", "domineering", "rigid", "stubborn", "lack of discipline", "recklessness"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-emperor-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "stability",
      "structure",
      "protection",
      "authority",
      "control",
      "practicality",
      "focus",
      "discipline",
    ],
  },
  "major-05": {
    reversed: ["rebellion", "unconventionality", "non-conformity", "new methods", "ignorance"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-hierophant-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "tradition",
      "social groups",
      "conventionality",
      "conformity",
      "education",
      "knowledge",
      "beliefs",
    ],
  },
  "major-06": {
    reversed: ["disharmony", "imbalance", "conflict", "detachment", "bad choices", "indecision"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-lovers-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "love",
      "unions",
      "partnerships",
      "relationships",
      "choices",
      "romance",
      "balance",
      "unity",
    ],
  },
  "major-07": {
    reversed: ["forceful", "no direction", "no control", "powerless", "aggression", "obstacles"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-chariot-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "success",
      "ambition",
      "determination",
      "willpower",
      "control",
      "self-discipline",
      "focus",
    ],
  },
  "major-08": {
    reversed: [
      "self-doubt",
      "weakness",
      "low confidence",
      "inadequacy",
      "cowardice",
      "forcefulness",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/strength-meaning-major-arcana-tarot-card-meanings",
    upright: ["courage", "bravery", "confidence", "compassion", "self-confidence", "inner power"],
  },
  "major-09": {
    reversed: [
      "loneliness",
      "isolation",
      "recluse",
      "being anti-social",
      "rejection",
      "returning to society",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-hermit-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "self-reflection",
      "introspection",
      "contemplation",
      "withdrawal",
      "solitude",
      "search for self",
    ],
  },
  "major-10": {
    reversed: ["bad luck", "lack of control", "clinging to control", "unwelcome changes", "delays"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-wheel-of-fortune-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "change",
      "cycles",
      "fate",
      "decisive moments",
      "luck",
      "fortune",
      "unexpected events",
    ],
  },
  "major-11": {
    reversed: [
      "injustice",
      "retribution",
      "dishonesty",
      "corruption",
      "unfairness",
      "avoiding accountability",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/justice-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "justice",
      "karma",
      "consequence",
      "accountability",
      "law",
      "truth",
      "honesty",
      "integrity",
      "cause and effect",
    ],
  },
  "major-12": {
    reversed: [
      "stalling",
      "disinterest",
      "stagnation",
      "avoiding sacrifice",
      "standstill",
      "apathy",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-hanged-man-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "sacrifice",
      "waiting",
      "uncertainty",
      "lack of direction",
      "perspective",
      "contemplation",
    ],
  },
  "major-13": {
    reversed: [
      "fear of change",
      "repeating negative patterns",
      "resisting change",
      "stagnancy",
      "decay",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/death-meaning-major-arcana-tarot-card-meanings",
    upright: ["transformation", "endings", "change", "transition", "letting go", "release"],
  },
  "major-14": {
    reversed: ["imbalance", "excess", "extremes", "discord", "recklessness", "hastiness"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/temperance-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "balance",
      "peace",
      "patience",
      "moderation",
      "calm",
      "tranquillity",
      "harmony",
      "serenity",
    ],
  },
  "major-15": {
    reversed: [
      "independence",
      "freedom",
      "revelation",
      "release",
      "reclaiming power",
      "reclaiming control",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-devil-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "oppression",
      "addiction",
      "obsession",
      "dependency",
      "excess",
      "powerlessness",
      "limitations",
    ],
  },
  "major-16": {
    reversed: ["averting disaster", "delaying the inevitable", "resisting change"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-tower-meaning-major-arcana-tarot-card-meanings",
    upright: ["disaster", "destruction", "upheaval", "trauma", "sudden change", "chaos"],
  },
  "major-17": {
    reversed: ["hopelessness", "despair", "negativity", "lack of faith", "despondent"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-star-meaning-major-arcana-tarot-card-meanings",
    upright: ["hope", "inspiration", "positivity", "faith", "renewal", "healing", "rejuvenation"],
  },
  "major-18": {
    reversed: [
      "fear",
      "deception",
      "anxiety",
      "misunderstanding",
      "misinterpretation",
      "clarity",
      "understanding",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-moon-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "illusion",
      "intuition",
      "uncertainty",
      "confusion",
      "complexity",
      "secrets",
      "unconscious",
    ],
  },
  "major-19": {
    reversed: [
      "blocked happiness",
      "excessive enthusiasm",
      "pessimism",
      "unrealistic expectations",
      "conceitedness",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-sun-meaning-major-arcana-tarot-card-meanings",
    upright: ["happiness", "success", "optimism", "vitality", "joy", "confidence", "truth"],
  },
  "major-20": {
    reversed: ["self-doubt", "lack of self-awareness", "failure to learn lessons", "self-loathing"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/judgement-meaning-major-arcana-tarot-card-meanings",
    upright: ["self-evaluation", "awakening", "renewal", "purpose", "reflection", "reckoning"],
  },
  "major-21": {
    reversed: ["lack of closure", "lack of achievement", "feeling incomplete", "emptiness"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/the-world-meaning-major-arcana-tarot-card-meanings",
    upright: [
      "completion",
      "achievement",
      "fulfilment",
      "sense of belonging",
      "wholeness",
      "harmony",
    ],
  },
  "pentacles-01": {
    reversed: [
      "missed chances",
      "scarcity",
      "deficiency",
      "instability",
      "stinginess",
      "bad investments",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ace-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "new opportunities",
      "resources",
      "abundance",
      "prosperity",
      "security",
      "stability",
      "manifestation",
    ],
  },
  "pentacles-02": {
    reversed: ["imbalance", "unorganized", "overwhelmed", "messiness", "chaos", "overextending"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/two-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "balancing resources",
      "adaptation",
      "resourcefulness",
      "flexibility",
      "stretching resources",
    ],
  },
  "pentacles-03": {
    reversed: [
      "lack of cohesion",
      "lack of teamwork",
      "apathy",
      "poor motivation",
      "conflict",
      "ego",
      "competition",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/three-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "teamwork",
      "shared goals",
      "collaboration",
      "apprenticeship",
      "effort",
      "pooling energy",
    ],
  },
  "pentacles-04": {
    reversed: [
      "generosity",
      "giving",
      "spending",
      "openness",
      "financial insecurity",
      "reckless spending",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/four-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "possessiveness",
      "insecurity",
      "hoarding",
      "stinginess",
      "stability",
      "security",
      "savings",
      "materialism",
      "wealth",
      "frugality",
      "boundaries",
      "guardedness",
    ],
  },
  "pentacles-05": {
    reversed: [
      "positive changes",
      "recovery from loss",
      "overcoming adversity",
      "forgiveness",
      "feeling welcomed",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/five-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "hardship",
      "loss",
      "isolation",
      "feeling abandoned",
      "adversity",
      "struggle",
      "unemployment",
      "alienation",
      "disgrace",
    ],
  },
  "pentacles-06": {
    reversed: [
      "power dynamics",
      "abuse of generosity",
      "strings attached gifts",
      "inequality",
      "extortion",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/six-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "generosity",
      "charity",
      "community",
      "material help",
      "support",
      "sharing",
      "giving and receiving",
      "gratitude",
    ],
  },
  "pentacles-07": {
    reversed: [
      "unfinished work",
      "procrastination",
      "low effort",
      "waste",
      "lack of growth",
      "setbacks",
      "impatience",
      "lack of reward",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/seven-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "harvest",
      "rewards",
      "results",
      "growth",
      "progress",
      "perseverance",
      "patience",
      "planning",
    ],
  },
  "pentacles-08": {
    reversed: [
      "lack of quality",
      "rushed job",
      "bad reputation",
      "lack of motivation",
      "mediocrity",
      "laziness",
      "low skill",
      "dead-end job",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/eight-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "skill",
      "craftsmanship",
      "quality",
      "high standards",
      "expertise",
      "mastery",
      "commitment",
      "dedication",
    ],
  },
  "pentacles-09": {
    reversed: [
      "being guarded",
      "living beyond means",
      "material instability",
      "reckless spending",
      "superficiality",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/nine-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "rewarded efforts",
      "success",
      "achievement",
      "independence",
      "leisure",
      "material security",
      "self-sufficiency",
    ],
  },
  "pentacles-10": {
    reversed: [
      "family disputes",
      "bankruptcy",
      "debt",
      "fleeting success",
      "conflict over money",
      "instability",
      "breaking traditions",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ten-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "legacy",
      "roots",
      "family",
      "ancestry",
      "inheritance",
      "windfall",
      "foundations",
      "privilege",
      "affluence",
      "stability",
      "tradition",
    ],
  },
  "pentacles-11": {
    reversed: [
      "foolish",
      "immature",
      "irresponsible",
      "lazy",
      "underachiever",
      "procrastinator",
      "missed chances",
      "poor prospects",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/page-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "ambitious",
      "diligent",
      "goal oriented",
      "planner",
      "consistent",
      "star student",
      "studious",
      "grounded",
      "loyal",
      "faithful",
      "dependable",
    ],
  },
  "pentacles-12": {
    reversed: [
      "workaholic",
      "laziness",
      "dull",
      "boring",
      "no initiative",
      "cheap",
      "irresponsible",
      "gambler",
      "risky investments",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/knight-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "practical",
      "reliable",
      "efficient",
      "stoic",
      "slow and steady",
      "hard-working",
      "committed",
      "patient",
      "conservative",
    ],
  },
  "pentacles-13": {
    reversed: [
      "selfish",
      "unkempt",
      "jealous",
      "insecure",
      "greedy",
      "materialistic",
      "gold digger",
      "intolerant",
      "self-absorbed",
      "envious",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/queen-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "generous",
      "caring",
      "nurturing",
      "homebody",
      "good business sense",
      "practical",
      "comforting",
      "welcoming",
      "sensible",
      "luxurious",
    ],
  },
  "pentacles-14": {
    reversed: [
      "greed",
      "materialistic",
      "wasteful",
      "chauvinist",
      "poor financial decisions",
      "gambler",
      "exploitative",
      "possessive",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/king-of-pentacles-meaning-tarot-card-meanings",
    upright: [
      "abundance",
      "prosperity",
      "security",
      "ambitious",
      "safe",
      "kind",
      "patriarchal",
      "protective",
      "businessman",
      "provider",
      "sensual",
      "reliable",
    ],
  },
  "swords-01": {
    reversed: [
      "confusion",
      "miscommunication",
      "hostility",
      "arguments",
      "destruction",
      "brutality",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ace-of-swords-meaning-tarot-card-meanings",
    upright: [
      "clarity",
      "breakthrough",
      "new idea",
      "concentration",
      "vision",
      "force",
      "focus",
      "truth",
    ],
  },
  "swords-02": {
    reversed: [
      "indecision",
      "hesitancy",
      "anxiety",
      "too much information",
      "no right choice",
      "truth revealed",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/two-of-swords-meaning-tarot-card-meanings",
    upright: [
      "stalemate",
      "difficult choices",
      "stuck in the middle",
      "denial",
      "hidden information",
    ],
  },
  "swords-03": {
    reversed: ["healing", "forgiveness", "recovery", "reconciliation", "repressing emotions"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/three-of-swords-meaning-tarot-card-meanings",
    upright: [
      "heartbreak",
      "separation",
      "sadness",
      "grief",
      "sorrow",
      "upset",
      "loss",
      "trauma",
      "tears",
    ],
  },
  "swords-04": {
    reversed: [
      "recovery",
      "awakening",
      "re-entering world",
      "release from isolation",
      "restlessness",
      "burnout",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/four-of-swords-meaning-tarot-card-meanings",
    upright: [
      "rest",
      "relaxation",
      "peace",
      "sanctuary",
      "recuperation",
      "self-protection",
      "rejuvenation",
    ],
  },
  "swords-05": {
    reversed: [
      "reconciliation",
      "resolution",
      "compromise",
      "revenge",
      "regret",
      "remorse",
      "cutting losses",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/five-of-swords-meaning-tarot-card-meanings",
    upright: [
      "arguments",
      "disputes",
      "aggression",
      "bullying",
      "intimidation",
      "conflict",
      "hostility",
      "stress",
    ],
  },
  "swords-06": {
    reversed: ["stuck in past", "returning to trouble", "running away from problems", "trapped"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/six-of-swords-meaning-tarot-card-meanings",
    upright: ["moving on", "departure", "leaving behind", "distance", "accepting lessons"],
  },
  "swords-07": {
    reversed: ["confession", "conscience", "regret", "maliciousness", "truth revealed"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/seven-of-swords-meaning-tarot-card-meanings",
    upright: [
      "lies",
      "trickery",
      "scheming",
      "strategy",
      "resourcefulness",
      "sneakiness",
      "cunning",
    ],
  },
  "swords-08": {
    reversed: [
      "freedom",
      "release",
      "taking control",
      "survivor",
      "facing fears",
      "empowered",
      "surrender",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/eight-of-swords-meaning-tarot-card-meanings",
    upright: [
      "trapped",
      "restricted",
      "victimised",
      "paralysed",
      "helpless",
      "powerless",
      "imprisonment",
    ],
  },
  "swords-09": {
    reversed: [
      "recovery",
      "learning to cope",
      "facing life",
      "finding help",
      "shame",
      "guilt",
      "mental health issues",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/nine-of-swords-meaning-tarot-card-meanings",
    upright: [
      "fear",
      "anxiety",
      "negativity",
      "breaking point",
      "despair",
      "nightmares",
      "isolation",
    ],
  },
  "swords-10": {
    reversed: ["survival", "improvement", "healing", "lessons learned", "despair", "relapse"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ten-of-swords-meaning-tarot-card-meanings",
    upright: [
      "ruin",
      "failure",
      "bitterness",
      "collapse",
      "exhaustion",
      "dead end",
      "victimization",
      "betrayal",
    ],
  },
  "swords-11": {
    reversed: [
      "scatterbrained",
      "cynical",
      "sarcastic",
      "gossipy",
      "insulting",
      "rude",
      "lack of planning",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/page-of-swords-meaning-tarot-card-meanings",
    upright: [
      "curious",
      "witty",
      "chatty",
      "communicative",
      "inspired",
      "vigilant",
      "alert",
      "mental agility",
    ],
  },
  "swords-12": {
    reversed: [
      "rude",
      "tactless",
      "forceful",
      "bully",
      "aggressive",
      "vicious",
      "ruthless",
      "arrogant",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/knight-of-swords-meaning-tarot-card-meanings",
    upright: [
      "assertive",
      "direct",
      "impatient",
      "intellectual",
      "daring",
      "focused",
      "perfectionist",
      "ambitious",
    ],
  },
  "swords-13": {
    reversed: [
      "pessimistic",
      "malicious",
      "manipulative",
      "harsh",
      "bitter",
      "spiteful",
      "cruel",
      "deceitful",
      "unforgiving",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/queen-of-swords-meaning-tarot-card-meanings",
    upright: [
      "honest",
      "independent",
      "principled",
      "fair",
      "constructive criticism",
      "objective",
      "perceptive",
    ],
  },
  "swords-14": {
    reversed: [
      "irrational",
      "dictator",
      "oppressive",
      "inhumane",
      "controlling",
      "cold",
      "ruthless",
      "dishonest",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/king-of-swords-meaning-tarot-card-meanings",
    upright: [
      "reason",
      "authority",
      "discipline",
      "integrity",
      "morality",
      "serious",
      "high standards",
      "strict",
    ],
  },
  "wands-01": {
    reversed: [
      "delays",
      "blocks",
      "lack of passion",
      "lack of energy",
      "hesitancy",
      "creative blocks",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ace-of-wands-meaning-tarot-card-meanings",
    upright: [
      "inspiration",
      "creative spark",
      "new initiative",
      "new passion",
      "enthusiasm",
      "energy",
    ],
  },
  "wands-02": {
    reversed: [
      "bad planning",
      "overanalyzing",
      "not taking action",
      "playing it safe",
      "avoiding risk",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/two-of-wands-meaning-tarot-card-meanings",
    upright: ["planning", "first steps", "making decisions", "leaving comfort", "taking risks"],
  },
  "wands-03": {
    reversed: [
      "restriction",
      "limitations",
      "lack of progress",
      "obstacles",
      "delays",
      "frustration",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/three-of-wands-meaning-tarot-card-meanings",
    upright: ["momentum", "confidence", "expansion", "growth", "foresight", "looking ahead"],
  },
  "wands-04": {
    reversed: [
      "lack of support",
      "instability",
      "feeling unwelcome",
      "transience",
      "lack of roots",
      "home conflict",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/four-of-wands-meaning-tarot-card-meanings",
    upright: [
      "community",
      "home",
      "celebrations",
      "reunions",
      "parties",
      "gatherings",
      "stability",
      "belonging",
    ],
  },
  "wands-05": {
    reversed: [
      "end of conflict",
      "cooperation",
      "agreements",
      "truces",
      "harmony",
      "peace",
      "avoiding conflict",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/five-of-wands-meaning-tarot-card-meanings",
    upright: [
      "conflict",
      "competition",
      "arguments",
      "aggression",
      "tension",
      "rivals",
      "clashes of ego",
    ],
  },
  "wands-06": {
    reversed: ["failure", "lack of recognition", "no rewards", "lack of achievement"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/six-of-wands-meaning-tarot-card-meanings",
    upright: [
      "success",
      "victory",
      "triumph",
      "rewards",
      "recognition",
      "praise",
      "acclaim",
      "pride",
    ],
  },
  "wands-07": {
    reversed: ["giving up", "admitting defeat", "yielding", "lack of self belief", "surrender"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/seven-of-wands-meaning-tarot-card-meanings",
    upright: [
      "protectiveness",
      "standing up for yourself",
      "defending yourself",
      "protecting territory",
    ],
  },
  "wands-08": {
    reversed: [
      "waiting",
      "slowness",
      "chaos",
      "delays",
      "losing momentum",
      "hastiness",
      "being unprepared",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/eight-of-wands-meaning-tarot-card-meanings",
    upright: ["movement", "speed", "progress", "quick decisions", "sudden changes", "excitement"],
  },
  "wands-09": {
    reversed: ["stubbornness", "rigidity", "defensiveness", "refusing compromise", "giving up"],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/nine-of-wands-meaning-tarot-card-meanings",
    upright: [
      "last stand",
      "persistence",
      "grit",
      "resilience",
      "perseverance",
      "close to success",
      "fatigue",
    ],
  },
  "wands-10": {
    reversed: [
      "failure to delegate",
      "shouldering too much responsibility",
      "collapse",
      "breakdown",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/ten-of-wands-meaning-tarot-card-meanings",
    upright: [
      "burden",
      "responsibility",
      "duty",
      "stress",
      "obligation",
      "burning out",
      "struggles",
    ],
  },
  "wands-11": {
    reversed: [
      "hasty",
      "impatient",
      "lacking ideas",
      "tantrums",
      "laziness",
      "boring",
      "unreliable",
      "distracted",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/page-of-wands-meaning-tarot-card-meanings",
    upright: [
      "adventure",
      "excitement",
      "fresh ideas",
      "cheerfulness",
      "energetic",
      "fearless",
      "extroverted",
    ],
  },
  "wands-12": {
    reversed: [
      "arrogant",
      "reckless",
      "impatient",
      "lack of self control",
      "passive",
      "volatile",
      "domineering",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/knight-of-wands-meaning-tarot-card-meanings",
    upright: [
      "courageous",
      "energetic",
      "charming",
      "hero",
      "rebellious",
      "hot tempered",
      "free spirit",
    ],
  },
  "wands-13": {
    reversed: [
      "demanding",
      "vengeful",
      "low confidence",
      "jealous",
      "selfish",
      "temperamental",
      "bully",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/queen-of-wands-meaning-tarot-card-meanings",
    upright: [
      "confident",
      "self-assured",
      "passionate",
      "determined",
      "social",
      "charismatic",
      "vivacious",
      "optimistic",
    ],
  },
  "wands-14": {
    reversed: [
      "forceful",
      "domineering",
      "tyrant",
      "vicious",
      "powerless",
      "ineffective",
      "weak leader",
    ],
    source:
      "https://labyrinthos.co/blogs/tarot-card-meanings-list/king-of-wands-meaning-tarot-card-meanings",
    upright: [
      "leadership",
      "vision",
      "big picture",
      "taking control",
      "daring decisions",
      "boldness",
      "optimism",
    ],
  },
};

/** Materialize editable copies; saved libraries never read through to these defaults. */
export function defaultMeanings(card: CatalogCard): {
  upright: CardMeaning;
  reversed: CardMeaning;
} {
  const defaults = keywordDefaults[card.id];
  if (!defaults) {
    throw new Error(`Missing keyword defaults for ${card.id}`);
  }
  return {
    reversed: { keywords: [...defaults.reversed], notes: "" },
    upright: { keywords: [...defaults.upright], notes: "" },
  };
}
