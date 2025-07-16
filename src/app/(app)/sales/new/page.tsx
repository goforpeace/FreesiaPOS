"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/sales/InvoiceForm";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const availableProducts = products.filter(p => p.quantity > 0 && !p.isRejected);

  return (
    <>
      <Header title="Create New Invoice" />
      <InvoiceForm availableProducts={availableProducts} allProducts={products} />
    </>
  );
}
