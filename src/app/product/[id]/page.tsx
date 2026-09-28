"use client";

import { use, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sparkles, ShieldCheck, Heart, ShoppingBag, Share2, Globe, Loader2, MessageSquare, Send, Film } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Product } from '@/lib/types';
import { CURATED_HERITAGE_PRODUCTS } from '@/lib/curated-products';
import Link from 'next/link';
import { askProductAI } from '@/ai/flows/product-qa-flow';
import { ProductReelModal } from '@/components/ProductReelModal';
import { reelAudioEngine } from '@/components/reel/audioEngine';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  let id = '';
  if (params) {
    if (typeof (params as any).then === 'function') {
      const resolved = use(params as Promise<{ id: string }>);
      id = resolved?.id || '';
    } else {
      id = (params as { id: string })?.id || '';
    }
  }
  const db = useFirestore();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [lastAskedQuestion, setLastAskedQuestion] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: dbProduct, isLoading } = useDoc<Product>(productRef);
  const curatedFallback = useMemo(() => CURATED_HERITAGE_PRODUCTS.find(p => p.id === id), [id]);
  const product = dbProduct || curatedFallback;

  // Background warm-up: fetch/store voiceover in persistent DB and IndexedDB storage
  useEffect(() => {
    if (!product) return;

    const existingVo = (product as any).voiceover?.['English'];
    if (existingVo?.audioBase64) {
      // Decode audio instantly from DB document into memory
      reelAudioEngine.loadDirectVoiceover(existingVo.audioBase64, existingVo.script, 'English');
    } else {
      // If voiceover is missing from DB for this listed product, generate and persist it to Firestore DB
      const generateAndPersist = async () => {
        try {
          const res = await fetch('/api/voiceover/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productName: product.productName,
              artisanName: product.artisanName,
              craftType: product.craftType,
              region: product.region,
              materials: product.materials,
              story: product.story,
              description: product.description,
              language: 'English',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.audioBase64) {
              // Cache into audio engine & IndexedDB
              reelAudioEngine.loadDirectVoiceover(data.audioBase64, data.script, 'English');

              // If product is in Firestore database, write voiceover payload back to product doc
              if (db && product.id && !id.startsWith('curated-')) {
                const docRef = doc(db, 'products', product.id);
                setDocumentNonBlocking(docRef, {
                  voiceover: {
                    English: {
                      audioBase64: data.audioBase64,
                      mimeType: data.mimeType || 'audio/wav',
                      script: data.script,
                      language: 'English',
                      updatedAt: new Date().toISOString(),
                    }
                  }
                }, { merge: true });
              }
            }
          }
        } catch (err) {
          console.warn('Voiceover auto-sync note:', err);
        }
      };

      generateAndPersist();
    }
  }, [product, db, id]);

  const artisanRef = useMemoFirebase(() => {
    if (!db || !product?.artisanId) return null;
    return doc(db, 'userProfiles', product.artisanId);
  }, [db, product?.artisanId]);

  const { data: artisanProfile } = useDoc(artisanRef);

  const handleAskAI = async (question: string) => {
    if (!product || !question.trim()) return;
    const trimmedQuestion = question.trim();
    setIsDialogOpen(false);
    setLastAskedQuestion(trimmedQuestion);
    setIsAiLoading(true);
    setAiAnswer(null);
    try {
      const response = await askProductAI({
        productName: product.productName,
        craftType: product.craftType,
        materials: product.materials,
        region: product.region,
        story: product.story,
        question: trimmedQuestion
      });
      setAiAnswer(response.answer);
      setCustomQuestion("");
    } catch (error) {
      setAiAnswer("I'm sorry, I encountered an error while retrieving heritage insights. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading && !curatedFallback) {
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
      
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-16 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 lg:mb-24">
          <div className="space-y-4 sm:space-y-6">
            <div className="relative aspect-square rounded-[28px] sm:rounded-[48px] lg:rounded-[60px] overflow-hidden shadow-2xl bg-white border-4 sm:border-8 border-white">
              <Image 
                src={product.images?.[0] || "https://picsum.photos/seed/default/800/800"} 
                alt={product.productName} 
                fill 
                className="object-cover" 
              />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-6 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-none px-3.5 py-1 rounded-full text-xs font-semibold">{product.craftType}</Badge>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {product.region}
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-headline font-bold mb-3 sm:mb-6 leading-tight">{product.productName}</h1>
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
                <p className="text-2xl sm:text-4xl font-bold text-primary font-sans">₹{product.price}</p>
                <Badge variant="outline" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent border-accent/30 bg-accent/5">Verified Heritage</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-xl font-body">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-full relative overflow-hidden border-2 border-primary/20 bg-secondary shrink-0">
                    <Image src={artisanPhoto} alt={artisanName} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Master Artisan</p>
                    <p className="text-base sm:text-xl font-headline font-bold text-primary">{artisanName}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 bg-secondary/30 p-3.5 sm:p-4 rounded-2xl">
                <p className="font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="text-muted-foreground uppercase text-[10px] sm:text-xs tracking-wider">Materials:</span> 
                  {product.materials}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 sm:gap-4 pt-4 sm:pt-10">
              <Button size="lg" className="flex-1 rounded-full h-12 sm:h-16 gap-2 sm:gap-3 text-base sm:text-xl shadow-xl font-bold">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" /> Buy Heritage
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-12 w-12 sm:h-16 sm:w-16 p-0 border-2 border-primary/10 shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setIsReelModalOpen(true)}
                title="Create & Share AI Reel"
                className="rounded-full h-12 sm:h-16 px-4 sm:px-6 border-2 border-primary/20 bg-amber-500/10 hover:bg-amber-500/20 text-primary gap-2 font-bold shrink-0"
              >
                <Film className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline">AI Reel</span>
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12 lg:mb-24">
          <div className="bg-white rounded-[28px] sm:rounded-[50px] p-6 sm:p-10 lg:p-14 shadow-xl border-none h-full">
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
             
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                        placeholder="e.g. Is this product eco-friendly?" 
                        value={customQuestion} 
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="rounded-full h-12 px-5"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customQuestion.trim()) {
                            e.preventDefault();
                            handleAskAI(customQuestion);
                          }
                        }}
                     />
                     <Button 
                        size="icon" 
                        className="rounded-full h-12 w-12 shrink-0" 
                        onClick={() => handleAskAI(customQuestion)}
                        disabled={isAiLoading || !customQuestion.trim()}
                      >
                       <Send className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               </DialogContent>
             </Dialog>
          </div>

          {(isAiLoading || aiAnswer) && (
            <div className="bg-white rounded-3xl p-8 text-left border border-primary/10 shadow-md animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-bold text-primary uppercase text-xs tracking-widest">AI Heritage Insights</span>
                </div>
                {lastAskedQuestion && (
                  <span className="text-xs font-medium text-muted-foreground italic truncate max-w-md">
                    Q: "{lastAskedQuestion}"
                  </span>
                )}
              </div>
              {isAiLoading ? (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-muted-foreground italic">Consulting master craft knowledge...</p>
                </div>
              ) : (
                <p className="text-lg leading-relaxed font-headline italic text-foreground/90">
                  "{aiAnswer}"
                </p>
              )}
            </div>
          )}
        </section>

        {product && (
          <ProductReelModal
            product={product}
            artisanName={artisanName}
            artisanPhoto={artisanPhoto}
            isOpen={isReelModalOpen}
            onClose={() => setIsReelModalOpen(false)}
          />
        )}
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
