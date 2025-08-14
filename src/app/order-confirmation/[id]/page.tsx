

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
                                            {item.variant && <p className="text-xs text-muted-foreground">Color: {item.variant.color}</p>}
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

                <div className="mt-8 text-center">
                    <Separator className="my-6"/>
                    <p className="font-medium text-muted-foreground">প্রয়োজনে অর্ডারটির ছবি Save করে এজেন্ট এর সাথে কথা বলুন</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <a href="https://wa.me/+8801920709024" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-600 hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8"><path d="M16.75 13.96c.25.13.41.2.52.28.14.1.25.21.35.34.1.13.15.25.15.35s-.03.23-.08.38c-.05.15-.13.28-.25.4s-.28.25-.48.35c-.2.1-.45.18-.75.18-.38 0-.78-.08-1.2-.23s-.8-.36-1.15-.6c-.35-.25-.7-.5-1.05-.8-.35-.3-.6-.58-.78-.83-.18-.25-.3-.48-.36-.68s-.08-.38-.08-.55c0-.2.06-.4.2-.55s.3-.28.5-.4c.2-.1.38-.14.55-.14.2 0 .4.04.58.13s.35.2.5.34c.15.14.25.3.34.5.08.2.13.38.13.55s-.05.3-.13.43c-.08.13-.2.25-.34.35s-.3.2-.48.25c-.18.06-.35.08-.5.08-.15 0-.3-.02-.43-.06s-.25-.1-.35-.18c-.1-.08-.18-.15-.25-.23-.06-.08-.1-.13-.13-.15-.02-.02-.03-.03-.03-.03s-.03-.03-.05-.05c-.3-.4-.5-.8-.5-1.2 0-.45.2-.85.6-1.2s.85-.5 1.2-.5c.2 0 .4.04.6.1.2.08.4.18.55.3.15.12.28.28.38.45s.15.35.15.53zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path></svg>
                        </a>
                        <a href="https://m.me/freesia.finds" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.438 8.638V24l4.038-2.24c1.082.314 2.232.484 3.424.484 6.627 0 12-4.974 12-11.133C24 4.974 18.627 0 12 0zm1.196 14.532l-2.957-3.23-6.195 3.23L11.025 8.02l3.078 3.245 6.073-3.245-6.98 6.472z"></path></svg>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
