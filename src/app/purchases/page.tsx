"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyPurchasesPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // Redirect if buyer is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  // Fetch profile to verify role
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full" />
          <p className="text-primary font-medium">Loading your collection...</p>
        </div>
      </div>
    );
  }

  // Double check if buyer
  if (profile && profile.role !== 'buyer') {
    return (
      <div className="min-h-screen paper-texture">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-headline font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">This page is for buyers to track their heritage collection.</p>
          <Link href="/dashboard">
            <Button className="rounded-full">Go to Artisan Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <header className="mb-12">
          <h1 className="text-4xl font-headline font-bold mb-2">My Heritage Collection</h1>
          <p className="text-muted-foreground">Trace the history and stories of your authentic handcrafted acquisitions.</p>
        </header>

        <div className="bg-white rounded-[40px] shadow-sm p-12 text-center flex flex-col items-center">
          <div className="bg-secondary/30 p-10 rounded-full mb-8">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-headline font-bold mb-4">No acquisitions yet.</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
            Every handcrafted piece in our marketplace carries a piece of history. Start your journey by discovering unique treasures from master artisans.
          </p>
          <Link href="/marketplace">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg gap-2 shadow-lg">
              <ShoppingBag className="h-5 w-5" />
              Explore Marketplace
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Informational Section */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
            <h3 className="text-xl font-headline font-bold text-primary mb-4">Authenticity Guaranteed</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every purchase on Virasya comes with a verified heritage story generated using our AI tools and validated by the artisan's history.
            </p>
          </div>
          <div className="bg-accent/5 p-8 rounded-[32px] border border-accent/10">
            <h3 className="text-xl font-headline font-bold text-accent mb-4">Direct Impact</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By acquiring these crafts, you are providing direct economic support to traditional artisan communities and helping preserve endangered cultural practices.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary font-headline font-bold">Virasya</p>
          <p className="text-xs text-muted-foreground">Digitalizing heritage, one craft at a time.</p>
        </div>
      </footer>
    </div>
  );
}
