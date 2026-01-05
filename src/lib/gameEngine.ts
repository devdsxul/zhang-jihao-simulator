import {
  GameState,
  GameStats,
  Choice,
  Scene,
  INITIAL_STATS,
  VALID_STAT_KEYS,
  EndingCondition,
  SceneHistoryEntry,
  isStatEffect,
  isFlagEffect,
  isStatCondition,
  isFlagCondition,
  STAT_WEIGHTS,
  THRESHOLDS,
} from "@/types/game";

// Calculate composite score from stats
export function calculateCompositeScore(stats: GameStats, flags: string[] = []): number {
  // Base weighted score
  let score =
    stats.academicStanding * STAT_WEIGHTS.academicStanding +
    stats.sanity * STAT_WEIGHTS.sanity +
    stats.wealth * STAT_WEIGHTS.wealth +
    stats.digitalSafety * STAT_WEIGHTS.digitalSafety +
    stats.billiardsSkill * STAT_WEIGHTS.billiardsSkill;

  // Flag bonuses/penalties
  const positiveFlags = ["graduated", "stable_job", "good_reputation", "healthy"];
  const negativeFlags = ["criminal_record", "debt_crisis", "mental_illness", "expelled"];

  for (const flag of flags) {
    if (positiveFlags.includes(flag)) {
      score += 3;
    }
    if (negativeFlags.includes(flag)) {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// Check if any stat is at critical level
export function hasCriticalStat(stats: GameStats): { critical: boolean; stat?: keyof GameStats } {
  for (const key of VALID_STAT_KEYS) {
    if (stats[key] <= THRESHOLDS.CRITICAL_STAT) {
      return { critical: true, stat: key };
    }
  }
  return { critical: false };
}

// Check if any stat is in danger zone
export function hasDangerStat(stats: GameStats): { danger: boolean; stat?: keyof GameStats } {
  for (const key of VALID_STAT_KEYS) {
    if (key === "billiardsSkill") continue; // billiards has no critical threshold
    if (stats[key] <= THRESHOLDS.DANGER_STAT) {
      return { danger: true, stat: key };
    }
  }
  return { danger: false };
}

// Check if all stats are balanced (for balanced mastery ending)
export function hasBalancedMastery(stats: GameStats): boolean {
  return VALID_STAT_KEYS.every(key => stats[key] >= THRESHOLDS.BALANCED_MASTERY);
}

// Initialize a new game (updated for infinite mode)
export function initGame(selectedScenes: Scene[]): GameState {
  const initialStats = { ...INITIAL_STATS };
  return {
    currentScene: 0,
    totalScenes: selectedScenes.length, // Legacy, will be ignored in infinite mode
    stats: initialStats,
    flags: [],
    selectedScenes,
    isGameOver: false,
    currentEnding: null,
    sceneHistory: [],
    // Infinite mode fields
    turnCount: 0,
    compositeScore: calculateCompositeScore(initialStats),
    choicePath: [],
    consecutiveHighScore: 0,
  };
}

// Validate stat key
function isValidStatKey(key: string): key is keyof GameStats {
  return VALID_STAT_KEYS.includes(key as keyof GameStats);
}

// Apply stat and flag effects from a choice (updated for infinite mode)
export function applyChoice(state: GameState, choice: Choice, currentScene: Scene): GameState {
  const newStats = { ...state.stats };
  let newFlags = [...state.flags];

  for (const effect of choice.effects) {
    if (isStatEffect(effect)) {
      if (isValidStatKey(effect.stat)) {
        newStats[effect.stat] = Math.max(0, Math.min(100, newStats[effect.stat] + effect.change));
      }
    } else if (isFlagEffect(effect)) {
      if (effect.type === "setFlag") {
        if (!newFlags.includes(effect.flag)) {
          newFlags.push(effect.flag);
        }
      } else if (effect.type === "clearFlag") {
        newFlags = newFlags.filter(f => f !== effect.flag);
      }
    }
  }

  const statEffects = choice.effects.filter(isStatEffect);
  const historyEntry: SceneHistoryEntry = {
    sceneId: currentScene.id,
    sceneText: currentScene.text,
    sceneCategory: currentScene.category,
    choiceId: choice.id,
    choiceText: choice.text,
    effects: statEffects,
    triggeredMinigame: choice.triggerMinigame ? currentScene.minigame?.type : undefined,
  };

  // Calculate new composite score
  const newCompositeScore = calculateCompositeScore(newStats, newFlags);

  // Update consecutive high score counter
  let newConsecutiveHighScore = state.consecutiveHighScore;
  if (newCompositeScore >= THRESHOLDS.VICTORY_SCORE) {
    newConsecutiveHighScore += 1;
  } else {
    newConsecutiveHighScore = 0;
  }

  // Update choice path for secret ending detection
  const newChoicePath = [...state.choicePath, choice.id];

  const newHistory = [...state.sceneHistory, historyEntry];
  const nextSceneIndex = state.currentScene + 1;
  const newTurnCount = state.turnCount + 1;

  // In infinite mode, game over is determined by termination conditions, not scene count
  // We'll check termination in the endingCalculator
  const isGameOver = false; // Will be set by endingCalculator

  return {
    ...state,
    stats: newStats,
    flags: newFlags,
    currentScene: nextSceneIndex,
    isGameOver,
    sceneHistory: newHistory,
    turnCount: newTurnCount,
    compositeScore: newCompositeScore,
    choicePath: newChoicePath,
    consecutiveHighScore: newConsecutiveHighScore,
  };
}

// Check if a condition (stat or flag) is met
export function checkCondition(
  stats: GameStats,
  condition: EndingCondition,
  flags: string[] = []
): boolean {
  if (isStatCondition(condition)) {
    if (!isValidStatKey(condition.stat)) {
      return false;
    }
    const statValue = stats[condition.stat];

    switch (condition.operator) {
      case "lt":
        return statValue < condition.value;
      case "lte":
        return statValue <= condition.value;
      case "gt":
        return statValue > condition.value;
      case "gte":
        return statValue >= condition.value;
      case "eq":
        return statValue === condition.value;
      default:
        return false;
    }
  } else if (isFlagCondition(condition)) {
    const hasFlag = flags.includes(condition.flag);
    return condition.operator === "hasFlag" ? hasFlag : !hasFlag;
  }
  return false;
}

// Get current scene
export function getCurrentScene(state: GameState): Scene | null {
  if (state.currentScene >= state.selectedScenes.length) {
    return null;
  }
  return state.selectedScenes[state.currentScene];
}
