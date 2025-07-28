

"use client";

import { useState, useEffect } from "react";
import { getProduct } from "@/lib/api";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/web/Header";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Bolt } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils";


export default function PublicProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null | undefined>(undefined);
    const { addItem } = useCart();
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
 
    useEffect(() => {
        if (!api) {
            return
        }
    
        setCurrent(api.selectedScrollSnap())
    
        const handleSelect = () => {
            setCurrent(api.selectedScrollSnap())
        }

        api.on("select", handleSelect)
    
        return () => {
            api.off("select", handleSelect)
        }
    }, [api])


    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                const fetchedProduct = await getProduct(id);
                if (!fetchedProduct || fetchedProduct.isRejected || fetchedProduct.quantity <= 0) {
                    setProduct(null);
                } else {
                    setProduct(fetchedProduct);
                }
            };
            fetchProduct();
        }
    }, [id]);

    const handleOrderNow = () => {
        if (!product) return;
        addItem(product);
        router.push('/checkout');
    }

    if (product === undefined) {
        return (
            <div className="bg-background min-h-screen">
                <Header />
                <main className="container mx-auto py-12 px-4">
                     <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                             <Skeleton className="aspect-square w-full rounded-lg" />
                             <div className="grid grid-cols-5 gap-2 mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="aspect-square w-full rounded-md" />
                                ))}
                             </div>
                        </div>
                        <div className="space-y-4">
                             <Skeleton className="h-12 w-3/4" />
                             <Skeleton className="h-8 w-1/4" />
                             <Skeleton className="h-24 w-full" />
                             <Skeleton className="h-12 w-1/2" />
                        </div>
                     </div>
                </main>
            </div>
        )
    }

    if (product === null) {
        notFound();
    }
    
    const onThumbClick = (index: number) => {
        api?.scrollTo(index);
    };

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="container mx-auto py-12 px-4">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <Carousel className="w-full" setApi={setApi}>
                            <CarouselContent>
                                {(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : ['https://placehold.co/600x600.png']).map((url, index) => (
                                    <CarouselItem key={index}>
                                        <div className="aspect-square relative w-full rounded-lg overflow-hidden border">
                                            <Image
                                                src={url || 'https://placehold.co/600x600.png'}
                                                alt={`${product.name} image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="product image"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {(product.imageUrls && product.imageUrls.length > 1) && product.imageUrls.map((url, index) => (
                                <button key={index} onClick={() => onThumbClick(index)} className={cn("overflow-hidden rounded-md aspect-square relative border-2", current === index ? "border-primary" : "border-transparent")}>
                                     <Image
                                        src={url || 'https://placehold.co/100x100.png'}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="product image"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-4">{product.name}</h1>
                        <p className="text-2xl font-body font-semibold text-accent mb-6">{formatCurrency(product.sellPrice)}</p>
                        <div className="prose lg:prose-lg text-foreground/80 font-body mb-8">
                           <p className="whitespace-pre-wrap">{product.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button size="lg" onClick={() => addItem(product)}>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                            <Button size="lg" variant="outline" className="w-full md:w-auto" onClick={handleOrderNow}>
                                <Bolt className="mr-2 h-5 w-5" />
                                Order Now
                            </Button>
                        </div>
                         <p className="text-sm text-muted-foreground mt-4">{product.quantity} units available</p>
                    </div>
                </div>
            </main>
             <footer className="bg-sidebar text-sidebar-foreground py-8 px-4 text-center mt-16">
                <p>&copy; {new Date().getFullYear()} Freesia Finds. All rights reserved.</p>
                <p className="italic mt-2">Because you deserve what's rare!</p>
            </footer>
        </div>
    );
}
