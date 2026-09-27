import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface LightBeamSweepProps {
  glowColor?: string;
  accentColor?: string;
}

export const LightBeamSweep: React.FC<LightBeamSweepProps> = ({
  glowColor = 'rgba(251, 191, 36, 0.4)',
  accentColor = 'rgba(255, 255, 255, 0.6)',
}) => {
  const frame = useCurrentFrame();

  // Repeating diagonal light sweep across frames (e.g. sweeps every 110 frames / scene change)
  const sweepCycle = frame % 115;
  const sweepX = interpolate(sweepCycle, [0, 45], [-120, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sweepOpacity = interpolate(
    sweepCycle,
    [0, 15, 30, 45],
    [0, 0.85, 0.85, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Secondary soft rotating ambient light cone
  const coneRotation = (frame * 0.4) % 360;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Sweeping Linear Lens Glint */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          bottom: '-30%',
          width: '180px',
          left: `${sweepX}%`,
          transform: 'rotate(-25deg)',
          background: `linear-gradient(90deg, transparent 0%, ${glowColor} 40%, ${accentColor} 50%, ${glowColor} 60%, transparent 100%)`,
          opacity: sweepOpacity,
          filter: 'blur(12px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Rotating Studio Spotlight Halo */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          width: '500px',
          height: '500px',
          transform: `translate(-50%, -50%) rotate(${coneRotation}deg)`,
          background: `conic-gradient(from 0deg, transparent 0deg, ${glowColor} 60deg, transparent 120deg, ${glowColor} 240deg, transparent 300deg)`,
          opacity: 0.22,
          filter: 'blur(35px)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};
