
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/sales/InvoiceForm";
import { getProducts, getCustomers } from "@/lib/api";
import { createSaleAction } from "@/app/actions/sales";
import type { Product, Customer } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, customersData] = await Promise.all([
          getProducts(),
          getCustomers(),
        ]);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      const result = await createSaleAction(data);
       if (result.error) {
          toast({
              title: "Failed to create invoice",
              description: result.error,
              variant: "destructive",
          });
      } else {
        toast({
          title: "Invoice Created",
          description: `Invoice #${result.saleId} has been successfully created.`,
        });
        router.push("/sales");
      }
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const availableProducts = products.filter(p => p.quantity > 0 && !p.isRejected);

  return (
    <>
      <Header title="Create New Invoice" />
      <InvoiceForm 
        availableProducts={availableProducts} 
        allProducts={products}
        allCustomers={customers}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </>
  );
}
