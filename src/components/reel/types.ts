export interface ReelTheme {
  id: string;
  name: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  textColor: string;
  glowColor: string;
  particleColor: string;
  categoryVibe: string;
}

export interface ReelHookOption {
  id: string;
  title: string;
  subtext: string;
  iconName?: string;
}

export interface VirtualCrop {
  scale: number;
  offsetX: number; // percentage offset -30 to +30
  offsetY: number; // percentage offset -30 to +30
  driftX: number;  // pan delta across the scene
  driftY: number;  // pan delta across the scene
}

export type SceneType =
  | 'hero-reveal'
  | 'macro-detail'
  | 'material-provenance'
  | 'artisan-quote'
  | 'product-facts'
  | 'conversion-outro';

export interface ReelScenePlan {
  id: string;
  type: SceneType;
  durationInFrames: number;
  crop: VirtualCrop;
  headline?: string;
  subheadline?: string;
  metadataLabel?: string;
  bodyText?: string;
  imageIndex: number;
}

export interface VerifiedReelData {
  title: string;
  priceFormatted: string | null;
  rawPrice: number | null;
  region: string | null;
  artisanName: string | null;
  craftType: string | null;
  craftStyle: string | null;
  materials: string[];
  storyExcerpt: string | null;
  culturalNote: string | null;
  availableQuantity: number | null;
  images: string[];
}

export interface ReelPlan {
  seed: string;
  fps: number;
  durationInFrames: number;
  theme: ReelTheme;
  scenes: ReelScenePlan[];
  verifiedData: VerifiedReelData;
}

export interface ProductReelProps {
  productName: string;
  artisanName?: string;
  craftType?: string;
  craftStyle?: string;
  region?: string;
  materials?: string;
  price?: number;
  availableQuantity?: number;
  imageUrl?: string;
  images?: string[];
  story?: string;
  culturalNote?: string;
  themeId?: string;
  hookTitle?: string;
  hookSubtext?: string;
  language?: string;
  audioTrackId?: string;
  enableVoiceover?: boolean;
  variantSalt?: string;
}

