import React from 'react';
import { useCurrentFrame, interpolate, Img, AbsoluteFill } from 'remotion';
import { ReelScenePlan, ReelTheme } from '../types';
import { EditorialHeadline } from '../typography/EditorialHeadline';
import { ArchivalMetadata } from '../typography/ArchivalMetadata';

interface MaterialProvenanceSceneProps {
  scene: ReelScenePlan;
  theme: ReelTheme;
  imageUrl: string;
}

export const MaterialProvenanceScene: React.FC<MaterialProvenanceSceneProps> = ({
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

  const cameraScale = interpolate(
    frame,
    [0, duration],
    [scene.crop.scale, scene.crop.scale * 1.05],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const panY = interpolate(
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
      {/* Product Image Layer */}
      <AbsoluteFill className="overflow-hidden">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate3d(${scene.crop.offsetX}%, ${panY}px, 0) scale(${cameraScale})`,
            transformOrigin: 'center center',
          }}
        >
          <Img
            src={imageUrl}
            alt="Materials"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Gradient Mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.9) 100%)',
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

        <div className="space-y-4 pb-8">
          <EditorialHeadline
            title={scene.headline || 'Natural Materials'}
            delayFrames={8}
            color="#FFFFFF"
          />

          {scene.bodyText && (
            <div className="flex items-center gap-3 pt-2">
              <div
                className="w-8 h-[1px]"
                style={{ backgroundColor: theme.accentColor }}
              />
              <p className="text-xl sm:text-2xl font-sans tracking-wide text-white font-bold drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                {scene.bodyText}
              </p>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
