'use client';

import { useState } from 'react';
import Image from 'next/image';
import Fallback from 'public/bottle.svg';

interface Props {
  imageUrl: string;
  outerHeightClass?: string;
  outerWidthClass?: string;
  innerHeightClass?: string;
  innerWidthClass?: string;
}

const AlcoholImage = ({
  imageUrl,
  outerHeightClass = 'h-[162px]',
  outerWidthClass = 'w-[100px]',
  innerHeightClass = 'w-[80px] ',
  innerWidthClass = 'h-[140px]',
}: Props) => {
  const [imgSrc, setImgSrc] = useState(imageUrl);

  return (
    <div className="rounded-lg bg-white flex items-center justify-center">
      <article
        className={`${outerHeightClass} ${outerWidthClass} shrink-0 relative flex items-center justify-center`}
      >
        <div className={`${innerHeightClass} ${innerWidthClass} relative`}>
          <Image
            priority
            src={imgSrc}
            alt="alcohol image"
            fill
            className="object-contain"
            sizes="100px"
            onError={() => setImgSrc(Fallback)}
          />
        </div>
      </article>
    </div>
  );
};

export default AlcoholImage;
