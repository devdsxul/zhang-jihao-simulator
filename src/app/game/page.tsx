"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Scene, Ending, Choice, MinigameType, MinigameReward } from "@/types/game";
import { GameProvider, useGame } from "@/contexts/GameContext";
import SceneCard from "@/components/SceneCard";
import ChoiceButton from "@/components/ChoiceButton";
import StatsBar from "@/components/StatsBar";
import EndingModal from "@/components/EndingModal";
import { BilliardsMiniGame, MoneyRunMiniGame, CampNouGuardian } from "@/components/minigames";

// Import scene and ending data
import academicStruggles from "@/data/scenes/academic-struggles.json";
import footballFandom from "@/data/scenes/football-fandom.json";
import billiardsProgression from "@/data/scenes/billiards-progression.json";
import greatFirewall from "@/data/scenes/great-firewall.json";
import digitalSurvival from "@/data/scenes/digital-survival.json";
import financialTemptations from "@/data/scenes/financial-temptations.json";
import tianjinLife from "@/data/scenes/tianjin-life.json";
import hometownPressure from "@/data/scenes/hometown-pressure.json";
import healthPhysique from "@/data/scenes/health-physique.json";
import crisisManagement from "@/data/scenes/crisis-management.json";
import minigameScenes from "@/data/scenes/minigame-scenes.json";
import endingsData from "@/data/endings.json";

// Combine all scenes
const allScenes: Scene[] = [
  ...academicStruggles,
  ...footballFandom,
  ...billiardsProgression,
  ...greatFirewall,
  ...digitalSurvival,
  ...financialTemptations,
  ...tianjinLife,
  ...hometownPressure,
  ...healthPhysique,
  ...crisisManagement,
  ...minigameScenes,
] as Scene[];

const allEndings: Ending[] = endingsData as Ending[];

