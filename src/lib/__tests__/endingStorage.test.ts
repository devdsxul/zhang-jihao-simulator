import {
  getUnlockedEndings,
  saveUnlockedEnding,
  getEndingStats,
  clearUnlockedEndings,
  UnlockedEnding,
} from '../endingStorage';

const STORAGE_KEY = 'zjh_unlocked_endings';

const mockEnding = {
  id: 'neg-001',
  title: '测试结局',
  type: 'negative' as const,
  rarity: 'common' as const,
};

const mockPositiveEnding = {
  id: 'pos-001',
  title: '好结局',
  type: 'positive' as const,
  rarity: 'common' as const,
};

const mockLegendaryEnding = {
  id: 'legendary-001',
  title: '传说结局',
  type: 'positive' as const,
  rarity: 'legendary' as const,
};

describe('endingStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getUnlockedEndings', () => {
    it('should return empty array when no endings unlocked', () => {
      const result = getUnlockedEndings();
      expect(result).toEqual([]);
    });

    it('should return stored endings', () => {
      const endings: UnlockedEnding[] = [
        { id: 'neg-001', title: '结局1', type: 'negative', rarity: 'common', unlockedAt: Date.now() },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(endings));

      const result = getUnlockedEndings();
      expect(result).toEqual(endings);
    });

    it('should return empty array on parse error', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      const result = getUnlockedEndings();
      expect(result).toEqual([]);
    });
  });

  describe('saveUnlockedEnding', () => {
    it('should save new ending to storage', () => {
      saveUnlockedEnding(mockEnding);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!) as UnlockedEnding[];
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe(mockEnding.id);
      expect(parsed[0].title).toBe(mockEnding.title);
      expect(parsed[0].type).toBe(mockEnding.type);
      expect(typeof parsed[0].unlockedAt).toBe('number');
    });

    it('should not save duplicate endings', () => {
      saveUnlockedEnding(mockEnding);
      saveUnlockedEnding(mockEnding);

      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!) as UnlockedEnding[];
      expect(parsed.length).toBe(1);
    });

    it('should save multiple different endings', () => {
      saveUnlockedEnding(mockEnding);
      saveUnlockedEnding(mockPositiveEnding);
      saveUnlockedEnding(mockLegendaryEnding);

      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!) as UnlockedEnding[];
      expect(parsed.length).toBe(3);
    });
  });

  describe('getEndingStats', () => {
    it('should return zeros when no endings', () => {
      const stats = getEndingStats();
      expect(stats).toEqual({
        total: 0,
        positive: 0,
        negative: 0,
        common: 0,
        uncommon: 0,
        rare: 0,
        legendary: 0,
        secret: 0,
      });
    });

    it('should count endings by type and rarity correctly', () => {
      saveUnlockedEnding(mockEnding);
      saveUnlockedEnding(mockPositiveEnding);
      saveUnlockedEnding(mockLegendaryEnding);
      saveUnlockedEnding({ id: 'neg-002', title: '结局2', type: 'negative', rarity: 'common' });

      const stats = getEndingStats();
      expect(stats).toEqual({
        total: 4,
        positive: 2,
        negative: 2,
        common: 3,
        uncommon: 0,
        rare: 0,
        legendary: 1,
        secret: 0,
      });
    });
  });

  describe('clearUnlockedEndings', () => {
    it('should clear all endings from storage', () => {
      saveUnlockedEnding(mockEnding);
      saveUnlockedEnding(mockPositiveEnding);

      expect(getUnlockedEndings().length).toBe(2);

      clearUnlockedEndings();

      expect(getUnlockedEndings()).toEqual([]);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
