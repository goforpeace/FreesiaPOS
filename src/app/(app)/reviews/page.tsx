
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createReview, getReviews, deleteReview } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleAddReview = async () => {
    if (!imageUrl) {
      toast({
        title: "Image URL required",
        description: "Please enter an image URL.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview(imageUrl);
      toast({
        title: "Review Added",
        description: "The new review image has been successfully added.",
      });
      setImageUrl("");
      await fetchReviews();
    } catch (error) {
      console.error("Failed to add review:", error);
      toast({
        title: "Error",
        description: "Failed to add the review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReview(id);
      toast({
        title: "Review Deleted",
        description: "The review has been successfully deleted.",
      });
      await fetchReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast({
        title: "Error",
        description: "Failed to delete the review.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header title="Customer Reviews" />
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter review screenshot URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isSubmitting}
            />
            <Button onClick={handleAddReview} disabled={isSubmitting}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Review"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="aspect-w-1 aspect-h-1">
              <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
            </div>
          ))
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="group relative">
              <CardContent className="p-0">
                <Image
                  alt="Review screenshot"
                  className="aspect-[9/16] w-full rounded-md object-cover"
                  height="400"
                  src={review.imageUrl || 'https://placehold.co/200x400.png'}
                  width="300"
                />
              </CardContent>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this review image.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
