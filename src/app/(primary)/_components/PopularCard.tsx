import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import { AlcoholAPI } from '@/types/Alcohol';

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
            <div className="w-[150px] h-[140px] relative bg-sectionWhite">
              <Image
                src={imageUrl}
                alt="alcohol image"
                fill
                sizes="150px"
                className="object-contain mix-blend-multiply"
                priority
              />
            </div>
          </div>
          <div className="px-3 py-[10px] space-y-[6px] border-y-[2px] border-subCoral bg-bgGray">
            <div className="text-15 h-[38px] font-extrabold whitespace-normal break-words text-mainDarkGray">
              {korName && truncStr(korName, 20)}
            </div>
            <div className="flex items-center justify-between text-subCoral">
              <Star rating={rating} size={15} />
              <p className="text-11 font-bold">{engCategory.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
