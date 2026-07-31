import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { LinkData } from '@/types/LinkButton';

interface Props {
  data: LinkData;
}

function PrimaryLinkButton({
  data: {
    listType = 'Full',
    engName,
    korName,
    imgSrc,
    linkSrc,
    imageSize,
    icon = false,
    handleBeforeRouteChange,
  },
}: Props) {
  const isTonal = listType === 'Half';

  return (
    <div
      className={`relative w-full hover:pointer ${
        listType === 'Full'
          ? 'flex items-center'
          : 'rounded-xl border border-stroke-brand-weak bg-bg-brand-weak'
      }`}
    >
      {listType === 'Full' && (
        <>
          <Image
            src="/bg_category.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            quality={60}
            className="rounded-xl object-cover"
          />
          <div className="absolute h-full w-full rounded-xl bg-bg-brand-solid opacity-90" />
        </>
      )}
      <Link
        href={linkSrc}
        onClick={handleBeforeRouteChange}
        className="h-full w-full flex flex-col justify-between relative z-10 py-[16.5px] px-[17.02px]"
      >
        <div className={`${imgSrc ? 'space-y-[90px]' : 'space-y-[11.7px]'}`}>
          <div
            className={`${icon ? 'flex justify-between' : ''} relative z-20 ${
              isTonal ? 'text-fg-brand' : 'text-fg-brand-contrast'
            }`}
          >
            <div>
              <p className="font-extrabold text-14">{korName}</p>
              <p className="text-12 font-normal">{engName}</p>
            </div>
            {icon && <ArrowRight aria-hidden className="h-[25px] w-[25px]" />}
          </div>
          <div
            className={`relative z-0 border ${
              isTonal ? 'border-stroke-brand-weak' : 'border-fg-brand-contrast'
            }`}
          />
        </div>
        {imgSrc && (
          <Image
            className="absolute bottom-[0.5px] right-4 z-10"
            src={imgSrc}
            height={imageSize?.height}
            width={imageSize?.width}
            alt="categoryImg"
            style={{ width: imageSize?.width, height: imageSize?.height }}
          />
        )}
      </Link>
    </div>
  );
}

export default PrimaryLinkButton;
