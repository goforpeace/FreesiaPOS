

import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "@/components/web/ProductDetailsClient";
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${product.name} - Freesia Finds`,
    description: product.description,
    openGraph: {
      title: `${product.name} - Freesia Finds`,
      description: product.description,
      images: [
          {
              url: product.imageUrls?.[0] || 'https://placehold.co/600x400.png',
              width: 600,
              height: 600,
              alt: product.name
          },
          ...previousImages
      ],
    },
     twitter: {
        card: "summary_large_image",
        title: `${product.name} - Freesia Finds`,
        description: product.description,
        images: [product.imageUrls?.[0] || 'https://placehold.co/600x400.png'],
    },
  }
}


export default async function PublicProductDetailsPage({ params }: Props) {
    const product = await getProduct(params.id);

    if (!product || product.isRejected) {
        notFound();
    }

    // A product is available if it has no variants and quantity > 0 OR it has at least one variant with quantity > 0
    const isAvailable = 
        (!product.variants || product.variants.length === 0) 
        ? product.quantity > 0 
        : product.variants.some(v => v.quantity > 0);

    if (!isAvailable) {
        notFound();
    }


    return <ProductDetailsClient product={product} />;
}
