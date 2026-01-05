"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUnlockedEndings, getEndingStats, UnlockedEnding } from "@/lib/endingStorage";
import { TOTAL_ENDINGS, SCENES_PER_GAME } from "@/lib/dataStats";

export default function Home() {
  const [showCollection, setShowCollection] = useState(false);
  const [endings, setEndings] = useState<UnlockedEnding[]>([]);
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, rare: 0 });

  useEffect(() => {
    setEndings(getUnlockedEndings());
    setStats(getEndingStats());
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Effects - Brighter with Barça colors */}
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
              <div className="text-2xl sm:text-3xl font-bold text-barca-accent drop-shadow-md">{SCENES_PER_GAME}</div>
              <div className="text-xs sm:text-sm text-foreground/70 font-medium">场景/局</div>
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
            onClick={() => setShowCollection(!showCollection)}
            className="mt-4 text-sm text-foreground/60 hover:text-foreground transition-colors underline"
          >
            {showCollection ? "隐藏结局收集" : `查看已解锁结局 (${stats.total})`}
          </button>
        )}

        {/* Collection Display */}
        {showCollection && endings.length > 0 && (
          <div className="mt-4 glassmorphism-dark p-4 rounded-xl max-h-64 overflow-y-auto">
            <div className="flex justify-center gap-4 mb-3 text-xs">
              <span className="text-green-400">🌟 正面 {stats.positive}</span>
              <span className="text-red-400">💀 悲剧 {stats.negative}</span>
              <span className="text-purple-400">✨ 隐藏 {stats.rare}</span>
            </div>
            <div className="space-y-2">
              {endings.map((ending) => (
                <div
                  key={ending.id}
                  className={`text-left p-2 rounded-lg text-sm ${
                    ending.type === "positive"
                      ? "bg-green-500/10 border border-green-500/20"
                      : ending.type === "rare"
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <span className="mr-2">
                    {ending.type === "positive" ? "🌟" : ending.type === "rare" ? "✨" : "💀"}
                  </span>
                  {ending.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Preview with Barça colors */}
        <div className="mt-6 sm:mt-8 grid grid-cols-5 gap-1.5 sm:gap-3 text-center">
          <div className="glassmorphism p-2 sm:p-3 rounded-xl border-t-2 border-barca-primary">
            <div className="text-xs sm:text-sm text-foreground/70 mb-1">学业</div>
            <div className="text-base sm:text-lg font-bold text-barca-primary">20</div>
          </div>
          <div className="glassmorphism p-2 sm:p-3 rounded-xl border-t-2 border-green-500">
            <div className="text-xs sm:text-sm text-foreground/70 mb-1">安全</div>
            <div className="text-base sm:text-lg font-bold text-green-400">40</div>
          </div>
          <div className="glassmorphism p-2 sm:p-3 rounded-xl border-t-2 border-barca-accent">
            <div className="text-xs sm:text-sm text-foreground/70 mb-1">财富</div>
            <div className="text-base sm:text-lg font-bold text-barca-accent">30</div>
          </div>
          <div className="glassmorphism p-2 sm:p-3 rounded-xl border-t-2 border-purple-500">
            <div className="text-xs sm:text-sm text-foreground/70 mb-1">台球</div>
            <div className="text-base sm:text-lg font-bold text-purple-400">50</div>
          </div>
          <div className="glassmorphism p-2 sm:p-3 rounded-xl border-t-2 border-barca-secondary">
            <div className="text-xs sm:text-sm text-foreground/70 mb-1">精神</div>
            <div className="text-base sm:text-lg font-bold text-barca-secondary">60</div>
          </div>
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
  );
}
