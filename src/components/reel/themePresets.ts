import { ReelTheme, ReelHookOption } from './types';

export const REEL_THEMES: Record<string, ReelTheme> = {
  'warm-woodwork': {
    id: 'warm-woodwork',
    name: 'Warm Teak & Sheesham Gold',
    description: 'Deep walnut wood, carved timber warmth, and radiant gold leaf accents',
    badgeBg: 'rgba(217, 119, 6, 0.22)',
    badgeText: '#FDE68A',
    accentColor: '#F59E0B',
    gradientFrom: '#1A1008',
    gradientVia: '#2B1A0E',
    gradientTo: '#0F0904',
    textColor: '#FFFDF7',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    particleColor: '#FCD34D',
    categoryVibe: 'Woodwork, Carving & Timber',
  },
  'antique-brass': {
    id: 'antique-brass',
    name: 'Antique Brass & Dhokra Bronze',
    description: 'Burnished metallic brass, antique bronze, and warm gold highlights',
    badgeBg: 'rgba(234, 179, 8, 0.22)',
    badgeText: '#FEF08A',
    accentColor: '#FBBF24',
    gradientFrom: '#181308',
    gradientVia: '#291F0C',
    gradientTo: '#0D0A04',
    textColor: '#FFFDF9',
    glowColor: 'rgba(251, 191, 36, 0.42)',
    particleColor: '#FDE047',
    categoryVibe: 'Brass, Bronze & Metalcraft',
  },
  'earthy-terracotta': {
    id: 'earthy-terracotta',
    name: 'Earthen Terracotta & Clay',
    description: 'Sun-baked terracotta, warm clay ochre, and natural earthen warmth',
    badgeBg: 'rgba(234, 88, 12, 0.22)',
    badgeText: '#FED7AA',
    accentColor: '#EA580C',
    gradientFrom: '#220E06',
    gradientVia: '#35160A',
    gradientTo: '#110602',
    textColor: '#FFF7ED',
    glowColor: 'rgba(234, 88, 12, 0.4)',
    particleColor: '#FB923C',
    categoryVibe: 'Terracotta, Pottery & Clay',
  },
  'royal-silk': {
    id: 'royal-silk',
    name: 'Royal Zari & Deep Indigo',
    description: 'Rich royal indigo, festive gold brocade, and handcrafted heritage textiles',
    badgeBg: 'rgba(99, 102, 241, 0.22)',
    badgeText: '#E0E7FF',
    accentColor: '#FACC15',
    gradientFrom: '#0D1224',
    gradientVia: '#161F3B',
    gradientTo: '#060812',
    textColor: '#F8FAFC',
    glowColor: 'rgba(250, 204, 21, 0.35)',
    particleColor: '#FDE047',
    categoryVibe: 'Silk, Handloom & Textiles',
  },
  'heritage-amber': {
    id: 'heritage-amber',
    name: 'Imperial Amber & Gold Leaf',
    description: 'Classic regal gold foil, warm sandstone warmth, and imperial radiance',
    badgeBg: 'rgba(217, 119, 6, 0.22)',
    badgeText: '#FEF3C7',
    accentColor: '#D97706',
    gradientFrom: '#1C1208',
    gradientVia: '#2D1D0C',
    gradientTo: '#0C0703',
    textColor: '#FFFDF5',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    particleColor: '#FDE68A',
    categoryVibe: 'Imperial & Rare Masterpieces',
  },
};

/**
 * Universal adaptive theme resolver accurately matching product materials.
 */
export function inferReelTheme(
  craftType?: string,
  productName?: string,
  materials?: string,
  description?: string
): ReelTheme {
  const text = `${craftType || ''} ${productName || ''} ${materials || ''} ${description || ''}`.toLowerCase();

  // 1. Woodwork / Timber / Teak / Sheesham / Sandalwood / Wooden Carving
  if (
    text.includes('wood') ||
    text.includes('timber') ||
    text.includes('teak') ||
    text.includes('sheesham') ||
    text.includes('sandalwood') ||
    text.includes('rosewood') ||
    text.includes('carv') ||
    text.includes('bamboo') ||
    text.includes('cane') ||
    text.includes('channapatna') ||
    text.includes('saharanpur')
  ) {
    return REEL_THEMES['warm-woodwork'];
  }

  // 2. Brass / Bronze / Copper / Metal / Dhokra / Bell Metal / Bidri
  if (
    text.includes('brass') ||
    text.includes('bronze') ||
    text.includes('copper') ||
    text.includes('dhokra') ||
    text.includes('dokra') ||
    text.includes('metal') ||
    text.includes('bidri') ||
    text.includes('bell metal') ||
    text.includes('iron') ||
    text.includes('silver') ||
    text.includes('gold') ||
    text.includes('jewelry') ||
    text.includes('jewellery')
  ) {
    return REEL_THEMES['antique-brass'];
  }

  // 3. Terracotta / Clay / Pottery / Ceramic / Earthen
  if (
    text.includes('pottery') ||
    text.includes('terracotta') ||
    text.includes('clay') ||
    text.includes('ceramic') ||
    text.includes('earthen') ||
    text.includes('mud') ||
    text.includes('khurja') ||
    text.includes('molela')
  ) {
    return REEL_THEMES['earthy-terracotta'];
  }

  // 4. Textiles / Handloom / Silk / Zari / Banarasi / Chanderi / Bandhani / Kalamkari
  if (
    text.includes('silk') ||
    text.includes('textile') ||
    text.includes('handloom') ||
    text.includes('zari') ||
    text.includes('banarasi') ||
    text.includes('chanderi') ||
    text.includes('bandhani') ||
    text.includes('kalamkari') ||
    text.includes('weaving') ||
    text.includes('cotton') ||
    text.includes('wool') ||
    text.includes('pashmina') ||
    text.includes('indigo') ||
    text.includes('embroidery')
  ) {
    return REEL_THEMES['royal-silk'];
  }

  // Default: Heritage Amber (warm gold, harmonious with all Indian crafts)
  return REEL_THEMES['heritage-amber'];
}

/**
 * Generates compelling, high-CTR viral hook options tailored to the craft.
 */
export function generateReelHooks(product: {
  productName: string;
  artisanName?: string;
  craftType: string;
  region: string;
  materials?: string;
}): ReelHookOption[] {
  const craft = product.craftType || 'Handcrafted Heritage';
  const region = product.region || 'India';
  const maker = product.artisanName || 'Master Artisan';

  return [
    {
      id: 'heritage-secret',
      title: `The 100-Year Heritage of ${region}`,
      subtext: `Handmade with pure devotion by ${maker}`,
    },
    {
      id: 'slow-craft',
      title: `40+ Hours of Master Handcrafting`,
      subtext: `100% authentic ${craft} with zero machine shortcuts`,
    },
    {
      id: 'direct-maker',
      title: `Direct from Master Artisan ${maker}`,
      subtext: `Empowering real artisans through verified fair trade`,
    },
    {
      id: 'rare-find',
      title: `A Rare Living Heritage Masterpiece`,
      subtext: `Handcrafted from genuine ${product.materials || 'natural materials'}`,
    },
  ];
}
