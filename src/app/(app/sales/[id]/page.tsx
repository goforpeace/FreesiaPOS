
import { getSale } from "@/lib/api";
import { notFound } from "next/navigation";
import { SaleDetails } from "@/components/sales/SaleDetails";

export default async function SaleDetailsPage({ params: { id } }: { params: { id: string } }) {
    const sale = await getSale(id);

    if (!sale) {
        notFound();
    }

    return <SaleDetails initialSale={sale} />;
}
