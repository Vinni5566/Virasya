import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, AbsoluteFill } from 'remotion';
import { ReelScenePlan, ReelTheme } from '../types';
import { EditorialHeadline } from '../typography/EditorialHeadline';
import { ArchivalMetadata } from '../typography/ArchivalMetadata';

interface CallToActionSceneProps {
  scene: ReelScenePlan;
  theme: ReelTheme;
  imageUrl: string;
}

export const CallToActionScene: React.FC<CallToActionSceneProps> = ({
  scene,
  theme,
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = scene.durationInFrames;

  const sceneOpacity = interpolate(
    frame,
    [0, 2, duration - 8, duration],
    [0.9, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const priceSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 120 },
  });

  const cameraScale = interpolate(
    frame,
    [0, duration],
    [scene.crop.scale, scene.crop.scale * 1.05],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
      }}
    >
      {/* Product Hero Centered */}
      <AbsoluteFill className="overflow-hidden">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate3d(${scene.crop.offsetX}%, ${scene.crop.offsetY}%, 0) scale(${cameraScale})`,
            transformOrigin: 'center center',
          }}
        >
          <Img
            src={imageUrl}
            alt={scene.headline || 'Product'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.7))',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Subtle Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Editorial Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-12 sm:p-16 z-20 pointer-events-none">
        <div>
          {scene.metadataLabel && (
            <ArchivalMetadata
              label={scene.metadataLabel}
              delayFrames={3}
              accentColor={theme.accentColor}
            />
          )}
        </div>

        <div className="space-y-5 pb-8">
          <EditorialHeadline
            title={scene.headline || ''}
            delayFrames={6}
            color="#FFFFFF"
          />

          {/* Authentic Price Tag & Direct Acquisition Mark */}
          {scene.subheadline && (
            <div
              className="flex items-baseline gap-3 pt-2"
              style={{
                transform: `translate3d(0, ${(1 - priceSpring) * 16}px, 0)`,
                opacity: priceSpring,
              }}
            >
              <span
                className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
                style={{ color: theme.accentColor }}
              >
                {scene.subheadline}
              </span>
              <span className="text-sm sm:text-base uppercase tracking-widest font-mono text-amber-200 font-bold drop-shadow-md">
                Direct from Artisan
              </span>
            </div>
          )}

          {/* Minimalist Acquisition Rule */}
          <div className="pt-2 flex items-center gap-3 text-sm sm:text-base tracking-wider uppercase font-mono text-white font-bold drop-shadow-md">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available on Virasya</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
