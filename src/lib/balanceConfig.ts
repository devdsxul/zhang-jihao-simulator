/**
 * Balance configuration for the game
 * Prevents single choices from being too devastating
 */

export const BALANCE_CONFIG = {
  /** Minimum stat value after a single choice */
  SAFETY_FLOOR: 5,
  /** Stat level below which negative effects start diminishing */
  DIMINISH_THRESHOLD: 20,
  /** Maximum diminish factor (0-1, where 1 = full effect, 0 = no effect) */
  MIN_EFFECT_FACTOR: 0.3,
};

/**
 * Apply balanced effect to a stat change
 * - Positive effects are always applied in full
 * - Negative effects are diminished when stat is low
 * - Single choice cannot reduce stat below SAFETY_FLOOR
 *
 * @param currentStat Current value of the stat
 * @param effect The raw effect value (negative or positive)
 * @returns The balanced effect to apply
 */
export function applyBalancedEffect(currentStat: number, effect: number): number {
  // Positive effects always apply in full
  if (effect >= 0) {
    return effect;
  }

  // Calculate diminish factor based on how low the stat is
  let factor = 1;
  if (currentStat < BALANCE_CONFIG.DIMINISH_THRESHOLD) {
    // Linear diminish from 1 to MIN_EFFECT_FACTOR as stat goes from threshold to 0
    factor = BALANCE_CONFIG.MIN_EFFECT_FACTOR +
      (1 - BALANCE_CONFIG.MIN_EFFECT_FACTOR) *
      (currentStat / BALANCE_CONFIG.DIMINISH_THRESHOLD);
  }

  // Apply diminished effect
  let balancedEffect = Math.round(effect * factor);

  // Ensure single choice doesn't drop stat below safety floor
  const projectedStat = currentStat + balancedEffect;
  if (projectedStat < BALANCE_CONFIG.SAFETY_FLOOR) {
    // Limit the effect so stat stays at safety floor
    balancedEffect = BALANCE_CONFIG.SAFETY_FLOOR - currentStat;
    // But only if the stat was above safety floor to begin with
    if (currentStat <= BALANCE_CONFIG.SAFETY_FLOOR) {
      // Allow some reduction even when already at/below safety floor
      // to enable eventual game over through repeated bad choices
      balancedEffect = Math.max(effect, Math.round(effect * BALANCE_CONFIG.MIN_EFFECT_FACTOR));
    }
  }

  return balancedEffect;
}
