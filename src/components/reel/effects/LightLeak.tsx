import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface LightLeakProps {
  glowColor?: string;
  accentColor?: string;
}

export const LightLeak: React.FC<LightLeakProps> = ({
  glowColor = 'rgba(245, 158, 11, 0.45)',
  accentColor = '#f59e0b',
}) => {
  const frame = useCurrentFrame();

  // Slow moving top-left light flare
  const flareX = interpolate(frame, [0, 450], [-20, 40], {
    extrapolateRight: 'clamp',
  });
  const flareY = interpolate(frame, [0, 450], [-10, 25], {
    extrapolateRight: 'clamp',
  });
  const flareOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.35, 0.65]
  );

  // Bottom-right ambient reflection
  const bottomOpacity = interpolate(
    Math.cos(frame * 0.035),
    [-1, 1],
    [0.2, 0.5]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Flare */}
      <div
        style={{
          position: 'absolute',
          left: `${flareX}%`,
          top: `${flareY}%`,
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(50px)',
          opacity: flareOpacity,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Bottom Counter-Glow */}
      <div
        style={{
          position: 'absolute',
          right: '-10%',
          bottom: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}33 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(60px)',
          opacity: bottomOpacity,
        }}
      />
    </div>
  );
};
