

import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  where,
  runTransaction,
  setDoc,
} from 'firebase/firestore';

import type { Product, Sale, SaleItem, Review, Banner } from './types';
import { ProductFormValues } from '@/components/products/ProductForm';
import { InvoiceFormValues } from '@/components/sales/InvoiceForm';


// PRODUCTS API

const productsCollection = collection(db, 'products');

export const getProducts = async (): Promise<Product[]> => {
  const q = query(productsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return undefined;
};

export const createProduct = async (data: ProductFormValues) => {
  const newId = `prd_id${Math.floor(10025 + Math.random() * 90000)}`;
  const newProductRef = doc(db, 'products', newId);

  await setDoc(newProductRef, {
    ...data,
    isRejected: false,
    createdAt: new Date().toISOString(),
  });
};


export const updateProduct = async (id: string, data: ProductFormValues) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, data as any);
};


export const deleteProduct = async (id: string) => {
  const salesCollection = collection(db, 'sales');
  const q = query(salesCollection, where('items', 'array-contains', { productId: id }));
  const salesSnapshot = await getDocs(q);

  if (!salesSnapshot.empty) {
    const saleIds = salesSnapshot.docs.map(d => d.id).join(', ');
    throw new Error(`Cannot delete product. It is part of sale(s): ${saleIds}`);
  }

  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
};

export const rejectProduct = async (id: string) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, { isRejected: true });
};


// SALES API
const salesCollection = collection(db, 'sales');

type SaleFormData = InvoiceFormValues & {
    items: SaleItem[];
    subtotal: number;
    total: number;
    originalItems?: SaleItem[];
}

export const getSales = async (): Promise<Sale[]> => {
    const q = query(salesCollection, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
};

export const getSale = async (id: string): Promise<Sale | undefined> => {
    const docRef = doc(db, 'sales', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Sale;
    }
    return undefined;
};

export const updateSale = async (id: string, data: SaleFormData) => {
    const { originalItems, ...saleData } = data;
    if (!originalItems) {
        throw new Error("Original items not provided for sale update.");
    }
    
    await runTransaction(db, async (transaction) => {
        const saleRef = doc(db, "sales", id);

        // 1. Restore stock from original items
        for (const item of originalItems) {
            const productRef = doc(db, "products", item.productId);
            const productDoc = await transaction.get(productRef);
            if (productDoc.exists()) {
                const newQuantity = (productDoc.data().quantity || 0) + item.quantity;
                transaction.update(productRef, { quantity: newQuantity });
            }
        }

        // 2. Deduct stock for new/updated items
        for (const item of saleData.items) {
            const productRef = doc(db, "products", item.productId);
            const productDoc = await transaction.get(productRef);
            if (productDoc.exists()) {
                 const currentQuantity = productDoc.data().quantity;
                 const newQuantity = currentQuantity - item.quantity;
                 if (newQuantity < 0) {
                     throw new Error(`Not enough stock for ${productDoc.data().name}. Only ${currentQuantity} available.`);
                 }
                transaction.update(productRef, { quantity: newQuantity });
            } else {
                 throw new Error(`Product ${item.productName} not found during update.`);
            }
        }

        // 3. Update the sale document
        transaction.update(saleRef, saleData as any);
    });
};

export const updateSaleStatus = async (id: string, status: 'pending' | 'accepted' | 'cancelled') => {
    const saleRef = doc(db, 'sales', id);
    
    await runTransaction(db, async (transaction) => {
        const saleSnap = await transaction.get(saleRef);
        if (!saleSnap.exists()) {
            throw new Error("Sale not found");
        }

        const sale = saleSnap.data() as Sale;
        const oldStatus = sale.status || 'pending';

        // No change if status is the same
        if (oldStatus === status) return;

        // Logic for restoring or deducting stock based on status change
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            // Restore stock if moving to cancelled
            for (const item of sale.items) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);
                if(productDoc.exists()){
                    transaction.update(productRef, { quantity: productDoc.data().quantity + item.quantity });
                }
            }
        } else if (oldStatus === 'cancelled' && status !== 'cancelled') {
            // Deduct stock if moving away from cancelled
             for (const item of sale.items) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);
                if(productDoc.exists()) {
                     const newQuantity = productDoc.data().quantity - item.quantity;
                     if (newQuantity < 0) {
                         throw new Error(`Not enough stock for ${productDoc.data().name} to un-cancel this sale.`);
                     }
                    transaction.update(productRef, { quantity: newQuantity });
                }
            }
        }
        
        transaction.update(saleRef, { status });
    });
};


export const deleteSale = async (id: string) => {
    const saleRef = doc(db, 'sales', id);
    
    await runTransaction(db, async (transaction) => {
        const saleSnap = await transaction.get(saleRef);
        if (!saleSnap.exists()) {
            throw new Error("Sale not found");
        }
        const sale = saleSnap.data() as Sale;

        // Restore stock only if the sale wasn't cancelled (as cancelling would have already restored it)
        if (sale.status !== 'cancelled') {
            for (const item of sale.items) {
                const productRef = doc(db, 'products', item.productId);
                const productSnap = await transaction.get(productRef);
                if (productSnap.exists()) {
                    const currentQuantity = productSnap.data().quantity;
                    transaction.update(productRef, { quantity: currentQuantity + item.quantity });
                }
            }
        }

        transaction.delete(saleRef);
    });
};

// REVIEWS API
const reviewsCollection = collection(db, 'reviews');

export const getReviews = async (): Promise<Review[]> => {
  const q = query(reviewsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}

export const createReview = async (imageUrl: string) => {
  await addDoc(reviewsCollection, {
    imageUrl,
    createdAt: new Date().toISOString(),
  });
}

export const deleteReview = async (id: string) => {
  const docRef = doc(db, 'reviews', id);
  await deleteDoc(docRef);
}

// BANNERS API
const bannersCollection = collection(db, 'banners');

export const getBanners = async (): Promise<Banner[]> => {
  const q = query(bannersCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
}

export const createBanner = async (imageUrl: string) => {
  await addDoc(bannersCollection, {
    imageUrl,
    createdAt: new Date().toISOString(),
  });
}

export const deleteBanner = async (id: string) => {
  const docRef = doc(db, 'banners', id);
  await deleteDoc(docRef);
}
