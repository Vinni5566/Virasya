"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { useUser } from '@/firebase';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/auth');
    }
  };

  return (
    <Link href={`/product/${product.id}`} onClick={handleCardClick}>
      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[32px] bg-white">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.images?.[0] || "https://picsum.photos/seed/default/600/800"}
            alt={product.productName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            data-ai-hint="artisan craft"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="bg-white/95 text-primary hover:bg-white/100 backdrop-blur-md border-none shadow-sm px-4 py-1.5 rounded-full font-bold tracking-tight">
              {product.craftType}
            </Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
             <span className="text-white text-xs font-bold uppercase tracking-widest">{product.craftStyle || 'Handcrafted'}</span>
             <div className="bg-primary p-2 rounded-full text-white shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
               <ArrowRight className="h-5 w-5" />
             </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-headline text-xl font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {product.productName}
            </h3>
            <span className="font-bold text-primary text-xl font-sans">₹{product.price}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium mb-4">
            <MapPin className="h-3 w-3 text-primary" />
            {product.region}
          </div>
          <div className="flex items-center justify-between border-t border-primary/5 pt-4">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                 <User className="h-3 w-3 text-primary" />
               </div>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{product.artisanName || 'Artisan'}</span>
            </div>
            <div className="text-accent text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest">
              View Story
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
