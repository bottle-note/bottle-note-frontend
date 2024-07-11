import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import { WeeklyAlcohol } from '@/types/Alcohol';

interface Props {
  data: WeeklyAlcohol;
}

export default function HorizontalItem({ data }: Props) {
  const { korName, rating, engCategory, imageUrl, path } = data;

  return (
    <Link href={path}>
      <div className="w-[10rem] h-[15.5rem] bg-bgGray border-t-[0.13rem] border-b-[0.13rem] border-subCoral">
        <div className="w-full h-40 relative">
          <Image
            className="max-w-full max-h-full"
            src={imageUrl}
            alt="위스키 image"
            width={160}
            height={160}
          />
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
