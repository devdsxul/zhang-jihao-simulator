import { GameState, GameStats, Choice, Scene, INITIAL_STATS, VALID_STAT_KEYS, EndingCondition, SceneHistoryEntry, isStatEffect, isFlagEffect, isStatCondition, isFlagCondition } from "@/types/game";

// Initialize a new game
export function initGame(selectedScenes: Scene[]): GameState {
  return {
    currentScene: 0,
    totalScenes: selectedScenes.length,
    stats: { ...INITIAL_STATS },
    flags: [],
    selectedScenes,
    isGameOver: false,
    currentEnding: null,
    sceneHistory: [],
  };
}

// Validate stat key
function isValidStatKey(key: string): key is keyof GameStats {
  return VALID_STAT_KEYS.includes(key as keyof GameStats);
}

// Apply stat and flag effects from a choice
export function applyChoice(state: GameState, choice: Choice): GameState {
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

  const currentScene = state.selectedScenes[state.currentScene];
  const statEffects = choice.effects.filter(isStatEffect);
  const historyEntry: SceneHistoryEntry = {
    sceneId: currentScene.id,
    sceneText: currentScene.text,
    choiceId: choice.id,
    choiceText: choice.text,
    effects: statEffects,
    triggeredMinigame: choice.triggerMinigame ? currentScene.minigame?.type : undefined,
  };

  const newHistory = [...state.sceneHistory, historyEntry];
  const nextScene = state.currentScene + 1;
  const isGameOver = nextScene >= state.totalScenes;

  return {
    ...state,
    stats: newStats,
    flags: newFlags,
    currentScene: nextScene,
    isGameOver,
    sceneHistory: newHistory,
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

