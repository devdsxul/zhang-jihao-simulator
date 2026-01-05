"use client";

import { AnimationType } from "@/types/game";

interface CharacterAnimationProps {
  animationType: AnimationType;
}

// Character SVG components for different activities
const CharacterSVG = ({ activity }: { activity: AnimationType }) => {
  const baseClass = "w-24 h-24 sm:w-32 sm:h-32";

  // Character elements based on activity
  const getActivityElements = () => {
    switch (activity) {
      case "studying":
        return (
          <>
            {/* Book */}
            <rect x="25" y="60" width="30" height="20" fill="#EDBB00" rx="2" />
            <line x1="40" y1="62" x2="40" y2="78" stroke="#0A1628" strokeWidth="1" />
            {/* Head looking down */}
            <circle cx="40" cy="35" r="18" fill="#FFD93D" />
            <ellipse cx="35" cy="38" rx="2" ry="1.5" fill="#0A1628" />
            <ellipse cx="45" cy="38" rx="2" ry="1.5" fill="#0A1628" />
          </>
        );
      case "football":
        return (
          <>
            {/* Football */}
            <circle cx="60" cy="55" r="10" fill="#EDBB00" stroke="#A50044" strokeWidth="2" />
            <path d="M55 50 L65 60 M55 60 L65 50" stroke="#A50044" strokeWidth="1" />
            {/* Jersey */}
            <rect x="30" y="42" width="20" height="25" fill="#A50044" rx="3" />
            <rect x="33" y="44" width="14" height="8" fill="#004D98" />
            {/* Head */}
            <circle cx="40" cy="30" r="15" fill="#FFD93D" />
            <ellipse cx="36" cy="30" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="44" cy="30" rx="2" ry="2" fill="#0A1628" />
            <path d="M38 36 Q40 38 42 36" stroke="#0A1628" strokeWidth="1" fill="none" />
          </>
        );
      case "billiards":
        return (
          <>
            {/* Cue stick */}
            <line x1="20" y1="75" x2="55" y2="40" stroke="#8B4513" strokeWidth="3" />
            {/* Ball */}
            <circle cx="60" cy="55" r="6" fill="#004D98" />
            <circle cx="70" cy="58" r="6" fill="#A50044" />
            {/* Head focused */}
            <circle cx="35" cy="35" r="15" fill="#FFD93D" />
            <ellipse cx="32" cy="35" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="40" cy="35" rx="2" ry="2" fill="#0A1628" />
            <line x1="32" y1="42" x2="40" y2="42" stroke="#0A1628" strokeWidth="1" />
          </>
        );
      case "scrolling":
        return (
          <>
            {/* Phone */}
            <rect x="35" y="35" width="12" height="22" fill="#1A2744" rx="2" stroke="#004D98" strokeWidth="1" />
            <rect x="37" y="38" width="8" height="14" fill="#EDBB00" opacity="0.3" />
            {/* Head looking at phone */}
            <circle cx="41" cy="25" r="14" fill="#FFD93D" />
            <ellipse cx="38" cy="26" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="44" cy="26" rx="2" ry="2" fill="#0A1628" />
            {/* Blue light effect */}
            <circle cx="41" cy="46" r="15" fill="#004D98" opacity="0.2" />
          </>
        );
      case "running":
        return (
          <>
            {/* Running pose */}
            <circle cx="40" cy="25" r="14" fill="#FFD93D" />
            <ellipse cx="37" cy="24" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="45" cy="24" rx="2" ry="2" fill="#0A1628" />
            {/* Body */}
            <rect x="33" y="38" width="14" height="18" fill="#004D98" rx="2" />
            {/* Legs running */}
            <line x1="35" y1="56" x2="25" y2="72" stroke="#FFD93D" strokeWidth="5" />
            <line x1="45" y1="56" x2="55" y2="72" stroke="#FFD93D" strokeWidth="5" />
            {/* Motion lines */}
            <line x1="60" y1="40" x2="70" y2="40" stroke="#E0E0E0" strokeWidth="1" opacity="0.5" />
            <line x1="62" y1="45" x2="72" y2="45" stroke="#E0E0E0" strokeWidth="1" opacity="0.5" />
          </>
        );
      case "eating":
        return (
          <>
            {/* Bowl */}
            <ellipse cx="40" cy="58" rx="15" ry="8" fill="#EDBB00" />
            <ellipse cx="40" cy="55" rx="12" ry="6" fill="#A50044" opacity="0.6" />
            {/* Chopsticks */}
            <line x1="35" y1="45" x2="42" y2="55" stroke="#8B4513" strokeWidth="2" />
            <line x1="45" y1="45" x2="48" y2="55" stroke="#8B4513" strokeWidth="2" />
            {/* Happy face */}
            <circle cx="40" cy="30" r="14" fill="#FFD93D" />
            <ellipse cx="36" cy="28" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="44" cy="28" rx="2" ry="2" fill="#0A1628" />
            <path d="M34 34 Q40 40 46 34" stroke="#0A1628" strokeWidth="2" fill="none" />
          </>
        );
      case "talking":
        return (
          <>
            {/* Speech bubble */}
            <ellipse cx="60" cy="25" rx="12" ry="10" fill="#E0E0E0" />
            <polygon points="50,30 55,35 52,28" fill="#E0E0E0" />
            <text x="55" y="28" fontSize="8" fill="#0A1628">...</text>
            {/* Head */}
            <circle cx="35" cy="35" r="16" fill="#FFD93D" />
            <ellipse cx="31" cy="33" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="39" cy="33" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="35" cy="42" rx="5" ry="3" fill="#A50044" opacity="0.8" />
          </>
        );
      case "stressed":
        return (
          <>
            {/* Stress marks */}
            <text x="55" y="20" fontSize="16" fill="#A50044">!</text>
            <text x="20" y="25" fontSize="12" fill="#EDBB00">?</text>
            {/* Worried face */}
            <circle cx="40" cy="40" r="18" fill="#FFD93D" />
            <ellipse cx="35" cy="38" rx="3" ry="3" fill="#0A1628" />
            <ellipse cx="45" cy="38" rx="3" ry="3" fill="#0A1628" />
            <path d="M34 50 Q40 46 46 50" stroke="#0A1628" strokeWidth="2" fill="none" />
            {/* Sweat drop */}
            <ellipse cx="55" cy="35" rx="3" ry="5" fill="#004D98" opacity="0.6" />
          </>
        );
      case "celebrating":
        return (
          <>
            {/* Confetti */}
            <circle cx="20" cy="20" r="3" fill="#EDBB00" />
            <circle cx="60" cy="15" r="3" fill="#A50044" />
            <circle cx="15" cy="40" r="2" fill="#004D98" />
            <circle cx="65" cy="35" r="2" fill="#EDBB00" />
            {/* Arms up */}
            <line x1="30" y1="45" x2="15" y2="25" stroke="#FFD93D" strokeWidth="5" />
            <line x1="50" y1="45" x2="65" y2="25" stroke="#FFD93D" strokeWidth="5" />
            {/* Happy face */}
            <circle cx="40" cy="35" r="16" fill="#FFD93D" />
            <ellipse cx="35" cy="32" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="45" cy="32" rx="2" ry="2" fill="#0A1628" />
            <path d="M32 40 Q40 50 48 40" stroke="#0A1628" strokeWidth="2" fill="none" />
          </>
        );
      case "arrested":
        return (
          <>
            {/* Handcuffs */}
            <circle cx="30" cy="55" r="5" fill="none" stroke="#888" strokeWidth="2" />
            <circle cx="50" cy="55" r="5" fill="none" stroke="#888" strokeWidth="2" />
            <line x1="35" y1="55" x2="45" y2="55" stroke="#888" strokeWidth="2" />
            {/* Police light effect */}
            <circle cx="40" cy="15" r="8" fill="#A50044" opacity="0.5" />
            <circle cx="40" cy="15" r="5" fill="#004D98" opacity="0.5" />
            {/* Sad face */}
            <circle cx="40" cy="35" r="15" fill="#FFD93D" />
            <ellipse cx="36" cy="33" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="44" cy="33" rx="2" ry="2" fill="#0A1628" />
            <path d="M35 42 Q40 38 45 42" stroke="#0A1628" strokeWidth="2" fill="none" />
          </>
        );
      default:
        return (
          <>
            <circle cx="40" cy="35" r="15" fill="#FFD93D" />
            <ellipse cx="36" cy="33" rx="2" ry="2" fill="#0A1628" />
            <ellipse cx="44" cy="33" rx="2" ry="2" fill="#0A1628" />
          </>
        );
    }
  };

  return (
    <svg viewBox="0 0 80 80" className={baseClass}>
      {getActivityElements()}
    </svg>
  );
};

export default function CharacterAnimation({ animationType }: CharacterAnimationProps) {
  // Map animation type to CSS animation class
  const animationClasses: Record<AnimationType, string> = {
    studying: "animate-studying",
    football: "animate-football",
    billiards: "animate-billiards",
    scrolling: "animate-scrolling",
    running: "animate-running",
    eating: "animate-eating",
    talking: "animate-talking",
    stressed: "animate-stressed",
    celebrating: "animate-celebrating",
    arrested: "animate-arrested",
  };

  return (
    <div
      className={`
        relative p-6 rounded-full
        bg-gradient-to-br from-barca-light/50 to-barca-dark/50
        border border-barca-primary/30
        ${animationClasses[animationType]}
      `}
    >
      <CharacterSVG activity={animationType} />

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-barca-primary/10 blur-xl -z-10" />
    </div>
  );
}
