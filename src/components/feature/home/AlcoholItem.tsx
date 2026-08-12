import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Star from '@/components/ui/Display/Star';
import { truncStr } from '@/utils/truncStr';
import type { Alcohol } from '@/api/alcohol/types';
import Fallback from 'public/bottle.svg';

type AlcoholImageProps = {
  imageUrl?: string | null;
  outerHeightClass?: string;
  outerWidthClass?: string;
  innerHeightClass?: string;
  innerWidthClass?: string;
  bgColor?: string;
  blendMode?: string;
  rounded?: string;
};

const AlcoholImage: React.FC<AlcoholImageProps> = ({
  imageUrl,
  outerHeightClass = '',
  outerWidthClass = '',
  innerHeightClass = '',
  innerWidthClass = '',
  bgColor = '',
  blendMode = '',
  rounded = '',
}) => {
  const extractSize = (className: string) => {
    const match = className.match(/[hw]-\[(\d+)px\]/);
    return match ? parseInt(match[1]) : 125;
  };

  const width = extractSize(innerWidthClass);
  const height = extractSize(innerHeightClass);

  return (
    <div
      className={`${outerHeightClass} ${outerWidthClass} ${bgColor} ${blendMode} ${rounded} flex items-center justify-center`}
    >
      <Image
        src={imageUrl || Fallback}
        alt=""
        width={width}
        height={height}
        sizes={`${width}px`}
        className={`${innerHeightClass} ${innerWidthClass} object-contain ${blendMode}`}
      />
    </div>
  );
};

interface Props {
  data: Alcohol;
}

export default function AlcoholItem({ data }: Props) {
  const { korName, rating, engCategory, imageUrl, path, alcoholId } = data;
  const href = path ?? `/search/${engCategory}/${alcoholId}`;

  return (
    <div className="w-[145px] overflow-hidden rounded-lg">
      <Link href={href} className="block">
        <div className="relative flex h-[145px] w-full shrink-0 items-center justify-center bg-palette-static-white">
          <AlcoholImage
            imageUrl={imageUrl}
            outerHeightClass="h-[145px]"
            outerWidthClass="w-[145px]"
            innerHeightClass="h-[125px]"
            innerWidthClass="w-[125px]"
            bgColor="bg-palette-static-white"
            blendMode="mix-blend-multiply dark:mix-blend-normal"
            rounded="rounded-none"
          />
        </div>
        <div className="h-[80px] space-y-[6px] bg-bg-layer-basement px-2 py-[10px]">
          <div className="h-[38px] whitespace-normal break-words text-13 font-extrabold text-fg-neutral">
            {korName && truncStr(korName, 20)}
          </div>
          <div className="flex items-end justify-between text-fg-brand">
            <Star rating={rating} size={15} align="end" />
            <p className="text-11 font-bold leading-none tracking-tight">
              {(engCategory || '').toUpperCase()}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
