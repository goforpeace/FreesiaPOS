
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/sales/InvoiceForm";
import { getProducts, getSale } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function EditSalePage({ params }: { params: { id: string } }) {
  const sale = await getSale(params.id);
  const allProducts = await getProducts();
  
  if (!sale) {
    notFound();
  }
  
  // Products that are available OR are already in this specific sale
  const availableProducts = allProducts.filter(p => 
    !p.isRejected && (p.quantity > 0 || sale.items.some(i => i.productId === p.id))
  );

  return (
    <>
      <Header title={`Edit Invoice ${sale.id}`} />
      <InvoiceForm 
        initialData={sale} 
        availableProducts={availableProducts} 
        allProducts={allProducts} 
      />
    </>
  );
}
