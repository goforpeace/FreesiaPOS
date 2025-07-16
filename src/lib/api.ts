// This file now contains client-side functions for interacting with localStorage.

import { 
    getProductsFromStorage, 
    saveProductsToStorage, 
    getSalesFromStorage, 
    saveSalesToStorage 
} from "./data";
import type { Product, Sale } from "./types";
import { ProductFormValues } from "@/components/products/ProductForm";
import { InvoiceFormValues } from "@/components/sales/InvoiceForm";
import type { SaleItem } from "./types";

// PRODUCTS API

export const getProducts = (): Product[] => {
    return getProductsFromStorage();
};

export const getProduct = (id: string): Product | undefined => {
    const products = getProductsFromStorage();
    return products.find(p => p.id === id);
};

export const createProduct = (data: ProductFormValues) => {
    const products = getProductsFromStorage();
    const newId = `prod_${String(Date.now()).slice(-4)}`;
    const newProduct: Product = {
        id: newId,
        isRejected: false,
        ...data
    };
    const updatedProducts = [...products, newProduct];
    saveProductsToStorage(updatedProducts);
};

export const updateProduct = (id: string, data: ProductFormValues) => {
    const products = getProductsFromStorage();
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...data } : p);
    saveProductsToStorage(updatedProducts);
};

export const deleteProduct = (id: string) => {
    let products = getProductsFromStorage();
    const sales = getSalesFromStorage();
    
    const isProductInSale = sales.some(sale => sale.items.some(item => item.productId === id));
    if (isProductInSale) {
        throw new Error("Cannot delete product that is part of a sale.");
    }
    
    products = products.filter(p => p.id !== id);
    saveProductsToStorage(products);
};

export const rejectProduct = (id: string) => {
    const products = getProductsFromStorage();
    const updatedProducts = products.map(p => p.id === id ? { ...p, isRejected: true } : p);
    saveProductsToStorage(updatedProducts);
};


// SALES API

type SaleFormData = InvoiceFormValues & {
    items: SaleItem[];
    subtotal: number;
    total: number;
}

export const getSales = (): Sale[] => {
    const sales = getSalesFromStorage();
    return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getSale = (id: string): Sale | undefined => {
    const sales = getSalesFromStorage();
    return sales.find(s => s.id === id);
};

export const createSale = (data: SaleFormData) => {
    let products = getProductsFromStorage();
    let sales = getSalesFromStorage();

    // Update stock
    for (const item of data.items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
            products[productIndex].quantity -= item.quantity;
        }
    }

    const newId = `INV-${String(new Date().getFullYear())}${String(sales.length + 1).padStart(3, '0')}`;
    const newSale: Sale = {
        id: newId,
        date: new Date().toISOString(),
        ...data
    };

    saveProductsToStorage(products);
    saveSalesToStorage([...sales, newSale]);
};

export const updateSale = (id: string, data: SaleFormData, originalItems: SaleItem[]) => {
    let products = getProductsFromStorage();
    let sales = getSalesFromStorage();

    // Restore stock from original items
    for (const item of originalItems) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
            products[productIndex].quantity += item.quantity;
        }
    }

    // Deduct stock for new items
     for (const item of data.items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
            products[productIndex].quantity -= item.quantity;
        }
    }

    const updatedSale: Sale = {
        ...data,
        id: id,
        date: sales.find(s => s.id === id)?.date || new Date().toISOString()
    };
    
    const updatedSales = sales.map(s => s.id === id ? updatedSale : s);
    
    saveProductsToStorage(products);
    saveSalesToStorage(updatedSales);
};


export const deleteSale = (id: string) => {
    let products = getProductsFromStorage();
    let sales = getSalesFromStorage();
    
    const sale = sales.find(s => s.id === id);
    if (!sale) {
        throw new Error("Sale not found");
    }

    // Restore stock
    for (const item of sale.items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
            products[productIndex].quantity += item.quantity;
        }
    }

    const updatedSales = sales.filter(s => s.id !== id);

    saveProductsToStorage(products);
    saveSalesToStorage(updatedSales);
};
