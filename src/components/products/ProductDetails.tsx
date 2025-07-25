
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductDetails({ initialProduct }: { initialProduct: Product }) {
    const router = useRouter();
    const product = initialProduct;

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
                             <Image
                                alt={product.name}
                                className="aspect-square rounded-md object-cover w-full"
                                height="400"
                                src={product.imageUrl || 'https://placehold.co/400x400.png'}
                                width="400"
                                data-ai-hint="product image"
                            />
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
