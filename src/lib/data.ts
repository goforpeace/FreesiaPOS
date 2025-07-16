import type { Product, Sale } from './types';

export const products: Product[] = [
  {
    id: 'prod_001',
    name: 'Elegant Violet Vase',
    description: 'A beautifully crafted ceramic vase, perfect for any modern home.',
    imageUrl: 'https://placehold.co/400x400.png',
    quantity: 25,
    costPrice: 22.50,
    sellPrice: 49.99,
    isRejected: false,
  },
  {
    id: 'prod_002',
    name: 'Orchid Pink Silk Scarf',
    description: '100% pure silk scarf with a delicate floral pattern.',
    imageUrl: 'https://placehold.co/400x400.png',
    quantity: 40,
    costPrice: 15.00,
    sellPrice: 35.00,
    isRejected: false,
  },
  {
    id: 'prod_003',
    name: 'Minimalist Wall Clock',
    description: 'A silent, non-ticking wall clock with a clean design.',
    imageUrl: 'https://placehold.co/400x400.png',
    quantity: 15,
    costPrice: 30.00,
    sellPrice: 65.00,
    isRejected: false,
  },
  {
    id: 'prod_004',
    name: 'Bohemian Tasseled Cushion',
    description: 'Add a touch of boho chic to your living space.',
    imageUrl: 'https://placehold.co/400x400.png',
    quantity: 50,
    costPrice: 12.00,
    sellPrice: 29.50,
    isRejected: true,
  },
  {
    id: 'prod_005',
    name: 'Artisan Scented Candle',
    description: 'Hand-poured soy wax candle with lavender and vanilla notes.',
    imageUrl: 'https://placehold.co/400x400.png',
    quantity: 0,
    costPrice: 8.50,
    sellPrice: 19.99,
    isRejected: false,
  },
];

export const sales: Sale[] = [
  {
    id: 'INV-2024001',
    customerId: 'cust_01',
    customerName: 'Alice Johnson',
    items: [
      { productId: 'prod_001', productName: 'Elegant Violet Vase', quantity: 1, unitPrice: 49.99 },
      { productId: 'prod_003', productName: 'Minimalist Wall Clock', quantity: 1, unitPrice: 65.00 },
    ],
    shippingCost: 10.00,
    discount: 5.00,
    total: 119.99,
    date: '2024-05-20T10:30:00Z',
  },
  {
    id: 'INV-2024002',
    customerId: 'cust_02',
    customerName: 'Bob Williams',
    items: [
      { productId: 'prod_002', productName: 'Orchid Pink Silk Scarf', quantity: 2, unitPrice: 35.00 },
    ],
    shippingCost: 5.00,
    discount: 0.00,
    total: 75.00,
    date: '2024-05-22T14:00:00Z',
  },
  {
    id: 'INV-2024003',
    customerId: 'cust_03',
    customerName: 'Charlie Brown',
    items: [
      { productId: 'prod_004', productName: 'Bohemian Tasseled Cushion', quantity: 4, unitPrice: 29.50 },
    ],
    shippingCost: 15.00,
    discount: 10.00,
    total: 123.00,
    date: '2024-05-23T11:45:00Z',
  },
];
