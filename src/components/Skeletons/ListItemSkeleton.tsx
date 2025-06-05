import React from 'react';
import SkeletonBase from '@/components/Skeletons/SkeletonBase';

const ListItemSkeleton = () => {
  return (
    <section className="flex items-center text-mainBlack border-brightGray border-b py-4 animate-pulse">
      <SkeletonBase
        width={89}
        height={89}
        className="rounded-lg mr-3 bg-gray-200"
      />

      <div className="flex flex-col flex-1 space-y-2">
        <SkeletonBase width={130} height={20} />
        <SkeletonBase width={180} height={15} />
      </div>

      <div className="ml-auto pr-1 flex flex-col items-end space-y-2">
        <div className="flex flex-col items-end">
          <SkeletonBase width={45} height={20} />
          <SkeletonBase width={30} height={15} />
        </div>
        <SkeletonBase width={20} height={20} />
      </div>
    </section>
  );
};

export default ListItemSkeleton;
