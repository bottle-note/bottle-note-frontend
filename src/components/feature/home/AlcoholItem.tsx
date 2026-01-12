import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Star from '@/components/ui/Display/Star';
import { truncStr } from '@/utils/truncStr';
import { AlcoholAPI } from '@/types/Alcohol';
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
  data: AlcoholAPI & { path: string };
}

export default function AlcoholItem({ data }: Props) {
  const { korName, rating, engCategory, imageUrl, path } = data;

  return (
    <div className="w-[145px] overflow-hidden rounded-lg">
      <Link href={path} className="block">
        <div className="w-full h-[145px] bg-sectionWhite relative flex shrink-0 items-center justify-center">
          <AlcoholImage
            imageUrl={imageUrl}
            outerHeightClass="h-[145px]"
            outerWidthClass="w-[145px]"
            innerHeightClass="h-[125px]"
            innerWidthClass="w-[125px]"
            bgColor="bg-sectionWhite"
            blendMode="mix-blend-multiply"
            rounded="rounded-none"
          />
        </div>
        <div className="h-[80px] px-2 py-[10px] space-y-[6px] bg-bgGray">
          <div className="text-13 h-[38px] font-extrabold whitespace-normal break-words text-mainDarkGray">
            {korName && truncStr(korName, 20)}
          </div>
          <div className="flex items-end justify-between text-subCoral">
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
