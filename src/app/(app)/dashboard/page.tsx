
"use client";

import { useState, useEffect } from "react";
import {
  Package,
  PackageX,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  CircleDollarSign,
  ClipboardList,
  Sun,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesReport } from "@/components/dashboard/SalesReport";
import { ProfitCalculator } from "@/components/dashboard/ProfitCalculator";
import { getProducts, getSales } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Product, Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, salesData] = await Promise.all([getProducts(), getSales()]);
        setProducts(productsData);
        setSales(salesData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const totalSales = sales.reduce((acc, sale) => acc + (sale.subtotal - sale.discount), 0);
  const totalOrders = sales.length;

  const totalProfit = sales.reduce((acc, sale) => {
    const costOfGoods = sale.items.reduce((itemAcc, item) => {
      const product = products.find(p => p.id === item.productId);
      return itemAcc + (product ? product.costPrice * item.quantity : 0);
    }, 0);
    const revenueFromSale = sale.subtotal - sale.discount;
    return acc + (revenueFromSale - costOfGoods);
  }, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const dailySales = sales
    .filter(sale => sale.date.startsWith(today))
    .reduce((acc, sale) => acc + (sale.subtotal - sale.discount), 0);

  const totalStock = products.reduce((acc, product) => acc + product.quantity, 0);
  const totalProductValue = products.reduce((acc, product) => acc + (product.costPrice * product.quantity), 0);
  const rejectedProducts = products.filter(p => p.isRejected).length;
  const rejectedValue = products.filter(p => p.isRejected).reduce((acc, p) => acc + p.costPrice * p.quantity, 0);

  const availableProducts = products.filter(p => !p.isRejected);

  if (loading) {
    return (
        <>
            <Header title="Dashboard" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
                <Skeleton className="h-[450px] col-span-1 lg:col-span-2" />
                <Skeleton className="h-[450px]" />
             </div>
        </>
    )
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sales" value={formatCurrency(totalSales)} icon={CircleDollarSign} />
        <StatCard title="Daily Sales" value={formatCurrency(dailySales)} icon={Sun} />
        <StatCard title="Total Profit" value={formatCurrency(totalProfit)} icon={PiggyBank} />
        <StatCard title="Total Orders" value={totalOrders.toString()} icon={ClipboardList} />
        <StatCard title="Total Stock" value={totalStock.toString()} icon={Package} />
        <StatCard title="Stock Value (Cost)" value={formatCurrency(totalProductValue)} icon={ReceiptText} />
        <StatCard title="Rejected Products" value={rejectedProducts.toString()} icon={PackageX} />
        <StatCard title="Rejected Value" value={formatCurrency(rejectedValue)} icon={TrendingUp} description="Based on cost price" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <SalesReport sales={sales} />
        <ProfitCalculator products={availableProducts} />
      </div>
    </>
  );
}

const CardSkeleton = () => (
    <div className="p-6 bg-card rounded-lg shadow-sm">
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-8 w-3/4" />
    </div>
)
