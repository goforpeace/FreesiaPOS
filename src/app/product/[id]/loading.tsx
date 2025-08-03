
import { Header } from "@/components/web/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsLoading() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto py-12 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-40" />
            </div>
             <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
