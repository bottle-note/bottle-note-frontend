'use client';

import { useState } from 'react';
import Image from 'next/image';
import Fallback from 'public/bottle.svg';

interface Props {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  width?: number;
  height?: number;
  rounded?: string;
}

const BaseImage = ({
  src,
  alt,
  className = '',
  priority = false,
  fill = false,
  sizes,
  onLoad,
  onError,
  width,
  height,
  rounded = '',
}: Props) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImgSrc(Fallback);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div
      className={`relative ${rounded}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        overflow: 'hidden',
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        priority={priority}
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default BaseImage;
