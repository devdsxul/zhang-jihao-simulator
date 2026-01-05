"use client";

import { useRouter } from "next/navigation";
import { Ending, GameStats, STAT_NAMES, VALID_STAT_KEYS, SceneHistoryEntry, RARITY_NAMES, RARITY_ICONS } from "@/types/game";
import { getEndingFlavorText, getStatSummary, calculateEndingScore } from "@/lib/endingCalculator";
import { saveUnlockedEnding } from "@/lib/endingStorage";
import { useEffect, useRef, useCallback, useState } from "react";

interface EndingModalProps {
  ending: Ending;
  stats: GameStats;
  onRestart: () => void;
  sceneHistory?: SceneHistoryEntry[];
}

export default function EndingModal({ ending, stats, onRestart, sceneHistory = [] }: EndingModalProps) {
  const router = useRouter();
  const flavorText = getEndingFlavorText(ending);
  const summaries = getStatSummary(stats);
  const modalRef = useRef<HTMLDivElement>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleBackHome = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    saveUnlockedEnding({
      id: ending.id,
      title: ending.title,
      description: ending.description,
      type: ending.type,
      rarity: ending.rarity,
    });
  }, [ending]);

  // Focus trap and keyboard handling
  useEffect(() => {
    // Lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the restart button on mount
    restartButtonRef.current?.focus();

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleBackHome();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleBackHome]);

  const modalClass =
    ending.type === "negative"
      ? "ending-negative"
      : ending.type === "positive"
      ? "ending-positive"
      : "ending-rare";

  const titleColor =
    ending.type === "negative"
      ? "text-barca-secondary"
      : ending.type === "positive"
      ? "text-barca-accent"
      : "text-barca-primary";

  const typeLabel =
    ending.type === "negative"
      ? "💀 悲剧结局"
      : ending.type === "positive"
      ? "🌟 正面结局"
      : "✨ 隐藏结局";

  const rarityLabel = `${RARITY_ICONS[ending.rarity]} ${RARITY_NAMES[ending.rarity]}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ending-title"
      aria-describedby="ending-description"
    >
      <div
        ref={modalRef}
        className={`
          ending-modal ${modalClass}
          max-w-lg w-full p-4 sm:p-6 md:p-8 rounded-2xl my-4
          animate-slide-in
        `}
      >
        {/* Ending Type & Rarity Badges */}
        <div className="flex justify-center gap-2 mb-3 sm:mb-4 flex-wrap">
          <span
            className={`
              px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium
              ${
                ending.type === "negative"
                  ? "bg-barca-secondary/30 text-barca-secondary"
                  : ending.type === "positive"
                  ? "bg-barca-accent/30 text-barca-accent"
                  : "bg-barca-primary/30 text-barca-primary"
              }
            `}
          >
            {typeLabel}
          </span>
          <span className={`rarity-badge rarity-${ending.rarity} text-xs sm:text-sm`}>
            {rarityLabel}
          </span>
        </div>

        {/* Title */}
        <h2
          id="ending-title"
          className={`text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4 ${titleColor}`}
        >
          {ending.title}
        </h2>

        {/* Flavor Text */}
        <p className="text-center text-foreground/60 text-xs sm:text-sm italic mb-3 sm:mb-4">{flavorText}</p>

        {/* Description */}
        <div className="glassmorphism p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
          <p id="ending-description" className="text-foreground/90 leading-relaxed text-center text-sm sm:text-base">
            {ending.description}
          </p>
        </div>

        {/* Final Stats */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-medium text-foreground/60 mb-2 sm:mb-3 text-center">
            最终状态
          </h3>
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {VALID_STAT_KEYS.map((statKey) => (
              <div key={statKey} className="text-center">
                <div
                  className={`
                    text-base sm:text-lg font-bold
                    ${
                      stats[statKey] <= 20
                        ? "text-barca-secondary"
                        : stats[statKey] >= 70
                        ? "text-barca-accent"
                        : "text-foreground"
                    }
                  `}
                >
                  {stats[statKey]}
                </div>
                <div className="text-xs text-foreground/50">{STAT_NAMES[statKey]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Points */}
        {summaries.length > 0 && (
          <div className="mb-4 sm:mb-6 space-y-1">
            {summaries.map((summary, index) => (
              <p key={index} className="text-xs text-foreground/60 text-center">
                • {summary}
              </p>
            ))}
          </div>
        )}

        {/* Game Review Toggle */}
        {sceneHistory.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full text-xs text-foreground/60 hover:text-foreground transition-colors underline"
            >
              {showHistory ? "隐藏本局回顾" : "查看本局回顾"}
            </button>
            {showHistory && (
              <div className="mt-3 max-h-48 overflow-y-auto space-y-2 glassmorphism p-3 rounded-lg">
                {sceneHistory.map((entry, index) => (
                  <div key={index} className="text-xs border-l-2 border-barca-primary/30 pl-2">
                    <div className="text-foreground/50 mb-1">第 {index + 1} 场</div>
                    <div className="text-foreground/80 line-clamp-1">{entry.sceneText}</div>
                    <div className="text-barca-accent mt-0.5">→ {entry.choiceText}</div>
                    {entry.effects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.effects.map((effect, ei) => (
                          <span
                            key={ei}
                            className={`text-[10px] px-1 rounded ${
                              effect.change > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {STAT_NAMES[effect.stat]} {effect.change > 0 ? `+${effect.change}` : effect.change}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-3">
          <button
            ref={restartButtonRef}
            onClick={onRestart}
            className="btn-barca w-full text-foreground font-semibold py-3"
          >
            再来一次
          </button>
          <button
            onClick={handleBackHome}
            className="w-full py-3 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground/80 font-medium transition-colors"
          >
            返回主界面
          </button>
        </div>

        {/* Score Display */}
        <div className="mt-3 sm:mt-4 text-center">
          <span className="text-xs text-foreground/40">
            综合评分：{calculateEndingScore(stats)}/100
          </span>
        </div>
      </div>
    </div>
  );
}
