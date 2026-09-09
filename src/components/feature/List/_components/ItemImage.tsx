'use client';

import BaseImage from '@/components/ui/Display/BaseImage';
import { cn } from '@/lib/utils';

interface Props {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  size?: 'default' | 'sm';
}

const ItemImage = ({
  src,
  alt,
  className,
  priority = false,
  size = 'default',
}: Props) => {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-palette-static-white',
        size === 'sm' ? 'h-14 w-14 p-0' : 'h-[89px] w-[89px] p-2',
        className,
      )}
    >
      <div className="w-full h-full relative">
        <BaseImage
          src={src}
          alt={alt}
          priority={priority}
          className="object-contain w-auto h-auto"
          backgroundClassName="bg-palette-static-white"
          fill
          sizes={size === 'sm' ? '56px' : '85px'}
        />
      </div>
    </div>
  );
};

export default ItemImage;
