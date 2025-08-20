

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

import type { Product, Sale, SaleItem, Review, Banner, Customer, Coupon } from './types';
import { ProductFormValues } from '@/components/products/ProductForm';
import { InvoiceFormValues } from '@/components/sales/InvoiceForm';
import { CustomerFormValues } from '@/components/customers/CustomerForm';


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

export const createProduct = async (data: ProductFormValues & { createdAt: string }) => {
  const newId = `prd_id${Math.floor(10025 + Math.random() * 90000)}`;
  const newProductRef = doc(db, 'products', newId);

  await setDoc(newProductRef, {
    ...data,
    isRejected: false,
  });
};


export const updateProduct = async (id: string, data: ProductFormValues & { createdAt: string }) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, data as any);
};

export const setGlobalDiscountDuration = async (hours: number): Promise<number> => {
    const productsSnapshot = await getDocs(query(productsCollection, where("discountedPrice", ">", 0)));
    
    if (productsSnapshot.empty) {
        return 0;
    }

    const batch = writeBatch(db);
    const now = new Date();
    const discountEndDate = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

    productsSnapshot.docs.forEach(productDoc => {
        const productRef = doc(db, 'products', productDoc.id);
        batch.update(productRef, { discountEndDate });
    });

    await batch.commit();
    return productsSnapshot.docs.length;
}


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
    balanceDue: number;
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
    const { originalItems = [], ...saleData } = data;
    const saleRef = doc(db, "sales", id);
    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) throw new Error("Sale not found");
    const existingSaleData = saleSnap.data() as Sale;

    // Only accepted sales affect stock, so if it's not accepted, just update the data.
    if (existingSaleData.status !== 'accepted') {
        await updateDoc(saleRef, saleData as any);
        return;
    }

    // If the sale is 'accepted', we need to run a transaction to adjust stock.
    await runTransaction(db, async (transaction) => {
        const productRefs = new Map<string, ReturnType<typeof doc>>();
        const productDocs = new Map<string, any>();
        
        const allItemProductIds = new Set([
            ...originalItems.map(item => item.productId),
            ...saleData.items.map(item => item.productId)
        ]);

        for (const productId of allItemProductIds) {
            const productRef = doc(db, "products", productId);
            productRefs.set(productId, productRef);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                const productName = saleData.items.find(i => i.productId === productId)?.productName || originalItems.find(i => i.productId === productId)?.productName || 'Unknown Product';
                throw new Error(`Product '${productName}' (ID: ${productId}) not found.`);
            }
            productDocs.set(productId, productDoc.data());
        }

        // Restore stock from original items
        for (const item of originalItems) {
            const productRef = productRefs.get(item.productId);
            if (productRef) {
                const productData = productDocs.get(item.productId);
                const currentQuantity = productData.quantity;
                transaction.update(productRef, { quantity: currentQuantity + item.quantity });
            }
        }

        // Deduct stock for new items
        for (const item of saleData.items) {
             const productRef = productRefs.get(item.productId);
             if (productRef) {
                const productDoc = await transaction.get(productRef); // re-get to ensure we have the restored value
                const currentQuantity = productDoc.data()?.quantity ?? 0;
                 if (currentQuantity < item.quantity) {
                    throw new Error(`Not enough stock for ${productDoc.data()?.name}. Only ${currentQuantity} available.`);
                }
                transaction.update(productRef, { quantity: currentQuantity - item.quantity });
             }
        }
        
        transaction.update(saleRef, saleData as any);
    });
};

export const updateSaleStatus = async (id: string, status: 'pending' | 'accepted' | 'cancelled' | 'pre-order') => {
    const saleRef = doc(db, 'sales', id);
    
    await runTransaction(db, async (transaction) => {
        const saleSnap = await transaction.get(saleRef);
        if (!saleSnap.exists()) {
            throw new Error("Sale not found");
        }

        const sale = saleSnap.data() as Sale;
        const oldStatus = sale.status || 'pending';

        if (oldStatus === status) return; // No change

        // If moving TO accepted FROM a non-accepted state
        if (status === 'accepted' && oldStatus !== 'accepted') {
            for (const item of sale.items) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);
                if (productDoc.exists()) {
                    const newQuantity = productDoc.data().quantity - item.quantity;
                    if (newQuantity < 0) {
                        throw new Error(`Not enough stock for ${productDoc.data().name}. Cannot accept sale.`);
                    }
                    transaction.update(productRef, { quantity: newQuantity });
                }
            }
        } 
        // If moving FROM accepted TO a non-accepted state
        else if (oldStatus === 'accepted' && status !== 'accepted') {
            for (const item of sale.items) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);
                if (productDoc.exists()) {
                    transaction.update(productRef, { quantity: productDoc.data().quantity + item.quantity });
                }
            }
        }
        
        // Finally, update the status
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

        // Restore stock only if the sale was 'accepted'
        if (sale.status === 'accepted') {
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


// CUSTOMERS API
const customersCollection = collection(db, 'customers');

export const getCustomers = async (): Promise<Customer[]> => {
    const q = query(customersCollection, orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
};

export const createCustomer = async (data: CustomerFormValues) => {
    const now = new Date().toISOString();
    await addDoc(customersCollection, {
        ...data,
        createdAt: now,
        updatedAt: now,
    });
};

export const updateCustomer = async (id: string, data: CustomerFormValues) => {
    const docRef = doc(db, 'customers', id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
    });
};


export const deleteCustomer = async (id: string) => {
    const docRef = doc(db, 'customers', id);
    // Note: This does not check for associated sales. Deleting a customer
    // will leave sales documents with a dangling customerId.
    // This is acceptable based on the current app design where sale documents
    // store denormalized customer information.
    await deleteDoc(docRef);
}


// COUPONS API
const couponsCollection = collection(db, 'coupons');

export const getCoupons = async (): Promise<Coupon[]> => {
    const q = query(couponsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
}

export const createCoupon = async (data: Omit<Coupon, 'id' | 'createdAt' | 'timesUsed'>) => {
    await addDoc(couponsCollection, {
        ...data,
        timesUsed: 0,
        createdAt: new Date().toISOString(),
    });
}

export const updateCoupon = async (id: string, data: Partial<Omit<Coupon, 'id' | 'createdAt' | 'timesUsed'>>) => {
    const docRef = doc(db, 'coupons', id);
    await updateDoc(docRef, data);
}

export const deleteCoupon = async (id: string) => {
    const docRef = doc(db, 'coupons', id);
    await deleteDoc(docRef);
}
