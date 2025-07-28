
"use client";

import { Header } from "@/components/layout/Header";
import { ProductForm } from "@/components/products/ProductForm";
import { createProduct } from "@/lib/api";
import { ProductFormValues } from "@/components/products/ProductForm";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
      toast({
        title: "Product Created",
        description: `Product "${data.name}" has been successfully created.`,
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

  return (
    <>
      <Header title="Add New Product" />
      <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </>
  );
}
