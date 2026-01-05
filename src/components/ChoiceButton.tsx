"use client";

import { Choice } from "@/types/game";

interface ChoiceButtonProps {
  choice: Choice;
  index: number;
  onSelect: (choice: Choice) => void;
  disabled?: boolean;
}

const CHOICE_LABELS = ["A", "B", "C", "D"];

export default function ChoiceButton({
  choice,
  index,
  onSelect,
  disabled = false,
}: ChoiceButtonProps) {
  return (
    <button
      onClick={() => onSelect(choice)}
      disabled={disabled}
      className={`
        choice-btn relative overflow-hidden group
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Choice Label */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-barca-primary/40 text-barca-accent font-bold text-sm">
          {CHOICE_LABELS[index]}
        </span>
        <span className="text-foreground/90 text-sm leading-relaxed pt-1">
          {choice.text}
        </span>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-barca-accent/0 via-barca-accent/5 to-barca-accent/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
    </button>
  );
}
