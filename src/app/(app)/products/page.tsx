
"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/lib/api";
import { ProductActions } from "@/components/products/ProductActions";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshProducts = () => {
      setProducts(getProducts());
  };
  
  useEffect(() => {
    refreshProducts();
    
    window.addEventListener('storage', refreshProducts);
    return () => {
      window.removeEventListener('storage', refreshProducts);
    };
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    className="pl-8 sm:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
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
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.imageUrl || 'https://placehold.co/64x64.png'}
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
                    {product.isRejected ? (
                       <Badge variant="destructive">Rejected</Badge>
                    ) : product.quantity > 0 ? (
                      <Badge variant="secondary">In Stock</Badge>
                    ) : (
                      <Badge variant="outline">Out of Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">{product.quantity}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">{formatCurrency(product.sellPrice)}</TableCell>
                  <TableCell>
                    <ProductActions product={product} onProductUpdate={refreshProducts} />
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
