import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  /** 있으면 각 장을 누를 때 이 주소로 간다. 카드의 대표 링크와 같은 곳이라 탭 순서에서는 뺀다. */
  slideHref?: string;
}

// 사진은 대표 링크와 같은 곳으로 가는 중복 링크라 읽기 대상에서도 뺀다.
// 테이스팅 그래프는 본문에 없는 정보를 담고 있어 읽을 수 있게 남긴다.
function SlideLink({
  href,
  hideFromReader,
  children,
}: {
  href?: string;
  hideFromReader: boolean;
  children: React.ReactNode;
}) {
  if (!href) return children;
  return (
    <Link
      href={href}
      tabIndex={-1}
      aria-hidden={hideFromReader || undefined}
      className="block"
    >
      {children}
    </Link>
  );
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
  slideHref,
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
            <SlideLink href={slideHref} hideFromReader>
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
            </SlideLink>
          </CarouselItem>
        ))}
        {hasGraph && (
          <CarouselItem className={itemClassName}>
            <SlideLink href={slideHref} hideFromReader={false}>
              <div
                className={`${SLIDE_FRAME_CLASS} flex items-center justify-center p-12`}
              >
                <ReviewTastingProfileChart
                  profile={tastingProfile}
                  size={340}
                />
              </div>
            </SlideLink>
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
