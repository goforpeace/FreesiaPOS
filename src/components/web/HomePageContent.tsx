
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation'
import { ReviewsSection } from "@/components/web/ReviewsSection";
import { getProducts, getReviews, getBanners } from "@/lib/api";
import type { Product, Review, Banner } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Bolt, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BannerSlider = ({ banners }: { banners: Banner[] }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  return (
    <section className="relative h-[60vh] text-white flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] relative">
              <Image
                src={banner.imageUrl}
                alt="Hero banner"
                fill
                className="object-cover"
                data-ai-hint="fashion store interior"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 p-4">
        <h1 className="text-5xl md:text-7xl font-headline font-bold">Find Your Rare Beauty</h1>
        <p className="mt-4 text-xl font-body max-w-2xl mx-auto">Discover exclusive collections and timeless pieces, because you deserve what's rare.</p>
        <Button className="mt-8 bg-white text-primary hover:bg-white/90" size="lg" asChild>
          <Link href="#all-products">Shop Now</Link>
        </Button>
      </div>
    </section>
  );
};

const Ticker = () => {
  const tickerItems = [
    "Imported Premium Items",
    "Full Cash on Delivery - ক্যাশ অন ডেলিভারী",
    "Easy Return Policy",
  ];

  return (
    <div className="bg-primary text-primary-foreground sticky top-20 z-40">
      <div className="relative flex overflow-x-hidden">
        <div className="py-2 animate-marquee whitespace-nowrap">
          {tickerItems.map((item, index) => (
            <span key={index} className="text-sm font-semibold mx-4">{item}</span>
          ))}
        </div>
        <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap">
          {tickerItems.map((item, index) => (
            <span key={index} className="text-sm font-semibold mx-4">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const ProductSectionSlider = ({ products }: { products: Product[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: true }, 
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  
  const chunkedProducts = products.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/4) 
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] 
    }
    resultArray[chunkIndex].push(item)
    return resultArray
  }, [] as Product[][]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative max-w-7xl mx-auto">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {chunkedProducts.map((chunk, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 pl-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chunk.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
       <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-10 w-10 rounded-full shadow-md z-10 hidden md:flex" onClick={scrollPrev}>
        <ChevronLeft className="h-6 w-6"/>
      </Button>
      <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-10 w-10 rounded-full shadow-md z-10 hidden md:flex" onClick={scrollNext}>
        <ChevronRight className="h-6 w-6"/>
      </Button>
    </div>
  )
}

const SectionHeader = ({ title, id }: { title: string, id: string }) => (
    <div id={id} className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary relative inline-block">
            {title}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-accent/50 rounded-full"></span>
        </h2>
    </div>
)

export function HomePageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortOption, setSortOption] = useState("createdAt-desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allProducts, allReviews, allBanners] = await Promise.all([
          getProducts(),
          getReviews(),
          getBanners()
        ]);
        setProducts(allProducts.filter(p => p.quantity > 0 && !p.isRejected));
        setReviews(allReviews);
        setBanners(allBanners);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
          params.set('q', searchQuery);
      } else {
          params.delete('q');
      }
      router.replace(`/?${params.toString()}#all-products`, { scroll: false });
  }

  const filteredProducts = useMemo(() => {
    const query = searchParams.get('q') || '';
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [products, searchParams]);
  
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    if (sortOption) {
      const [key, order] = sortOption.split("-");
      sorted.sort((a, b) => {
        let valA: string | number | undefined;
        let valB: string | number | undefined;

        const getPrice = (p: Product) => p.discountedPrice && p.discountedPrice > 0 ? p.discountedPrice : p.sellPrice;

        if (key === 'createdAt') {
          valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        } else if (key === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (key === 'price') {
            valA = getPrice(a);
            valB = getPrice(b);
        }

        if (valA === undefined || valB === undefined) return 0;
        
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredProducts, sortOption]);

  const flashSaleProducts = products.filter(p => p.isFlashSale);
  const newSaleProducts = products.filter(p => p.isNewSale);

  return (
    <main>
      {/* Hero Section */}
      {loading ? (
          <Skeleton className="h-[60vh] w-full" />
      ) : banners.length > 0 ? (
          <BannerSlider banners={banners} />
      ) : (
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
      )}

      {/* Ticker Section */}
      <Ticker />

       <div className="relative bg-background">
         {/* Search Bar */}
        <section className="py-8 px-4 md:px-8 bg-muted/50">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Input 
                type="search" 
                placeholder="Search by product name..."
                className="w-full pr-12 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-primary">
                <Search className="h-6 w-6" />
              </Button>
            </div>
          </form>
        </section>

        {/* Flash Sale Section */}
        {flashSaleProducts.length > 0 && (
          <section id="flash-sales" className="py-16 px-4 md:px-8">
              <SectionHeader title="Flash Sales" id="flash-sales" />
              {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
                      {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                  </div>
              ) : (
                  <ProductSectionSlider products={flashSaleProducts} />
              )}
          </section>
        )}

        {/* New Sales Section */}
        <section id="new-sales" className="py-16 px-4 md:px-8">
            <SectionHeader title="New Sales" id="new-sales" />
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
                  {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : newSaleProducts.length > 0 ? (
                <ProductSectionSlider products={newSaleProducts} />
            ) : (
                <p className="text-center col-span-full text-muted-foreground">No new sales to show right now.</p>
            )}
        </section>
        
        {/* All Products Section */}
        <section id="all-products" className="py-16 px-4 md:px-8 bg-muted/20">
            <SectionHeader title="All Products" id="all-products" />
            <div className="max-w-7xl mx-auto mb-8 flex justify-end">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
                {loading ? (
                    [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : sortedProducts.length > 0 ? (
                    sortedProducts.map(product => <ProductCard key={product.id} product={product} />)
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">No products found for your search.</p>
                )}
            </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection reviews={reviews} />
      </div>
    </main>
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
        <Card className="group overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] h-full">
            <Link href={`/product/${product.id}`} className="flex flex-col h-full">
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
                    <div className="p-3 border-t border-border">
                        <h3 className="text-sm font-headline font-semibold text-card-foreground truncate">{product.name}</h3>
                        <div className="flex items-baseline gap-1.5 mt-1">
                             <p className="font-semibold text-foreground text-base">{formatCurrency(displayPrice as number)}</p>
                            {hasDiscount && (
                                <p className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice)}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-3 pt-0 mt-auto flex-col gap-2">
                     <Button className="w-full h-9 text-sm" variant="secondary" onClick={(e) => { e.preventDefault(); addItem(product); }}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                    </Button>
                    <Button className="w-full h-9 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold" onClick={(e) => { e.preventDefault(); handleOrderNow(); }}>
                        <Bolt className="mr-2 h-4 w-4" />
                        Order Now
                    </Button>
                </CardFooter>
            </Link>
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

    

    

    
