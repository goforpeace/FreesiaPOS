import { Header } from "@/components/layout/Header";
import { ProductForm } from "@/components/products/ProductForm";
import { products } from "@/lib/data";
import { notFound } from "next/navigation";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header title="Edit Product" />
      <ProductForm initialData={product} />
    </>
  );
}
