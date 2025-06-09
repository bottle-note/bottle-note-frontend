import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/carousel';
import { ROUTES } from '@/constants/routes';
interface OverlayConfig {
  link: string;
  mainText: React.ReactNode;
  topSubText: string;
  bottomSubText: string;
  styles: {
    mainTextColor: string;
    topSubTextColor: string;
    bottomSubTextColor: string;
    containerClass: string;
  };
}

const overlayConfigs: Record<string, OverlayConfig> = {
  bottleNote: {
    link: ROUTES.EXPLORE.BASE,
    mainText: (
      <>
        기억에 남는 첫 향,
        <br />
        보틀노트에서
      </>
    ),
    topSubText: '',
    bottomSubText: '둘러보기',
    styles: {
      mainTextColor: 'text-white',
      topSubTextColor: '',
      bottomSubTextColor: 'text-textGray',
      containerClass: 'top-11 pl-7',
    },
  },
  summerRecommend: {
    link: ROUTES.SEARCH.SEARCH('여름 추천 위스키'),
    mainText: (
      <>
        올여름을 완성해 줄
        <br />
        위스키 한 잔
      </>
    ),
    topSubText: '',
    bottomSubText: '여름 추천 위스키 보기',
    styles: {
      mainTextColor: 'text-white',
      topSubTextColor: '',
      bottomSubTextColor: 'text-[#165E59] font-extrabold',
      containerClass: 'top-10 pl-[35px]',
    },
  },
  rainDayRecommend: {
    link: ROUTES.SEARCH.SEARCH('비 오는 날 추천 위스키'),
    mainText: (
      <>
        비오는 날은 피트!
        <br />
        보틀노트가 추천하는
      </>
    ),
    topSubText: '장마철 피트 위스키',
    bottomSubText: '',
    styles: {
      mainTextColor: 'text-white',
      topSubTextColor: 'text-white font-extrabold',
      bottomSubTextColor: '',
      containerClass: 'top-[121px] pl-6',
    },
  },
} as const;

function OverlayContent({ config }: { config: OverlayConfig }) {
  return (
    <Link
      href={config.link}
      className={`absolute left-0 ${config.styles.containerClass} w-full h-full flex flex-col z-10`}
    >
      {config.topSubText && (
        <div
          className={`inline-flex items-center gap-1 mt-2 ${config.styles.topSubTextColor}`}
        >
          {config.topSubText}
        </div>
      )}
      <div>
        <span
          className={`block ${config.styles.mainTextColor} text-24 font-semiBold leading-tight drop-shadow-md`}
        >
          {config.mainText}
        </span>
      </div>
      {config.bottomSubText && (
        <div
          className={`inline-flex items-center gap-1 mt-2 ${config.styles.bottomSubTextColor}`}
        >
          {config.bottomSubText}
        </div>
      )}
    </Link>
  );
}

function textOverlay(id: string | number) {
  const config = overlayConfigs[String(id)];
  if (!config) return null;

  return <OverlayContent config={config} />;
}

export interface ProductImage {
  id: string | number;
  src: string;
  alt: string;
}

export default function MainCarousel({ images }: { images: ProductImage[] }) {
  const [api, setApi] = useState<CarouselApi | null>(null);

  if (!images || images.length === 0) {
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
        {images.map((image) => (
          <CarouselItem key={image.id} className="!pl-0">
            <div className="relative w-full h-[227px] overflow-hidden flex items-center justify-center">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                style={{ objectFit: 'cover' }}
                className="w-full h-full object-cover"
              />
              {textOverlay(image.id)}
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
