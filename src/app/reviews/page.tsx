
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getReviews } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@/lib/types";
import { Header } from "@/components/web/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// A minimal, base64-encoded transparent GIF
const BLUR_DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedReviews = await getReviews();
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="bg-background min-h-screen">
       <Header />
       <main className="container mx-auto py-12 px-4">
         <div className="text-center mb-12">
            <h1 className="text-5xl font-headline text-primary">Customer Reviews</h1>
            <p className="mt-2 text-muted-foreground">See what our happy customers are saying about us!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
            [...Array(8)].map((_, i) => (
                <div key={i} className="aspect-w-1 aspect-h-1">
                <Skeleton className="w-full h-full bg-muted rounded-lg" />
                </div>
            ))
            ) : (
            reviews.map((review) => (
                <Card key={review.id} className="group relative">
                <CardContent className="p-0">
                    <Image
                    alt="Review screenshot"
                    className="aspect-[9/16] w-full rounded-md object-cover"
                    height={800}
                    src={review.imageUrl || 'https://placehold.co/400x800.png'}
                    width={600}
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    />
                </CardContent>
                </Card>
            ))
            )}
        </div>
         <div className="text-center mt-12">
            <Button asChild size="lg">
                <Link href="https://www.facebook.com/freesia.finds" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                    Visit our Facebook Page for More
                </Link>
            </Button>
        </div>
       </main>
    </div>
  );
}
