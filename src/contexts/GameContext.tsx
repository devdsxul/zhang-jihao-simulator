"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import {
  GameState,
  GameStats,
  Scene,
  Choice,
  Ending,
  INITIAL_STATS,
  TOTAL_SCENES,
  StatEffect,
  isStatEffect,
} from "@/types/game";
import { initGame, applyChoice, getCurrentScene, calculateCompositeScore } from "@/lib/gameEngine";
import { selectScenesForGame, selectNextSceneForInfiniteMode } from "@/lib/sceneSelector";
import { checkTermination } from "@/lib/endingCalculator";
import { saveGame, loadGame, clearSave } from "@/lib/saveManager";

interface ExtendedGameState extends GameState {
  recentChanges: StatEffect[];
}

type GameAction =
  | { type: "START_GAME"; selectedScenes: Scene[] }
  | { type: "MAKE_CHOICE"; choice: Choice; scene: Scene; endings: Ending[]; nextScene?: Scene }
  | { type: "APPLY_STAT_CHANGE"; stat: keyof GameStats; change: number }
  | { type: "RESET_GAME" }
  | { type: "CLEAR_RECENT_CHANGES" }
  | { type: "RESTORE_SAVE"; savedState: GameState }
  | { type: "ADD_NEXT_SCENE"; scene: Scene };

interface GameContextType {
  state: ExtendedGameState;
  allScenes: Scene[];
  allEndings: Ending[];
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  makeChoice: (choice: Choice) => void;
  resetGame: () => void;
  applyStatChanges: (stat: keyof GameStats, change: number) => void;
  restoreFromSave: () => boolean;
  hasSave: () => boolean;
  currentScene: Scene | null;
}

const initialState: ExtendedGameState = {
  currentScene: 0,
  totalScenes: TOTAL_SCENES,
  stats: { ...INITIAL_STATS },
  flags: [],
  selectedScenes: [],
  isGameOver: false,
  currentEnding: null,
  sceneHistory: [],
  recentChanges: [],
  // Infinite mode fields
  turnCount: 0,
  compositeScore: calculateCompositeScore(INITIAL_STATS),
  choicePath: [],
  consecutiveHighScore: 0,
};

function gameReducer(state: ExtendedGameState, action: GameAction): ExtendedGameState {
  switch (action.type) {
    case "START_GAME": {
      // Pure state initialization - scene selection done outside reducer
      return { ...initGame(action.selectedScenes), recentChanges: [] };
    }
    case "MAKE_CHOICE": {
      // Apply choice with the current scene
      const newState = applyChoice(state, action.choice, action.scene);
      const recentChanges = (action.choice.effects || []).filter(isStatEffect);

      // Check for termination conditions (infinite mode)
      const termination = checkTermination(newState, action.endings);

      if (termination.shouldTerminate && termination.ending) {
        return {
          ...newState,
          isGameOver: true,
          currentEnding: termination.ending,
          recentChanges,
        };
      }

      // Add next scene if provided (scene selection uses sliding window in selector)
      let updatedScenes = [...newState.selectedScenes];
      if (action.nextScene) {
        // Allow adding even if scene was played before (infinite mode reuse)
        // Selector's sliding window prevents immediate repeats
        updatedScenes = [...updatedScenes, action.nextScene];
      }

      return {
        ...newState,
        selectedScenes: updatedScenes,
        totalScenes: updatedScenes.length,
        recentChanges,
      };
    }
    case "ADD_NEXT_SCENE": {
      if (state.selectedScenes.some(s => s.id === action.scene.id)) {
        return state;
      }
      const newScenes = [...state.selectedScenes, action.scene];
      return {
        ...state,
        selectedScenes: newScenes,
        totalScenes: newScenes.length,
      };
    }
    case "APPLY_STAT_CHANGE": {
      const newValue = Math.max(0, Math.min(100, state.stats[action.stat] + action.change));
      const newStats = {
        ...state.stats,
        [action.stat]: newValue,
      };
      return {
        ...state,
        stats: newStats,
        compositeScore: calculateCompositeScore(newStats, state.flags),
        recentChanges: [{ stat: action.stat, change: action.change }],
      };
    }
    case "CLEAR_RECENT_CHANGES": {
      return { ...state, recentChanges: [] };
    }
    case "RESET_GAME": {
      // Pure state reset using initGame as single source of truth
      return { ...initGame([]), recentChanges: [] };
    }
    case "RESTORE_SAVE": {
      return {
        ...action.savedState,
        recentChanges: [],
        // Ensure infinite mode fields are present
        turnCount: action.savedState.turnCount ?? 0,
        compositeScore: action.savedState.compositeScore ?? calculateCompositeScore(action.savedState.stats, action.savedState.flags),
        choicePath: action.savedState.choicePath ?? [],
        consecutiveHighScore: action.savedState.consecutiveHighScore ?? 0,
      };
    }
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
  scenes: Scene[];
  endings: Ending[];
}

export function GameProvider({ children, scenes, endings }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Auto-save on state changes
  useEffect(() => {
    if (state.selectedScenes.length > 0 && !state.isGameOver) {
      saveGame(state);
    }
  }, [state]);

  // Clear save on game over
  useEffect(() => {
    if (state.isGameOver) {
      clearSave();
    }
  }, [state.isGameOver]);

  const startGame = () => {
    clearSave();
    const selectedScenes = selectScenesForGame(scenes, TOTAL_SCENES);
    dispatch({ type: "START_GAME", selectedScenes });
  };

  const makeChoice = (choice: Choice) => {
    const currentSceneData = getCurrentScene(state);
    if (currentSceneData) {
      // Pre-select next scene outside reducer if needed
      let nextScene: Scene | undefined;
      if (state.currentScene >= state.selectedScenes.length - 2) {
        nextScene = selectNextSceneForInfiniteMode(state, scenes);
        // Allow scene reuse in infinite mode - only avoid if in recent window
        // selectNextSceneForInfiniteMode already uses sliding window (last 5)
      }
      dispatch({
        type: "MAKE_CHOICE",
        choice,
        scene: currentSceneData,
        endings,
        nextScene,
      });
    }
  };

  const resetGame = () => {
    clearSave();
    dispatch({ type: "RESET_GAME" });
  };

  const applyStatChanges = (stat: keyof GameStats, change: number) => {
    dispatch({ type: "APPLY_STAT_CHANGE", stat, change });
  };

  const restoreFromSave = (): boolean => {
    const saved = loadGame();
    if (saved) {
      dispatch({ type: "RESTORE_SAVE", savedState: saved.state });
      return true;
    }
    return false;
  };

  const hasSave = (): boolean => {
    return loadGame() !== null;
  };

  const currentScene = getCurrentScene(state);

  return (
    <GameContext.Provider
      value={{
        state,
        allScenes: scenes,
        allEndings: endings,
        dispatch,
        startGame,
        makeChoice,
        resetGame,
        applyStatChanges,
        restoreFromSave,
        hasSave,
        currentScene,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

export { GameContext };
