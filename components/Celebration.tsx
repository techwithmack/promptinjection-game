"use client";

import { useEffect, useMemo } from "react";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#ec4899",
  "#a855f7",
  "#f97316",
];

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 1.8,
    color: COLORS[id % COLORS.length],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

interface CelebrationProps {
  active: boolean;
  onComplete?: () => void;
}

export function Celebration({ active, onComplete }: CelebrationProps) {
  const particles = useMemo(() => createParticles(72), []);

  useEffect(() => {
    if (!active || !onComplete) return;
    const timer = setTimeout(onComplete, 4500);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div
      className="celebration-overlay pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="celebration-particle absolute top-0 block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <div className="celebration-burst pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <span className="celebration-ring block h-32 w-32 rounded-full border-4 border-accent/60" />
        <span className="celebration-ring celebration-ring-delay block h-48 w-48 rounded-full border-4 border-green-400/50" />
      </div>
    </div>
  );
}
