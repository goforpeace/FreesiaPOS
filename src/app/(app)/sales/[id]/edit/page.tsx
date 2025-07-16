"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/sales/InvoiceForm";
import { getProducts, getSale } from "@/lib/api";
import { notFound } from "next/navigation";
import type { Product, Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditSalePage({ params }: { params: { id: string } }) {
  const [sale, setSale] = useState<Sale | null | undefined>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    setSale(getSale(params.id));
    setAllProducts(getProducts());
  }, [params.id]);

  if (sale === undefined) {
    notFound();
  }
  
  if (sale === null || allProducts.length === 0) {
      return (
          <>
            <Header title="Edit Invoice" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </>
      )
  }

  // Products that are available OR are already in this specific sale
  const availableProducts = allProducts.filter(p => 
    !p.isRejected && (p.quantity > 0 || sale.items.some(i => i.productId === p.id))
  );

  return (
    <>
      <Header title={`Edit Invoice ${sale.id}`} />
      <InvoiceForm 
        initialData={sale} 
        availableProducts={availableProducts} 
        allProducts={allProducts} 
      />
    </>
  );
}
