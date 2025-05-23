import SkeletonBase from '../SkeletonBase';

function AlcoholBoxSkeleton() {
  return (
    <div className="w-full">
      <SkeletonBase height={250} className="w-full" />
      <div className="mb-5">
        {/* 별점 영역 */}
        <article className="grid place-items-center space-y-2 py-[25px]">
          <SkeletonBase width={210} height={22} />
          <SkeletonBase width={260} height={55} />
        </article>
        {/* Alcohol 상세정보 */}
        <section className="mx-5 py-[21px] border-y border-mainGray/30">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex text-12 text-mainDarkGray items-start gap-2"
                >
                  <SkeletonBase width={50} height={16} />
                  <SkeletonBase width={100} height={16} />
                </div>
              ))}
            </div>
            <div className="flex text-12 text-mainDarkGray items-start gap-2">
              <SkeletonBase width={50} height={16} />
              <SkeletonBase width={150} height={16} />
            </div>
          </div>
        </section>
        {/* 태그 영역 */}
        <section className="mx-5 py-[21px] space-y-2 border-b border-mainGray/30">
          <SkeletonBase width={70} height={18} />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonBase key={idx} width={60} height={25} />
            ))}
          </div>
        </section>
        {/* 친구 목록 영역 */}
        <section className="mx-5 py-5 border-b border-mainGray/30 space-y-2">
          <SkeletonBase width={70} height={18} />
          <div className="whitespace-nowrap overflow-x-auto flex space-x-5 scrollbar-hide">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
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
      <div className="mx-5">
        <div className="h-4 bg-sectionWhite" />
        <section className="pt-[34px] pb-[20px]">
          <SkeletonBase width={50} height={18} className="mb-[10px]" />
          <div className="border-y border-mainGray/30 py-3">
            <SkeletonBase height={150} className="w-full" />
          </div>
        </section>
        <section className="mb-24">
          <SkeletonBase height={80} borderRadius="0.5rem" />
        </section>
      </div>
    </div>
  );
}

export default AlcoholBoxSkeleton;
