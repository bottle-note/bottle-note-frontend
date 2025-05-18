import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import SkeletonBase from '@/components/Skeletons/SkeletonBase';

export const DescriptionSkeleton = () => {
  return (
    <>
      <SkeletonBase height={17} width={120} className="pb-[10px]" />
      <div className="space-y-[2px] pb-5">
        <SkeletonBase count={2} height={24} width={270} />
      </div>
    </>
  );
};

export const LoadingStateSkeleton = () => {
  return (
    <>
      <DescriptionSkeleton />
      <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`skeleton-${uuidv4()}`}
            className={`flex-shrink-0 flex-grow-0 rounded-lg ${
              index === 4 ? 'pr-[25px]' : ''
            }`}
          >
            <SkeletonBase height={225} width={145} />
          </div>
        ))}
      </div>
    </>
  );
};
