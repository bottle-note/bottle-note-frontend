'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/Display/carousel';
import type { Banner, BannerTextPosition } from '@/api/banner/types';

const BANNER_VIDEO_POSTER = '/images/banner-placeholder.webp';

const POSITION_CLASS: Record<BannerTextPosition, string> = {
  LT: 'pt-10 pl-6 justify-start',
  LB: 'pb-2.5 pl-6 justify-end',
  RT: 'pt-10 pr-6 justify-start',
  RB: 'pb-2.5 pr-6 justify-end',
  CENTER: 'items-center justify-center',
};

interface BannerImageProps {
  banner: Banner;
  isPriority: boolean;
}

function BannerImage({
  banner,
  isPriority,
  onError,
}: BannerImageProps & { onError?: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (banner.mediaType === 'VIDEO') {
    return (
      <>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={banner.imageUrl}
          poster={BANNER_VIDEO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload={isPriority ? 'auto' : 'none'}
          onLoadedData={() => setIsLoaded(true)}
          onError={onError}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={banner.imageUrl}
        alt={banner.name}
        fill
        sizes="100vw"
        priority={isPriority}
        quality={75}
        unoptimized
        onLoad={() => setIsLoaded(true)}
        style={{ objectFit: 'cover' }}
        className="w-full h-full object-cover"
      />
    </>
  );
}

function BannerOverlay({ banner }: { banner: Banner }) {
  const { textPosition } = banner;
  const isBottom = textPosition === 'LB' || textPosition === 'RB';
  const isRight = textPosition === 'RT' || textPosition === 'RB';

  const textShadow = '0 1px 4px rgba(0, 0, 0, 0.6)';
  const isCenter = textPosition === 'CENTER';
  const alignClass = isCenter
    ? 'items-center text-center'
    : isRight
      ? 'items-end text-right'
      : 'items-start text-left';

  const nameElement = (
    <span
      className="block text-16 font-semiBold leading-tight"
      style={{ color: banner.nameFontColor, textShadow }}
    >
      {banner.name.split('\n').map((line, idx, arr) => (
        <span key={`${idx}-${line}`}>
          {line}
          {idx < arr.length - 1 && <br />}
        </span>
      ))}
    </span>
  );

  const descriptionGroup = (banner.descriptionA || banner.descriptionB) && (
    <div className="flex flex-col">
      {banner.descriptionA && (
        <span
          className="text-24 font-thin"
          style={{ color: banner.descriptionFontColor, textShadow }}
        >
          {banner.descriptionA}
        </span>
      )}
      {banner.descriptionB && (
        <span
          className="text-24 font-thin"
          style={{ color: banner.descriptionFontColor, textShadow }}
        >
          {banner.descriptionB}
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`flex flex-col gap-[12px] ${alignClass}`}>
      {isBottom ? (
        <>
          {nameElement}
          {descriptionGroup}
        </>
      ) : (
        <>
          {descriptionGroup}
          {nameElement}
        </>
      )}
    </div>
  );

  const overlayClass = `absolute inset-0 ${POSITION_CLASS[textPosition]} flex flex-col z-10`;

  if (banner.isExternalUrl) {
    return (
      <a
        href={banner.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={overlayClass}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={banner.targetUrl} className={overlayClass}>
      {content}
    </Link>
  );
}

interface HomeCarouselProps {
  banners: Banner[];
}

export default function HomeCarousel({ banners }: HomeCarouselProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [failedBannerIds, setFailedBannerIds] = useState<Set<number>>(
    new Set(),
  );
  const autoplayRef = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const handleBannerError = useCallback(
    (bannerId: number) => {
      setFailedBannerIds((prev) => new Set(prev).add(bannerId));
      api?.scrollNext();
    },
    [api],
  );

  useEffect(() => {
    if (!api || failedBannerIds.size === 0) return;

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap();
      const currentBanner = banners?.[currentIndex];
      if (currentBanner && failedBannerIds.has(currentBanner.id)) {
        api.scrollNext();
      }
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, banners, failedBannerIds]);

  if (banners.length === 0) {
    return null;
  }

  const allFailed = banners.every((banner) => failedBannerIds.has(banner.id));
  if (allFailed) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      plugins={[autoplayRef.current]}
      setApi={setApi}
      className="w-full bg-white"
    >
      <CarouselContent className="!ml-0">
        {banners.map((banner, index) => (
          <CarouselItem key={banner.id} className="!pl-0">
            <div
              className="relative w-full h-[227px] overflow-hidden flex items-center justify-center"
              style={
                failedBannerIds.has(banner.id)
                  ? { visibility: 'hidden', height: 0 }
                  : undefined
              }
            >
              <BannerImage
                banner={banner}
                isPriority={index === 0}
                onError={() => handleBannerError(banner.id)}
              />
              <BannerOverlay banner={banner} />
              <button
                type="button"
                onClick={() => api && api.scrollPrev()}
                className="absolute right-[68.45px] bottom-3 flex items-center justify-center w-[35.56px] h-[35.56px] rounded-full bg-mainDarkGray/60 text-white z-10"
              >
                <Image
                  src="/icon/arrow-left-white.svg"
                  alt="arrowIcon"
                  width={24}
                  height={24}
                />
              </button>
              <button
                type="button"
                onClick={() => api && api.scrollNext()}
                className="absolute right-3 bottom-3 flex items-center justify-center w-[35.56px] h-[35.56px] rounded-full bg-mainDarkGray/60 text-white z-10"
              >
                <Image
                  src="/icon/arrow-left-white.svg"
                  alt="arrowIcon"
                  width={24}
                  height={24}
                  className="rotate-180"
                />
              </button>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
