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

export interface ProductImage {
  id: string | number;
  src: string;
  alt: string;
}

function textOverlay(id: string | number) {
  switch (id) {
    case 'bottleNote':
      return (
        <Link
          href={ROUTES.EXPLORE.BASE}
          className="absolute left-0 top-11 w-full h-full flex flex-col pl-7 z-10"
        >
          <div>
            <span className="block text-white text-24 font-semiBold leading-tight drop-shadow-md">
              기억에 남는 첫 향,
              <br />
              보틀노트에서
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-textGray mt-2">
            둘러보기
          </div>
        </Link>
      );
    case 'summerRecommend':
      return (
        <Link
          href={ROUTES.SEARCH.SEARCH('여름 추천 위스키')}
          className="absolute left-0 top-10 w-full h-full flex flex-col pl-[35px] z-10"
        >
          <div>
            <span className="block text-white text-24 font-semiBold leading-tight drop-shadow-md">
              올여름을 완성해 줄
              <br />
              위스키 한 잔
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-[#165E59] font-extrabold mt-2">
            여름 추천 위스키 보기
          </div>
        </Link>
      );
    case 'rainDayRecommend':
      return (
        <Link
          href={ROUTES.SEARCH.SEARCH('비')}
          className="absolute left-0 top-[121px] w-full h-full flex flex-col pl-6 z-10"
        >
          <div>
            <div className="inline-flex items-center gap-1 text-white font-extrabold mt-2">
              비오는 날은 피트!
            </div>
            <span className="block text-white text-24 font-semiBold leading-tight drop-shadow-md">
              보틀노트가 추천하는
              <br />
              장마철 피트 위스키
            </span>
          </div>
        </Link>
      );
    default:
      return null;
  }
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
