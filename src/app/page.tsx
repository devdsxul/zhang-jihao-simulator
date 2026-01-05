"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getEndingStats, EndingStats } from "@/lib/endingStorage";
import { TOTAL_ENDINGS } from "@/lib/dataStats";
import { INITIAL_STATS, STAT_NAMES, STAT_COLORS, RARITY_ICONS, EndingRarity } from "@/types/game";
import EndingsCollection from "@/components/EndingsCollection";

const RARITY_ORDER: EndingRarity[] = ["common", "uncommon", "rare", "legendary", "secret"];

export default function Home() {
  const [showCollection, setShowCollection] = useState(false);
  const [stats, setStats] = useState<EndingStats>({
    total: 0,
    positive: 0,
    negative: 0,
    common: 0,
    uncommon: 0,
    rare: 0,
    legendary: 0,
    secret: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getEndingStats());
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const progressPercent = Math.round((stats.total / TOTAL_ENDINGS) * 100);

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Background Effects - Barça colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-barca-primary/20 via-background to-barca-secondary/20" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-barca-primary/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-barca-secondary/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-barca-accent/10 rounded-full blur-3xl" />

        {/* Barça Stripes Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 h-2 barca-stripes opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 h-2 barca-stripes opacity-80" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto w-full">
          {/* Logo/Title with FCB Badge Style */}
          <div className="mb-6 sm:mb-8 animate-float">
            <div className="w-28 h-28 sm:w-44 sm:h-44 mx-auto mb-4 sm:mb-6 relative">
              {/* Outer ring with gold accent */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-barca-accent via-barca-gold to-barca-accent p-1 animate-pulse-slow">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-barca-primary to-barca-secondary p-1">
                  <div className="w-full h-full rounded-full bg-barca-dark flex items-center justify-center relative overflow-hidden">
                    {/* Barça stripes inside badge */}
                    <div className="absolute inset-0 barca-stripes-subtle opacity-50" />
                    <span className="text-4xl sm:text-6xl relative z-10">⚽</span>
                  </div>
                </div>
              </div>
              {/* Decorative stars */}
              <div className="absolute -top-2 -right-2 text-barca-accent text-xl">✦</div>
              <div className="absolute -bottom-2 -left-2 text-barca-accent text-lg">✦</div>
            </div>
            <h1 className="text-4xl sm:text-7xl font-display font-bold text-gradient mb-2 sm:mb-4 drop-shadow-lg">
              章吉豪模拟器
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 font-medium tracking-wider">
              Zhang Jihao Simulator
            </p>
            <p className="text-sm text-barca-accent mt-2">Més que un joc ⚽</p>
          </div>

          {/* Game Info with Barça styling */}
          <div className="glassmorphism p-4 sm:p-5 mb-6 sm:mb-8 relative overflow-hidden">
            {/* Subtle stripes overlay */}
            <div className="absolute inset-0 barca-stripes-subtle opacity-30" />
            <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="p-2 rounded-lg bg-barca-primary/20">
                <div className="text-2xl sm:text-3xl font-bold text-barca-accent drop-shadow-md">∞</div>
                <div className="text-xs sm:text-sm text-foreground/70 font-medium">无限模式</div>
              </div>
              <div className="p-2 rounded-lg bg-barca-secondary/20">
                <div className="text-2xl sm:text-3xl font-bold text-barca-primary drop-shadow-md">{TOTAL_ENDINGS}</div>
                <div className="text-xs sm:text-sm text-foreground/70 font-medium">结局</div>
              </div>
              <div className="p-2 rounded-lg bg-barca-accent/20">
                <div className="text-2xl sm:text-3xl font-bold text-green-400 drop-shadow-md">{stats.total}</div>
                <div className="text-xs sm:text-sm text-foreground/70 font-medium">已解锁</div>
              </div>
            </div>
          </div>

          {/* Collection Progress */}
          {stats.total > 0 && (
            <div className="glassmorphism p-4 mb-6 sm:mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground/70">收集进度</span>
                <span className="text-foreground font-semibold">{stats.total} / {TOTAL_ENDINGS} ({progressPercent}%)</span>
              </div>
              <div className="h-3 rounded-full bg-barca-dark/50 overflow-hidden border border-barca-primary/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-barca-primary via-barca-secondary to-barca-accent transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {RARITY_ORDER.map((rarity) => (
                  <span
                    key={rarity}
                    className={`rarity-badge rarity-${rarity} text-xs`}
                  >
                    <span>{RARITY_ICONS[rarity]}</span>
                    <span>{stats[rarity]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start Button with enhanced Barça gradient */}
          <Link
            href="/game"
            className="btn-barca text-foreground text-lg sm:text-xl px-10 sm:px-14 py-4 sm:py-5 w-full inline-block text-center font-bold tracking-wide shadow-glow"
          >
            🎮 开始游戏
          </Link>

          {/* Collection Button */}
          {stats.total > 0 && (
            <button
              onClick={() => setShowCollection(true)}
              className="mt-4 text-sm text-foreground/60 hover:text-foreground transition-colors underline"
            >
              查看已解锁结局 ({stats.total})
            </button>
          )}

          {/* Stats Preview with Barça colors */}
          <div className="mt-6 sm:mt-8 grid grid-cols-5 gap-1.5 sm:gap-3 text-center">
            {(Object.keys(INITIAL_STATS) as (keyof typeof INITIAL_STATS)[]).map((statKey) => (
              <div key={statKey} className="glassmorphism p-2 sm:p-3 rounded-xl" style={{ borderTop: `2px solid ${STAT_COLORS[statKey]}` }}>
                <div className="text-xs sm:text-sm text-foreground/70 mb-1">{STAT_NAMES[statKey]}</div>
                <div className="text-base sm:text-lg font-bold" style={{ color: STAT_COLORS[statKey] }}>{INITIAL_STATS[statKey]}</div>
              </div>
            ))}
          </div>

          {/* Footer with FCB motto */}
          <p className="mt-8 sm:mt-12 text-xs text-foreground/50">
            本游戏纯属虚构，如有雷同纯属巧合
          </p>
          <p className="mt-2 text-xs text-barca-accent/60">
            🔵🔴 Força Barça! 🔴🔵
          </p>
        </div>
      </main>

      {/* Endings Collection Modal */}
      <EndingsCollection isOpen={showCollection} onClose={() => setShowCollection(false)} />
    </>
  );
}
