import { GameState } from "@/types/game";

const SAVE_KEY = "zhang-jihao-game-save";

export interface SavedGame {
  state: GameState;
  timestamp: number;
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

    const data = JSON.parse(saved) as SavedGame;

    // Validate save data
    if (!data.state || typeof data.timestamp !== "number") {
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
