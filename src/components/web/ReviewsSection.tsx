
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Review } from '@/lib/types';

interface ReviewsSectionProps {
  reviews: Review[];
}

// A minimal, base64-encoded transparent GIF
const BLUR_DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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
          <div className="inline-block bg-primary/20 text-primary font-semibold uppercase tracking-wider py-2 px-4 rounded-full text-2xl">
            Reviews
          </div>
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
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-8">
        <Button asChild>
            <Link href="https://www.facebook.com/freesia.finds" target="_blank" rel="noopener noreferrer">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                Visit Facebook Page
            </Link>
        </Button>
      </div>
    </section>
  );
}
