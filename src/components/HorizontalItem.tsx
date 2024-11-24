import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import { AlcoholAPI } from '@/types/Alcohol';

interface Props {
  data: AlcoholAPI & { path: string };
}

export default function HorizontalItem({ data }: Props) {
  const { korName, rating, engCategory, imageUrl, path } = data;

  return (
    <Link href={path}>
      <div className="w-[10rem] h-[15.5rem] bg-bgGray">
        <div className="w-[166px] h-[166px] bg-white relative flex shrink-0 flex items-center justify-center">
          <div className="w-[150px] h-[140px] relative">
            <Image
              src={imageUrl}
              alt="alcohol image"
              fill
              sizes="150px"
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="px-2 pt-[0.625rem] space-y-2 border-t-[1px] border-subCoral">
          <div
            className="text-13 h-[2.35rem] font-semibold whitespace-normal break-words text-mainDarkGray"
            style={{ lineHeight: 1.2 }}
          >
            {korName && truncStr(korName, 23)}
          </div>
          <div className="flex items-center justify-between text-subCoral">
            <Star rating={rating} />
            <p className="text-10">{engCategory.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
