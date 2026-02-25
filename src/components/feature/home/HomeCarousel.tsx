import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/Display/carousel';
import { useBannerQuery } from '@/queries/useBannerQuery';
import type { Banner, BannerTextPosition } from '@/api/banner/types';

/**
 * textPosition에 따라 오버레이 컨테이너 스타일을 결정한다.
 * 오버레이는 항상 inset-0 (전체 영역)이며, padding + flex로 텍스트 위치를 잡는다.
 */
function getPositionClass(position: BannerTextPosition): string {
  switch (position) {
    case 'LT':
      return 'pt-2.5 pl-6 items-start justify-start';
    case 'LB':
      return 'pb-2.5 pl-6 items-start justify-end';
    case 'RT':
      return 'pt-2.5 pr-6 items-end justify-start';
    case 'RB':
      return 'pb-2.5 pr-6 items-end justify-end';
    case 'CENTER':
      return 'items-center justify-center';
    default:
      return 'pt-2.5 pl-6 items-start justify-start';
  }
}

interface BannerImageProps {
  banner: Banner;
  isPriority: boolean;
}

function BannerImage({ banner, isPriority }: BannerImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

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
  const positionClass = getPositionClass(banner.textPosition);

  const content = (
    <>
      {banner.descriptionA && (
        <div
          className="inline-flex items-center gap-1 mt-2 font-thin"
          style={{ color: banner.descriptionFontColor }}
        >
          {banner.descriptionA}
        </div>
      )}
      <div>
        <span
          className="block text-24 font-semiBold leading-tight drop-shadow-md"
          style={{ color: banner.nameFontColor }}
        >
          {banner.name.split('\n').map((line, idx, arr) => (
            <span key={`${idx}-${line}`}>
              {line}
              {idx < arr.length - 1 && <br />}
            </span>
          ))}
        </span>
      </div>
      {banner.descriptionB && (
        <div
          className="inline-flex items-center gap-1 mt-2 font-thin"
          style={{ color: banner.descriptionFontColor }}
        >
          {banner.descriptionB}
        </div>
      )}
    </>
  );

  if (banner.isExternalUrl) {
    return (
      <a
        href={banner.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute inset-0 ${positionClass} flex flex-col z-10`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={banner.targetUrl}
      className={`absolute inset-0 ${positionClass} flex flex-col z-10`}
    >
      {content}
    </Link>
  );
}

export default function HomeCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const { data: banners, isLoading } = useBannerQuery();

  if (isLoading) {
    return <div className="w-full h-[227px] bg-gray-200 animate-pulse" />;
  }

  if (!banners || banners.length === 0) {
    return <></>;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      setApi={setApi}
      className="w-full bg-white"
    >
      <CarouselContent className="!ml-0">
        {banners.map((banner, index) => (
          <CarouselItem key={banner.id} className="!pl-0">
            <div className="relative w-full h-[227px] overflow-hidden flex items-center justify-center">
              <BannerImage banner={banner} isPriority={index === 0} />
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
