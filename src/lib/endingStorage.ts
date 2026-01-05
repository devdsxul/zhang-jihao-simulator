"use client";

export interface UnlockedEnding {
  id: string;
  title: string;
  type: "positive" | "negative" | "rare";
  unlockedAt: number;
}

const STORAGE_KEY = "zjh_unlocked_endings";

export function getUnlockedEndings(): UnlockedEnding[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveUnlockedEnding(ending: { id: string; title: string; type: string }): void {
  if (typeof window === "undefined") return;
  try {
    const endings = getUnlockedEndings();
    if (!endings.some((e) => e.id === ending.id)) {
      endings.push({
        id: ending.id,
        title: ending.title,
        type: ending.type as "positive" | "negative" | "rare",
        unlockedAt: Date.now(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(endings));
    }
  } catch {
    // ignore storage errors
  }
}

export function getEndingStats(): { total: number; positive: number; negative: number; rare: number } {
  const endings = getUnlockedEndings();
  return {
    total: endings.length,
    positive: endings.filter((e) => e.type === "positive").length,
    negative: endings.filter((e) => e.type === "negative").length,
    rare: endings.filter((e) => e.type === "rare").length,
  };
}

export function clearUnlockedEndings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
