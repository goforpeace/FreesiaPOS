
"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Header } from "@/components/web/Header";
import { ProductCard, ProductCardSkeleton } from "@/components/web/HomePageContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function JewelryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getProducts();
        setProducts(allProducts.filter(p => p.isJewelry && !p.isRejected));
      } catch (error) {
        console.error("Failed to fetch jewelry:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto py-12 px-4">
         <div className="mb-8">
            <Button variant="link" asChild className="px-0">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-headline text-primary">Jewelry Collection</h1>
          <p className="mt-2 text-muted-foreground">
            Explore our exquisite collection of jewelry.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
          {loading ? (
            [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              No jewelry available at the moment. Please check back later!
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
