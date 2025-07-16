"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductForm } from "@/components/products/ProductForm";
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null | undefined>(null);

  useEffect(() => {
    const foundProduct = getProduct(params.id);
    setProduct(foundProduct);
  }, [params.id]);

  if (product === undefined) {
    notFound();
  }

  if (product === null) {
    return (
        <>
            <Header title="Edit Product" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </>
    )
  }

  return (
    <>
      <Header title="Edit Product" />
      <ProductForm initialData={product} />
    </>
  );
}
