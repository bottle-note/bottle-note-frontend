import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/Display/carousel';
import { useBannerQuery } from '@/queries/useBannerQuery';
import type { Banner, BannerTextPosition } from '@/api/banner/types';

const POSITION_CLASS: Record<BannerTextPosition, string> = {
  LT: 'pt-10 pl-6 justify-start',
  LB: 'pb-2.5 pl-6 justify-end',
  RT: 'pt-10 pr-6 justify-start',
  RB: 'pb-2.5 pr-6 justify-end',
  CENTER: 'justify-center',
};

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
  const { textPosition } = banner;
  const isBottom = textPosition === 'LB' || textPosition === 'RB';
  const isRight = textPosition === 'RT' || textPosition === 'RB';

  const textShadow = '0 1px 4px rgba(0, 0, 0, 0.6)';
  const alignClass = isRight ? 'items-end text-right' : 'items-start text-left';

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

export default function HomeCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const autoplayRef = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
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
      plugins={[autoplayRef.current]}
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
