import { v4 as uuid } from 'uuid';
import SkeletonBase from '../SkeletonBase';
import ReviewItemSkeleton from '../ReviewItemSkeleton';
import TagSkeleton from '../TagSkeleton';

function AlcoholDetailsSkeleton() {
  return (
    <div className="w-full">
      <SkeletonBase height={250} className="w-full" borderRadius="0" />
      <div className="mb-20">
        {/* 별점 영역 */}
        <article className="grid place-items-center space-y-8 py-16">
          <SkeletonBase width={210} height={22} />
          <SkeletonBase width={260} height={55} />
        </article>
        {/* 위스키 소개 영역 */}
        <section className="mx-20 flex flex-col gap-8 border-y border-stroke-neutral-subtle py-12">
          <SkeletonBase width={86} height={20} />
          <div className="flex flex-col gap-8">
            <SkeletonBase height={16} className="w-full" />
            <SkeletonBase height={16} className="w-full" />
            <SkeletonBase width={230} height={16} />
          </div>
          <SkeletonBase width={48} height={16} className="self-end" />
        </section>
        {/* Alcohol 상세정보 */}
        <section className="mx-20 border-b border-stroke-neutral-subtle py-16">
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-8">
              {Array.from({ length: 3 }).map(() => (
                <div
                  key={uuid()}
                  className="flex items-start gap-8 text-12 text-fg-neutral"
                >
                  <SkeletonBase width={50} height={16} />
                  <SkeletonBase width={100} height={16} />
                </div>
              ))}
            </div>
            <div className="flex items-start gap-8 text-12 text-fg-neutral">
              <SkeletonBase width={50} height={16} />
              <SkeletonBase width={150} height={16} />
            </div>
          </div>
        </section>
        {/* 태그 영역 */}
        <section className="mx-20 space-y-8 border-b border-stroke-neutral-subtle py-21">
          <TagSkeleton />
        </section>
        {/* 친구 목록 영역 */}
        <section className="mx-20 space-y-8 border-b border-stroke-neutral-subtle py-20">
          <SkeletonBase width={70} height={18} />
          <div className="whitespace-nowrap overflow-x-auto flex space-x-20 scrollbar-hide">
            {Array.from({ length: 4 }).map(() => (
              <div
                key={uuid()}
                className="flex-shrink-0 flex flex-col items-center"
              >
                <SkeletonBase width={59} height={59} borderRadius="50%" />
                <SkeletonBase width={44} height={13} />
                <SkeletonBase width={33} height={13} />
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* 리뷰 리스트/더보기 영역 */}
      <div className="mx-20">
        <div className="h-16 bg-bg-layer-basement" />
        <section className="pt-34 pb-20">
          <SkeletonBase width={50} height={18} className="mb-10" />
          <div className="border-t border-stroke-neutral-subtle">
            <ReviewItemSkeleton />
          </div>
        </section>
        <section className="mb-96">
          <SkeletonBase height={80} borderRadius="0.5rem" />
        </section>
      </div>
    </div>
  );
}

export default AlcoholDetailsSkeleton;
