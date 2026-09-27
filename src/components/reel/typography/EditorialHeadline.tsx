import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface EditorialHeadlineProps {
  title: string;
  delayFrames?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const EditorialHeadline: React.FC<EditorialHeadlineProps> = ({
  title,
  delayFrames = 0,
  color = '#FFFFFF',
  align = 'left',
  className = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 120 },
  });

  // Calculate dynamic font size based on title length for 1080x1920 canvas
  const length = title.length;
  let fontSizePx = 104;
  if (length > 55) {
    fontSizePx = 64;
  } else if (length > 28) {
    fontSizePx = 82;
  }

  const alignmentClass =
    align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';

  return (
    <div
      className={`flex flex-col ${alignmentClass} ${className}`}
      style={{
        transform: `translate3d(0, ${(1 - entrance) * 24}px, 0)`,
        opacity: entrance,
      }}
    >
      <h1
        className="font-serif tracking-tight font-black leading-[1.05] max-w-full drop-shadow-[0_12px_40px_rgba(0,0,0,0.98)] text-white"
        style={{
          color,
          fontSize: `${fontSizePx}px`,
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.95)',
        }}
      >
        {title}
      </h1>
    </div>
  );
};
