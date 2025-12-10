import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/Display/carousel';
import { ROUTES } from '@/constants/routes';
import { BANNER_IMAGES } from '@/constants/home';
import { BannerItem } from '@/types/Curation';
import { CurationApi } from '@/app/api/CurationApi';

// imgur URL을 실제 이미지 URL로 변환
function normalizeImageUrl(url: string): string {
  // imgur.com을 i.imgur.com으로 변환
  if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
    const imgurId = url.split('/').pop()?.split('?')[0];
    if (imgurId) {
      // 확장자가 없으면 .png 추가
      const hasExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(imgurId);
      return `https://i.imgur.com/${imgurId}${hasExtension ? '' : '.png'}`;
    }
  }
  return url;
}

function normalizeColor(color: string): string {
  if (!color) return color;
  if (color.startsWith('#')) return color;
  return `#${color}`;
}

function getPositionClasses(textPosition: BannerItem['textPosition']) {
  const horizontalPosition = textPosition[0]; // L, R, C
  const verticalPosition = textPosition[1]; // T, B

  let horizontalClass = '';
  let verticalClass = '';
  let textAlignClass = '';
  let justifyClass = '';

  if (horizontalPosition === 'L') {
    horizontalClass = 'left-0 pl-7';
    textAlignClass = 'text-left';
    justifyClass = 'items-start';
  } else if (horizontalPosition === 'R') {
    horizontalClass = 'right-0 pr-7';
    textAlignClass = 'text-right';
    justifyClass = 'items-end';
  } else if (horizontalPosition === 'C') {
    horizontalClass = 'left-1/2 -translate-x-1/2';
    textAlignClass = 'text-center';
    justifyClass = 'items-center';
  }

  if (verticalPosition === 'T') {
    verticalClass = 'top-6';
  } else if (verticalPosition === 'B') {
    verticalClass = 'bottom-6';
  }

  if (textPosition === 'CENTER') {
    verticalClass = 'top-1/2 -translate-y-1/2';
  }

  return {
    position: `${horizontalClass} ${verticalClass} ${textAlignClass}`,
    justify: justifyClass,
  };
}

function OverlayContent({ banner }: { banner: BannerItem }) {
  const isTopSubText = banner.textPosition[1] === 'T';

  // targetUrl에서 curationId 추출
  const getCurationIdFromUrl = (url: string): string | number | undefined => {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const curationId = urlParams.get('curationId');
      return curationId ? curationId : undefined;
    } catch {
      return undefined;
    }
  };

  const link = banner.isExternalUrl
    ? banner.targetUrl
    : ROUTES.SEARCH.SEARCH(banner.name, getCurationIdFromUrl(banner.targetUrl));

  const positionClasses = getPositionClasses(banner.textPosition);

  const overlayContent = (
    <div
      className={`absolute ${positionClasses.position} flex flex-col ${positionClasses.justify} pointer-events-none`}
    >
      {isTopSubText && banner.name && (
        <div
          className="flex items-center gap-1 mt-2 font-thin"
          style={{ color: normalizeColor(banner.nameFontColor) }}
        >
          {banner.name}
        </div>
      )}
      <div>
        <span
          className="block text-24 font-semiBold leading-tight drop-shadow-md"
          style={{ color: normalizeColor(banner.descriptionFontColor) }}
        >
          {banner.descriptionA}
          <br />
          {banner.descriptionB}
        </span>
      </div>
      {!isTopSubText && banner.name && (
        <div
          className="flex items-center gap-1 mt-2 font-thin"
          style={{ color: normalizeColor(banner.nameFontColor) }}
        >
          {banner.name}
        </div>
      )}
    </div>
  );

  if (banner.isExternalUrl) {
    return (
      <>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
        />
        {overlayContent}
      </>
    );
  }

  return (
    <>
      <Link href={link} className="absolute inset-0 z-10" />
      {overlayContent}
    </>
  );
}

export default function HomeCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await CurationApi.getBanners(5);
        // sortOrder 순서대로 정렬
        const sortedBanners = response.data.sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );
        setBanners(sortedBanners);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };

    fetchBanners();
  }, []);

  const displayBanners = banners.length > 0 ? banners : BANNER_IMAGES;

  if (!displayBanners || displayBanners.length === 0) {
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
        {displayBanners.map((banner) => {
          // BannerItem 타입인 경우와 BANNER_IMAGES 타입 구분
          const isBannerItem = 'imageUrl' in banner;
          const imageUrl = isBannerItem ? banner.imageUrl : banner.src;
          const altText = isBannerItem ? banner.name : banner.alt;

          return (
            <CarouselItem key={banner.id} className="!pl-0">
              <div className="relative w-full h-[227px] overflow-hidden flex items-center justify-center">
                <Image
                  src={normalizeImageUrl(imageUrl)}
                  alt={altText}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="w-full h-full object-cover"
                />
                {isBannerItem && <OverlayContent banner={banner} />}
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
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
