
"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, isCartOpen, closeCart } = useCart();

  const handleUpdateQuantity = (item: CartItem, quantity: number) => {
    updateQuantity(item.id, quantity, item.selectedVariant?.color);
  };

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id, item.selectedVariant?.color);
  };
  
  const handleCheckout = () => {
    closeCart();
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Cart ({totalItems()})</SheetTitle>
        </SheetHeader>
        {items.length > 0 ? (
            <>
                <ScrollArea className="flex-1 pr-6">
                     <div className="space-y-4">
                      {items.map(item => {
                         const price = item.discountedPrice && item.discountedPrice > 0 ? item.discountedPrice : item.sellPrice;
                         const imageUrl = item.selectedVariant?.imageUrl || item.imageUrls?.[0] || 'https://placehold.co/64x64.png';
                         const stock = item.variantQuantity ?? item.quantity;
                        
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
                                <p className="font-semibold text-sm">{item.name}</p>
                                {item.selectedVariant && <p className="text-xs text-muted-foreground">Color: {item.selectedVariant.color}</p>}
                                <p className="text-xs text-muted-foreground">{formatCurrency(price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    value={item.orderQuantity}
                                    onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value))}
                                    className="w-14 h-8 text-center"
                                    min="1"
                                    max={stock}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        )
                        })}
                    </div>
                </ScrollArea>
                <div className="space-y-4 pr-6">
                    <Separator />
                    <div className="space-y-1.5 text-sm">
                        <div className="flex">
                            <span className="flex-1">Subtotal</span>
                            <span>{formatCurrency(totalPrice())}</span>
                        </div>
                         <div className="flex">
                            <span className="flex-1">Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                    </div>
                    <SheetFooter>
                         <Button asChild className="w-full" onClick={handleCheckout}>
                            <Link href="/checkout">Cash On Delivery</Link>
                        </Button>
                    </SheetFooter>
                </div>
            </>
        ) : (
             <div className="flex h-full flex-col items-center justify-center space-y-1">
                <div
                    aria-hidden="true"
                    className="relative mb-4 h-40 w-40 text-muted-foreground"
                >
                    <Image
                    src="https://placehold.co/160x160.png"
                    data-ai-hint="empty cart illustration"
                    fill
                    alt="Empty shopping cart"
                    />
                </div>
                <div className="text-xl font-semibold">Your cart is empty</div>
                <div className="text-sm text-center text-muted-foreground">
                   Looks like you haven&apos;t added anything to your cart yet.
                </div>
             </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
