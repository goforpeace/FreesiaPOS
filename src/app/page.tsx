
"use client";

import { Suspense } from 'react';
import { HomePageContent } from '@/components/web/HomePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/web/Header';
import { ClientOnly } from '@/components/ui/client-only';
import Link from 'next/link';

function HomePageSkeleton() {
    return (
        <>
            <section className="py-16 px-4 md:px-8">
                <div className="text-center mb-12">
                     <Skeleton className="h-12 w-48 mx-auto" />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            </section>
             <section className="py-16 px-4 md:px-8">
                <div className="text-center mb-12">
                     <Skeleton className="h-12 w-48 mx-auto" />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            </section>
        </>
    );
}

const ProductCardSkeleton = () => (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
        <Skeleton className="w-full aspect-square bg-muted" />
        <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
            <Skeleton className="h-5 w-1/2 bg-muted" />
        </div>
        <div className="p-4 pt-0 flex flex-col gap-2">
            <Skeleton className="h-10 w-full bg-muted" />
            <Skeleton className="h-10 w-full bg-muted" />
        </div>
    </div>
);


export default function WebHomePage() {
  return (
    <div className="bg-background min-h-screen">
       <Header />
       <Suspense fallback={<HomePageSkeleton />}>
            <HomePageContent />
       </Suspense>
       <ClientOnly>
        <Link 
          href="https://www.facebook.com/freesia.finds"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white h-14 w-14 rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 animate-pulse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
            <span className="sr-only">Visit Facebook Page</span>
        </Link>
      </ClientOnly>
       <footer className="bg-card text-card-foreground py-8 px-4 text-center">
        <p className="text-sm text-foreground">&copy; {new Date().getFullYear()} Freesia Finds. All rights reserved.</p>
        <p className="italic mt-2 text-sm text-muted-foreground">Because you deserve what's rare!</p>
      </footer>
    </div>
  );
}
