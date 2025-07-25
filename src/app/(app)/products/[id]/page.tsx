
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/ProductDetails";


export default async function ProductDetailsPage({ params: { id } }: { params: { id: string } }) {
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return <ProductDetails initialProduct={product} />;
}
