"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { GameState, GameStats, Scene, Choice, Ending, INITIAL_STATS, TOTAL_SCENES, StatEffect, isStatEffect } from "@/types/game";
import { initGame, applyChoice, getCurrentScene } from "@/lib/gameEngine";
import { selectScenesForGame } from "@/lib/sceneSelector";
import { calculateEnding } from "@/lib/endingCalculator";
import { saveGame, loadGame, clearSave } from "@/lib/saveManager";

interface ExtendedGameState extends GameState {
  recentChanges: StatEffect[];
}

type GameAction =
  | { type: "START_GAME"; scenes: Scene[]; endings: Ending[] }
  | { type: "MAKE_CHOICE"; choice: Choice; endings: Ending[] }
  | { type: "APPLY_STAT_CHANGE"; stat: keyof GameStats; change: number }
  | { type: "RESET_GAME" }
  | { type: "CLEAR_RECENT_CHANGES" }
  | { type: "RESTORE_SAVE"; savedState: GameState };

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
};

function gameReducer(state: ExtendedGameState, action: GameAction): ExtendedGameState {
  switch (action.type) {
    case "START_GAME": {
      const selectedScenes = selectScenesForGame(action.scenes, TOTAL_SCENES);
      return { ...initGame(selectedScenes), recentChanges: [] };
    }
    case "MAKE_CHOICE": {
      const newState = applyChoice(state, action.choice);
      // Filter to get only stat effects for recentChanges display
      const recentChanges = (action.choice.effects || []).filter(isStatEffect);
      if (newState.isGameOver) {
        const ending = calculateEnding(newState.stats, action.endings, newState.flags);
        return { ...newState, currentEnding: ending, recentChanges };
      }
      return { ...newState, recentChanges };
    }
    case "APPLY_STAT_CHANGE": {
      const newValue = Math.max(0, Math.min(100, state.stats[action.stat] + action.change));
      return {
        ...state,
        stats: {
          ...state.stats,
          [action.stat]: newValue,
        },
        recentChanges: [{ stat: action.stat, change: action.change }],
      };
    }
    case "CLEAR_RECENT_CHANGES": {
      return { ...state, recentChanges: [] };
    }
    case "RESET_GAME": {
      clearSave();
      return { ...initialState };
    }
    case "RESTORE_SAVE": {
      return { ...action.savedState, recentChanges: [] };
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
    dispatch({ type: "START_GAME", scenes, endings });
  };

  const makeChoice = (choice: Choice) => {
    dispatch({ type: "MAKE_CHOICE", choice, endings });
  };

  const resetGame = () => {
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
