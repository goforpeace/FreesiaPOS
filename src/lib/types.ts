
export const productTags = [
  "Hot Sale",
  "Unique",
  "Trendy",
  "Most Sale",
  "Low Price",
  "Discount",
  "Upcoming",
  "Pre-Book",
  "Latest",
] as const;

export type ProductTag = typeof productTags[number];

export interface ProductVariant {
  color: string;
  imageUrls: string[];
  quantity: number;
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
  isFlashSale?: boolean;
  tag?: ProductTag;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  status?: 'follow-up' | 'fraud' | null;
  notes?: string | null;
}

export interface SelectedVariant {
    color: string;
    imageUrl: string;
}

export interface SaleItem {
  productId: string;
  productName: string; // Can be edited
  productDescription?: string | null;
  quantity: number;
  unitPrice: number; // sellPrice at time of sale
  imageUrl?: string | null;
  variant?: { color: string; imageUrl: string | null };
}

export interface Sale {
  id: string; // Invoice Number
  customerId?: string;
  customerName: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerEmail?: string | null;
  items: SaleItem[];
  shippingCost: number;
  discount: number;
  subtotal: number;
  total: number;
  advancePayment?: number;
  balanceDue?: number;
  date: string; // ISO 8601 format
  status: 'pending' | 'accepted' | 'cancelled' | 'pre-order';
  couponCode?: string | null;
}

export interface CartItem extends Product {
    orderQuantity: number;
    selectedVariant?: SelectedVariant;
    variantQuantity?: number;
}

export interface Review {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface Banner {
  id:string;
  imageUrl: string;
  createdAt: string;
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    usageLimit: number;
    timesUsed: number;
    isActive: boolean;
    createdAt: string;
}
