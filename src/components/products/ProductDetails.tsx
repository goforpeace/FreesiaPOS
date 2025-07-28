
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductVariant } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function ProductDetails({ initialProduct }: { initialProduct: Product }) {
    const router = useRouter();
    const product = initialProduct;

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);

    const displayImages = selectedVariant?.imageUrls || product.imageUrls;

    return (
        <>
            <Header title="Product Details">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Button>
            </Header>
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                             <Carousel className="w-full max-w-sm mx-auto">
                                <CarouselContent>
                                    {(displayImages.length > 0 ? displayImages : ['https://placehold.co/400x400.png']).map((url, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-square relative">
                                                <Image
                                                    alt={`${product.name} image ${index + 1}`}
                                                    className="rounded-md object-cover"
                                                    src={url || 'https://placehold.co/400x400.png'}
                                                    fill
                                                    data-ai-hint="product image"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <CardTitle className="text-4xl font-headline">{product.name}</CardTitle>
                            <div className="flex items-center gap-2">
                                {product.isRejected ? (
                                    <Badge variant="destructive">Rejected</Badge>
                                ) : product.quantity > 0 ? (
                                    <Badge variant="secondary">In Stock</Badge>
                                ) : (
                                    <Badge variant="outline">Out of Stock</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                             {product.variants && product.variants.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Color: <span className="text-muted-foreground">{selectedVariant?.color}</span></h4>
                                    <div className="flex gap-2">
                                        {product.variants.map((variant) => (
                                            <button 
                                                key={variant.color} 
                                                onClick={() => setSelectedVariant(variant)} 
                                                className={`h-8 w-8 rounded-full border-2 ${selectedVariant?.color === variant.color ? 'border-primary' : 'border-border'}`}
                                                style={{ backgroundColor: variant.color.toLowerCase() }}
                                                title={variant.color}
                                            >
                                                <span className="sr-only">{variant.color}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="font-medium">Quantity in Stock:</div>
                                <div>{product.quantity}</div>

                                <div className="font-medium">Cost Price:</div>
                                <div>{formatCurrency(product.costPrice)}</div>
                                
                                <div className="font-medium">Selling Price:</div>
                                <div>{formatCurrency(product.sellPrice)}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
