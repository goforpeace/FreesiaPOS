
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';

export interface CartItem extends Product {
    orderQuantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { toast } = useToast.getState();
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.id === product.id);

                if (existingItem) {
                    if (existingItem.orderQuantity < product.quantity) {
                        set({
                            items: currentItems.map((item) =>
                                item.id === product.id
                                    ? { ...item, orderQuantity: item.orderQuantity + 1 }
                                    : item
                            ),
                        });
                        toast({ title: "Added to cart", description: `Another "${product.name}" was added.` });
                    } else {
                         toast({ title: "Stock limit reached", description: `No more stock available for "${product.name}".`, variant: "destructive" });
                    }
                } else {
                    if (product.quantity > 0) {
                        set({ items: [...currentItems, { ...product, orderQuantity: 1 }] });
                        toast({ title: "Added to cart", description: `"${product.name}" has been added to your cart.` });
                    } else {
                        toast({ title: "Out of stock", description: `"${product.name}" is currently out of stock.`, variant: "destructive" });
                    }
                }
            },
            removeItem: (productId) => {
                 const { toast } = useToast.getState();
                 const product = get().items.find(item => item.id === productId);
                 if(product) {
                    toast({ title: "Removed from cart", description: `"${product.name}" has been removed from your cart.` });
                 }
                set({
                    items: get().items.filter((item) => item.id !== productId),
                });
            },
            updateQuantity: (productId, quantity) => {
                const product = get().items.find(item => item.id === productId);
                if (!product) return;
                
                const newQuantity = Math.max(1, Math.min(quantity, product.quantity));

                if (quantity > product.quantity) {
                     const { toast } = useToast.getState();
                     toast({
                        title: "Stock limit reached",
                        description: `Only ${product.quantity} units of ${product.name} available.`,
                        variant: "destructive"
                    })
                }

                set({
                    items: get().items.map((item) =>
                        item.id === productId ? { ...item, orderQuantity: newQuantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => {
                return get().items.reduce((total, item) => total + item.orderQuantity, 0);
            },
            totalPrice: () => {
                return get().items.reduce((total, item) => total + item.sellPrice * item.orderQuantity, 0);
            }
        }),
        {
            name: 'freesia-finds-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
