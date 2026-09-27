import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface ArchivalMetadataProps {
  label: string;
  sublabel?: string;
  delayFrames?: number;
  accentColor?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const ArchivalMetadata: React.FC<ArchivalMetadataProps> = ({
  label,
  sublabel,
  delayFrames = 0,
  accentColor = '#F59E0B',
  align = 'left',
  className = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 140 },
  });

  const alignmentClass =
    align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div
      className={`flex flex-col gap-2 ${alignmentClass} ${className}`}
      style={{
        transform: `translate3d(0, ${(1 - entrance) * -16}px, 0)`,
        opacity: entrance,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-[3px] w-8 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="text-lg sm:text-xl font-mono uppercase tracking-[0.25em] font-extrabold drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          style={{ color: accentColor }}
        >
          {label}
        </span>
      </div>

      {sublabel && (
        <span className="text-xl sm:text-2xl font-sans font-bold text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] pl-11">
          {sublabel}
        </span>
      )}
    </div>
  );
};
