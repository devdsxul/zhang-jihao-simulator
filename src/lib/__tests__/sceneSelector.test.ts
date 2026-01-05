import { selectScenesForGame } from '../sceneSelector';
import { Scene } from '@/types/game';

// Mock scenes for testing
const createMockScene = (id: string, category: string, hasMinigame = false): Scene => ({
  id,
  category: category as Scene['category'],
  text: `Scene ${id}`,
  animation: 'studying',
  choices: [{ id: 'c1', text: 'Choice', effects: [] }],
  ...(hasMinigame && { minigame: { type: 'billiards' as const, difficulty: 1 } }),
});

const mockScenes: Scene[] = [
  createMockScene('ac1', 'academic-struggles'),
  createMockScene('ac2', 'academic-struggles'),
  createMockScene('ff1', 'football-fandom'),
  createMockScene('ff2', 'football-fandom'),
  createMockScene('bp1', 'billiards-progression', true),
  createMockScene('bp2', 'billiards-progression'),
  createMockScene('gf1', 'great-firewall'),
  createMockScene('ds1', 'digital-survival'),
  createMockScene('ft1', 'financial-temptations', true),
  createMockScene('tl1', 'tianjin-life'),
  createMockScene('hp1', 'hometown-pressure'),
  createMockScene('hph1', 'health-physique'),
  createMockScene('cm1', 'crisis-management'),
];

describe('sceneSelector', () => {
  describe('selectScenesForGame', () => {
    it('should return requested number of scenes', () => {
      const selected = selectScenesForGame(mockScenes, 10);
      expect(selected.length).toBe(10);
    });

    it('should not exceed available scenes', () => {
      const selected = selectScenesForGame(mockScenes, 20);
      expect(selected.length).toBe(mockScenes.length);
    });

    it('should guarantee at least minMinigames scenes with minigames', () => {
      // Run multiple times to account for randomness
      for (let i = 0; i < 10; i++) {
        const selected = selectScenesForGame(mockScenes, 10, 1);
        const minigameCount = selected.filter(s => s.minigame).length;
        expect(minigameCount).toBeGreaterThanOrEqual(1);
      }
    });

    it('should include minigame scenes when minMinigames is 2', () => {
      for (let i = 0; i < 10; i++) {
        const selected = selectScenesForGame(mockScenes, 10, 2);
        const minigameCount = selected.filter(s => s.minigame).length;
        expect(minigameCount).toBeGreaterThanOrEqual(2);
      }
    });

    it('should return unique scenes (no duplicates)', () => {
      const selected = selectScenesForGame(mockScenes, 10);
      const ids = selected.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include variety of categories when possible', () => {
      // With 10 scenes from 10+ categories, should have variety
      const selected = selectScenesForGame(mockScenes, 10);
      const categories = new Set(selected.map(s => s.category));
      // Should have at least a few different categories
      expect(categories.size).toBeGreaterThanOrEqual(3);
    });

    it('should handle empty scene list', () => {
      const selected = selectScenesForGame([], 10);
      expect(selected).toEqual([]);
    });

    it('should handle request for 0 scenes', () => {
      const selected = selectScenesForGame(mockScenes, 0);
      expect(selected).toEqual([]);
    });
  });
});