// Game content component
function GameContent() {
  const router = useRouter();
  const { state, startGame, makeChoice, resetGame, currentScene, applyStatChanges, restoreFromSave, hasSave } = useGame();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState<{ type: MinigameType; difficulty: number } | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasCheckedSave, setHasCheckedSave] = useState(false);

  // Check for saved game on mount
  useEffect(() => {
    if (!hasCheckedSave) {
      setHasCheckedSave(true);
      if (hasSave()) {
        setShowSavePrompt(true);
      } else if (state.selectedScenes.length === 0) {
        startGame();
      }
    }
  }, [hasCheckedSave, hasSave, state.selectedScenes.length, startGame]);

  const handleRestoreSave = () => {
    restoreFromSave();
    setShowSavePrompt(false);
  };

  const handleNewGame = () => {
    setShowSavePrompt(false);
    startGame();
  };

  // Handle choice selection - optimized with 150ms for snappy but visible fade
  const handleChoice = (choice: Choice) => {
    // Check if choice triggers a minigame
    if (choice.triggerMinigame && currentScene?.minigame) {
      setActiveMinigame({
        type: currentScene.minigame.type,
        difficulty: currentScene.minigame.difficulty,
      });
      return;
    }

    setIsTransitioning(true);
    // Match CSS transition duration (0.15s) for smooth visible fade
    setTimeout(() => {
      makeChoice(choice);
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 150);
  };

  // Handle minigame result with typed reward
  const handleMinigameResult = useCallback((success: boolean, reward: MinigameReward) => {
    setActiveMinigame(null);

    // Apply stat changes from minigame using typed properties
    if (reward.wealth !== undefined) applyStatChanges("wealth", reward.wealth);
    if (reward.sanity !== undefined) applyStatChanges("sanity", reward.sanity);
    if (reward.billiardsSkill !== undefined) applyStatChanges("billiardsSkill", reward.billiardsSkill);
    if (reward.digitalSafety !== undefined) applyStatChanges("digitalSafety", reward.digitalSafety);
    if (reward.academicStanding !== undefined) applyStatChanges("academicStanding", reward.academicStanding);

    // Advance to next scene
    setIsTransitioning(true);
    setTimeout(() => {
      const dummyChoice: Choice = {
        id: "minigame_complete",
        text: success ? "成功" : "失败",
        effects: [],
      };
      makeChoice(dummyChoice);
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 150);
  }, [applyStatChanges, makeChoice]);

  // Handle restart
  const handleRestart = () => {
    resetGame();
    startGame();
  };

  // Handle back to home
  const handleBackHome = () => {
    resetGame();
    router.push("/");
  };

  // Loading state
  if (showSavePrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glassmorphism-dark p-6 rounded-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-barca-primary to-barca-secondary flex items-center justify-center">
            <span className="text-2xl">💾</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">发现存档</h2>
          <p className="text-foreground/60 mb-6">检测到未完成的游戏，是否继续？</p>
          <div className="space-y-3">
            <button
              onClick={handleRestoreSave}
              className="btn-barca w-full py-3 text-foreground font-semibold"
            >
              继续游戏
            </button>
            <button
              onClick={handleNewGame}
              className="w-full py-3 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground/80 font-medium transition-colors"
            >
              开始新游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentScene && !state.isGameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-barca-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/60">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background - Brighter with Barça elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-barca-primary/15 via-background to-barca-secondary/15 -z-10" />
      <div className="fixed top-0 right-0 w-80 h-80 bg-barca-primary/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-barca-secondary/20 rounded-full blur-3xl -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-barca-accent/5 rounded-full blur-3xl -z-10" />

      {/* Barça Stripes Top Accent */}
      <div className="fixed top-0 left-0 right-0 h-1 barca-stripes opacity-70 z-50" />

      {/* Header */}
      <header className="fixed top-1 left-0 right-0 z-40 glassmorphism py-3 px-4 mx-2 mt-2 rounded-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBackHome}
            className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>←</span> <span className="hidden sm:inline">返回首页</span>
          </button>
          <h1 className="text-lg font-semibold text-gradient flex items-center gap-2">
            <span className="text-sm">⚽</span> 章吉豪模拟器
          </h1>
          <div className="text-sm text-foreground/70 font-medium bg-barca-primary/20 px-3 py-1 rounded-full">
            {state.currentScene + 1}/{state.totalScenes}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Scene Area */}
            <div className="lg:col-span-2 space-y-6">
              {currentScene && (
                <div className={`transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
                  <SceneCard
                    scene={currentScene}
                    sceneNumber={state.currentScene + 1}
                    totalScenes={state.totalScenes}
                  />

                  {/* Choices */}
                  <div className="mt-6 space-y-3">
                    {currentScene.choices.map((choice, index) => (
                      <ChoiceButton
                        key={choice.id}
                        choice={choice}
                        index={index}
                        onSelect={handleChoice}
                        disabled={isTransitioning}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <StatsBar stats={state.stats} recentChanges={state.recentChanges} />

                {/* Progress Bar */}
                <div className="mt-4 glassmorphism p-4 rounded-xl">
                  <div className="flex justify-between text-xs text-foreground/70 mb-2">
                    <span className="flex items-center gap-1">⚽ 游戏进度</span>
                    <span className="font-bold text-barca-accent">{Math.round(((state.currentScene + 1) / state.totalScenes) * 100)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-barca-dark/50 overflow-hidden border border-barca-primary/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-barca-primary via-barca-secondary to-barca-accent transition-all duration-500 shadow-glow"
                      style={{ width: `${((state.currentScene + 1) / state.totalScenes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ending Modal */}
      {state.isGameOver && state.currentEnding && (
        <EndingModal
          ending={state.currentEnding}
          stats={state.stats}
          onRestart={handleRestart}
          sceneHistory={state.sceneHistory}
        />
      )}

      {/* Minigame Overlay */}
      {activeMinigame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4">
            {activeMinigame.type === "billiards" && (
              <BilliardsMiniGame
                difficulty={activeMinigame.difficulty}
                onResult={handleMinigameResult}
              />
            )}
            {activeMinigame.type === "moneyrun" && (
              <MoneyRunMiniGame
                difficulty={activeMinigame.difficulty}
                onResult={handleMinigameResult}
              />
            )}
            {activeMinigame.type === "campnou" && (
              <CampNouGuardian
                difficulty={activeMinigame.difficulty}
                onResult={handleMinigameResult}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main game page with provider
export default function GamePage() {
  return (
    <GameProvider scenes={allScenes} endings={allEndings}>
      <GameContent />
    </GameProvider>
  );
}
