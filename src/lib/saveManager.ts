import { GameState, VALID_STAT_KEYS } from "@/types/game";

const SAVE_KEY = "zhang-jihao-game-save";

export interface SavedGame {
  state: GameState;
  timestamp: number;
}

function isValidGameStats(stats: unknown): boolean {
  if (!stats || typeof stats !== "object") return false;
  const s = stats as Record<string, unknown>;
  return VALID_STAT_KEYS.every(
    (key) => typeof s[key] === "number" && s[key] >= 0 && s[key] <= 100
  );
}

function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;

  // Check required fields
  if (typeof s.currentScene !== "number") return false;
  if (!isValidGameStats(s.stats)) return false;
  if (!Array.isArray(s.flags)) return false;
  if (!Array.isArray(s.selectedScenes)) return false;
  if (typeof s.isGameOver !== "boolean") return false;
  if (!Array.isArray(s.sceneHistory)) return false;

  return true;
}

function validateSavedGame(data: unknown): SavedGame | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (typeof d.timestamp !== "number") return null;
  if (!isValidGameState(d.state)) return null;

  return { state: d.state as GameState, timestamp: d.timestamp };
}

export function saveGame(state: GameState): void {
  if (typeof window === "undefined") return;

  const saveData: SavedGame = {
    state,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.error("Failed to save game:", e);
  }
}

export function loadGame(): SavedGame | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    const data = validateSavedGame(parsed);

    if (!data) {
      clearSave();
      return null;
    }

    // Check if save is too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > maxAge) {
      clearSave();
      return null;
    }

    return data;
  } catch (e) {
    console.error("Failed to load game:", e);
    clearSave();
    return null;
  }
}

export function clearSave(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.error("Failed to clear save:", e);
  }
}

export function hasSavedGame(): boolean {
  return loadGame() !== null;
}
