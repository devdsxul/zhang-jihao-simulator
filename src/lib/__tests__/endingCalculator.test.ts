import { calculateEnding, calculateEndingScore, getEndingFlavorText, getStatSummary } from '../endingCalculator';
import { Ending, GameStats } from '@/types/game';

const mockEndings: Ending[] = [
  {
    id: 'ending-legendary',
    type: 'positive',
    rarity: 'legendary',
    title: 'Legendary Ending',
    description: 'A legendary ending',
    conditions: [
      { stat: 'billiardsSkill', operator: 'gte', value: 90 },
      { stat: 'wealth', operator: 'gte', value: 80 },
    ],
    priority: 100,
  },
  {
    id: 'ending-positive',
    type: 'positive',
    rarity: 'common',
    title: 'Positive Ending',
    description: 'A positive ending',
    conditions: [{ stat: 'sanity', operator: 'gte', value: 60 }],
    priority: 50,
  },
  {
    id: 'ending-negative',
    type: 'negative',
    rarity: 'common',
    title: 'Negative Ending',
    description: 'A negative ending',
    conditions: [{ stat: 'sanity', operator: 'lt', value: 20 }],
    priority: 40,
  },
  {
    id: 'ending-flag',
    type: 'positive',
    rarity: 'rare',
    title: 'Flag Ending',
    description: 'Ending requires flag',
    conditions: [
      { flag: 'special_choice', operator: 'hasFlag' },
      { stat: 'wealth', operator: 'gte', value: 50 },
    ],
    priority: 90,
  },
  {
    id: 'neg-368',
    type: 'negative',
    rarity: 'uncommon',
    title: '炒股爆仓',
    description: '炒股爆仓结局',
    conditions: [
      { stat: 'wealth', operator: 'lte', value: 5 },
      { flag: 'stock_trading', operator: 'hasFlag' },
    ],
    priority: 75,
  },
  {
    id: 'ending-poor',
    type: 'negative',
    rarity: 'common',
    title: 'Generic Poor Ending',
    description: 'Generic ending for low wealth',
    conditions: [{ stat: 'wealth', operator: 'lte', value: 5 }],
    priority: 30,
  },
];

describe('endingCalculator', () => {
  describe('calculateEnding', () => {
    it('should return highest priority matching ending', () => {
      const stats: GameStats = {
        academicStanding: 50,
        digitalSafety: 50,
        wealth: 85,
        billiardsSkill: 95,
        sanity: 70,
      };

      const ending = calculateEnding(stats, mockEndings);

      expect(ending.id).toBe('ending-legendary');
    });

    it('should respect priority order', () => {
      const stats: GameStats = {
        academicStanding: 50,
        digitalSafety: 50,
        wealth: 50,
        billiardsSkill: 50,
        sanity: 70,
      };

      const ending = calculateEnding(stats, mockEndings);

      expect(ending.id).toBe('ending-positive');
    });

    it('should match negative ending when conditions met', () => {
      const stats: GameStats = {
        academicStanding: 30,
        digitalSafety: 30,
        wealth: 30,
        billiardsSkill: 30,
        sanity: 15,
      };

      const ending = calculateEnding(stats, mockEndings);

      expect(ending.id).toBe('ending-negative');
    });

    it('should check flag conditions', () => {
      const stats: GameStats = {
        academicStanding: 50,
        digitalSafety: 50,
        wealth: 60,
        billiardsSkill: 50,
        sanity: 70,
      };

      // Without flag
      const endingNoFlag = calculateEnding(stats, mockEndings, []);
      expect(endingNoFlag.id).toBe('ending-positive');

      // With flag
      const endingWithFlag = calculateEnding(stats, mockEndings, ['special_choice']);
      expect(endingWithFlag.id).toBe('ending-flag');
    });

    it('should require stock_trading flag for 炒股爆仓 ending', () => {
      const stats: GameStats = {
        academicStanding: 30,
        digitalSafety: 30,
        wealth: 3,
        billiardsSkill: 30,
        sanity: 50, // Changed to 50 so positive ending (sanity >= 60) doesn't match
      };

      // Without flag - should get generic poor ending
      const endingNoFlag = calculateEnding(stats, mockEndings, []);
      expect(endingNoFlag.id).toBe('ending-poor');

      // With stock_trading flag - should get 炒股爆仓
      const endingWithFlag = calculateEnding(stats, mockEndings, ['stock_trading']);
      expect(endingWithFlag.id).toBe('neg-368');
    });
  });

  describe('calculateEndingScore', () => {
    it('should calculate average of all stats', () => {
      const stats: GameStats = {
        academicStanding: 50,
        digitalSafety: 50,
        wealth: 50,
        billiardsSkill: 50,
        sanity: 50,
      };

      expect(calculateEndingScore(stats)).toBe(50);
    });

    it('should round to nearest integer', () => {
      const stats: GameStats = {
        academicStanding: 51,
        digitalSafety: 52,
        wealth: 53,
        billiardsSkill: 54,
        sanity: 55,
      };

      expect(calculateEndingScore(stats)).toBe(53);
    });
  });

  describe('getEndingFlavorText', () => {
    it('should return correct text for negative ending', () => {
      const ending: Ending = {
        id: 'test',
        type: 'negative',
        rarity: 'common',
        title: 'Test',
        description: 'Test',
        conditions: [],
        priority: 1,
      };

      expect(getEndingFlavorText(ending)).toContain('急转直下');
    });

    it('should return correct text for positive ending', () => {
      const ending: Ending = {
        id: 'test',
        type: 'positive',
        rarity: 'common',
        title: 'Test',
        description: 'Test',
        conditions: [],
        priority: 1,
      };

      expect(getEndingFlavorText(ending)).toContain('找到了出路');
    });

    it('should return correct text for legendary ending', () => {
      const ending: Ending = {
        id: 'test',
        type: 'positive',
        rarity: 'legendary',
        title: 'Test',
        description: 'Test',
        conditions: [],
        priority: 1,
      };

      expect(getEndingFlavorText(ending)).toContain('传奇');
    });
  });

  describe('getStatSummary', () => {
    it('should return empty array for average stats', () => {
      const stats: GameStats = {
        academicStanding: 50,
        digitalSafety: 50,
        wealth: 50,
        billiardsSkill: 50,
        sanity: 50,
      };

      expect(getStatSummary(stats)).toEqual([]);
    });

    it('should include warning for low stats', () => {
      const stats: GameStats = {
        academicStanding: 5,
        digitalSafety: 50,
        wealth: 50,
        billiardsSkill: 50,
        sanity: 50,
      };

      const summaries = getStatSummary(stats);
      expect(summaries.some(s => s.includes('学业'))).toBe(true);
    });

    it('should include praise for high stats', () => {
      const stats: GameStats = {
        academicStanding: 85,
        digitalSafety: 50,
        wealth: 50,
        billiardsSkill: 50,
        sanity: 50,
      };

      const summaries = getStatSummary(stats);
      expect(summaries.some(s => s.includes('学业'))).toBe(true);
    });

    it('should include billiards skill praise for high skill', () => {
      const stats: GameStats = {
        academicStanding: 50,
        digitalSafety: 50,
        wealth: 50,
        billiardsSkill: 92,
        sanity: 50,
      };

      const summaries = getStatSummary(stats);
      expect(summaries.some(s => s.includes('台球'))).toBe(true);
    });
  });
});
