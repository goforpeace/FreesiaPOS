
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X, ArrowLeft, Trash2 } from "lucide-react";

import { useCart, CartItem } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { createSaleAction } from "@/app/actions/sales";
import { formatCurrency } from "@/lib/utils";

import { Header } from "@/components/web/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const checkoutFormSchema = z.object({
  customerName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  customerPhone: z.string().min(11, { message: "Phone number must be at least 11 digits." }),
  customerAddress: z.string().min(10, { message: "Address must be at least 10 characters." }),
  shippingOption: z.enum(["inside_dhaka", "outside_dhaka"], {
    required_error: "You need to select a shipping option.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const SHIPPING_COSTS = {
  inside_dhaka: 80,
  outside_dhaka: 130,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
  });

  const shippingOption = form.watch("shippingOption");
  const subtotal = totalPrice();
  const shippingCost = shippingOption ? SHIPPING_COSTS[shippingOption] : 0;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add products to your cart before placing an order.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const saleData = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          productDescription: item.description,
          quantity: item.orderQuantity,
          unitPrice: item.discountedPrice && item.discountedPrice > 0 ? item.discountedPrice : item.sellPrice,
          imageUrl: item.selectedVariant?.imageUrl || item.imageUrls?.[0],
          variant: item.selectedVariant,
        })),
        shippingCost,
        discount: 0,
        subtotal,
        total,
      };
      
      const result = await createSaleAction(saleData as any);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${result.saleId} has been confirmed.`,
      });
      
      form.reset();
      clearCart();
      router.push(`/order-confirmation/${result.saleId}`);

    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id, item.selectedVariant?.color);
  }
  
  const handleUpdateQuantity = (item: CartItem, quantity: number) => {
      updateQuantity(item.id, quantity, item.selectedVariant?.color);
  }

  if (!isClient) {
    return null; // Render nothing on the server to avoid hydration issues
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto py-12 px-4">
        <Button variant="link" className="p-0 mb-4" asChild>
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Continue Shopping
            </Link>
        </Button>
        <h1 className="text-4xl font-headline text-primary mb-8">Checkout</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
            <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="mt-6">
                <Link href="/">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePlaceOrder)} className="grid md:grid-cols-3 gap-12 items-start">
              <div className="md:col-span-2 space-y-6">
                 {/* Shipping Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="customerName" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="customerPhone" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="01xxxxxxxxx" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="customerAddress" render={({ field }) => (
                            <FormItem><FormLabel>Full Address</FormLabel><FormControl><Input placeholder="House, Road, Area, City" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                 {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map(item => {
                         const price = item.discountedPrice && item.discountedPrice > 0 ? item.discountedPrice : item.sellPrice;
                         const imageUrl = item.selectedVariant?.imageUrl || item.imageUrls?.[0] || 'https://placehold.co/64x64.png';
                        
                         return (
                            <div key={`${item.id}-${item.selectedVariant?.color}`} className="flex items-center gap-4">
                            <Image
                                src={imageUrl}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                            />
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                {item.selectedVariant && <p className="text-sm text-muted-foreground">Color: {item.selectedVariant.color}</p>}
                                <p className="text-sm text-muted-foreground">{formatCurrency(price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    value={item.orderQuantity}
                                    onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value))}
                                    className="w-16 h-8 text-center"
                                    min="1"
                                    max={item.quantity}
                                />
                            </div>
                            <p className="font-semibold w-24 text-right">{formatCurrency(price * item.orderQuantity)}</p>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Totals & Actions */}
              <div className="md:col-span-1 space-y-6 sticky top-24">
                 <Card>
                    <CardHeader>
                        <CardTitle>Delivery Options</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <FormField control={form.control} name="shippingOption" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="space-y-3"
                                >
                                    <Label className="flex items-center justify-between p-4 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="inside_dhaka"/>
                                            <span>Inside Dhaka</span>
                                        </div>
                                        <span className="font-semibold">{formatCurrency(SHIPPING_COSTS.inside_dhaka)}</span>
                                    </Label>
                                    <Label className="flex items-center justify-between p-4 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                        <div className="flex items-center gap-3">
                                          <RadioGroupItem value="outside_dhaka"/>
                                          <span>Outside Dhaka</span>
                                        </div>
                                        <span className="font-semibold">{formatCurrency(SHIPPING_COSTS.outside_dhaka)}</span>
                                    </Label>
                                </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                     </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(shippingCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="text-center bg-secondary/50 p-3 rounded-md">
                        <p className="font-semibold text-primary">Cash on Delivery</p>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        )}
      </main>
    </div>
  );
}

    