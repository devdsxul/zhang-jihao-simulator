// Game Stats Interface
export interface GameStats {
  academicStanding: number; // 学业状态 (0-100)
  digitalSafety: number; // 数字安全 (0-100)
  wealth: number; // 财富 (0-100)
  billiardsSkill: number; // 台球技术 (0-100)
  sanity: number; // 精神状态 (0-100)
}

// Initial stats for Zhang Jihao
export const INITIAL_STATS: GameStats = {
  academicStanding: 20,
  digitalSafety: 40,
  wealth: 30,
  billiardsSkill: 50,
  sanity: 60,
};

// Game configuration constants
export const TOTAL_SCENES = 10; // Legacy: only used for compatibility
export const INFINITE_MODE = true; // Enable infinite mode

// Composite score weights for each stat
export const STAT_WEIGHTS: Record<keyof GameStats, number> = {
  academicStanding: 0.25,
  sanity: 0.25,
  wealth: 0.20,
  digitalSafety: 0.20,
  billiardsSkill: 0.10,
};

// Game termination thresholds
export const THRESHOLDS = {
  CRITICAL_STAT: 0,           // Any stat at 0 = immediate game over
  DANGER_STAT: 10,            // Any stat below 10 = ending check
  NEGATIVE_SCORE: 25,         // Composite score < 25 = negative ending
  WARNING_SCORE: 35,          // Warning zone
  POSITIVE_SCORE: 65,         // Positive zone
  VICTORY_SCORE: 85,          // Victory zone
  CONSECUTIVE_VICTORY: 3,     // Consecutive high score turns needed
  BALANCED_MASTERY: 70,       // All stats >= 70 = balanced ending
  SURVIVAL_TURNS: 30,         // Survive 30+ turns for survival ending
  SURVIVAL_MIN_SCORE: 60,     // Minimum score for survival ending
};

// Difficulty scaling per turn range
export const DIFFICULTY_CURVE = {
  NORMAL: { minTurn: 1, maxTurn: 10, minChange: -5, maxChange: 10 },
  MODERATE: { minTurn: 11, maxTurn: 20, minChange: -8, maxChange: 8 },
  HARD: { minTurn: 21, maxTurn: 30, minChange: -12, maxChange: 6 },
  EXPERT: { minTurn: 31, maxTurn: Infinity, minChange: -15, maxChange: 5 },
};

// Valid stat keys for runtime validation
export const VALID_STAT_KEYS: (keyof GameStats)[] = [
  "academicStanding",
  "digitalSafety",
  "wealth",
  "billiardsSkill",
  "sanity",
];

// Stat effect from choices
export interface StatEffect {
  stat: keyof GameStats;
  change: number;
}

// Flag effect from choices (set or clear flags for conditional endings)
export interface FlagEffect {
  type: "setFlag" | "clearFlag";
  flag: string;
}

// Union type for all choice effects
export type ChoiceEffect = StatEffect | FlagEffect;

// Type guard for StatEffect
export function isStatEffect(effect: ChoiceEffect): effect is StatEffect {
  return "stat" in effect && "change" in effect;
}

// Type guard for FlagEffect
export function isFlagEffect(effect: ChoiceEffect): effect is FlagEffect {
  return "type" in effect && ("setFlag" === effect.type || "clearFlag" === effect.type);
}

// Minigame types
export type MinigameType = "billiards" | "moneyrun" | "campnou";

export interface MinigameConfig {
  type: MinigameType;
  difficulty: number;
}

// Minigame reward - typed stat changes from minigames
export interface MinigameReward {
  wealth?: number;
  sanity?: number;
  billiardsSkill?: number;
  digitalSafety?: number;
  academicStanding?: number;
}

// Choice interface
export interface Choice {
  id: string;
  text: string;
  effects: ChoiceEffect[];
  triggerMinigame?: boolean;
}

// Animation types
export type AnimationType =
  | "studying"
  | "football"
  | "billiards"
  | "scrolling"
  | "running"
  | "eating"
  | "talking"
  | "stressed"
  | "celebrating"
  | "arrested";

// Scene categories
export type SceneCategory =
  | "academic-struggles"
  | "football-fandom"
  | "billiards-progression"
  | "great-firewall"
  | "digital-survival"
  | "financial-temptations"
  | "tianjin-life"
  | "hometown-pressure"
  | "health-physique"
  | "crisis-management";

