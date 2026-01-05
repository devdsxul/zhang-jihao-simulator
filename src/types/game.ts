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
export const TOTAL_SCENES = 10;

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

// Ending types
export type EndingType = "negative" | "positive" | "rare";

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
  title: string;
  description: string;
  conditions: EndingCondition[];
  priority: number; // Higher priority endings are checked first
}

// Extended scene history entry for game review
export interface SceneHistoryEntry {
  sceneId: string;
  sceneText: string;
  choiceId: string;
  choiceText: string;
  effects: StatEffect[];
  triggeredMinigame?: MinigameType;
  minigameResult?: 'win' | 'lose' | 'neutral';
}

// Game state
export interface GameState {
  currentScene: number;
  totalScenes: number;
  stats: GameStats;
  flags: string[];  // Active flags for conditional endings
  selectedScenes: Scene[];
  isGameOver: boolean;
  currentEnding: Ending | null;
  sceneHistory: SceneHistoryEntry[];
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
