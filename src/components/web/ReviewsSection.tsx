
"use client";

import React from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import type { Review } from '@/lib/types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({
      delay: 3000,
      stopOnInteraction: false,
  })]);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold uppercase tracking-wider text-foreground/80">Reviews</h2>
        <div className="w-20 h-1 bg-primary/70 mx-auto mt-2"></div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] min-w-0 pl-4">
                <Image
                  alt="Customer review screenshot"
                  className="aspect-square w-full rounded-lg object-cover"
                  src={review.imageUrl}
                  width={600}
                  height={600}
                  data-ai-hint="review screenshot"
                />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
