
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
             <Link 
              href="https://www.facebook.com/freesia.finds"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white h-14 w-14 rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 animate-pulse"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                <span className="sr-only">Visit Facebook Page</span>
            </Link>
        </div>
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
            <Link 
              href="https://wa.me/+8801920709034"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white h-14 w-14 rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 animate-pulse"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.687-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.203 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
                <span className="sr-only">Contact on WhatsApp</span>
            </Link>
        </div>
      </ClientOnly>
       <footer className="bg-card text-card-foreground py-8 px-4 text-center">
        <p className="text-sm text-foreground">&copy; {new Date().getFullYear()} Freesia Finds. All rights reserved.</p>
        <p className="italic mt-2 text-sm text-muted-foreground">Because you deserve what's rare!</p>
      </footer>
    </div>
  );
}
