import React from 'react';
import Link from 'next/link';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import { AlcoholAPI } from '@/types/Alcohol';
import AlcoholImage from './AlcoholImage';

interface Props {
  data: AlcoholAPI & { path: string };
}

export default function PopularCard({ data }: Props) {
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
        <div className="px-3 py-[10px] space-y-[6px] bg-bgGray">
          <div className="text-13 h-[38px] font-extrabold whitespace-normal break-words text-mainDarkGray">
            {korName && truncStr(korName, 20)}
          </div>
          <div className="flex items-end justify-between text-subCoral">
            <Star rating={rating} size={15} />
            <p className="text-11 font-bold leading-none">
              {(engCategory || '').toUpperCase()}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
