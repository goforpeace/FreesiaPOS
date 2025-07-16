import { Header } from "@/components/layout/Header";
import { ProductForm } from "@/components/products/ProductForm";
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

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
