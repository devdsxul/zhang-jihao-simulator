'use client';

import { useEffect, useState, useRef } from 'react';

interface DynamicBackgroundProps {
  className?: string;
}

export default function DynamicBackground({ className = '' }: DynamicBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Base gradient - Apple-style light theme with Barcelona accent */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
        style={{
          transform: `translateY(${parallaxOffset * 0.1}px)`,
        }}
      />

      {/* Floating orb 1 - Barcelona blue */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(0,82,147,0.4) 0%, transparent 70%)',
          left: `${20 + mousePosition.x * 10}%`,
          top: `${10 + mousePosition.y * 10}%`,
          transform: `translateY(${parallaxOffset * 0.2}px)`,
          transition: 'left 0.3s ease-out, top 0.3s ease-out',
        }}
      />

      {/* Floating orb 2 - Barcelona red/garnet */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(165,0,68,0.3) 0%, transparent 70%)',
          right: `${15 + (1 - mousePosition.x) * 8}%`,
          bottom: `${20 + (1 - mousePosition.y) * 8}%`,
          transform: `translateY(${-parallaxOffset * 0.15}px)`,
          transition: 'right 0.3s ease-out, bottom 0.3s ease-out',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translateY(${parallaxOffset * 0.05}px)`,
        }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-multiply"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
