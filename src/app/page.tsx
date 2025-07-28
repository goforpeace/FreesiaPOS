
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/web/Header";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";


export default function WebHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getProducts();
        setProducts(allProducts.filter(p => !p.isRejected && p.quantity > 0));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 4);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gradient-to-r from-primary via-purple-500 to-accent text-white flex items-center justify-center text-center">
             <div className="absolute inset-0 bg-black/30"></div>
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
            <h2 className="text-4xl font-headline text-center text-primary mb-12">New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {loading ? (
                    [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : (
                    newArrivals.map(product => <ProductCard key={product.id} product={product} />)
                )}
            </div>
        </section>
        
        {/* All Products Section */}
        <section id="all-products" className="py-16 px-4 md:px-8 bg-secondary/30">
            <h2 className="text-4xl font-headline text-center text-primary mb-12">All Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                 {loading ? (
                    [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : (
                    products.map(product => <ProductCard key={product.id} product={product} />)
                )}
            </div>
        </section>
      </main>
      <footer className="bg-sidebar text-sidebar-foreground py-8 px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Freesia Finds. All rights reserved.</p>
        <p className="italic mt-2">Because you deserve what's rare!</p>
      </footer>
    </div>
  );
}

const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group overflow-hidden">
        <Link href={`/products/${product.id}`}>
            <CardContent className="p-0">
                 <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                        src={product.imageUrl || 'https://placehold.co/400x400.png'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint="product image"
                    />
                </div>
                <div className="p-4 border-t">
                    <h3 className="text-lg font-headline font-semibold text-primary truncate">{product.name}</h3>
                    <p className="text-muted-foreground mt-2 font-bold text-accent">{formatCurrency(product.sellPrice)}</p>
                </div>
            </CardContent>
        </Link>
        <CardFooter className="p-4 pt-0">
             <Button className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
            </Button>
        </CardFooter>
    </Card>
);

const ProductCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Skeleton className="w-full aspect-square" />
        <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);
