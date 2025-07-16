"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSales } from "@/lib/api";
import { format } from "date-fns";
import { SalesActions } from "@/components/sales/SalesActions";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/lib/types";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  const refreshSales = () => {
    setSales(getSales());
  };

  useEffect(() => {
    refreshSales();
    window.addEventListener('storage', refreshSales);
    return () => {
        window.removeEventListener('storage', refreshSales);
    };
  }, []);

  return (
    <>
      <Header title="All Sales">
        <Button asChild>
          <Link href="/sales/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Sale
          </Link>
        </Button>
      </Header>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(sale.date), "dd MMM, yyyy")}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                   <TableCell className="text-right">
                    <SalesActions saleId={sale.id} onSaleUpdate={refreshSales} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
