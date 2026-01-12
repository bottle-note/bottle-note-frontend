'use client';

import BaseImage from '@/components/ui/Display/BaseImage';

interface Props {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

const ItemImage = ({ src, alt, className, priority = false }: Props) => {
  return (
    <div
      className={`w-[89px] h-[89px] flex shrink-0 p-2 justify-center items-center ${className}`}
    >
      <div className="w-full h-full relative">
        <BaseImage
          src={src}
          alt={alt}
          priority={priority}
          className="object-contain w-auto h-auto"
          fill
          sizes="85px"
        />
      </div>
    </div>
  );
};

export default ItemImage;
