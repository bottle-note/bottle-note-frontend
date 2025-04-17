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
    <Link href={path}>
      <div className="w-[166px]">
        <div className="w-full border-t-[2px] border-subCoral">
          <div className="w-full h-[166px] bg-sectionWhite relative flex shrink-0 items-center justify-center">
            <AlcoholImage
              imageUrl={imageUrl}
              outerHeightClass="h-[166px]"
              outerWidthClass="w-[166px]"
              innerHeightClass="h-[140px]"
              innerWidthClass="w-[150px]"
              bgColor="bg-sectionWhite"
              blendMode="mix-blend-multiply"
              rounded="rounded-none"
            />
          </div>
          <div className="px-3 py-[10px] space-y-[6px] border-y-[2px] border-subCoral bg-bgGray">
            <div className="text-15 h-[38px] font-extrabold whitespace-normal break-words text-mainDarkGray">
              {korName && truncStr(korName, 20)}
            </div>
            <div className="flex items-end justify-between text-subCoral">
              <Star rating={rating} size={15} />
              <p className="text-11 font-bold leading-none">
                {(engCategory || '').toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
