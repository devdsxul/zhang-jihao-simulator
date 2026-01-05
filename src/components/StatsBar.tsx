"use client";

import { useState, useEffect } from "react";
import { GameStats, STAT_NAMES, STAT_COLORS, VALID_STAT_KEYS, StatEffect } from "@/types/game";
import { calculateEndingScore } from "@/lib/endingCalculator";

interface StatsBarProps {
  stats: GameStats;
  recentChanges?: StatEffect[];
}

export default function StatsBar({ stats, recentChanges = [] }: StatsBarProps) {
  const overallScore = calculateEndingScore(stats);
  const [displayedChanges, setDisplayedChanges] = useState<StatEffect[]>([]);

  useEffect(() => {
    if (recentChanges.length > 0) {
      setDisplayedChanges(recentChanges);
      const timer = setTimeout(() => setDisplayedChanges([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentChanges]);

  const getChangeForStat = (statKey: keyof GameStats): number | null => {
    const change = displayedChanges.find((c) => c.stat === statKey);
    return change ? change.change : null;
  };

  return (
    <div className="glassmorphism p-4 rounded-xl space-y-3 relative overflow-hidden">
      {/* Subtle Barça stripes background */}
      <div className="absolute inset-0 barca-stripes-subtle opacity-20" />

      <div className="relative z-10">
        <h3 className="text-sm font-medium text-foreground/80 mb-3 flex items-center gap-2">
          <span className="text-barca-accent">📊</span> 状态面板
        </h3>

        {VALID_STAT_KEYS.map((statKey) => {
          const value = stats[statKey];
          const color = STAT_COLORS[statKey];
          const name = STAT_NAMES[statKey];
          const change = getChangeForStat(statKey);

          let statusClass = "";
          if (value <= 20) {
            statusClass = "animate-pulse";
          }

          return (
            <div key={statKey} className={`space-y-1.5 ${statusClass}`}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/80 font-medium">{name}</span>
                <div className="flex items-center gap-2">
                  {change !== null && (
                    <span
                      className={`text-xs font-bold animate-fade-in px-1.5 py-0.5 rounded ${
                        change > 0 ? "text-green-400 bg-green-400/20" : "text-red-400 bg-red-400/20"
                      }`}
                    >
                      {change > 0 ? `+${change}` : change}
                    </span>
                  )}
                  <span
                    className="font-mono font-bold text-sm transition-all duration-300"
                    style={{ color: value <= 20 ? "#A50044" : color }}
                  >
                    {value}
                  </span>
                </div>
              </div>
              <div className="stat-bar h-3 rounded-full bg-barca-dark/40 border border-white/10">
                <div
                  className="stat-bar-fill transition-all duration-500 rounded-full"
                  style={{
                    width: `${value}%`,
                    background:
                      value <= 20
                        ? "linear-gradient(90deg, #A50044, #FF4757)"
                        : value <= 40
                        ? "linear-gradient(90deg, #EDBB00, #FFA502)"
                        : `linear-gradient(90deg, ${color}, ${color}CC)`,
                    boxShadow: value > 20 ? `0 0 8px ${color}60` : "0 0 8px rgba(165, 0, 68, 0.5)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Average Score */}
        <div className="pt-3 mt-3 border-t border-barca-primary/30">
          <div className="flex justify-between items-center">
            <span className="text-xs text-foreground/70">综合评分</span>
            <span className="text-xl font-bold text-gradient drop-shadow-md">
              {overallScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
