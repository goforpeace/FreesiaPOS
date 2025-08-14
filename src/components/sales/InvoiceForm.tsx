
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PlusCircle, X, Search } from "lucide-react"
import Image from "next/image"

import type { Product, Sale, SaleItem, ProductVariant, SelectedVariant } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const invoiceFormSchema = z.object({
  customerName: z.string().min(2, "Name is required."),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  shippingCost: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
})

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

interface InvoiceFormProps {
  availableProducts: Product[];
  allProducts: Product[];
  initialData?: Sale;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function InvoiceForm({ availableProducts, allProducts, initialData, onSubmit, isLoading }: InvoiceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [productSearch, setProductSearch] = useState("");
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [productForVariantSelection, setProductForVariantSelection] = useState<Product | null>(null);

  const [originalItems, setOriginalItems] = useState<SaleItem[]>([])

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      shippingCost: 0,
      discount: 0,
    },
  })
  
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      setItems(initialData.items || []);
      setOriginalItems(initialData.items || []);
    }
  }, [initialData, form]);

  const { shippingCost, discount } = form.watch()
  
  const handleSelectProduct = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    if (product.variants && product.variants.length > 0) {
      setProductForVariantSelection(product);
      setVariantModalOpen(true);
    } else {
      handleAddProduct(product);
    }
    setSelectedProduct("");
  };

  const handleAddProduct = (product: Product, variant?: ProductVariant) => {
    const isAlreadyInCart = items.some(item => 
      item.productId === product.id && item.variant?.color === variant?.color
    );

    if (isAlreadyInCart) {
      toast({
        title: "Product already added",
        description: variant 
          ? `${product.name} (${variant.color}) is already in the invoice.`
          : `${product.name} is already in the invoice.`,
        variant: "destructive",
      })
      return;
    }

    setItems([...items, {
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      quantity: 1,
      unitPrice: product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : product.sellPrice,
      imageUrl: variant?.imageUrls?.[0] || product.imageUrls?.[0],
      variant: variant ? { color: variant.color, imageUrl: variant.imageUrls[0] } : undefined,
    }]);

    setVariantModalOpen(false);
    setProductForVariantSelection(null);
  }

  const handleRemoveItem = (productId: string, variantColor?: string) => {
    setItems(items.filter(item => !(item.productId === productId && item.variant?.color === variantColor)));
  }
  
  const handleItemChange = (productId: string, variantColor: string | undefined, field: keyof SaleItem, value: string | number) => {
    setItems(items.map(item => 
      (item.productId === productId && item.variant?.color === variantColor) 
      ? { ...item, [field]: value } 
      : item
    ));
  };


  const handleQuantityChange = (productId: string, variantColor: string | undefined, quantity: number) => {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return

    const originalItem = originalItems.find(i => i.productId === productId && i.variant?.color === variantColor);
    const originalQuantity = originalItem ? originalItem.quantity : 0;
    
    let availableQuantity: number;
    if (variantColor && product.variants) {
        const variant = product.variants.find(v => v.color === variantColor);
        availableQuantity = (variant?.quantity || 0) + originalQuantity;
    } else {
        availableQuantity = (product.quantity || 0) + originalQuantity;
    }
    
    const newQuantity = Math.max(1, Math.min(quantity, availableQuantity))
    
    if (quantity > availableQuantity) {
        toast({
            title: "Stock limit reached",
            description: `Only ${availableQuantity} units of ${product.name} ${variantColor ? `(${variantColor})` : ''} available.`,
            variant: "destructive"
        })
    }
    
    setItems(items.map(item => 
      (item.productId === productId && item.variant?.color === variantColor) 
      ? { ...item, quantity: newQuantity } 
      : item
    ));
  }

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  const total = subtotal + Number(shippingCost || 0) - Number(discount || 0);

  const filteredProducts = useMemo(() => {
    return availableProducts.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [availableProducts, productSearch]);

  async function handleFormSubmit(data: InvoiceFormValues) {
    if(items.length === 0) {
        toast({
            title: "No items in invoice",
            description: "Please add at least one product to the invoice.",
            variant: "destructive"
        })
        return;
    }

    setIsSubmitting(true);
    const payload = { ...data, items, total, subtotal, originalItems };
    await onSubmit(payload);
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Products</CardTitle></CardHeader>
              <CardContent>
                 <Skeleton className="h-10 w-full mb-4"/>
                 <Skeleton className="h-48 w-full"/>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
             <Card>
              <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full"/>
                  <Skeleton className="h-10 w-full"/>
                  <Skeleton className="h-20 w-full"/>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full"/>
              </CardContent>
            </Card>
          </div>
       </div>
    )
  }

  return (
    <Dialog open={variantModalOpen} onOpenChange={setVariantModalOpen}>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Products</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                   <div className="relative flex-grow">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input 
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-8"
                     />
                   </div>
                  <Select value={selectedProduct} onValueChange={handleSelectProduct}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Product</TableHead>
                      <TableHead className="w-[100px]">Qty</TableHead>
                      <TableHead className="text-right w-[120px]">Price</TableHead>
                      <TableHead className="text-right w-[120px]">Total</TableHead>
                      <TableHead className="w-[50px]"><span className="sr-only">Remove</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length > 0 ? items.map(item => (
                      <TableRow key={`${item.productId}-${item.variant?.color}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                             <Image 
                                src={item.imageUrl || 'https://placehold.co/64x64.png'} 
                                alt={item.productName} 
                                width={40} 
                                height={40} 
                                className="rounded-md object-cover flex-shrink-0"
                                data-ai-hint="product image"
                            />
                             <div className="flex-grow">
                                <Input 
                                  value={item.productName} 
                                  onChange={(e) => handleItemChange(item.productId, item.variant?.color, 'productName', e.target.value)}
                                  className="h-8 font-medium"
                                />
                                 {item.variant && (
                                     <span className="text-xs text-muted-foreground">Color: {item.variant.color}</span>
                                 )}
                              </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, item.variant?.color, parseInt(e.target.value))} className="h-8" min="1" />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item.productId, item.variant?.color)}><X className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">No products added yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="customerName" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Customer Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="customerPhone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="Customer Phone" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="customerAddress" render={({ field }) => (
                  <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Customer Address" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <Separator/>
                <FormField control={form.control} name="shippingCost" render={({ field }) => (
                  <FormItem className="flex items-center justify-between"><FormLabel>Shipping</FormLabel><FormControl><Input type="number" className="w-24 h-8" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="discount" render={({ field }) => (
                  <FormItem className="flex items-center justify-between"><FormLabel>Discount</FormLabel><FormControl><Input type="number" className="w-24 h-8" {...field} /></FormControl></FormItem>
                )} />
                <Separator/>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{initialData ? 'Update Invoice' : 'Create Invoice'}</Button>
        </div>
      </form>
    </Form>
     <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Variant for {productForVariantSelection?.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-3 gap-4">
            {productForVariantSelection?.variants?.map(variant => (
              <button
                key={variant.color}
                onClick={() => handleAddProduct(productForVariantSelection, variant)}
                disabled={variant.quantity <= 0}
                className="border rounded-lg p-2 text-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
              >
                <Image
                  src={variant.imageUrls[0] || 'https://placehold.co/100x100.png'}
                  alt={variant.color}
                  width={100}
                  height={100}
                  className="rounded-md object-cover mx-auto"
                />
                <p className="font-medium mt-2">{variant.color}</p>
                <p className="text-sm text-muted-foreground">{variant.quantity} in stock</p>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
