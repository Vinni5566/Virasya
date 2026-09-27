import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface GoldenDustProps {
  color?: string;
  count?: number;
}

interface Particle {
  x: number;
  initialY: number;
  speed: number;
  size: number;
  maxOpacity: number;
  drift: number;
}

// Deterministic particles generated once
const STATIC_PARTICLES: Particle[] = Array.from({ length: 35 }).map((_, i) => ({
  x: ((i * 37) % 100),
  initialY: ((i * 61) % 100),
  speed: 0.35 + ((i % 5) * 0.15),
  size: 2 + (i % 4) * 1.5,
  maxOpacity: 0.3 + ((i % 6) * 0.1),
  drift: Math.sin(i) * 15,
}));

export const GoldenDust: React.FC<GoldenDustProps> = ({
  color = '#fcd34d',
  count = 35,
}) => {
  const frame = useCurrentFrame();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {STATIC_PARTICLES.slice(0, count).map((p, idx) => {
        // Floating upwards over time
        const yPos = (p.initialY - (frame * p.speed * 0.4)) % 110;
        const currentY = yPos < -5 ? yPos + 115 : yPos;
        
        // Horizontal sway
        const xOffset = Math.sin((frame * 0.03) + idx) * p.drift;
        
        // Twinkle opacity
        const opacity = interpolate(
          Math.sin((frame * 0.08) + idx),
          [-1, 1],
          [0.1, p.maxOpacity]
        );

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `calc(${p.x}% + ${xOffset}px)`,
              top: `${currentY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: color,
              opacity,
              boxShadow: `0 0 ${p.size * 3}px ${color}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
};
