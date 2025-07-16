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
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesReport } from "@/components/dashboard/SalesReport";
import { ProfitCalculator } from "@/components/dashboard/ProfitCalculator";
import { getProducts, getSales } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Product, Sale } from "@/lib/types";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const loadData = () => {
      setProducts(getProducts());
      setSales(getSales());
    };
    
    loadData();

    // Listen for storage changes to update the dashboard in real-time
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    };
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

  const totalStock = products.reduce((acc, product) => acc + product.quantity, 0);
  const totalProductValue = products.reduce((acc, product) => acc + (product.costPrice * product.quantity), 0);
  const rejectedProducts = products.filter(p => p.isRejected).length;
  const rejectedValue = products.filter(p => p.isRejected).reduce((acc, p) => acc + p.costPrice * p.quantity, 0);

  const availableProducts = products.filter(p => !p.isRejected);

  return (
    <>
      <Header title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Sales" value={formatCurrency(totalSales)} icon={CircleDollarSign} />
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
