import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonBaseProps {
  width?: number | string;
  height?: number | string;
  count?: number;
  className?: string;
  circle?: boolean;
  borderRadius?: string;
  variant?: 'default' | 'light';
}

const SkeletonBase = ({
  width,
  height,
  count = 1,
  className = '',
  circle = false,
  borderRadius,
  variant = 'default',
}: SkeletonBaseProps) => {
  const isLight = variant === 'light';
  const baseColor = isLight
    ? 'rgb(var(--palette-neutral-200))'
    : 'var(--color-bg-skeleton-base)';
  const highlightColor = isLight
    ? 'rgb(var(--palette-neutral-50))'
    : 'var(--color-bg-skeleton-highlight)';

  return (
    <Skeleton
      width={width}
      height={height}
      count={count}
      className={className}
      circle={circle}
      borderRadius={borderRadius}
      baseColor={baseColor}
      highlightColor={highlightColor}
    />
  );
};

export default SkeletonBase;
