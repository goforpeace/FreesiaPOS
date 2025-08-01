
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/web/Header";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Bolt, Truck, RefreshCw, MessageSquare } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Product, ProductVariant, SelectedVariant } from "@/lib/types";
import * as fbp from '@/lib/fpixel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ProductDetailsClient({ product }: { product: Product }) {
    const router = useRouter();
    const { addItem } = useCart();
    
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
    const [displayImages, setDisplayImages] = useState<string[]>([]);

    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
 
    useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        const handleSelect = () => setCurrent(api.selectedScrollSnap());
        api.on("select", handleSelect);
        return () => api.off("select", handleSelect);
    }, [api]);

    useEffect(() => {
        if (product) {
            // Set initial variant and images
            const initialVariant = product.variants?.[0];
            setSelectedVariant(initialVariant);
            setDisplayImages(initialVariant?.imageUrls || product.imageUrls || []);

            // Facebook Pixel: ViewContent event
            fbp.event('ViewContent', {
                content_name: product.name,
                content_ids: [product.id],
                content_type: 'product',
                value: product.discountedPrice || product.sellPrice,
                currency: 'BDT',
            });
        }
    }, [product]);
    
    useEffect(() => {
        // Update images when variant changes
        if (selectedVariant) {
            setDisplayImages(selectedVariant.imageUrls);
        } else if (product) {
            setDisplayImages(product.imageUrls || []);
        }
        // Reset carousel to first slide
        api?.scrollTo(0, true);
    }, [selectedVariant, product, api]);


    const handleAddToCart = () => {
        if (!product) return;
        const variantToSave: SelectedVariant | undefined = selectedVariant ? {
            color: selectedVariant.color,
            imageUrl: selectedVariant.imageUrls[0]
        } : undefined;
        addItem(product, variantToSave);
    }
    
    const handleOrderNow = () => {
        if (!product) return;
        const variantToSave: SelectedVariant | undefined = selectedVariant ? {
            color: selectedVariant.color,
            imageUrl: selectedVariant.imageUrls[0]
        } : undefined;
        addItem(product, variantToSave);
        router.push('/checkout');
    }
    
    const onThumbClick = (index: number) => {
        api?.scrollTo(index);
    };

    const hasDiscount = product.discountedPrice && product.discountedPrice > 0;
    const displayPrice = hasDiscount ? product.discountedPrice : product.sellPrice;
    const originalPrice = product.sellPrice;

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="container mx-auto py-12 px-4">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <Carousel className="w-full" setApi={setApi}>
                            <CarouselContent>
                                {(displayImages.length > 0 ? displayImages : ['https://placehold.co/600x600.png']).map((url, index) => (
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
                            {displayImages.length > 1 && displayImages.map((url, index) => (
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
                        <h1 className="text-3xl lg:text-4xl font-headline font-bold text-primary mb-4">{product.name}</h1>
                        <div className="flex items-baseline gap-2 mb-6">
                            <p className="text-3xl font-body font-bold text-accent">{formatCurrency(displayPrice as number)}</p>
                            {hasDiscount && (
                                <p className="text-xl font-body text-muted-foreground line-through">{formatCurrency(originalPrice)}</p>
                            )}
                        </div>

                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-sm font-medium mb-2">Color: <span className="font-bold">{selectedVariant?.color}</span></h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                         <button 
                                            key={variant.color} 
                                            onClick={() => setSelectedVariant(variant)} 
                                            className={cn("h-10 w-10 rounded-full border-2 p-0.5", selectedVariant?.color === variant.color ? 'border-primary' : 'border-border')}
                                            title={variant.color}
                                        >
                                            <Image src={variant.imageUrls[0]} alt={variant.color} width={36} height={36} className="rounded-full object-cover"/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <Card className="mb-8 bg-secondary/30">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">Product Specification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm text-foreground/80 font-body">
                                    <p className="whitespace-pre-wrap">{product.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Button size="lg" className="w-full sm:w-auto" onClick={handleAddToCart} disabled={product.variants && product.variants.length > 0 && !selectedVariant}>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                            <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={handleOrderNow} disabled={product.variants && product.variants.length > 0 && !selectedVariant}>
                                <Bolt className="mr-2 h-5 w-5" />
                                Order Now
                            </Button>
                        </div>
                         <p className="text-sm font-medium text-primary mt-4">{product.quantity} units available</p>

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
