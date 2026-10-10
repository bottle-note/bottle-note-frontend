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

// TODO: 이미지 여러장일 때 슬라이드 수정
interface ReviewImageCarouselProps {
  images: ProductImage[];
  priority?: boolean;
}

export const ReviewImageCarousel = ({
  images,
  priority = false,
}: ReviewImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const hasPhoto = images.some((image) => !image.src.includes('tasting-graph'));
  const isCurrentGraph = images[current]?.src.includes('tasting-graph');
  const activeIndicatorColor = isCurrentGraph ? 'bg-fg-neutral' : 'bg-white';
  const inactiveIndicatorColor = isCurrentGraph
    ? 'bg-stroke-neutral-weak'
    : 'bg-white/50';

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!images || images.length === 0) {
    return <></>;
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: 'start',
        loop: true,
      }}
      className={`w-full ${hasPhoto ? 'bg-bg-layer-default' : ''}`}
    >
      <CarouselContent>
        {images.map((image, index) => {
          const isGraph = image.src.includes('tasting-graph');

          return (
            <CarouselItem key={image.id}>
              {isGraph ? (
                <div
                  className={`flex items-center justify-center bg-bg-layer-default ${
                    hasPhoto
                      ? 'aspect-square w-full'
                      : 'mx-auto aspect-square w-240 max-w-full'
                  }`}
                >
                  <div className="aspect-square w-240 max-w-full">
                    <BaseImage
                      src={image.src}
                      alt={image.alt}
                      fill
                      quality={80}
                      sizes="240px"
                      priority={priority && index === 0}
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-square overflow-hidden rounded-md border border-stroke-neutral-subtle bg-bg-neutral-weak">
                  <BaseImage
                    src={image.src}
                    alt={image.alt}
                    fill
                    quality={80}
                    sizes="(max-width: 768px) calc(100vw - 40px), 600px"
                    priority={priority && index === 0}
                    className="object-cover"
                  />
                </div>
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-8">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`w-8 h-8 rounded-full transition-opacity ${
                current === index
                  ? activeIndicatorColor
                  : inactiveIndicatorColor
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
