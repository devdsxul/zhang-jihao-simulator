import { Scene, SceneCategory, TOTAL_SCENES } from "@/types/game";

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

// Select scenes for a game session
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
