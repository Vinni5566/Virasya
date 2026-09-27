import React from 'react';
import { useCurrentFrame, interpolate, Img, AbsoluteFill } from 'remotion';
import { ReelScenePlan, ReelTheme } from '../types';
import { EditorialHeadline } from '../typography/EditorialHeadline';
import { ArchivalMetadata } from '../typography/ArchivalMetadata';

interface MacroDetailSceneProps {
  scene: ReelScenePlan;
  theme: ReelTheme;
  imageUrl: string;
}

export const MacroDetailScene: React.FC<MacroDetailSceneProps> = ({
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

  // Smooth diagonal drift across authentic material texture
  const cameraScale = interpolate(
    frame,
    [0, duration],
    [scene.crop.scale, scene.crop.scale * 1.04],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const driftX = interpolate(
    frame,
    [0, duration],
    [scene.crop.offsetX, scene.crop.offsetX + scene.crop.driftX],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const driftY = interpolate(
    frame,
    [0, duration],
    [scene.crop.offsetY, scene.crop.offsetY + scene.crop.driftY],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
      }}
    >
      {/* Texture Crop Layer */}
      <AbsoluteFill className="overflow-hidden">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate3d(${driftX}%, ${driftY}%, 0) scale(${cameraScale})`,
            transformOrigin: 'center center',
          }}
        >
          <Img
            src={imageUrl}
            alt="Craft detail"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'contrast(1.05) saturate(1.04)',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Cinematic Gradient Mask for Legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.88) 100%)',
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

        <div className="space-y-3 pb-8">
          <EditorialHeadline
            title={scene.headline || 'Handmade Texture'}
            delayFrames={8}
            color="#FFFFFF"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
