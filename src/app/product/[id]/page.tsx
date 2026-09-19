"use client";

import { use, useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sparkles, ShieldCheck, Heart, ShoppingBag, Share2, Globe, Loader2, MessageSquare, Send } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { askProductAI } from '@/ai/flows/product-qa-flow';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading } = useDoc<Product>(productRef);

  const artisanRef = useMemoFirebase(() => {
    if (!db || !product?.artisanId) return null;
    return doc(db, 'userProfiles', product.artisanId);
  }, [db, product?.artisanId]);

  const { data: artisanProfile } = useDoc(artisanRef);

  const handleAskAI = async (question: string) => {
    if (!product) return;
    setIsAiLoading(true);
    setAiAnswer(null);
    try {
      const response = await askProductAI({
        productName: product.productName,
        craftType: product.craftType,
        materials: product.materials,
        region: product.region,
        story: product.story,
        question
      });
      setAiAnswer(response.answer);
    } catch (error) {
      setAiAnswer("I'm sorry, I encountered an error while processing your request. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col paper-texture">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-primary font-bold font-headline">Unveiling heritage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col paper-texture">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-headline font-bold mb-4">Craft Not Found</h1>
          <p className="text-muted-foreground mb-8">This unique piece may have already found a home or is no longer listed.</p>
          <Link href="/marketplace">
            <Button className="rounded-full px-8">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const artisanName = artisanProfile?.name || product.artisanName || 'Authentic Artisan';
  const artisanPhoto = artisanProfile?.profilePhotoUrl || `https://picsum.photos/seed/${product.artisanId}/100/100`;

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 lg:py-16 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[60px] overflow-hidden shadow-2xl bg-white border-8 border-white">
              <Image 
                src={product.images?.[0] || "https://picsum.photos/seed/default/800/800"} 
                alt={product.productName} 
                fill 
                className="object-cover" 
              />
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full">{product.craftType}</Badge>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {product.region}
                </div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-headline font-bold mb-6 leading-tight">{product.productName}</h1>
              <div className="flex items-center gap-4 mb-8">
                <p className="text-4xl font-bold text-primary font-sans">₹{product.price}</p>
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-widest text-accent border-accent/30 bg-accent/5">Verified Heritage</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed text-xl font-body">
                {product.description}
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full relative overflow-hidden border-2 border-primary/20 bg-secondary">
                    <Image src={artisanPhoto} alt={artisanName} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Master Artisan</p>
                    <p className="text-xl font-headline font-bold text-primary">{artisanName}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-secondary/30 p-4 rounded-2xl">
                <p className="font-bold text-sm flex items-center gap-3">
                  <span className="text-muted-foreground uppercase text-xs tracking-wider">Materials:</span> 
                  {product.materials}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-10">
              <Button size="lg" className="flex-1 rounded-full h-16 gap-3 text-xl shadow-xl hover:shadow-2xl transition-all">
                <ShoppingBag className="h-6 w-6" /> Buy Heritage
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-16 w-16 p-0 border-2 border-primary/10 hover:border-primary/40">
                <Heart className="h-6 w-6" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-16 w-16 p-0 border-2 border-primary/10 hover:border-primary/40">
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="bg-white rounded-[50px] p-10 lg:p-14 shadow-xl border-none h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-headline font-bold">Craft Details</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Region of Origin</p>
                <p className="text-2xl font-headline font-bold text-primary">{product.region}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Inventory Status</p>
                <p className="text-2xl font-headline font-bold text-primary">{product.availableQuantity} units available</p>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white rounded-[50px] p-10 lg:p-14 shadow-xl h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/10 p-3 rounded-2xl">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-widest">Verified Craft Story</span>
            </div>
            <h2 className="text-4xl font-headline font-bold mb-8 italic">"The Soul of the Craft"</h2>
            <p className="text-2xl leading-relaxed text-white/90 font-headline italic">
              {product.story}
            </p>
          </div>
        </section>

        <section className="bg-secondary/30 rounded-[50px] p-12 text-center max-w-4xl mx-auto mb-24">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-headline font-bold mb-4">Want to know more about this craft?</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Our AI can answer questions about the techniques, history, and care instructions for this authentic {product.craftType}.</p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
             <Button 
                variant="outline" 
                className="rounded-full h-12 px-8 border-primary/20 bg-white hover:bg-primary hover:text-white transition-colors"
                onClick={() => handleAskAI("How do I properly care for this handcrafted piece?")}
                disabled={isAiLoading}
              >
               How to care for this piece?
             </Button>
             <Button 
                variant="outline" 
                className="rounded-full h-12 px-8 border-primary/20 bg-white hover:bg-primary hover:text-white transition-colors"
                onClick={() => handleAskAI(`Tell me about the history and tradition of ${product.craftType} in ${product.region}.`)}
                disabled={isAiLoading}
              >
               History of {product.craftType}
             </Button>
             
             <Dialog>
               <DialogTrigger asChild>
                 <Button className="rounded-full h-12 px-8 shadow-lg gap-2">
                   <MessageSquare className="h-4 w-4" />
                   Ask Virasya AI
                 </Button>
               </DialogTrigger>
               <DialogContent className="rounded-[40px] p-8 border-none shadow-2xl">
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-headline text-primary">Chat with Heritage AI</DialogTitle>
                   <DialogDescription>Ask anything about the {product.productName}.</DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 mt-4">
                   <div className="flex gap-2">
                     <Input 
                        placeholder="e.g. Is this material eco-friendly?" 
                        value={customQuestion} 
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="rounded-full h-12"
                        onKeyDown={(e) => e.key === 'Enter' && handleAskAI(customQuestion)}
                     />
                     <Button 
                        size="icon" 
                        className="rounded-full h-12 w-12 shrink-0" 
                        onClick={() => handleAskAI(customQuestion)}
                        disabled={isAiLoading || !customQuestion}
                      >
                       <Send className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               </DialogContent>
             </Dialog>
          </div>

          {(isAiLoading || aiAnswer) && (
            <div className="bg-white rounded-3xl p-8 text-left border border-primary/10 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-primary uppercase text-xs tracking-widest">AI Expert Insights</span>
              </div>
              {isAiLoading ? (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-muted-foreground italic">Gathering heritage knowledge...</p>
                </div>
              ) : (
                <p className="text-lg leading-relaxed font-headline italic text-foreground/80">
                  "{aiAnswer}"
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t py-16">
         <div className="container mx-auto px-4 text-center">
            <p className="text-2xl font-headline font-bold text-primary mb-2">Virasya</p>
            <p className="text-muted-foreground">Authentic Art. Digital Heart. Worldwide Heritage.</p>
         </div>
      </footer>
    </div>
  );
}
