
// This file is now intended for client-side localStorage interaction.

import type { Product, Sale } from './types';

const PRODUCTS_KEY = 'freesia-finds-products';
const SALES_KEY = 'freesia-finds-sales';

// --- INITIAL DATA ---
// Used to seed localStorage if it's empty.

const initialProducts: Product[] = [];
const initialSales: Sale[] = [];


// --- PRODUCT FUNCTIONS ---

export const getProductsFromStorage = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const storedProducts = localStorage.getItem(PRODUCTS_KEY);
  if (storedProducts) {
    return JSON.parse(storedProducts);
  }
  // If no products, seed the storage
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
  return initialProducts;
};

export const saveProductsToStorage = (products: Product[]): void => {
   if (typeof window === 'undefined') return;
   localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
   // Dispatch a storage event to notify other tabs/windows
   window.dispatchEvent(new Event('storage'));
};

// --- SALES FUNCTIONS ---

export const getSalesFromStorage = (): Sale[] => {
  if (typeof window === 'undefined') return [];
  const storedSales = localStorage.getItem(SALES_KEY);
  if (storedSales) {
    return JSON.parse(storedSales);
  }
  // If no sales, seed the storage
  localStorage.setItem(SALES_KEY, JSON.stringify(initialSales));
  return initialSales;
};

export const saveSalesToStorage = (sales: Sale[]): void => {
   if (typeof window === 'undefined') return;
   localStorage.setItem(SALES_KEY, JSON.stringify(sales));
   // Dispatch a storage event to notify other tabs/windows
   window.dispatchEvent(new Event('storage'));
};
