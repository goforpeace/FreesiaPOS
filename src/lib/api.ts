import "server-only";
import { products, sales } from "./data";
import { Product, Sale } from "./types";

// Simulate a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts(): Promise<Product[]> {
    await delay(100);
    return Array.from(products.values());
}

export async function getProduct(id: string): Promise<Product | undefined> {
    await delay(100);
    return products.get(id);
}

export async function getSales(): Promise<Sale[]> {
    await delay(100);
    return Array.from(sales.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getSale(id: string): Promise<Sale | undefined> {
    await delay(100);
    return sales.get(id);
}
