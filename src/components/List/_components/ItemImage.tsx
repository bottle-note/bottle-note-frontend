'use client';

import { useState } from 'react';
import Image from 'next/image';
import Fallback from 'public/bottle.svg';

interface Props {
  src: string;
  alt: string;
}

const ItemImage = ({ src, alt }: Props) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className="w-[89px] h-[89px] flex shrink-0 p-2 justify-center items-center">
      <div className="w-full h-full relative">
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes="85px"
          className="object-contain w-auto h-auto"
          priority
          onError={() => setImgSrc(Fallback)}
        />
      </div>
    </div>
  );
};

export default ItemImage;
