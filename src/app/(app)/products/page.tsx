

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlusCircle, Search, ClipboardCopy, Sparkles, Percent, Clock } from "lucide-react";
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
import { getProducts, applyBulkDiscount, applyBulkOfferDuration } from "@/lib/api";
import { ProductActions } from "@/components/products/ProductActions";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("createdAt-desc");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // State for bulk action modals
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [offerDuration, setOfferDuration] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);


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
  
  const copyProductLink = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent row click from firing
    const url = `${window.location.origin}/product/${productId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "The product link has been copied to your clipboard.",
    });
  }

  const handleRowClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleSelectAll = (checked: boolean) => {
      setSelectedProductIds(checked ? filteredProducts.map(p => p.id) : []);
  }

  const handleSelectRow = (id: string, checked: boolean) => {
      setSelectedProductIds(prev => 
        checked ? [...prev, id] : prev.filter(pId => pId !== id)
      );
  }

  const isAllSelected = filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length;

  const handleApplyDiscount = async () => {
    if (selectedProductIds.length === 0) return;
    if (discountPercent <= 0 || discountPercent > 100) {
        toast({ title: "Invalid Percentage", description: "Please enter a value between 1 and 100.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        const count = await applyBulkDiscount(selectedProductIds, discountPercent);
        toast({ title: "Discount Applied", description: `Applied a ${discountPercent}% discount to ${count} products.` });
        await refreshProducts();
        setSelectedProductIds([]);
        setIsDiscountModalOpen(false);
    } catch (error: any) {
        toast({ title: "Error Applying Discount", description: error.message, variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const handleApplyOfferDuration = async () => {
    if (selectedProductIds.length === 0) return;
    if (offerDuration <= 0) {
        toast({ title: "Invalid Duration", description: "Please enter a positive number of hours.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        const count = await applyBulkOfferDuration(selectedProductIds, offerDuration);
        toast({ title: "Offer Timer Set", description: `Set a ${offerDuration}-hour offer for ${count} discounted products.`});
        await refreshProducts();
        setSelectedProductIds([]);
        setIsOfferModalOpen(false);
    } catch (error: any) {
        toast({ title: "Error Setting Offer", description: error.message, variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }


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
            {selectedProductIds.length > 0 && (
                <div className="flex items-center gap-2">
                    <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline"><Percent className="mr-2 h-4 w-4"/>Set Bulk Discount</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Set Bulk Discount</DialogTitle></DialogHeader>
                            <div className="py-4 space-y-2">
                                <Label htmlFor="discount-percent">Discount Percentage (%)</Label>
                                <Input id="discount-percent" type="number" value={discountPercent} onChange={(e) => setDiscountPercent(parseInt(e.target.value))} placeholder="e.g., 15"/>
                                <p className="text-sm text-muted-foreground">This will apply the discount to the selling price of the {selectedProductIds.length} selected products.</p>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleApplyDiscount} disabled={isSubmitting}>{isSubmitting ? "Applying..." : "Apply Discount"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Clock className="mr-2 h-4 w-4"/>Set Bulk Offer</Button>
                        </DialogTrigger>
                         <DialogContent>
                            <DialogHeader><DialogTitle>Set Bulk Offer Duration</DialogTitle></DialogHeader>
                            <div className="py-4 space-y-2">
                                <Label htmlFor="offer-duration">Offer Duration (in hours)</Label>
                                <Input id="offer-duration" type="number" value={offerDuration} onChange={(e) => setOfferDuration(parseInt(e.target.value))} placeholder="e.g., 24"/>
                                <p className="text-sm text-muted-foreground">This will apply the timer to the {selectedProductIds.length} selected products that have a discount price.</p>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleApplyOfferDuration} disabled={isSubmitting}>{isSubmitting ? "Applying..." : "Apply Offer"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            <Button onClick={() => router.push('/products/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
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
                        aria-label="Select all rows"
                    />
                 </TableHead>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead className="text-right">Sales Price</TableHead>
                <TableHead className="text-right">Discount Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-5"/></TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="aspect-square rounded-md h-16 w-16" />
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    data-state={selectedProductIds.includes(product.id) ? "selected" : ""}
                  >
                    <TableCell>
                        <Checkbox 
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={(checked) => handleSelectRow(product.id, Boolean(checked))}
                            aria-label={`Select product ${product.name}`}
                        />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell" onClick={() => handleRowClick(product.id)}>
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imageUrls?.[0] || 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint="product image"
                      />
                    </TableCell>
                    <TableCell className="font-medium" onClick={() => handleRowClick(product.id)}>
                      <div className="truncate w-48" title={product.name}>
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(product.id)}>
                      {product.quantity > 0 ? (
                        <Badge variant="secondary">In Stock</Badge>
                      ) : (
                        <Badge variant="outline">Out of Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => copyProductLink(e, product.id)}>
                      <Button variant="outline" size="sm">
                          <ClipboardCopy className="mr-2 h-3 w-3" />
                          Copy Link
                      </Button>
                    </TableCell>
                    <TableCell className="text-right" onClick={() => handleRowClick(product.id)}>{product.quantity}</TableCell>
                    <TableCell className="text-right" onClick={() => handleRowClick(product.id)}>{formatCurrency(product.costPrice)}</TableCell>
                    <TableCell className="text-right" onClick={() => handleRowClick(product.id)}>{formatCurrency(product.sellPrice)}</TableCell>
                     <TableCell className="text-right" onClick={() => handleRowClick(product.id)}>
                        {product.discountedPrice && product.discountedPrice > 0 ? formatCurrency(product.discountedPrice) : '-'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
