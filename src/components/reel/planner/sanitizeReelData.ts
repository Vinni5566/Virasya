import { ProductReelProps, VerifiedReelData } from '../types';

function isValidImageSource(src: any): boolean {
  if (typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  );
}

/**
 * Enforces strict authenticity & data integrity.
 * IF DATA EXISTS: format and display it.
 * IF DATA DOES NOT EXIST: omit it.
 * NEVER: infer, embellish, fabricate, or invent scarcity/certifications.
 */
export function sanitizeReelData(props: ProductReelProps): VerifiedReelData {
  // Title
  const cleanTitle = (props.productName || '').trim() || 'Handcrafted Heritage';

  // Price formatting - strictly if price > 0
  const rawPrice = typeof props.price === 'number' && props.price > 0 ? props.price : null;
  const priceFormatted = rawPrice !== null ? `₹${rawPrice.toLocaleString('en-IN')}` : null;

  // Region - only if provided and not empty
  const rawRegion = (props.region || '').trim();
  const region = rawRegion.length > 0 && rawRegion.toLowerCase() !== 'unknown' ? rawRegion : null;

  // Artisan name - only if real name provided
  const rawArtisan = (props.artisanName || '').trim();
  const artisanName =
    rawArtisan.length > 0 &&
    !rawArtisan.toLowerCase().includes('master craftsman') &&
    rawArtisan.toLowerCase() !== 'unknown'
      ? rawArtisan
      : null;

  // Craft type & style
  const craftType = (props.craftType || '').trim() || null;
  const craftStyle = (props.craftStyle || '').trim() || null;

  // Materials - split by comma / slash / bullet if string, or sanitize array
  let materials: string[] = [];
  if (Array.isArray(props.materials)) {
    materials = (props.materials as any[]).map((m) => String(m).trim()).filter(Boolean);
  } else if (typeof props.materials === 'string' && props.materials.trim().length > 0) {
    materials = props.materials
      .split(/[,/•|]+/)
      .map((m) => m.trim())
      .filter((m) => m.length > 0 && m.length < 40);
  }

  // Story excerpt - truncate cleanly at word boundary without adding fiction
  let storyExcerpt: string | null = null;
  const rawStory = (props.story || '').trim();
  if (rawStory.length > 0) {
    if (rawStory.length > 140) {
      const truncated = rawStory.slice(0, 140);
      const lastSpace = truncated.lastIndexOf(' ');
      storyExcerpt = lastSpace > 40 ? `${truncated.slice(0, lastSpace)}...` : `${truncated}...`;
    } else {
      storyExcerpt = rawStory;
    }
  }

  // Cultural note
  const culturalNote = (props.culturalNote || '').trim() || null;

  // Available quantity - only if explicit number
  const availableQuantity =
    typeof props.availableQuantity === 'number' && props.availableQuantity > 0
      ? props.availableQuantity
      : null;

  // Images - prioritize artisan's uploaded images array or single imageUrl
  const images: string[] = [];
  if (props.images && Array.isArray(props.images)) {
    props.images.forEach((img) => {
      if (isValidImageSource(img)) {
        images.push(img.trim());
      }
    });
  }
  if (images.length === 0 && isValidImageSource(props.imageUrl)) {
    images.push(props.imageUrl!.trim());
  }
  // Fallback placeholder ONLY if artisan did not upload any valid image at all
  if (images.length === 0) {
    images.push('https://picsum.photos/seed/virasya-craft/1080/1350');
  }

  return {
    title: cleanTitle,
    priceFormatted,
    rawPrice,
    region,
    artisanName,
    craftType,
    craftStyle,
    materials,
    storyExcerpt,
    culturalNote,
    availableQuantity,
    images,
  };
}
