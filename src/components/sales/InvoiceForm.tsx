"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PlusCircle, X } from "lucide-react"
import Image from "next/image"

import type { Product, Sale, SaleItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { createSale, updateSale } from "@/lib/api"

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
}

export function InvoiceForm({ availableProducts, allProducts, initialData }: InvoiceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<SaleItem[]>(initialData?.items || [])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [originalItems, setOriginalItems] = useState<SaleItem[]>(initialData?.items || [])

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData || {
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
      setItems(initialData.items);
      setOriginalItems(initialData.items);
    }
  }, [initialData, form]);

  const { shippingCost, discount } = form.watch()

  const handleAddProduct = () => {
    const product = allProducts.find(p => p.id === selectedProduct)
    if (product && !items.find(item => item.productId === product.id)) {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellPrice,
      }])
      setSelectedProduct("")
    }
  }

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId))
  }
  
  const handleItemChange = (productId: string, field: keyof SaleItem, value: string | number) => {
    setItems(items.map(item => item.productId === productId ? { ...item, [field]: value } : item));
  };


  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return

    const originalItem = originalItems.find(i => i.productId === productId);
    const originalQuantity = originalItem ? originalItem.quantity : 0;
    
    const availableQuantity = (product.quantity || 0) + originalQuantity;
    const newQuantity = Math.max(1, Math.min(quantity, availableQuantity))
    
    setItems(items.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item))
  }

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  const total = subtotal + Number(shippingCost || 0) - Number(discount || 0);

  function onSubmit(data: InvoiceFormValues) {
    if(items.length === 0) {
        toast({
            title: "No items in invoice",
            description: "Please add at least one product to the invoice.",
            variant: "destructive"
        })
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...data, items, total, subtotal };
      if (initialData) {
        updateSale(initialData.id, payload, originalItems);
        toast({
          title: "Invoice Updated",
          description: `Invoice #${initialData.id} has been successfully updated.`,
        });
      } else {
        createSale(payload);
        toast({
          title: "Invoice Created",
          description: "A new sales invoice has been successfully created.",
        })
      }
      
      router.push("/sales");

    } catch (error) {
       toast({
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Products</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(p => (
                        <SelectItem key={p.id} value={p.id} disabled={!!items.find(item => item.productId === p.id)}>
                          <div className="flex items-center gap-3">
                            <Image 
                                src={p.imageUrl || 'https://placehold.co/64x64.png'} 
                                alt={p.name} 
                                width={40} 
                                height={40} 
                                className="rounded-md object-cover"
                                data-ai-hint="product image"
                            />
                            <div>
                                <p>{p.name}</p>
                                <p className="text-xs text-muted-foreground">{formatCurrency(p.sellPrice)} - {p.quantity} left</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddProduct} disabled={!selectedProduct}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-[100px]">Qty</TableHead>
                      <TableHead className="text-right w-[120px]">Price</TableHead>
                      <TableHead className="text-right w-[120px]">Total</TableHead>
                      <TableHead className="w-[50px]"><span className="sr-only">Remove</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length > 0 ? items.map(item => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <Input 
                            value={item.productName} 
                            onChange={(e) => handleItemChange(item.productId, 'productName', e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))} className="h-8" min="1" />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item.productId)}><X className="h-4 w-4" /></Button>
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
  )
}
