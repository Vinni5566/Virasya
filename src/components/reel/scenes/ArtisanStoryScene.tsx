import React from 'react';
import { useCurrentFrame, interpolate, Img, AbsoluteFill } from 'remotion';
import { ReelScenePlan, ReelTheme } from '../types';
import { ArchivalMetadata } from '../typography/ArchivalMetadata';
import { VerifiedQuote } from '../typography/VerifiedQuote';

interface ArtisanStorySceneProps {
  scene: ReelScenePlan;
  theme: ReelTheme;
  imageUrl: string;
}

export const ArtisanStoryScene: React.FC<ArtisanStorySceneProps> = ({
  scene,
  theme,
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;

  const sceneOpacity = interpolate(
    frame,
    [0, 2, duration - 8, duration],
    [0.9, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Asymmetric subtle parallax drift
  const cameraScale = interpolate(
    frame,
    [0, duration],
    [scene.crop.scale, scene.crop.scale * 1.04],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const panX = interpolate(
    frame,
    [0, duration],
    [scene.crop.offsetX, scene.crop.offsetX + scene.crop.driftX],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
      }}
    >
      {/* Product Image Layer - Asymmetric offset */}
      <AbsoluteFill className="overflow-hidden">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate3d(${panX}%, ${scene.crop.offsetY}%, 0) scale(${cameraScale})`,
            transformOrigin: 'center center',
          }}
        >
          <Img
            src={imageUrl}
            alt="Artisan Story"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
              opacity: 0.85,
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Atmospheric dark gradient for quote legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Editorial Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-12 sm:p-16 z-20 pointer-events-none">
        <div>
          {scene.metadataLabel && (
            <ArchivalMetadata
              label={scene.metadataLabel}
              delayFrames={4}
              accentColor={theme.accentColor}
            />
          )}
        </div>

        <div className="space-y-4 pb-12">
          {scene.bodyText && (
            <VerifiedQuote
              quote={scene.bodyText}
              speaker={scene.headline}
              delayFrames={8}
              accentColor={theme.accentColor}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
