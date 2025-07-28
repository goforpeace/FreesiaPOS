
"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import type { Review } from '@/lib/types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({
      delay: 3000,
      stopOnInteraction: false,
  })]);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 md:px-8 bg-background">
      <h2 className="text-4xl font-headline text-center text-primary mb-12">What Our Customers Say</h2>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {reviews.map((review) => (
            <div key={review.id} className="flex-shrink-0 flex-grow-0 basis-full min-w-0 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 p-2">
                <Image
                  alt="Customer review screenshot"
                  className="w-full h-auto rounded-lg shadow-lg object-contain"
                  src={review.imageUrl}
                  width={300}
                  height={500}
                  data-ai-hint="review screenshot"
                />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
