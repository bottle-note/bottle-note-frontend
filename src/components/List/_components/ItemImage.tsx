'use client';

import Image from 'next/image';
import { useState } from 'react';
import Fallback from 'public/bottle.svg';

interface Props {
  src: string;
  alt: string;
}

const ItemImage = ({ src, alt }: Props) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className="w-[89px] h-[89px] relative flex shrink-0">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-contain w-auto h-auto"
        priority
        sizes="89px"
        onError={() => setImgSrc(Fallback)}
      />
    </div>
  );
};

export default ItemImage;
