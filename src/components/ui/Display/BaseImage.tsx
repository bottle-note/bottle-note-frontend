'use client';

import { Component, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Fallback from 'public/bottle.svg';

class ImageErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

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
  const [imgSrc, setImgSrc] = useState(src || Fallback);
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
      <ImageErrorBoundary
        key={imgSrc}
        fallback={
          <Image
            src={Fallback}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            className={className}
            fill={fill}
            sizes={sizes}
          />
        }
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          priority={priority}
          src={imgSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          fill={fill}
          sizes={sizes}
          onError={handleError}
          onLoad={handleLoad}
        />
      </ImageErrorBoundary>
    </div>
  );
};

export default BaseImage;
