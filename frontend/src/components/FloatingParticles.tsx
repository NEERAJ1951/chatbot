import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

const FloatingParticles: React.FC = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.1,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * -20,
      driftX: -30 + Math.random() * 60,
      driftY: -30 + Math.random() * 60,
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes particleDrift {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(var(--drift-x), var(--drift-y));
          }
          50% {
            transform: translate(calc(var(--drift-x) * -0.5), calc(var(--drift-y) * 1.2));
          }
          75% {
            transform: translate(calc(var(--drift-x) * 0.7), calc(var(--drift-y) * -0.8));
          }
        }

        .particle-drift {
          animation: particleDrift var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        @media (prefers-reduced-motion: reduce) {
          .particle-drift {
            animation: none;
          }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full particle-drift"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#60A5FA',
              opacity: p.opacity,
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
};

export { FloatingParticles };
export default FloatingParticles;
