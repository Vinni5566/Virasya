import React, { useMemo } from 'react';
import { Series, AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';
import { ProductReelProps } from './types';
import { buildReelPlan } from './planner/buildReelPlan';
import { HeroRevealScene } from './scenes/HeroRevealScene';
import { MacroDetailScene } from './scenes/MacroDetailScene';
import { MaterialProvenanceScene } from './scenes/MaterialProvenanceScene';
import { ArtisanStoryScene } from './scenes/ArtisanStoryScene';
import { CallToActionScene } from './scenes/CallToActionScene';

export const ProductReelComposition: React.FC<ProductReelProps> = (props) => {
  const frame = useCurrentFrame();

  // Construct deterministic, verified ReelPlan
  const plan = useMemo(() => buildReelPlan(props), [props]);
  const { theme, scenes, verifiedData } = plan;

  // Determine current active image for background atmospheric bleed
  const fallbackImage = verifiedData.images[0] || 'https://picsum.photos/seed/craft/1080/1920';

  // Subtle ambient camera drift for background bleed
  const bgScale = interpolate(frame, [0, 450], [1.22, 1.28], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.gradientTo,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ================================================================= */}
      {/* LAYER 1 & 2: IMAGE-DERIVED ATMOSPHERIC BACKGROUND BLEED          */}
      {/* ================================================================= */}
      <AbsoluteFill className="overflow-hidden pointer-events-none">
        <Img
          src={fallbackImage}
          alt={verifiedData.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(50px) brightness(0.38) saturate(1.2)',
            transform: `scale(${bgScale})`,
            transformOrigin: 'center center',
          }}
        />

        {/* Ambient Color Wash & Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${theme.glowColor} 0%, transparent 65%),
                         linear-gradient(180deg, ${theme.gradientFrom}B3 0%, ${theme.gradientVia}55 45%, ${theme.gradientTo}E6 100%)`,
          }}
        />

        {/* Restrained Architectural Hairline Border */}
        <div className="absolute inset-6 border border-white/10 pointer-events-none" />
      </AbsoluteFill>

      {/* ================================================================= */}
      {/* LAYER 3: DYNAMIC NARRATIVE SCENE PRIMITIVES VIA REMOTION SERIES   */}
      {/* ================================================================= */}
      <Series>
        {scenes.map((scene) => {
          const imageForScene = verifiedData.images[scene.imageIndex] || fallbackImage;

          return (
            <Series.Sequence
              key={scene.id}
              durationInFrames={scene.durationInFrames}
            >
              {scene.type === 'hero-reveal' && (
                <HeroRevealScene
                  scene={scene}
                  theme={theme}
                  imageUrl={imageForScene}
                />
              )}
              {scene.type === 'macro-detail' && (
                <MacroDetailScene
                  scene={scene}
                  theme={theme}
                  imageUrl={imageForScene}
                />
              )}
              {scene.type === 'material-provenance' && (
                <MaterialProvenanceScene
                  scene={scene}
                  theme={theme}
                  imageUrl={imageForScene}
                />
              )}
              {scene.type === 'artisan-quote' && (
                <ArtisanStoryScene
                  scene={scene}
                  theme={theme}
                  imageUrl={imageForScene}
                />
              )}
              {scene.type === 'conversion-outro' && (
                <CallToActionScene
                  scene={scene}
                  theme={theme}
                  imageUrl={imageForScene}
                />
              )}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
