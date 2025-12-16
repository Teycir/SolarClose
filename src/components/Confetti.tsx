'use client';

import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#FCD34D', '#FB923C', '#FBBF24', '#F59E0B', '#EAB308'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
