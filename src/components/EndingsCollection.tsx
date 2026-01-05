"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUnlockedEndings,
  getEndingStats,
  UnlockedEnding,
  EndingStats,
} from "@/lib/endingStorage";
import { EndingRarity, RARITY_NAMES, RARITY_ICONS, EndingType } from "@/types/game";
import { TOTAL_ENDINGS } from "@/lib/dataStats";
import RarityBadge from "./RarityBadge";

interface EndingsCollectionProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterRarity = EndingRarity | "all";
type FilterType = EndingType | "all";

const RARITY_ORDER: EndingRarity[] = ["secret", "legendary", "rare", "uncommon", "common"];

export default function EndingsCollection({ isOpen, onClose }: EndingsCollectionProps) {
  const [endings, setEndings] = useState<UnlockedEnding[]>([]);
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
  const [filterRarity, setFilterRarity] = useState<FilterRarity>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedEnding, setSelectedEnding] = useState<UnlockedEnding | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEndings(getUnlockedEndings());
      setStats(getEndingStats());
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedEnding) {
          setSelectedEnding(null);
        } else {
          onClose();
        }
      }
    },
    [onClose, selectedEnding]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const filteredEndings = endings.filter((ending) => {
    if (filterRarity !== "all" && ending.rarity !== filterRarity) return false;
    if (filterType !== "all" && ending.type !== filterType) return false;
    return true;
  });

  // Sort by rarity (secret first, then legendary, etc.)
  const sortedEndings = [...filteredEndings].sort((a, b) => {
    return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
  });

  const progressPercent = Math.round((stats.total / TOTAL_ENDINGS) * 100);

  const typeEmoji = (type: EndingType) => (type === "positive" ? "🌟" : "💀");

  return (
    <div
      className="fixed inset-0 z-50 apple-modal-backdrop animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-title"
    >
      <div
        ref={modalRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl max-h-[90vh] apple-modal overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="collection-title"
              className="text-2xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              🏆 结局收集
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-tertiary)] transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              aria-label="关闭"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>收集进度</span>
              <span style={{ color: "var(--color-text-primary)" }} className="font-semibold">
                {stats.total} / {TOTAL_ENDINGS} ({progressPercent}%)
              </span>
            </div>
            <div className="apple-progress">
              <div
                className="apple-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Rarity Stats */}
          <div className="flex flex-wrap gap-2 mb-4">
            {RARITY_ORDER.slice().reverse().map((rarity) => (
              <button
                key={rarity}
                onClick={() => setFilterRarity(filterRarity === rarity ? "all" : rarity)}
                className={`rarity-badge rarity-${rarity} cursor-pointer transition-all ${
                  filterRarity === rarity ? "ring-2 ring-offset-2" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span>{RARITY_ICONS[rarity]}</span>
                <span>{RARITY_NAMES[rarity]}</span>
                <span className="ml-1 opacity-70">{stats[rarity]}</span>
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterType === "all"
                  ? "bg-[var(--barca-primary)] text-white"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType("positive")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterType === "positive"
                  ? "bg-[var(--success)] text-white"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              🌟 正面 {stats.positive}
            </button>
            <button
              onClick={() => setFilterType("negative")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterType === "negative"
                  ? "bg-[var(--danger)] text-white"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              💀 悲剧 {stats.negative}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 280px)" }}>
          {sortedEndings.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--color-text-secondary)" }}>
              <div className="text-4xl mb-4">🔍</div>
              <p>暂无符合条件的结局</p>
              {filterRarity !== "all" || filterType !== "all" ? (
                <button
                  onClick={() => {
                    setFilterRarity("all");
                    setFilterType("all");
                  }}
                  className="mt-4 text-[var(--barca-primary)] underline"
                >
                  清除筛选
                </button>
              ) : (
                <p className="mt-2 text-sm">开始游戏解锁更多结局吧！</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEndings.map((ending) => (
                <button
                  key={ending.id}
                  onClick={() => setSelectedEnding(ending)}
                  className={`apple-card p-4 text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    ending.rarity === "legendary" ? "animate-glow" : ""
                  } ${ending.rarity === "secret" ? "border-[var(--rarity-secret)]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-lg">{typeEmoji(ending.type)}</span>
                    <RarityBadge rarity={ending.rarity} size="sm" />
                  </div>
                  <h3
                    className="font-semibold mb-1 line-clamp-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {ending.title}
                  </h3>
                  <p
                    className="text-xs line-clamp-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {ending.description || "点击查看详情"}
                  </p>
                  <div className="mt-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {new Date(ending.unlockedAt).toLocaleDateString("zh-CN")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEnding && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEnding(null);
          }}
        >
          <div className="apple-modal max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <RarityBadge rarity={selectedEnding.rarity} size="lg" />
              <button
                onClick={() => setSelectedEnding(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-tertiary)] transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-4">
              <span className="text-4xl">
                {selectedEnding.type === "positive" ? "🌟" : "💀"}
              </span>
            </div>

            <h3
              className="text-xl font-bold text-center mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              {selectedEnding.title}
            </h3>

            <div
              className="p-4 rounded-xl mb-4"
              style={{ background: "var(--color-bg-tertiary)" }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-primary)" }}
              >
                {selectedEnding.description || "这个结局的详细描述尚未记录。"}
              </p>
            </div>

            <div className="text-center">
              <span
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                解锁于 {new Date(selectedEnding.unlockedAt).toLocaleString("zh-CN")}
              </span>
            </div>

            <button
              onClick={() => setSelectedEnding(null)}
              className="apple-btn-primary w-full mt-4"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
