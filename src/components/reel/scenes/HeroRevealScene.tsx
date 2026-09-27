import React from 'react';
import { useCurrentFrame, interpolate, Img, AbsoluteFill } from 'remotion';
import { ReelScenePlan, ReelTheme } from '../types';
import { EditorialHeadline } from '../typography/EditorialHeadline';
import { ArchivalMetadata } from '../typography/ArchivalMetadata';

interface HeroRevealSceneProps {
  scene: ReelScenePlan;
  theme: ReelTheme;
  imageUrl: string;
}

export const HeroRevealScene: React.FC<HeroRevealSceneProps> = ({
  scene,
  theme,
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;

  // Scene opacity: starts fully visible at frame 0, smooth exit fade
  const sceneOpacity = interpolate(
    frame,
    [0, duration - 8, duration],
    [1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Smooth cinematic camera push
  const cameraScale = interpolate(
    frame,
    [0, duration],
    [scene.crop.scale, scene.crop.scale * 1.05],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cameraPanY = interpolate(
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
      {/* Layer: Hero Product Image with Virtual Crop */}
      <AbsoluteFill className="overflow-hidden">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate3d(${scene.crop.offsetX}%, ${cameraPanY}px, 0) scale(${cameraScale})`,
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
              filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.6))',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Layer: Subtle Vignette to Protect Typography */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Layer: Intro Branding Seal (Frames 0 to 66: ~2.2s intro audio warmup buffer) */}
      {frame < 70 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
          style={{
            opacity: interpolate(frame, [0, 10, 52, 66], [0, 1, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `scale(${interpolate(frame, [0, 66], [0.92, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
          }}
        >
          <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl bg-black/60 backdrop-blur-md border border-amber-500/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
            <span className="text-amber-300 font-mono text-xs sm:text-sm tracking-[0.3em] font-extrabold uppercase drop-shadow-md">
              VIRASYA • HERITAGE CRAFT
            </span>
          </div>
        </div>
      )}

      {/* Layer: Editorial Typography */}
      <div className="absolute inset-0 flex flex-col justify-between p-12 sm:p-16 z-20 pointer-events-none">
        {/* Top Metadata */}
        <div>
          {scene.metadataLabel && (
            <ArchivalMetadata
              label={scene.metadataLabel}
              sublabel={scene.subheadline}
              delayFrames={66}
              accentColor={theme.accentColor}
            />
          )}
        </div>

        {/* Bottom Headline */}
        <div className="space-y-4 pb-8">
          <EditorialHeadline
            title={scene.headline || ''}
            delayFrames={68}
            color="#FFFFFF"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
