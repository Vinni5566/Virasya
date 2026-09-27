import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ReelTheme } from '../types';
import { getReelI18n } from '../i18nReel';

interface CraftDetailsSceneProps {
  productName: string;
  materials: string;
  craftStyle?: string;
  craftType: string;
  theme: ReelTheme;
  language?: string;
}

export const CraftDetailsScene: React.FC<CraftDetailsSceneProps> = ({
  productName,
  materials,
  craftStyle,
  craftType,
  theme,
  language,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i18n = getReelI18n(language);

  // Scene active window: frame 100 to 220
  const sceneFrame = frame - 100;

  // Energetic Canva Springs
  const headerEntrance = spring({
    frame: sceneFrame,
    fps,
    config: { damping: 9, mass: 0.5, stiffness: 170 },
  });

  const card1Spring = spring({
    frame: sceneFrame - 4,
    fps,
    config: { damping: 9, mass: 0.55, stiffness: 160 },
  });

  const card2Spring = spring({
    frame: sceneFrame - 9,
    fps,
    config: { damping: 9, mass: 0.55, stiffness: 160 },
  });

  const stampSpring = spring({
    frame: sceneFrame - 15,
    fps,
    config: { damping: 8, mass: 0.5, stiffness: 190 },
  });

  const bottomSpring = spring({
    frame: sceneFrame - 18,
    fps,
    config: { damping: 10, mass: 0.6 },
  });

  const exitOpacity = interpolate(sceneFrame, [94, 115], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentOpacity = sceneFrame < 0 ? 0 : exitOpacity;

  if (sceneFrame < -5 || sceneFrame > 125) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 z-30 pointer-events-none"
      style={{ opacity: currentOpacity }}
    >
      {/* 1. TOP BADGE: Canva Highlighter Tag */}
      <div
        style={{
          transform: `translate3d(0, ${(1 - headerEntrance) * -50}px, 0) scale(${headerEntrance})`,
          opacity: headerEntrance,
        }}
        className="pt-1 flex items-center justify-between"
      >
        <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-400/60 bg-black/85 text-amber-300 shadow-[0_4px_15px_rgba(245,158,11,0.35)] flex items-center gap-1.5">
          <span className="animate-spin">✦</span> {i18n.authenticMaterials}
        </span>

        {/* Bouncy GI Tag Badge */}
        <span
          style={{
            transform: `scale(${stampSpring}) rotate(3deg)`,
            opacity: stampSpring,
          }}
          className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg"
        >
          ✓ GI TAG AUTHENTIC
        </span>
      </div>

      {/* 2. CENTER CONTENT: Canva Floating Feature Cards */}
      <div className="space-y-3 my-auto">
        {/* Product Title Banner */}
        <div
          style={{
            transform: `translate3d(${(1 - card1Spring) * -60}px, 0, 0) scale(${card1Spring})`,
            opacity: card1Spring,
          }}
          className="mb-1"
        >
          <span className="px-3 py-1 bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-md shadow-md -rotate-1 inline-block mb-1.5">
            {craftType} Masterwork
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
            {productName}
          </h2>
        </div>

        {/* Feature Card 1: Raw Materials (Canva aesthetic) */}
        <div
          style={{
            transform: `translate3d(${(1 - card1Spring) * -70}px, 0, 0) scale(${card1Spring}) rotate(-1deg)`,
            opacity: card1Spring,
          }}
          className="p-4 rounded-3xl bg-black/85 backdrop-blur-2xl border-2 border-amber-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.7)] mr-2 space-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
              🪵 SOURCED
            </span>
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              {i18n.sourcedMaterials}
            </p>
          </div>
          <p className="text-base sm:text-lg font-black text-white tracking-tight">
            {materials || 'Pure Natural & Generational Elements'}
          </p>
        </div>

        {/* Feature Card 2: Craft Technique (Canva aesthetic) */}
        <div
          style={{
            transform: `translate3d(${(1 - card2Spring) * 70}px, 0, 0) scale(${card2Spring}) rotate(1deg)`,
            opacity: card2Spring,
          }}
          className="p-4 rounded-3xl bg-black/85 backdrop-blur-2xl border-2 border-amber-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.7)] ml-2 space-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
              ✋ TECHNIQUE
            </span>
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              {i18n.craftTradition}
            </p>
          </div>
          <p className="text-base sm:text-lg font-black text-white tracking-tight">
            {craftStyle || `Hand-carved Traditional ${craftType}`}
          </p>
        </div>
      </div>

      {/* 3. BOTTOM STAMP */}
      <div
        style={{
          transform: `translate3d(0, ${(1 - bottomSpring) * 40}px, 0)`,
          opacity: bottomSpring,
        }}
        className="pb-1 text-center"
      >
        <span className="text-[11px] font-black text-amber-200 tracking-wider uppercase bg-black/75 px-4 py-1.5 rounded-full border border-amber-400/40 backdrop-blur-md shadow-md inline-flex items-center gap-1.5">
          <span>✨</span> {i18n.fidelityBadge}
        </span>
      </div>
    </div>
  );
};