// Scene interface
export interface Scene {
  id: string;
  category: SceneCategory;
  text: string;
  animation: AnimationType;
  choices: Choice[];
  minigame?: MinigameConfig;
}

// Ending types - simplified to outcome type
export type EndingType = "negative" | "positive";

// Ending rarity tiers
export type EndingRarity = "common" | "uncommon" | "rare" | "legendary" | "secret";

// Rarity display names (Chinese)
export const RARITY_NAMES: Record<EndingRarity, string> = {
  common: "普通",
  uncommon: "稀有",
  rare: "史诗",
  legendary: "传说",
  secret: "隐藏",
};

// Rarity colors for UI
export const RARITY_COLORS: Record<EndingRarity, { primary: string; bg: string }> = {
  common: { primary: "#86868B", bg: "#86868B1A" },
  uncommon: { primary: "#34C759", bg: "#34C7591A" },
  rare: { primary: "#5856D6", bg: "#5856D61A" },
  legendary: { primary: "#EDBB00", bg: "#EDBB001A" },
  secret: { primary: "#A50044", bg: "#A500441A" },
};

// Rarity icons
export const RARITY_ICONS: Record<EndingRarity, string> = {
  common: "☆",
  uncommon: "★",
  rare: "★★",
  legendary: "★★★★",
  secret: "✦",
};

// Ending condition - supports both stat checks and flag checks
export type EndingCondition = StatCondition | FlagCondition;

// Stat-based condition
export interface StatCondition {
  stat: keyof GameStats;
  operator: "lt" | "lte" | "gt" | "gte" | "eq";
  value: number;
}

// Flag-based condition
export interface FlagCondition {
  flag: string;
  operator: "hasFlag" | "notFlag";
}

// Type guard for StatCondition
export function isStatCondition(condition: EndingCondition): condition is StatCondition {
  return "stat" in condition && "value" in condition;
}

// Type guard for FlagCondition
export function isFlagCondition(condition: EndingCondition): condition is FlagCondition {
  return "flag" in condition && ("hasFlag" === condition.operator || "notFlag" === condition.operator);
}

// Ending interface
export interface Ending {
  id: string;
  type: EndingType;
  rarity: EndingRarity;           // New: rarity tier
  title: string;
  description: string;
  conditions: EndingCondition[];
  priority: number; // Higher priority endings are checked first
  pathSequence?: string[];        // New: for secret endings - required choice path
}

// Extended scene history entry for game review
export interface SceneHistoryEntry {
  sceneId: string;
  sceneText: string;
  sceneCategory?: SceneCategory;  // New: track category for variety
  choiceId: string;
  choiceText: string;
  effects: StatEffect[];
  triggeredMinigame?: MinigameType;
  minigameResult?: 'win' | 'lose' | 'neutral';
}

// Game state
export interface GameState {
  currentScene: number;
  totalScenes: number;           // Legacy, ignored in infinite mode
  stats: GameStats;
  flags: string[];               // Active flags for conditional endings
  selectedScenes: Scene[];
  isGameOver: boolean;
  currentEnding: Ending | null;
  sceneHistory: SceneHistoryEntry[];
  // Infinite mode additions
  turnCount: number;             // Current turn number
  compositeScore: number;        // Calculated composite score
  choicePath: string[];          // Choice ID path for secret endings
  consecutiveHighScore: number;  // Consecutive turns with high score
}

// Category display names (Chinese)
export const CATEGORY_NAMES: Record<SceneCategory, string> = {
  "academic-struggles": "学业困境",
  "football-fandom": "足球狂热",
  "billiards-progression": "台球进阶",
  "great-firewall": "翻墙生涯",
  "digital-survival": "数字生存",
  "financial-temptations": "金融诱惑",
  "tianjin-life": "天津生活",
  "hometown-pressure": "家乡压力",
  "health-physique": "身心健康",
  "crisis-management": "危机处理",
};

// Stat display names (Chinese)
export const STAT_NAMES: Record<keyof GameStats, string> = {
  academicStanding: "学业",
  digitalSafety: "安全",
  wealth: "财富",
  billiardsSkill: "台球",
  sanity: "精神",
};

// Stat colors
export const STAT_COLORS: Record<keyof GameStats, string> = {
  academicStanding: "#004D98",
  digitalSafety: "#00A86B",
  wealth: "#EDBB00",
  billiardsSkill: "#9B59B6",
  sanity: "#E74C3C",
};
