import { VirtualCrop } from '../types';

export type ShotType =
  | 'hero-wide'
  | 'macro-detail'
  | 'asymmetric-editorial'
  | 'material-texture'
  | 'hero-outro';

interface CropPlannerParams {
  shotType: ShotType;
  seed: number; // 0..100
  aspectRatioHint?: number; // width / height (e.g. 1.0 for square, 0.75 for 3:4, 1.77 for 16:9)
}

/**
 * Calculates resolution-safe virtual camera crop parameters from a single image.
 * Prevents extreme overzooming (e.g. 2.8x) that produces pixelated blur.
 */
export function calculateVirtualCrop({
  shotType,
  seed,
  aspectRatioHint = 1.0,
}: CropPlannerParams): VirtualCrop {
  // Safe maximum zoom factor: capped at 1.40 for 1:1 or 16:9, max 1.35 for portrait
  const maxSafeMacro = aspectRatioHint < 0.8 ? 1.35 : 1.45;

  // Small deterministic directional nudges
  const dirX = seed % 2 === 0 ? 1 : -1;
  const dirY = seed % 3 === 0 ? 1 : -1;

  switch (shotType) {
    case 'hero-wide':
      return {
        scale: 1.0,
        offsetX: 0,
        offsetY: 0,
        driftX: 0,
        driftY: -10, // subtle upward drift
      };

    case 'macro-detail':
      return {
        scale: maxSafeMacro,
        offsetX: dirX * 12,
        offsetY: dirY * 10,
        driftX: -dirX * 6,
        driftY: -dirY * 5,
      };

    case 'asymmetric-editorial':
      return {
        scale: 1.12,
        offsetX: -16, // offset to the left to let typography breathe on the right
        offsetY: 4,
        driftX: 8,
        driftY: -6,
      };

    case 'material-texture':
      return {
        scale: Math.min(maxSafeMacro, 1.38),
        offsetX: -dirX * 10,
        offsetY: dirY * 14,
        driftX: dirX * 5,
        driftY: -dirY * 6,
      };

    case 'hero-outro':
    default:
      return {
        scale: 1.06,
        offsetX: 0,
        offsetY: -4,
        driftX: 0,
        driftY: 8,
      };
  }
}
