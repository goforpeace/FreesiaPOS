
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBanner, getBanners, deleteBanner } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Banner } from "@/lib/types";
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

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedBanners = await getBanners();
      setBanners(fetchedBanners);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      toast({
        title: "Error",
        description: "Failed to load banners.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleAddBanner = async () => {
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
      await createBanner(imageUrl);
      toast({
        title: "Banner Added",
        description: "The new banner image has been successfully added.",
      });
      setImageUrl("");
      await fetchBanners();
    } catch (error) {
      console.error("Failed to add banner:", error);
      toast({
        title: "Error",
        description: "Failed to add the banner.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteBanner(id);
      toast({
        title: "Banner Deleted",
        description: "The banner has been successfully deleted.",
      });
      await fetchBanners();
    } catch (error) {
      console.error("Failed to delete banner:", error);
      toast({
        title: "Error",
        description: "Failed to delete the banner.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header title="Homepage Banners" />
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter banner image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isSubmitting}
            />
            <Button onClick={handleAddBanner} disabled={isSubmitting}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Banner"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="aspect-video">
              <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
            </div>
          ))
        ) : (
          banners.map((banner) => (
            <Card key={banner.id} className="group relative">
              <CardContent className="p-0">
                <Image
                  alt="Banner image"
                  className="aspect-video w-full rounded-md object-cover"
                  height="200"
                  src={banner.imageUrl || 'https://placehold.co/400x200.png'}
                  width="400"
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
                        This action cannot be undone. This will permanently delete this banner image.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)}>
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
