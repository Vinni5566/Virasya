import React from 'react';
import { useCurrentFrame } from 'remotion';

interface SoundwaveVisualizerProps {
  color?: string;
  barCount?: number;
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  color = '#f59e0b',
  barCount = 18,
}) => {
  const frame = useCurrentFrame();

  return (
    <div className="flex items-center justify-center gap-1.5 h-8 px-4">
      {Array.from({ length: barCount }).map((_, i) => {
        // Pseudo-harmonic audio frequency wave calculation
        const heightMultiplier = Math.abs(
          Math.sin(frame * 0.15 + i * 0.5) * 0.6 +
          Math.cos(frame * 0.22 - i * 0.3) * 0.4
        );
        const barHeight = Math.max(6, Math.min(28, heightMultiplier * 28));

        return (
          <div
            key={i}
            style={{
              width: '3px',
              height: `${barHeight}px`,
              backgroundColor: color,
              borderRadius: '9999px',
              opacity: 0.6 + heightMultiplier * 0.4,
              transition: 'height 0.05s ease',
            }}
          />
        );
      })}
    </div>
  );
};
