export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  quantity: number;
  costPrice: number;
  sellPrice: number;
  isRejected: boolean;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface SaleItem {
  productId: string;
  productName: string; // Can be edited
  productDescription?: string;
  quantity: number;
  unitPrice: number; // sellPrice at time of sale
  imageUrl?: string;
}

export interface Sale {
  id: string; // Invoice Number
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: SaleItem[];
  shippingCost: number;
  discount: number;
  subtotal: number;
  total: number;
  date: string; // ISO 8601 format
}
