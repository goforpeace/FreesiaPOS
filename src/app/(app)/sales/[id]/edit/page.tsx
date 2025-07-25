
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/sales/InvoiceForm";
import { getProducts, getSale, updateSale } from "@/lib/api";
import { notFound, useRouter } from "next/navigation";
import type { Product, Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function EditSalePage({ params }: { params: { id: string } }) {
  const [sale, setSale] = useState<Sale | null | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [saleData, productsData] = await Promise.all([
          getSale(params.id),
          getProducts(),
        ]);
        setSale(saleData);
        setAllProducts(productsData);
      } catch (error) {
        console.error("Failed to load sale and product data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
     if (!sale) return;
    try {
      await updateSale(params.id, data, sale.items);
      toast({
        title: "Invoice Updated",
        description: `Invoice #${params.id} has been successfully updated.`,
      });
      router.push("/sales");
    } catch (error: any) {
       toast({
        title: "An error occurred",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading || sale === undefined) {
    return (
      <>
        <Header title="Edit Invoice" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </>
    );
  }

  if (sale === null) {
    notFound();
  }

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
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </>
  );
}
