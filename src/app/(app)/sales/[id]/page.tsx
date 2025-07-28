
"use client";

import { useEffect, useState } from "react";
import { getSale } from "@/lib/api";
import { notFound, useParams } from "next/navigation";
import { SaleDetails } from "@/components/sales/SaleDetails";
import type { Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";

export default function SaleDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [sale, setSale] = useState<Sale | null | undefined>(undefined);

    useEffect(() => {
        const fetchSale = async () => {
            if (id) {
                const saleData = await getSale(id);
                setSale(saleData);
            }
        };
        fetchSale();
    }, [id]);

    if (sale === undefined) {
        return (
            <>
                <Header title="Invoice" />
                <div className="w-[210mm] mx-auto">
                    <Skeleton className="h-[297mm] w-full" />
                </div>
            </>
        )
    }

    if (!sale) {
        notFound();
    }

    return <SaleDetails initialSale={sale} />;
}
