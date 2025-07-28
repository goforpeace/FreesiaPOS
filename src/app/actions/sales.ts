
'use server';

import { db } from '@/lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { Sale, SelectedVariant } from '@/lib/types';

// Define the shape of the data expected from the client
interface SaleItemData {
    productId: string;
    productName: string;
    productDescription?: string | null;
    quantity: number;
    unitPrice: number;
    imageUrl?: string | null;
    variant?: SelectedVariant | null;
}
interface SaleData {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: SaleItemData[];
    shippingCost: number;
    discount: number;
    subtotal: number;
    total: number;
}

export async function createSaleAction(data: SaleData): Promise<{ saleId?: string; error?: string }> {
    try {
        const saleId = await runTransaction(db, async (transaction) => {
            // 1. Check stock and prepare product updates
            for (const item of data.items) {
                const productRef = doc(db, 'products', item.productId);
                const productSnap = await transaction.get(productRef);
                if (!productSnap.exists()) {
                    throw new Error(`Product with ID ${item.productId} not found.`);
                }
                const currentQuantity = productSnap.data().quantity;
                if (currentQuantity < item.quantity) {
                    throw new Error(`Not enough stock for ${productSnap.data().name}. Only ${currentQuantity} left.`);
                }
                const newQuantity = currentQuantity - item.quantity;
                transaction.update(productRef, { quantity: newQuantity });
            }

            // 2. Create the new sale document
            const newId = `inv-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`;
            const saleRef = doc(db, 'sales', newId);

            // Create a new Sale object that matches the Firestore structure
            // Ensure all optional fields are handled correctly
            const newSale: Omit<Sale, 'id'> = {
                customerName: data.customerName,
                customerPhone: data.customerPhone || null,
                customerAddress: data.customerAddress || null,
                items: data.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    productDescription: item.productDescription || null,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    imageUrl: item.imageUrl || null,
                    variant: item.variant || null, // This is now a plain object
                })),
                shippingCost: data.shippingCost || 0,
                discount: data.discount || 0,
                subtotal: data.subtotal,
                total: data.total,
                date: new Date().toISOString(),
                status: 'pending',
            };

            transaction.set(saleRef, newSale);

            return newId;
        });

        return { saleId };

    } catch (error: any) {
        console.error("Error in createSaleAction:", error);
        return { error: error.message };
    }
}
