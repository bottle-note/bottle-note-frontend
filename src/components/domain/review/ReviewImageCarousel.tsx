import { useEffect, useState } from 'react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

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
import { CONTENT_INSET_IMAGE_SIZES } from '@/constants/imageSizes';
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
  /** 있으면 사진 뒤 마지막 장에 테이스팅 그래프를 둔다. */
  tastingProfile?: ReviewTastingProfile | null;
  priority?: boolean;
  className?: string;
}

const CAROUSEL_ARROW_CLASS =
  'hidden border-0 bg-bg-overlay-muted text-palette-static-white hover:bg-bg-overlay-muted hover:text-palette-static-white disabled:opacity-0 [@media(hover:hover)]:inline-flex';

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
  // 트랙패드·매직 마우스 가로 스와이프로도 넘긴다. 렌더마다 새로 만들면 캐러셀이 다시 초기화된다.
  const [plugins] = useState(() => [WheelGesturesPlugin()]);

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
      plugins={plugins}
      opts={{
        align: 'start',
        loop: true,
      }}
      className={cn('w-full bg-bg-layer-default', className)}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={image.id} className={itemClassName}>
            <div className={`${SLIDE_FRAME_CLASS} bg-bg-neutral-weak`}>
              <BaseImage
                src={image.src}
                alt={image.alt}
                fill
                quality={80}
                sizes={CONTENT_INSET_IMAGE_SIZES}
                priority={priority && index === 0}
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
        {hasGraph && (
          <CarouselItem className={itemClassName}>
            <div
              className={`${SLIDE_FRAME_CLASS} flex items-center justify-center p-12`}
            >
              <ReviewTastingProfileChart profile={tastingProfile} size={340} />
            </div>
          </CarouselItem>
        )}
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
      {slideCount > 1 && (
        <>
          {/* 터치 기기는 스와이프로 넘기므로 마우스를 쓰는 기기에서만 사진 안쪽에 버튼을 둔다. */}
          <CarouselPrevious
            aria-label="이전 사진"
            className={cn(CAROUSEL_ARROW_CLASS, 'left-8')}
          />
          <CarouselNext
            aria-label="다음 사진"
            className={cn(CAROUSEL_ARROW_CLASS, 'right-8')}
          />
        </>
      )}
    </Carousel>
  );
};
