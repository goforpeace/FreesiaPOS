
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";

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
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  const router = useRouter();

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

  const filteredSales = useMemo(() => sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const inDateRange =
      !dateRange ||
      !dateRange.from ||
      !dateRange.to ||
      (saleDate >= dateRange.from && saleDate <= dateRange.to);

    const matchesSearch =
      searchTerm === "" ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customerPhone && sale.customerPhone.includes(searchTerm));

    return inDateRange && matchesSearch;
  }), [sales, searchTerm, dateRange]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSaleIds(filteredSales.map(s => s.id));
    } else {
      setSelectedSaleIds([]);
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSaleIds(prev => [...prev, id]);
    } else {
      setSelectedSaleIds(prev => prev.filter(saleId => saleId !== id));
    }
  }

  const handleRowClick = (saleId: string) => {
    router.push(`/sales/${saleId}`);
  }

  const isAllSelected = filteredSales.length > 0 && selectedSaleIds.length === filteredSales.length;

  const csvHeaders = [
    { label: "Invoice #", key: "id" },
    { label: "Date", key: "date" },
    { label: "Customer", key: "customerName" },
    { label: "Phone", key: "customerPhone" },
    { label: "Status", key: "status" },
    { label: "Subtotal", key: "subtotal" },
    { label: "Shipping", key: "shippingCost" },
    { label: "Discount", key: "discount" },
    { label: "Total", key: "total" },
  ];

  const allSalesCsvData = filteredSales.map(sale => ({
      ...sale,
      date: format(new Date(sale.date), "yyyy-MM-dd")
  }));

  const selectedSalesData = sales
    .filter(sale => selectedSaleIds.includes(sale.id))
    .map(sale => ({
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
                    placeholder="Search by Invoice, Customer, or Phone..."
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
                    data={allSalesCsvData}
                    headers={csvHeaders}
                    filename={"all-sales-report.csv"}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    <span>Export All</span>
                </CSVLink>
            </Button>
            {selectedSaleIds.length > 0 && (
                 <Button variant="secondary" asChild>
                    <CSVLink
                        data={selectedSalesData}
                        headers={csvHeaders}
                        filename={"selected-sales-report.csv"}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Selected ({selectedSaleIds.length})</span>
                    </CSVLink>
                </Button>
            )}
            <Button onClick={() => router.push('/sales/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Sale
            </Button>
        </div>
      </Header>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredSales.map((sale) => {
                  const status = sale.status || 'pending';
                  const isSelected = selectedSaleIds.includes(sale.id);
                  return (
                    <TableRow 
                      key={sale.id} 
                      className={cn("cursor-pointer", {
                          'bg-green-500/10 hover:bg-green-500/20 data-[state=selected]:bg-green-500/20': status === 'accepted',
                          'bg-red-500/10 hover:bg-red-500/20 data-[state=selected]:bg-red-500/20': status === 'cancelled',
                          'bg-yellow-500/10 hover:bg-yellow-500/20 data-[state=selected]:bg-yellow-500/20': status === 'pending',
                      })}
                      data-state={isSelected ? "selected" : ""}
                      onClick={() => handleRowClick(sale.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(sale.id, Boolean(checked))}
                            aria-label={`Select sale ${sale.id}`}
                           />
                      </TableCell>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>{sale.customerPhone}</TableCell>
                      <TableCell>
                          <Badge 
                            variant={status === 'accepted' ? 'secondary' : status === 'cancelled' ? 'destructive' : 'outline'}
                            className={cn({
                                'bg-green-600 text-white hover:bg-green-700': status === 'accepted',
                                'bg-red-600 text-white hover:bg-red-700': status === 'cancelled',
                                'bg-yellow-500 text-white hover:bg-yellow-600': status === 'pending',
                            })}
                          >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{format(new Date(sale.date), "dd MMM, yyyy")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
