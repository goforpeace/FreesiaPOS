import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/sales/InvoiceForm";

export default function NewSalePage() {
  return (
    <>
      <Header title="Create New Invoice" />
      <InvoiceForm />
    </>
  );
}
