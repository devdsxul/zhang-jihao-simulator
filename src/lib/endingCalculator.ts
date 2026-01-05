import { GameStats, Ending, EndingCondition } from "@/types/game";
import { checkCondition } from "./gameEngine";

// Check if all conditions for an ending are met
function checkAllConditions(stats: GameStats, conditions: EndingCondition[], flags: string[] = []): boolean {
  return conditions.every((condition) => checkCondition(stats, condition, flags));
}

// Calculate the best matching ending based on final stats and flags
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
function getGenericEnding(stats: GameStats, allEndings: Ending[]): Ending {
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
  const rareEndings = allEndings.filter((e) => e.type === "rare");

  // Determine ending type based on average stat
  if (average >= 70 && rareEndings.length > 0) {
    // High stats: chance for rare ending
    if (Math.random() < 0.1) {
      return rareEndings[Math.floor(Math.random() * rareEndings.length)];
    }
    return positiveEndings[Math.floor(Math.random() * positiveEndings.length)] || negativeEndings[0];
  } else if (average >= 50 && positiveEndings.length > 0) {
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

// Get ending flavor text based on type
export function getEndingFlavorText(ending: Ending): string {
  switch (ending.type) {
    case "negative":
      return "章吉豪的命运在这一刻急转直下...";
    case "positive":
      return "尽管经历坎坷，章吉豪最终找到了出路...";
    case "rare":
      return "命运的齿轮开始以不可思议的方式转动...";
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
