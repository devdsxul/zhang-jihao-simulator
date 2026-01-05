"use client";

import { EndingRarity, EndingType } from "@/types/game";

export interface UnlockedEnding {
  id: string;
  title: string;
  description?: string;          // New: store description for detail view
  type: EndingType;
  rarity: EndingRarity;          // New: rarity tier
  unlockedAt: number;
}

const STORAGE_KEY = "zjh_unlocked_endings";

export function getUnlockedEndings(): UnlockedEnding[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    // Parse and migrate old data format
    const endings = JSON.parse(data) as UnlockedEnding[];
    return endings.map(e => ({
      ...e,
      // Migrate old 'rare' type to new structure
      type: e.type === "rare" as unknown ? "positive" : e.type,
      rarity: e.rarity || (e.type === "rare" as unknown ? "secret" : "common"),
    }));
  } catch {
    return [];
  }
}

export function saveUnlockedEnding(ending: {
  id: string;
  title: string;
  description?: string;
  type: EndingType;
  rarity: EndingRarity;
}): void {
  if (typeof window === "undefined") return;
  try {
    const endings = getUnlockedEndings();
    if (!endings.some((e) => e.id === ending.id)) {
      endings.push({
        id: ending.id,
        title: ending.title,
        description: ending.description,
        type: ending.type,
        rarity: ending.rarity,
        unlockedAt: Date.now(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(endings));
    }
  } catch {
    // ignore storage errors
  }
}

export interface EndingStats {
  total: number;
  positive: number;
  negative: number;
  // Rarity counts
  common: number;
  uncommon: number;
  rare: number;
  legendary: number;
  secret: number;
}

export function getEndingStats(): EndingStats {
  const endings = getUnlockedEndings();
  return {
    total: endings.length,
    positive: endings.filter((e) => e.type === "positive").length,
    negative: endings.filter((e) => e.type === "negative").length,
    // Rarity counts
    common: endings.filter((e) => e.rarity === "common").length,
    uncommon: endings.filter((e) => e.rarity === "uncommon").length,
    rare: endings.filter((e) => e.rarity === "rare").length,
    legendary: endings.filter((e) => e.rarity === "legendary").length,
    secret: endings.filter((e) => e.rarity === "secret").length,
  };
}

export function getEndingsByRarity(rarity: EndingRarity): UnlockedEnding[] {
  return getUnlockedEndings().filter((e) => e.rarity === rarity);
}

export function clearUnlockedEndings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
