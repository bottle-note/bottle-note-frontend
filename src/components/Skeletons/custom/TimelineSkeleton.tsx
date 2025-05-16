import React from 'react';
import { v4 as uuid } from 'uuid';
import SkeletonBase from '@/components/Skeletons/SkeletonBase';

export const TimelineSkeleton = ({
  type = 'mypage',
}: {
  type?: 'mypage' | 'history';
}) => {
  const skeletonItems = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="relative w-[339px] mx-auto">
      {type === 'mypage' && (
        <div className="border-t border-mainGray/30 my-3" />
      )}
      <div className="absolute left-[3.1rem] top-6 bottom-0 w-px border-l border-dashed border-mainGray/50 z-0" />

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
            <div key={uuid()} className="flex items-start space-x-1">
              <div className="relative">
                <SkeletonBase width={35} height={24} />
              </div>

              <SkeletonBase circle width={24} height={24} />

              <div className="p-3 rounded-lg bg-gray-50 flex-1">
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
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none z-10"
          style={{
            height: '200px',
            background:
              'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
          }}
        />
      )}
    </div>
  );
};
