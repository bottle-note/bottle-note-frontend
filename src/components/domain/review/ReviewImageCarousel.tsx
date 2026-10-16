import { useEffect, useState } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/Display/carousel';
import BaseImage from '@/components/ui/Display/BaseImage';
import { cn } from '@/lib/utils';
import type { ReviewTastingProfile } from '@/api/review/types';
import ReviewTastingProfileChart, {
  isDisplayableTastingProfile,
} from './ReviewTastingProfileChart';

export interface ProductImage {
  id: string | number;
  src: string;
  alt: string;
}

export const convertImageUrlsToProductImageArray = (
  imageUrls: string[] | undefined | null,
  altTextPrefix: string = 'Image',
): ProductImage[] => {
  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  return imageUrls.map((url, index) => ({
    id: url,
    src: url,
    alt: `${altTextPrefix} ${index + 1}`,
  }));
};

interface ReviewImageCarouselProps {
  images: ProductImage[];
  /** 있으면 사진 앞 첫 장에 테이스팅 그래프를 둔다. */
  tastingProfile?: ReviewTastingProfile | null;
  priority?: boolean;
  className?: string;
}

const SLIDE_FRAME_CLASS =
  'relative aspect-square overflow-hidden rounded-md border border-stroke-neutral-subtle';

export const ReviewImageCarousel = ({
  images,
  tastingProfile,
  priority = false,
  className,
}: ReviewImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const hasGraph = isDisplayableTastingProfile(tastingProfile);
  const slideCount = (hasGraph ? 1 : 0) + images.length;

  if (slideCount === 0) {
    return null;
  }

  // 여러 장이면 다음 장이 살짝 보이도록 한 장 폭을 줄인다.
  const itemClassName = slideCount > 1 ? 'basis-[92%]' : undefined;

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: 'start',
        loop: true,
      }}
      className={cn('w-full bg-bg-layer-default', className)}
    >
      <CarouselContent>
        {hasGraph && (
          <CarouselItem className={itemClassName}>
            <div
              className={`${SLIDE_FRAME_CLASS} flex items-center justify-center p-12`}
            >
              <ReviewTastingProfileChart profile={tastingProfile} size={340} />
            </div>
          </CarouselItem>
        )}
        {images.map((image, index) => (
          <CarouselItem key={image.id} className={itemClassName}>
            <div className={`${SLIDE_FRAME_CLASS} bg-bg-neutral-weak`}>
              <BaseImage
                src={image.src}
                alt={image.alt}
                fill
                quality={80}
                sizes="(max-width: 768px) calc(100vw - 40px), 600px"
                priority={priority && index === 0 && !hasGraph}
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {slideCount > 1 && (
        <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-6 rounded-full bg-bg-overlay-muted px-8 py-5">
          {Array.from({ length: slideCount }, (_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={`h-6 w-6 rounded-full transition-opacity ${
                current === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
      <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden sm:inline-flex disabled:opacity-50" />
      <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden sm:inline-flex disabled:opacity-50" />
    </Carousel>
  );
};
