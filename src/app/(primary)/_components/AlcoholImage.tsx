'use client';

import BaseImage from '@/components/BaseImage';

interface Props {
  imageUrl: string;
  outerHeightClass?: string;
  outerWidthClass?: string;
  innerHeightClass?: string;
  innerWidthClass?: string;
  bgColor?: string;
  blendMode?: string;
  rounded?: string;
  priority?: boolean;
}

const AlcoholImage = ({
  imageUrl,
  outerHeightClass = 'h-[171px]', // default height for the image of review
  outerWidthClass = 'w-[99px]',
  innerWidthClass = 'w-[70px]',
  innerHeightClass = 'h-[141px]',
  bgColor = 'bg-white',
  blendMode = '',
  rounded = 'rounded-lg',
  priority = true,
}: Props) => {
  const innerWidth = parseInt(innerWidthClass.match(/\d+/)?.[0] || '0', 10);

  return (
    <div
      className={`${rounded} ${bgColor} flex items-center justify-center ${outerHeightClass} ${outerWidthClass} shrink-0`}
    >
      <div
        className={`relative ${innerHeightClass} ${innerWidthClass} flex items-center justify-center`}
      >
        <BaseImage
          src={imageUrl}
          alt="alcohol image"
          priority={priority}
          className={`object-contain ${blendMode}`}
          rounded={rounded}
          sizes={`${innerWidth}px`}
          fill
        />
      </div>
    </div>
  );
};

export default AlcoholImage;
