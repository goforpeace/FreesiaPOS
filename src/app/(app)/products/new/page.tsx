"use client";

import { Header } from "@/components/layout/Header";
import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <Header title="Add New Product" />
      <ProductForm />
    </>
  );
}
