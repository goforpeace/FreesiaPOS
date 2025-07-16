import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/sales/InvoiceForm";
import { getProducts } from "@/lib/api";

export default async function NewSalePage() {
  const products = await getProducts();
  const availableProducts = products.filter(p => p.quantity > 0 && !p.isRejected);

  return (
    <>
      <Header title="Create New Invoice" />
      <InvoiceForm availableProducts={availableProducts} allProducts={products} />
    </>
  );
}
