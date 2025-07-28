

export interface ProductVariant {
  color: string;
  imageUrls: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  variants?: ProductVariant[];
  imageUrls: string[]; // Keep for backward compatibility/fallback
  quantity: number;
  costPrice: number;
  sellPrice: number;
  discountedPrice?: number;
  isRejected: boolean;
  createdAt?: string;
  isNewArrival?: boolean;
  isOfferSale?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface SelectedVariant {
    color: string;
    imageUrl: string;
}

export interface SaleItem {
  productId: string;
  productName: string; // Can be edited
  productDescription?: string;
  quantity: number;
  unitPrice: number; // sellPrice at time of sale
  imageUrl?: string;
  variant?: SelectedVariant;
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
  status: 'pending' | 'accepted' | 'cancelled';
}

export interface CartItem extends Product {
    orderQuantity: number;
    selectedVariant?: SelectedVariant;
}

export interface Review {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  createdAt: string;
}
