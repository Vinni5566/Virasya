export type UserRole = 'artisan' | 'buyer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  preferredLanguage: 'en' | 'hi' | 'ta' | 'bn' | 'mr';
  profilePhotoUrl?: string;
}

export interface MarketingContent {
  instagram: string;
  whatsapp: string;
  hashtags: string[];
  promoLine: string;
}

export interface Product {
  id: string;
  artisanId: string;
  artisanName?: string;
  productName: string;
  description: string;
  craftType: 'Pottery' | 'Textiles' | 'Jewelry' | 'Woodwork' | 'Hand painting' | 'Paper Mache' | 'Metalwork' | 'Leatherwork' | 'Bamboo & Cane' | 'Other';
  craftStyle?: string;
  region: string;
  materials: string;
  price: number;
  availableQuantity: number;
  priceRange?: { 
    min: number; 
    max: number; 
    reasoning: string 
  };
  images: string[];
  story: string;
  culturalNote?: string;
  tags: string[];
  marketing?: MarketingContent;
  status: 'Draft' | 'Published';
  createdAt: any;
  updatedAt: any;
}
