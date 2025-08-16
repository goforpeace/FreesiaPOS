
'use server';

import { db } from '@/lib/firebase';
import { doc, runTransaction, collection, getDoc, query, where, getDocs, limit, setDoc, updateDoc } from 'firebase/firestore';
import type { Sale, Product, Customer, Coupon, ProductVariant } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Define the shape of the data expected from the form
interface SaleItemData {
    productId: string;
    productName: string;
    productDescription?: string | null;
    quantity: number;
    unitPrice: number;
    imageUrl?: string | null;
    variantColor?: string | null;
    variantImageUrl?: string | null;
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
    couponCode?: string;
}


export async function createSaleAction(data: SaleData): Promise<{ saleId?: string; error?: string }> {
    try {
        const saleId = await runTransaction(db, async (transaction) => {
            // 1. Validate coupon if provided
            let couponData: Coupon | null = null;
            let couponRef = null;
            if (data.couponCode) {
                const couponQuery = query(collection(db, 'coupons'), where('code', '==', data.couponCode.toUpperCase()), limit(1));
                const couponSnapshot = await getDocs(couponQuery);
                if (couponSnapshot.empty) {
                    throw new Error('Invalid coupon code.');
                }
                const couponDoc = couponSnapshot.docs[0];
                couponRef = couponDoc.ref;
                const couponDocSnap = await transaction.get(couponRef); // Get the doc within the transaction
                couponData = { id: couponDocSnap.id, ...couponDocSnap.data() } as Coupon;


                if (!couponData.isActive) {
                    throw new Error('This coupon is no longer active.');
                }
                if (couponData.timesUsed >= couponData.usageLimit) {
                    throw new Error('This coupon has reached its usage limit.');
                }
            }


            // 2. Check product existence (stock check is deferred)
            for (const item of data.items) {
                const productRef = doc(db, 'products', item.productId);
                const productSnap = await transaction.get(productRef);
                if (!productSnap.exists()) {
                    throw new Error(`Product with ID ${item.productId} not found.`);
                }
            }

            // 3. Create or update customer
            const customersRef = collection(db, 'customers');
            const customerQuery = query(customersRef, where('phone', '==', data.customerPhone), limit(1));
            const customerSnapshot = await getDocs(customerQuery);
            const now = new Date().toISOString();
            
            let customerId;
            if (customerSnapshot.empty) {
                // New customer
                const newCustomerRef = doc(customersRef);
                const newCustomer: Omit<Customer, 'id'> = {
                    name: data.customerName,
                    phone: data.customerPhone,
                    address: data.customerAddress,
                    createdAt: now,
                    updatedAt: now,
                };
                transaction.set(newCustomerRef, newCustomer);
                customerId = newCustomerRef.id;
            } else {
                // Existing customer, update their info
                const existingCustomerRef = customerSnapshot.docs[0].ref;
                customerId = existingCustomerRef.id;
                transaction.update(existingCustomerRef, {
                    name: data.customerName,
                    address: data.customerAddress,
                    updatedAt: now,
                });
            }


            // 4. Create the new sale document
            const newId = `inv-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`;
            const saleRef = doc(db, 'sales', newId);
            
            const newSale: Omit<Sale, 'id'> = {
                customerId,
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
                    variant: item.variantColor ? { color: item.variantColor, imageUrl: item.variantImageUrl || '' } : null,
                })),
                shippingCost: data.shippingCost || 0,
                discount: data.discount || 0,
                subtotal: data.subtotal,
                total: data.total,
                date: now,
                status: 'pending',
                couponCode: data.couponCode || null,
            };

            transaction.set(saleRef, newSale);

            // 5. Update coupon usage
            if (couponData && couponRef) {
                transaction.update(couponRef, { timesUsed: couponData.timesUsed + 1 });
            }

            return newId;
        });
        
        // Revalidate paths to show updated data
        revalidatePath('/');
        revalidatePath('/control-panel');
        revalidatePath('/products');
        revalidatePath('/customers');
        revalidatePath('/coupons');

        return { saleId };

    } catch (error: any) {
        console.error("Error in createSaleAction:", error);
        return { error: error.message };
    }
}

export async function checkCoupon(couponCode: string): Promise<{ data?: Coupon; error?: string }> {
    if (!couponCode) {
        return { error: 'Please enter a coupon code.' };
    }
    try {
        const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { error: 'Invalid coupon code.' };
        }

        const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Coupon;

        if (!coupon.isActive) {
            return { error: 'This coupon is no longer active.' };
        }
        if (coupon.timesUsed >= coupon.usageLimit) {
            return { error: 'This coupon has reached its usage limit.' };
        }

        return { data: coupon };
    } catch (e: any) {
        return { error: e.message };
    }
}
