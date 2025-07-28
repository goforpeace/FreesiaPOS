
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
} from 'firebase/firestore';

import type { Product, Sale, SaleItem } from './types';
import { ProductFormValues } from '@/components/products/ProductForm';
import { InvoiceFormValues } from '@/components/sales/InvoiceForm';


// PRODUCTS API

const productsCollection = collection(db, 'products');

export const getProducts = async (): Promise<Product[]> => {
  const q = query(productsCollection, orderBy('name'));
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
  await addDoc(productsCollection, {
    ...data,
    isRejected: false,
    createdAt: new Date().toISOString(),
  });
};

export const updateProduct = async (id: string, data: ProductFormValues) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, data);
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

export const createSale = async (data: SaleFormData) => {
    const batch = writeBatch(db);

    // Update stock
    for (const item of data.items) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const currentQuantity = productSnap.data().quantity;
            if (currentQuantity < item.quantity) {
                throw new Error(`Not enough stock for ${productSnap.data().name}`);
            }
            batch.update(productRef, { quantity: currentQuantity - item.quantity });
        }
    }
    
    const newSaleRef = doc(salesCollection);
    const newId = newSaleRef.id.slice(0, 8).toUpperCase();

    const newSale: Omit<Sale, 'id'> = {
        ...data,
        date: new Date().toISOString(),
        status: 'pending', // All sales start as pending
    };

    batch.set(doc(db, 'sales', newId), newSale);

    await batch.commit();
    return newId;
};

export const updateSale = async (id: string, data: SaleFormData, originalItems: SaleItem[]) => {
    await runTransaction(db, async (transaction) => {
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
        for (const item of data.items) {
            const productRef = doc(db, "products", item.productId);
            const productDoc = await transaction.get(productRef);
            if (productDoc.exists()) {
                 const newQuantity = productDoc.data().quantity - item.quantity;
                 if (newQuantity < 0) {
                     throw new Error(`Not enough stock for ${productDoc.data().name}`);
                 }
                transaction.update(productRef, { quantity: newQuantity });
            }
        }

        // 3. Update the sale document
        const saleRef = doc(db, "sales", id);
        const saleSnap = await transaction.get(saleRef);
        const updatedSale: Partial<Sale> = { ...data };
        transaction.update(saleRef, {
            ...updatedSale,
            date: saleSnap.data()?.date || new Date().toISOString()
        });
    });
};

export const updateSaleStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const saleRef = doc(db, 'sales', id);
    await updateDoc(saleRef, { status });
};


export const deleteSale = async (id: string) => {
    const saleRef = doc(db, 'sales', id);
    const batch = writeBatch(db);

    const saleSnap = await getDoc(saleRef);
    const sale = saleSnap.data() as Sale;

    if (!sale) {
        throw new Error("Sale not found");
    }

    // Restore stock only if the sale wasn't cancelled (as cancelling would have already restored it)
    if (sale.status !== 'cancelled') {
        for (const item of sale.items) {
            const productRef = doc(db, 'products', item.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                const currentQuantity = productSnap.data().quantity;
                batch.update(productRef, { quantity: currentQuantity + item.quantity });
            }
        }
    }

    batch.delete(saleRef);
    await batch.commit();
};

// Remove the old client-side local storage functions
// getProductsFromStorage, saveProductsToStorage, getSalesFromStorage, saveSalesToStorage
// The entire logic is now handled by Firestore functions above.
