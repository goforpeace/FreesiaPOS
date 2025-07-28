
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import { Header } from "@/components/web/Header";
import { ReviewsSection } from "@/components/web/ReviewsSection";
import { getProducts, getReviews } from "@/lib/api";
import type { Product, Review } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Bolt } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";


export default function WebHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allProducts, allReviews] = await Promise.all([
          getProducts(),
          getReviews()
        ]);
        setProducts(allProducts.filter(p => !p.isRejected && p.quantity > 0));
        setReviews(allReviews);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery]);

  const newArrivals = filteredProducts.filter(p => p.isNewArrival);
  const offerSaleProducts = filteredProducts.filter(p => p.isOfferSale);


  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] text-white flex items-center justify-center text-center">
             <Image
                src="https://placehold.co/1600x900.png"
                alt="Hero banner"
                fill
                className="object-cover z-0"
                data-ai-hint="fashion store interior"
             />
             <div className="absolute inset-0 bg-black/40"></div>
             <div className="relative z-10 p-4">
                <h1 className="text-5xl md:text-7xl font-headline font-bold">Find Your Rare Beauty</h1>
                <p className="mt-4 text-xl font-body max-w-2xl mx-auto">Discover exclusive collections and timeless pieces, because you deserve what's rare.</p>
                <Button className="mt-8 bg-white text-primary hover:bg-white/90" size="lg" asChild>
                    <Link href="#all-products">Shop Now</Link>
                </Button>
            </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-16 px-4 md:px-8">
            <div className="text-center mb-12">
                <div className="inline-block bg-primary/20 text-primary font-semibold uppercase tracking-wider py-2 px-4 rounded-full text-2xl">
                    New Arrivals
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {loading ? (
                    [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : newArrivals.length > 0 ? (
                    newArrivals.map(product => <ProductCard key={product.id} product={product} />)
                ) : (
                    <p className="text-center col-span-full text-muted-foreground">No new arrivals to show right now.</p>
                )}
            </div>
        </section>

        {/* Offer Sale Section */}
        {offerSaleProducts.length > 0 && (
          <section className="py-16 px-4 md:px-8">
              <div className="text-center mb-12">
                 <div className="inline-block bg-primary/20 text-primary font-semibold uppercase tracking-wider py-2 px-4 rounded-full text-2xl">
                    Offer Sale
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                  {loading ? (
                      [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                  ) : (
                      offerSaleProducts.map(product => <ProductCard key={product.id} product={product} />)
                  )}
              </div>
          </section>
        )}

        {/* Reviews Section */}
        <ReviewsSection reviews={reviews} />
        
        {/* All Products Section */}
        <section id="all-products" className="py-16 px-4 md:px-8">
            <div className="text-center mb-12">
                 <div className="inline-block bg-primary/20 text-primary font-semibold uppercase tracking-wider py-2 px-4 rounded-full text-2xl">
                    All Products
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                 {loading ? (
                    [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : (
                    filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
                )}
            </div>
        </section>
      </main>
      <footer className="bg-card text-card-foreground py-8 px-4 text-center">
        <p className="text-sm text-foreground">&copy; {new Date().getFullYear()} Freesia Finds. All rights reserved.</p>
        <p className="italic mt-2 text-sm text-muted-foreground">Because you deserve what's rare!</p>
      </footer>
    </div>
  );
}

const ProductCard = ({ product }: { product: Product }) => {
    const { addItem } = useCart();
    const router = useRouter();

    const handleOrderNow = () => {
        addItem(product);
        router.push('/checkout');
    }
    
    const hasDiscount = product.discountedPrice && product.discountedPrice > 0;
    const displayPrice = hasDiscount ? product.discountedPrice : product.sellPrice;
    const originalPrice = product.sellPrice;

    return (
        <Card className="group overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <Link href={`/product/${product.id}`}>
                <CardContent className="p-0">
                     <div className="relative aspect-square w-full overflow-hidden">
                        <Image
                            src={product.imageUrls?.[0] || 'https://placehold.co/400x400.png'}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            data-ai-hint="product image"
                        />
                    </div>
                    <div className="p-4 border-t border-border">
                        <h3 className="text-lg font-headline font-semibold text-card-foreground truncate">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                             <p className="font-semibold text-foreground text-lg">{formatCurrency(displayPrice as number)}</p>
                            {hasDiscount && (
                                <p className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Link>
            <CardFooter className="p-4 pt-0 mt-auto flex-col gap-2">
                 <Button className="w-full" variant="secondary" onClick={() => addItem(product)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                </Button>
                <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold" onClick={handleOrderNow}>
                    <Bolt className="mr-2 h-4 w-4" />
                    Order Now
                </Button>
            </CardFooter>
        </Card>
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
