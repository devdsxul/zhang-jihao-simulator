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
      <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--color-bg-primary)" }}>
        {/* Apple-style Header */}
        <header className="apple-header fixed top-0 left-0 right-0 z-40 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--barca-primary)] to-[var(--barca-secondary)] flex items-center justify-center text-xl">
                ⚽
              </div>
              <span className="font-semibold text-lg" style={{ color: "var(--color-text-primary)" }}>
                章吉豪模拟器
              </span>
            </div>
            {stats.total > 0 && (
              <button
                onClick={() => setShowCollection(true)}
                className="apple-btn-ghost flex items-center gap-2"
              >
                <span>🏆</span>
                <span className="hidden sm:inline">结局收集</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "var(--barca-primary)", color: "white" }}>
                  {stats.total}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
          {/* Barcelona Accent Lines */}
          <div className="absolute top-0 left-0 right-0 h-1 barca-stripes opacity-80" />

          {/* Logo Badge */}
          <div className="mb-8 animate-float">
            <div className="w-32 h-32 sm:w-44 sm:h-44 mx-auto relative">
              {/* Outer gold ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--barca-accent)] via-[var(--barca-gold)] to-[var(--barca-accent)] p-1 animate-pulse-slow">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--barca-primary)] to-[var(--barca-secondary)] p-1">
                  <div className="w-full h-full rounded-full bg-[var(--barca-dark)] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 barca-stripes-subtle opacity-50" />
                    <span className="text-5xl sm:text-7xl relative z-10">⚽</span>
                  </div>
                </div>
              </div>
              {/* Decorative stars */}
              <div className="absolute -top-2 -right-2 text-[var(--barca-accent)] text-xl animate-pulse-slow">✦</div>
              <div className="absolute -bottom-2 -left-2 text-[var(--barca-accent)] text-lg animate-pulse-slow">✦</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-center mb-4 bg-gradient-to-r from-[var(--barca-primary)] via-[var(--barca-secondary)] to-[var(--barca-primary)] bg-clip-text text-transparent">
            章吉豪模拟器
          </h1>
          <p className="text-lg sm:text-xl mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Zhang Jihao Simulator
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--barca-accent)" }}>
            Més que un joc ⚽
          </p>

          {/* Game Info Cards */}
          <div className="grid grid-cols-3 gap-4 max-w-md w-full mb-8">
            <div className="apple-card p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--barca-accent)" }}>
                ∞
              </div>
              <div className="text-xs sm:text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                无限模式
              </div>
            </div>
            <div className="apple-card p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--barca-primary)" }}>
                {TOTAL_ENDINGS}
              </div>
              <div className="text-xs sm:text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                结局
              </div>
            </div>
            <div className="apple-card p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--success)" }}>
                {stats.total}
              </div>
              <div className="text-xs sm:text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                已解锁
              </div>
            </div>
          </div>

          {/* Collection Progress */}
          {stats.total > 0 && (
            <div className="w-full max-w-md mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "var(--color-text-secondary)" }}>收集进度</span>
                <span style={{ color: "var(--color-text-primary)" }} className="font-medium">
                  {progressPercent}%
                </span>
              </div>
              <div className="apple-progress">
                <div className="apple-progress-fill" style={{ width: `${progressPercent}%` }} />
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

          {/* Start Button */}
          <Link href="/game" className="apple-btn-primary text-lg px-12 py-4 mb-6">
            🎮 开始游戏
          </Link>

          {/* View Collection Button (if no endings yet, show as text) */}
          {stats.total === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              开始游戏解锁你的第一个结局！
            </p>
          ) : (
            <button
              onClick={() => setShowCollection(true)}
              className="apple-btn-secondary text-sm"
            >
              查看结局收集
            </button>
          )}
        </section>

        {/* Initial Stats Preview */}
        <section className="px-6 pb-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-center text-sm font-medium mb-4" style={{ color: "var(--color-text-secondary)" }}>
              初始属性
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(INITIAL_STATS) as (keyof typeof INITIAL_STATS)[]).map((statKey) => (
                <div key={statKey} className="apple-card p-3 text-center" style={{ borderTop: `3px solid ${STAT_COLORS[statKey]}` }}>
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                    {STAT_NAMES[statKey]}
                  </div>
                  <div className="text-lg font-bold" style={{ color: STAT_COLORS[statKey] }}>
                    {INITIAL_STATS[statKey]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center border-t" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
            本游戏纯属虚构，如有雷同纯属巧合
          </p>
          <p className="text-xs" style={{ color: "var(--barca-accent)" }}>
            🔵🔴 Força Barça! 🔴🔵
          </p>
        </footer>

        {/* Barcelona Accent Bottom Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 barca-stripes opacity-80" />
      </main>

      {/* Endings Collection Modal */}
      <EndingsCollection isOpen={showCollection} onClose={() => setShowCollection(false)} />
    </>
  );
}
