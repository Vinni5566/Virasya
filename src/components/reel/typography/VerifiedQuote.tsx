import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface VerifiedQuoteProps {
  quote: string;
  speaker?: string;
  delayFrames?: number;
  textColor?: string;
  accentColor?: string;
  className?: string;
}

export const VerifiedQuote: React.FC<VerifiedQuoteProps> = ({
  quote,
  speaker,
  delayFrames = 0,
  textColor = '#FFFFFF',
  accentColor = '#F59E0B',
  className = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 110 },
  });

  return (
    <div
      className={`flex flex-col gap-4 max-w-2xl ${className}`}
      style={{
        transform: `translate3d(0, ${(1 - entrance) * 20}px, 0)`,
        opacity: entrance,
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="font-serif text-6xl leading-none select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
          style={{ color: accentColor }}
        >
          “
        </span>
        <p
          className="font-serif text-2xl sm:text-3xl font-semibold leading-snug text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.95)]"
          style={{ color: textColor }}
        >
          {quote}
        </p>
      </div>

      {speaker && (
        <div className="flex items-center gap-3 pl-10 pt-1">
          <div className="w-8 h-[2px] bg-amber-400" />
          <span className="text-lg sm:text-xl font-sans font-bold tracking-wider text-amber-200 uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            {speaker}
          </span>
        </div>
      )}
    </div>
  );
};
