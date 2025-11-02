import Image from 'next/image';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/Display/carousel';
import { useEffect, useState } from 'react';

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
export const ReviewImageCarousel = ({ images }: { images: ProductImage[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
      className="w-full bg-white"
    >
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border">
              <Image
                src={image.src}
                alt={image.alt}
                width={600}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-opacity ${
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
