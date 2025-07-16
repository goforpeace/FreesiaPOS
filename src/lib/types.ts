export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  quantity: number;
  costPrice: number;
  sellPrice: number;
  isRejected: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface SaleItem {
  productId: string;
  productName: string; // Can be edited
  quantity: number;
  unitPrice: number; // sellPrice at time of sale
}

export interface Sale {
  id: string; // Invoice Number
  customerId: string;
  customerName: string;
  items: SaleItem[];
  shippingCost: number;
  discount: number;
  total: number;
  date: string; // ISO 8601 format
}
