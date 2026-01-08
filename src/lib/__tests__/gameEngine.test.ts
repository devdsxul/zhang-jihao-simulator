import { initGame, applyChoice, checkCondition, getCurrentScene } from '../gameEngine';
import { GameState, Choice, Scene, INITIAL_STATS, StatCondition, FlagCondition } from '@/types/game';

// Mock scene for testing
const mockScene: Scene = {
  id: 'test-scene-1',
  category: 'academic-struggles',
  text: 'Test scene text',
  animation: 'studying',
  choices: [
    { id: 'choice-1', text: 'Choice 1', effects: [{ stat: 'wealth', change: 10 }] },
    { id: 'choice-2', text: 'Choice 2', effects: [{ stat: 'sanity', change: -5 }] },
  ],
};

const mockSceneWithFlag: Scene = {
  id: 'test-scene-flag',
  category: 'football-fandom',
  text: 'Flag test scene',
  animation: 'football',
  choices: [
    {
      id: 'choice-flag',
      text: 'Set flag',
      effects: [
        { stat: 'wealth', change: 5 },
        { type: 'setFlag', flag: 'test_flag' }
      ]
    },
  ],
};

describe('gameEngine', () => {
  describe('initGame', () => {
    it('should initialize game state with correct values', () => {
      const scenes = [mockScene];
      const state = initGame(scenes);

      expect(state.currentScene).toBe(0);
      expect(state.totalScenes).toBe(1);
      expect(state.stats).toEqual(INITIAL_STATS);
      expect(state.flags).toEqual([]);
      expect(state.selectedScenes).toEqual(scenes);
      expect(state.isGameOver).toBe(false);
      expect(state.currentEnding).toBeNull();
      expect(state.sceneHistory).toEqual([]);
    });

    it('should handle multiple scenes', () => {
      const scenes = [mockScene, mockSceneWithFlag];
      const state = initGame(scenes);

      expect(state.totalScenes).toBe(2);
      expect(state.selectedScenes.length).toBe(2);
    });
  });

  describe('applyChoice', () => {
    it('should apply stat effects from choice', () => {
      const state = initGame([mockScene, mockSceneWithFlag]);
      const choice: Choice = {
        id: 'test-choice',
        text: 'Test',
        effects: [{ stat: 'wealth', change: 20 }],
      };

      const newState = applyChoice(state, choice, mockScene);

      expect(newState.stats.wealth).toBe(INITIAL_STATS.wealth + 20);
      expect(newState.currentScene).toBe(1);
    });

    it('should clamp stats between 0 and 100', () => {
      const state = initGame([mockScene, mockSceneWithFlag]);

      // Test upper bound
      const choiceHigh: Choice = {
        id: 'high',
        text: 'High',
        effects: [{ stat: 'wealth', change: 200 }],
      };
      const newStateHigh = applyChoice(state, choiceHigh, mockScene);
      expect(newStateHigh.stats.wealth).toBe(100);

      // Test lower bound (with SAFETY_FLOOR = 5 from balance system)
      const choiceLow: Choice = {
        id: 'low',
        text: 'Low',
        effects: [{ stat: 'sanity', change: -200 }],
      };
      const newStateLow = applyChoice(state, choiceLow, mockScene);
      expect(newStateLow.stats.sanity).toBe(5); // SAFETY_FLOOR prevents going below 5
    });

    it('should set flags correctly', () => {
      const state = initGame([mockSceneWithFlag, mockScene]);
      const choice: Choice = {
        id: 'flag-choice',
        text: 'Set flag',
        effects: [{ type: 'setFlag', flag: 'important_decision' }],
      };

      const newState = applyChoice(state, choice, mockSceneWithFlag);

      expect(newState.flags).toContain('important_decision');
    });

    it('should clear flags correctly', () => {
      const stateWithFlag: GameState = {
        ...initGame([mockScene, mockSceneWithFlag]),
        flags: ['existing_flag', 'another_flag'],
      };
      const choice: Choice = {
        id: 'clear-choice',
        text: 'Clear flag',
        effects: [{ type: 'clearFlag', flag: 'existing_flag' }],
      };

      const newState = applyChoice(stateWithFlag, choice, mockScene);

      expect(newState.flags).not.toContain('existing_flag');
      expect(newState.flags).toContain('another_flag');
    });

    it('should record scene history', () => {
      const state = initGame([mockScene, mockSceneWithFlag]);
      const choice = mockScene.choices[0];

      const newState = applyChoice(state, choice, mockScene);

      expect(newState.sceneHistory.length).toBe(1);
      expect(newState.sceneHistory[0].sceneId).toBe(mockScene.id);
      expect(newState.sceneHistory[0].choiceId).toBe(choice.id);
    });

    it('should not set isGameOver when reaching last scene in infinite mode', () => {
      const state = initGame([mockScene]);
      const choice = mockScene.choices[0];

      const newState = applyChoice(state, choice, mockScene);

      // In infinite mode, isGameOver is always false (determined by endingCalculator)
      expect(newState.isGameOver).toBe(false);
    });
  });

  describe('checkCondition', () => {
    const testStats = {
      academicStanding: 50,
      digitalSafety: 30,
      wealth: 70,
      billiardsSkill: 80,
      sanity: 40,
    };

    describe('stat conditions', () => {
      it('should check "lt" operator correctly', () => {
        const condition: StatCondition = { stat: 'wealth', operator: 'lt', value: 80 };
        expect(checkCondition(testStats, condition)).toBe(true);

        const conditionFalse: StatCondition = { stat: 'wealth', operator: 'lt', value: 50 };
        expect(checkCondition(testStats, conditionFalse)).toBe(false);
      });

      it('should check "lte" operator correctly', () => {
        const condition: StatCondition = { stat: 'wealth', operator: 'lte', value: 70 };
        expect(checkCondition(testStats, condition)).toBe(true);

        const conditionFalse: StatCondition = { stat: 'wealth', operator: 'lte', value: 60 };
        expect(checkCondition(testStats, conditionFalse)).toBe(false);
      });

      it('should check "gt" operator correctly', () => {
        const condition: StatCondition = { stat: 'wealth', operator: 'gt', value: 60 };
        expect(checkCondition(testStats, condition)).toBe(true);

        const conditionFalse: StatCondition = { stat: 'wealth', operator: 'gt', value: 80 };
        expect(checkCondition(testStats, conditionFalse)).toBe(false);
      });

      it('should check "gte" operator correctly', () => {
        const condition: StatCondition = { stat: 'wealth', operator: 'gte', value: 70 };
        expect(checkCondition(testStats, condition)).toBe(true);

        const conditionFalse: StatCondition = { stat: 'wealth', operator: 'gte', value: 80 };
        expect(checkCondition(testStats, conditionFalse)).toBe(false);
      });

      it('should check "eq" operator correctly', () => {
        const condition: StatCondition = { stat: 'wealth', operator: 'eq', value: 70 };
        expect(checkCondition(testStats, condition)).toBe(true);

        const conditionFalse: StatCondition = { stat: 'wealth', operator: 'eq', value: 71 };
        expect(checkCondition(testStats, conditionFalse)).toBe(false);
      });
    });

    describe('flag conditions', () => {
      const flags = ['flag_a', 'flag_b'];

      it('should check "hasFlag" operator correctly', () => {
        const condition: FlagCondition = { flag: 'flag_a', operator: 'hasFlag' };
        expect(checkCondition(testStats, condition, flags)).toBe(true);

        const conditionFalse: FlagCondition = { flag: 'flag_c', operator: 'hasFlag' };
        expect(checkCondition(testStats, conditionFalse, flags)).toBe(false);
      });

      it('should check "notFlag" operator correctly', () => {
        const condition: FlagCondition = { flag: 'flag_c', operator: 'notFlag' };
        expect(checkCondition(testStats, condition, flags)).toBe(true);

        const conditionFalse: FlagCondition = { flag: 'flag_a', operator: 'notFlag' };
        expect(checkCondition(testStats, conditionFalse, flags)).toBe(false);
      });
    });
  });

  describe('getCurrentScene', () => {
    it('should return current scene', () => {
      const state = initGame([mockScene, mockSceneWithFlag]);
      const scene = getCurrentScene(state);

      expect(scene).toBe(mockScene);
    });

    it('should return null when past last scene', () => {
      const state: GameState = {
        ...initGame([mockScene]),
        currentScene: 1,
      };
      const scene = getCurrentScene(state);

      expect(scene).toBeNull();
    });
  });
});
