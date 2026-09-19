"use client";

import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Product } from '@/lib/types';

const CATEGORIES = [
  'All', 
  'Pottery', 
  'Textiles', 
  'Jewelry', 
  'Woodwork', 
  'Hand painting', 
  'Paper Mache', 
  'Metalwork', 
  'Leatherwork', 
  'Bamboo & Cane'
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const db = useFirestore();

  // Fetch only Published products for the marketplace
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('status', '==', 'Published'));
  }, [db]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.craftType === selectedCategory;
      const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  // Sort logic (simple client-side sort for prototype)
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === 'Price: Low to High') return sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High to Low') return sorted.sort((a, b) => b.price - a.price);
    return sorted; 
  }, [filteredProducts, sortBy]);

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-5xl font-headline font-bold mb-4">Discover Heritage</h1>
          <p className="text-xl text-muted-foreground">Authentic handcrafted art curated for the modern soul.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 space-y-10">
            <div>
              <h3 className="text-lg font-headline font-bold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Categories
              </h3>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-primary/10">
              <h3 className="text-lg font-headline font-bold mb-4">Regions</h3>
              <div className="flex flex-wrap gap-2">
                {['Rajasthan', 'Gujarat', 'UP', 'Bihar', 'Assam'].map(region => (
                  <Badge key={region} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors py-1.5 px-3 rounded-full border-primary/20">
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search by craft, region, or keyword..." 
                  className="pl-12 h-14 rounded-2xl shadow-sm border-none bg-white text-lg focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="lg:hidden gap-2 h-14 rounded-2xl bg-white border-none shadow-sm">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-14 text-sm bg-white shadow-sm border-none rounded-2xl px-6">
                    {sortBy} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border-none shadow-xl">
                  {['Newest', 'Price: Low to High', 'Price: High to Low', 'Popularity'].map(sort => (
                    <DropdownMenuItem key={sort} onClick={() => setSortBy(sort)} className="cursor-pointer font-body">
                      {sort}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white/50 rounded-[40px] shadow-sm">
                <p className="text-xl text-muted-foreground font-headline">No crafts found in this segment.</p>
                <Button variant="link" onClick={() => {setSelectedCategory('All'); setSearchQuery('');}} className="mt-2 text-primary text-lg">
                  View all collections
                </Button>
              </div>
            )}
          </section>
        </div>
        {/* AI Recommendations Section */}
        <section className="mb-16 bg-white/50 p-8 rounded-[40px] border-none shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-headline font-bold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-secondary/20 animate-pulse rounded-[32px]" />)
            ) : sortedProducts.slice(0, 3).map(p => (
              <ProductCard key={`rec-${p.id}`} product={p} />
            ))}
            {!isLoading && sortedProducts.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground italic">No recommendations yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
