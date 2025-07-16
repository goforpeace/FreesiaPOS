"use server";

import { revalidatePath } from "next/cache";
import { products, sales } from "./data";
import type { Product, Sale } from "./types";
import { ProductFormValues } from "@/components/products/ProductForm";

type SaleFormData = Omit<Sale, "id" | "date">;

// Simulate a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// PRODUCTS
export async function createProduct(data: ProductFormValues) {
    await delay(500);
    const newId = `prod_${String(products.size + 1).padStart(3, '0')}`;
    const newProduct: Product = {
        id: newId,
        isRejected: false,
        ...data
    };
    products.set(newId, newProduct);
    revalidatePath("/products");
    revalidatePath("/dashboard");
}

export async function updateProduct(id: string, data: ProductFormValues) {
    await delay(500);
    const product = products.get(id);
    if (!product) {
        throw new Error("Product not found");
    }
    const updatedProduct = { ...product, ...data };
    products.set(id, updatedProduct);
    revalidatePath(`/products`);
    revalidatePath(`/products/${id}/edit`);
    revalidatePath("/dashboard");
}

export async function deleteProduct(id: string) {
    await delay(500);
    if (!products.has(id)) {
        throw new Error("Product not found");
    }
    products.delete(id);
    revalidatePath("/products");
    revalidatePath("/dashboard");
}

export async function rejectProduct(id: string) {
    await delay(500);
     const product = products.get(id);
    if (!product) {
        throw new Error("Product not found");
    }
    product.isRejected = true;
    products.set(id, product);
    revalidatePath("/products");
    revalidatePath("/dashboard");
}

// SALES
export async function createSale(data: SaleFormData) {
    await delay(500);

    // Update stock
    for (const item of data.items) {
        const product = products.get(item.productId);
        if (product) {
            product.quantity -= item.quantity;
            products.set(item.productId, product);
        }
    }

    const newId = `INV-${String(new Date().getFullYear())}${String(sales.size + 1).padStart(3, '0')}`;
    const newSale: Sale = {
        id: newId,
        date: new Date().toISOString(),
        ...data
    };

    sales.set(newId, newSale);

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    revalidatePath("/products");
}

export async function deleteSale(id: string) {
    await delay(500);
    const sale = sales.get(id);
    if (!sale) {
        throw new Error("Sale not found");
    }

    // Restore stock
    for (const item of sale.items) {
        const product = products.get(item.productId);
        if (product) {
            product.quantity += item.quantity;
            products.set(item.productId, product);
        }
    }

    sales.delete(id);

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    revalidatePath("/products");
}