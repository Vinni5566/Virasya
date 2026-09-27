import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface MandalaMotifProps {
  color?: string;
  glowColor?: string;
}

export const MandalaMotif: React.FC<MandalaMotifProps> = ({
  color = 'rgba(217, 119, 6, 0.18)',
  glowColor = 'rgba(245, 158, 11, 0.3)',
}) => {
  const frame = useCurrentFrame();

  // Slow hypnotic clockwise & counter-clockwise sacred geometry rotation
  const rotationOuter = (frame * 0.25) % 360;
  const rotationInner = (-frame * 0.4) % 360;
  const rotationCore = (frame * 0.6) % 360;

  // Breathing scale pulse
  const scalePulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.92, 1.08]
  );

  const opacityPulse = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.55, 0.95]
  );

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ opacity: opacityPulse }}
    >
      {/* Outer Mandala Ring */}
      <svg
        className="absolute w-[600px] h-[600px] max-w-none"
        viewBox="0 0 200 200"
        style={{
          transform: `rotate(${rotationOuter}deg) scale(${scalePulse})`,
          filter: `drop-shadow(0 0 20px ${glowColor})`,
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
        {/* 12 Petal Geometries */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <g key={i} transform={`rotate(${angle} 100 100)`}>
              <path
                d="M100 20 C110 50, 110 70, 100 85 C90 70, 90 50, 100 20 Z"
                fill="none"
                stroke={color}
                strokeWidth="0.75"
              />
              <circle cx="100" cy="20" r="2.5" fill={color} />
            </g>
          );
        })}
      </svg>

      {/* Inner Intricate Mandala Ring */}
      <svg
        className="absolute w-[420px] h-[420px] max-w-none"
        viewBox="0 0 200 200"
        style={{
          transform: `rotate(${rotationInner}deg) scale(${scalePulse * 0.95})`,
          filter: `drop-shadow(0 0 15px ${glowColor})`,
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="64"
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
        {/* 8 Star Points */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <g key={i} transform={`rotate(${angle} 100 100)`}>
              <polygon
                points="100,40 108,65 130,68 112,82 118,105 100,92 82,105 88,82 70,68 92,65"
                fill="none"
                stroke={color}
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </svg>

      {/* Core Sacred Blossom */}
      <svg
        className="absolute w-[240px] h-[240px] max-w-none"
        viewBox="0 0 100 100"
        style={{
          transform: `rotate(${rotationCore}deg)`,
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke={color}
          strokeWidth="0.6"
          strokeDasharray="2 2"
        />
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 360) / 6;
          return (
            <g key={i} transform={`rotate(${angle} 50 50)`}>
              <circle
                cx="50"
                cy="32"
                r="8"
                fill="none"
                stroke={color}
                strokeWidth="0.6"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
