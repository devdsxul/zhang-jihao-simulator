import {
  GameStats,
  GameState,
  Ending,
  EndingCondition,
  THRESHOLDS,
} from "@/types/game";
import { checkCondition, hasCriticalStat, hasDangerStat, hasBalancedMastery } from "./gameEngine";

// Check if all conditions for an ending are met
function checkAllConditions(stats: GameStats, conditions: EndingCondition[], flags: string[] = []): boolean {
  return conditions.every((condition) => checkCondition(stats, condition, flags));
}

// Check if choice path matches a secret ending's required sequence
function checkPathSequence(choicePath: string[], pathSequence: string[]): boolean {
  if (pathSequence.length === 0) return false;

  // Check if the choice path ends with the required sequence
  if (choicePath.length < pathSequence.length) return false;

  const recentChoices = choicePath.slice(-pathSequence.length);
  return pathSequence.every((id, index) => recentChoices[index] === id);
}

// Termination check result
export interface TerminationResult {
  shouldTerminate: boolean;
  reason?: "critical_stat" | "low_score" | "victory" | "balanced_mastery" | "survival" | "secret_path" | "flag_triggered";
  ending?: Ending;
}

// Check if game should terminate based on current state
export function checkTermination(state: GameState, allEndings: Ending[]): TerminationResult {
  const { stats, flags, compositeScore, consecutiveHighScore, turnCount, choicePath } = state;

  // 1. Check for secret endings first (highest priority)
  const secretEndings = allEndings
    .filter(e => e.rarity === "secret" && e.pathSequence && e.pathSequence.length > 0)
    .sort((a, b) => b.priority - a.priority);

  for (const ending of secretEndings) {
    if (ending.pathSequence && checkPathSequence(choicePath, ending.pathSequence)) {
      if (checkAllConditions(stats, ending.conditions, flags)) {
        return { shouldTerminate: true, reason: "secret_path", ending };
      }
    }
  }

  // 2. Check for critical stat (immediate game over)
  const criticalCheck = hasCriticalStat(stats);
  if (criticalCheck.critical) {
    const negativeEndings = allEndings
      .filter(e => e.type === "negative")
      .sort((a, b) => b.priority - a.priority);

    const matchingEnding = negativeEndings.find(e => checkAllConditions(stats, e.conditions, flags));
    return {
      shouldTerminate: true,
      reason: "critical_stat",
      ending: matchingEnding || getGenericEnding(stats, allEndings, "negative"),
    };
  }

  // 3. Check for low composite score
  if (compositeScore < THRESHOLDS.NEGATIVE_SCORE) {
    const negativeEndings = allEndings
      .filter(e => e.type === "negative")
      .sort((a, b) => b.priority - a.priority);

    const matchingEnding = negativeEndings.find(e => checkAllConditions(stats, e.conditions, flags));
    return {
      shouldTerminate: true,
      reason: "low_score",
      ending: matchingEnding || getGenericEnding(stats, allEndings, "negative"),
    };
  }

  // 4. Check danger zone - only after minimum turns played
  // This prevents early termination when starting stats are low
  const MIN_TURNS_FOR_DANGER_CHECK = 5;
  const dangerCheck = hasDangerStat(stats);
  if (dangerCheck.danger && turnCount >= MIN_TURNS_FOR_DANGER_CHECK) {
    const negativeEndings = allEndings
      .filter(e => e.type === "negative")
      .sort((a, b) => b.priority - a.priority);

    const matchingEnding = negativeEndings.find(e => checkAllConditions(stats, e.conditions, flags));
    if (matchingEnding) {
      return { shouldTerminate: true, reason: "critical_stat", ending: matchingEnding };
    }
  }

  // 5. Check for victory (high score for consecutive turns)
  if (consecutiveHighScore >= THRESHOLDS.CONSECUTIVE_VICTORY) {
    const positiveEndings = allEndings
      .filter(e => e.type === "positive")
      .sort((a, b) => b.priority - a.priority);

    const matchingEnding = positiveEndings.find(e => checkAllConditions(stats, e.conditions, flags));
    return {
      shouldTerminate: true,
      reason: "victory",
      ending: matchingEnding || getGenericEnding(stats, allEndings, "positive"),
    };
  }

  // 6. Check for balanced mastery
  if (hasBalancedMastery(stats)) {
    const legendaryEndings = allEndings
      .filter(e => e.rarity === "legendary" && e.type === "positive")
      .sort((a, b) => b.priority - a.priority);

    const matchingEnding = legendaryEndings.find(e => checkAllConditions(stats, e.conditions, flags));
    if (matchingEnding) {
      return { shouldTerminate: true, reason: "balanced_mastery", ending: matchingEnding };
    }
  }

  // 7. Check for survival ending (survived many turns)
  if (turnCount >= THRESHOLDS.SURVIVAL_TURNS && compositeScore >= THRESHOLDS.SURVIVAL_MIN_SCORE) {
    const positiveEndings = allEndings
      .filter(e => e.type === "positive")
      .sort((a, b) => b.priority - a.priority);

    const matchingEnding = positiveEndings.find(e => checkAllConditions(stats, e.conditions, flags));
    return {
      shouldTerminate: true,
      reason: "survival",
      ending: matchingEnding || getGenericEnding(stats, allEndings, "positive"),
    };
  }

  // 8. Regular condition-based endings are NOT checked every turn
  // They are only used when game ends through other means (critical stat, low score, etc.)
  // This prevents early game over when initial stats already match some ending conditions

  // No termination
  return { shouldTerminate: false };
}

