import {
  Package,
  PackageX,
  PiggyBank,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesReport } from "@/components/dashboard/SalesReport";
import { getProducts, getSales } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CircleDollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";


export default async function DashboardPage() {
  const products = await getProducts();
  const sales = await getSales();

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalProfit = sales.reduce((acc, sale) => {
    const costOfGoods = sale.items.reduce((itemAcc, item) => {
      const product = products.find(p => p.id === item.productId);
      return itemAcc + (product ? product.costPrice * item.quantity : 0);
    }, 0);
    const saleRevenue = sale.items.reduce((itemAcc, item) => itemAcc + (item.unitPrice * item.quantity), 0);
    return acc + (saleRevenue - costOfGoods);
  }, 0);
  
  const totalStock = products.reduce((acc, product) => acc + product.quantity, 0);
  const totalProductValue = products.reduce((acc, product) => acc + (product.costPrice * product.quantity), 0);
  const rejectedProducts = products.filter(p => p.isRejected).length;
  const rejectedValue = products.filter(p => p.isRejected).reduce((acc, p) => acc + p.costPrice * p.quantity, 0);

  return (
    <>
      <Header title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Sales" value={formatCurrency(totalSales)} icon={CircleDollarSign} />
        <StatCard title="Total Profit" value={formatCurrency(totalProfit)} icon={PiggyBank} />
        <StatCard title="Total Stock" value={totalStock.toString()} icon={Package} />
        <StatCard title="Stock Value (Cost)" value={formatCurrency(totalProductValue)} icon={ReceiptText} />
        <StatCard title="Rejected Products" value={rejectedProducts.toString()} icon={PackageX} />
        <StatCard title="Rejected Value" value={formatCurrency(rejectedValue)} icon={TrendingUp} description="Based on cost price" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <SalesReport sales={sales} />
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.slice(0, 5).map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell>
                        <div className="font-medium">{sale.customerName}</div>
                    </TableCell>
                    <TableCell>{format(new Date(sale.date), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
