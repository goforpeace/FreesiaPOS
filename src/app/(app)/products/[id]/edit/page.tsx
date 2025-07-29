
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductForm } from "@/components/products/ProductForm";
import { getProduct, updateProduct } from "@/lib/api";
import { notFound, useRouter, useParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormValues } from "@/components/products/ProductForm";
import { useToast } from "@/hooks/use-toast";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
        try {
            const foundProduct = await getProduct(id);
            setProduct(foundProduct);
        } catch (error) {
            console.error("Failed to fetch product:", error);
            setProduct(null);
        }
    }
    fetchProduct();
  }, [id]);
  
  const handleSubmit = async (data: ProductFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateProduct(id, data);
      toast({
        title: "Product Updated",
        description: `Product "${data.name}" has been successfully updated.`,
      });
      router.push("/products");
    } catch (error) {
       toast({
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (product === undefined) {
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

  if (product === null) {
      notFound();
  }


  return (
    <>
      <Header title="Edit Product" />
      <ProductForm 
        initialData={product} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

    