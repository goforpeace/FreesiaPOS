
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/lib/api";
import { ProductActions } from "@/components/products/ProductActions";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("createdAt-desc");
  const [loading, setLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    if (sortOption) {
      const [key, order] = sortOption.split("-");
      sorted.sort((a, b) => {
        let valA: string | number | undefined;
        let valB: string | number | undefined;

        if (key === 'createdAt') {
          valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        } else if (key === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (key === 'quantity' || key === 'sellPrice' || key === 'costPrice') {
          valA = a[key as keyof Product] as number;
          valB = b[key as keyof Product] as number;
        }

        if (valA === undefined || valB === undefined) return 0;
        
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [products, sortOption]);
  
  const filteredProducts = sortedProducts.filter(product =>
    !product.isRejected && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header title="All Products">
         <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name..."
                    className="pl-8 sm:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="quantity-desc">Quantity (High-Low)</SelectItem>
                <SelectItem value="quantity-asc">Quantity (Low-High)</SelectItem>
                <SelectItem value="sellPrice-desc">Price (High-Low)</SelectItem>
                <SelectItem value="sellPrice-asc">Price (Low-High)</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
                <Link href="/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Link>
            </Button>
        </div>
      </Header>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">Quantity</TableHead>
                <TableHead className="hidden md:table-cell text-right">Cost Price</TableHead>
                <TableHead className="hidden md:table-cell text-right">Sales Price</TableHead>
                <TableHead className="hidden md:table-cell text-right">Discount Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="aspect-square rounded-md h-16 w-16" />
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                    <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imageUrls?.[0] || 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint="product image"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                      <div className="text-sm text-muted-foreground md:hidden">
                          {formatCurrency(product.sellPrice)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.quantity > 0 ? (
                        <Badge variant="secondary">In Stock</Badge>
                      ) : (
                        <Badge variant="outline">Out of Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">{product.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell text-right">{formatCurrency(product.costPrice)}</TableCell>
                    <TableCell className="hidden md:table-cell text-right">{formatCurrency(product.sellPrice)}</TableCell>
                    <TableCell className="hidden md:table-cell text-right font-semibold text-destructive">
                        {product.discountedPrice && product.discountedPrice > 0 ? formatCurrency(product.discountedPrice) : ''}
                    </TableCell>
                    <TableCell>
                      <ProductActions product={product} onProductUpdate={refreshProducts} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
