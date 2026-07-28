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
}

const SkeletonBase = ({
  width,
  height,
  count = 1,
  className = '',
  circle = false,
  borderRadius,
}: SkeletonBaseProps) => {
  return (
    <Skeleton
      width={width}
      height={height}
      count={count}
      className={className}
      circle={circle}
      borderRadius={borderRadius}
    />
  );
};

export default SkeletonBase;
