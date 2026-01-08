import { saveGame, loadGame, clearSave, hasSavedGame, SavedGame } from '../saveManager';
import { GameState, INITIAL_STATS } from '@/types/game';

const SAVE_KEY = 'zhang-jihao-game-save';

const mockGameState: GameState = {
  stats: { ...INITIAL_STATS },
  flags: ['test_flag'],
  currentScene: 3,
  totalScenes: 10,
  sceneHistory: [],
  selectedScenes: [],
  isGameOver: false,
  currentEnding: null,
  turnCount: 3,
  compositeScore: 50,
  choicePath: [],
  consecutiveHighScore: 0,
};

describe('saveManager', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveGame', () => {
    it('should save game state to localStorage', () => {
      saveGame(mockGameState);

      const saved = localStorage.getItem(SAVE_KEY);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!) as SavedGame;
      expect(parsed.state).toEqual(mockGameState);
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('should handle localStorage errors gracefully', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => saveGame(mockGameState)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadGame', () => {
    it('should return null when no save exists', () => {
      const result = loadGame();
      expect(result).toBeNull();
    });

    it('should load valid save data', () => {
      const saveData: SavedGame = {
        state: mockGameState,
        timestamp: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      const result = loadGame();
      expect(result).not.toBeNull();
      expect(result?.state).toEqual(mockGameState);
    });

    it('should return null for invalid save data (missing state)', () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ timestamp: Date.now() }));

      const result = loadGame();
      expect(result).toBeNull();
    });

    it('should return null for invalid save data (missing timestamp)', () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ state: mockGameState }));

      const result = loadGame();
      expect(result).toBeNull();
    });

    it('should return null and clear expired saves (older than 24 hours)', () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const saveData: SavedGame = {
        state: mockGameState,
        timestamp: expiredTimestamp,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      const result = loadGame();
      expect(result).toBeNull();
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem(SAVE_KEY, 'invalid json');

      const result = loadGame();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearSave', () => {
    it('should remove save from localStorage', () => {
      localStorage.setItem(SAVE_KEY, 'test');

      clearSave();

      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');
      mockRemoveItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearSave()).not.toThrow();
    });
  });

  describe('hasSavedGame', () => {
    it('should return false when no save exists', () => {
      expect(hasSavedGame()).toBe(false);
    });

    it('should return true when valid save exists', () => {
      const saveData: SavedGame = {
        state: mockGameState,
        timestamp: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      expect(hasSavedGame()).toBe(true);
    });

    it('should return false when save is expired', () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const saveData: SavedGame = {
        state: mockGameState,
        timestamp: expiredTimestamp,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      expect(hasSavedGame()).toBe(false);
    });
  });
});
