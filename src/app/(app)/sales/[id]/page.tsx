
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { getSale } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ImageDown, ArrowLeft } from "lucide-react";

export default function SaleDetailsPage({ params }: { params: { id: string } }) {
    const [sale, setSale] = useState<Sale | null | undefined>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setSale(getSale(params.id));
    }, [params.id]);


    if (sale === undefined) {
        notFound();
    }

    if (sale === null) {
        return (
            <>
                <Header title="Invoice" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </>
        )
    }
    
    const handleSaveAsImage = async () => {
        const element = invoiceRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
             useCORS: true,
             scale: 2, 
        });
        const data = canvas.toDataURL('image/png');
        const link = document.createElement('a');

        link.href = data;
        link.download = `invoice-${sale.id}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Header title={`Invoice`}>
                 <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sales
                </Button>
                <Button onClick={handleSaveAsImage} variant="outline" className="print:hidden">
                    <ImageDown className="mr-2 h-4 w-4" />
                    Save as Image
                </Button>
            </Header>
            <div className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg p-8 print:shadow-none print:p-0 print:m-0" id="invoice-printable" ref={invoiceRef}>
                <Card className="h-full flex flex-col shadow-none border-none">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Image 
                                    src="https://i.imgur.com/k7qYBOW.png" 
                                    alt="Freesia Finds Logo" 
                                    width={80} 
                                    height={80} 
                                    className="rounded-md"
                                    data-ai-hint="logo"
                                />
                                <p className="text-muted-foreground italic mt-2">Because you deserve what's rare!</p>
                            </div>
                            <div className="text-right">
                                <CardTitle className="mb-1 text-4xl font-bold font-headline text-primary">INVOICE</CardTitle>
                                <CardDescription>
                                    # {sale.id}
                                </CardDescription>
                                <CardDescription>
                                    Date: {format(new Date(sale.date), "dd MMMM, yyyy")}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-grow">
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h3 className="font-semibold">Billed To</h3>
                                <address className="not-italic text-muted-foreground">
                                    {sale.customerName}<br />
                                    {sale.customerAddress || 'No address provided'}<br />
                                    {sale.customerPhone || 'No phone provided'}
                                </address>
                            </div>
                        </div>
                        
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.items.map((item) => (
                                    <TableRow key={item.productId}>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <Image
                                                src={item.imageUrl || 'https://placehold.co/64x64.png'}
                                                alt={item.productName}
                                                width={40}
                                                height={40}
                                                className="rounded-md object-cover"
                                                data-ai-hint="product image"
                                            />
                                            <div>
                                                <div className="font-medium">{item.productName}</div>
                                                {item.productDescription && (
                                                    <div className="text-xs text-muted-foreground max-w-xs truncate">{item.productDescription}</div>
                                                )}
                                            </div>
                                           </div>
                                        </TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div></div>
                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(sale.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatCurrency(sale.shippingCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>- {formatCurrency(sale.discount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatCurrency(sale.total)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-6 items-center text-sm text-muted-foreground">
                        <div className="text-center">
                            <p>Thank you for choosing us!</p>
                            <p>If you have any question please contact us at www.facebook.com/freesia.finds</p>
                        </div>
                        <div className="text-xs text-left w-full border-t pt-4">
                            <h4 className="font-semibold mb-1">Terms and conditions</h4>
                            <p>
                                All our products are dispatched with Quality Control (QC) checks. If you encounter any issues, please record a clear video during unpacking and inform us within 1 day to ensure relevant action is taken
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
