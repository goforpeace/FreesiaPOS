
import { getProducts } from '@/lib/api';
import { MetadataRoute } from 'next';

const URL = 'https://freesia-finds-pos-82fbs.web.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const productEntries: MetadataRoute.Sitemap = products
    .filter(product => !product.isRejected && product.quantity > 0)
    .map(({ id, createdAt }) => ({
      url: `${URL}/product/${id}`,
      lastModified: createdAt ? new Date(createdAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    {
      url: URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
        url: `${URL}/reviews`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    },
    {
        url: `${URL}/checkout`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
    },
    ...productEntries,
  ];
}
