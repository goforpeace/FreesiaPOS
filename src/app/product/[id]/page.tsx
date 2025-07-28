

"use client";

import { useState, useEffect } from "react";
import { getProduct } from "@/lib/api";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/web/Header";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Bolt, Truck, RefreshCw, MessageSquare } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


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
                             <Skeleton className="h-40 w-full" />
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

                         <Card className="mt-8 bg-secondary/30">
                            <CardContent className="p-6 space-y-4">
                                <ul className="space-y-3 text-sm text-foreground/80">
                                    <li className="flex items-start gap-3">
                                        <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span>
                                            <span className="font-semibold">সারা দেশে ক্যাশ অন ডেলিভারি</span> / Cash On Delivery
                                            <br />
                                            <span className="font-semibold">২-৩ কর্ম দিবসের মধ্যে ডেলিভারি</span> / Delivery within 2-3 Working Days
                                        </span>
                                    </li>
                                     <li className="flex items-start gap-3">
                                        <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span>
                                            <span className="font-semibold">পণ্যে কোন সমস্যা থাকলে ফেরত দেওয়ার সুযোগ</span> / Easy Return Policy
                                        </span>
                                    </li>
                                </ul>
                                <Separator />
                                <div className="space-y-2">
                                     <h4 className="font-semibold flex items-center gap-3"><MessageSquare className="h-5 w-5 text-primary"/>এজেন্ট এর সাথে কথা বলুন / Talk to an agent</h4>
                                     <div className="flex items-center gap-4">
                                         <a href="https://wa.me/+8801920709034" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-600 hover:underline">
                                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M16.75 13.96c.25.13.41.2.52.28.14.1.25.21.35.34.1.13.15.25.15.35s-.03.23-.08.38c-.05.15-.13.28-.25.4s-.28.25-.48.35c-.2.1-.45.18-.75.18-.38 0-.78-.08-1.2-.23s-.8-.36-1.15-.6c-.35-.25-.7-.5-1.05-.8-.35-.3-.6-.58-.78-.83-.18-.25-.3-.48-.36-.68s-.08-.38-.08-.55c0-.2.06-.4.2-.55s.3-.28.5-.4c.2-.1.38-.14.55-.14.2 0 .4.04.58.13s.35.2.5.34c.15.14.25.3.34.5.08.2.13.38.13.55s-.05.3-.13.43c-.08.13-.2.25-.34.35s-.3.2-.48.25c-.18.06-.35.08-.5.08-.15 0-.3-.02-.43-.06s-.25-.1-.35-.18c-.1-.08-.18-.15-.25-.23-.06-.08-.1-.13-.13-.15-.02-.02-.03-.03-.03-.03s-.03-.03-.05-.05c-.3-.4-.5-.8-.5-1.2 0-.45.2-.85.6-1.2s.85-.5 1.2-.5c.2 0 .4.04.6.1.2.08.4.18.55.3.15.12.28.28.38.45s.15.35.15.53zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path></svg>
                                             <span>WhatsApp</span>
                                         </a>
                                         <a href="https://m.me/freesia.finds" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.438 8.638V24l4.038-2.24c1.082.314 2.232.484 3.424.484 6.627 0 12-4.974 12-11.133C24 4.974 18.627 0 12 0zm1.196 14.532l-2.957-3.23-6.195 3.23L11.025 8.02l3.078 3.245 6.073-3.245-6.98 6.472z"></path></svg>
                                             <span>Messenger</span>
                                         </a>
                                     </div>
                                </div>
                            </CardContent>
                         </Card>
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
