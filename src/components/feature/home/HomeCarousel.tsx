'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/Display/carousel';
import type { Banner, BannerTextPosition } from '@/api/banner/types';

const BANNER_VIDEO_POSTER = '/images/banner-placeholder.webp';

const POSITION_CLASS: Record<BannerTextPosition, string> = {
  LT: 'pt-40 pl-24 justify-start',
  LB: 'pb-10 pl-24 justify-end',
  RT: 'pt-40 pr-24 justify-start',
  RB: 'pb-10 pr-24 justify-end',
  CENTER: 'items-center justify-center',
};

interface BannerImageProps {
  banner: Banner;
  isActive: boolean;
  isPriority: boolean;
}

function BannerImage({
  banner,
  isActive,
  isPriority,
  onError,
}: BannerImageProps & { onError?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [posterSrc, setPosterSrc] = useState(
    banner.posterUrl || BANNER_VIDEO_POSTER,
  );

  useEffect(() => {
    if (
      banner.mediaType === 'VIDEO' &&
      isActive &&
      videoRef.current &&
      videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setIsLoaded(true);
    }
  }, [banner.mediaType, isActive]);

  if (banner.mediaType === 'VIDEO') {
    return (
      <>
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-bg-neutral-weak" />
        )}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src={isActive ? banner.imageUrl : undefined}
          poster={posterSrc}
          autoPlay={isActive}
          muted
          loop
          playsInline
          preload={isActive ? 'auto' : 'none'}
          onLoadedData={() => setIsLoaded(true)}
          onError={onError}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {(!isActive || !isLoaded) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            onError={() => {
              if (posterSrc !== BANNER_VIDEO_POSTER) {
                setPosterSrc(BANNER_VIDEO_POSTER);
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-bg-neutral-weak" />
      )}
      <Image
        src={banner.imageUrl}
        alt={banner.name}
        fill
        sizes="(max-width: 430px) 100vw, 430px"
        priority={isPriority}
        quality={100}
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
          className="text-24 font-medium"
          style={{ color: banner.descriptionFontColor, textShadow }}
        >
          {banner.descriptionA}
        </span>
      )}
      {banner.descriptionB && (
        <span
          className="text-24 font-medium"
          style={{ color: banner.descriptionFontColor, textShadow }}
        >
          {banner.descriptionB}
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`flex flex-col gap-12 ${alignClass}`}>
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
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
    if (!api) return;

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap();
      const currentBanner = banners?.[currentIndex];
      if (currentBanner && failedBannerIds.has(currentBanner.id)) {
        api.scrollNext();
        return;
      }

      setSelectedIndex(currentIndex);
    };

    onSelect();
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

  // 불러오지 못한 배너는 건너뛰므로 보이는 배너 기준으로 순서를 센다.
  const visibleBanners = banners.filter(
    (banner) => !failedBannerIds.has(banner.id),
  );
  const visibleCount = visibleBanners.length;
  const currentPosition =
    visibleBanners.findIndex(
      (banner) => banner.id === banners[selectedIndex]?.id,
    ) + 1;

  const toggleAutoplay = () => {
    const autoplay = autoplayRef.current;
    if (isPlaying) {
      autoplay.stop();
    } else {
      autoplay.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[autoplayRef.current]}
        setApi={setApi}
        className="w-full bg-bg-layer-default"
      >
        <CarouselContent className="!ml-0">
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id} className="!pl-0">
              <div
                className="relative w-full h-227 overflow-hidden flex items-center justify-center"
                style={
                  failedBannerIds.has(banner.id)
                    ? { visibility: 'hidden', height: 0 }
                    : undefined
                }
              >
                <BannerImage
                  banner={banner}
                  isActive={index === selectedIndex}
                  isPriority={index === 0}
                  onError={() => handleBannerError(banner.id)}
                />
                <BannerOverlay banner={banner} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {visibleCount > 1 && (
        <div
          role="group"
          aria-label="배너 넘기기"
          className="absolute bottom-12 right-12 z-10 flex h-32 items-center bg-palette-static-white pl-12 pr-4 text-12 text-palette-neutral-900"
        >
          <span aria-live="polite" className="mr-6 tabular-nums">
            <b>{String(currentPosition).padStart(2, '0')}</b>
            <span className="text-palette-neutral-700">
              {' '}
              / {String(visibleCount).padStart(2, '0')}
            </span>
          </span>
          <button
            type="button"
            aria-label="이전 배너"
            onClick={() => api?.scrollPrev()}
            className="flex h-32 w-28 items-center justify-center"
          >
            <ChevronLeft aria-hidden size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="다음 배너"
            onClick={() => api?.scrollNext()}
            className="flex h-32 w-28 items-center justify-center"
          >
            <ChevronRight aria-hidden size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? '자동 넘김 멈추기' : '자동 넘김 시작'}
            aria-pressed={!isPlaying}
            onClick={toggleAutoplay}
            className="flex h-32 w-28 items-center justify-center"
          >
            {isPlaying ? (
              <Pause aria-hidden size={12} fill="currentColor" />
            ) : (
              <Play aria-hidden size={12} fill="currentColor" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
