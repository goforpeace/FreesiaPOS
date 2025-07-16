"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getSale } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function SaleDetailsPage({ params }: { params: { id: string } }) {
    const [sale, setSale] = useState<Sale | null | undefined>(null);

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

    return (
        <>
            <Header title={`Invoice ${sale.id}`} />
            <Card>
                <CardHeader>
                    <CardTitle>Sale Details</CardTitle>
                    <CardDescription>
                        Invoice Number: {sale.id} <br />
                        Date: {format(new Date(sale.date), "dd MMMM, yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold">Billed To</h3>
                            <address className="not-italic text-muted-foreground">
                                {sale.customerName}<br />
                                {sale.customerAddress || 'No address provided'}<br />
                                {sale.customerPhone || 'No phone provided'}
                            </address>
                        </div>
                         <div className="space-y-1 text-right">
                            <h3 className="font-semibold">Billed From</h3>
                            <address className="not-italic text-muted-foreground">
                                Freesia Finds<br />
                                123/A, Artisan Street<br />
                                Dhaka, Bangladesh
                            </address>
                        </div>
                    </div>
                    <Separator />
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
                                    <TableCell>{item.productName}</TableCell>
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
                <CardFooter className="text-center text-sm text-muted-foreground">
                    Thank you for your business!
                </CardFooter>
            </Card>
        </>
    )
}
