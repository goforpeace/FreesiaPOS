
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, SelectedVariant } from '@/lib/types';
import { toast } from './use-toast';

export interface CartItem extends Product {
    orderQuantity: number;
    selectedVariant?: SelectedVariant;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product, selectedVariant?: SelectedVariant) => void;
    removeItem: (productId: string, variantColor?: string) => void;
    updateQuantity: (productId: string, quantity: number, variantColor?: string) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, selectedVariant) => {
                const currentItems = get().items;
                // An item is unique by its ID and its selected variant color
                const existingItem = currentItems.find((item) => 
                    item.id === product.id && item.selectedVariant?.color === selectedVariant?.color
                );

                const itemIdentifier = selectedVariant 
                    ? `"${product.name}" (${selectedVariant.color})` 
                    : `"${product.name}"`;

                if (existingItem) {
                    if (existingItem.orderQuantity < product.quantity) {
                        set({
                            items: currentItems.map((item) =>
                                (item.id === product.id && item.selectedVariant?.color === selectedVariant?.color)
                                    ? { ...item, orderQuantity: item.orderQuantity + 1 }
                                    : item
                            ),
                        });
                        toast({ title: "Added to cart", description: `Another ${itemIdentifier} was added.` });
                    } else {
                         toast({ title: "Stock limit reached", description: `No more stock available for ${itemIdentifier}.`, variant: "destructive" });
                    }
                } else {
                    if (product.quantity > 0) {
                        const newCartItem: CartItem = { 
                            ...product, 
                            orderQuantity: 1, 
                            ...(selectedVariant && { selectedVariant })
                        };
                        set({ items: [...currentItems, newCartItem] });
                        toast({ title: "Added to cart", description: `${itemIdentifier} has been added to your cart.` });
                    } else {
                        toast({ title: "Out of stock", description: `${itemIdentifier} is currently out of stock.`, variant: "destructive" });
                    }
                }
            },
            removeItem: (productId, variantColor) => {
                 const itemToRemove = get().items.find(item => item.id === productId && item.selectedVariant?.color === variantColor);
                 if(itemToRemove) {
                    const itemIdentifier = itemToRemove.selectedVariant
                        ? `"${itemToRemove.name}" (${itemToRemove.selectedVariant.color})`
                        : `"${itemToRemove.name}"`;
                    toast({ title: "Removed from cart", description: `${itemIdentifier} has been removed from your cart.` });
                 }
                set({
                    items: get().items.filter((item) => 
                        !(item.id === productId && item.selectedVariant?.color === variantColor)
                    ),
                });
            },
            updateQuantity: (productId, quantity, variantColor) => {
                const product = get().items.find(item => item.id === productId && item.selectedVariant?.color === variantColor);
                if (!product) return;
                
                const newQuantity = Math.max(1, Math.min(quantity, product.quantity));

                 const itemIdentifier = product.selectedVariant
                    ? `"${product.name}" (${product.selectedVariant.color})`
                    : `"${product.name}"`;

                if (quantity > product.quantity) {
                     toast({
                        title: "Stock limit reached",
                        description: `Only ${product.quantity} units of ${itemIdentifier} available.`,
                        variant: "destructive"
                    })
                }

                set({
                    items: get().items.map((item) =>
                        (item.id === productId && item.selectedVariant?.color === variantColor) 
                            ? { ...item, orderQuantity: newQuantity } 
                            : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => {
                return get().items.reduce((total, item) => total + item.orderQuantity, 0);
            },
            totalPrice: () => {
                 const items = get().items;
                 return items.reduce((total, item) => {
                    const price = item.discountedPrice && item.discountedPrice > 0 ? item.discountedPrice : item.sellPrice;
                    return total + price * item.orderQuantity;
                 }, 0);
            }
        }),
        {
            name: 'freesia-finds-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
