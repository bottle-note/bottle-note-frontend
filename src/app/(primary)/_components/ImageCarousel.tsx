import * as React from 'react';
import Image from 'next/image';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
export const ImageCarousel = ({ images }: { images: ProductImage[] }) => {
  if (!images || images.length === 0) {
    return <></>;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full bg-white"
    >
      <CarouselContent className="">
        {images.map((image) => (
          <CarouselItem key={image.id} className="">
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
      <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden sm:inline-flex disabled:opacity-50" />
      <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden sm:inline-flex disabled:opacity-50" />
    </Carousel>
  );
};
