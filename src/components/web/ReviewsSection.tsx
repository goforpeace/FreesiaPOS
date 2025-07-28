
"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { Review } from '@/lib/types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({
      delay: 3000,
      stopOnInteraction: false,
  })]);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-card/50">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold uppercase tracking-wider text-foreground">Reviews</h2>
        <div className="w-20 h-1 bg-primary mx-auto mt-2"></div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] min-w-0 pl-4">
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
