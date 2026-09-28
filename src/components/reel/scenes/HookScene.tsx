import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ReelTheme } from '../types';
import { getReelI18n } from '../i18nReel';

interface HookSceneProps {
  productName: string;
  craftType: string;
  region: string;
  hookTitle: string;
  hookSubtext: string;
  theme: ReelTheme;
  language?: string;
}

export const HookScene: React.FC<HookSceneProps> = ({
  productName,
  craftType,
  region,
  hookTitle,
  hookSubtext,
  theme,
  language,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i18n = getReelI18n(language);

  // Bouncy Canva Entrance Springs
  // 1. Top Category & Region Pill
  const topBadgeSpring = spring({
    frame,
    fps,
    config: { damping: 9, mass: 0.55, stiffness: 160 },
  });

  // 2. Subtext Card
  const subtextSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, mass: 0.6, stiffness: 140 },
  });

  // 3. Floating Sticker Badge (Sticker Pop)
  const stickerSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 8, mass: 0.5, stiffness: 180 },
  });

  // 4. Bottom Footer Tag
  const footerSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 10, mass: 0.6 },
  });

  // Smooth fade out towards scene 2
  const sceneOpacity = interpolate(frame, [92, 112], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame > 118) return null;

  const words = hookTitle.split(' ');

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 z-30 pointer-events-none"
      style={{ opacity: sceneOpacity }}
    >
      {/* 1. TOP HEADER: Bouncy Canva Tags */}
      <div
        style={{
          transform: `translate3d(0, ${(1 - topBadgeSpring) * -60}px, 0) scale(${topBadgeSpring})`,
          opacity: topBadgeSpring,
        }}
        className="flex items-center justify-between w-full pt-1"
      >
        {/* Glowing Pill Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/60 shadow-[0_4px_15px_rgba(245,158,11,0.3)]">
          <span className="text-amber-400 text-xs animate-spin">✦</span>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
            {region} • {craftType}
          </span>
        </div>

        {/* Floating Mini Sticker */}
        <div className="px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider shadow-lg -rotate-2">
          100% HANDMADE
        </div>
      </div>

      {/* 2. CANVA HIGH-ENERGY TYPOGRAPHY & HIGHLIGHTER BOXES */}
      <div className="my-auto space-y-3 px-1">
        {/* Floating Verified Heritage Tag with Pop */}
        <div
          style={{
            transform: `translate3d(${(1 - topBadgeSpring) * -50}px, 0, 0) scale(${topBadgeSpring})`,
            opacity: topBadgeSpring,
          }}
          className="text-left"
        >
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest shadow-xl border border-amber-300/40 rotate-1"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              color: '#FDE68A',
            }}
          >
            <span>🇮🇳</span> {i18n.verifiedHeritage}
          </span>
        </div>

        {/* Dynamic Canva Pop-Out Title: Words Pop in Colored Tape Highlight Boxes */}
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight flex flex-wrap items-center gap-x-2 gap-y-2">
            {words.map((word, i) => {
              const wordPop = spring({
                frame: frame - i * 2,
                fps,
                config: { damping: 8, mass: 0.5, stiffness: 180 },
              });
              const isHighlight = i % 2 === 1;
              const rotation = (i % 3 - 1) * 2; // -2deg, 0deg, 2deg

              return (
                <span
                  key={i}
                  style={{
                    transform: `translate3d(0, ${(1 - wordPop) * 35}px, 0) scale(${wordPop}) rotate(${rotation}deg)`,
                    opacity: wordPop,
                    display: 'inline-block',
                  }}
                  className={
                    isHighlight
                      ? 'px-3 py-1 bg-amber-400 text-black font-black rounded-lg shadow-xl border-2 border-amber-300 drop-shadow-md'
                      : 'px-2.5 py-1 bg-black/80 text-white font-black rounded-lg shadow-lg border border-white/20 backdrop-blur-sm'
                  }
                >
                  {word}
                </span>
              );
            })}
          </h1>
        </div>

        {/* Subtext Card: Floating Glass Card with Canva Aesthetic */}
        <div
          style={{
            transform: `translate3d(${(1 - subtextSpring) * 60}px, 0, 0) scale(${subtextSpring})`,
            opacity: subtextSpring,
          }}
          className="max-w-md ml-auto"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-400/40 shadow-2xl space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
              ✨ {hookSubtext}
            </p>
          </div>
        </div>

        {/* Floating Sparkle Sticker */}
        <div
          style={{
            transform: `scale(${stickerSpring}) rotate(-3deg)`,
            opacity: stickerSpring,
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[11px] font-black uppercase tracking-wider shadow-xl"
        >
          <span>🔥</span> Rare Generational Craft
        </div>
      </div>

      {/* 3. BOTTOM FOOTER */}
      <div
        style={{
          transform: `translate3d(0, ${(1 - footerSpring) * 40}px, 0)`,
          opacity: footerSpring,
        }}
        className="w-full text-center pb-1"
      >
        <span className="text-[11px] font-black text-amber-200 tracking-wider uppercase bg-black/70 px-4 py-1.5 rounded-full border border-amber-400/40 backdrop-blur-md shadow-lg inline-flex items-center gap-1.5">
          <span>🏺</span> {productName}
        </span>
      </div>
    </div>
  );
};
