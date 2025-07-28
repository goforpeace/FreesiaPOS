
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/web/Header";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default async function PublicProductDetailsPage({ params: { id } }: { params: { id: string } }) {
    const product = await getProduct(id);

    if (!product || product.isRejected || product.quantity <= 0) {
        notFound();
    }

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="container mx-auto py-12 px-4">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <div className="aspect-square relative w-full rounded-lg overflow-hidden border">
                            <Image
                                src={product.imageUrl || 'https://placehold.co/600x600.png'}
                                alt={product.name}
                                fill
                                className="object-cover"
                                data-ai-hint="product image"
                            />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-4">{product.name}</h1>
                        <p className="text-2xl font-body font-semibold text-accent mb-6">{formatCurrency(product.sellPrice)}</p>
                        <div className="prose lg:prose-lg text-foreground/80 font-body mb-8">
                           <p>{product.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button size="lg" className="w-full md:w-auto">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                        </div>
                         <p className="text-sm text-muted-foreground mt-4">{product.quantity} units available</p>
                    </div>
                </div>
            </main>
             <footer className="bg-sidebar text-sidebar-foreground py-8 px-4 text-center mt-16">
                <p>&copy; {new Date().getFullYear()} Freesia Finds. All rights reserved.</p>
                <p className="italic mt-2">Because you deserve what's rare!</p>
            </footer>
        </div>
    );
}
