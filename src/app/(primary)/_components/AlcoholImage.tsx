'use client';

import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={`${rounded} ${bgColor} flex items-center justify-center ${outerHeightClass} ${outerWidthClass} shrink-0 relative`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <div
        className={`relative ${innerHeightClass} ${innerWidthClass} flex items-center justify-center`}
      >
        <BaseImage
          src={imageUrl}
          alt="alcohol image"
          priority={priority}
          fill
          className={`object-contain ${blendMode}`}
          sizes={`${innerWidthClass.replace('w-[', '').replace(']', '')}px`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default AlcoholImage;
