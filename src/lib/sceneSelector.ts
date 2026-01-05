import { Scene, SceneCategory, GameState, GameStats, TOTAL_SCENES } from "@/types/game";

// All scene categories
const ALL_CATEGORIES: SceneCategory[] = [
  "academic-struggles",
  "football-fandom",
  "billiards-progression",
  "great-firewall",
  "digital-survival",
  "financial-temptations",
  "tianjin-life",
  "hometown-pressure",
  "health-physique",
  "crisis-management",
];

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Group scenes by category
function groupScenesByCategory(scenes: Scene[]): Map<SceneCategory, Scene[]> {
  const grouped = new Map<SceneCategory, Scene[]>();

  for (const category of ALL_CATEGORIES) {
    grouped.set(category, []);
  }

  for (const scene of scenes) {
    const categoryScenes = grouped.get(scene.category);
    if (categoryScenes) {
      categoryScenes.push(scene);
    }
  }

  return grouped;
}

// Weighted random selection
function weightedRandomSelect<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

// Calculate stat relevance for a scene
// Higher relevance for scenes that can help low stats
function calculateStatRelevance(scene: Scene, stats: GameStats): number {
  let relevance = 0;

  // Check each choice's effects
  for (const choice of scene.choices) {
    for (const effect of choice.effects) {
      if ("stat" in effect && "change" in effect) {
        const statValue = stats[effect.stat as keyof GameStats];
        // If stat is low and effect is positive, high relevance
        if (statValue < 30 && effect.change > 0) {
          relevance += (30 - statValue) * 0.01 * effect.change;
        }
        // If stat is high and effect is negative, still some relevance (challenge)
        if (statValue > 70 && effect.change < 0) {
          relevance += 0.2;
        }
      }
    }
  }

  return relevance;
}

// Select scenes for a game session (legacy function for initial batch)
export function selectScenesForGame(
  allScenes: Scene[],
  count: number = TOTAL_SCENES,
  minMinigames: number = 1
): Scene[] {
  const selected: Scene[] = [];
  const selectedIds = new Set<string>();

  // Phase 1: Guarantee minigame scenes
  const minigameScenes = shuffleArray(allScenes.filter((s) => s.minigame));
  for (const scene of minigameScenes) {
    if (selected.length >= minMinigames || selected.length >= count) break;
    selected.push(scene);
    selectedIds.add(scene.id);
  }

  // Phase 2: Category-based selection from remaining scenes
  const remainingScenes = allScenes.filter((s) => !selectedIds.has(s.id));
  const grouped = groupScenesByCategory(remainingScenes);
  const shuffledCategories = shuffleArray(ALL_CATEGORIES);

  for (const category of shuffledCategories) {
    if (selected.length >= count) break;

    const categoryScenes = grouped.get(category);
    if (categoryScenes && categoryScenes.length > 0) {
      const shuffledScenes = shuffleArray(categoryScenes);
      selected.push(shuffledScenes[0]);
      selectedIds.add(shuffledScenes[0].id);
    }
  }

  // Phase 3: Fill remaining slots with random scenes
  if (selected.length < count) {
    const finalRemaining = allScenes.filter((s) => !selectedIds.has(s.id));
    const shuffledRemaining = shuffleArray(finalRemaining);

    for (const scene of shuffledRemaining) {
      if (selected.length >= count) break;
      selected.push(scene);
    }
  }

  // Shuffle final selection for variety
  return shuffleArray(selected);
}

// Dynamic scene selection for infinite mode
export function selectNextSceneForInfiniteMode(
  state: GameState,
  allScenes: Scene[]
): Scene {
  const { sceneHistory, stats, turnCount } = state;

  // Get recent scene IDs to avoid (last 5)
  const recentSceneIds = sceneHistory.slice(-5).map(h => h.sceneId);

  // Get recent categories (last 3)
  const recentCategories = sceneHistory
    .slice(-3)
    .map(h => h.sceneCategory)
    .filter((c): c is SceneCategory => c !== undefined);

  // Filter candidates (exclude recently played)
  const candidates = allScenes.filter(s => !recentSceneIds.includes(s.id));

  if (candidates.length === 0) {
    // If all scenes played recently, just pick randomly from all
    return allScenes[Math.floor(Math.random() * allScenes.length)];
  }

  // Calculate weights for each candidate
  const weights = candidates.map(scene => {
    let weight = 1.0;

    // Category diversity bonus (avoid recent categories)
    if (!recentCategories.includes(scene.category)) {
      weight *= 1.5;
    }

    // Low stat relevance (boost scenes that can help struggling stats)
    const statRelevance = calculateStatRelevance(scene, stats);
    weight *= (1 + statRelevance * 0.3);

    // Difficulty scaling (more challenging scenes as turns increase)
    const difficultyFactor = 1 + (turnCount / 50);

    // Check if scene has high-stakes choices (large stat changes)
    const hasHighStakes = scene.choices.some(c =>
      c.effects.some(e => "change" in e && Math.abs(e.change) >= 10)
    );
    if (hasHighStakes && turnCount > 10) {
      weight *= difficultyFactor * 0.5;
    }

    // Minigame bonus (occasional variety)
    if (scene.minigame && Math.random() < 0.3) {
      weight *= 1.3;
    }

    // Category rotation bonus
    const categoryCount = sceneHistory.filter(
      h => h.sceneCategory === scene.category
    ).length;
    const totalHistory = sceneHistory.length || 1;
    const categoryRatio = categoryCount / totalHistory;

    // Boost underrepresented categories
    if (categoryRatio < 0.1) {
      weight *= 1.4;
    } else if (categoryRatio > 0.2) {
      weight *= 0.7;
    }

    return Math.max(0.1, weight);
  });

  return weightedRandomSelect(candidates, weights);
}

// Add more scenes to the pool for infinite mode
export function expandScenePool(
  currentScenes: Scene[],
  allScenes: Scene[],
  state: GameState,
  batchSize: number = 5
): Scene[] {
  const newScenes = selectScenesForGame(
    allScenes.filter(s => !currentScenes.some(cs => cs.id === s.id)),
    batchSize,
    0
  );

  // Also include the next dynamically selected scene
  const nextScene = selectNextSceneForInfiniteMode(state, allScenes);
  if (!currentScenes.some(s => s.id === nextScene.id) && !newScenes.some(s => s.id === nextScene.id)) {
    newScenes.push(nextScene);
  }

  return [...currentScenes, ...newScenes];
}
