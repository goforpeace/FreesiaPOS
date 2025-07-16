import Link from "next/link";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { products } from "@/lib/data";
import { ProductActions } from "@/components/products/ProductActions";

export default function ProductsPage() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <>
      <Header title="Products">
        <Button asChild>
          <Link href="/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </Header>
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Cost Price</TableHead>
                <TableHead className="hidden md:table-cell">Sales Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.imageUrl}
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
                      <Badge variant="secondary">In Stock ({product.quantity})</Badge>
                    ) : (
                      <Badge variant="outline">Out of Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatCurrency(product.sellPrice)}</TableCell>
                  <TableCell>
                    <ProductActions productId={product.id} />
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
