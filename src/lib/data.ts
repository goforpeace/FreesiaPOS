import type { Product, Sale } from './types';

// Let's use a Map for easier lookups and mutations.
export const products: Map<string, Product> = new Map([
  [
    'prod_001',
    {
      id: 'prod_001',
      name: 'Elegant Violet Vase',
      description: 'A beautifully crafted ceramic vase, perfect for any modern home.',
      imageUrl: 'https://placehold.co/400x400.png',
      quantity: 25,
      costPrice: 2500,
      sellPrice: 5500,
      isRejected: false,
    },
  ],
  [
    'prod_002',
    {
      id: 'prod_002',
      name: 'Orchid Pink Silk Scarf',
      description: '100% pure silk scarf with a delicate floral pattern.',
      imageUrl: 'https://placehold.co/400x400.png',
      quantity: 40,
      costPrice: 1500,
      sellPrice: 3500,
      isRejected: false,
    },
  ],
  [
    'prod_003',
    {
      id: 'prod_003',
      name: 'Minimalist Wall Clock',
      description: 'A silent, non-ticking wall clock with a clean design.',
      imageUrl: 'https://placehold.co/400x400.png',
      quantity: 15,
      costPrice: 3000,
      sellPrice: 6500,
      isRejected: false,
    },
  ],
  [
    'prod_004',
    {
      id: 'prod_004',
      name: 'Bohemian Tasseled Cushion',
      description: 'Add a touch of boho chic to your living space.',
      imageUrl: 'https://placehold.co/400x400.png',
      quantity: 50,
      costPrice: 1200,
      sellPrice: 2950,
      isRejected: true,
    },
  ],
  [
    'prod_005',
    {
      id: 'prod_005',
      name: 'Artisan Scented Candle',
      description: 'Hand-poured soy wax candle with lavender and vanilla notes.',
      imageUrl: 'https://placehold.co/400x400.png',
      quantity: 0,
      costPrice: 850,
      sellPrice: 2000,
      isRejected: false,
    },
  ],
]);

export const sales: Map<string, Sale> = new Map([
  [
    'INV-2024001',
    {
      id: 'INV-2024001',
      customerId: 'cust_01',
      customerName: 'Alice Johnson',
      customerPhone: '01700000001',
      customerAddress: '123 Gulshan, Dhaka',
      items: [
        { productId: 'prod_001', productName: 'Elegant Violet Vase', quantity: 1, unitPrice: 5500 },
        { productId: 'prod_003', productName: 'Minimalist Wall Clock', quantity: 1, unitPrice: 6500 },
      ],
      shippingCost: 100,
      discount: 500,
      subtotal: 12000,
      total: 11600,
      date: '2024-05-20T10:30:00Z',
    },
  ],
  [
    'INV-2024002',
    {
      id: 'INV-2024002',
      customerId: 'cust_02',
      customerName: 'Bob Williams',
      customerPhone: '01800000002',
      customerAddress: '456 Banani, Dhaka',
      items: [
        { productId: 'prod_002', productName: 'Orchid Pink Silk Scarf', quantity: 2, unitPrice: 3500 },
      ],
      shippingCost: 50,
      discount: 0,
      subtotal: 7000,
      total: 7050,
      date: '2024-05-22T14:00:00Z',
    },
  ],
  [
    'INV-2024003',
    {
      id: 'INV-2024003',
      customerId: 'cust_03',
      customerName: 'Charlie Brown',
      customerPhone: '01900000003',
      customerAddress: '789 Dhanmondi, Dhaka',
      items: [
        { productId: 'prod_004', productName: 'Bohemian Tasseled Cushion', quantity: 4, unitPrice: 2950 },
      ],
      shippingCost: 150,
      discount: 1000,
      subtotal: 11800,
      total: 10950,
      date: '2024-05-23T11:45:00Z',
    },
  ],
]);
