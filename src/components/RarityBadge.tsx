"use client";

import { EndingRarity, RARITY_NAMES, RARITY_ICONS } from "@/types/game";

interface RarityBadgeProps {
  rarity: EndingRarity;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
}

export default function RarityBadge({
  rarity,
  size = "md",
  showIcon = true,
  showLabel = true,
}: RarityBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span className={`rarity-badge rarity-${rarity} ${sizeClasses[size]}`}>
      {showIcon && <span>{RARITY_ICONS[rarity]}</span>}
      {showLabel && <span>{RARITY_NAMES[rarity]}</span>}
    </span>
  );
}
