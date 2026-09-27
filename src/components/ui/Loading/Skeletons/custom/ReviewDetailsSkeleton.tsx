import { v4 as uuid } from 'uuid';
import SkeletonBase from '../SkeletonBase';
import TagSkeleton from '../TagSkeleton';

function ReviewDetailsSkeleton() {
  return (
    <div className="w-full">
      <SkeletonBase height={260} className="w-full" borderRadius="0" />
      <div className="mb-20">
        <section className="pt-38">
          <section className="mx-20 pb-20 border-b border-mainGray/30">
            {/* User Info Skeleton */}
            <article className="flex items-center justify-between">
              <div className="flex items-center space-x-7">
                <SkeletonBase width="1.9rem" height="1.9rem" circle />
                <SkeletonBase width="6rem" height="1.3rem" />
              </div>
              <SkeletonBase width="4rem" height="1.3rem" />
            </article>

            {/* Labels Skeleton */}
            <article className="flex items-center mt-10 space-x-8">
              <SkeletonBase width="4rem" height="1.3rem" />
              <SkeletonBase width="4rem" height="1.3rem" />
            </article>

            {/* Images Skeleton */}
            <div className="my-22 whitespace-nowrap overflow-x-auto flex space-x-8 scrollbar-hide">
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
            <SkeletonBase width="100%" height="2rem" className="mt-8" />

            {/* Footer Skeleton */}
            <article className="flex justify-between mt-10">
              <SkeletonBase width="6rem" height="1rem" />
              <SkeletonBase width="0.5rem" height="1.4rem" />
            </article>
          </section>

          {/* Tags Skeleton */}
          <section className="mx-20 py-20 space-y-10 border-b border-mainGray/30 text-12">
            <TagSkeleton />
          </section>

          {/* Actions Skeleton */}
          <section className="mx-20 py-20 space-y-16 border-b border-mainGray/30">
            <SkeletonBase width="4rem" height="1.5rem" />
            <SkeletonBase width="10rem" height="1.5rem" />
          </section>

          <section className="mx-20 py-20 space-y-16 border-b border-mainGray/30">
            <SkeletonBase width="4rem" height="1.5rem" />
            <SkeletonBase width="12rem" height="1.5rem" />
          </section>

          <section className="mx-20 py-20 flex items-center space-x-16">
            <div className="flex-1 flex text-center justify-center items-center space-x-4">
              <SkeletonBase width="4rem" height="1.5rem" />
            </div>
            <span className="border-[0.01rem] w-1 border-mainGray opacity-40 h-16" />
            <div className="flex-1 flex text-center justify-center items-center space-x-4">
              <SkeletonBase width="4rem" height="1.5rem" />
            </div>
            <span className="border-[0.01rem] w-1 border-mainGray opacity-40 h-16" />
            <div className="flex-1 flex text-center justify-center items-center space-x-4">
              <SkeletonBase width="4rem" height="1.5rem" />
            </div>
          </section>
          <div className="h-16 bg-sectionWhite" />
        </section>
      </div>
    </div>
  );
}

export default ReviewDetailsSkeleton;