// Calculate the best matching ending based on final stats and flags (legacy support)
export function calculateEnding(stats: GameStats, allEndings: Ending[], flags: string[] = []): Ending {
  // Sort endings by priority (higher priority first)
  const sortedEndings = [...allEndings].sort((a, b) => b.priority - a.priority);

  // Find the first ending whose conditions are all met
  for (const ending of sortedEndings) {
    if (checkAllConditions(stats, ending.conditions, flags)) {
      return ending;
    }
  }

  // Fallback: return the generic ending based on overall stats
  return getGenericEnding(stats, allEndings);
}

// Get a generic ending based on stat totals
function getGenericEnding(stats: GameStats, allEndings: Ending[], preferType?: "positive" | "negative"): Ending {
  const total =
    stats.academicStanding +
    stats.digitalSafety +
    stats.wealth +
    stats.billiardsSkill +
    stats.sanity;

  const average = total / 5;

  // Find endings by type
  const negativeEndings = allEndings.filter((e) => e.type === "negative");
  const positiveEndings = allEndings.filter((e) => e.type === "positive");

  // If preferred type specified, use it
  if (preferType === "negative" && negativeEndings.length > 0) {
    // Get a common negative ending
    const commonNegative = negativeEndings.filter(e => e.rarity === "common");
    if (commonNegative.length > 0) {
      return commonNegative[Math.floor(Math.random() * commonNegative.length)];
    }
    return negativeEndings[Math.floor(Math.random() * negativeEndings.length)];
  }

  if (preferType === "positive" && positiveEndings.length > 0) {
    // Get a common positive ending
    const commonPositive = positiveEndings.filter(e => e.rarity === "common");
    if (commonPositive.length > 0) {
      return commonPositive[Math.floor(Math.random() * commonPositive.length)];
    }
    return positiveEndings[Math.floor(Math.random() * positiveEndings.length)];
  }

  // Determine ending type based on average stat
  if (average >= 50 && positiveEndings.length > 0) {
    return positiveEndings[Math.floor(Math.random() * positiveEndings.length)];
  } else {
    return negativeEndings[Math.floor(Math.random() * negativeEndings.length)] || allEndings[0];
  }
}

// Calculate ending score for display
export function calculateEndingScore(stats: GameStats): number {
  const total =
    stats.academicStanding +
    stats.digitalSafety +
    stats.wealth +
    stats.billiardsSkill +
    stats.sanity;

  return Math.round(total / 5);
}

// Get ending flavor text based on type and rarity
export function getEndingFlavorText(ending: Ending): string {
  // Rarity-specific flavor
  if (ending.rarity === "secret") {
    return "✦ 你发现了一个隐藏的命运分支...";
  }
  if (ending.rarity === "legendary") {
    return "★★★★ 传奇的人生轨迹就此展开...";
  }

  // Type-based flavor
  switch (ending.type) {
    case "negative":
      return "章吉豪的命运在这一刻急转直下...";
    case "positive":
      return "尽管经历坎坷，章吉豪最终找到了出路...";
    default:
      return "";
  }
}

// Get stat summary text
export function getStatSummary(stats: GameStats): string[] {
  const summaries: string[] = [];

  if (stats.academicStanding <= 10) {
    summaries.push("学业已经完全崩溃");
  } else if (stats.academicStanding <= 30) {
    summaries.push("学业状况堪忧");
  } else if (stats.academicStanding >= 80) {
    summaries.push("学业表现优异");
  }

  if (stats.digitalSafety <= 10) {
    summaries.push("数字安全已被完全摧毁");
  } else if (stats.digitalSafety <= 30) {
    summaries.push("在网络世界中危机四伏");
  } else if (stats.digitalSafety >= 80) {
    summaries.push("网络安全意识极强");
  }

  if (stats.wealth <= 10) {
    summaries.push("已经身无分文");
  } else if (stats.wealth <= 30) {
    summaries.push("经济状况紧张");
  } else if (stats.wealth >= 80) {
    summaries.push("财务状况良好");
  }

  if (stats.billiardsSkill >= 90) {
    summaries.push("台球技术已达职业水准");
  } else if (stats.billiardsSkill >= 70) {
    summaries.push("台球技术精湛");
  }

  if (stats.sanity <= 10) {
    summaries.push("精神状态已经崩溃");
  } else if (stats.sanity <= 30) {
    summaries.push("精神状态堪忧");
  } else if (stats.sanity >= 80) {
    summaries.push("心态积极健康");
  }

  return summaries;
}
