

"use client";

import { useEffect, useState } from "react";
import { getProduct } from "@/lib/api";
import { notFound, useParams } from "next/navigation";
import { ProductDetails } from "@/components/products/ProductDetails";
import type { Product } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";


export default function ProductDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null | undefined>(undefined);

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                const productData = await getProduct(id);
                setProduct(productData);
            }
        };
        fetchProduct();
    }, [id]);


    if (product === undefined) {
        return (
            <>
                <Header title="Product Details" />
                <Skeleton className="h-96 w-full" />
            </>
        )
    }

    if (!product) {
        notFound();
    }

    return <ProductDetails initialProduct={product} />;
}
