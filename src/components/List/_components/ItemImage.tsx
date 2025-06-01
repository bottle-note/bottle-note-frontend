'use client';

import BaseImage from '@/components/BaseImage';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

const ItemImage = ({ src, alt, className }: Props) => {
  return (
    <div
      className={`w-[89px] h-[89px] flex shrink-0 p-2 justify-center items-center ${className}`}
    >
      <div className="w-full h-full relative">
        <BaseImage
          src={src}
          alt={alt}
          priority
          className="object-contain w-auto h-auto"
          fill
          sizes="85px"
        />
      </div>
    </div>
  );
};

export default ItemImage;
