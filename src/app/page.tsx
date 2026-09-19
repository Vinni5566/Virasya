"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { useUser } from '@/firebase';

const featuredProducts: Product[] = [
  {
    id: '1',
    artisanId: 'a1',
    productName: 'Terracotta Blue Glaze Bowl',
    description: 'A masterpiece of traditional pottery from Khurja.',
    craftType: 'Pottery',
    region: 'Khurja, Uttar Pradesh',
    materials: 'Natural clay, mineral glazes',
    price: 1200,
    images: ['/home-page/terracotta-bowl.jpeg'],
    story: 'Hand-shaped on a traditional kick wheel...',
    tags: ['pottery', 'decor', 'handmade'],
    status: 'Published',
    availableQuantity: 5,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z')
  },
  {
    id: '2',
    artisanId: 'a2',
    productName: 'Chanderi Silk Stole',
    description: 'Light as air silk stole with zari borders.',
    craftType: 'Textiles',
    region: 'Chanderi, Madhya Pradesh',
    materials: 'Pure Silk, Zari',
    price: 2500,
    images: ['/home-page/chanderi-silk-stole.jpeg'],
    story: 'Woven by weavers in the historic town of Chanderi...',
    tags: ['silk', 'scarf', 'handloom'],
    status: 'Published',
    availableQuantity: 3,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z')
  },
  {
    id: '3',
    artisanId: 'a3',
    productName: 'Handpainted Madhubani Tray',
    description: 'Wooden tray with vibrant Madhubani folklore.',
    craftType: 'Hand painting',
    region: 'Mithila, Bihar',
    materials: 'Wood, Natural dyes',
    price: 1800,
    images: ['/home-page/handpainted-madhubani-tray.jpeg'],
    story: 'Each stroke tells a story of ancient Indian myths...',
    tags: ['art', 'kitchen', 'painting'],
    status: 'Published',
    availableQuantity: 8,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z')
  }
];

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  const handleSellClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden hero-gradient">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold mb-6 text-primary border-primary/20 bg-primary/5">
                Heritage Craft Meets AI
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-bold text-foreground mb-6 leading-tight">
                Empowering Artisans, <br />
                <span className="text-primary">Preserving Heritage.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-body">
                Virasya is an AI-powered marketplace where centuries-old craftsmanship 
                finds a digital home. Discover authentic handcrafted art with verified stories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace">
                  <Button size="lg" className="rounded-full px-8 h-14 text-lg">
                    Explore Marketplace
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={handleSellClick}>
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-2">
                    Sell Your Craft
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-full">
            <div className="relative w-full h-full">
               
            <Image src="/hero1.jpeg" alt="Description" width={600} height={400} />
        
            </div>
          </div>
        </section>

        {/* Featured Crafts */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-4">Popular Crafts</h2>
                <p className="text-muted-foreground">Hand-picked treasures from the heart of India.</p>
              </div>
              <Link href="/marketplace" className="text-primary font-bold flex items-center gap-2 hover:underline">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* AI Features Highlight */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-4">Digitalizing Craftsmanship</h2>
              <p className="text-muted-foreground">Our AI tools help artisans cross the digital divide and reach a global audience.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Sparkles className="h-8 w-8 text-primary" />,
                  title: "AI Listing Generator",
                  desc: "Instantly create professional product descriptions and SEO tags."
                },
                {
                  icon: <ShieldCheck className="h-8 w-8 text-primary" />,
                  title: "Story Verification",
                  desc: "Fact-based storytelling to ensure cultural authenticity."
                },
                {
                  icon: <Leaf className="h-8 w-8 text-primary" />,
                  title: "Smart Pricing",
                  desc: "Fair price guidance based on market data and material cost."
                },
                {
                  icon: <Heart className="h-8 w-8 text-primary" />,
                  title: "Artisan First",
                  desc: "Simplified dashboard built for ease of use by local creators."
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="font-headline text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Storytelling Section */}
        <section className="py-20 bg-primary text-white overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-4xl lg:text-5xl font-headline font-bold mb-6">Every craft has a story.</h2>
                <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed italic">
                  "This terracotta bowl isn't just clay. It carries the red dust of Khurja and the heat 
                  of a thousand-degree furnace, tempered by thirty years of my father's experience."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full border-2 border-white/30 overflow-hidden relative">
                    <Image src="https://picsum.photos/seed/face1/100/100" alt="Artisan" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold">Rajesh Kumar</p>
                    <p className="text-sm text-primary-foreground/60">Master Potter, Khurja</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative h-[400px] w-full">
                <Image 
                  src="/home-page/potter-khurja.jpeg" 
                  alt="Artisan Workshop" 
                  fill 
                  className="object-cover rounded-[50px] shadow-2xl border-4 border-white/10"
                  data-ai-hint="pottery workshop"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <Link href="/" className="text-2xl font-headline font-bold text-primary tracking-tight">Virasya</Link>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Empowering traditional artisans with modern AI tools.
              </p>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <Link href="/marketplace" className="hover:text-primary">Marketplace</Link>
              <Link href="/dashboard" className="hover:text-primary">Artisan Hub</Link>
              <Link href="/about" className="hover:text-primary">Our Vision</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2024 Virasya. Made with heart for heritage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
