'use client';

import { useEffect, useCallback, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function ClickFeedback() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Only create ripple for interactive elements
    const isInteractive =
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.dataset.clickable === 'true';

    if (!isInteractive) return;

    const newRipple: Ripple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-barca-primary/20 animate-ripple-expand" />
          <div
            className="absolute inset-0 rounded-full border-2 border-barca-primary/30 animate-ripple-expand"
            style={{ animationDelay: '0.1s' }}
          />
        </div>
      ))}
    </div>
  );
}
