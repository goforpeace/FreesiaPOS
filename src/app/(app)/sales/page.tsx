
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CSVLink } from "react-csv";

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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

import { getSales } from "@/lib/api";
import { SalesActions } from "@/components/sales/SalesActions";
import { formatCurrency, cn } from "@/lib/utils";
import type { Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const refreshSales = async () => {
    setLoading(true);
    try {
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSales();
  }, []);

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const inDateRange =
      !dateRange ||
      (dateRange.from &&
        dateRange.to &&
        saleDate >= dateRange.from &&
        saleDate <= dateRange.to);

    const matchesSearch =
      searchTerm === "" ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    return inDateRange && matchesSearch;
  });

  const csvHeaders = [
    { label: "Invoice #", key: "id" },
    { label: "Date", key: "date" },
    { label: "Customer", key: "customerName" },
    { label: "Status", key: "status" },
    { label: "Subtotal", key: "subtotal" },
    { label: "Shipping", key: "shippingCost" },
    { label: "Discount", key: "discount" },
    { label: "Total", key: "total" },
  ];

  const csvData = filteredSales.map(sale => ({
      ...sale,
      date: format(new Date(sale.date), "yyyy-MM-dd")
  }));

  return (
    <>
      <Header title="All Sales">
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by Invoice # or Customer..."
                    className="pl-8 sm:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                    dateRange.to ? (
                        <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(dateRange.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Pick a date range</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                />
                </PopoverContent>
            </Popover>
            <Button variant="outline" asChild>
                <CSVLink
                    data={csvData}
                    headers={csvHeaders}
                    filename={"sales-report.csv"}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    <span>Download CSV</span>
                </CSVLink>
            </Button>
            <Button asChild>
                <Link href="/sales/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Sale
                </Link>
            </Button>
        </div>
      </Header>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredSales.map((sale) => {
                  const status = sale.status || 'pending';
                  return (
                    <TableRow key={sale.id} className={status === 'pending' ? 'bg-muted/50' : ''}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>
                          <Badge variant={status === 'accepted' ? 'secondary' : status === 'cancelled' ? 'destructive' : 'outline'}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{format(new Date(sale.date), "dd MMM, yyyy")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                      <TableCell className="text-right">
                        <SalesActions sale={sale} onSaleUpdate={refreshSales} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
