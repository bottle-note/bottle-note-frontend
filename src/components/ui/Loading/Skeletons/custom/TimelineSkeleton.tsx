import React from 'react';
import { v4 as uuid } from 'uuid';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';

export const TimelineSkeleton = ({
  type = 'mypage',
}: {
  type?: 'mypage' | 'history';
}) => {
  const skeletonItems = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="relative mx-auto w-full max-w-[399px]">
      {type === 'mypage' && (
        <div className="my-3 border-t border-stroke-neutral-subtle" />
      )}
      <div className="absolute bottom-0 left-11 top-6 z-0 w-px border-l border-dashed border-stroke-neutral-weak" />

      <div className="relative z-10 pb-3">
        <div className="pl-2 mb-5">
          {type === 'mypage' ? (
            <SkeletonBase width={80} height={24} className="rounded-md" />
          ) : (
            <SkeletonBase width={320} height={25} className="rounded-md" />
          )}
        </div>

        <div className="z-10 space-y-5">
          {skeletonItems.map(() => (
            <div key={uuid()} className="flex items-start gap-2.5">
              <div className="relative w-6 shrink-0">
                <SkeletonBase width={24} height={24} />
              </div>

              <SkeletonBase circle width={20} height={20} />

              <div className="flex-1 rounded-lg bg-bg-neutral-weak p-3">
                <div className="flex">
                  <div className="flex-1">
                    <SkeletonBase width="80%" height={16} className="mb-2" />
                    <SkeletonBase width="60%" height={14} />
                  </div>
                  <SkeletonBase width={40} height={40} className="rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {type === 'mypage' && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[200px] bg-gradient-to-b from-transparent to-bg-layer-default" />
      )}
    </div>
  );
};
