

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSale } from "@/lib/api";
import { notFound, useParams } from "next/navigation";
import { Header } from "@/components/web/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/lib/types";
import { CheckCircle2, ImageDown } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import * as fbp from '@/lib/fpixel';
import html2canvas from "html2canvas";

export default function OrderConfirmationPage() {
    const params = useParams();
    const id = params.id as string;
    const [sale, setSale] = useState<Sale | null | undefined>(undefined);
    const confirmationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(id) {
            const fetchSale = async () => {
                const fetchedSale = await getSale(id);
                setSale(fetchedSale);

                if (fetchedSale) {
                    // Facebook Pixel: Purchase event
                    fbp.event('Purchase', {
                        value: fetchedSale.total,
                        currency: 'BDT',
                        content_ids: fetchedSale.items.map(item => item.productId),
                        content_type: 'product',
                        num_items: fetchedSale.items.reduce((acc, item) => acc + item.quantity, 0),
                        order_id: fetchedSale.id,
                    });
                }
            }
            fetchSale();
        }
    }, [id]);

    const handleSaveAsImage = async () => {
        const element = confirmationRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
             useCORS: true,
             scale: 2, 
        });
        const data = canvas.toDataURL('image/png');
        const link = document.createElement('a');

        link.href = data;
        link.download = `order-confirmation-${sale?.id}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (sale === undefined) {
        return (
             <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    if (sale === null) {
        notFound();
    }

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="container mx-auto py-12 px-4 max-w-3xl">
                <div ref={confirmationRef} className="bg-background p-2">
                    <Card className="text-center">
                        <CardHeader className="items-center">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4"/>
                            <CardTitle className="text-3xl font-headline text-primary">Thank You For Your Order!</CardTitle>
                            <CardDescription>
                                Your order has been placed successfully. A confirmation will be sent to your phone.
                            </CardDescription>
                            <p className="font-semibold text-lg pt-2">Order #{sale.id}</p>
                        </CardHeader>
                        <CardContent className="text-left">
                            <Separator className="my-4" />
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h3 className="font-semibold mb-1">Shipping Address</h3>
                                    <p className="text-muted-foreground">{sale.customerName}</p>
                                    <p className="text-muted-foreground">{sale.customerPhone}</p>
                                    <p className="text-muted-foreground">{sale.customerAddress}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-semibold mb-1">Order Summary</h3>
                                    <p className="text-muted-foreground">Order Date: {format(new Date(sale.date), "dd MMM, yyyy")}</p>
                                    <p className="text-muted-foreground">Payment Method: Cash on Delivery</p>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                {sale.items.map(item => (
                                    <div key={item.productId} className="flex items-center gap-4 text-sm">
                                        <Image src={item.imageUrl || 'https://placehold.co/64x64.png'} alt={item.productName} width={48} height={48} className="rounded-md" />
                                        <div className="flex-grow">
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(sale.subtotal)}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatCurrency(sale.shippingCost)}</span>
                                </div>
                                {sale.discount > 0 && (
                                     <div className="flex justify-between text-destructive">
                                        <span className="text-muted-foreground">Discount {sale.couponCode && `(${sale.couponCode})`}</span>
                                        <span>- {formatCurrency(sale.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total</span>
                                    <span>{formatCurrency(sale.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                    <Button variant="outline" onClick={handleSaveAsImage} className="w-full sm:w-auto">
                        <ImageDown className="mr-2 h-4 w-4" />
                        Save as Image
                    </Button>
                </div>
            </main>
        </div>
    );
}
