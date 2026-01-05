"use client";

import { Scene, CATEGORY_NAMES } from "@/types/game";
import CharacterAnimation from "./CharacterAnimation";

interface SceneCardProps {
  scene: Scene;
  sceneNumber: number;
  totalScenes: number;
}

export default function SceneCard({ scene, sceneNumber, totalScenes }: SceneCardProps) {
  return (
    <div className="scene-card animate-fade-in relative overflow-hidden">
      {/* Barça stripes subtle overlay */}
      <div className="absolute inset-0 barca-stripes-subtle opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-barca-primary/40 to-barca-secondary/40 text-barca-accent border border-barca-accent/30">
          {CATEGORY_NAMES[scene.category]}
        </span>
        <span className="text-sm text-foreground/70 font-medium flex items-center gap-1">
          <span className="text-barca-accent">⚽</span>
          场景 {sceneNumber}/{totalScenes}
        </span>
      </div>

      {/* Character Animation */}
      <div className="relative z-10 flex justify-center my-6">
        <CharacterAnimation animationType={scene.animation} />
      </div>

      {/* Scene Text */}
      <div className="relative z-10 mt-4">
        <p className="text-lg leading-relaxed text-foreground/95 font-medium">{scene.text}</p>
      </div>

      {/* Decorative Elements - Enhanced */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-barca-primary/15 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-barca-secondary/15 to-transparent rounded-tr-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-1 h-16 bg-gradient-to-b from-barca-primary via-barca-secondary to-barca-primary opacity-50 pointer-events-none rounded-l" />
    </div>
  );
}
