import { v4 as uuid } from 'uuid';
import SkeletonBase from '../SkeletonBase';
import TagSkeleton from '../TagSkeleton';

function ReviewDetailsSkeleton() {
  return (
    <div className="w-full">
      <SkeletonBase height={260} className="w-full" borderRadius="0" />
      <div className="mb-5">
        <section className="pt-[38px]">
          <section className="mx-5 pb-5 border-b border-mainGray/30">
            {/* User Info Skeleton */}
            <article className="flex items-center justify-between">
              <div className="flex items-center space-x-[7px]">
                <SkeletonBase width="1.9rem" height="1.9rem" circle />
                <SkeletonBase width="6rem" height="1.3rem" />
              </div>
              <SkeletonBase width="4rem" height="1.3rem" />
            </article>

            {/* Labels Skeleton */}
            <article className="flex items-center mt-[10px] space-x-2">
              <SkeletonBase width="4rem" height="1.3rem" />
              <SkeletonBase width="4rem" height="1.3rem" />
            </article>

            {/* Images Skeleton */}
            <div className="my-[22px] whitespace-nowrap overflow-x-auto flex space-x-2 scrollbar-hide">
              {Array.from({ length: 3 }).map(() => (
                <SkeletonBase
                  key={uuid()}
                  width="147px"
                  height="147px"
                  className="flex-shrink-0"
                />
              ))}
            </div>

            {/* Review Content Skeleton */}
            <SkeletonBase width="100%" height="2rem" className="mt-2" />

            {/* Footer Skeleton */}
            <article className="flex justify-between mt-[10px]">
              <SkeletonBase width="6rem" height="1rem" />
              <SkeletonBase width="0.5rem" height="1.4rem" />
            </article>
          </section>

          {/* Tags Skeleton */}
          <section className="mx-5 py-5 space-y-[10px] border-b border-mainGray/30 text-12">
            <TagSkeleton />
          </section>

          {/* Actions Skeleton */}
          <section className="mx-5 py-5 space-y-4 border-b border-mainGray/30">
            <SkeletonBase width="4rem" height="1.5rem" />
            <SkeletonBase width="10rem" height="1.5rem" />
          </section>

          <section className="mx-5 py-5 space-y-4 border-b border-mainGray/30">
            <SkeletonBase width="4rem" height="1.5rem" />
            <SkeletonBase width="12rem" height="1.5rem" />
          </section>

          <section className="mx-5 py-5 flex items-center space-x-4">
            <div className="flex-1 flex text-center justify-center items-center space-x-1">
              <SkeletonBase width="4rem" height="1.5rem" />
            </div>
            <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
            <div className="flex-1 flex text-center justify-center items-center space-x-1">
              <SkeletonBase width="4rem" height="1.5rem" />
            </div>
            <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
            <div className="flex-1 flex text-center justify-center items-center space-x-1">
              <SkeletonBase width="4rem" height="1.5rem" />
            </div>
          </section>
          <div className="h-4 bg-sectionWhite" />
        </section>
      </div>
    </div>
  );
}

export default ReviewDetailsSkeleton;
