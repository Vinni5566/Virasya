import { ProductReelProps, ReelPlan, ReelScenePlan, ReelTheme } from '../types';
import { sanitizeReelData } from './sanitizeReelData';
import { calculateVirtualCrop } from './cropPlanner';
import { createSeededRandom } from './seededRandom';
import { REEL_THEMES, inferReelTheme } from '../themePresets';

const TOTAL_DURATION_FRAMES = 720; // 24.0 seconds at 30 fps
const FPS = 30;

/**
 * Deterministically constructs a tailored ReelPlan based strictly on verified product data.
 * Dynamic hook selection updates the hero scene headline & subheadline in real time.
 */
export function buildReelPlan(props: ProductReelProps): ReelPlan {
  const verified = sanitizeReelData(props);

  // Generate stable deterministic seed from product title/id/props
  const seedString = `${props.productName || 'craft'}_${props.region || ''}_${props.materials || ''}_${props.variantSalt || 'v1'}`;
  const rng = createSeededRandom(seedString);
  const seedInt = rng.nextInt(0, 100);

  // Determine theme
  const theme: ReelTheme =
    (props.themeId && REEL_THEMES[props.themeId]) ||
    inferReelTheme(verified.craftType || '', verified.title, verified.materials.join(', '), verified.storyExcerpt || '');

  // Dynamic Hook Overrides
  const heroHeadline = props.hookTitle && props.hookTitle.trim().length > 0
    ? props.hookTitle.trim()
    : verified.title;

  const heroSubheadline = props.hookSubtext && props.hookSubtext.trim().length > 0
    ? props.hookSubtext.trim()
    : (verified.region ? `Origin • ${verified.region}` : verified.title);

  const heroMetadataLabel = props.hookTitle && props.hookTitle.trim().length > 0
    ? (verified.craftType ? `${verified.title.toUpperCase()} • ${verified.craftType.toUpperCase()}` : verified.title.toUpperCase())
    : (verified.craftType ? `CRAFT • ${verified.craftType.toUpperCase()}` : 'HANDCRAFTED HERITAGE');

  // Check data availability
  const hasMaterials = verified.materials.length > 0;
  const hasStory = Boolean(verified.storyExcerpt || verified.culturalNote);
  const hasMultipleImages = verified.images.length > 1;

  const scenes: ReelScenePlan[] = [];

  // Pick scene narrative based on available data
  if (hasMaterials && hasStory) {
    // 5-Scene Narrative: 170 + 140 + 140 + 135 + 135 = 720 frames (24.0s)
    // 1. Hero Reveal (includes 66-frame intro buffer + 100-year snapshot)
    scenes.push({
      id: 'scene-hero',
      type: 'hero-reveal',
      durationInFrames: 170,
      crop: calculateVirtualCrop({ shotType: 'hero-wide', seed: seedInt }),
      headline: heroHeadline,
      subheadline: heroSubheadline,
      metadataLabel: heroMetadataLabel,
      imageIndex: 0,
    });

    // 2. Macro Detail
    scenes.push({
      id: 'scene-macro',
      type: 'macro-detail',
      durationInFrames: 140,
      crop: calculateVirtualCrop({ shotType: 'macro-detail', seed: seedInt }),
      headline: verified.craftStyle || 'Artisanal Technique',
      metadataLabel: 'SURFACE & TEXTURE',
      imageIndex: hasMultipleImages ? 1 : 0,
    });

    // 3. Material Provenance
    scenes.push({
      id: 'scene-material',
      type: 'material-provenance',
      durationInFrames: 140,
      crop: calculateVirtualCrop({ shotType: 'material-texture', seed: seedInt }),
      headline: verified.materials.slice(0, 2).join(' • '),
      metadataLabel: 'VERIFIED MATERIALS',
      bodyText: verified.materials.join(' • '),
      imageIndex: hasMultipleImages && verified.images.length > 2 ? 2 : 0,
    });

    // 4. Artisan Story / Heritage Note (Voiceover finishes completely here)
    scenes.push({
      id: 'scene-story',
      type: 'artisan-quote',
      durationInFrames: 135,
      crop: calculateVirtualCrop({ shotType: 'asymmetric-editorial', seed: seedInt }),
      headline: verified.artisanName ? `From ${verified.artisanName}` : 'Artisan Legacy',
      metadataLabel: 'AUTHENTIC STORY',
      bodyText: verified.storyExcerpt || verified.culturalNote || '',
      imageIndex: 0,
    });

    // 5. Conversion Outro (Pure ambient flute music with price tag & CTA)
    scenes.push({
      id: 'scene-outro',
      type: 'conversion-outro',
      durationInFrames: 135,
      crop: calculateVirtualCrop({ shotType: 'hero-outro', seed: seedInt }),
      headline: verified.title,
      subheadline: verified.priceFormatted || undefined,
      metadataLabel: verified.region ? `HANDCRAFTED IN ${verified.region.toUpperCase()}` : 'HERITAGE CRAFT',
      imageIndex: 0,
    });
  } else if (hasMaterials || hasStory) {
    // 4-Scene Narrative: 190, 175, 175, 180 = 720 frames (24.0s)
    // 1. Hero Reveal
    scenes.push({
      id: 'scene-hero',
      type: 'hero-reveal',
      durationInFrames: 190,
      crop: calculateVirtualCrop({ shotType: 'hero-wide', seed: seedInt }),
      headline: heroHeadline,
      subheadline: heroSubheadline,
      metadataLabel: heroMetadataLabel,
      imageIndex: 0,
    });

    // 2. Macro Detail
    scenes.push({
      id: 'scene-macro',
      type: 'macro-detail',
      durationInFrames: 175,
      crop: calculateVirtualCrop({ shotType: 'macro-detail', seed: seedInt }),
      headline: verified.craftStyle || 'Artisanal Technique',
      metadataLabel: 'SURFACE & TEXTURE',
      imageIndex: hasMultipleImages ? 1 : 0,
    });

    // 3. Either Material or Story
    if (hasMaterials) {
      scenes.push({
        id: 'scene-material',
        type: 'material-provenance',
        durationInFrames: 175,
        crop: calculateVirtualCrop({ shotType: 'material-texture', seed: seedInt }),
        headline: verified.materials.slice(0, 3).join(' • '),
        metadataLabel: 'VERIFIED MATERIALS',
        bodyText: verified.materials.join(' • '),
        imageIndex: hasMultipleImages && verified.images.length > 2 ? 2 : 0,
      });
    } else {
      scenes.push({
        id: 'scene-story',
        type: 'artisan-quote',
        durationInFrames: 175,
        crop: calculateVirtualCrop({ shotType: 'asymmetric-editorial', seed: seedInt }),
        headline: verified.artisanName ? `From ${verified.artisanName}` : 'Craft Heritage',
        metadataLabel: 'AUTHENTIC STORY',
        bodyText: verified.storyExcerpt || verified.culturalNote || '',
        imageIndex: 0,
      });
    }

    // 4. Conversion Outro
    scenes.push({
      id: 'scene-outro',
      type: 'conversion-outro',
      durationInFrames: 180,
      crop: calculateVirtualCrop({ shotType: 'hero-outro', seed: seedInt }),
      headline: verified.title,
      subheadline: verified.priceFormatted || undefined,
      metadataLabel: verified.region ? `HANDCRAFTED IN ${verified.region.toUpperCase()}` : 'HERITAGE CRAFT',
      imageIndex: 0,
    });
  } else {
    // Minimal Data: 3-Scene Narrative: 240, 240, 240 = 720 frames (24.0s)
    // 1. Hero Reveal
    scenes.push({
      id: 'scene-hero',
      type: 'hero-reveal',
      durationInFrames: 240,
      crop: calculateVirtualCrop({ shotType: 'hero-wide', seed: seedInt }),
      headline: heroHeadline,
      subheadline: heroSubheadline,
      metadataLabel: heroMetadataLabel,
      imageIndex: 0,
    });

    // 2. Macro Detail
    scenes.push({
      id: 'scene-macro',
      type: 'macro-detail',
      durationInFrames: 240,
      crop: calculateVirtualCrop({ shotType: 'macro-detail', seed: seedInt }),
      headline: verified.craftStyle || 'Artisanal Form',
      metadataLabel: 'INTRICATE CRAFT',
      imageIndex: hasMultipleImages ? 1 : 0,
    });

    // 3. Conversion Outro
    scenes.push({
      id: 'scene-outro',
      type: 'conversion-outro',
      durationInFrames: 240,
      crop: calculateVirtualCrop({ shotType: 'hero-outro', seed: seedInt }),
      headline: verified.title,
      subheadline: verified.priceFormatted || undefined,
      metadataLabel: verified.region ? `HANDCRAFTED IN ${verified.region.toUpperCase()}` : 'HERITAGE CRAFT',
      imageIndex: 0,
    });
  }

  return {
    seed: seedString,
    fps: FPS,
    durationInFrames: TOTAL_DURATION_FRAMES,
    theme,
    scenes,
    verifiedData: verified,
  };
}
