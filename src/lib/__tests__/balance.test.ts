import { applyBalancedEffect, BALANCE_CONFIG } from '../balanceConfig';

describe('balanceConfig', () => {
  describe('applyBalancedEffect', () => {
    it('should apply full effect when stat is at healthy level', () => {
      const result = applyBalancedEffect(50, -10);
      expect(result).toBe(-10);
    });

    it('should reduce negative effect when stat is low', () => {
      const result = applyBalancedEffect(15, -10);
      expect(result).toBeGreaterThan(-10);
      expect(result).toBeLessThan(0);
    });

    it('should not reduce stat below safety floor in single choice', () => {
      const result = applyBalancedEffect(10, -20);
      // Starting from 10, applying result should not go below SAFETY_FLOOR (5)
      expect(10 + result).toBeGreaterThanOrEqual(BALANCE_CONFIG.SAFETY_FLOOR);
    });

    it('should apply full positive effect regardless of stat level', () => {
      const resultHigh = applyBalancedEffect(80, 10);
      const resultLow = applyBalancedEffect(20, 10);
      expect(resultHigh).toBe(10);
      expect(resultLow).toBe(10);
    });

    it('should allow stat to drop below safety floor over multiple choices', () => {
      // Simulate multiple bad choices
      let stat = 30;
      for (let i = 0; i < 5; i++) {
        const effect = applyBalancedEffect(stat, -10);
        stat = Math.max(0, stat + effect);
      }
      // After multiple bad choices, stat should be able to go very low
      expect(stat).toBeLessThan(BALANCE_CONFIG.SAFETY_FLOOR);
    });
  });

  describe('BALANCE_CONFIG', () => {
    it('should have a safety floor of 5', () => {
      expect(BALANCE_CONFIG.SAFETY_FLOOR).toBe(5);
    });

    it('should have a diminish threshold of 20', () => {
      expect(BALANCE_CONFIG.DIMINISH_THRESHOLD).toBe(20);
    });
  });
});
